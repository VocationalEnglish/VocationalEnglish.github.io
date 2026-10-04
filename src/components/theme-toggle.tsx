"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";

const THEME_KEY = "virke.theme";
const THEME_EVENT = "virke-theme";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(THEME_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function snapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function serverSnapshot(): "light" | "dark" {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const dark = theme === "dark";

  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored !== "dark" && stored !== "light") return;
      document.documentElement.classList.toggle("dark", stored === "dark");
      window.dispatchEvent(new Event(THEME_EVENT));
    } catch {
      // Storage can be blocked. The inline script already applied a saved theme.
    }
  }, []);

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // The class still changes for this visit.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Vaihda vaaleaan teemaan" : "Vaihda tummaan teemaan"}
      className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground ring-1 ring-border transition hover:bg-muted hover:text-foreground"
    >
      {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </button>
  );
}
