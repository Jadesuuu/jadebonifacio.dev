"use client";

import { useEffect, useRef, useState } from "react";
import { THEME_COOKIE, type Theme } from "@/lib/theme";

const TRANSITION_MS = 300;

function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  root.dataset.theme = next;
  document.cookie = `${THEME_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  return window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, TRANSITION_MS);
}

/**
 * 40x22 pill. Track is --border, thumb is --accent (one of the few sanctioned
 * accent-at-rest uses). Thumb left = dark, right = light.
 * Receives the server-resolved theme so the first render matches the cookie.
 */
export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const isLight = theme === "light";

  function toggle() {
    const next: Theme = isLight ? "dark" : "light";
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      onClick={toggle}
      className="relative h-[22px] w-10 shrink-0 rounded-full bg-border"
    >
      <span
        aria-hidden="true"
        className={[
          "absolute top-[3px] left-[3px] block size-4 rounded-full bg-accent",
          "transition-transform duration-200 ease-out-quiet motion-reduce:transition-none",
          isLight ? "translate-x-[18px]" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}
