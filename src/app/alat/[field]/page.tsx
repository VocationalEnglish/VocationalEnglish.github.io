import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FieldLesson } from "@/components/field-lesson";
import { getField, isFieldId } from "@/lib/fields";
import { FIELD_IDS } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return FIELD_IDS.map((field) => ({ field }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ field: string }>;
}): Promise<Metadata> {
  const { field } = await params;
  const data = getField(field);
  return {
    title: data?.title ?? "Ala",
    description: data?.summary,
  };
}

export default async function FieldPage({ params }: { params: Promise<{ field: string }> }) {
  const { field } = await params;
  if (!isFieldId(field)) notFound();
  return <FieldLesson fieldId={field} />;
}
