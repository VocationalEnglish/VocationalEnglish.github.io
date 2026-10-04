import { placementQuestions, QUESTIONS, getQuestion } from "./questions";
import { getSkill } from "./skills";
import type {
  Attempt,
  Cefr,
  Learner,
  Question,
  SessionMode,
  SkillId,
  SkillState,
} from "./types";

export const PRIOR_MASTERY = 0.32;
export const DEFAULT_DAILY_GOAL = 10;

const MASTERY_MIN = 0.04;
const MASTERY_MAX = 0.97;

export function createLearner(now = Date.now()): Learner {
  return {
    version: 1,
    name: "",
    placed: false,
    createdAt: now,
    lastPracticedAt: null,
    streak: 0,
    bestStreak: 0,
    dailyGoal: DEFAULT_DAILY_GOAL,
    attempts: [],
    skills: {},
  };
}

export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[.?!]+$/g, "");
}

export function isCorrect(question: Question, raw: string): boolean {
  if (question.kind === "mcq") {
    return raw === question.answer;
  }
  const given = normalizeAnswer(raw);
  if (!given) return false;
  const accepted = [question.answer, ...(question.accept ?? [])];
  return accepted.some((answer) => normalizeAnswer(answer) === given);
}

export function answerLabel(question: Question): string {
  if (question.kind === "mcq") {
    return (
      question.choices?.find((choice) => choice.id === question.answer)?.label ??
      question.answer
    );
  }
  return question.answer;
}

export function filledSentence(question: Question): string | null {
  if (!question.sentence) return null;
  if (!question.sentence.includes("___")) return question.sentence;
  const fill = question.fill ?? answerLabel(question);
  if (!fill) {
    return question.sentence.replace(/\s*___\s*/g, " ").replace(/\s+/g, " ").trim();
  }
  return question.sentence.replace("___", fill);
}

export function nextMastery(
  current: number,
  correct: boolean,
  difficulty: number,
  hinted: boolean,
): number {
  const weight = clamp(difficulty, 1, 5) / 5;
  if (correct) {
    let gain = 0.11 + 0.07 * weight;
    if (hinted) gain *= 0.55;
    return clamp(current + (1 - current) * gain, MASTERY_MIN, MASTERY_MAX);
  }
  const slip = 0.22 - 0.06 * weight;
  return clamp(current * (1 - slip), MASTERY_MIN, MASTERY_MAX);
}

export function skillState(learner: Learner, skillId: SkillId): SkillState | null {
  return learner.skills[skillId] ?? null;
}

export function masteryOf(learner: Learner, skillId: SkillId): number {
  return learner.skills[skillId]?.mastery ?? PRIOR_MASTERY;
}

export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function previousDayKey(timestamp: number): string {
  const date = new Date(timestamp);
  date.setDate(date.getDate() - 1);
  return dayKey(date.getTime());
}

function bumpStreak(learner: Learner, now: number): Pick<Learner, "streak" | "bestStreak" | "lastPracticedAt"> {
  if (learner.lastPracticedAt === null) {
    return { streak: 1, bestStreak: Math.max(learner.bestStreak, 1), lastPracticedAt: now };
  }
  const last = dayKey(learner.lastPracticedAt);
  const today = dayKey(now);
  if (last === today) {
    return {
      streak: learner.streak,
      bestStreak: learner.bestStreak,
      lastPracticedAt: now,
    };
  }
  const streak = last === previousDayKey(now) ? learner.streak + 1 : 1;
  return {
    streak,
    bestStreak: Math.max(learner.bestStreak, streak),
    lastPracticedAt: now,
  };
}

export function recordAnswer(
  learner: Learner,
  question: Question,
  raw: string,
  now: number,
  hinted: boolean,
): Learner {
  const correct = isCorrect(question, raw);
  const current = learner.skills[question.skillId];
  const mastery = nextMastery(
    current?.mastery ?? PRIOR_MASTERY,
    correct,
    question.difficulty,
    hinted,
  );
  const nextSkill: SkillState = {
    mastery,
    seen: (current?.seen ?? 0) + 1,
    correct: (current?.correct ?? 0) + (correct ? 1 : 0),
    wrong: (current?.wrong ?? 0) + (correct ? 0 : 1),
    correctStreak: correct ? (current?.correctStreak ?? 0) + 1 : 0,
    lastAt: now,
  };
  const attempt: Attempt = {
    questionId: question.id,
    skillId: question.skillId,
    correct,
    chosen: raw,
    at: now,
    hinted,
    difficulty: question.difficulty,
  };

  return {
    ...learner,
    ...bumpStreak(learner, now),
    attempts: [...learner.attempts, attempt].slice(-400),
    skills: {
      ...learner.skills,
      [question.skillId]: nextSkill,
    },
  };
}

export function markPlaced(learner: Learner): Learner {
  if (learner.placed) return learner;
  return { ...learner, placed: true };
}

export function attemptsOnDay(learner: Learner, now = Date.now()): Attempt[] {
  const today = dayKey(now);
  return learner.attempts.filter((attempt) => dayKey(attempt.at) === today);
}

export type LevelEstimate = {
  code: Cefr | null;
  title: string;
  detail: string;
  confidence: "none" | "early" | "warming" | "steady";
  average: number | null;
  practiced: number;
};

function bandStats(learner: Learner, difficulty: number) {
  const rows = learner.attempts.filter((attempt) => attempt.difficulty === difficulty);
  const correct = rows.filter((attempt) => attempt.correct).length;
  return {
    n: rows.length,
    accuracy: rows.length ? correct / rows.length : 0,
  };
}

function bandIsSolid(learner: Learner, difficulty: number): boolean {
  const band = bandStats(learner, difficulty);
  return (band.n >= 3 && band.accuracy >= 0.75) || (band.n >= 2 && band.accuracy >= 0.99);
}

export function estimateLevel(learner: Learner): LevelEstimate {
  const practiced = Object.values(learner.skills).filter((skill) => skill && skill.seen > 0);
  const answers = learner.attempts.length;
  const average = practiced.length
    ? practiced.reduce((sum, skill) => sum + (skill?.mastery ?? 0), 0) / practiced.length
    : null;

  if (practiced.length === 0 || answers < 4) {
    return {
      code: null,
      title: "Ei vielä arviota",
      detail: "Muutama vastaus riittää alustavaan tasoon. Tasotesti on nopein reitti.",
      confidence: "none",
      average,
      practiced: practiced.length,
    };
  }

  const easy = learner.attempts.filter((attempt) => attempt.difficulty <= 2);
  const easyAccuracy = easy.length
    ? easy.filter((attempt) => attempt.correct).length / easy.length
    : 1;
  const easyCollapsed = easy.length >= 4 && easyAccuracy < 0.5;

  let code: Cefr = "A1";
  if (!easyCollapsed && bandIsSolid(learner, 2)) code = "A2";
  if (!easyCollapsed && bandIsSolid(learner, 3)) code = "B1";
  if (!easyCollapsed && (bandIsSolid(learner, 4) || bandIsSolid(learner, 5))) code = "B2";

  const confidence = answers < 12 ? "early" : answers < 24 ? "warming" : "steady";
  const titles: Record<Cefr, string> = {
    A1: "A1 · perusteet",
    A2: "A2 · tutut rakenteet",
    B1: "B1 · tarkkuus ratkaisee",
    B2: "B2 · läheiset erot",
  };
  const details: Record<typeof confidence, string> = {
    early: "Alustava arvio. Taso nousee, kun onnistut vaikeammissa tehtävissä, ei pelkillä perusharjoituksilla.",
    warming: "Arvio perustuu siihen, millä vaikeustasolla vastaat oikein. Tämä ei ole virallinen kielikoe.",
    steady: "Taso seuraa onnistumisia eri vaikeustasoilla. Helpot oikeat vastaukset vahvistavat aihetta, mutta B1 ja B2 vaativat tarkempia tehtäviä.",
  };

  return {
    code,
    title: titles[code],
    detail: details[confidence],
    confidence,
    average,
    practiced: practiced.length,
  };
}

export function weakestSkill(learner: Learner): SkillId | null {
  const entries = Object.entries(learner.skills).filter(
    (entry): entry is [SkillId, SkillState] => {
      const state = entry[1];
      return Boolean(state && state.seen > 0);
    },
  );
  if (!entries.length) return null;
  entries.sort((a, b) => a[1].mastery - b[1].mastery || a[1].wrong - b[1].wrong);
  return entries[0][0];
}

function latestByQuestion(learner: Learner): Map<string, Attempt> {
  const latest = new Map<string, Attempt>();
  for (const attempt of learner.attempts) {
    latest.set(attempt.questionId, attempt);
  }
  return latest;
}

export function reviewQuestions(learner: Learner): Question[] {
  const latest = latestByQuestion(learner);
  const missed = [...latest.values()].filter((attempt) => !attempt.correct);
  missed.sort((a, b) => {
    const mastery = masteryOf(learner, a.skillId) - masteryOf(learner, b.skillId);
    if (mastery !== 0) return mastery;
    return b.at - a.at;
  });
  return missed
    .map((attempt) => getQuestion(attempt.questionId))
    .filter((question): question is Question => Boolean(question));
}

export type SessionQuestion = {
  question: Question;
  followUp: boolean;
};

function scoreQuestion(
  question: Question,
  learner: Learner,
  used: Set<string>,
  counts: Map<SkillId, number>,
  mode: SessionMode,
  noise: number,
): number {
  if (used.has(question.id)) return 0;
  if (mode.type === "topic" && question.skillId !== mode.skillId) return 0;

  const state = learner.skills[question.skillId];
  const mastery = state?.mastery ?? PRIOR_MASTERY;
  const target = 1 + mastery * 4;
  const fit = 1 - Math.abs(question.difficulty - target) / 5;
  const weakness = 1 - mastery;
  const unseen = state?.seen ? 0 : 0.4;
  const latest = [...learner.attempts].reverse().find((attempt) => attempt.questionId === question.id);
  let repeat = 1;
  if (latest?.correct) repeat = 0.22;
  if (latest && !latest.correct) repeat = 1.35;

  const skillCount = counts.get(question.skillId) ?? 0;
  const spread = skillCount >= 3 ? 0.12 : skillCount === 2 ? 0.55 : 1;
  const lastSkillAttempt = [...learner.attempts]
    .reverse()
    .find((attempt) => attempt.skillId === question.skillId);
  const repair = lastSkillAttempt && !lastSkillAttempt.correct ? 0.35 : 0;

  return Math.max(0.02, (weakness * 1.35 + fit + unseen + repair) * repeat * spread + noise);
}

function weightedPick<T>(items: { item: T; score: number }[], rng: () => number): T | null {
  const usable = items.filter((item) => item.score > 0);
  if (!usable.length) return null;
  const total = usable.reduce((sum, item) => sum + item.score, 0);
  let cursor = rng() * total;
  for (const item of usable) {
    cursor -= item.score;
    if (cursor <= 0) return item.item;
  }
  return usable[usable.length - 1].item;
}

export function sessionLength(mode: SessionMode, learner: Learner): number {
  if (mode.type === "placement") return placementQuestions().length;
  if (mode.type === "review") return Math.min(8, reviewQuestions(learner).length);
  return 8;
}

export function buildSession(
  learner: Learner,
  mode: SessionMode,
  rng: () => number = Math.random,
): SessionQuestion[] {
  if (mode.type === "placement") {
    return placementQuestions().map((question) => ({ question, followUp: false }));
  }

  if (mode.type === "review") {
    return reviewQuestions(learner)
      .slice(0, 8)
      .map((question) => ({ question, followUp: false }));
  }

  const count = sessionLength(mode, learner);
  const picked: SessionQuestion[] = [];
  const used = new Set<string>();
  const counts = new Map<SkillId, number>();

  while (picked.length < count) {
    const next = weightedPick(
      QUESTIONS.map((question) => ({
        item: question,
        score: scoreQuestion(question, learner, used, counts, mode, rng() * 0.08),
      })),
      rng,
    );
    if (!next) break;
    picked.push({ question: next, followUp: false });
    used.add(next.id);
    counts.set(next.skillId, (counts.get(next.skillId) ?? 0) + 1);
  }

  return picked;
}

export function pickFollowUp(
  learner: Learner,
  skillId: SkillId,
  difficulty: number,
  used: Set<string>,
  rng: () => number = Math.random,
): Question | null {
  const pool = QUESTIONS.filter(
    (question) => question.skillId === skillId && !used.has(question.id),
  );
  if (!pool.length) return null;
  const easier = pool.filter((question) => question.difficulty <= Math.max(1, difficulty - 1));
  const band = easier.length ? easier : pool;
  return weightedPick(
    band.map((question) => ({
      item: question,
      score: scoreQuestion(
        question,
        learner,
        used,
        new Map(),
        { type: "topic", skillId },
        rng() * 0.05,
      ),
    })),
    rng,
  );
}

export function choiceNote(question: Question, choiceId: string): string | undefined {
  return question.choices?.find((choice) => choice.id === choiceId)?.note;
}

export function percent(mastery: number): number {
  return Math.round(clamp(mastery, 0, 1) * 100);
}

export function difficultyLabel(difficulty: number): string {
  return ["", "Perus", "Tuttu", "Keskitaso", "Tarkka", "Vaativa"][difficulty] ?? "Keskitaso";
}

export function skillTitle(skillId: SkillId): string {
  return getSkill(skillId)?.title ?? skillId;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
