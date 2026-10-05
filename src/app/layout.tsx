import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
    default: "Virke — ammattienglanti",
    template: "%s · Virke",
  },
  description:
    "Ammattikoulun englanti: alan nimikkeet, sanasto, työtilanteet ja kielioppi. Edistyminen tallentuu omalle tilille tässä selaimessa.",
};

export const viewport: Viewport = {
  themeColor: "#f4f0e6",
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
