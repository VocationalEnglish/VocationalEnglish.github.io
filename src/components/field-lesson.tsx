"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLearner } from "@/components/learner-provider";
import { percent } from "@/lib/engine";
import { getField } from "@/lib/fields";
import { fieldPracticePath } from "@/lib/paths";
import { questionsForField } from "@/lib/questions/fields";
import type { FieldId } from "@/lib/types";

export function FieldLesson({ fieldId }: { fieldId: FieldId }) {
  const field = getField(fieldId);
  const { learner, ready, chooseField } = useLearner();
  if (!field) return null;

  const state = ready ? learner.fields[fieldId] : undefined;
  const known = Boolean(state && state.seen > 0);
  const value = known && state ? percent(state.mastery) : 0;
  const count = questionsForField(fieldId).length;
  const chosen = ready && learner.fieldId === fieldId;

  return (
    <article className="mx-auto grid w-full max-w-3xl gap-6">
      <div>
        <Link href="/alat" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kaikki alat
        </Link>
        <p className="mt-4 text-xs tracking-[0.16em] text-primary uppercase">{field.group}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl tracking-tight">{field.title}</h1>
          {chosen && <Badge>Oma ala</Badge>}
        </div>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{field.summary}</p>
      </div>

      <Card>
        <CardContent className="grid gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{known ? "Hallinta tällä alalla" : "Ei vielä harjoiteltu"}</p>
            <p className="font-serif text-3xl tabular-nums">{known ? `${value} %` : "—"}</p>
          </div>
          <Progress value={value} aria-label={`${field.title}, hallinta`} />
          <p className="text-sm text-muted-foreground">{count} työtilannetta.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" render={<Link href={fieldPracticePath(fieldId)} onClick={() => chooseField(fieldId)} />}>
              Harjoittele tätä alaa
              <ArrowRight data-icon="inline-end" />
            </Button>
            {!chosen && (
              <Button size="lg" variant="outline" onClick={() => chooseField(fieldId)}>
                Aseta omaksi alaksi
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <section className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-4">
        <h2 className="font-medium">Missä suomi sotkee</h2>
        <p className="mt-1 leading-7">{field.trap}</p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Näitä tarvitset työssä</h2>
        <ul className="grid gap-2">
          {field.need.map((item) => (
            <li key={item} className="rounded-2xl bg-card px-4 py-3 leading-7 ring-1 ring-foreground/10">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Fraasit</h2>
        <ul className="grid gap-2">
          {field.phrases.map((phrase) => (
            <li
              key={phrase.en}
              className="grid gap-1 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:gap-4"
            >
              <p className="font-serif text-lg">{phrase.en}</p>
              <p className="text-sm leading-6 text-muted-foreground">{phrase.fi}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
