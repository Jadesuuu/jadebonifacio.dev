/**
 * The story backdrop's worker: owns the OffscreenCanvas and runs the trophy
 * renderer on its own animation loop, so painting ~6,600 dots never touches
 * the main thread — the cards and the page scroll stay at full rate whatever
 * the canvas costs. storyBackdrop.ts posts size, colours, camera
 * progress and visibility; nothing comes back.
 */

import { createTrophyRenderer, type TrophyRenderer } from "./storyBackdropCore";

export type BackdropMsg =
  | { type: "init"; canvas: OffscreenCanvas; w: number; h: number; dpr: number; colA: string; colB: string }
  | { type: "resize"; w: number; h: number; dpr: number }
  | { type: "colors"; colA: string; colB: string }
  | { type: "cam"; t: number }
  | { type: "visible"; on: boolean };

let renderer: TrophyRenderer | null = null;
let visible = false;
let raf = 0;

// requestAnimationFrame exists in dedicated workers in current engines; fall
// back to a 60Hz timer where it does not.
const nextFrame = (cb: () => void): number =>
  typeof requestAnimationFrame === "function" ? requestAnimationFrame(cb) : (setTimeout(cb, 16) as unknown as number);

const loop = () => {
  raf = 0;
  renderer?.frame();
  if (visible) raf = nextFrame(loop);
};

addEventListener("message", (e: MessageEvent<BackdropMsg>) => {
  const m = e.data;
  switch (m.type) {
    case "init": {
      const ctx = m.canvas.getContext("2d");
      if (!ctx) return;
      renderer = createTrophyRenderer(ctx);
      renderer.resize(m.w, m.h, m.dpr);
      renderer.colors(m.colA, m.colB);
      break;
    }
    case "resize":
      renderer?.resize(m.w, m.h, m.dpr);
      break;
    case "colors":
      renderer?.colors(m.colA, m.colB);
      break;
    case "cam":
      renderer?.setT(m.t);
      break;
    case "visible":
      visible = m.on;
      if (visible && !raf) raf = nextFrame(loop);
      break;
  }
});
