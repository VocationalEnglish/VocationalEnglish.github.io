"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLearner } from "@/components/learner-provider";
import { percent } from "@/lib/engine";
import { practicePath } from "@/lib/paths";
import { questionsForSkill } from "@/lib/questions";
import { getSkill } from "@/lib/skills";
import type { SkillId } from "@/lib/types";

export function LessonView({ skillId }: { skillId: SkillId }) {
  const skill = getSkill(skillId);
  const { learner, ready } = useLearner();
  if (!skill) return null;

  const state = ready ? learner.skills[skillId] : undefined;
  const known = Boolean(state && state.seen > 0);
  const value = known && state ? percent(state.mastery) : 0;
  const count = questionsForSkill(skillId).length;

  return (
    <article className="mx-auto grid w-full max-w-3xl gap-6">
      <div>
        <Link href="/aiheet" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kaikki aiheet
        </Link>
        <p className="mt-4 text-xs tracking-[0.16em] text-primary uppercase">{skill.eyebrow}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl tracking-tight">{skill.title}</h1>
          <Badge variant="outline">{skill.levels}</Badge>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{skill.summary}</p>
      </div>

      <Card>
        <CardContent className="grid gap-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{known ? "Hallinta tässä aiheessa" : "Ei vielä harjoiteltu"}</p>
              <p className="font-serif text-3xl tabular-nums">{known ? `${value} %` : "—"}</p>
            </div>
            {known && state && state.correctStreak > 1 && (
              <p className="text-sm text-muted-foreground">{state.correctStreak} oikein putkeen</p>
            )}
          </div>
          <Progress value={value} aria-label={`${skill.title}, hallinta`} />
          <p className="text-sm text-muted-foreground">{count} tehtävää tässä pankissa.</p>
        </CardContent>
      </Card>

      <section className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-4">
        <h2 className="font-medium">Suomalainen kompastus</h2>
        <p className="mt-1 leading-7">{skill.trap}</p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Sääntö</h2>
        <ol className="grid gap-3">
          {skill.rules.map((rule, index) => (
            <li key={rule} className="flex gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10">
              <span className="font-serif text-xl text-primary">{index + 1}</span>
              <p className="leading-7">{rule}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Vierekkäin</h2>
        <ul className="grid gap-2">
          {skill.contrasts.map((contrast) => (
            <li key={contrast.en} className="grid gap-1 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
              <p className="font-serif text-lg">{contrast.en}</p>
              <p className="text-sm leading-6 text-muted-foreground">{contrast.fi}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Korjaa nämä</h2>
        <ul className="grid gap-2">
          {skill.mistakes.map((mistake) => (
            <li key={mistake.wrong} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10">
              <p className="text-destructive line-through decoration-destructive/70">{mistake.wrong}</p>
              <p className="mt-1 font-serif text-lg">{mistake.right}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-2">
        <h2 className="font-serif text-2xl">Pidä mielessä</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
          {skill.watch.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" render={<Link href={practicePath(skillId)} />}>
          Harjoittele tätä aihetta
          <ArrowRight data-icon="inline-end" />
        </Button>
        <Button size="lg" variant="outline" render={<Link href={practicePath("adaptive")} />}>
          Sekoita kaikki aiheet
        </Button>
      </div>
    </article>
  );
}
