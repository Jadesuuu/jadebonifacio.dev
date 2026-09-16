// Renders the banner at the top of the GitHub profile README (Jadesuuu/Jadesuuu)
// as PNGs -- one per theme, swapped by <picture> on the reader's GitHub theme.
//
// Rendered at 2x and displayed at 1200 wide, so it stays crisp on retina.
// See lib/banner-kit.mjs for why these are PNGs and where the colours come from.
//
//   node scripts/make-profile-banner.mjs [outDir]   -> <outDir>/banner-{dark,light}.png
//                                                      (default ../Jadesuuu/assets)
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og.js";
import { el, field, mono, palette } from "./lib/banner-kit.mjs";

// 2x. Displayed at 1200x240 in the README.
const W = 2400;
const H = 480;
// The type block is left-aligned; the field starts right of its longest line.
const FIELD_LEFT = 1140;

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
        justifyContent: "center",
        paddingLeft: 128,
        background: bg,
        fontFamily: "IBM Plex Mono",
      },
      children: [
        ...field({
          fg,
          accent,
          lift,
          region: { x0: FIELD_LEFT, x1: W + 100, y0: -40, y1: H + 40 },
        }),
        el("div", {
          style: { display: "flex", alignItems: "baseline", fontSize: 112, lineHeight: 1, color: fg },
          children: [
            el("span", { children: "jade bonifacio" }),
            // The underscore from the jb_ mark, so the banner and the avatar agree.
            el("span", { style: { color: accent }, children: "_" }),
          ],
        }),
        el("div", {
          style: {
            display: "flex",
            marginTop: 30,
            fontSize: 44,
            letterSpacing: "0.04em",
            color: fgMuted,
          },
          children: "full-stack engineer · typescript end to end · philippines",
        }),
      ],
    }),
    { width: W, height: H, fonts: [{ name: "IBM Plex Mono", data: mono, weight: 400, style: "normal" }] },
  );
  await writeFile(file, Buffer.from(await image.arrayBuffer()));
  console.log("wrote", file, `${W}x${H}`);
}

const outDir = process.argv[2] ?? path.join("..", "Jadesuuu", "assets");
await mkdir(outDir, { recursive: true });
await render("dark", path.join(outDir, "banner-dark.png"));
await render("light", path.join(outDir, "banner-light.png"));
