"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, HardHat, PenLine, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { GapSentence } from "@/components/gap-sentence";
import { useLearner } from "@/components/learner-provider";
import {
  attemptsOnDay,
  estimateLevel,
  filledSentence,
  percent,
  reviewQuestions,
  weakestSkill,
} from "@/lib/engine";
import { getField } from "@/lib/fields";
import { practicePath } from "@/lib/paths";
import { getQuestion } from "@/lib/questions";
import { getSkill, SKILLS } from "@/lib/skills";

const sample = getQuestion("art-01");

export function HomeView() {
  const { learner, ready, rename, account } = useLearner();

  if (!ready) {
    return (
      <div className="grid gap-4">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (learner.attempts.length === 0) {
    return <Welcome name={learner.name} onRename={rename} signedIn={Boolean(account)} />;
  }

  const level = estimateLevel(learner);
  const today = attemptsOnDay(learner).length;
  const goal = learner.dailyGoal;
  const weakId = weakestSkill(learner);
  const weak = weakId ? getSkill(weakId) : undefined;
  const reviewCount = reviewQuestions(learner).length;
  const greeting = learner.name ? `Hei, ${learner.name}.` : account ? `Hei, ${account.displayName}.` : "Hei.";
  const field = learner.fieldId ? getField(learner.fieldId) : undefined;
  const fieldState = field ? learner.fields[field.id] : undefined;

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-balance">Jatka omaa alaasi tai heikointa kielioppia.</h1>
        </div>
        {level.code && <Badge variant="secondary">{level.confidence === "steady" ? level.title : `Alustava · ${level.title}`}</Badge>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.8fr)]">
        <Card className="bg-card/90">
          <CardContent className="grid gap-5">
            <div>
              <p className="font-serif text-2xl">{level.code ? level.title : "Taso selviää harjoittelemalla."}</p>
              <p className="mt-2 max-w-xl text-muted-foreground">{level.detail}</p>
            </div>
            {weak && (
              <p className="max-w-xl text-sm leading-6">
                Heikoin kohta nyt on <span className="font-medium text-foreground">{weak.title.toLowerCase()}</span>. {weak.trap}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button size="lg" render={<Link href={practicePath("adaptive")} />}>
                Jatka harjoittelua
                <ArrowRight data-icon="inline-end" />
              </Button>
              {weakId && (
                <Button size="lg" variant="outline" render={<Link href={`/aiheet/${weakId}`} />}>
                  Avaa heikoin aihe
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <GoalRing value={today} max={goal} />
            <div>
              <p className="text-sm text-muted-foreground">Tänään</p>
              <p className="font-serif text-2xl">
                {today}/{goal}
              </p>
              <p className="text-sm text-muted-foreground">
                {today >= goal ? "Päivän tavoite on täynnä. Voit jatkaa silti." : "tehtävää päivän tavoitteesta"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!account && (
        <Link
          href="/tili"
          className="flex items-center justify-between gap-4 border border-border border-l-4 border-l-signal bg-card px-4 py-3"
        >
          <span className="text-sm leading-6">
            Luo tili tähän selaimeen, niin nimi ja edistyminen pysyvät tallessa myös seuraavalla kerralla.
          </span>
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
      )}

      {field && (
        <Link
          href={`/alat/${field.id}`}
          className="flex items-center justify-between gap-4 border border-border border-l-4 border-l-signal bg-card px-4 py-3"
        >
          <span className="flex items-center gap-2 text-sm">
            <HardHat className="size-4 text-primary" aria-hidden="true" />
            <span>
              {field.title}
              <span className="text-muted-foreground">
                {" "}
                · {fieldState && fieldState.seen > 0 ? `${percent(fieldState.mastery)} %` : "nimikkeet, sanasto ja työtilanteet"}
              </span>
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
      )}

      {reviewCount > 0 && (
        <Link
          href={practicePath("review")}
          className="flex items-center justify-between gap-4 bg-accent px-4 py-3 text-accent-foreground"
        >
          <span className="flex items-center gap-2 text-sm">
            <RotateCcw className="size-4" aria-hidden="true" />
            {reviewCount} tehtävää meni viimeksi väärin. Kertaa ne ennen kuin ne unohtuvat.
          </span>
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
      )}

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl">Aiheet</h2>
          <Link href="/aiheet" className="text-sm text-primary underline-offset-4 hover:underline">
            Säännöt ja esimerkit
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((skill) => {
            const state = learner.skills[skill.id];
            const value = state && state.seen > 0 ? percent(state.mastery) : 0;
            return (
              <li key={skill.id}>
                <Link href={`/aiheet/${skill.id}`} className="block h-full">
                  <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary">
                    <CardContent className="grid gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{skill.title}</p>
                          <p className="text-xs tracking-wide text-muted-foreground uppercase">{skill.eyebrow}</p>
                        </div>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {state && state.seen > 0 ? `${value} %` : "uusi"}
                        </span>
                      </div>
                      <Progress value={value} aria-label={`${skill.title}, hallinta ${value} prosenttia`} />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Welcome({
  name,
  onRename,
  signedIn,
}: {
  name: string;
  onRename: (name: string) => void;
  signedIn: boolean;
}) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
      <div>
        <p className="text-sm tracking-[0.16em] text-primary uppercase">Ammattikoulun englanti</p>
        <h1 className="mt-3 max-w-xl font-serif text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
          Oman alan nimikkeet, sanat ja tilanteet englanniksi.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Virke on ammattikoulun opiskelijalle. Jokaisella alalla on tutkintonimikkeet, työpaikan sanat ja lauseet,
          jotka pitää osata sanoa: turvakäsky, asiakas, mittayksikkö, raportti. Kielioppi harjoituttaa kohtia, joissa
          suomi ja englanti eroavat.
        </p>
        <ul className="mt-6 grid gap-3">
          {[
            ["Ammattinimikkeet englanniksi.", "Tutkintonimike tulee Opintopolun luettelosta. Jos työpaikalla sanotaan toisin, se on merkitty erikseen."],
            ["Sanasto ja työtilanteet omalta alalta.", "Kypärä, tilaus, mittayksikkö ja raportti harjoitellaan sillä alalla, jota opiskelet."],
            ["Oma tili tässä selaimessa.", "Edistyminen tallentuu tilillesi tälle koneelle. Varmuuskopio siirtää sen toiseen selaimeen. Mitään ei lähetetä palvelimelle."],
          ].map(([title, body]) => (
            <li key={title} className="border border-border border-l-4 border-l-signal bg-card px-4 py-3">
              <p className="font-medium">{title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button size="lg" render={<Link href="/alat" />}>
            <HardHat data-icon="inline-start" />
            Valitse alasi
          </Button>
          <Button size="lg" variant="outline" render={<Link href={practicePath("placement")} />}>
            <GraduationCap data-icon="inline-start" />
            Aloita tasotesti
          </Button>
          {!signedIn && (
            <Button size="lg" variant="secondary" render={<Link href="/tili" />}>
              Luo tili
            </Button>
          )}
        </div>
        <form
          className="mt-6 max-w-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            onRename(String(data.get("name") ?? ""));
          }}
        >
          <label htmlFor="nimi" className="text-sm text-muted-foreground">
            Nimi etusivun tervehdykseen, jos haluat
          </label>
          <div className="mt-2 flex gap-2">
            <Input id="nimi" name="name" defaultValue={name} maxLength={40} placeholder="Esim. Aino" />
            <Button type="submit" variant="secondary" size="lg">
              Tallenna
            </Button>
          </div>
          {name ? (
            <p className="mt-2 text-sm text-muted-foreground" role="status">
              Hei, {name}. Nimi on tallessa tähän selaimeen.
            </p>
          ) : null}
        </form>
      </div>
      {sample && <SampleCard />}
    </div>
  );
}

function SampleCard() {
  if (!sample) return null;
  const filled = filledSentence(sample);
  return (
    <Card className="bg-card/95">
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">Esimerkki palautteesta</Badge>
          <PenLine className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-sm text-muted-foreground">{sample.prompt}</p>
        {sample.sentence && <GapSentence sentence={sample.sentence} />}
        <div className="rounded-xl bg-accent px-3 py-3 text-sm leading-6 text-accent-foreground">
          <p className="font-medium">Oikein: {filled}</p>
          <p className="mt-2">{sample.why}</p>
          {sample.trap && <p className="mt-2">{sample.trap}</p>}
        </div>
        <p className="text-sm text-muted-foreground">
          Sääntö: {sample.rule}
        </p>
      </CardContent>
    </Card>
  );
}

function GoalRing({ value, max }: { value: number; max: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, max === 0 ? 0 : value / max);
  return (
    <svg viewBox="0 0 72 72" className="size-20 shrink-0" role="img" aria-label={`${value} tehtävää ${max}:stä tänään`}>
      <circle cx="36" cy="36" r={radius} fill="none" className="stroke-muted" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        className="stroke-primary"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${circumference * progress} ${circumference}`}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" className="fill-foreground text-[13px] font-medium">
        {Math.min(value, max)}
      </text>
    </svg>
  );
}
