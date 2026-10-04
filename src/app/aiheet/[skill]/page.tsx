import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/lesson-view";
import { getSkill, isSkillId } from "@/lib/skills";
import { SKILL_IDS } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return SKILL_IDS.map((skill) => ({ skill }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ skill: string }>;
}): Promise<Metadata> {
  const { skill } = await params;
  const data = getSkill(skill);
  return { title: data?.title ?? "Aihe" };
}

export default async function Page({ params }: { params: Promise<{ skill: string }> }) {
  const { skill } = await params;
  if (!isSkillId(skill)) notFound();
  return <LessonView skillId={skill} />;
}
