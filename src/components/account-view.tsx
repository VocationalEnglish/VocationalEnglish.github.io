"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLearner } from "@/components/learner-provider";

export function AccountView() {
  const { ready, account, learner, signUp, signIn, signOut, deleteAccount, exportAccount, importAccount } =
    useLearner();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keepGuest, setKeepGuest] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  if (!ready) return <div className="h-64 animate-pulse rounded-md bg-muted" />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const result =
      mode === "signup"
        ? await signUp({ displayName, username, password, keepGuest })
        : await signIn(username, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPassword("");
    setNotice(mode === "signup" ? "Tili on luotu ja olet kirjautuneena." : "Olet kirjautuneena.");
  }

  function download() {
    const raw = exportAccount();
    if (!raw || !account) return;
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `virke-${account.username}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Varmuuskopio latautui. Salasana ei ole tiedostossa selkokielisenä, mutta älä jaa tiedostoa.");
  }

  async function onImport(file: File | undefined) {
    if (!file) return;
    setError("");
    setNotice("");
    const raw = await file.text();
    const result = await importAccount(raw);
    if (!result.ok) setError(result.error);
    else setNotice("Varmuuskopio palautettiin ja tili avattiin.");
  }

  async function onDelete(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await deleteAccount(deletePassword);
    setBusy(false);
    if (!result.ok) setError(result.error);
    else {
      setDeletePassword("");
      setNotice("Tili poistettiin tästä selaimesta.");
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-xl gap-6">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Tili</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Oma edistyminen</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Tili tallentuu tähän selaimeen, ei palvelimelle. Samalla koneella jokainen opiskelija kirjautuu omilla tunnuksillaan. Jos vaihdat konetta, lataa varmuuskopio ja palauta se siellä.
        </p>
      </div>

      {account ? (
        <Card>
          <CardContent className="grid gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Kirjautuneena</p>
              <p className="font-serif text-3xl">{account.displayName}</p>
              <p className="text-sm text-muted-foreground">@{account.username}</p>
            </div>
            <p className="text-sm leading-6">
              Vastauksia tallessa {learner.attempts.length}. Ala ja kielioppi kulkevat tämän tilin mukana.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={download}>
                Lataa varmuuskopio
              </Button>
              <Button type="button" variant="outline" onClick={signOut}>
                Kirjaudu ulos
              </Button>
            </div>
            <form
              className="grid gap-2 border-t border-border pt-4"
              onSubmit={(event) => {
                void onDelete(event);
              }}
            >
              <label htmlFor="poista-salasana" className="text-sm font-medium">
                Poista tili tästä selaimesta
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="poista-salasana"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Salasana"
                />
                <Button type="submit" variant="destructive" disabled={busy}>
                  Poista
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="grid gap-4">
            <div className="flex gap-2">
              <Button type="button" variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>
                Luo tili
              </Button>
              <Button type="button" variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>
                Kirjaudu
              </Button>
            </div>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                void onSubmit(event);
              }}
            >
              {mode === "signup" && (
                <label className="grid gap-1 text-sm" htmlFor="nimi">
                  Nimi
                  <Input
                    id="nimi"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    autoComplete="nickname"
                    maxLength={40}
                  />
                </label>
              )}
              <label className="grid gap-1 text-sm" htmlFor="tunnus">
                Käyttäjätunnus
                <Input
                  id="tunnus"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </label>
              <label className="grid gap-1 text-sm" htmlFor="salasana">
                Salasana
                <Input
                  id="salasana"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </label>
              {mode === "signup" && learner.attempts.length > 0 && (
                <label className="flex items-start gap-2 text-sm leading-6">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={keepGuest}
                    onChange={(event) => setKeepGuest(event.target.checked)}
                  />
                  Siirrä tämän käynnin {learner.attempts.length} vastausta uudelle tilille.
                </label>
              )}
              <Button type="submit" disabled={busy}>
                {mode === "signup" ? "Luo tili" : "Kirjaudu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="grid gap-3">
          <h2 className="font-serif text-2xl">Palauta varmuuskopio</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Avaa toisella koneella lataamasi json-tiedosto. Palautus avaa tilin tähän selaimeen.
          </p>
          <Input
            type="file"
            accept="application/json,.json"
            aria-label="Varmuuskopiotiedosto"
            onChange={(event) => {
              void onImport(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-md bg-accent px-4 py-3 text-sm text-accent-foreground" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
