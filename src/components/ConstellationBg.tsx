"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed full-viewport constellation background (ink and brass), ported from
 * the Claude Design handoff (`handoff/ConstellationBg.tsx`).
 *
 * A field of 55–120 faint dots (about a fifth of them brass) drifts a few
 * pixels side to side and scrolls at a fraction of the page speed, so the
 * layers parallax against each other. Scrolling "wakes" the field: dots
 * stretch into short streaks along the scroll direction and hairlines join
 * neighbours within 110px, fading back to loose points when the page rests.
 * A pointer press sends a ring outward that nudges dots and briefly brightens
 * them.
 *
 *   home:        <ConstellationBg revealAfterHero />   fades in once the hero
 *                                                      has scrolled by
 *   case study:  <ConstellationBg ambient={0.55} />    always on, fainter
 *
 * Render once per page. The canvas sits at z-index -1 behind everything, so
 * no ancestor between it and <html> may paint a background (html carries
 * --bg; see globals.css). Colours are read from --accent and --fg-faint and
 * refreshed when <html data-theme> changes. Under prefers-reduced-motion the
 * canvas stays empty.
 */

type Dot = { x: number; y: number; z: number; p: number; a: boolean };
type Burst = { x: number; y: number; t0: number };
// [x, y, dot, extra alpha from a burst]
type Projected = [number, number, Dot, number];

const MARGIN = 70;
const LINK = 110;

export function ConstellationBg({
  revealAfterHero = false,
  ambient = 1,
}: {
  /** Keep the field hidden over the hero and fade it in on scroll. */
  revealAfterHero?: boolean;
  /** Overall alpha multiplier, 0–1. */
  ambient?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    let dots: Dot[] = [];
    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
    };
    const seed = () => {
      const n = Math.round(Math.min(120, Math.max(55, (w * h) / 16000)));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * (h + 200) - 100,
        z: 0.15 + Math.random() * 0.7,
        p: Math.random() * Math.PI * 2,
        a: Math.random() < 0.18,
      }));
    };
    fit();
    seed();
    const onResize = () => { fit(); seed(); };
    window.addEventListener("resize", onResize);

    let brass = "#C9A961", ink = "#5E5D58";
    const recolor = () => {
      const cs = getComputedStyle(document.documentElement);
      brass = cs.getPropertyValue("--accent").trim() || brass;
      ink = cs.getPropertyValue("--fg-faint").trim() || ink;
    };
    recolor();
    const themeWatch = new MutationObserver(recolor);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

    const bursts: Burst[] = [];
    const onPress = (e: PointerEvent) => {
      bursts.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
      if (bursts.length > 4) bursts.shift();
    };
    window.addEventListener("pointerdown", onPress, { passive: true });

    let vel = 0, lastY = window.scrollY, wake = 0, raf = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const sy = window.scrollY;
      vel += (sy - lastY - vel) * 0.12;
      lastY = sy;
      const target = Math.min(Math.abs(vel) / 12, 1);
      wake += (target - wake) * (target > wake ? 0.09 : 0.025);
      const reveal = revealAfterHero ? Math.min(Math.max((sy - h * 0.3) / (h * 0.45), 0), 1) : 1;
      const fade = reveal * ambient;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (fade <= 0.01 && bursts.length === 0) return;

      const ts = t / 1000;
      const span = h + MARGIN * 2;
      const P: Projected[] = dots.map((d) => {
        const y = ((((d.y - sy * d.z) % span) + span) % span) - MARGIN;
        return [d.x + Math.sin(ts * 0.3 + d.p) * 6, y, d, 0];
      });

      // Press rings: push dots outward along an expanding radius, ease-out.
      for (let bi = bursts.length - 1; bi >= 0; bi--) {
        const b = bursts[bi];
        const age = (t - b.t0) / 950;
        if (age >= 1) { bursts.splice(bi, 1); continue; }
        const ease = 1 - Math.pow(1 - age, 3);
        const R = 30 + ease * 190;
        const fall = 1 - age;
        for (const q of P) {
          const dx = q[0] - b.x, dy = q[1] - b.y;
          const dist = Math.hypot(dx, dy) || 1;
          const g = Math.max(0, 1 - Math.abs(dist - R) / 64);
          if (g > 0.01) {
            const push = g * g * 4 * fall;
            q[0] += (dx / dist) * push;
            q[1] += (dy / dist) * push;
            q[3] = Math.max(q[3], g * fall * 0.3);
          }
        }
      }

      // Dots, or streaks while the page is moving.
      const streak = wake * 1.6;
      for (const [x, y, d, boost] of P) {
        const a = Math.max(fade * (0.15 + d.z * 0.2) * (d.a ? 1.5 : 1) * (1 + wake * 0.8), boost);
        if (a <= 0.004) continue;
        ctx.globalAlpha = Math.min(a, 0.9);
        const st = Math.max(-110, Math.min(110, vel * d.z * streak));
        if (st > 3 || st < -3) {
          ctx.strokeStyle = d.a ? brass : ink;
          ctx.lineWidth = 0.8 + d.z;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + st); ctx.stroke();
          ctx.lineWidth = 1;
        } else {
          ctx.fillStyle = d.a ? brass : ink;
          ctx.beginPath(); ctx.arc(x, y, 1 + d.z * 1.4, 0, 7); ctx.fill();
        }
      }

      // Constellation lines, only while awake.
      if (wake > 0.02 && fade > 0.01) {
        for (let i = 0; i < P.length; i++) {
          for (let j = i + 1; j < P.length; j++) {
            const dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1];
            if (dx > LINK || dx < -LINK || dy > LINK || dy < -LINK) continue;
            const dd = Math.hypot(dx, dy);
            if (dd < LINK) {
              ctx.strokeStyle = P[i][2].a || P[j][2].a ? brass : ink;
              ctx.globalAlpha = fade * wake * (1 - dd / LINK) * 0.32;
              ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke();
            }
          }
        }
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onPress);
      themeWatch.disconnect();
    };
  }, [revealAfterHero, ambient]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
