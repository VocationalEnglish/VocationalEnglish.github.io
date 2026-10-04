import type { Choice, Question } from "./types";

export function choice(id: string, label: string, note?: string): Choice {
  return note ? { id, label, note } : { id, label };
}

export function mcq(question: Omit<Question, "kind"> & { choices: Choice[] }): Question {
  return { ...question, kind: "mcq" };
}

export function cloze(question: Omit<Question, "kind" | "choices">): Question {
  return { ...question, kind: "cloze" };
}
