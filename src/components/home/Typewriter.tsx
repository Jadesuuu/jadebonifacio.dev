"use client";

import { useEffect, useState } from "react";

// The three lines the hero cycles through, typed then deleted.
const PHRASES = [
  "I ship production apps from zero.",
  "I fix the ones other people wrote.",
  "I build realtime things at night.",
];

/**
 * Hero typewriter. Types a phrase, holds, deletes, moves to the next — 42ms per
 * character in, 22ms out, forever. With reduced motion it just shows the first
 * phrase and never animates. The trailing accent underscore blinks in CSS.
 */
export function Typewriter() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(PHRASES[0]);
      return;
    }

    let timer = 0;
    let cancelled = false;

    const run = (i: number) => {
      const phrase = PHRASES[i % PHRASES.length];
      const type = (n: number) => {
        if (cancelled) return;
        setTyped(phrase.slice(0, n));
        timer = window.setTimeout(
          () => (n < phrase.length ? type(n + 1) : del(phrase.length)),
          n < phrase.length ? 42 : 2200,
        );
      };
      const del = (n: number) => {
        if (cancelled) return;
        setTyped(phrase.slice(0, n));
        timer = window.setTimeout(() => (n > 0 ? del(n - 1) : run(i + 1)), n > 0 ? 22 : 350);
      };
      type(0);
    };

    run(0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {typed}
      <span className="v2-blink text-accent" aria-hidden="true">
        _
      </span>
    </>
  );
}
