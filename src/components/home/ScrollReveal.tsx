"use client";

import { useEffect } from "react";

/**
 * Home scroll animations (Portfolio Home v2):
 *
 *  1. Reveal — each <section>'s direct children fade + slide up as they enter
 *     the viewport (the `[data-rv]` styles in globals.css). Containers marked
 *     data-stagger reveal their own children in sequence (70ms steps, capped).
 *     Timeline cards are left to StoryEffects; the cursor-glow is skipped.
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
    const tag = (el: HTMLElement, delay: number) => {
      el.setAttribute("data-rv", "");
      if (delay) el.style.transitionDelay = `${delay}ms`;
      tagged.push(el);
    };

    for (const section of Array.from(document.querySelectorAll("section"))) {
      for (const child of Array.from(section.children)) {
        const el = child as HTMLElement;
        if (el.hasAttribute("data-glow")) continue;
        // Timeline card rows animate via StoryEffects, not here.
        if (el.querySelector(":scope > [data-tl-card]")) continue;
        if (el.hasAttribute("data-stagger")) {
          Array.from(el.children).forEach((item, i) =>
            tag(item as HTMLElement, Math.min(i * 70, 350)),
          );
        } else {
          tag(el, 0);
        }
      }
    }

    const revealIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute("data-in", entry.isIntersecting);
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
