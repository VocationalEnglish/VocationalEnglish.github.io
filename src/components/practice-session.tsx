"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { GapSentence } from "@/components/gap-sentence";
import { useLearner } from "@/components/learner-provider";
import {
  answerLabel,
  buildSession,
  choiceNote,
  difficultyLabel,
  filledSentence,
  percent,
  pickFollowUp,
  skillTitle,
  type SessionQuestion,
} from "@/lib/engine";
import { practicePath } from "@/lib/paths";
import { getSkill, isSkillId } from "@/lib/skills";
import type { Learner, Question, SessionMode, SkillId } from "@/lib/types";

type BuiltSession = {
  key: string;
  queue: SessionQuestion[];
  invalid: boolean;
  startMastery: Partial<Record<SkillId, number>>;
  cap: number;
};

function masterySnapshot(learner: Learner): Partial<Record<SkillId, number>> {
  const snapshot: Partial<Record<SkillId, number>> = {};
  for (const [skillId, state] of Object.entries(learner.skills)) {
    if (state) snapshot[skillId as SkillId] = state.mastery;
  }
  return snapshot;
}

function makeSession(key: string, learner: Learner, parsed: SessionMode | "invalid"): BuiltSession {
  const queue = parsed === "invalid" ? [] : buildSession(learner, parsed);
  return {
    key,
    queue,
    invalid: parsed === "invalid",
    startMastery: masterySnapshot(learner),
    cap: queue.length + (parsed !== "invalid" && parsed.type === "placement" ? 0 : 3),
  };
}

type LogItem = {
  question: Question;
  correct: boolean;
  chosen: string;
};

function parseMode(tila: string | null, aihe: string | null): SessionMode | "invalid" {
  if (aihe) {
    return isSkillId(aihe) ? { type: "topic", skillId: aihe } : "invalid";
  }
  if (tila === "sijoitus") return { type: "placement" };
  if (tila === "kertaus") return { type: "review" };
  return { type: "adaptive" };
}

function sessionTitle(mode: SessionMode): string {
  if (mode.type === "placement") return "Tasotesti";
  if (mode.type === "review") return "Kertaus";
  if (mode.type === "topic") return getSkill(mode.skillId)?.title ?? "Aihe";
  return "Adaptiivinen harjoitus";
}

function sessionBlurb(mode: SessionMode): string {
  if (mode.type === "placement") {
    return "Yksi tehtävä jokaisesta aiheesta. Tämän jälkeen harjoitus osaa aloittaa oikealta tasolta.";
  }
  if (mode.type === "review") return "Nämä menivät viimeksi väärin. Uusi oikea vastaus poistaa tehtävän kertauksesta.";
  if (mode.type === "topic") return "Kahdeksan tehtävää tästä aiheesta. Vaikeus seuraa sitä, mitä olet jo osannut.";
  return "Tehtävät painottuvat heikkoihin aiheisiin. Väärä vastaus tuo helpomman jatkokysymyksen.";
}

export function PracticeSession() {
  const params = useSearchParams();
  const router = useRouter();
  const { learner, ready, answer, place } = useLearner();

  const tila = params.get("tila");
  const aihe = params.get("aihe");
  const mode = useMemo(() => parseMode(tila, aihe), [tila, aihe]);
  const [round, setRound] = useState(0);
  const sessionKey = `${tila ?? ""}:${aihe ?? ""}:${round}`;

  const [session, setSession] = useState<BuiltSession | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [hinted, setHinted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; raw: string } | null>(null);
  const [log, setLog] = useState<LogItem[]>([]);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");
  const lock = useRef(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (ready && session?.key !== sessionKey) {
    setSession(makeSession(sessionKey, learner, mode));
    setIndex(0);
    setSelected(null);
    setText("");
    setHinted(false);
    setFeedback(null);
    setLog([]);
    setDone(false);
    setFormError("");
  }

  const queue = session?.queue;
  const current = queue?.[index];

  useEffect(() => {
    if (feedback) nextRef.current?.focus();
    else if (current?.question.kind === "cloze") inputRef.current?.focus();
  }, [feedback, index, current?.question.kind, current?.question.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (!current || feedback || current.question.kind !== "mcq") return;
      const number = Number(event.key);
      const choice = current.question.choices?.[number - 1];
      if (choice) setSelected(choice.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, feedback]);

  if (!ready || !session || session.key !== sessionKey) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;
  }

  const activeSession: BuiltSession = session;
  const activeQueue = activeSession.queue;

  if (activeSession.invalid || mode === "invalid") {
    return (
      <Card>
        <CardContent className="grid gap-3">
          <h1 className="font-serif text-3xl">Aihetta ei löydy</h1>
          <p className="text-muted-foreground">Tarkista osoite tai valitse aihe listasta.</p>
          <Button size="lg" render={<Link href="/aiheet" />}>
            Selaa aiheita
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (activeQueue.length === 0) {
    return (
      <Card>
        <CardContent className="grid gap-3">
          <h1 className="font-serif text-3xl">{sessionTitle(mode)}</h1>
          <p className="max-w-lg text-muted-foreground">
            {mode.type === "review"
              ? "Ei kertaukseen nostettavia virheitä. Kun vastaat väärin, tehtävä tulee tänne, kunnes osaat sen."
              : "Tähän harjoitukseen ei juuri nyt löydy tehtäviä."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" render={<Link href={practicePath("adaptive")} />}>
              Adaptiivinen harjoitus
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/" />}>
              Etusivulle
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Summary
        mode={mode}
        log={log}
        startMastery={activeSession.startMastery}
        learnerSkills={learner.skills}
        onAgain={() => {
          lock.current = false;
          setDone(false);
          setRound((value) => value + 1);
        }}
      />
    );
  }

  if (!current) return null;
  const question = current.question;
  const activeMode: SessionMode = mode;
  const sessionQueue = activeQueue;
  const skill = getSkill(question.skillId);
  const progressValue = (index / sessionQueue.length) * 100;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current || feedback) return;
    const raw = question.kind === "mcq" ? (selected ?? "") : text;
    if (!raw.trim()) {
      setFormError(question.kind === "mcq" ? "Valitse vaihtoehto." : "Kirjoita vastaus tyhjään kohtaan.");
      return;
    }
    lock.current = true;
    const result = answer(question, raw, hinted);
    setFeedback({ correct: result.correct, raw });
    setLog((items) => [...items, { question, correct: result.correct, chosen: raw }]);
    setFormError("");

    if (activeMode.type === "placement" && index === sessionQueue.length - 1) {
      place();
    }

    if (activeMode.type !== "placement" && !result.correct && sessionQueue.length < activeSession.cap) {
      const used = new Set(sessionQueue.map((item) => item.question.id));
      const follow = pickFollowUp(result.learner, question.skillId, question.difficulty, used);
      if (follow) {
        setSession((currentSession) => {
          if (!currentSession) return currentSession;
          const copy = currentSession.queue.slice();
          copy.splice(Math.min(index + 3, copy.length), 0, { question: follow, followUp: true });
          return { ...currentSession, queue: copy };
        });
      }
    }
  }

  function goNext() {
    if (index + 1 >= sessionQueue.length) {
      setDone(true);
      return;
    }
    lock.current = false;
    setIndex((value) => value + 1);
    setSelected(null);
    setText("");
    setHinted(false);
    setFeedback(null);
    setFormError("");
  }

  function quit() {
    if (log.length === 0) {
      router.push("/");
      return;
    }
    setDone(true);
  }

  const selectedNote = feedback && !feedback.correct && question.kind === "mcq"
    ? choiceNote(question, feedback.raw)
    : undefined;

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{sessionTitle(mode)}</p>
          <h1 className="font-serif text-3xl tracking-tight">
            Tehtävä {index + 1}
            <span className="text-muted-foreground"> / {activeQueue.length}</span>
          </h1>
        </div>
        <Button variant="ghost" onClick={quit}>
          Lopeta
        </Button>
      </div>
      <Progress value={feedback ? ((index + 1) / activeQueue.length) * 100 : progressValue} aria-label="Harjoituksen eteneminen" />
      {index === 0 && !feedback && <p className="text-sm leading-6 text-muted-foreground">{sessionBlurb(mode)}</p>}

      <form onSubmit={submit}>
        <Card>
          <CardContent className="grid gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{skill?.title}</Badge>
              <Badge variant="outline">{question.level}</Badge>
              <Badge variant="outline">{difficultyLabel(question.difficulty)}</Badge>
              {current.followUp && <Badge>Jatkokysymys</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{question.prompt}</p>
            {question.sentence && (
              <GapSentence
                sentence={question.sentence}
                fill={feedback ? (question.fill ?? answerLabel(question)) : undefined}
              />
            )}
            {hinted && !feedback && (
              <p className="rounded-xl bg-accent px-3 py-2 text-sm leading-6 text-accent-foreground">
                Vihje: {question.rule}
              </p>
            )}

            {question.kind === "mcq" ? (
              <div role="radiogroup" aria-label="Vastausvaihtoehdot" className="grid gap-2">
                {question.choices?.map((choice, choiceIndex) => {
                  const isSelected = selected === choice.id;
                  const isAnswer = choice.id === question.answer;
                  const show = Boolean(feedback);
                  const state = show && isAnswer ? "correct" : show && isSelected && !isAnswer ? "wrong" : isSelected ? "selected" : "idle";
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={Boolean(feedback)}
                      onClick={() => {
                        setSelected(choice.id);
                        setFormError("");
                      }}
                      className={choiceClass(state)}
                    >
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-background/80 text-sm font-medium">
                        {choiceIndex + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-left">{choice.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <Input
                ref={inputRef}
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setFormError("");
                }}
                disabled={Boolean(feedback)}
                aria-label="Vastaus"
                placeholder="Kirjoita puuttuva kohta"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
            )}

            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}

            {feedback && (
              <div
                role="status"
                className={
                  feedback.correct
                    ? "rounded-xl bg-accent px-4 py-3 text-sm leading-6 text-accent-foreground"
                    : "rounded-xl bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
                }
              >
                <p className="font-medium">
                  {feedback.correct ? "Oikein." : `Väärin. Oikea vastaus on ${answerLabel(question)}.`}
                </p>
                {!feedback.correct && question.kind === "cloze" && (
                  <p className="mt-1">Kirjoitit: {feedback.raw.trim()}</p>
                )}
                {selectedNote && <p className="mt-2">{selectedNote}</p>}
                <p className="mt-2 text-foreground">{question.why}</p>
                <p className="mt-2 text-foreground">
                  <span className="font-medium">Sääntö. </span>
                  {question.rule}
                </p>
                {question.trap && <p className="mt-2 text-foreground">{question.trap}</p>}
                <p className="mt-2 text-foreground">
                  <span className="font-medium">Esimerkki. </span>
                  {question.example}
                </p>
                {filledSentence(question) && question.sentence?.includes("___") && (
                  <p className="mt-2 font-serif text-base text-foreground">{filledSentence(question)}</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {!feedback ? (
                <>
                  <Button type="submit" size="lg">
                    Tarkista
                  </Button>
                  {!hinted && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setHinted(true)}
                    >
                      <Lightbulb data-icon="inline-start" />
                      Vihje
                    </Button>
                  )}
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    Näppäimet 1–4 valitsevat vaihtoehdon.
                  </p>
                </>
              ) : (
                <Button type="button" size="lg" ref={nextRef} onClick={goNext}>
                  {index + 1 >= activeQueue.length ? "Näytä yhteenveto" : "Seuraava"}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function choiceClass(state: "idle" | "selected" | "correct" | "wrong") {
  const base =
    "flex w-full cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-base transition disabled:cursor-default";
  if (state === "correct") return `${base} border-primary bg-accent text-foreground`;
  if (state === "wrong") return `${base} border-destructive bg-destructive/10 text-foreground`;
  if (state === "selected") return `${base} border-primary bg-primary/5`;
  return `${base} border-border bg-card hover:border-primary/40`;
}

function Summary({
  mode,
  log,
  startMastery,
  learnerSkills,
  onAgain,
}: {
  mode: SessionMode;
  log: LogItem[];
  startMastery: Partial<Record<SkillId, number>>;
  learnerSkills: Partial<Record<SkillId, { mastery: number }>>;
  onAgain: () => void;
}) {
  const correct = log.filter((item) => item.correct).length;
  const misses = log.filter((item) => !item.correct);
  const skills = [...new Set(log.map((item) => item.question.skillId))];

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-5">
      <div>
        <p className="text-sm text-muted-foreground">{sessionTitle(mode)}</p>
        <h1 className="font-serif text-4xl tracking-tight">
          {correct}/{log.length} oikein
        </h1>
        <p className="mt-2 max-w-lg text-muted-foreground">
          {correct === log.length
            ? "Puhdas kierros. Seuraava sarja voi nostaa vaikeutta."
            : "Väärät vastaukset jäävät kertaukseen, kunnes saat ne oikein."}
        </p>
      </div>

      {skills.length > 0 && (
        <ul className="grid gap-2">
          {skills.map((skillId) => {
            const before = startMastery[skillId] ?? 0.32;
            const after = learnerSkills[skillId]?.mastery;
            const delta = after === undefined ? null : Math.round((after - before) * 100);
            return (
              <li key={skillId} className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
                <span>{skillTitle(skillId)}</span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {after === undefined ? "—" : `${percent(after)} %`}
                  {delta !== null && delta !== 0 && (
                    <span className={delta > 0 ? "text-primary" : "text-destructive"}>
                      {" "}
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {misses.length > 0 && (
        <section className="grid gap-3">
          <h2 className="font-serif text-2xl">Käy nämä vielä läpi</h2>
          <ul className="grid gap-3">
            {misses.map((item) => (
              <li key={`${item.question.id}-${item.chosen}`} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10">
                <p className="font-serif text-lg">{filledSentence(item.question) || answerLabel(item.question)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.question.rule}</p>
                <Link href={`/aiheet/${item.question.skillId}`} className="mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline">
                  Avaa aiheen {skillTitle(item.question.skillId).toLowerCase()} sääntö
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" onClick={onAgain}>
          Uusi kierros
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/" />}>
          Etusivulle
        </Button>
        {misses[0] && (
          <Button size="lg" variant="outline" render={<Link href={practicePath(misses[0].question.skillId)} />}>
            Harjoittele aihetta
          </Button>
        )}
      </div>
      {mode.type === "placement" && (
        <p className="text-sm text-muted-foreground">
          Tasotesti on tallessa. Seuraava adaptiivinen kierros käyttää tätä lähtötasona. Arvio tarkentuu, kun tehtäviä kertyy eri vaikeustasoilta.
        </p>
      )}
    </div>
  );
}
