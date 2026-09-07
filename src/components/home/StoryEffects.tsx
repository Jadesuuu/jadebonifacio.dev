"use client";

import { useEffect, useRef } from "react";

/**
 * Two motion effects scoped to the #story section:
 *
 *  1. Timeline reveal — cards below the fold start hidden (`.v2-reveal`) and
 *     fade/slide up when they scroll into view, re-hiding when they leave.
 *     Cards already on screen at load are left untouched, so there's no flash.
 *  2. Cursor glow — a soft accent orb (rendered here) eases toward the pointer
 *     and only shows while the pointer is within the story section.
 *
 * Both are disabled under prefers-reduced-motion: the orb stays hidden and all
 * cards render fully visible.
 */
export function StoryEffects() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = document.getElementById("story");
    if (!section) return;
    const cards = section.querySelectorAll<HTMLElement>("[data-tl-card]");

    // Reveal on intersect; only pre-hide the cards that start off-screen.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-in", entry.isIntersecting);
        }
      },
      { threshold: 0.18 },
    );
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
      if (!onScreen) card.classList.add("v2-reveal");
      io.observe(card);
    }

    // Cursor-following glow, eased toward the pointer each frame.
    const glow = glowRef.current;
    let raf = 0;
    let onMove: ((e: MouseEvent) => void) | undefined;
    let onLeave: (() => void) | undefined;

    if (glow) {
      let tx = window.innerWidth / 2;
      let ty = window.innerHeight / 2;
      let cx = tx;
      let cy = ty - 300;

      onMove = (e) => {
        tx = e.clientX;
        ty = e.clientY;
        const r = section.getBoundingClientRect();
        const on = e.clientY >= r.top && e.clientY <= r.bottom;
        // Light mode multiplies the glow into the page, so it needs more opacity to read.
        const light = document.documentElement.getAttribute("data-theme") === "light";
        glow.style.opacity = on ? (light ? "0.34" : "0.18") : "0";
      };
      onLeave = () => {
        glow.style.opacity = "0";
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);

      const step = () => {
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        glow.style.transform = `translate3d(${cx}px,${cy}px,0)`;
        raf = window.requestAnimationFrame(step);
      };
      raf = window.requestAnimationFrame(step);
    }

    return () => {
      io.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      if (onMove) window.removeEventListener("mousemove", onMove);
      if (onLeave) document.documentElement.removeEventListener("mouseleave", onLeave);
      for (const card of cards) card.classList.remove("v2-reveal", "is-in");
    };
  }, []);

  return <div ref={glowRef} className="v2-glow" aria-hidden="true" />;
}
