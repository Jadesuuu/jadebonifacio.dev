import type { ThemeRegistrationRaw } from "shiki";

/**
 * Two custom Shiki themes built from the palette (DESIGN.md, Code block):
 * strings in --accent, keywords in --fg, comments in --fg-faint, everything
 * else in --fg-muted. The code-block background is set to --bg-subtle in CSS,
 * so the theme background only matters as a fallback. Rendered with
 * defaultColor:false, so each token carries --shiki-light and --shiki-dark and
 * globals.css switches on [data-theme].
 */
function theme(
  name: string,
  type: "light" | "dark",
  c: { bg: string; muted: string; faint: string; accent: string; fg: string },
): ThemeRegistrationRaw {
  return {
    name,
    type,
    colors: { "editor.background": c.bg, "editor.foreground": c.muted },
    settings: [
      { settings: { foreground: c.muted, background: c.bg } },
      {
        scope: ["comment", "punctuation.definition.comment"],
        settings: { foreground: c.faint, fontStyle: "italic" },
      },
      {
        scope: [
          "string",
          "string.template",
          "string.regexp",
          "constant.other.symbol",
          "punctuation.definition.string",
        ],
        settings: { foreground: c.accent },
      },
      {
        scope: [
          "keyword",
          "keyword.control",
          "keyword.operator.new",
          "keyword.operator.expression",
          "storage",
          "storage.type",
          "storage.modifier",
          "constant.language",
          "variable.language",
          "support.type.primitive",
          "entity.name.tag",
        ],
        settings: { foreground: c.fg },
      },
    ],
  };
}

export const shikiDark = theme("jb-dark", "dark", {
  bg: "#18181A",
  muted: "#9A9890",
  faint: "#5E5D58",
  accent: "#C9A961",
  fg: "#ECEAE4",
});

export const shikiLight = theme("jb-light", "light", {
  bg: "#EAE7DF",
  muted: "#66645E",
  faint: "#9A978F",
  accent: "#9C7C3A",
  fg: "#1A1917",
});

/** Options for @shikijs/rehype. Dual theme, switched by [data-theme] in CSS. */
export const rehypeShikiOptions = {
  themes: { light: shikiLight, dark: shikiDark },
  defaultColor: false as const,
};
