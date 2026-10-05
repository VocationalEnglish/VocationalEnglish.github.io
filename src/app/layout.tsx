import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { LearnerProvider } from "@/components/learner-provider";
import "./globals.css";

const outfit = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-outfit",
});

const fraunces = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Virke — ammattienglanti",
    template: "%s · Virke",
  },
  description:
    "Ammattikoulun englanti: alan nimikkeet, sanasto, työtilanteet ja kielioppi. Edistyminen tallentuu omalle tilille tässä selaimessa.",
};

export const viewport: Viewport = {
  themeColor: "#243352",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fi" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <Script id="virke-theme" strategy="beforeInteractive">
          {`try{if(localStorage.getItem("virke.theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`}
        </Script>
        <LearnerProvider>
          <AppShell>{children}</AppShell>
        </LearnerProvider>
      </body>
    </html>
  );
}
