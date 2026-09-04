// Renders the "jb_" mark as transparent PNGs: "jb" in the site's dark --bg,
// the underscore in --accent, Geist Mono Bold so it reads at any size.
// Colours are read from globals.css so no hex lives here.
//
//   node scripts/make-logo.mjs        -> public/logo.png (wide), public/avatar.png (square,
//                                        transparent), public/avatar-dark.png (square, filled)
//   node scripts/make-logo.mjs <dir>  -> also copies them into <dir> as jb-logo.png,
//                                        jb-avatar.png, jb-avatar-github.png
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og.js";

const css = await readFile("src/app/globals.css", "utf8");
const rootStart = css.indexOf(":root {");
const root = css.slice(rootStart, css.indexOf("}", rootStart));
const token = (name) => root.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`))[1];

const font = await readFile("src/assets/fonts/GeistMono-Bold.ttf");
const el = (type, props) => ({ type, props });

async function render({ width, height, fontSize, file, filled = false }) {
  const image = new ImageResponse(
    el("div", {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Geist Mono",
        fontSize,
        fontWeight: 700,
        letterSpacing: "0.02em",
        lineHeight: 1,
        // Transparent: dark letters. Filled: dark ground, light letters.
        background: filled ? token("bg") : "transparent",
        color: filled ? token("fg") : token("bg"),
        // Optical centre: pull the x-height band up a little since "jb_" has
        // a descender and the underscore sits below the baseline.
        paddingBottom: Math.round(fontSize * 0.14),
      },
      children: [
        el("span", { children: "jb" }),
        el("span", { style: { color: token("accent") }, children: "_" }),
      ],
    }),
    { width, height, fonts: [{ name: "Geist Mono", data: font, weight: 700, style: "normal" }] },
  );
  await writeFile(file, Buffer.from(await image.arrayBuffer()));
  console.log("wrote", file, `${width}x${height}`);
}

await render({ width: 1200, height: 600, fontSize: 440, file: "public/logo.png" });
// Square, glyphs sized to survive a circular crop (GitHub, Gmail).
await render({ width: 1024, height: 1024, fontSize: 400, file: "public/avatar.png" });
// Filled square for places that switch between light and dark themes (GitHub).
await render({ width: 1024, height: 1024, fontSize: 400, file: "public/avatar-dark.png", filled: true });

const outDir = process.argv[2];
if (outDir) {
  await mkdir(outDir, { recursive: true });
  await copyFile("public/logo.png", path.join(outDir, "jb-logo.png"));
  await copyFile("public/avatar.png", path.join(outDir, "jb-avatar.png"));
  await copyFile("public/avatar-dark.png", path.join(outDir, "jb-avatar-github.png"));
  console.log("copied to", outDir);
}
