"use client";

import { useEffect, useRef } from "react";

/**
 * The story section's cursor glow — a soft accent orb that eases toward the
 * pointer and only shows while the pointer is within #story. One of the four
 * pinned ambient set pieces (PRODUCT.md). The section's scroll choreography
 * (cards, rail, heading) lives in StoryScroll.
 *
 * Disabled under prefers-reduced-motion: the orb stays hidden.
 */
export function StoryEffects() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = document.getElementById("story");
    const glow = glowRef.current;
    if (!section || !glow) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty - 300;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const r = section.getBoundingClientRect();
      const on = e.clientY >= r.top && e.clientY <= r.bottom;
      // Light mode multiplies the glow into the page, so it needs more opacity to read.
      const light = document.documentElement.getAttribute("data-theme") === "light";
      glow.style.opacity = on ? (light ? "0.34" : "0.18") : "0";
    };
    const onLeave = () => {
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

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <div ref={glowRef} className="v2-glow" aria-hidden="true" />;
}
