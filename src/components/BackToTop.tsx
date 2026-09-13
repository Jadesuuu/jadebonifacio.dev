"use client";

/**
 * The footer's back-to-top control, disguised as a half-disc breaking the
 * footer's top hairline: --bg-subtle, hairline border, a chevron inside. It
 * is the one control that reads as furniture until you need it. Smooth scroll
 * unless the visitor prefers reduced motion.
 */
export function BackToTop() {
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      className="v2-totop absolute left-1/2 top-0 flex h-8 w-16 -translate-x-1/2 -translate-y-full items-end justify-center rounded-t-full border border-b-0 border-border bg-bg-subtle pb-1.5 text-fg-muted transition-colors duration-150 ease-out-quiet hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m6 15 6-6 6 6" />
      </svg>
    </button>
  );
}
