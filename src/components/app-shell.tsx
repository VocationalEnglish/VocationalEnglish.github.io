"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartColumn, Flame, HardHat, House, PenLine } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLearner } from "@/components/learner-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Koti", icon: House },
  { href: "/alat", label: "Alat", icon: HardHat },
  { href: "/aiheet", label: "Kielioppi", icon: BookOpen },
  { href: "/harjoitus", label: "Harjoitus", icon: PenLine },
  { href: "/edistyminen", label: "Edistyminen", icon: ChartColumn },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { learner, ready, account } = useLearner();
  const accountLabel = account?.displayName || "Tili";

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#sisalto"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-signal focus:px-3 focus:py-2 focus:text-ink"
      >
        Siirry sisältöön
      </a>
      <header className="sticky top-0 z-40 bg-ink text-white">
        <div className="h-1 bg-signal" />
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:gap-6 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center bg-signal font-serif text-lg font-bold text-ink">
              V
            </span>
            <span>
              <span className="block font-serif text-lg leading-none tracking-tight">Virke</span>
              <span className="mt-1 block text-[11px] tracking-[0.16em] text-white/65 uppercase">
                Ammattienglanti
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
                    "px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-white/10 text-white shadow-[inset_0_-2px_0_0_var(--signal)]"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle className="text-white/80 ring-white/25 hover:bg-white/10 hover:text-white" />
            {ready && learner.streak > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-signal px-2.5 py-1 text-sm font-medium text-ink">
                <Flame className="size-4" aria-hidden="true" />
                {learner.streak} pv
                <span className="sr-only">harjoitusputki</span>
              </span>
            )}
            <Link
              href="/tili"
              className={cn(
                "max-w-36 truncate px-2.5 py-1.5 text-sm",
                isActive(pathname, "/tili")
                  ? "bg-signal font-medium text-ink"
                  : "text-white/85 ring-1 ring-white/25 hover:bg-white/10 hover:text-white",
              )}
              aria-current={isActive(pathname, "/tili") ? "page" : undefined}
            >
              {accountLabel}
            </Link>
          </div>
        </div>
      </header>
      <main id="sisalto" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 md:px-6 md:pt-10 md:pb-16">
        {children}
      </main>
      <footer className="mt-auto hidden border-t border-border py-6 text-center text-sm text-muted-foreground md:block">
        Tili ja edistyminen tallentuvat tähän selaimeen, ei palvelimelle. Varmuuskopio siirtää ne toiseen koneeseen. Virke käyttää brittienglantia.
      </footer>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink text-white md:hidden"
        aria-label="Päävalikko"
      >
        <ul className="grid grid-cols-5">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-1 py-2.5 text-center text-[10px] leading-tight",
                    active ? "text-signal" : "text-white/65",
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
