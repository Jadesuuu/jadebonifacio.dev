export type Theme = "dark" | "light";

export const THEME_COOKIE = "theme";
export const DEFAULT_THEME: Theme = "dark";

/**
 * Anything that is not exactly "light" is dark. Dark is the default for every
 * first visit, regardless of prefers-color-scheme (DESIGN.md, Accessibility).
 */
export function parseTheme(value: string | undefined | null): Theme {
  return value === "light" ? "light" : DEFAULT_THEME;
}
