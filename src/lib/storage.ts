import { createLearner, DEFAULT_DAILY_GOAL } from "./engine";
import { isSkillId } from "./skills";
import type { Learner, SkillId, SkillState } from "./types";

const KEY = "virke.learner.v1";

export type LearnerSnapshot = {
  raw: string;
  persistent: boolean;
  pending: boolean;
};

const SERVER_SNAPSHOT: LearnerSnapshot = { raw: "", persistent: true, pending: true };

let memory: LearnerSnapshot = SERVER_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function clampMastery(value: number): number {
  if (!Number.isFinite(value)) return 0.32;
  return Math.min(0.97, Math.max(0.04, value));
}

function sanitizeSkill(value: unknown): SkillState | null {
  if (!value || typeof value !== "object") return null;
  const skill = value as SkillState;
  return {
    mastery: clampMastery(skill.mastery),
    seen: Number.isFinite(skill.seen) ? Math.max(0, skill.seen) : 0,
    correct: Number.isFinite(skill.correct) ? Math.max(0, skill.correct) : 0,
    wrong: Number.isFinite(skill.wrong) ? Math.max(0, skill.wrong) : 0,
    correctStreak: Number.isFinite(skill.correctStreak) ? Math.max(0, skill.correctStreak) : 0,
    lastAt: Number.isFinite(skill.lastAt) ? skill.lastAt : Date.now(),
  };
}

export function sanitizeLearner(value: unknown): Learner | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<Learner>;
  if (raw.version !== 1 || !Array.isArray(raw.attempts)) return null;

  const skills: Learner["skills"] = {};
  if (raw.skills && typeof raw.skills === "object") {
    for (const [id, skill] of Object.entries(raw.skills)) {
      if (!isSkillId(id)) continue;
      const clean = sanitizeSkill(skill);
      if (clean) skills[id as SkillId] = clean;
    }
  }

  const goal = raw.dailyGoal;
  const dailyGoal = goal === 5 || goal === 10 || goal === 15 ? goal : DEFAULT_DAILY_GOAL;

  return {
    version: 1,
    name: typeof raw.name === "string" ? raw.name.trim().slice(0, 40) : "",
    placed: Boolean(raw.placed),
    createdAt: Number.isFinite(raw.createdAt) ? Number(raw.createdAt) : Date.now(),
    lastPracticedAt: Number.isFinite(raw.lastPracticedAt) ? Number(raw.lastPracticedAt) : null,
    streak: Number.isFinite(raw.streak) ? Math.max(0, Number(raw.streak)) : 0,
    bestStreak: Number.isFinite(raw.bestStreak) ? Math.max(0, Number(raw.bestStreak)) : 0,
    dailyGoal,
    attempts: raw.attempts
      .filter((attempt) => attempt && typeof attempt.questionId === "string")
      .slice(-400),
    skills,
  };
}

export function parseLearner(raw: string): Learner {
  if (!raw) return createLearner();
  try {
    return sanitizeLearner(JSON.parse(raw)) ?? createLearner();
  } catch {
    return createLearner();
  }
}

export function subscribeLearner(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    memory = { raw: event.newValue ?? "", persistent: true, pending: false };
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getLearnerSnapshot(): LearnerSnapshot {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    try {
      memory = {
        raw: window.localStorage.getItem(KEY) ?? "",
        persistent: true,
        pending: false,
      };
    } catch {
      memory = { raw: "", persistent: false, pending: false };
    }
  }
  return memory;
}

export function getServerLearnerSnapshot(): LearnerSnapshot {
  return SERVER_SNAPSHOT;
}

export function writeLearner(learner: Learner): boolean {
  const raw = JSON.stringify(learner);
  try {
    window.localStorage.setItem(KEY, raw);
    memory = { raw, persistent: true, pending: false };
    emit();
    return true;
  } catch {
    memory = { raw, persistent: false, pending: false };
    emit();
    return false;
  }
}
