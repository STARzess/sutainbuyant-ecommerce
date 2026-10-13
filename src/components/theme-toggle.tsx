"use client";

import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={theme === "light" ? "Харанхуй горимд шилжих" : "Гэрэлтэй горимд шилжих"} aria-pressed={theme === "dark"} title="Өнгөний горим">
    <svg className="theme-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z" /></svg>
    <svg className="theme-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>
  </button>;
}
