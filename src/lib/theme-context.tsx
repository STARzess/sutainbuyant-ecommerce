"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const KEY = "sutainbuyant.theme.v1";
const EVENT = "sutainbuyant:theme-change";
let memory: Theme | undefined;
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

function snapshot(): Theme {
  if (memory) return memory;
  try { const stored = localStorage.getItem(KEY); if (stored === "light" || stored === "dark") return stored; } catch { /* The toggle also works without browser storage. */ }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function subscribe(update: () => void) {
  const media = matchMedia("(prefers-color-scheme: dark)");
  const storage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) { memory = undefined; update(); } };
  media.addEventListener("change", update); window.addEventListener("storage", storage); window.addEventListener(EVENT, update);
  return () => { media.removeEventListener("change", update); window.removeEventListener("storage", storage); window.removeEventListener(EVENT, update); };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "light" as const);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    memory = next;
    try { localStorage.setItem(KEY, next); } catch { /* The in-memory preference remains usable. */ }
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event(EVENT));
  }
  return <ThemeContext value={{ theme, toggle }}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProvider is required");
  return context;
}

