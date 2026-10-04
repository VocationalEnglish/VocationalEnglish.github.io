import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeSession } from "@/components/practice-session";

export const metadata: Metadata = {
  title: "Harjoitus",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto h-64 max-w-2xl animate-pulse rounded-2xl bg-muted" />}>
      <PracticeSession />
    </Suspense>
  );
}
