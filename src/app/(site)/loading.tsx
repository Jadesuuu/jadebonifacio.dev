import { Container } from "@/components/Container";

/**
 * Loading skeleton for the (site) shell — covers /about and any (site) page
 * without its own loading (case studies have theirs). Rendered into the
 * layout's <main>, so it uses Container (not its own landmark) to match the
 * page column. A generic title + a couple of labelled paragraph blocks.
 */
export default function Loading() {
  const bar = (w: string, h = "h-4") => `${h} ${w} rounded border border-border bg-bg-subtle`;
  return (
    <Container as="div" className="pt-16 pb-12 md:pt-24">
      <div aria-busy="true" aria-label="Loading" className="animate-pulse space-y-8 motion-reduce:animate-none">
        <div className={bar("w-40", "h-9")} />
        <div className="space-y-3">
          <div className={bar("w-28", "h-3.5")} />
          <div className={bar("w-full")} />
          <div className={bar("w-full")} />
          <div className={bar("w-2/3")} />
        </div>
        <div className="space-y-3">
          <div className={bar("w-28", "h-3.5")} />
          <div className={bar("w-full")} />
          <div className={bar("w-5/6")} />
        </div>
      </div>
    </Container>
  );
}
