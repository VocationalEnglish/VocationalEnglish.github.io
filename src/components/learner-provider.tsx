"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import {
  activeAccount,
  deleteAccount as deleteStoredAccount,
  exportAccount as exportStoredAccount,
  getAccountSnapshot,
  getServerAccountSnapshot,
  importAccount as importStoredAccount,
  parseAccountFile,
  signIn as signInAccount,
  signOut as signOutAccount,
  signUp as signUpAccount,
  subscribeAccounts,
  toPublicAccount,
  writeAccountLearner,
  type PublicAccount,
} from "@/lib/accounts";
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
  account: PublicAccount | null;
  answer: (question: Question, raw: string, hinted: boolean) => { correct: boolean; learner: Learner };
  place: () => void;
  rename: (name: string) => void;
  setGoal: (goal: 5 | 10 | 15) => void;
  chooseField: (fieldId: FieldId) => void;
  reset: () => void;
  signUp: (input: {
    displayName: string;
    username: string;
    password: string;
    keepGuest: boolean;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  signIn: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => void;
  deleteAccount: (password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  exportAccount: () => string | null;
  importAccount: (raw: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const LearnerContext = createContext<LearnerContextValue | null>(null);

export function LearnerProvider({ children }: { children: React.ReactNode }) {
  const guestSnapshot = useSyncExternalStore(subscribeLearner, getLearnerSnapshot, getServerLearnerSnapshot);
  const accountSnapshot = useSyncExternalStore(
    subscribeAccounts,
    getAccountSnapshot,
    getServerAccountSnapshot,
  );
  const guest = useMemo(() => parseLearner(guestSnapshot.raw), [guestSnapshot.raw]);
  const account = useMemo(() => {
    if (!accountSnapshot.sessionId) return null;
    const match = parseAccountFile(accountSnapshot.raw).accounts.find(
      (item) => item.id === accountSnapshot.sessionId,
    );
    return match ? toPublicAccount(match) : null;
  }, [accountSnapshot.raw, accountSnapshot.sessionId]);
  const learner = useMemo(() => {
    if (!accountSnapshot.sessionId) return guest;
    return (
      parseAccountFile(accountSnapshot.raw).accounts.find((item) => item.id === accountSnapshot.sessionId)
        ?.learner ?? guest
    );
  }, [accountSnapshot.raw, accountSnapshot.sessionId, guest]);
  const ready = !guestSnapshot.pending && !accountSnapshot.pending;
  const persistent = account ? accountSnapshot.persistent : guestSnapshot.persistent;

  const currentLearner = useCallback(() => {
    const stored = activeAccount();
    if (stored) return stored.learner;
    return parseLearner(getLearnerSnapshot().raw);
  }, []);

  const persist = useCallback((next: Learner) => {
    const stored = activeAccount();
    if (stored) writeAccountLearner(stored.id, next);
    else writeLearner(next);
  }, []);

  const answer = useCallback(
    (question: Question, raw: string, hinted: boolean) => {
      const next = recordAnswer(currentLearner(), question, raw, Date.now(), hinted);
      persist(next);
      return { correct: isCorrect(question, raw), learner: next };
    },
    [currentLearner, persist],
  );

  const place = useCallback(() => {
    persist(markPlaced(currentLearner()));
  }, [currentLearner, persist]);

  const rename = useCallback(
    (name: string) => {
      persist({ ...currentLearner(), name: name.trim().slice(0, 40) });
    },
    [currentLearner, persist],
  );

  const setGoal = useCallback(
    (dailyGoal: 5 | 10 | 15) => {
      persist({ ...currentLearner(), dailyGoal });
    },
    [currentLearner, persist],
  );

  const chooseField = useCallback(
    (fieldId: FieldId) => {
      persist({ ...currentLearner(), fieldId });
    },
    [currentLearner, persist],
  );

  const reset = useCallback(() => {
    const fresh = createLearner();
    fresh.name = currentLearner().name;
    persist(fresh);
  }, [currentLearner, persist]);

  const signUp = useCallback(
    async (input: { displayName: string; username: string; password: string; keepGuest: boolean }) => {
      const seed = input.keepGuest ? parseLearner(getLearnerSnapshot().raw) : createLearner();
      const result = await signUpAccount({ ...input, learner: seed });
      if (result.ok && input.keepGuest) writeLearner(createLearner());
      return result.ok ? { ok: true as const } : result;
    },
    [],
  );

  const signIn = useCallback(async (username: string, password: string) => {
    const result = await signInAccount(username, password);
    return result.ok ? { ok: true as const } : result;
  }, []);

  const signOut = useCallback(() => {
    signOutAccount();
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    const stored = activeAccount();
    if (!stored) return { ok: false as const, error: "Et ole kirjautuneena." };
    return deleteStoredAccount(stored.id, password);
  }, []);

  const exportAccount = useCallback(() => {
    const stored = activeAccount();
    if (!stored) return null;
    return exportStoredAccount(stored.id);
  }, []);

  const importAccount = useCallback(async (raw: string) => {
    const result = await importStoredAccount(raw);
    return result.ok ? { ok: true as const } : result;
  }, []);

  const value = useMemo(
    () => ({
      learner,
      ready,
      persistent,
      account,
      answer,
      place,
      rename,
      setGoal,
      chooseField,
      reset,
      signUp,
      signIn,
      signOut,
      deleteAccount,
      exportAccount,
      importAccount,
    }),
    [
      learner,
      ready,
      persistent,
      account,
      answer,
      place,
      rename,
      setGoal,
      chooseField,
      reset,
      signUp,
      signIn,
      signOut,
      deleteAccount,
      exportAccount,
      importAccount,
    ],
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
