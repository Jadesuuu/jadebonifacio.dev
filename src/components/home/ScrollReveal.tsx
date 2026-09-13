"use client";

import { useEffect } from "react";

/**
 * Home scroll animations (Portfolio Home v2):
 *
 *  1. Reveal — each <section>'s direct children fade + move into place as
 *     they enter the viewport, once (the `[data-rv]` styles in globals.css).
 *     The move is upward by default; an element (or its data-stagger parent)
 *     can carry data-reveal="left" | "right" | "scale" so not every section
 *     arrives the same way. Containers marked data-stagger reveal their own
 *     children in sequence (70ms steps, capped); a data-tools wrapper is
 *     looked through so its rows reveal separately. Timeline cards are left
 *     to StoryEffects; the cursor-glow is skipped. Reveals do not re-hide on
 *     the way back up — the reader has seen it; replaying it is noise.
 *  2. Count-up — elements with data-count tick from 0 to the target once, on a
 *     650/1300ms easeOutCubic, when 60% visible.
 *
 * Disabled entirely under prefers-reduced-motion (and, being JS-driven, with no
 * JS): every element then renders in its natural, fully-visible state. Elements
 * already on screen at mount are revealed synchronously so there's no flash.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tagged: HTMLElement[] = [];
    const tag = (el: HTMLElement, delay: number, dir: string) => {
      el.setAttribute("data-rv", dir);
      if (delay) el.style.transitionDelay = `${delay}ms`;
      tagged.push(el);
    };

    const visit = (el: HTMLElement) => {
      if (el.hasAttribute("data-glow")) return;
      // The story's chapters (StoryChapters) choreograph themselves.
      if (el.classList.contains("v2-story")) return;
      // The toolbox wrapper is transparent: its rows reveal one by one.
      if (el.hasAttribute("data-tools")) {
        Array.from(el.children).forEach((child) => visit(child as HTMLElement));
        return;
      }
      const dir = el.dataset.reveal ?? "up";
      if (el.hasAttribute("data-stagger")) {
        Array.from(el.children).forEach((item, i) =>
          tag(item as HTMLElement, Math.min(i * 70, 350), (item as HTMLElement).dataset.reveal ?? dir),
        );
      } else {
        tag(el, 0, dir);
      }
    };
    for (const section of Array.from(document.querySelectorAll("section"))) {
      Array.from(section.children).forEach((child) => visit(child as HTMLElement));
    }

    const revealIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          revealIo.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    // Reveal anything already on screen synchronously (no flash), then observe.
    for (const el of tagged) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.setAttribute("data-in", "");
      revealIo.observe(el);
    }

    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const countIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          countIo.unobserve(el);
          const target = Number.parseInt(el.dataset.count ?? "0", 10);
          const start = performance.now();
          const duration = 1300;
          const step = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.6 },
    );
    for (const el of counters) {
      el.textContent = "0";
      countIo.observe(el);
    }

    return () => {
      revealIo.disconnect();
      countIo.disconnect();
      for (const el of tagged) {
        el.removeAttribute("data-rv");
        el.removeAttribute("data-in");
        el.style.transitionDelay = "";
      }
      for (const el of counters) el.textContent = el.dataset.count ?? el.textContent;
    };
  }, []);

  return null;
}
