import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSession,
  createLearner,
  estimateLevel,
  filledSentence,
  isCorrect,
  nextMastery,
  normalizeAnswer,
  recordAnswer,
  reviewQuestions,
} from "./engine";
import { getQuestion, QUESTIONS } from "./questions";
import { SKILL_IDS } from "./types";

test("normalizes contractions and trailing punctuation", () => {
  assert.equal(normalizeAnswer("  Don’t   like. "), "don't like");
  assert.equal(normalizeAnswer("Have not "), "have not");
});

test("grades cloze alternatives and multiple choice", () => {
  const cloze = QUESTIONS.find((question) => question.id === "pre-03");
  const mcq = QUESTIONS.find((question) => question.id === "art-01");
  assert.ok(cloze && mcq);
  assert.equal(isCorrect(cloze, "do not like"), true);
  assert.equal(isCorrect(cloze, "don't like"), true);
  assert.equal(isCorrect(cloze, "doesn't like"), false);
  assert.equal(isCorrect(mcq, "a"), true);
  assert.equal(isCorrect(mcq, "an"), false);
});

test("fills a zero article without a double space", () => {
  const school = getQuestion("art-07");
  assert.ok(school);
  assert.equal(filledSentence(school), "The children go to school by bus.");
});

test("mastery rises on a correct answer and falls more on an easy miss", () => {
  const correct = nextMastery(0.4, true, 4, false);
  const hinted = nextMastery(0.4, true, 4, true);
  const easyMiss = nextMastery(0.4, false, 1, false);
  const hardMiss = nextMastery(0.4, false, 5, false);
  assert.ok(correct > 0.4);
  assert.ok(hinted > 0.4 && hinted < correct);
  assert.ok(easyMiss < hardMiss && hardMiss < 0.4);
});

test("records a streak across consecutive days and resets after a gap", () => {
  const first = new Date("2026-03-01T10:00:00").getTime();
  const second = new Date("2026-03-01T18:00:00").getTime();
  const nextDay = new Date("2026-03-02T09:00:00").getTime();
  const later = new Date("2026-03-05T09:00:00").getTime();
  const question = getQuestion("art-01");
  const other = getQuestion("art-02");
  assert.ok(question && other);

  let learner = createLearner(first);
  learner = recordAnswer(learner, question, "a", first, false);
  assert.equal(learner.streak, 1);
  learner = recordAnswer(learner, other, "an", second, false);
  assert.equal(learner.streak, 1);
  learner = recordAnswer(learner, question, "a", nextDay, false);
  assert.equal(learner.streak, 2);
  learner = recordAnswer(learner, question, "the", later, false);
  assert.equal(learner.streak, 1);
  assert.equal(learner.bestStreak, 2);
  assert.equal(learner.skills.articles?.wrong, 1);
});

test("placement covers every skill once", () => {
  const session = buildSession(createLearner(), { type: "placement" }, () => 0.2);
  assert.equal(session.length, SKILL_IDS.length);
  assert.deepEqual(
    session.map((item) => item.question.skillId).sort(),
    [...SKILL_IDS].sort(),
  );
});

test("topic session stays inside the skill and does not repeat", () => {
  const session = buildSession(createLearner(), { type: "topic", skillId: "articles" }, () => 0.4);
  assert.equal(session.length, 8);
  assert.ok(session.every((item) => item.question.skillId === "articles"));
  assert.equal(new Set(session.map((item) => item.question.id)).size, 8);
});

test("review keeps only the latest miss", () => {
  const missed = getQuestion("mod-03");
  const fixed = getQuestion("mod-04");
  assert.ok(missed && fixed);
  let learner = createLearner();
  learner = recordAnswer(learner, missed, "don't-have-to", Date.now(), false);
  learner = recordAnswer(learner, fixed, "mustn't", Date.now(), false);
  learner = recordAnswer(learner, fixed, "don't-have-to", Date.now() + 1, false);
  const review = reviewQuestions(learner);
  assert.deepEqual(
    review.map((question) => question.id),
    ["mod-03"],
  );
});

test("level follows difficulty, not a handful of easy answers", () => {
  let learner = createLearner();
  assert.equal(estimateLevel(learner).code, null);
  const easy = getQuestion("agr-01");
  const mid = getQuestion("art-04");
  assert.ok(easy && mid && easy.difficulty === 1 && mid.difficulty === 3);

  for (let index = 0; index < 4; index += 1) {
    learner = recordAnswer(learner, easy, "is", Date.now() + index, false);
  }
  assert.equal(estimateLevel(learner).code, "A1");

  learner = createLearner();
  const placed = buildSession(learner, { type: "placement" }, () => 0);
  for (const [index, item] of placed.entries()) {
    learner = recordAnswer(learner, item.question, item.question.answer, Date.now() + index, false);
  }
  assert.equal(estimateLevel(learner).code, "A2");

  for (let index = 0; index < 3; index += 1) {
    learner = recordAnswer(learner, mid, "a", Date.now() + 20 + index, false);
  }
  assert.equal(estimateLevel(learner).code, "B1");
});
