"use client";

import { useEffect, useState } from "react";
import { applyTheme, currentTheme, THEME_EVENT } from "@/lib/apply-theme";
import { DEFAULT_THEME, type Theme } from "@/lib/theme";

/**
 * 40x22 pill. Track is --border, thumb is --accent (one of the few sanctioned
 * accent-at-rest uses). Thumb right = dark, left = light (per the design).
 *
 * The page is static, so the server always renders the dark default. The
 * pre-paint script in the root layout has already set <html data-theme> from
 * the cookie by the time this mounts; we read it back on mount and skip the
 * thumb transition for that one sync so a light-theme visitor sees the thumb
 * in place, not sliding. Follows changes made elsewhere (the command palette)
 * via THEME_EVENT.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    // Enable the transition only after the initial sync has painted.
    const id = window.requestAnimationFrame(() => setSynced(true));
    const onChange = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener(THEME_EVENT, onChange);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener(THEME_EVENT, onChange);
    };
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
          synced ? "transition-transform duration-300 ease-out-quiet motion-reduce:transition-none" : "",
          isLight ? "translate-x-0" : "translate-x-[18px]",
        ].join(" ")}
      />
    </button>
  );
}
