import type { Cefr, Choice, Difficulty, FieldId, FieldTrack, Question, SkillId } from "@/lib/types";

type TaskInput = {
  id: string;
  fieldId: FieldId;
  skillId: SkillId;
  difficulty: Difficulty;
  level: Cefr;
  prompt: string;
  sentence?: string;
  choices: Choice[];
  answer: string;
  fill?: string;
  rule: string;
  why: string;
  example: string;
  trap?: string;
  accept?: string[];
  kind?: "mcq" | "cloze";
  track?: FieldTrack;
};

export function task(input: TaskInput): Question {
  const answerLabel = input.choices.find((choice) => choice.id === input.answer)?.label;
  return {
    id: input.id,
    fieldId: input.fieldId,
    skillId: input.skillId,
    difficulty: input.difficulty,
    level: input.level,
    kind: input.kind ?? "mcq",
    prompt: input.prompt,
    sentence: input.sentence,
    choices: input.kind === "cloze" ? undefined : input.choices,
    answer: input.answer,
    accept: input.accept,
    fill: input.fill ?? answerLabel,
    rule: input.rule,
    why: input.why,
    example: input.example,
    trap: input.trap,
    track: input.track,
  };
}

export function options(
  a: [string, string],
  b: [string, string],
  c: [string, string],
  d: [string, string],
): Choice[] {
  return [
    { id: "a", label: a[0], note: a[1] },
    { id: "b", label: b[0], note: b[1] },
    { id: "c", label: c[0], note: c[1] },
    { id: "d", label: d[0], note: d[1] },
  ];
}
