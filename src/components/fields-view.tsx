"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLearner } from "@/components/learner-provider";
import { percent } from "@/lib/engine";
import { FIELD_GROUPS, fieldsInGroup } from "@/lib/fields";

export function FieldsView() {
  const { learner, ready } = useLearner();

  return (
    <div className="grid gap-8">
      <div className="max-w-2xl">
        <p className="text-sm tracking-[0.16em] text-primary uppercase">Työelämän englanti</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-balance">Valitse alasi</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Jokaisella alalla on omat tilanteet: turvakäsky, asiakas, mittayksikkö, raportti. Tehtävät ovat niitä lauseita, jotka työssä pitää osata sanoa tai kirjoittaa.
        </p>
      </div>

      {FIELD_GROUPS.map((group) => (
        <section key={group} className="grid gap-3">
          <h2 className="font-serif text-2xl">{group}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {fieldsInGroup(group).map((field) => {
              const state = ready ? learner.fields[field.id] : undefined;
              const known = Boolean(state && state.seen > 0);
              const chosen = ready && learner.fieldId === field.id;
              return (
                <li key={field.id}>
                  <Link href={`/alat/${field.id}`} className="block h-full">
                    <Card className="h-full transition hover:-translate-y-0.5 hover:ring-primary/30">
                      <CardContent className="grid gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium">{field.title}</p>
                          {chosen && <Badge>Oma ala</Badge>}
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{field.summary}</p>
                        <p className="text-xs tracking-wide text-muted-foreground uppercase">
                          {known && state ? `${percent(state.mastery)} % hallussa` : "6 työtilannetta"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
