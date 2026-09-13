/**
 * The trophy renderer — the part of the story backdrop that only needs a 2D
 * context, so it runs the same on a worker's OffscreenCanvas (the normal
 * case) and on a main-thread canvas (the fallback). storyBackdrop.ts owns the
 * DOM side: observers, pointer, theme, the worker itself.
 *
 * A trophy built from ~6,600 dots (a quarter brass), seen through a camera
 * that rides one Catmull-Rom path through three shots as the reader scrolls
 * the pinned story. Faint hairlines join neighbouring dots and brighten while
 * the camera is moving; dots near the pointer are pulled toward it. The
 * trophy itself never turns.
 *
 * Cost discipline (measured, see the surface brief's performance pass):
 * redraw only when something changed; dots and lines batched into a few
 * paths by colour and alpha step; tiny dots as squares; a render that took
 * over 8ms makes the next frame skip.
 */

export type Pt = [number, number, number];
export type Shot = { p: Pt; t: Pt };
export type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

/** Waypoints of the camera path, one per chapter. About 4.2 units from the trophy (its height is ~1.65). */
export const SHOTS: Shot[] = [
  // 2020 — low, from the front-left, looking up: the cup against the sky.
  { p: [-2.4, -0.9, 3.3], t: [0, 0.1, 0] },
  // 2024 — high, from the right: the mouth of the cup opens into a ring.
  { p: [1.6, 3.5, 1.7], t: [0, 0.15, 0] },
  // 2025 — low again, from behind on the other side, closer: stem and handle.
  { p: [2.8, -0.4, -3.1], t: [0, -0.05, 0] },
];

function makeRng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** ~6,600 points on the surfaces of a cup with two handles, a stem, a base. */
function buildTrophy(rnd: () => number): Pt[] {
  const p: Pt[] = [];
  const push = (x: number, y: number, z: number) => p.push([x, y - 0.19, z]); // centre the whole thing
  const ring = (count: number, r: number, y: number, jitterR = 0, jitterY = 0) => {
    for (let i = 0; i < count; i++) {
      const a = rnd() * TAU;
      const rr = r + (rnd() - 0.5) * jitterR;
      push(Math.cos(a) * rr, y + (rnd() - 0.5) * jitterY, Math.sin(a) * rr);
    }
  };

  // Bowl: a surface of revolution, y 0.05 → 1.0, radius 0.2 → 0.75 on a
  // square-root profile. Sampled by area so the rim isn't sparse.
  const rb = (y: number) => 0.2 + 0.55 * Math.sqrt((y - 0.05) / 0.95);
  for (let i = 0; i < 2420; i++) {
    let y = 0;
    let r = 0;
    do {
      y = 0.05 + rnd() * 0.95;
      r = rb(y);
    } while (rnd() * 0.75 > r);
    const a = rnd() * TAU;
    push(Math.cos(a) * r, y, Math.sin(a) * r);
  }
  ring(605, 0.75, 1.0, 0.02, 0.03); // the rim, dense
  for (let i = 0; i < 110; i++) {
    const a = rnd() * TAU;
    const r = 0.2 * Math.sqrt(rnd());
    push(Math.cos(a) * r, 0.05, Math.sin(a) * r); // bottom of the bowl
  }

  // Handles: two C-shaped arcs of a thin tube, open toward the cup.
  for (const side of [1, -1]) {
    for (let i = 0; i < 632; i++) {
      const a = (-100 + rnd() * 200) * DEG;
      const u = rnd() * TAU;
      const tube = 0.035;
      push(side * (0.72 + 0.3 * Math.cos(a) + Math.cos(u) * tube), 0.62 + 0.3 * Math.sin(a) + Math.sin(u) * tube, (rnd() - 0.5) * 0.07);
    }
  }

  // Stem and knob.
  for (let i = 0; i < 412; i++) {
    const a = rnd() * TAU;
    push(Math.cos(a) * 0.09, -0.36 + rnd() * 0.41, Math.sin(a) * 0.09);
  }
  for (let i = 0; i < 302; i++) {
    const u = rnd() * 2 - 1;
    const a = rnd() * TAU;
    const s = Math.sqrt(1 - u * u);
    push(0.13 * s * Math.cos(a), -0.16 + 0.13 * u, 0.13 * s * Math.sin(a));
  }

  // Base: a frustum onto a plinth.
  for (let i = 0; i < 605; i++) {
    const t = rnd();
    const a = rnd() * TAU;
    const r = 0.48 - t * 0.28;
    push(Math.cos(a) * r, -0.55 + t * 0.19, Math.sin(a) * r);
  }
  for (let i = 0; i < 385; i++) {
    const a = rnd() * TAU;
    push(Math.cos(a) * 0.5, -0.64 + rnd() * 0.09, Math.sin(a) * 0.5);
  }
  ring(330, 0.5, -0.55, 0.02, 0);
  ring(248, 0.5, -0.64, 0.02, 0);

  return p;
}

/** Catmull-Rom through the waypoints (ends clamped); t in 0..1 over the whole path. */
function onPath(points: Pt[], t: number): Pt {
  const segs = points.length - 1;
  const u = Math.min(Math.max(t, 0), 1) * segs;
  const i = Math.min(Math.floor(u), segs - 1);
  const f = u - i;
  const P = (k: number) => points[Math.min(Math.max(k, 0), points.length - 1)];
  const p0 = P(i - 1);
  const p1 = P(i);
  const p2 = P(i + 1);
  const p3 = P(i + 2);
  const out: Pt = [0, 0, 0];
  for (let a = 0; a < 3; a++) {
    out[a] =
      0.5 *
      (2 * p1[a] +
        (-p0[a] + p2[a]) * f +
        (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * f * f +
        (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * f * f * f);
  }
  return out;
}

export type TrophyRenderer = {
  /** Size the backing store to CSS px × ratio and set the transform. */
  resize: (w: number, h: number, dpr: number) => void;
  colors: (brassHex: string, inkHex: string) => void;
  /** Pointer in canvas CSS px; far away (e.g. -9999) when absent. */
  pointer: (x: number, y: number) => void;
  /** Where the camera is on its path, 0..1. */
  setT: (t: number) => void;
  /** Call once per animation frame; renders only if something changed. */
  frame: () => void;
};

export function createTrophyRenderer(ctx: Ctx2D): TrophyRenderer {
  const rnd = makeRng(7);
  const pts = buildTrophy(rnd);
  const N = pts.length;
  const sizes = new Float32Array(N);
  const brass: boolean[] = [];
  for (let i = 0; i < N; i++) {
    sizes[i] = 0.8 + rnd() * 1.6;
    brass.push(rnd() < 0.26);
  }
  // Projected x, y and depth per dot, kept for the line pass.
  const proj = new Float32Array(N * 3);
  const path = SHOTS.map((sh) => sh.p);
  const aim = SHOTS.map((sh) => sh.t);

  let w = 0;
  let h = 0;
  let colA = "#C9A961";
  let colB = "#85847F";
  let mx = -9999;
  let my = -9999;
  let t = 0;

  // Redraw only when something changed: the camera moved, the pointer moved
  // near the canvas, hairlines are still settling, the canvas resized or the
  // theme flipped. Pinned and untouched, the trophy costs nothing per frame.
  let dirty = true;
  let lastT = -1;
  let boost = 0;
  let prev: Pt = onPath(path, 0);
  let lastCost = 0;
  let skipped = false;

  const reach = () => Math.min(w, h) * 0.3;
  const near = (x: number, y: number) => x > -reach() && y > -reach() && x < w + reach() && y < h + reach();

  // Dots and lines are batched into a few paths by colour and alpha step —
  // sixteen fills and twelve strokes a frame instead of ~6,600 and ~1,500.
  const STEPS = 8;
  const LSTEPS = 6;
  const dotPaths: Path2D[] = [];
  const linePaths: Path2D[] = [];

  const render = () => {
    // The camera's place on its path, and how fast it is moving → hairlines
    // lengthen and brighten in flight, then settle.
    const [px0, py0, pz0] = onPath(path, t);
    const [tx0, ty0, tz0] = onPath(aim, t);
    const mdx = px0 - prev[0];
    const mdy = py0 - prev[1];
    const mdz = pz0 - prev[2];
    const moved = Math.sqrt(mdx * mdx + mdy * mdy + mdz * mdz);
    prev = [px0, py0, pz0];
    boost += (Math.min(1, moved * 25) - boost) * 0.12;
    if (boost < 0.005) boost = 0;

    // Camera basis from position and target, up = +y.
    let fx = tx0 - px0;
    let fy = ty0 - py0;
    let fz = tz0 - pz0;
    const fl = Math.sqrt(fx * fx + fy * fy + fz * fz) || 1;
    fx /= fl;
    fy /= fl;
    fz /= fl;
    // right = forward × up
    let rx = -fz;
    let rz = fx;
    const rl = Math.sqrt(rx * rx + rz * rz) || 1;
    rx /= rl;
    rz /= rl;
    // up' = right × forward
    const ux = -rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy;

    // Focal length: the trophy stands about as tall as the stage, centred —
    // rim under the header, handles in the heading band above the cards, the
    // bowl's flare showing over the card top, the base ring below.
    // (Finish review, round 3: at 2.6 the card was exactly the cup's width and
    // hid its flare; 2.15 cleared it; Jade then asked for slightly smaller.)
    const F = h * 1.95;
    const cx0 = w / 2;
    const cy0 = h * 0.5;
    const camDist = Math.sqrt(px0 * px0 + py0 * py0 + pz0 * pz0);
    const nearZ = camDist - 1.3;
    const farZ = camDist + 1.3;
    const R2 = reach();
    const PULL = Math.min(w, h) * 0.02;
    const pointer = mx > -9000 && near(mx, my);

    ctx.clearRect(0, 0, w, h);

    for (let c = 0; c < 2 * STEPS; c++) dotPaths[c] = new Path2D();
    for (let i = 0; i < N; i++) {
      const q = pts[i];
      // Into camera space.
      const dx = q[0] - px0;
      const dy = q[1] - py0;
      const dz = q[2] - pz0;
      const zc = dx * fx + dy * fy + dz * fz;
      if (zc < 0.3) {
        proj[i * 3 + 2] = -1;
        continue;
      }
      const xc = dx * rx + dz * rz;
      const yc = dx * ux + dy * uy + dz * uz;
      const s = F / zc;
      let px = cx0 + xc * s;
      let py = cy0 - yc * s;

      if (pointer) {
        const ddx = mx - px;
        const ddy = my - py;
        const d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < R2 && d > 0.001) {
          const g = 1 - d / R2;
          const gg = g * g * PULL;
          px += (ddx / d) * gg;
          py += (ddy / d) * gg;
        }
      }

      const depth = Math.max(0, Math.min(1, 1 - (zc - nearZ) / (farZ - nearZ)));
      proj[i * 3] = px;
      proj[i * 3 + 1] = py;
      proj[i * 3 + 2] = depth;
      // Dot radius ~0.5–2.4px: the cloud's grain, nearer dots a little larger.
      const r = sizes[i] * (0.55 + depth * 0.55) * Math.min(1.25, Math.max(0.75, s / 400));
      const path2 = dotPaths[(brass[i] ? STEPS : 0) + Math.min(STEPS - 1, Math.floor(depth * STEPS))];
      if (r < 1.1) {
        // A dot this small is a couple of device pixels; a square rasterises
        // for a fraction of an anti-aliased arc and looks the same.
        path2.rect(px - r, py - r, r * 2, r * 2);
      } else {
        path2.moveTo(px + r, py);
        path2.arc(px, py, r, 0, TAU);
      }
    }
    for (let c = 0; c < 2 * STEPS; c++) {
      const step = c % STEPS;
      ctx.globalAlpha = 0.22 + 0.7 * ((step + 0.5) / STEPS);
      ctx.fillStyle = c < STEPS ? colB : colA;
      ctx.fill(dotPaths[c]);
    }

    // Constellation lines: every fourth dot checks the next five such dots and
    // draws a hairline to any within reach. Reach, alpha and width all rise
    // while the camera is moving, so the shape reads as a constellation in
    // flight between chapters and settles to loose points at rest.
    const lmax = Math.min(w, h) * (0.035 + boost * 0.06);
    const la = 0.05 + boost * 0.5;
    const brassLines = boost > 0.15;
    for (let c = 0; c < 2 * LSTEPS; c++) linePaths[c] = new Path2D();
    for (let i = 0; i < N; i += 4) {
      const ad = proj[i * 3 + 2];
      if (ad < 0) continue;
      const ax = proj[i * 3];
      const ay = proj[i * 3 + 1];
      for (let k = 1; k <= 5; k++) {
        const j = (i + k * 4) % N;
        if (proj[j * 3 + 2] < 0) continue;
        const bx = proj[j * 3];
        const by = proj[j * 3 + 1];
        const ex = ax - bx;
        const ey = ay - by;
        const dd = Math.sqrt(ex * ex + ey * ey);
        if (dd < lmax) {
          const strength = (1 - dd / lmax) * (0.35 + ad * 0.65); // 0..1 of la
          const path2 = linePaths[(brassLines && brass[i] ? LSTEPS : 0) + Math.min(LSTEPS - 1, Math.floor(strength * LSTEPS))];
          path2.moveTo(ax, ay);
          path2.lineTo(bx, by);
        }
      }
    }
    ctx.lineWidth = 0.6 + boost * 0.5;
    for (let c = 0; c < 2 * LSTEPS; c++) {
      const step = c % LSTEPS;
      ctx.globalAlpha = la * ((step + 0.5) / LSTEPS);
      ctx.strokeStyle = c < LSTEPS ? colB : colA;
      ctx.stroke(linePaths[c]);
    }
    ctx.globalAlpha = 1;
  };

  return {
    resize(nw, nh, dpr) {
      w = nw;
      h = nh;
      ctx.canvas.width = Math.round(w * dpr);
      ctx.canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    },
    colors(a, b) {
      colA = a;
      colB = b;
      dirty = true;
    },
    pointer(x, y) {
      if (near(mx, my) || near(x, y)) dirty = true;
      mx = x;
      my = y;
    },
    setT(nt) {
      t = nt;
    },
    frame() {
      // Adaptive rate: a render that took over 8ms (a slow machine, a big
      // canvas) makes the next frame skip, so the backdrop drops to half rate
      // under load while the cards, on the compositor, stay at full rate.
      if (!(dirty || t !== lastT || boost > 0)) return;
      if (lastCost > 8 && !skipped && !dirty) {
        skipped = true;
        return;
      }
      const t0 = performance.now();
      render();
      lastCost = performance.now() - t0;
      skipped = false;
      dirty = false;
      lastT = t;
    },
  };
}
