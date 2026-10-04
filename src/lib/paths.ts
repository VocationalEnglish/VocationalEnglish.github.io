import type { FieldId, SkillId } from "./types";

export function practicePath(target: "adaptive" | "placement" | "review" | SkillId): string {
  if (target === "adaptive") return "/harjoitus";
  if (target === "placement") return "/harjoitus?tila=sijoitus";
  if (target === "review") return "/harjoitus?tila=kertaus";
  return `/harjoitus?aihe=${target}`;
}

export function fieldPracticePath(fieldId: FieldId): string {
  return `/harjoitus?ala=${fieldId}`;
}
