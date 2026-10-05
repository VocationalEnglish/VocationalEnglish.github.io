import type { FieldId, FieldTrack, SkillId } from "./types";

export function practicePath(target: "adaptive" | "placement" | "review" | SkillId): string {
  if (target === "adaptive") return "/harjoitus";
  if (target === "placement") return "/harjoitus?tila=sijoitus";
  if (target === "review") return "/harjoitus?tila=kertaus";
  return `/harjoitus?aihe=${target}`;
}

export function fieldPracticePath(fieldId: FieldId, track: FieldTrack = "work"): string {
  if (track === "titles") return `/harjoitus?ala=${fieldId}&osio=nimikkeet`;
  if (track === "words") return `/harjoitus?ala=${fieldId}&osio=sanasto`;
  return `/harjoitus?ala=${fieldId}`;
}
