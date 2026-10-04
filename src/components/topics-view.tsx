"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLearner } from "@/components/learner-provider";
import { percent } from "@/lib/engine";
import { SKILLS } from "@/lib/skills";

export function TopicsView() {
  const { learner, ready } = useLearner();

  return (
    <div className="grid gap-6">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl tracking-tight">Kaksitoista kohtaa, joissa suomi ja englanti eroavat.</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Lue sääntö ennen tehtäviä tai mene suoraan harjoitukseen. Jokaisessa aiheessa on tyypillinen suomalainen kompastus, lyhyet esimerkit ja tehtäviä vaikeustasoilla A1–B2.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {SKILLS.map((skill) => {
          const state = ready ? learner.skills[skill.id] : undefined;
          const known = Boolean(state && state.seen > 0);
          const value = known && state ? percent(state.mastery) : 0;
          return (
            <li key={skill.id}>
              <Link href={`/aiheet/${skill.id}`} className="block h-full">
                <Card className="h-full transition hover:-translate-y-0.5 hover:ring-primary/30">
                  <CardContent className="grid gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{skill.eyebrow}</p>
                        <h2 className="mt-1 font-serif text-2xl">{skill.title}</h2>
                      </div>
                      <span className="text-sm text-muted-foreground">{skill.levels}</span>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{skill.summary}</p>
                    <div className="grid gap-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{known ? "Hallinta" : "Ei vielä harjoiteltu"}</span>
                        <span className="tabular-nums">{known ? `${value} %` : ""}</span>
                      </div>
                      <Progress value={value} aria-label={`${skill.title} ${known ? value : 0} prosenttia`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
