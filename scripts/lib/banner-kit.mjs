// Shared drawing kit for the off-site banners rendered out of this repo:
// the GitHub profile README (make-profile-banner.mjs) and the LinkedIn cover
// (make-linkedin-cover.mjs).
//
// PNG rather than SVG throughout, on purpose: GitHub proxies README images
// through camo and LinkedIn re-encodes uploads, and neither will load a
// webfont, so SVG text would fall back to whatever face the reader happens to
// have. Satori rasterises the real IBM Plex Mono here, so every reader sees
// the same wordmark. Colours are read from globals.css so no hex lives in the
// callers.
import { readFile } from "node:fs/promises";

const css = await readFile("src/app/globals.css", "utf8");

/** Pull a token out of one CSS block, so dark and light each read their own rules. */
const block = (selector) => {
  const start = css.indexOf(selector);
  return css.slice(start, css.indexOf("}", start));
};

/** The two theme scopes in globals.css, as Satori-ready palettes. */
export function palette(theme) {
  const scope = theme === "light" ? String.raw`[data-theme="light"]` : ":root {";
  const rules = block(scope);
  const token = (name) => {
    const at = rules.indexOf(`--${name}:`);
    return rules.slice(at + name.length + 3).split(";")[0].trim();
  };
  return {
    bg: token("bg"),
    fg: token("fg"),
    fgMuted: token("fg-muted"),
    accent: token("accent"),
    // Dark needs the lift: bone on ink reads fainter than soot on cream.
    lift: theme === "light" ? 1 : 1.8,
  };
}

export const mono = await readFile("src/assets/fonts/IBMPlexMono-Regular.ttf");
export const el = (type, props) => ({ type, props });

/** mulberry32 -- seeded so a field is identical in both themes and across runs. */
export function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A whisper of the site's constellation, laid out beside the type rather than
 * under it.
 *
 * Constellations, not dust: dots gather around anchors, each anchor brighter
 * than its companions. Uniform scatter read as sensor noise -- but picking
 * anchors at random left dead zones, so they are stratified over a jittered
 * grid instead: local clustering, even coverage. The region is given bleeding
 * past the frame so the field is a field and not a pasted rectangle, and it
 * thins column by column as it approaches the type.
 *
 * `flip` puts the dense end on the left (LinkedIn, where the type sits right
 * and the profile photo covers the bottom-left) instead of the right (GitHub).
 */
export function field({ fg, accent, lift, region, flip = false, cols = 6, rows = 3, wash = 44 }) {
  const { x0, x1, y0, y1 } = region;
  const rand = rng(0x9a5f);
  const dots = [];

  const mote = (x, y, r, weight, isAccent) =>
    el("div", {
      style: {
        position: "absolute",
        left: Math.round(x),
        top: Math.round(y),
        width: Math.round(r),
        height: Math.round(r),
        borderRadius: 999,
        background: isAccent ? accent : fg,
        opacity: Math.min(0.42, weight * lift),
      },
    });

  const cellW = (x1 - x0) / cols;
  const cellH = (y1 - y0) / rows;

  for (let col = 0; col < cols; col++) {
    // Columns nearest the type stay sparse so the two halves read as one
    // composition instead of type sitting on scattered dust.
    const ramp = col / (cols - 1);
    const density = 0.3 + 0.7 * (flip ? 1 - ramp : ramp);
    for (let row = 0; row < rows; row++) {
      if (rand() > density) continue;
      const cx = x0 + (col + 0.15 + rand() * 0.7) * cellW;
      const cy = y0 + (row + 0.15 + rand() * 0.7) * cellH;
      const spread = 60 + rand() * 90;
      const isAccent = rand() < 0.3;

      dots.push(mote(cx, cy, 7 + rand() * 3, (0.26 + rand() * 0.08) * density, isAccent));
      const n = 6 + Math.floor(rand() * 7);
      for (let i = 0; i < n; i++) {
        // Falloff: squaring keeps most companions close to their anchor.
        const d = Math.pow(rand(), 2) * spread;
        const a = rand() * Math.PI * 2;
        dots.push(
          mote(
            cx + Math.cos(a) * d,
            cy + Math.sin(a) * d * 0.8,
            3 + rand() * 3,
            (0.1 + rand() * 0.1) * density,
            isAccent && rand() < 0.45,
          ),
        );
      }
    }
  }

  // A sparse wash between the constellations so the gaps do not read as holes.
  for (let i = 0; i < wash; i++) {
    const t = Math.pow(rand(), 0.5);
    dots.push(
      mote(
        flip ? x1 - t * (x1 - x0) : x0 + t * (x1 - x0),
        y0 + rand() * (y1 - y0),
        3 + rand() * 2,
        (0.07 + rand() * 0.05) * (0.4 + 0.6 * t),
        rand() < 0.2,
      ),
    );
  }
  return dots;
}
