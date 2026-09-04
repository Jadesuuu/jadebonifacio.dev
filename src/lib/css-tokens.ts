import { readFile } from "node:fs/promises";
import path from "node:path";

type ThemeName = "dark" | "light";

/**
 * Reads colour tokens out of globals.css for server-side image generation
 * (favicon, OG images), where CSS variables are not available. Keeps
 * globals.css as the only place a hex value lives.
 */
export async function getColorTokens(theme: ThemeName = "dark"): Promise<Record<string, string>> {
  const css = await readFile(path.join(process.cwd(), "src/app/globals.css"), "utf8");
  const selector = theme === "dark" ? ":root" : '[data-theme="light"]';
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`css-tokens: no ${selector} block in globals.css`);
  const block = css.slice(start, css.indexOf("}", start));

  const tokens: Record<string, string> = {};
  for (const match of block.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
