"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * The home hero: one portrait, two renderings, one person.
 *
 * A single canvas paints both renderings. On load a halftone sampled from the
 * cutout portrait gathers from a wide region around it, orbiting in like
 * dust into a planet (once, ~1.9s), then
 * the photograph RESOLVES up through it over 700ms: the digital assembles into
 * the human, one person made literal. At rest the visitor sees the face with
 * a whisper of the lattice over it — the signature, not the subject — in the
 * same brass-and-ink grammar as the constellation and the About particle
 * cloud.
 *
 * Interaction is a lens, not a switch. Wherever the pointer goes, a soft
 * ~200px window opens where the photograph gives way to the dots — the
 * visitor sweeps the face into halftone and it heals behind them. Leaving
 * closes the lens; the face is whole again. A press (any pointer) is a
 * droplet on still water: three rings leave the point of contact, each
 * fainter than the last, nudging the dots on springs as they pass — so touch
 * has the same material in hand without a hover.
 *
 * Reduced motion: the photograph only, no canvas, no load-in. Rendering
 * pauses while the hero is off-screen and drops to half rate at rest.
 *
 * The portrait is a placeholder cutout (see PRODUCT.md); re-keying it via
 * scripts/key-hero.mjs changes nothing here — the cloud is sampled at runtime.
 */

const SRC = "/images/home/hero.png";
const SRC_W = 962;
const SRC_H = 768;

/** Sampling grid over the source image. A halftone: every opaque cell keeps a
 *  point and tone lives in the dot's size and alpha, never in whether it
 *  exists — that is what lets a face read at a few thousand points. Every
 *  cell also carries a silhouette floor, a dim small dot, so hair and
 *  shoulders draw the head's outline instead of vanishing into the ground; the
 *  human silhouette is the strongest recognition cue there is. A Sobel edge
 *  boost draws the contours (hairline, jaw, eye sockets, the hand).
 *
 *  Tone is mapped per theme at draw time: on the dark ground light areas get
 *  the big dots (points of light); on cream the mapping inverts so the ink
 *  sits in the shadows, as a printed halftone would. Sampling once and
 *  mapping per frame is what lets the theme toggle re-ink the face live. */
const COLS = 88;
const FLOOR_SIZE = 0.34;
const EDGE_BOOST = 0.9;
/** The gather is accretion, not a snap: 1.5s per point on an ease-in-out,
 *  staggered over 0.4s (dark cells first, the lit face last), and every point
 *  orbits the face's centre as it closes in — SPIN radians of arc at the
 *  start, unwinding to none as it lands — so the field reads as dust
 *  circling into a planet rather than flying straight at a target. The dust
 *  starts from a lumpy disc about SPREAD box-widths across, not a rectangle
 *  (Jade: the full-screen cloud was too wide and took too long for the
 *  front page). ~1.9s to the face. */
const GATHER_MS = 1500;
const STAGGER_MS = 400;
const SPIN = 1.6;
const SPREAD = 1.7;
const RESOLVE_MS = 700;
const TAU = Math.PI * 2;

/** The lens, in px at the 640px layout width (scales with the box). Wide
 *  enough to take in both eyes at once; the dots inside it hold their
 *  lattice — the window is a reveal, not a force (Jade: no gravity at the
 *  cursor). Only the press ring moves them. */
const LENS_R = 200;
/** The lattice's alpha over the resolved photograph, per theme. On cream the
 *  inverted mapping puts the largest ink dots over the darkest hair, so the
 *  same value would read as a screen-door; thinner there. */
const REST_DARK = 0.2;
const REST_LIGHT = 0.04;
/** Press: a droplet on still water. Three rings leave the point of contact
 *  260ms apart, each fainter and gentler than the last, every one spreading
 *  to ~42% of the box width over 2.2s on a shallow ease-out (quad): water
 *  keeps travelling as it fades, it does not arrive and stop. */
const RIPPLE_MS = 2200;
const RIPPLE_GAP_MS = 260;
const RIPPLE_AMPS = [1, 0.55, 0.3];

/** Spring on each point the ring displaces: stiffness pulls it home, damping
 *  settles it without a bounce. Interruptible by nature — a second press
 *  adds force and the points never wait for a previous motion to end. */
const SPRING_K = 0.1;
const SPRING_DAMP = 0.84;

type Pt = {
  tx: number; // target, in source-image px
  ty: number;
  sx: number; // start offset from the face's centre, in box widths — a lumpy disc, not a box
  sy: number;
  tone: number; // 0..1, midtones stretched
  edge: number; // 0..1 Sobel magnitude, already scaled by EDGE_BOOST
  vig: number; // 0..1 vignette weight (fades the chair wings)
  hm: number; // 0..1 head mask: 1 over hair/face/hand, 0 on shoulders and chair
  inHead: number; // 0..1, the core of the head mask: where the floor lifts to draw the outline
  taper: number; // 0..1, light theme: shoulders fade outward from the neck so the bust is not a bell
  brass: boolean;
  r: number; // the photograph's own colour at this cell, saturation lifted
  g: number;
  b: number;
  lum: number; // 0..1
  col: string; // the dot-art colour: a brass duotone of the cell, re-tinted from --accent on theme change
  delay: number; // 0..1 of STAGGER_MS
  phase: number; // shimmer phase
};

// `start` is the ring's radius at t0, just outside the point of contact. A
// press also shuts the lens (see lensHoldUntil) so the ring travels out alone
// instead of merging with the open lens into a disc.
type Ripple = { x: number; y: number; t0: number; start: number; amp: number };

function makeRng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Ease-out quint — the resolve's curve. */
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
/** Ease-in-out cubic — the gather's curve: dust drifts, then commits, then settles. */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutQuad = (t: number) => 1 - Math.pow(1 - t, 2);
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function HeroPortrait() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // The copy around the hero waits for the face to settle. The CSS reveals
    // it via `:has([data-settled])`; this sets `data-in` on the copy itself
    // as well, so the reveal never depends on `:has()` support. Without it a
    // browser lacking `:has()` would keep the name and the ask invisible.
    const revealCopy = () => {
      wrap.dataset.settled = "";
      const stage = wrap.closest(".v2-hero-stage") ?? document;
      stage.querySelectorAll<HTMLElement>(".v2-hero-copy").forEach((el) => {
        el.dataset.in = "";
      });
    };

    // Reduced motion: the photograph stands alone. The CSS already shows it
    // and hides the canvas; nothing to run.
    if (reduced) {
      wrap.dataset.state = "photo";
      revealCopy();
      return;
    }

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // Colours from the tokens; re-read on theme toggle. Light theme swaps the
    // ink for the muted tone (legible on cream) and flips the tone mapping.
    let brass = "#C9A961";
    let ink = "#85847F";
    let light = false;
    const recolor = () => {
      const cs = getComputedStyle(document.documentElement);
      light = document.documentElement.getAttribute("data-theme") === "light";
      brass = cs.getPropertyValue("--accent").trim() || brass;
      ink = cs.getPropertyValue(light ? "--fg-muted" : "--fg-faint").trim() || ink;
    };
    // The dot art is a duotone in the site's own metal: shadows in warm ink,
    // midtones in the accent brass, highlights in pale gold (cream on the
    // light theme), with a quarter of the cell's real colour folded back in
    // so skin still reads as skin. Recomputed whenever the accent changes.
    const hexToRgb = (h: string): [number, number, number] | null => {
      const m = /^#?([0-9a-f]{6})$/i.exec(h.trim());
      if (!m) return null;
      const n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const lerp3 = (a: number[], b: number[], t: number) => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ];
    let pts: Pt[] = [];
    const tintAll = () => {
      const metal = hexToRgb(brass) ?? [201, 169, 97];
      const shadow = light ? [58, 46, 26] : [46, 40, 30];
      const glint = light ? [244, 242, 236] : [242, 226, 180];
      for (const p of pts) {
        const t = p.lum;
        const base = t < 0.55 ? lerp3(shadow, metal, t / 0.55) : lerp3(metal, glint, (t - 0.55) / 0.45);
        const c = lerp3(base, [p.r, p.g, p.b], 0.25);
        p.col = `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
      }
    };
    recolor();
    const mo = new MutationObserver(() => {
      recolor();
      tintAll();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Canvas sizing to the wrapper, capped at 2x.
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // The canvas covers the whole first viewport, not just the portrait's
    // box, so the gather can start from everywhere on screen. It is placed
    // relative to the wrapper (left/top = minus the wrapper's document
    // position) and the context is translated so every drawing coordinate
    // below stays in wrapper space. html/body clip x-overflow.
    let VW = 0;
    let VH = 0;
    let offX = 0;
    let offY = 0;
    const fit = () => {
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
      VW = window.innerWidth;
      VH = Math.max(window.innerHeight, r.top + window.scrollY + h);
      offX = r.left;
      offY = r.top + window.scrollY;
      cv.style.left = `${-offX}px`;
      cv.style.top = `${-offY}px`;
      cv.style.width = `${VW}px`;
      cv.style.height = `${VH}px`;
      cv.width = Math.round(VW * dpr);
      cv.height = Math.round(VH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, offX * dpr, offY * dpr);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    // Spring state per point: displacement and velocity, in canvas px.
    let ox = new Float32Array(0);
    let oy = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let raf = 0;
    let visible = true;
    let t0 = 0;
    let settled = false;
    let settleAt = 0;
    let disposed = false;

    // The lens: raw pointer target, a smoothed follower, and an eased radius
    // factor (0 closed, 1 open). The follower lags the pointer by a few frames
    // so the window feels like it has weight; the radius eases open and shut.
    let px = 0;
    let py = 0;
    let lx = 0;
    let ly = 0;
    let lensTarget = 0;
    // A press shuts the lens until this time so the rings leave alone; the
    // lens reopens under the pointer once the first ring is clear of it.
    let lensHoldUntil = 0;
    let lens = 0;
    let pointerIn = false;
    const ripples: Ripple[] = [];

    // Sample the portrait once: draw it small, read pixels, keep every opaque
    // cell with its tone, edge strength and vignette weight.
    const img = new window.Image();
    img.decoding = "async";
    img.src = SRC;
    img
      .decode()
      .then(() => {
        if (disposed) return;
        const rows = Math.round(COLS * (SRC_H / SRC_W));
        const off = document.createElement("canvas");
        off.width = COLS;
        off.height = rows;
        const octx = off.getContext("2d", { willReadFrequently: true });
        if (!octx) return;
        octx.drawImage(img, 0, 0, COLS, rows);
        const { data } = octx.getImageData(0, 0, COLS, rows);

        const rnd = makeRng(7);
        const out: Pt[] = [];
        const cw = SRC_W / COLS;
        const ch = SRC_H / rows;
        const smooth = smoothstep;

        // First pass: per-cell alpha, luminance and colour. The colour is the
        // cell's own with saturation lifted a quarter around its luminance; the
        // dot art tints it toward the brass at draw time (see tintAll).
        const A = new Float32Array(COLS * rows);
        const L = new Float32Array(COLS * rows);
        const R = new Uint8Array(COLS * rows);
        const G = new Uint8Array(COLS * rows);
        const Bc = new Uint8Array(COLS * rows);
        for (let k = 0; k < COLS * rows; k++) {
          const r = data[k * 4];
          const g = data[k * 4 + 1];
          const b = data[k * 4 + 2];
          A[k] = data[k * 4 + 3] / 255;
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          L[k] = lum / 255;
          const sat = (c: number) => Math.round(Math.min(255, Math.max(0, lum + (c - lum) * 1.25)));
          R[k] = sat(r);
          G[k] = sat(g);
          Bc[k] = sat(b);
        }
        // Sobel magnitude on the alpha-masked luminance, normalised to 0..1.
        const E = new Float32Array(COLS * rows);
        let emax = 0;
        const g = (y: number, x: number) => (A[y * COLS + x] > 0.5 ? L[y * COLS + x] : 0);
        for (let y = 1; y < rows - 1; y++) {
          for (let x = 1; x < COLS - 1; x++) {
            const gx = -g(y - 1, x - 1) - 2 * g(y, x - 1) - g(y + 1, x - 1) + g(y - 1, x + 1) + 2 * g(y, x + 1) + g(y + 1, x + 1);
            const gy = -g(y - 1, x - 1) - 2 * g(y - 1, x) - g(y - 1, x + 1) + g(y + 1, x - 1) + 2 * g(y + 1, x) + g(y + 1, x + 1);
            const m = Math.hypot(gx, gy);
            E[y * COLS + x] = m;
            if (m > emax) emax = m;
          }
        }

        for (let gy = 0; gy < rows; gy++) {
          for (let gx = 0; gx < COLS; gx++) {
            const k = gy * COLS + gx;
            if (A[k] < 0.5) continue;
            const nx = (gx + 0.5) / COLS;
            const ny = (gy + 0.5) / rows;
            // A soft vignette centred on the face fades the chair's wings and
            // the lower shirt, so the silhouette is a person, not furniture.
            const vig = 1 - smooth(0.5, 0.84, Math.hypot(nx - 0.5, (ny - 0.42) * 1.2));
            if (vig < 0.04) continue;
            // A tighter head mask: an upright ellipse over hair, face and the
            // hand under the chin. It gates the silhouette floor and, on cream,
            // the inverted tone, so ink lands in hair and facial shadow and the
            // chair and lower shirt thin to almost nothing. The person, not
            // the furniture, is the silhouette.
            const hm = 1 - smooth(0.3, 0.5, Math.hypot(nx - 0.48, (ny - 0.45) * 0.85));
            // Inside the head core the silhouette floor lifts to ~1.25px at 0.5
            // alpha: coverage, not just alpha, is what makes the crown and
            // temples read against the ground (measured: ~0.6% lit before,
            // ~7% after, against a face core of ~15%).
            const inHead = smooth(0.55, 0.8, hm);
            // Below the jaw, ink fades outward from the neck. The shoulders and
            // the chair are one contiguous dark mass in the photo; a radial
            // mask cannot separate them, a horizontal taper can.
            const below = smooth(0.55, 0.7, ny);
            const taper = 1 - below + below * (1 - smooth(0.2, 0.32, Math.abs(nx - 0.48)));
            // Stretch the midtones so skin shading maps to a wide size range.
            const tone = Math.min(1, Math.max(0, (L[k] - 0.1) / 0.72));
            const edge = (emax ? E[k] / emax : 0) * EDGE_BOOST;
            out.push({
              tx: (gx + 0.5 + (rnd() - 0.5) * 0.25) * cw,
              ty: (gy + 0.5 + (rnd() - 0.5) * 0.25) * ch,
              // The dust begins as a lumpy disc around the face: polar samples
              // with a sqrt radius (even fill), the rim warped by two low
              // harmonics so the cloud has no straight edge or corner.
              ...(() => {
                const a = rnd() * TAU;
                const lump = 1 + 0.22 * Math.sin(3 * a + 0.7) + 0.14 * Math.sin(5 * a + 2.1) + (rnd() - 0.5) * 0.12;
                const r = (0.18 + 0.82 * Math.sqrt(rnd())) * SPREAD * 0.5 * lump;
                return { sx: Math.cos(a) * r, sy: Math.sin(a) * r * 0.85 };
              })(),
              tone,
              edge,
              vig,
              hm,
              inHead,
              taper,
              // Brass favours the highlights, so it reads as light catching.
              brass: rnd() < 0.08 + tone * 0.22,
              r: R[k],
              g: G[k],
              b: Bc[k],
              lum: L[k],
              col: "",
              // Dark points settle first (the silhouette), lit points last
              // (the face appears).
              delay: (0.15 + tone * 0.85) * (0.6 + rnd() * 0.4),
              phase: rnd() * TAU,
            });
          }
        }
        pts = out;
        tintAll();
        ox = new Float32Array(out.length);
        oy = new Float32Array(out.length);
        vx = new Float32Array(out.length);
        vy = new Float32Array(out.length);
        t0 = performance.now();
        if (!raf) raf = requestAnimationFrame(draw);
      })
      .catch(() => {
        // If the image cannot be decoded, fall back to the photograph.
        wrap.dataset.state = "photo";
        revealCopy();
      });

    /** Punch a soft hole in what is already on the canvas (the photograph). */
    const punch = (x: number, y: number, r0: number, r1: number, r2: number, r3: number, a: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r3);
      // No inner clear zone (the lens) → punched from the centre out; a ring
      // (r0 > 0) leaves the centre alone and punches only its band.
      grad.addColorStop(0, r0 <= 0 ? `rgba(0,0,0,${a})` : "rgba(0,0,0,0)");
      if (r0 > 0) grad.addColorStop(r0 / r3, "rgba(0,0,0,0)");
      grad.addColorStop(Math.min(0.999, r1 / r3), `rgba(0,0,0,${a})`);
      grad.addColorStop(Math.min(0.999, Math.max(r1, r2) / r3), `rgba(0,0,0,${a})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = grad;
      ctx.fillRect(x - r3, y - r3, r3 * 2, r3 * 2);
      ctx.globalCompositeOperation = "source-over";
    };

    const draw = (now: number) => {
      raf = 0;
      if (!pts.length) return;
      const elapsed = now - t0;
      const gather = Math.min(1, elapsed / (GATHER_MS + STAGGER_MS));
      if (!settled && elapsed >= GATHER_MS + STAGGER_MS) {
        settled = true;
        settleAt = now;
        revealCopy();
      }
      // The resolve: the photograph rises through the gathered dots over
      // 700ms on ease-out-quint, and the lattice falls to its resting whisper.
      const resolve = settled ? easeOutQuint(Math.min(1, (now - settleAt) / RESOLVE_MS)) : 0;
      const rest = light ? REST_LIGHT : REST_DARK;
      const dotMix = 1 - resolve * (1 - rest);

      // Lens follower and radius easing (both exponential ease-out: ~90% in
      // ten frames, interruptible at any time).
      lx += (px - lx) * 0.22;
      ly += (py - ly) * 0.22;
      lens += ((now < lensHoldUntil ? 0 : lensTarget) - lens) * 0.16;
      const R = settled ? LENS_R * (w / 640) * lens : 0;
      // Below ~8px the window is shutting or barely open; drawing it would
      // leave a pin-sized hole (visible at a press, when the lens is held
      // shut), so it counts as closed.
      const lensOpen = R > 8;

      // Expire finished ripples.
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].t0 >= RIPPLE_MS) ripples.splice(i, 1);
      }

      ctx.clearRect(-offX, -offY, VW, VH);

      // The photograph, once resolving, with the lens and any rings punched
      // out of it so the dots beneath show through.
      if (resolve > 0) {
        ctx.globalAlpha = resolve;
        ctx.drawImage(img, 0, 0, w, h);
        ctx.globalAlpha = 1;
        if (lensOpen) punch(lx, ly, 0, R * 0.5, R * 0.5, R, 0.96);
        for (const rp of ripples) {
          const age = (now - rp.t0) / RIPPLE_MS;
          if (age < 0) continue; // a later ring of the train, not yet born
          const ease = easeOutQuad(age);
          const rr = rp.start + ease * w * 0.42;
          const band = (34 + ease * 26) * (w / 640); // the ring scales with the box
          punch(rp.x, rp.y, Math.max(0, rr - band), Math.max(0, rr - band * 0.35), rr + band * 0.25, rr + band, 0.9 * (1 - age) * rp.amp);
        }
      }

      // The image is sized by width inside the wrapper at its true aspect,
      // so one scale maps source px to canvas px.
      const s = w / SRC_W;
      const drift = settled ? 1 : gather; // shimmer fades in as the face settles
      const ts = now / 1000;

      // Constellation lines gather strength mid-load, then fall to a whisper.
      const mid = Math.sin(Math.PI * Math.min(gather, 1));
      const lineReach = Math.min(w, h) * (0.035 + mid * 0.06);
      const lineAlpha = (0.06 + mid * 0.4) * Math.max(dotMix, lens);

      // Only the ring pushes; the lens is a reveal.
      const forces = settled && ripples.length > 0;
      let moving = false;

      const cxF = w * 0.5;
      const cyF = h * 0.45; // the face, not the box
      const n = pts.length;
      const proj = new Float32Array(n * 2);
      const boost = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const p = pts[i];
        // Per-point progress: global time minus this point's stagger.
        const local = Math.max(0, Math.min(1, (elapsed - p.delay * STAGGER_MS) / GATHER_MS));
        const e = easeInOutCubic(local);

        // Tone → size/alpha, per theme. Dark ground: light areas get the big
        // dots. Cream: inverted, ink in the shadows. The silhouette floor
        // keeps every cell present as at least a dim pinprick.
        const t = light ? 1 - p.tone : p.tone;
        // On cream the inversion is gated by the head mask: hair and facial
        // shadow carry the ink, shoulders fade, the chair vanishes. On the
        // dark ground the mask only lifts the floor inside the head so the
        // crown and outline read while the shoulders stay dim.
        const gate = light ? p.hm * p.taper : 1;
        const tonal = (0.22 + Math.pow(t, 1.15) * 2.3 + p.edge * 0.9) * p.vig * gate;
        let floor = FLOOR_SIZE * p.vig * (0.55 + 0.45 * p.hm);
        let floorAlpha = (light ? 0.26 : 0.32) * p.hm * p.vig + 0.05 * p.vig;
        if (!light) {
          floor += (1.25 * p.vig - floor) * p.inHead;
          floorAlpha += (0.5 * p.vig - floorAlpha) * p.inHead;
        }
        const size = Math.max(floor, tonal);
        const alpha =
          tonal <= floor + 0.02
            ? floorAlpha
            : Math.min(0.95, 0.28 + t * 0.6 + p.edge * 0.25) *
              (light ? (0.3 + 0.7 * p.hm) * (0.35 + 0.65 * p.taper) : 1);
        if (alpha * size < 0.012) continue; // invisible: skip the arc

        const sx = cxF + p.sx * w;
        const sy = cyF + p.sy * w;
        // A halftone reads tone off a regular lattice, so the points barely
        // move at rest (under 0.4px); the life is in a slow alpha shimmer.
        const txp = p.tx * s + Math.sin(ts * 0.7 + p.phase) * 0.35 * drift;
        const typ = p.ty * s + Math.cos(ts * 0.6 + p.phase) * 0.35 * drift;
        const shimmer = Math.sin(ts * 0.9 + p.phase * 1.7) * 0.06 * drift;

        // The lens and rings: how much this point is "inside" (0..1), which
        // lifts it from the resting whisper to full ink and swells it a
        // little, and the force they put on it.
        let lw = 0;
        let fx = 0;
        let fy = 0;
        if (settled) {
          if (lensOpen) {
            const dx = txp - lx;
            const dy = typ - ly;
            const d = Math.hypot(dx, dy) || 1;
            // The lens only lifts the dots to full ink; it does not move them.
            if (d < R) lw = 1 - smoothstep(R * 0.35, R, d);
          }
          for (const rp of ripples) {
            const age = (now - rp.t0) / RIPPLE_MS;
            if (age < 0) continue;
            const ease = easeOutQuad(age);
            const rr = rp.start + ease * w * 0.42;
            const band = (34 + ease * 26) * (w / 640);
            const dx = txp - rp.x;
            const dy = typ - rp.y;
            const d = Math.hypot(dx, dy) || 1;
            const gg = Math.max(0, 1 - Math.abs(d - rr) / band);
            if (gg > 0.01) {
              const fall = 1 - age;
              lw = Math.max(lw, gg * fall * rp.amp);
              const f = gg * gg * 0.9 * fall * rp.amp;
              fx += (dx / d) * f;
              fy += (dy / d) * f;
            }
          }
          // Spring integration. Skipped entirely while everything is home and
          // nothing is pushing, which is the resting case.
          if (forces || ox[i] !== 0 || oy[i] !== 0) {
            vx[i] = (vx[i] + fx - ox[i] * SPRING_K) * SPRING_DAMP;
            vy[i] = (vy[i] + fy - oy[i] * SPRING_K) * SPRING_DAMP;
            ox[i] += vx[i];
            oy[i] += vy[i];
            if (Math.abs(ox[i]) + Math.abs(oy[i]) + Math.abs(vx[i]) + Math.abs(vy[i]) < 0.05) {
              ox[i] = oy[i] = vx[i] = vy[i] = 0;
            } else {
              moving = true;
            }
          }
        }

        // Straight-line interpolation toward the target, then the whole
        // vector swung about the face's centre by an angle that unwinds with
        // progress: an orbit that tightens into place. Faster points (lit,
        // late) get a little more arc, so the last of the face sweeps in.
        const rx = (sx - cxF) * (1 - e) + (txp - cxF) * e;
        const ry = (sy - cyF) * (1 - e) + (typ - cyF) * e;
        const ang = SPIN * (0.8 + 0.4 * p.tone) * Math.pow(1 - e, 1.5);
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const x = cxF + rx * ca - ry * sa + ox[i];
        const y = cyF + rx * sa + ry * ca + oy[i];
        proj[i * 2] = x;
        proj[i * 2 + 1] = y;
        boost[i] = lw;
        // Every dot wears its cell's brass-duotone colour from the first
        // frame: the gather, the resting whisper, the lens and the rings are
        // one material (Jade: the gather's two-tone dots did not match the
        // lens). As a dot lands it takes its halftone size and alpha, so the
        // face develops; once resolved it sits at the resting whisper unless
        // the lens or a ring lifts it.
        const mix = dotMix + (1 - dotMix) * lw;
        // Dust first: every point starts as a visible mote (alpha 0.6, 1.4px)
        // and only takes its halftone alpha and size as it lands, so the
        // field is present from the first frame rather than fading in late.
        const a = Math.max(0.05, 0.6 + (alpha - 0.6) * e + shimmer) * mix;
        const rad = (1.4 + (size - 1.4) * e) * (1 + 0.35 * lw);
        ctx.globalAlpha = Math.min(1, a * (1 + 0.15 * lw));
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, TAU);
        ctx.fill();
      }

      // Hairlines: strong while gathering, a whisper at rest, back up inside
      // the lens. Only every third point takes part, which keeps the pass
      // cheap at this count; skipped when nothing would be visible.
      if (lineAlpha > 0.008) {
        ctx.lineWidth = 0.6;
        for (let i = 0; i < n; i += 3) {
          const ax = proj[i * 2];
          const ay = proj[i * 2 + 1];
          for (let k = 1; k <= 3; k++) {
            const j = (i + k * 3) % n;
            const bx = proj[j * 2];
            const by = proj[j * 2 + 1];
            const d = Math.hypot(ax - bx, ay - by);
            if (d < lineReach) {
              const la = (1 - d / lineReach) * lineAlpha * (settled ? Math.max(0.15, boost[i]) : 1);
              if (la < 0.005) continue;
              ctx.strokeStyle = pts[i].brass && mid > 0.2 ? brass : ink;
              ctx.globalAlpha = la;
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(bx, by);
              ctx.stroke();
            }
          }
        }
      }
      ctx.globalAlpha = 1;

      // At rest (resolved, lens shut, springs home, no rings) only the
      // shimmer moves, and halving the redraw rate there is invisible.
      if (visible) {
        const atRest = settled && resolve >= 1 && !lensOpen && lens < 0.01 && !moving && ripples.length === 0;
        if (atRest) {
          raf = requestAnimationFrame(() => {
            raf = requestAnimationFrame(draw);
          });
        } else {
          raf = requestAnimationFrame(draw);
        }
      }
    };

    // Pointer over the portrait opens the lens and steers it; leaving shuts
    // it. Fine pointers only — a finger dragging here is scrolling.
    const local = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const onMove = (e: PointerEvent) => {
      if (!fine) return;
      [px, py] = local(e);
      if (!pointerIn) {
        // Start the follower on the pointer so the window opens in place
        // rather than sliding in from wherever it was last shut.
        pointerIn = true;
        lx = px;
        ly = py;
      }
      lensTarget = 1;
      if (visible && !raf && pts.length) raf = requestAnimationFrame(draw);
    };
    const onLeave = () => {
      pointerIn = false;
      lensTarget = 0;
    };
    // A press sends a ring out from the point of contact. Fine pointers get
    // it on pointerdown (instant feedback); touch on click, so a finger that
    // lands here to scroll does not fire one.
    const ring = (e: PointerEvent | MouseEvent) => {
      if (!settled) return;
      const r = wrap.getBoundingClientRect();
      const t0 = performance.now();
      RIPPLE_AMPS.forEach((amp, k) => {
        ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t0: t0 + k * RIPPLE_GAP_MS, start: 16, amp });
      });
      if (ripples.length > 12) ripples.splice(0, ripples.length - 12);
      if (visible && !raf && pts.length) raf = requestAnimationFrame(draw);
    };
    const onDown = (e: PointerEvent) => {
      if (!fine) return;
      lensHoldUntil = performance.now() + 600;
      ring(e);
    };
    const onClick = (e: MouseEvent) => {
      if (!fine) ring(e);
    };
    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointerdown", onDown, { passive: true });
    wrap.addEventListener("click", onClick);

    // Only animate while on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && pts.length) raf = requestAnimationFrame(draw);
    });
    io.observe(wrap);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      data-state="canvas"
      className="v2-hero relative mx-auto w-full max-w-[640px] select-none"
      style={{ aspectRatio: `${SRC_W} / ${SRC_H}` }}
    >
      {/* The photograph as an element: what search engines, reduced motion
          and a failed decode see. Once the canvas runs it paints the
          photograph itself, so this stays hidden underneath (see .v2-hero in
          globals.css). Served at native resolution — see scripts/key-hero.mjs. */}
      <Image
        src={SRC}
        alt="Jade Bonifacio"
        width={SRC_W}
        height={SRC_H}
        priority
        quality={95}
        sizes="(max-width:840px) 100vw, 640px"
        className="v2-hero-photo pointer-events-none absolute inset-0 h-full w-full"
        draggable={false}
      />
      {/* Zero-sized until fit() places and sizes it: an element with no
          visible rectangle cannot register a layout shift when it moves
          (this was 0.25 CLS on every home load). */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        width={0}
        height={0}
        className="v2-hero-dots pointer-events-none absolute left-0 top-0 h-0 w-0"
      />
    </div>
  );
}
