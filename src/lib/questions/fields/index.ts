import { FIELDS } from "@/lib/fields";
import { FIELD_IDS, type FieldId } from "@/lib/types";
import { movementFieldQuestions } from "./movement";
import { precisionFieldQuestions } from "./precision";
import { serviceFieldQuestions } from "./service";
import { technicalFieldQuestions } from "./technical";
import type { Question } from "@/lib/types";

export const FIELD_QUESTIONS: Question[] = [
  ...technicalFieldQuestions,
  ...movementFieldQuestions,
  ...serviceFieldQuestions,
  ...precisionFieldQuestions,
];

const byField = new Map<FieldId, Question[]>();
for (const question of FIELD_QUESTIONS) {
  if (!question.fieldId) continue;
  const list = byField.get(question.fieldId) ?? [];
  list.push(question);
  byField.set(question.fieldId, list);
}

export function questionsForField(fieldId: FieldId): Question[] {
  return byField.get(fieldId) ?? [];
}

function assertFieldBank(): void {
  const ids = new Set<string>();
  const counts = new Map<FieldId, number>();

  if (FIELDS.length !== FIELD_IDS.length) {
    throw new Error("Alakuvauksia ja tunnisteita on eri määrä.");
  }

  for (const fieldId of FIELD_IDS) {
    if (!FIELDS.some((field) => field.id === fieldId)) {
      throw new Error(`Alalta puuttuu kuvaus: ${fieldId}`);
    }
  }

  for (const question of FIELD_QUESTIONS) {
    if (ids.has(question.id)) {
      throw new Error(`Kaksinkertainen alatehtävä: ${question.id}`);
    }
    ids.add(question.id);
    if (!question.fieldId) {
      throw new Error(`Alatehtävältä puuttuu ala: ${question.id}`);
    }
    counts.set(question.fieldId, (counts.get(question.fieldId) ?? 0) + 1);

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
    } else if (!question.sentence?.includes("___")) {
      throw new Error(`Aukkotehtävästä puuttuu aukko: ${question.id}`);
    }
  }

  for (const fieldId of FIELD_IDS) {
    const count = counts.get(fieldId) ?? 0;
    if (count < 6) {
      throw new Error(`Alalla ${fieldId} on vain ${count} tehtävää`);
    }
  }
}

assertFieldBank();
