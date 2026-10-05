"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLearner } from "@/components/learner-provider";
import {
  attemptsOnDay,
  answerLabel,
  difficultyLabel,
  estimateLevel,
  filledSentence,
  percent,
  reviewQuestions,
} from "@/lib/engine";
import { FIELDS } from "@/lib/fields";
import { fieldPracticePath, practicePath } from "@/lib/paths";
import { getQuestion } from "@/lib/questions";
import { SKILLS } from "@/lib/skills";
import { cn } from "@/lib/utils";

export function ProgressView() {
  const { learner, ready, persistent, account, rename, setGoal, reset } = useLearner();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;
  }

  const level = estimateLevel(learner);
  const today = attemptsOnDay(learner).length;
  const review = reviewQuestions(learner);
  const recentMisses = [...learner.attempts].reverse().filter((attempt) => !attempt.correct).slice(0, 8);
  const displayName = name ?? learner.name;

  return (
    <div className="grid gap-6">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl tracking-tight">Edistyminen</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Taso ei nouse pelkästään helpoista oikeista vastauksista. A2 vaatii onnistumista tutuissa tehtävissä, B1 keskitasoa ja B2 tarkempia eroja. Tämä on harjoittelun arvio, ei kielikoe.
          Alan tehtävät eivät muuta kieliopin tasoa.
        </p>
        <p className="mt-3 text-sm leading-6">
          {account ? (
            <>
              Kirjautuneena: <span className="font-medium">{account.displayName}</span> ({account.username}).{" "}
              <Link href="/tili" className="text-primary underline-offset-4 hover:underline">
                Tili ja varmuuskopio
              </Link>
            </>
          ) : (
            <>
              Edistyminen on nyt vierailijana tässä selaimessa.{" "}
              <Link href="/tili" className="text-primary underline-offset-4 hover:underline">
                Luo tili
              </Link>
              , jos haluat pitää sen omalla nimellä.
            </>
          )}
        </p>
      </div>

      {!persistent && (
        <p className="rounded-xl bg-warning/10 px-4 py-3 text-sm leading-6 text-warning" role="status">
          Tämä selain ei tallentanut edistymistä. Voit harjoitella silti, mutta tiedot katoavat kun suljet sivun.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Arvioitu taso</p>
            <p className="mt-1 font-serif text-3xl">{level.code ?? "—"}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{level.detail}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tänään</p>
            <p className="mt-1 font-serif text-3xl tabular-nums">
              {today}/{learner.dailyGoal}
            </p>
            <div className="mt-3 flex gap-2">
              {([5, 10, 15] as const).map((goal) => (
                <Button
                  key={goal}
                  size="sm"
                  variant={learner.dailyGoal === goal ? "default" : "outline"}
                  onClick={() => setGoal(goal)}
                >
                  {goal}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Putki</p>
            <p className="mt-1 font-serif text-3xl tabular-nums">{learner.streak} pv</p>
            <p className="mt-2 text-sm text-muted-foreground">Paras {learner.bestStreak} päivää. Putki kasvaa, kun vastaat vähintään yhteen tehtävään peräkkäisinä päivinä.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-3">
          <label htmlFor="nimi-edistyminen" className="text-sm font-medium">
            Nimi
          </label>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              rename(displayName);
              setName(null);
            }}
          >
            <Input
              id="nimi-edistyminen"
              value={displayName}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nimi etusivulle"
            />
            <Button type="submit" variant="secondary" size="lg">
              Tallenna nimi
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl">Alat</h2>
          <Link href="/alat" className="text-sm text-primary underline-offset-4 hover:underline">
            Kaikki alat
          </Link>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {FIELDS.filter((field) => (learner.fields[field.id]?.seen ?? 0) > 0 || learner.fieldId === field.id).map(
            (field) => {
              const state = learner.fields[field.id];
              const known = Boolean(state && state.seen > 0);
              return (
                <li key={field.id}>
                  <Link
                    href={fieldPracticePath(field.id)}
                    className="flex items-center justify-between gap-3 border border-border border-l-4 border-l-signal bg-card px-4 py-3"
                  >
                    <span>
                      {field.title}
                      {learner.fieldId === field.id && (
                        <span className="ml-2 text-xs tracking-wide text-primary uppercase">Oma</span>
                      )}
                    </span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {known && state ? `${percent(state.mastery)} %` : "uusi"}
                    </span>
                  </Link>
                </li>
              );
            },
          )}
        </ul>
        {FIELDS.every((field) => (learner.fields[field.id]?.seen ?? 0) === 0 && learner.fieldId !== field.id) && (
          <p className="text-sm leading-6 text-muted-foreground">
            Oma ala ei ole vielä valittu.{" "}
            <Link href="/alat" className="text-primary underline-offset-4 hover:underline">
              Valitse ala
            </Link>{" "}
            ja harjoittele sen nimikkeitä, sanoja ja työtilanteita.
          </p>
        )}
      </section>

      <Tabs defaultValue="taidot">
        <TabsList>
          <TabsTrigger value="taidot">Taidot</TabsTrigger>
          <TabsTrigger value="virheet">Virheet</TabsTrigger>
        </TabsList>
        <TabsContent value="taidot" className="pt-4">
          <ul className="grid gap-3">
            {SKILLS.map((skill) => {
              const state = learner.skills[skill.id];
              const known = Boolean(state && state.seen > 0);
              const value = known && state ? percent(state.mastery) : 0;
              return (
                <li key={skill.id} className="border border-border bg-card px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/aiheet/${skill.id}`} className="font-medium underline-offset-4 hover:underline">
                      {skill.title}
                    </Link>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {known && state ? `${state.correct} oikein · ${state.wrong} väärin` : "ei vielä"}
                    </span>
                  </div>
                  <Progress className="mt-2" value={value} aria-label={skill.title} />
                </li>
              );
            })}
          </ul>
        </TabsContent>
        <TabsContent value="virheet" className="pt-4">
          {recentMisses.length === 0 ? (
            <p className="text-muted-foreground">Ei vielä vääriä vastauksia. Ne näkyvät tässä selityksen kanssa.</p>
          ) : (
            <ul className="grid gap-3">
              {recentMisses.map((attempt) => {
                const question = getQuestion(attempt.questionId);
                if (!question) return null;
                const fixed = learner.attempts.some(
                  (later) => later.questionId === attempt.questionId && later.at > attempt.at && later.correct,
                );
                return (
                  <li key={`${attempt.questionId}-${attempt.at}`} className="border border-border bg-card px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{question.level}</Badge>
                      <Badge variant="outline">{difficultyLabel(question.difficulty)}</Badge>
                      {fixed && <Badge variant="secondary">korjattu myöhemmin</Badge>}
                    </div>
                    <p className="mt-2 font-serif text-lg">{filledSentence(question) || answerLabel(question)}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{question.why}</p>
                  </li>
                );
              })}
            </ul>
          )}
          {review.length > 0 && (
            <Button className="mt-4" size="lg" render={<Link href={practicePath("review")} />}>
              Kertaa {review.length} väärin mennyttä
            </Button>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="max-w-md text-sm text-muted-foreground">
          Vastauksia yhteensä {learner.attempts.length}. Tiedot ovat vain tässä selaimessa
          {account ? " tällä tilillä" : ""}.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={cn(buttonVariants({ variant: "destructive" }))}>
            Tyhjennä edistyminen
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tyhjennetäänkö edistyminen?</DialogTitle>
              <DialogDescription>
                Tasoarvio, vastaukset ja harjoitusputki poistuvat tästä selaimesta. Nimi säilyy. Mitään ei ole lähetetty palvelimelle.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
              >
                Tyhjennä
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
