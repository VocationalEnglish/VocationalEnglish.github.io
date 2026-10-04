import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-serif text-4xl tracking-tight">Sivua ei löydy</h1>
      <p className="mt-3 text-muted-foreground">Osoite ei vastaa aihetta eikä näkymää Virkkeessä.</p>
      <Button className="mt-6" size="lg" render={<Link href="/" />}>
        Etusivulle
      </Button>
    </div>
  );
}
