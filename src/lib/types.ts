export const SKILL_IDS = [
  "articles",
  "present",
  "past",
  "future",
  "agreement",
  "pronouns",
  "quantifiers",
  "comparison",
  "prepositions",
  "conditionals",
  "modals",
  "word-order",
] as const;

export type SkillId = (typeof SKILL_IDS)[number];

export type Cefr = "A1" | "A2" | "B1" | "B2";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Choice = {
  id: string;
  label: string;
  note?: string;
};

export type Question = {
  id: string;
  skillId: SkillId;
  difficulty: Difficulty;
  level: Cefr;
  kind: "mcq" | "cloze";
  prompt: string;
  sentence?: string;
  choices?: Choice[];
  answer: string;
  accept?: string[];
  /** Word that fills the blank. Empty string means the article is omitted. */
  fill?: string;
  rule: string;
  why: string;
  example: string;
  trap?: string;
};

export type Contrast = {
  en: string;
  fi: string;
};

export type MistakePair = {
  wrong: string;
  right: string;
};

export type Skill = {
  id: SkillId;
  title: string;
  eyebrow: string;
  summary: string;
  levels: string;
  trap: string;
  rules: string[];
  contrasts: Contrast[];
  watch: string[];
  mistakes: MistakePair[];
};

export type SkillState = {
  mastery: number;
  seen: number;
  correct: number;
  wrong: number;
  correctStreak: number;
  lastAt: number;
};

export type Attempt = {
  questionId: string;
  skillId: SkillId;
  correct: boolean;
  chosen: string;
  at: number;
  hinted: boolean;
  difficulty: Difficulty;
};

export type Learner = {
  version: 1;
  name: string;
  placed: boolean;
  createdAt: number;
  lastPracticedAt: number | null;
  streak: number;
  bestStreak: number;
  dailyGoal: number;
  attempts: Attempt[];
  skills: Partial<Record<SkillId, SkillState>>;
};

export type SessionMode =
  | { type: "adaptive" }
  | { type: "placement" }
  | { type: "review" }
  | { type: "topic"; skillId: SkillId };
