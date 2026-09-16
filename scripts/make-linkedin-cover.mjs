// Renders the LinkedIn profile cover image, one per theme.
//
// 1584x396 is LinkedIn's spec; rendered at 2x so it stays crisp when LinkedIn
// re-encodes it. The composition is the mirror of the GitHub banner on
// purpose: LinkedIn lays the profile photo over the BOTTOM-LEFT of the cover
// and crops the edges on narrow screens, so the type sits right of centre and
// vertically centred, and the constellation field takes the left instead.
//
// LinkedIn shows the name and headline directly beneath the cover, so the
// cover does not repeat them -- it carries the stack and the site instead.
//
//   node scripts/make-linkedin-cover.mjs [outDir]  -> <outDir>/linkedin-cover-{dark,light}.png
//                                                     (default public/social)
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og.js";
import { el, field, mono, palette } from "./lib/banner-kit.mjs";

// 2x of LinkedIn's 1584x396.
const W = 3168;
const H = 792;
// The type block is right-aligned; the field stops short of its longest line.
// It runs most of the way across so the cover does not read as a bright left
// edge over a dead middle -- it thins into the space beside the type.
const FIELD_RIGHT = 2060;

async function render(theme, file) {
  const { bg, fg, fgMuted, accent, lift } = palette(theme);

  const image = new ImageResponse(
    el("div", {
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingRight: 180,
        background: bg,
        fontFamily: "IBM Plex Mono",
      },
      children: [
        ...field({
          fg,
          accent,
          lift,
          region: { x0: -140, x1: FIELD_RIGHT, y0: -60, y1: H + 60 },
          flip: true,
          cols: 7,
          wash: 64,
        }),
        el("div", {
          style: { display: "flex", fontSize: 120, lineHeight: 1, color: fg },
          children: "typescript end to end",
        }),
        el("div", {
          style: { display: "flex", marginTop: 34, fontSize: 52, letterSpacing: "0.04em", color: fgMuted },
          children: "next.js · nestjs · postgres · redis",
        }),
        el("div", {
          style: { display: "flex", marginTop: 44, fontSize: 56, letterSpacing: "0.02em", color: accent },
          children: "jadebonifacio.dev",
        }),
      ],
    }),
    { width: W, height: H, fonts: [{ name: "IBM Plex Mono", data: mono, weight: 400, style: "normal" }] },
  );
  await writeFile(file, Buffer.from(await image.arrayBuffer()));
  console.log("wrote", file, `${W}x${H}`);
}

const outDir = process.argv[2] ?? path.join("public", "social");
await mkdir(outDir, { recursive: true });
await render("dark", path.join(outDir, "linkedin-cover-dark.png"));
await render("light", path.join(outDir, "linkedin-cover-light.png"));
