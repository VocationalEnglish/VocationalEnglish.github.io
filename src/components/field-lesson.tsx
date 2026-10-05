"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useLearner } from "@/components/learner-provider";
import { percent } from "@/lib/engine";
import { getField } from "@/lib/fields";
import { fieldPracticePath } from "@/lib/paths";
import { questionsForField } from "@/lib/questions/fields";
import { titleQuestionsFor, wordQuestionsFor } from "@/lib/questions/generated";
import { getTrade } from "@/lib/trade";
import type { FieldId, TermGroup } from "@/lib/types";

const GROUP_LABEL: Record<TermGroup, string> = {
  ihmiset: "Ihmiset",
  välineet: "Välineet",
  paikat: "Paikat",
  paperit: "Paperit",
  turvallisuus: "Turvallisuus",
  aineet: "Aineet",
  eläimet: "Eläimet",
};

export function FieldLesson({ fieldId }: { fieldId: FieldId }) {
  const field = getField(fieldId);
  const trade = getTrade(fieldId);
  const { learner, ready, chooseField } = useLearner();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const occupations = useMemo(
    () =>
      trade.occupations.filter((item) =>
        needle ? `${item.fi} ${item.en} ${item.does}`.toLowerCase().includes(needle) : true,
      ),
    [needle, trade.occupations],
  );
  const terms = useMemo(
    () => trade.terms.filter((item) => (needle ? `${item.fi} ${item.en}`.toLowerCase().includes(needle) : true)),
    [needle, trade.terms],
  );
  if (!field) return null;

  const state = ready ? learner.fields[fieldId] : undefined;
  const known = Boolean(state && state.seen > 0);
  const value = known && state ? percent(state.mastery) : 0;
  const chosen = ready && learner.fieldId === fieldId;
  const groups = [...new Set(terms.map((item) => item.group))];

  return (
    <article className="grid gap-8">
      <div>
        <Link href="/alat" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kaikki alat
        </Link>
        <p className="mt-4 text-xs font-medium tracking-[0.18em] text-primary uppercase">{field.group}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-serif text-4xl tracking-tight">{field.title}</h1>
          {chosen && <Badge>Oma ala</Badge>}
        </div>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{field.summary}</p>
      </div>

      <Card>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">Tutkinto</p>
            <p className="mt-1 font-medium">{trade.qualification.fi}</p>
            <p className="text-sm text-muted-foreground">{trade.qualification.en}</p>
            <p className="mt-3 font-serif text-3xl tabular-nums">{known ? `${value} %` : "—"}</p>
            <Progress className="mt-2" value={value} aria-label={`${field.title}, hallinta`} />
          </div>
          <Button variant={chosen ? "secondary" : "outline"} onClick={() => chooseField(fieldId)}>
            {chosen ? "Tämä on oma alasi" : "Aseta omaksi alaksi"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <TrackLink
          href={fieldPracticePath(fieldId, "work")}
          title="Työtilanteet"
          detail={`${questionsForField(fieldId).length} tilannetta, joissa lause pitää osata sanoa.`}
          onChoose={() => chooseField(fieldId)}
        />
        <TrackLink
          href={fieldPracticePath(fieldId, "titles")}
          title="Nimikkeet"
          detail={`${titleQuestionsFor(fieldId).length} ammattinimikettä englanniksi.`}
          onChoose={() => chooseField(fieldId)}
        />
        <TrackLink
          href={fieldPracticePath(fieldId, "words")}
          title="Sanasto"
          detail={`${wordQuestionsFor(fieldId).length} työn sanaa.`}
          onChoose={() => chooseField(fieldId)}
        />
      </div>

      <section className="rounded-md border border-warning/40 bg-warning/10 px-4 py-4">
        <h2 className="font-medium">Missä suomi sotkee</h2>
        <p className="mt-1 leading-7">{field.trap}</p>
      </section>

      <div className="max-w-md">
        <label htmlFor="haku" className="text-sm text-muted-foreground">
          Hae nimikettä tai sanaa
        </label>
        <Input
          id="haku"
          className="mt-2"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Esim. electrician tai kypärä"
        />
      </div>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Ammattinimikkeet</h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Tutkintonimike on Opintopolun englanninkielinen vastine. Työpaikan sana on se, jonka kollega tai asiakas sanoo, jos se eroaa tutkintonimikkeestä.
        </p>
        <ul className="grid gap-2">
          {occupations.map((item) => (
            <li key={`${item.fi}-${item.en}`} className="grid gap-1 rounded-md border border-border bg-card px-4 py-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,1.4fr)] md:gap-4">
              <p className="font-medium">{item.fi}</p>
              <p>
                <span className="font-serif text-lg">{item.en}</span>
                {item.official && (
                  <span className="mt-1 block text-xs tracking-wide text-primary uppercase">Tutkintonimike</span>
                )}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">{item.does}</p>
            </li>
          ))}
        </ul>
        {occupations.length === 0 && <p className="text-sm text-muted-foreground">Ei nimikkeitä tällä haulla.</p>}
      </section>

      <section className="grid gap-4">
        <h2 className="font-serif text-2xl">Sanasto</h2>
        {groups.map((group) => (
          <div key={group}>
            <h3 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">{GROUP_LABEL[group]}</h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {terms
                .filter((item) => item.group === group)
                .map((item) => (
                  <li key={item.en} className="flex items-baseline justify-between gap-3 border-b border-border py-2">
                    <span className="font-serif text-lg">{item.en}</span>
                    <span className="text-sm text-muted-foreground">{item.fi}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        {terms.length === 0 && <p className="text-sm text-muted-foreground">Ei sanoja tällä haulla.</p>}
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Näitä tarvitset työssä</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {field.need.map((item) => (
            <li key={item} className="rounded-md border border-border bg-card px-4 py-3 leading-7">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Fraasit</h2>
        <ul className="grid gap-2">
          {field.phrases.map((phrase) => (
            <li key={phrase.en} className="grid gap-1 border-b border-border py-3 sm:grid-cols-2">
              <p className="font-serif text-lg">{phrase.en}</p>
              <p className="text-sm leading-6 text-muted-foreground">{phrase.fi}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
        Tutkintonimikkeiden englanninkieliset vastineet on tarkistettu Opintopolun tutkintonimikeluettelosta. Jos työpaikalla käytetään eri sanaa, se on merkitty ilman tutkintonimike-merkintää.
      </p>
    </article>
  );
}

function TrackLink({
  href,
  title,
  detail,
  onChoose,
}: {
  href: string;
  title: string;
  detail: string;
  onChoose: () => void;
}) {
  return (
    <Link href={href} onClick={onChoose} className="block h-full">
      <Card className="h-full transition hover:border-primary">
        <CardContent className="grid gap-2">
          <p className="font-serif text-2xl">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
