// One-off image prep for the case studies. sharp is a devDependency, never
// imported at runtime. Reads the raw captures, writes optimised web PNGs into
// public/images/work/<slug>/ (next/image serves WebP from these at runtime),
// builds 720x480 homepage thumbnails, and composes the 2x2 themes grid.
//
//   node scripts/prepare-work-images.mjs
//
// Sources are the raw screenshots; edit SOURCES if the raws move.
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PICTURES = "C:/Users/Jade/Pictures/Screenshots";
const SB = "content/screenshots/Scoutboard";
const OUT = "public/images/work";

// --bg (dark, the default theme) for the themes-grid gap.
const BG = "#0e0e0f";
const MAX_W = 1680; // DESIGN.md: case study images up to 1680px wide.

// A source that no longer exists (raws consumed into public/) is skipped, so
// re-running keeps the already-optimised image in place.
const SOURCES = {
  "jf-and-the-world": {
    hero: `${PICTURES}/Screenshot 2026-09-05 233226.png`, // Dreaming tab, globe + dream pins
    lived: `${PICTURES}/Screenshot 2026-09-05 233427.png`, // Lived tab, memories with photos
  },
  scoutboard: {
    hero: `${SB}/Screenshot 2026-09-05 225015.png`, // consumed; kept in public/
    "ai-analyst": `${PICTURES}/Screenshot 2026-09-06 000435.png`, // listing + AI analysis
  },
};

// Dream, Night, Galaxy, Paper — reading order for the 2x2 grid.
const THEMES = [
  `${PICTURES}/Screenshot 2026-09-05 225800.png`, // Dream (sage)
  `${PICTURES}/Screenshot 2026-09-05 225809.png`, // Night (midnight blue)
  `${PICTURES}/Screenshot 2026-09-05 225731.png`, // Galaxy (Earth at night)
  `${PICTURES}/Screenshot 2026-09-05 225815.png`, // Paper (beige notebook)
];

const manifest = {};

async function optimizePng(input, outFile) {
  const buf = await sharp(input)
    .resize(MAX_W, null, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(outFile, buf);
  const { width, height } = await sharp(buf).metadata();
  return { width, height, bytes: buf.length };
}

async function thumbnail(input, outFile) {
  // 720x480 = 2x of the 360x240 homepage slot, centre-cropped.
  const buf = await sharp(input)
    .resize(720, 480, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(outFile, buf);
  return { width: 720, height: 480, bytes: buf.length };
}

async function composeThemes(outFile) {
  const cellW = Math.floor((MAX_W - 16) / 2); // 832
  const cellH = Math.round(cellW * (1317 / 2514)); // keep capture aspect
  const cells = await Promise.all(
    THEMES.map((t) =>
      sharp(t).resize(cellW, cellH, { fit: "cover", position: "centre" }).toBuffer(),
    ),
  );
  const gridW = cellW * 2 + 16;
  const gridH = cellH * 2 + 16;
  const buf = await sharp({
    create: { width: gridW, height: gridH, channels: 3, background: BG },
  })
    .composite([
      { input: cells[0], left: 0, top: 0 },
      { input: cells[1], left: cellW + 16, top: 0 },
      { input: cells[2], left: 0, top: cellH + 16 },
      { input: cells[3], left: cellW + 16, top: cellH + 16 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(outFile, buf);
  return { width: gridW, height: gridH, bytes: buf.length };
}

for (const [slug, views] of Object.entries(SOURCES)) {
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });
  manifest[slug] = {};
  for (const [view, src] of Object.entries(views)) {
    if (!existsSync(src)) {
      console.log(`skip ${slug}/${view} (source gone, keeping existing image)`);
      continue;
    }
    const info = await optimizePng(src, path.join(dir, `${view}.png`));
    manifest[slug][view] = { src: `/images/work/${slug}/${view}.png`, ...info };
  }
  // Homepage thumbnail from the hero capture, when the hero source is present.
  if (existsSync(views.hero)) {
    const thumb = await thumbnail(views.hero, path.join(dir, "thumbnail.png"));
    manifest[slug].thumbnail = { src: `/images/work/${slug}/thumbnail.png`, ...thumb };
  }
}

// JF themes grid.
const themes = await composeThemes(path.join(OUT, "jf-and-the-world", "themes.png"));
manifest["jf-and-the-world"].themes = {
  src: "/images/work/jf-and-the-world/themes.png",
  ...themes,
};

for (const [slug, views] of Object.entries(manifest)) {
  for (const [view, info] of Object.entries(views)) {
    console.log(
      `${slug}/${view}`.padEnd(34),
      `${info.width}x${info.height}`.padEnd(11),
      `${(info.bytes / 1024).toFixed(0)} KB`,
    );
  }
}
