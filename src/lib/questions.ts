import { patternQuestions } from "./questions/patterns";
import { coreQuestions } from "./questions/core";
import { structureQuestions } from "./questions/structures";
import { FIELD_QUESTIONS } from "./questions/fields";
import { TITLE_QUESTIONS, WORD_QUESTIONS } from "./questions/generated";
import { SKILL_IDS, type Question, type SkillId } from "./types";

export const QUESTIONS: Question[] = [
  ...coreQuestions,
  ...structureQuestions,
  ...patternQuestions,
];

export const PLACEMENT_IDS = [
  "art-05",
  "pre-02",
  "past-02",
  "fut-01",
  "agr-03",
  "pro-02",
  "qua-04",
  "cmp-04",
  "prep-02",
  "cond-02",
  "mod-02",
  "wo-02",
] as const;

const byId = new Map(
  [...QUESTIONS, ...FIELD_QUESTIONS, ...TITLE_QUESTIONS, ...WORD_QUESTIONS].map((question) => [
    question.id,
    question,
  ]),
);

export function getQuestion(id: string): Question | undefined {
  return byId.get(id);
}

export function questionsForSkill(skillId: SkillId): Question[] {
  return QUESTIONS.filter((question) => question.skillId === skillId);
}

export function placementQuestions(): Question[] {
  return PLACEMENT_IDS.map((id) => {
    const question = byId.get(id);
    if (!question) {
      throw new Error(`Tasotestin tehtävä puuttuu: ${id}`);
    }
    return question;
  });
}

function assertBank(): void {
  const ids = new Set<string>();
  const skills = new Set<SkillId>();

  for (const question of QUESTIONS) {
    if (ids.has(question.id)) {
      throw new Error(`Kaksinkertainen tehtävä: ${question.id}`);
    }
    ids.add(question.id);
    skills.add(question.skillId);

    if (question.rule.trim().length < 20 || question.why.trim().length < 40) {
      throw new Error(`Selitys on liian lyhyt: ${question.id}`);
    }
    if (question.kind === "mcq") {
      if (!question.choices || question.choices.length < 3) {
        throw new Error(`Vaihtoehdot puuttuvat: ${question.id}`);
      }
      if (!question.choices.some((choice) => choice.id === question.answer)) {
        throw new Error(`Oikea vastaus ei ole vaihtoehdoissa: ${question.id}`);
      }
      const labels = new Set(question.choices.map((choice) => choice.label));
      if (labels.size !== question.choices.length) {
        throw new Error(`Sama vaihtoehto kahdesti: ${question.id}`);
      }
    }
  }

  for (const skillId of SKILL_IDS) {
    if (!skills.has(skillId)) {
      throw new Error(`Aiheelta puuttuvat tehtävät: ${skillId}`);
    }
    const count = QUESTIONS.filter((question) => question.skillId === skillId).length;
    if (count < 8) {
      throw new Error(`Aiheella ${skillId} on vain ${count} tehtävää`);
    }
  }

  placementQuestions();

  const grammarIds = new Set(QUESTIONS.map((question) => question.id));
  for (const question of FIELD_QUESTIONS) {
    if (grammarIds.has(question.id)) {
      throw new Error(`Alatehtävän tunniste on jo kielioppipankissa: ${question.id}`);
    }
  }
}

assertBank();
