"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-serif text-4xl tracking-tight">Jokin meni rikki</h1>
      <p className="mt-3 text-muted-foreground">Sivu ei auennut. Voit yrittää uudelleen.</p>
      <Button className="mt-6" size="lg" onClick={() => reset()}>
        Yritä uudelleen
      </Button>
    </div>
  );
}
