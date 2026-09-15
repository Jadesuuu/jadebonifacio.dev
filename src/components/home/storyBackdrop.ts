/**
 * The story's backdrop: a trophy built from dots, seen through a camera that
 * pans as the reader scrolls (StoryChapters.tsx drives `cam.t`).
 *
 * This is the About particle cloud, given a job. Same material — a 2D canvas
 * point cloud, about a quarter of the dots brass, faint hairlines joining
 * neighbours that brighten while things are in flight — but one object instead
 * of four on a timer, and a real camera on a path instead of a yaw. The trophy
 * itself does not turn, and nothing here follows the pointer: scroll moves the
 * camera and that is the only thing that moves the image.
 *
 * Why a trophy: cum laude, top-3 defect resolver, the evening builds that
 * shipped. Why dots: the hero's halftone, the constellation, the toolbox
 * spotlight — dots are the site's one material for the things it can't
 * photograph.
 *
 * This file is the DOM side. The rendering (storyBackdropCore.ts) runs in a
 * worker on an OffscreenCanvas wherever the browser allows, so painting the
 * dots never touches the main thread; where it can't (older Safari), the same
 * renderer runs here on the canvas directly. Either way it runs only while
 * the canvas is on screen and draws only when something changed. Under
 * prefers-reduced-motion the stage never mounts, so this never runs there.
 */

import { createTrophyRenderer, type TrophyRenderer } from "./storyBackdropCore";
import type { BackdropMsg } from "./storyBackdrop.worker";

export type StoryBackdrop = {
  /** Where the camera is on its path, 0..1. GSAP scrubs this; call sync() on update. */
  cam: { t: number };
  /** Push cam.t to the renderer. */
  sync: () => void;
  destroy: () => void;
};

export function createStoryBackdrop(cv: HTMLCanvasElement): StoryBackdrop | null {
  const cam = { t: 0 };
  // Pixel ratio capped at 1.5: the dots are 1–2px grain, and a stage-sized
  // canvas at 2x was the single biggest cost in the section.
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let w = 0;
  let h = 0;
  const measure = () => {
    const r = cv.getBoundingClientRect();
    w = r.width;
    h = r.height;
  };
  measure();

  // Colours from the tokens; re-read on theme toggle.
  const colors = () => {
    const cs = getComputedStyle(document.documentElement);
    const light = document.documentElement.getAttribute("data-theme") === "light";
    return {
      colA: (cs.getPropertyValue("--accent") || "#C9A961").trim(),
      colB: (cs.getPropertyValue(light ? "--fg-muted" : "--fg-faint") || "#85847F").trim(),
    };
  };

  // Two drivers, one message shape.
  let send: (m: BackdropMsg) => void;
  let teardown: () => void;
  const offscreen = typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined" && "transferControlToOffscreen" in cv;

  if (offscreen) {
    const worker = new Worker(new URL("./storyBackdrop.worker.ts", import.meta.url), { type: "module" });
    const oc = cv.transferControlToOffscreen();
    const c = colors();
    worker.postMessage({ type: "init", canvas: oc, w, h, dpr, ...c } satisfies BackdropMsg, [oc]);
    send = (m) => worker.postMessage(m);
    teardown = () => worker.terminate();
  } else {
    const ctx = cv.getContext("2d");
    if (!ctx) return null;
    const renderer: TrophyRenderer = createTrophyRenderer(ctx);
    renderer.resize(w, h, dpr);
    const c = colors();
    renderer.colors(c.colA, c.colB);
    let raf = 0;
    let visible = false;
    const loop = () => {
      raf = 0;
      renderer.frame();
      if (visible) raf = requestAnimationFrame(loop);
    };
    send = (m) => {
      switch (m.type) {
        case "resize":
          renderer.resize(m.w, m.h, m.dpr);
          break;
        case "colors":
          renderer.colors(m.colA, m.colB);
          break;
        case "cam":
          renderer.setT(m.t);
          break;
        case "visible":
          visible = m.on;
          if (visible && !raf) raf = requestAnimationFrame(loop);
          break;
        default:
          break;
      }
    };
    teardown = () => {
      visible = false;
      cancelAnimationFrame(raf);
    };
  }

  const ro = new ResizeObserver(() => {
    measure();
    send({ type: "resize", w, h, dpr });
  });
  ro.observe(cv);

  const mo = new MutationObserver(() => send({ type: "colors", ...colors() }));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  // Only run while on screen.
  const io = new IntersectionObserver(([entry]) => send({ type: "visible", on: entry.isIntersecting }));
  io.observe(cv);

  let sentT = -1;
  return {
    cam,
    sync: () => {
      if (cam.t !== sentT) {
        sentT = cam.t;
        send({ type: "cam", t: cam.t });
      }
    },
    destroy: () => {
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      teardown();
    },
  };
}
