"use client";

import { useEffect, useState } from "react";
import { applyTheme, THEME_EVENT } from "@/lib/apply-theme";
import type { Theme } from "@/lib/theme";

/**
 * 40x22 pill. Track is --border, thumb is --accent (one of the few sanctioned
 * accent-at-rest uses). Thumb right = dark, left = light (per the design).
 * Receives the server-resolved theme so the first render matches the cookie,
 * and follows changes made elsewhere (the command palette) via THEME_EVENT.
 */
export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const onChange = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  const isLight = theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      onClick={() => applyTheme(isLight ? "dark" : "light")}
      className="relative h-[22px] w-10 shrink-0 rounded-full bg-border"
    >
      <span
        aria-hidden="true"
        className={[
          "absolute top-[3px] left-[3px] block size-4 rounded-full bg-accent",
          "transition-transform duration-300 ease-out-quiet motion-reduce:transition-none",
          isLight ? "translate-x-0" : "translate-x-[18px]",
        ].join(" ")}
      />
    </button>
  );
}
