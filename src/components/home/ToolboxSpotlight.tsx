"use client";

import { useEffect } from "react";

/**
 * Roaming spotlight for the toolbox (Portfolio Home v2). A soft brass point
 * drifts across the `[data-tools]` block on a slow Lissajous path; when the
 * pointer is over (or just outside) the block it follows the pointer instead,
 * easing toward it. Every `[data-tile]` gets a proximity value `--g` in [0,1]
 * (smoothstep over a 175px radius) that globals.css turns into a warmer
 * border, brighter text and, on the big tiles, a radial highlight anchored at
 * `--lx/--ly`. Tiles under the light lift by up to 3.5px.
 *
 * Runs only while the block is on screen, pauses off-screen, and does nothing
 * under prefers-reduced-motion. Pointer following is skipped on touch-only
 * devices, where the light just drifts.
 */

const RADIUS = 175;
const EASE = 0.075;
const MARGIN = 30;

type TileGeom = { x: number; y: number; rect: DOMRect; big: boolean };
type Layout = {
  grid: DOMRect;
  tiles: TileGeom[];
  cx: number;
  cy: number;
  ax: number;
  ay: number;
};

export function ToolboxSpotlight() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const grid = document.querySelector<HTMLElement>("[data-tools]");
    if (!grid) return;
    const tiles = Array.from(grid.querySelectorAll<HTMLElement>("[data-tile]"));
    if (tiles.length === 0) return;

    let layout: Layout | null = null;
    let raf = 0;
    let visible = false;
    let hover = false;
    let mx = -1;
    let my = -1;
    let px = 0;
    let py = 0;
    let started = false;
    const t0 = performance.now();

    // Tile centres in viewport space, computed lazily and thrown away on
    // scroll/resize so the loop never forces layout on its own.
    const measure = (): Layout => {
      if (layout) return layout;
      const gridRect = grid.getBoundingClientRect();
      const geoms = tiles.map((el) => {
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, rect, big: el.hasAttribute("data-big") };
      });
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const g of geoms) {
        x0 = Math.min(x0, g.x); x1 = Math.max(x1, g.x);
        y0 = Math.min(y0, g.y); y1 = Math.max(y1, g.y);
      }
      layout = {
        grid: gridRect,
        tiles: geoms,
        cx: (x0 + x1) / 2,
        cy: (y0 + y1) / 2,
        ax: (x1 - x0) / 2 + 30,
        ay: (y1 - y0) / 2 + 20,
      };
      return layout;
    };
    const invalidate = () => { layout = null; };

    const step = () => {
      if (!visible) { raf = 0; return; }
      const l = measure();
      let tx: number, ty: number;
      if (hover) {
        tx = mx; ty = my;
      } else {
        const t = (performance.now() - t0) / 1000;
        tx = l.cx + l.ax * 0.95 * Math.sin(t * 0.5);
        ty = l.cy + l.ay * 0.95 * Math.sin(t * 0.81 + 1.7);
      }
      if (!started) { px = tx; py = ty; started = true; }
      px += (tx - px) * EASE;
      py += (ty - py) * EASE;

      for (let i = 0; i < tiles.length; i++) {
        const g = l.tiles[i];
        const el = tiles[i];
        const f = Math.max(0, 1 - Math.hypot(px - g.x, py - g.y) / RADIUS);
        const e = f * f * (3 - 2 * f);
        el.style.setProperty("--g", e.toFixed(3));
        el.style.transform = e > 0.008 ? `translateY(${(-3.5 * e).toFixed(2)}px)` : "";
        if (g.big && e > 0.008) {
          el.style.setProperty("--lx", `${(((px - g.rect.left) / g.rect.width) * 100).toFixed(1)}%`);
          el.style.setProperty("--ly", `${(((py - g.rect.top) / g.rect.height) * 100).toFixed(1)}%`);
        }
      }
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      layout = null;
      if (visible && !raf) raf = requestAnimationFrame(step);
    });
    io.observe(grid);

    const canHover = !window.matchMedia("(hover: none)").matches;
    const onMove = (ev: MouseEvent) => {
      mx = ev.clientX; my = ev.clientY;
      const r = measure().grid;
      hover =
        mx >= r.left - MARGIN && mx <= r.right + MARGIN &&
        my >= r.top - MARGIN && my <= r.bottom + MARGIN;
    };
    if (canHover) window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      if (canHover) window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      for (const el of tiles) {
        el.style.removeProperty("--g");
        el.style.removeProperty("--lx");
        el.style.removeProperty("--ly");
        el.style.transform = "";
      }
    };
  }, []);

  return null;
}
