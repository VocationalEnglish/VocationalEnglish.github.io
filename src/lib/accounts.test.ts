import assert from "node:assert/strict";
import test from "node:test";
import { createLearner } from "./engine";
import { matchPassword, parseAccountFile, registerInFile, validatePassword, validateUsername } from "./accounts";
import { getTrade } from "./trade";

test("official titles keep the Opintopolku English equivalent", () => {
  const pairs: Array<[Parameters<typeof getTrade>[0], string, string]> = [
    ["construction", "Talonrakentaja", "Building Constructor"],
    ["care", "Lähihoitaja", "Practical Nurse"],
    ["electrical", "Sähköasentaja", "Electrician"],
    ["ict", "Ohjelmistokehittäjä", "Software Developer"],
    ["restaurant", "Kokki", "Cook"],
    ["logistics", "Kuorma-autonkuljettaja", "Lorry Driver"],
    ["automotive", "Automekaanikko", "Vehicle Mechanic"],
    ["beauty", "Parturi-kampaaja", "Hairdresser"],
  ];
  for (const [fieldId, finnish, english] of pairs) {
    const occupation = getTrade(fieldId).occupations.find((item) => item.fi === finnish);
    assert.ok(occupation, `${fieldId} ${finnish}`);
    assert.equal(occupation.en, english);
    assert.equal(occupation.official, true);
  }
  const chef = getTrade("restaurant").occupations.find((item) => item.en === "Chef");
  assert.equal(chef, undefined);
});

test("username and password rules reject short values", () => {
  assert.equal(validateUsername("ab"), "Käyttäjätunnuksessa on 3–24 merkkiä: kirjaimia, numeroita, piste, viiva tai alaviiva.");
  assert.equal(validateUsername("aino"), null);
  assert.ok(validatePassword("short"));
  assert.equal(validatePassword("salasana"), null);
});

test("a local account stores a hash and rejects a duplicate username or a wrong password", async () => {
  const learner = createLearner();
  learner.fieldId = "construction";
  const created = await registerInFile(
    { version: 1, accounts: [] },
    { displayName: "Aino", username: "Aino", password: "salasana1", learner },
  );
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.account.username, "aino");
  assert.equal(created.file.accounts[0]?.learner.fieldId, "construction");
  assert.notEqual(created.file.accounts[0]?.hash, "salasana1");
  assert.equal(await matchPassword(created.file.accounts[0], "salasana1"), true);
  assert.equal(await matchPassword(created.file.accounts[0], "vaara-salasana"), false);

  const duplicate = await registerInFile(created.file, {
    displayName: "Toinen",
    username: "aino",
    password: "salasana2",
    learner: createLearner(),
  });
  assert.equal(duplicate.ok, false);
});

test("a restored account keeps its saved iteration count", () => {
  const raw = JSON.stringify({
    version: 1,
    accounts: [
      {
        id: "acc-1",
        username: "Matti",
        displayName: "Matti",
        createdAt: 10,
        salt: "c2FsdA==",
        hash: "aGFzaA==",
        iterations: 1000,
        learner: createLearner(),
      },
    ],
  });
  const parsed = parseAccountFile(raw);
  assert.equal(parsed.accounts[0]?.username, "matti");
  assert.equal(parsed.accounts[0]?.iterations, 1000);
});
