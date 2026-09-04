import { parseTheme, THEME_COOKIE, type Theme } from "@/lib/theme";

/** Fired on window after the theme changes; detail is the new Theme. */
export const THEME_EVENT = "themechange";
const TRANSITION_MS = 300;
let timer: number | null = null;

/** Browser only. Sets data-theme, persists the cookie, and runs the 300ms
 *  colour transition by adding a class for its duration. */
export function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  root.dataset.theme = next;
  document.cookie = `${THEME_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  if (timer !== null) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    root.classList.remove("theme-transition");
    timer = null;
  }, TRANSITION_MS);
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: next }));
}

export function currentTheme(): Theme {
  return parseTheme(document.documentElement.dataset.theme);
}
