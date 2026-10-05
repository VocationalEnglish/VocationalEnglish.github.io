import { task } from "./field-pack";
import { TRADE } from "@/lib/trade";
import { FIELD_IDS, type FieldId, type Question } from "@/lib/types";

const CHOICE_IDS = ["a", "b", "c", "d"] as const;

function rotate<T>(items: T[], start: number, count: number): T[] {
  if (!items.length) return [];
  const picked: T[] = [];
  for (let step = 0; picked.length < count && step < items.length * 2; step += 1) {
    const item = items[(start + step) % items.length];
    if (!picked.includes(item)) picked.push(item);
  }
  return picked;
}

function choices(correct: string, wrong: string[], notes: Map<string, string>) {
  const labels = [correct, ...wrong];
  return labels.map((label, index) => ({
    id: CHOICE_IDS[index],
    label,
    note: notes.get(label),
  }));
}

function titleQuestions(fieldId: FieldId): Question[] {
  const pack = TRADE[fieldId];
  const titles = pack.occupations.map((item) => item.en);
  return pack.occupations.map((occupation, index) => {
    const wrong = rotate(
      titles.filter((title) => title !== occupation.en),
      index,
      3,
    );
    const notes = new Map<string, string>();
    for (const item of pack.occupations) {
      notes.set(item.en, item.official ? "Tutkintonimike." : "Työpaikalla käytetty nimike.");
    }
    notes.set(occupation.en, occupation.official ? "Tämä on tutkintonimikkeen vastine." : "Näin ammatti sanotaan työssä.");
    return task({
      id: `title-${fieldId}-${index + 1}`,
      fieldId,
      track: "titles",
      skillId: "articles",
      difficulty: 2,
      level: "A2",
      prompt: `Mikä on ammattinimike «${occupation.fi}» englanniksi?`,
      choices: choices(occupation.en, wrong, notes),
      answer: "a",
      rule: occupation.official
        ? "Tutkintonimike tulee Opintopolun englanninkielisestä nimikeluettelosta."
        : "Työpaikan nimike voi erota tutkintonimikkeestä. Käytä sitä sanaa, jonka kollega ymmärtää.",
      why: `${occupation.fi} on englanniksi ${occupation.en}. ${occupation.does}`,
      example: `The English title is ${occupation.en}.`,
      trap: occupation.official
        ? "Älä käännä tutkintonimikettä sanasta sanaan, jos luettelossa on vakiintunut vastine."
        : "Tarkista, onko vieressä oleva sana tutkintonimike vai työmaasana.",
    });
  });
}

function wordQuestions(fieldId: FieldId): Question[] {
  const pack = TRADE[fieldId];
  const words = pack.terms.map((item) => item.en);
  return pack.terms.map((term, index) => {
    const wrong = rotate(
      words.filter((word) => word !== term.en),
      index,
      3,
    );
    const notes = new Map<string, string>();
    for (const item of pack.terms) notes.set(item.en, item.fi);
    return task({
      id: `word-${fieldId}-${index + 1}`,
      fieldId,
      track: "words",
      skillId: "articles",
      difficulty: 2,
      level: "A2",
      prompt: `Miten sanot työn puolesta sanan «${term.fi}»?`,
      choices: choices(term.en, wrong, notes),
      answer: "a",
      rule: "Alan sana opetellaan parina: suomi ja se englanti, jota työpaikalla käytetään.",
      why: `${term.fi} on englanniksi ${term.en}. Sana kuuluu ryhmään ${term.group}.`,
      example: `Please check the ${term.en}.`,
      trap: "Vierusvaihtoehdot ovat saman alan sanoja. Merkitys ratkaisee, ei se, mikä kuulostaa tutulta.",
    });
  });
}

export const TITLE_QUESTIONS: Question[] = FIELD_IDS.flatMap((fieldId) => titleQuestions(fieldId));
export const WORD_QUESTIONS: Question[] = FIELD_IDS.flatMap((fieldId) => wordQuestions(fieldId));

const titleByField = new Map<FieldId, Question[]>();
const wordByField = new Map<FieldId, Question[]>();
for (const question of TITLE_QUESTIONS) {
  if (!question.fieldId) continue;
  const list = titleByField.get(question.fieldId) ?? [];
  list.push(question);
  titleByField.set(question.fieldId, list);
}
for (const question of WORD_QUESTIONS) {
  if (!question.fieldId) continue;
  const list = wordByField.get(question.fieldId) ?? [];
  list.push(question);
  wordByField.set(question.fieldId, list);
}

export function titleQuestionsFor(fieldId: FieldId): Question[] {
  return titleByField.get(fieldId) ?? [];
}

export function wordQuestionsFor(fieldId: FieldId): Question[] {
  return wordByField.get(fieldId) ?? [];
}

function assertGenerated(): void {
  const ids = new Set<string>();
  for (const question of [...TITLE_QUESTIONS, ...WORD_QUESTIONS]) {
    if (ids.has(question.id)) throw new Error(`Kaksinkertainen harjoitus: ${question.id}`);
    ids.add(question.id);
    if (question.kind !== "mcq" || question.answer !== "a") {
      throw new Error(`Harjoituksen muoto on väärä: ${question.id}`);
    }
    const labels = question.choices?.map((choice) => choice.label) ?? [];
    if (new Set(labels).size !== labels.length) {
      throw new Error(`Sama vaihtoehto kahdesti: ${question.id}`);
    }
  }
}

assertGenerated();
