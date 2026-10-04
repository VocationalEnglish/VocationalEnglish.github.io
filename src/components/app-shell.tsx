"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartColumn, Flame, House, PenLine } from "lucide-react";
import { useLearner } from "@/components/learner-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Koti", icon: House },
  { href: "/aiheet", label: "Aiheet", icon: BookOpen },
  { href: "/harjoitus", label: "Harjoitus", icon: PenLine },
  { href: "/edistyminen", label: "Edistyminen", icon: ChartColumn },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { learner, ready } = useLearner();

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#sisalto"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
      >
        Siirry sisältöön
      </a>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-serif text-lg text-primary-foreground">
              V
            </span>
            <span>
              <span className="block font-serif text-lg leading-none tracking-tight">Virke</span>
              <span className="mt-1 block text-[11px] tracking-wide text-muted-foreground uppercase">
                Kielioppitreeni
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Päävalikko">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto">
            {ready && learner.streak > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">
                <Flame className="size-4" aria-hidden="true" />
                {learner.streak} pv
                <span className="sr-only">harjoitusputki</span>
              </span>
            )}
          </div>
        </div>
      </header>
      <main id="sisalto" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 md:px-6 md:pt-10 md:pb-16">
        {children}
      </main>
      <footer className="mt-auto hidden border-t border-border/80 py-6 text-center text-sm text-muted-foreground md:block">
        Edistyminen tallentuu vain tähän selaimeen. Virke käyttää brittienglantia, koska se on koulussa tavallisin linja.
      </footer>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur md:hidden"
        aria-label="Päävalikko"
      >
        <ul className="grid grid-cols-4">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-2 py-2.5 text-[11px]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
