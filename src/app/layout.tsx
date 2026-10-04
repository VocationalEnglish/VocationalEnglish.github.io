import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { LearnerProvider } from "@/components/learner-provider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Virke — englannin kielioppi",
    template: "%s · Virke",
  },
  description:
    "Adaptiivinen englannin kielioppitreeni suomalaisille oppilaille. Tasotesti, selitys jokaiseen vastaukseen ja harjoitus, joka keskittyy heikkoihin kohtiin.",
};

export const viewport: Viewport = {
  themeColor: "#f4f0e6",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fi" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full">
        <LearnerProvider>
          <AppShell>{children}</AppShell>
        </LearnerProvider>
      </body>
    </html>
  );
}
