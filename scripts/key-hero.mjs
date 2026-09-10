// One-off cutout prep for the home hero. sharp is a devDependency, never
// imported at runtime. Keys the white studio background out of the portrait and
// writes public/images/home/hero.png, trimmed to the silhouette.
//
//   node scripts/key-hero.mjs
//
// Not a threshold. Thresholding this JPEG leaves a bright rim around the hair
// once the cutout lands on the near-black page, which reads as a pasted-on
// cutout. The fix is to treat every edge pixel as what it physically is - a mix
// of hair and backdrop - and undo the mix:
//
//   C = a*F + (1-a)*Lbg   ->   a = (Lbg - C) / (Lbg - F),  F = (C - (1-a)*Lbg)/a
//
// So the whole job is estimating F, the true foreground colour behind each
// blended pixel. Three stages:
//
//   1. background - flood fill from the frame edges over near-white pixels, then
//      again through slightly-off-white ones to absorb JPEG noise and any
//      vignette. Flood fill rather than a global colour test is what keeps
//      interior highlights (the nose, the forehead) fully opaque.
//   2. blend band - a fixed-width DILATION of that background, not a luminance
//      cut. This matters: gating the band on brightness classifies half-covered
//      hair (which reads ~140 against white) as solid foreground, which then
//      poisons the F estimate in stage 3 and leaves exactly the grey rim this
//      script exists to avoid. Distance is the honest criterion - a pixel is
//      blended because it sits at the boundary, not because it is bright.
//   3. F per band pixel - the darkest true-core pixel nearby, sampled from
//      OUTSIDE the band so it cannot pick up a partially-covered neighbour.
//      Local, not global: at the hair F is ~30 and a half-covered pixel comes
//      out ~50% opaque, while at the shoulder F is ~60 and a fully-covered
//      pixel correctly stays opaque instead of going translucent.
//
// Safe for this photo because nothing skin-toned touches the background - the
// silhouette is hair, shoulders and chair the whole way round. A portrait with
// a bare arm or a light shirt against the backdrop would need a real matte.
import { statSync } from "node:fs";
import sharp from "sharp";

const SRC = "C:/Users/Jade/Downloads/Gemini_Generated_Image_ur9p93ur9p93ur9p.jpg";
const OUT = "public/images/home/hero.png";

const L_BG = 253; // what the backdrop reads as
const SEED_MIN = 225; // definite background: every channel at least this
const SEED_SAT = 20;
const GROW_LUM = 205; // absorbed into background: noise, vignette
const GROW_SAT = 45;
const BAND = 5; // blend band width, in pixels, around the background
const FG_RADIUS = 8; // how far to look for the true foreground colour
const FG_MAX = 140; // an F brighter than this is a bad estimate, not hair
const FG_FALLBACK = 30;
const SAT = 0.95;
const ALPHA_FEATHER = 0.6;

const { data: rgb, info } = await sharp(SRC)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const N = W * H;

const lum = new Float32Array(N);
const sat = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  const r = rgb[i * 3];
  const g = rgb[i * 3 + 1];
  const b = rgb[i * 3 + 2];
  lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  sat[i] = Math.max(r, g, b) - Math.min(r, g, b);
}

const isSeed = (i) =>
  Math.min(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]) >= SEED_MIN && sat[i] <= SEED_SAT;
const isGrow = (i) => (lum[i] >= GROW_LUM && sat[i] <= GROW_SAT) || isSeed(i);

// 4-connected flood fill, seeded from the frame edge or from a prior mask.
function fill(test, seedMask) {
  const mask = new Uint8Array(N);
  const stack = new Int32Array(N);
  let sp = 0;
  const push = (i) => {
    if (!mask[i] && test(i)) {
      mask[i] = 1;
      stack[sp++] = i;
    }
  };
  if (seedMask) {
    for (let i = 0; i < N; i++) if (seedMask[i]) push(i);
  } else {
    for (let x = 0; x < W; x++) {
      push(x);
      push((H - 1) * W + x);
    }
    for (let y = 0; y < H; y++) {
      push(y * W);
      push(y * W + W - 1);
    }
  }
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % W;
    const y = (i - x) / W;
    if (x > 0) push(i - 1);
    if (x < W - 1) push(i + 1);
    if (y > 0) push(i - W);
    if (y < H - 1) push(i + W);
  }
  return mask;
}

const bg = fill(isGrow, fill(isSeed, null));

// Stage 2: dilate the background inward by BAND pixels. Everything the wave
// touches is a boundary pixel and gets a computed alpha; everything it does not
// reach is solid subject and stays fully opaque.
const band = new Uint8Array(N);
let frontier = [];
for (let i = 0; i < N; i++) if (bg[i]) frontier.push(i);
for (let step = 0; step < BAND && frontier.length; step++) {
  const next = [];
  for (const i of frontier) {
    const x = i % W;
    const y = (i - x) / W;
    const nb = [];
    if (x > 0) nb.push(i - 1);
    if (x < W - 1) nb.push(i + 1);
    if (y > 0) nb.push(i - W);
    if (y < H - 1) nb.push(i + W);
    for (const j of nb) {
      if (!bg[j] && !band[j]) {
        band[j] = 1;
        next.push(j);
      }
    }
  }
  frontier = next;
}

// Stage 3: the true foreground colour near a band pixel. Core only - sampling
// the band itself is what produced the grey rim.
const isCore = (i) => !bg[i] && !band[i];
function localFg(x, y) {
  let min = 255;
  let found = false;
  const x0 = Math.max(0, x - FG_RADIUS);
  const x1 = Math.min(W - 1, x + FG_RADIUS);
  const y0 = Math.max(0, y - FG_RADIUS);
  const y1 = Math.min(H - 1, y + FG_RADIUS);
  for (let yy = y0; yy <= y1; yy++) {
    for (let xx = x0; xx <= x1; xx++) {
      const j = yy * W + xx;
      if (isCore(j) && lum[j] < min) {
        min = lum[j];
        found = true;
      }
    }
  }
  // An isolated flyaway strand has no core within reach; assume it is hair.
  return found ? Math.min(min, FG_MAX) : FG_FALLBACK;
}

const out = Buffer.alloc(N * 4);
let bandCount = 0;
for (let i = 0; i < N; i++) {
  let r = rgb[i * 3];
  let g = rgb[i * 3 + 1];
  let b = rgb[i * 3 + 2];
  let a;
  if (bg[i]) {
    a = 0;
    r = g = b = 0;
  } else if (band[i]) {
    bandCount++;
    const x = i % W;
    const f = localFg(x, (i - x) / W);
    a = Math.max(0, Math.min(1, (L_BG - lum[i]) / (L_BG - f)));
    if (a > 0.02) {
      const k = (1 - a) * L_BG;
      r = Math.max(0, Math.min(255, (r - k) / a));
      g = Math.max(0, Math.min(255, (g - k) / a));
      b = Math.max(0, Math.min(255, (b - k) / a));
    } else {
      a = 0;
      r = g = b = 0;
    }
    a = Math.round(a * 255);
  } else {
    a = 255;
  }
  // Saturation trim happens here rather than via sharp's modulate(): colour ops
  // premultiply, and on a freshly cut matte that corrupts the alpha channel.
  if (a > 0) {
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = l + (r - l) * SAT;
    g = l + (g - l) * SAT;
    b = l + (b - l) * SAT;
  }
  out[i * 4] = r;
  out[i * 4 + 1] = g;
  out[i * 4 + 2] = b;
  out[i * 4 + 3] = a;
}

// Feather the matte only, so the JPEG's ringing comes off the edge without
// softening the photo. toColourspace("b-w") is load-bearing: blur() on a
// 1-channel raw buffer hands back 3 channels, and indexing that as 1 channel
// scrambles the alpha into noise.
const alphaOnly = Buffer.alloc(N);
for (let i = 0; i < N; i++) alphaOnly[i] = out[i * 4 + 3];
const { data: blurred, info: blurInfo } = await sharp(alphaOnly, {
  raw: { width: W, height: H, channels: 1 },
})
  .toColourspace("b-w")
  .blur(ALPHA_FEATHER)
  .raw()
  .toBuffer({ resolveWithObject: true });
if (blurInfo.channels !== 1) throw new Error(`expected 1-channel blur, got ${blurInfo.channels}`);
for (let i = 0; i < N; i++) out[i * 4 + 3] = blurred[i];

// Trim to the silhouette. The transparent margin is ~30% of the frame width,
// and every pixel of it would otherwise eat into what next/image serves.
let minX = W;
let maxX = -1;
let minY = H;
let maxY = -1;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (out[(y * W + x) * 4 + 3] > 8) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
const bw = maxX - minX + 1;
const bh = maxY - minY + 1;

await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: minX, top: minY, width: bw, height: bh })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

// A bright pixel that is also nearly opaque, sitting on the boundary, is the
// pasted-cutout artefact. Report it rather than trusting the eye at 100%.
let edge = 0;
let rim = 0;
for (let i = 0; i < N; i++) {
  if (!band[i]) continue;
  const a = out[i * 4 + 3];
  if (a < 160) continue;
  edge++;
  if (0.2126 * out[i * 4] + 0.7152 * out[i * 4 + 1] + 0.0722 * out[i * 4 + 2] > 120) rim++;
}

console.log(`source     ${W}x${H}`);
console.log(`blend band ${bandCount} px`);
console.log(`rim check  ${rim}/${edge} near-opaque edge pixels are bright (want ~0%)`);
console.log(`trimmed    ${bw}x${bh} (dropped ${((1 - bw / W) * 100).toFixed(1)}% of width)`);
console.log(`wrote      ${OUT} (${(statSync(OUT).size / 1024).toFixed(0)}KB)`);
