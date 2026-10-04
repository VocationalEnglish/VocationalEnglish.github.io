"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { createLearner, isCorrect, markPlaced, recordAnswer } from "@/lib/engine";
import {
  getLearnerSnapshot,
  getServerLearnerSnapshot,
  parseLearner,
  subscribeLearner,
  writeLearner,
} from "@/lib/storage";
import type { FieldId, Learner, Question } from "@/lib/types";

type LearnerContextValue = {
  learner: Learner;
  ready: boolean;
  persistent: boolean;
  answer: (question: Question, raw: string, hinted: boolean) => { correct: boolean; learner: Learner };
  place: () => void;
  rename: (name: string) => void;
  setGoal: (goal: 5 | 10 | 15) => void;
  chooseField: (fieldId: FieldId) => void;
  reset: () => void;
};

const LearnerContext = createContext<LearnerContextValue | null>(null);

export function LearnerProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeLearner, getLearnerSnapshot, getServerLearnerSnapshot);
  const learner = useMemo(() => parseLearner(snapshot.raw), [snapshot.raw]);
  const ready = !snapshot.pending;
  const persistent = snapshot.persistent;

  const currentLearner = useCallback(() => parseLearner(getLearnerSnapshot().raw), []);

  const answer = useCallback(
    (question: Question, raw: string, hinted: boolean) => {
      const next = recordAnswer(currentLearner(), question, raw, Date.now(), hinted);
      writeLearner(next);
      return { correct: isCorrect(question, raw), learner: next };
    },
    [currentLearner],
  );

  const place = useCallback(() => {
    writeLearner(markPlaced(currentLearner()));
  }, [currentLearner]);

  const rename = useCallback(
    (name: string) => {
      writeLearner({ ...currentLearner(), name: name.trim().slice(0, 40) });
    },
    [currentLearner],
  );

  const setGoal = useCallback(
    (dailyGoal: 5 | 10 | 15) => {
      writeLearner({ ...currentLearner(), dailyGoal });
    },
    [currentLearner],
  );

  const chooseField = useCallback(
    (fieldId: FieldId) => {
      writeLearner({ ...currentLearner(), fieldId });
    },
    [currentLearner],
  );

  const reset = useCallback(() => {
    const fresh = createLearner();
    fresh.name = currentLearner().name;
    writeLearner(fresh);
  }, [currentLearner]);

  const value = useMemo(
    () => ({ learner, ready, persistent, answer, place, rename, setGoal, chooseField, reset }),
    [learner, ready, persistent, answer, place, rename, setGoal, chooseField, reset],
  );

  return <LearnerContext.Provider value={value}>{children}</LearnerContext.Provider>;
}

export function useLearner() {
  const value = useContext(LearnerContext);
  if (!value) {
    throw new Error("useLearner pitää kutsua LearnerProviderin sisällä.");
  }
  return value;
}
