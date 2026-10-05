import { createLearner } from "./engine";
import { sanitizeLearner } from "./storage";
import type { Learner } from "./types";

const ACCOUNTS_KEY = "virke.accounts.v1";
const SESSION_KEY = "virke.session.v1";
const ITERATIONS = 120_000;

export type PublicAccount = {
  id: string;
  username: string;
  displayName: string;
  createdAt: number;
};

type StoredAccount = PublicAccount & {
  salt: string;
  hash: string;
  iterations: number;
  learner: Learner;
};

export type AccountFile = {
  version: 1;
  accounts: StoredAccount[];
};

export type AccountSnapshot = {
  raw: string;
  sessionId: string | null;
  pending: boolean;
  persistent: boolean;
};

const SERVER_SNAPSHOT: AccountSnapshot = {
  raw: "",
  sessionId: null,
  pending: true,
  persistent: true,
};

let memory: AccountSnapshot = SERVER_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function validateDisplayName(value: string): string | null {
  const name = value.trim();
  if (name.length < 1) return "Kirjoita nimi, jonka haluat nähdä sivulla.";
  if (name.length > 40) return "Nimi on liian pitkä.";
  return null;
}

export function validateUsername(value: string): string | null {
  const username = normalizeUsername(value);
  if (!/^[a-z0-9][a-z0-9._-]{2,23}$/.test(username)) {
    return "Käyttäjätunnuksessa on 3–24 merkkiä: kirjaimia, numeroita, piste, viiva tai alaviiva.";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length < 8) return "Salasanassa on vähintään 8 merkkiä.";
  if (value.length > 72) return "Salasana on liian pitkä.";
  return null;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

function sameHash(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

export function emptyAccountFile(): AccountFile {
  return { version: 1, accounts: [] };
}

export function parseAccountFile(raw: string): AccountFile {
  if (!raw) return emptyAccountFile();
  try {
    const value = JSON.parse(raw) as Partial<AccountFile>;
    if (value.version !== 1 || !Array.isArray(value.accounts)) return emptyAccountFile();
    const accounts: StoredAccount[] = [];
    for (const item of value.accounts) {
      if (!item || typeof item.id !== "string" || typeof item.username !== "string") continue;
      if (typeof item.salt !== "string" || typeof item.hash !== "string") continue;
      const learner = sanitizeLearner(item.learner) ?? createLearner();
      accounts.push({
        id: item.id,
        username: normalizeUsername(item.username),
        displayName: typeof item.displayName === "string" ? item.displayName.trim().slice(0, 40) : item.username,
        createdAt: Number.isFinite(item.createdAt) ? Number(item.createdAt) : Date.now(),
        salt: item.salt,
        hash: item.hash,
        iterations: Number.isFinite(item.iterations) ? Number(item.iterations) : ITERATIONS,
        learner,
      });
    }
    return { version: 1, accounts };
  } catch {
    return emptyAccountFile();
  }
}

export function toPublicAccount(account: StoredAccount): PublicAccount {
  return {
    id: account.id,
    username: account.username,
    displayName: account.displayName,
    createdAt: account.createdAt,
  };
}

export async function registerInFile(
  file: AccountFile,
  input: { displayName: string; username: string; password: string; learner: Learner },
): Promise<{ ok: true; file: AccountFile; account: PublicAccount } | { ok: false; error: string }> {
  const displayError = validateDisplayName(input.displayName);
  if (displayError) return { ok: false, error: displayError };
  const usernameError = validateUsername(input.username);
  if (usernameError) return { ok: false, error: usernameError };
  const passwordError = validatePassword(input.password);
  if (passwordError) return { ok: false, error: passwordError };
  const username = normalizeUsername(input.username);
  if (file.accounts.some((account) => account.username === username)) {
    return { ok: false, error: "Tämä käyttäjätunnus on jo käytössä tällä selaimella." };
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(input.password, salt, ITERATIONS);
  const account: StoredAccount = {
    id: crypto.randomUUID(),
    username,
    displayName: input.displayName.trim().slice(0, 40),
    createdAt: Date.now(),
    salt: bytesToBase64(salt),
    hash,
    iterations: ITERATIONS,
    learner: { ...input.learner, name: input.displayName.trim().slice(0, 40) },
  };
  return {
    ok: true,
    file: { version: 1, accounts: [...file.accounts, account] },
    account: toPublicAccount(account),
  };
}

export async function matchPassword(account: StoredAccount, password: string): Promise<boolean> {
  const hash = await derive(password, base64ToBytes(account.salt), account.iterations || ITERATIONS);
  return sameHash(hash, account.hash);
}

export function subscribeAccounts(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== ACCOUNTS_KEY && event.key !== SESSION_KEY) return;
    hydrate();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function hydrate() {
  try {
    memory = {
      raw: window.localStorage.getItem(ACCOUNTS_KEY) ?? "",
      sessionId: window.localStorage.getItem(SESSION_KEY),
      pending: false,
      persistent: true,
    };
  } catch {
    memory = { raw: "", sessionId: null, pending: false, persistent: false };
  }
}

export function getAccountSnapshot(): AccountSnapshot {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    hydrate();
  }
  return memory;
}

export function getServerAccountSnapshot(): AccountSnapshot {
  return SERVER_SNAPSHOT;
}

function saveFile(file: AccountFile, sessionId: string | null): boolean {
  const raw = JSON.stringify(file);
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, raw);
    if (sessionId) window.localStorage.setItem(SESSION_KEY, sessionId);
    else window.localStorage.removeItem(SESSION_KEY);
    memory = { raw, sessionId, pending: false, persistent: true };
    emit();
    return true;
  } catch {
    memory = { raw, sessionId, pending: false, persistent: false };
    emit();
    return false;
  }
}

export function activeAccount(): StoredAccount | null {
  const snapshot = getAccountSnapshot();
  if (!snapshot.sessionId) return null;
  return parseAccountFile(snapshot.raw).accounts.find((account) => account.id === snapshot.sessionId) ?? null;
}

export async function signUp(input: {
  displayName: string;
  username: string;
  password: string;
  learner: Learner;
}): Promise<{ ok: true; account: PublicAccount } | { ok: false; error: string }> {
  const file = parseAccountFile(getAccountSnapshot().raw);
  const result = await registerInFile(file, input);
  if (!result.ok) return result;
  const saved = saveFile(result.file, result.account.id);
  if (!saved) return { ok: false, error: "Selain ei tallentanut tiliä. Tarkista, ettei yksityinen selaus estä tallennusta." };
  return { ok: true, account: result.account };
}

export async function signIn(
  username: string,
  password: string,
): Promise<{ ok: true; account: PublicAccount } | { ok: false; error: string }> {
  const usernameError = validateUsername(username);
  if (usernameError) return { ok: false, error: usernameError };
  const file = parseAccountFile(getAccountSnapshot().raw);
  const account = file.accounts.find((item) => item.username === normalizeUsername(username));
  if (!account || !(await matchPassword(account, password))) {
    return { ok: false, error: "Käyttäjätunnus tai salasana ei täsmää." };
  }
  const saved = saveFile(file, account.id);
  if (!saved) return { ok: false, error: "Selain ei avannut istuntoa." };
  return { ok: true, account: toPublicAccount(account) };
}

export function signOut() {
  const file = parseAccountFile(getAccountSnapshot().raw);
  saveFile(file, null);
}

export function writeAccountLearner(id: string, learner: Learner): boolean {
  const snapshot = getAccountSnapshot();
  const file = parseAccountFile(snapshot.raw);
  const next: AccountFile = {
    version: 1,
    accounts: file.accounts.map((account) => (account.id === id ? { ...account, learner } : account)),
  };
  return saveFile(next, snapshot.sessionId);
}

export async function deleteAccount(
  id: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const file = parseAccountFile(getAccountSnapshot().raw);
  const account = file.accounts.find((item) => item.id === id);
  if (!account) return { ok: false, error: "Tiliä ei löydy." };
  if (!(await matchPassword(account, password))) {
    return { ok: false, error: "Salasana ei täsmää, joten tiliä ei poistettu." };
  }
  const next = file.accounts.filter((item) => item.id !== id);
  const sessionId = getAccountSnapshot().sessionId === id ? null : getAccountSnapshot().sessionId;
  const saved = saveFile({ version: 1, accounts: next }, sessionId);
  if (!saved) return { ok: false, error: "Selain ei poistanut tiliä." };
  return { ok: true };
}

export function exportAccount(id: string): string | null {
  const account = parseAccountFile(getAccountSnapshot().raw).accounts.find((item) => item.id === id);
  if (!account) return null;
  return JSON.stringify({ version: 1, account }, null, 2);
}

export async function importAccount(
  raw: string,
): Promise<{ ok: true; account: PublicAccount } | { ok: false; error: string }> {
  let parsed: { version?: number; account?: StoredAccount };
  try {
    parsed = JSON.parse(raw) as { version?: number; account?: StoredAccount };
  } catch {
    return { ok: false, error: "Tiedosto ei ole Virkeen varmuuskopio." };
  }
  const account = parsed.account;
  if (parsed.version !== 1 || !account || typeof account.username !== "string" || typeof account.hash !== "string") {
    return { ok: false, error: "Varmuuskopiosta puuttuu tili." };
  }
  const file = parseAccountFile(getAccountSnapshot().raw);
  if (file.accounts.some((item) => item.username === normalizeUsername(account.username))) {
    return { ok: false, error: "Samanniminen tili on jo tällä selaimella. Poista se ensin tai palauta toisessa selaimessa." };
  }
  const stored: StoredAccount = {
    id: crypto.randomUUID(),
    username: normalizeUsername(account.username),
    displayName: typeof account.displayName === "string" ? account.displayName.trim().slice(0, 40) : account.username,
    createdAt: Date.now(),
    salt: account.salt,
    hash: account.hash,
    iterations: account.iterations || ITERATIONS,
    learner: sanitizeLearner(account.learner) ?? createLearner(),
  };
  const saved = saveFile({ version: 1, accounts: [...file.accounts, stored] }, stored.id);
  if (!saved) return { ok: false, error: "Selain ei tallentanut palautettua tiliä." };
  return { ok: true, account: toPublicAccount(stored) };
}
