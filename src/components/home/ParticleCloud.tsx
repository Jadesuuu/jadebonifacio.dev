"use client";

import { useEffect, useRef } from "react";

/**
 * The about-section set piece: a 2D-canvas point cloud with fake 3D
 * projection that slowly yaws and morphs between four personal shapes (a
 * trefoil knot, a shuttlecock, a globe, a coffee mug), each with a mono
 * caption. Dots near the pointer are pulled toward it with a soft falloff.
 *
 * Colours come from the theme tokens (about a quarter of the dots are brass)
 * and are re-read whenever <html data-theme> changes. Rendering pauses while
 * the canvas is off-screen. Under prefers-reduced-motion it draws the knot
 * once and stops.
 */

type Pt = [number, number, number];

// Every shape must have exactly N points: the morph pairs point i of one
// shape with point i of the next. Budget per part is chosen so silhouettes
// (rims, handles) stay legible; the knot and globe are uniform anyway.
const N = 520;
const HOLD = 3600;
const MORPH = 1500;
const TAU = Math.PI * 2;

const LABELS = [
  "the knot · legacy code, untangled",
  "the shuttlecock · match point",
  "the globe · remote, gmt+8",
  "the mug · coffee, always",
];

function makeRng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function buildShapes(rnd: () => number): Pt[][] {
  const shapes: Pt[][] = [];

  // Trefoil knot, thin tube.
  {
    const p: Pt[] = [];
    for (let i = 0; i < N; i++) {
      const t = (i / N) * TAU + rnd() * 0.02;
      const r = Math.cos(3 * t) + 2;
      const u = rnd() * TAU;
      const tube = 0.05 * Math.sqrt(rnd());
      p.push([
        r * Math.cos(2 * t) * 0.3 + Math.cos(u) * tube,
        r * Math.sin(2 * t) * 0.3 + Math.sin(u) * tube,
        -Math.sin(3 * t) * 0.55 + (rnd() - 0.5) * 0.06,
      ]);
    }
    shapes.push(p);
  }

  // Shuttlecock: cork sphere at the bottom, feather skirt, a denser rim.
  {
    const p: Pt[] = [];
    for (let i = 0; i < N; i++) {
      const q = rnd();
      if (q < 0.26) {
        const u = rnd() * 2 - 1;
        const a = rnd() * TAU;
        const s = Math.sqrt(1 - u * u);
        p.push([0.22 * s * Math.cos(a), -0.72 + 0.22 * u, 0.22 * s * Math.sin(a)]);
      } else if (q < 0.8) {
        const t = rnd();
        const a = rnd() * TAU;
        const r = 0.12 + t * 0.58 + (rnd() - 0.5) * 0.05;
        p.push([Math.cos(a) * r, -0.5 + t * 1.32, Math.sin(a) * r]);
      } else {
        const a = rnd() * TAU;
        const r = 0.68 + (rnd() - 0.5) * 0.04;
        p.push([Math.cos(a) * r, 0.82 + (rnd() - 0.5) * 0.05, Math.sin(a) * r]);
      }
    }
    shapes.push(p);
  }

  // Globe: Fibonacci sphere.
  {
    const p: Pt[] = [];
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      p.push([Math.cos(ga * i) * r * 0.92, y * 0.92, Math.sin(ga * i) * r * 0.92]);
    }
    shapes.push(p);
  }

  // Mug: cylinder wall, rim, base disc, and a handle ring on the right.
  {
    const p: Pt[] = [];
    for (let i = 0; i < N; i++) {
      const q = rnd();
      if (q < 0.52) {
        const a = rnd() * TAU;
        p.push([Math.cos(a) * 0.58, -0.8 + rnd() * 1.3, Math.sin(a) * 0.58]);
      } else if (q < 0.66) {
        const a = rnd() * TAU;
        p.push([Math.cos(a) * 0.58, 0.5 + (rnd() - 0.5) * 0.06, Math.sin(a) * 0.58]);
      } else if (q < 0.78) {
        const a = rnd() * TAU;
        const rr = 0.5 * Math.sqrt(rnd());
        p.push([Math.cos(a) * rr, -0.82, Math.sin(a) * rr]);
      } else {
        const a = rnd() * TAU;
        p.push([0.82 + Math.cos(a) * 0.3, -0.15 + Math.sin(a) * 0.3, (rnd() - 0.5) * 0.1]);
      }
    }
    shapes.push(p);
  }

  return shapes;
}

export function ParticleCloud() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const label = labelRef.current;
    if (!cv || !label) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const rnd = makeRng(42);
    const shapes = buildShapes(rnd);
    const sizes: number[] = [];
    const brass: boolean[] = [];
    for (let i = 0; i < N; i++) {
      sizes.push(0.8 + rnd() * 1.6);
      brass.push(rnd() < 0.26);
    }

    // Canvas sizing, capped at 2x for retina.
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => {
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(cv);

    // Colours from the tokens; re-read on theme toggle.
    let colA = "#C9A961";
    let colB = "#7D7C78";
    const recolor = () => {
      const cs = getComputedStyle(document.documentElement);
      const light = document.documentElement.getAttribute("data-theme") === "light";
      colA = (cs.getPropertyValue("--accent") || colA).trim();
      colB = (cs.getPropertyValue(light ? "--fg-muted" : "--fg-faint") || colB).trim();
    };
    recolor();
    const mo = new MutationObserver(recolor);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Pointer, in canvas coordinates; parked far away when absent.
    let px2 = -9999;
    let py2 = -9999;
    const onMove = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      px2 = e.clientX - r.left;
      py2 = e.clientY - r.top;
    };
    const onLeave = () => {
      px2 = -9999;
      py2 = -9999;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let idx = 0;
    let phase = 0;
    let yaw = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;

    const draw = (now: number) => {
      raf = 0;
      const dt = Math.min(now - last, 50);
      last = now;
      phase += dt;

      let from = shapes[idx];
      let to = shapes[(idx + 1) % shapes.length];
      let e = 0;
      if (phase > HOLD) {
        const m = (phase - HOLD) / MORPH;
        if (m >= 1) {
          idx = (idx + 1) % shapes.length;
          phase = 0;
          from = shapes[idx];
          to = shapes[(idx + 1) % shapes.length];
          label.textContent = LABELS[idx];
          label.style.opacity = "1";
        } else {
          e = m < 0.5 ? 4 * m * m * m : 1 - Math.pow(-2 * m + 2, 3) / 2;
          if (m > 0.3) label.style.opacity = "0";
        }
      }

      yaw += dt * 0.00022;
      ctx.clearRect(0, 0, w, h);
      const sc = Math.min(w, h) * 0.34;
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const R2 = sc;
      const PULL = Math.min(w, h) * 0.022;

      for (let i = 0; i < N; i++) {
        const a = from[i];
        const b = to[i];
        const x = a[0] + (b[0] - a[0]) * e;
        const y = a[1] + (b[1] - a[1]) * e;
        const z = a[2] + (b[2] - a[2]) * e;
        const x1 = x * cy + z * sy;
        const z2 = z * cy - x * sy;
        const f = 2.6 / (2.6 + z2);
        let px = w / 2 + x1 * sc * f;
        let py = h / 2 - y * sc * f + h * 0.02;

        const dx = px2 - px;
        const dy = py2 - py;
        const d = Math.hypot(dx, dy);
        if (d < R2 && d > 0.001) {
          const g = 1 - d / R2;
          const gg = g * g * PULL;
          px += (dx / d) * gg;
          py += (dy / d) * gg;
        }

        const depth = Math.max(0, Math.min(1, (1.2 - z2) / 2.4));
        ctx.globalAlpha = 0.3 + depth * 0.65;
        ctx.fillStyle = brass[i] ? colA : colB;
        ctx.beginPath();
        ctx.arc(px, py, sizes[i] * f * (0.7 + depth * 0.7), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!still && visible) raf = requestAnimationFrame(draw);
    };

    // Only animate while on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(cv);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="relative w-full min-w-0 max-w-[380px] justify-self-end max-[840px]:max-w-[320px] max-[840px]:justify-self-start"
      style={{ aspectRatio: "4 / 5" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      <p
        ref={labelRef}
        className="absolute inset-x-0 bottom-0 m-0 text-center font-mono text-xs text-fg-faint transition-opacity duration-[400ms]"
      >
        {LABELS[0]}
      </p>
    </div>
  );
}
