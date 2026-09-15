/**
 * The trophy renderer — the part of the story backdrop that only needs a 2D
 * context, so it runs the same on a worker's OffscreenCanvas (the normal
 * case) and on a main-thread canvas (the fallback). storyBackdrop.ts owns the
 * DOM side: observers, theme, the worker itself.
 *
 * A trophy built from ~6,600 dots (a quarter brass), seen through a camera
 * that rides one Catmull-Rom path through three shots as the reader scrolls
 * the pinned story. Faint hairlines join neighbouring dots and brighten while
 * the camera is moving. The trophy itself never turns, and nothing follows the
 * pointer: the camera is the only thing that moves the image, so the scroll
 * owns the shot. (Dots used to be pulled toward the cursor; with a camera
 * already in motion it read as noise over the move, not as a second material.)
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

/** The bowl's profile: radius at height y, over y 0.05 → 1.0. A square-root
 *  flare, so the cup opens fast off the stem and then straightens. */
const rb = (y: number) => 0.2 + 0.55 * Math.sqrt((y - 0.05) / 0.95);

/** Gadroons: the lobed flutes cut into the lower bowl, boldest where the bowl
 *  is narrowest and dying out by the waist, the way they are chased on a real
 *  loving cup. They are what the camera catches as it swings under the bowl in
 *  shot 1 — a plain surface of revolution has nothing to catch, which is why
 *  the cup used to read as a smooth vase from every angle. */
const FLUTES = 14;
const GAD_TOP = 0.62;
/** Depth of the lobes, as a fraction of the bowl's own radius, swelling from
 *  nothing at the bowl's foot to about an eighth a fifth of the way up and
 *  dying out again at the waist. Cutting them to a constant depth instead made
 *  the foot a cog — at y 0.05 the bowl is only 0.2 across, so a flat amplitude
 *  was a third of the radius and hung visible spikes under the bowl in the
 *  overhead shot. Gadroons converge to a point at the foot on a real cup. */
const gadAmp = (y: number) => {
  if (y >= GAD_TOP || y <= 0.05) return 0;
  const f = (y - 0.05) / (GAD_TOP - 0.05);
  return 0.13 * rb(y) * Math.sin(Math.PI * Math.pow(f, 0.45));
};
const gad = (y: number, a: number) => gadAmp(y) * Math.cos(FLUTES * a);

/** ~7,100 points on the surfaces of a cup with two handles, a stem and a
 *  stepped base — and, threaded through them, the object's contour lines.
 *
 *  Roughly a third of the cloud sits on edges: the rim's rolled lip inside and
 *  out, the crest of every gadroon, the waist where the flutes stop, the collar
 *  at the stem, the knob's equator, and the sharp rings at every step of the
 *  base. A ring in space projects to an ellipse from any camera, so these read
 *  as drawn contour no matter where the path has taken the shot — which is the
 *  only way a point cloud shows an edge, since density cannot be biased toward
 *  a silhouette that moves. `edge` comes back alongside the points so the
 *  renderer can draw them tighter and let brass favour them: metal catches
 *  light on its edges, and that is the same rule the hero halftone uses. */
function buildTrophy(rnd: () => number): { pts: Pt[]; edge: Uint8Array } {
  const p: Pt[] = [];
  const e: number[] = [];
  const push = (x: number, y: number, z: number, isEdge = false) => {
    p.push([x, y - 0.19, z]); // centre the whole thing
    e.push(isEdge ? 1 : 0);
  };
  /** A circle of points at a height: the object's contour lines. */
  const ring = (count: number, r: number, y: number, jitterR = 0, jitterY = 0, isEdge = true) => {
    for (let i = 0; i < count; i++) {
      const a = rnd() * TAU;
      const rr = r + (rnd() - 0.5) * jitterR;
      push(Math.cos(a) * rr, y + (rnd() - 0.5) * jitterY, Math.sin(a) * rr, isEdge);
    }
  };
  /** A ring of circular cross-section — a rolled lip or a collar. */
  const torus = (count: number, R: number, y: number, tube: number, isEdge = true) => {
    for (let i = 0; i < count; i++) {
      const a = rnd() * TAU;
      const u = rnd() * TAU;
      const rr = R + Math.cos(u) * tube;
      push(Math.cos(a) * rr, y + Math.sin(u) * tube, Math.sin(a) * rr, isEdge);
    }
  };
  const disc = (count: number, r: number, y: number) => {
    for (let i = 0; i < count; i++) {
      const a = rnd() * TAU;
      const rr = r * Math.sqrt(rnd());
      push(Math.cos(a) * rr, y, Math.sin(a) * rr);
    }
  };
  /** A straight-walled section of revolution between two radii. */
  const shell = (count: number, r0: number, y0: number, r1: number, y1: number) => {
    for (let i = 0; i < count; i++) {
      const f = rnd();
      const a = rnd() * TAU;
      const r = r0 + (r1 - r0) * f;
      push(Math.cos(a) * r, y0 + (y1 - y0) * f, Math.sin(a) * r);
    }
  };

  // ---- Bowl -------------------------------------------------------------
  // Sampled by area so the rim isn't sparse, then displaced by the gadroons.
  for (let i = 0; i < 1850; i++) {
    let y = 0;
    let r = 0;
    do {
      y = 0.05 + rnd() * 0.95;
      r = rb(y);
    } while (rnd() * 0.75 > r);
    const a = rnd() * TAU;
    push(Math.cos(a) * (r + gad(y, a)), y, Math.sin(a) * (r + gad(y, a)));
  }
  // The crest of each gadroon, drawn as a line up the bowl. These are the
  // ribs; without them the displaced surface reads as noise rather than as
  // cut lobes.
  for (let k = 0; k < FLUTES; k++) {
    const a = (k / FLUTES) * TAU;
    for (let i = 0; i < 46; i++) {
      const y = 0.055 + (GAD_TOP - 0.075) * (i / 45);
      const r = rb(y) + gadAmp(y);
      push(Math.cos(a) * r, y, Math.sin(a) * r, true);
    }
  }
  ring(170, rb(GAD_TOP), GAD_TOP, 0.012, 0.012); // the waist, where the flutes stop
  disc(90, 0.19, 0.055); // the floor inside the bowl

  // ---- Rim --------------------------------------------------------------
  // A rolled lip, not a cut edge: the mouth is the subject of shot 2, and a
  // single ring there projected as one thin ellipse with nothing to catch.
  // Outer and inner contour rings give the mouth its two concentric edges.
  torus(380, 0.745, 0.995, 0.028);
  ring(260, 0.773, 0.995, 0.008, 0.006);
  ring(200, 0.717, 0.995, 0.008, 0.006);

  // ---- Handles ----------------------------------------------------------
  // Two C-shaped arcs of a tube that thickens toward its terminals, a cast
  // boss where each meets the bowl, and a line of points along the outer
  // spine — the edge the camera rakes across in shot 3.
  for (const side of [1, -1]) {
    for (let i = 0; i < 470; i++) {
      const a = (-100 + rnd() * 200) * DEG;
      const u = rnd() * TAU;
      const tube = 0.024 + 0.02 * Math.pow(Math.abs(a) / (100 * DEG), 2);
      push(
        side * (0.72 + 0.3 * Math.cos(a) + Math.cos(u) * tube),
        0.62 + 0.3 * Math.sin(a) + Math.sin(u) * tube,
        (rnd() - 0.5) * 0.07,
      );
    }
    for (let i = 0; i < 60; i++) {
      const a = (-100 + (i / 59) * 200) * DEG;
      const tube = 0.024 + 0.02 * Math.pow(Math.abs(a) / (100 * DEG), 2);
      push(
        side * (0.72 + (0.3 + tube) * Math.cos(a)),
        0.62 + (0.3 + tube) * Math.sin(a),
        0,
        true,
      );
    }
    for (const end of [1, -1]) {
      const a = end * 100 * DEG;
      for (let i = 0; i < 70; i++) {
        const u = rnd() * TAU;
        const v = rnd() * TAU;
        const s = 0.055;
        push(
          side * (0.72 + 0.3 * Math.cos(a) + Math.cos(u) * s * 0.5),
          0.62 + 0.3 * Math.sin(a) + Math.sin(u) * s,
          Math.cos(v) * s * 0.55,
          true,
        );
      }
    }
  }

  // ---- Collar, stem, knob ------------------------------------------------
  torus(150, 0.16, 0.03, 0.028); // where the bowl sits down onto the stem
  for (let i = 0; i < 330; i++) {
    const a = rnd() * TAU;
    const y = -0.34 + rnd() * 0.39;
    // A slight waist, so the stem is turned rather than a dowel.
    const r = 0.085 - 0.018 * Math.sin(((y + 0.34) / 0.39) * Math.PI);
    push(Math.cos(a) * r, y, Math.sin(a) * r);
  }
  for (let i = 0; i < 240; i++) {
    const u = rnd() * 2 - 1;
    const a = rnd() * TAU;
    const s = Math.sqrt(1 - u * u);
    push(0.13 * s * Math.cos(a), -0.16 + 0.13 * u, 0.13 * s * Math.sin(a));
  }

  // ---- Base: two steps onto a plinth -------------------------------------
  // Two steps, not one block. The heights are chosen so the whole object still
  // spans the 1.66 units it did before the detail pass: the camera distances
  // and the F = h * 1.95 focal below were tuned against that silhouette in the
  // third finish review, and a base that grew downward would have dropped the
  // plinth out of the frame.
  shell(430, 0.2, -0.34, 0.44, -0.525); // the frustum under the stem
  ring(150, 0.44, -0.525, 0.01, 0);
  shell(260, 0.44, -0.525, 0.44, -0.583); // upper step wall
  ring(130, 0.44, -0.583, 0.01, 0);
  ring(130, 0.52, -0.583, 0.01, 0);
  shell(300, 0.52, -0.583, 0.52, -0.64); // plinth wall
  ring(150, 0.52, -0.64, 0.01, 0);
  disc(90, 0.52, -0.64);

  return { pts: p, edge: Uint8Array.from(e) };
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
  /** Where the camera is on its path, 0..1. */
  setT: (t: number) => void;
  /** Call once per animation frame; renders only if something changed. */
  frame: () => void;
};

export function createTrophyRenderer(ctx: Ctx2D): TrophyRenderer {
  const rnd = makeRng(7);
  const { pts, edge } = buildTrophy(rnd);
  const N = pts.length;
  const sizes = new Float32Array(N);
  const brass: boolean[] = [];
  for (let i = 0; i < N; i++) {
    // Contour points are drawn in a tighter size band than surface grain, so a
    // ring reads as one even line instead of a string of beads; and brass
    // favours them about two to one, because metal catches the light on its
    // edges. Both together are what make the rim, the gadroons and the base
    // steps legible as drawn edges rather than as denser cloud. Overall brass
    // stays near the quarter the other three set pieces use.
    if (edge[i]) {
      sizes[i] = 1.0 + rnd() * 0.7;
      brass.push(rnd() < 0.42);
    } else {
      sizes[i] = 0.8 + rnd() * 1.5;
      brass.push(rnd() < 0.19);
    }
  }
  // Projected x, y and depth per dot, kept for the line pass.
  const proj = new Float32Array(N * 3);
  const path = SHOTS.map((sh) => sh.p);
  const aim = SHOTS.map((sh) => sh.t);

  let w = 0;
  let h = 0;
  let colA = "#C9A961";
  let colB = "#85847F";
  let t = 0;

  // Redraw only when something changed: the camera moved, hairlines are still
  // settling, the canvas resized or the theme flipped. Pinned and unscrolled,
  // the trophy costs nothing per frame.
  let dirty = true;
  let lastT = -1;
  let boost = 0;
  let prev: Pt = onPath(path, 0);
  let lastCost = 0;
  let skipped = false;

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
      const px = cx0 + xc * s;
      const py = cy0 - yc * s;

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
