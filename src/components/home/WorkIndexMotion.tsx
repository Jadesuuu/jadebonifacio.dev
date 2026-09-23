"use client";

import { useEffect } from "react";

/**
 * /work's one authored moment: each "Recent work" screenshot is UNVEILED as
 * the reader scrolls it into view, scrubbed to the scrollbar (GSAP
 * ScrollTrigger, loaded on demand). The wipe travels from the row's outer
 * edge toward its text — a left-media row unveils left to right, a
 * right-media row right to left — so the alternation the index already has
 * becomes the motion's direction; inside the frame the capture settles from a
 * slight zoom, and the row's text follows a beat behind. Scroll back and it
 * retraces: direct manipulation, not a replayed entrance. A row already
 * mostly in view when the page mounts is left alone: it is the visible
 * default, and half-unveiling it on arrival would read as content missing.
 *
 * The rest of the page (the day-job figures counting up, the smaller things
 * staggering in) is ScrollReveal's; this file owns only the rows, which opt
 * out of ScrollReveal via data-no-reveal on their section.
 *
 * Under prefers-reduced-motion or without JS nothing runs and every row is
 * simply there: the default CSS has no clip and no transform.
 */
export function WorkIndexMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-work-row]"));
    if (rows.length === 0) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Same line as the trigger's start: a row above it is the visible default.
        const inViewOnLoad = window.innerHeight * 0.92;
        for (const row of rows) {
          if (row.getBoundingClientRect().top < inViewOnLoad) continue;
          const media = row.querySelector<HTMLElement>("[data-work-media]");
          const body = row.querySelector<HTMLElement>("[data-work-body]");
          if (!media || !body) continue;
          const picture = media.querySelector<HTMLElement>("img");
          const fromLeft = row.dataset.workRow === "image-first";

          const tl = gsap.timeline({
            scrollTrigger: { trigger: row, start: "top 92%", end: "top 42%", scrub: 0.6 },
          });
          // Fresh vars per tween: fromTo() writes startAt onto the object it
          // is handed, so a shared `to` would leak one tween's start into the next.
          tl.fromTo(
            media,
            { clipPath: fromLeft ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 },
            0,
          );
          if (picture) {
            tl.fromTo(
              picture,
              { scale: 1.08, xPercent: fromLeft ? -3 : 3 },
              { scale: 1, xPercent: 0, ease: "none", duration: 1 },
              0,
            );
          }
          // The text lands before the wipe finishes, so nothing reads as
          // half-there once the capture is whole.
          tl.fromTo(body, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: "none", duration: 0.6 }, 0.25);
        }
      });
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return null;
}
