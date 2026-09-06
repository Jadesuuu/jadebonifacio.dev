import { Container } from "@/components/Container";

/**
 * Instant skeleton for cold RSC navigations to /work/*. The case-study pages
 * are static, but a prefetch miss still fetches the payload on click — this
 * renders immediately so the click never feels like a hang.
 *
 * Rendered into the (site) layout's <main>, so it uses Container (not its own
 * landmark) to match the real page's column and padding exactly — the swap
 * lands with no layout shift. Bars mirror the case-study header (eyebrow →
 * title → subtitle → stack → links), the first screenshot frame, then prose.
 */
export default function Loading() {
  const bar = (w: string, h = "h-4") => `${h} ${w} rounded border border-border bg-bg-subtle`;
  return (
    <Container as="div" className="pt-16 pb-12 md:pt-24">
      <div
        aria-busy="true"
        aria-label="Loading case study"
        className="animate-pulse space-y-4 motion-reduce:animate-none"
      >
        {/* eyebrow: 2026 · side project · live in production */}
        <div className={bar("w-64", "h-3.5")} />
        {/* title */}
        <div className={bar("w-4/5", "h-9")} />
        {/* subtitle */}
        <div className={bar("w-3/5", "h-5")} />
        {/* stack line */}
        <div className={bar("w-72", "h-3.5")} />
        {/* links line */}
        <div className={bar("w-40", "h-3.5")} />
        {/* first screenshot frame */}
        <div className="mt-10 aspect-[16/10] w-full rounded-md border border-border bg-bg-subtle" />
        {/* prose */}
        <div className="mt-10 space-y-3">
          <div className={bar("w-48", "h-6")} />
          <div className={bar("w-full")} />
          <div className={bar("w-full")} />
          <div className={bar("w-2/3")} />
        </div>
      </div>
    </Container>
  );
}
