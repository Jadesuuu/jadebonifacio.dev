/**
 * Home loading skeleton (root segment). Shows on a cold navigation to "/" —
 * e.g. selecting Home or a home-section jump from the command palette while on
 * another page. Renders in the root layout (which has no nav of its own), so it
 * sketches the home nav row and the hero grid to match the real page's shape.
 */
export default function Loading() {
  const bar = (w: string, h = "h-4") => `${h} ${w} rounded border border-border bg-bg-subtle`;
  return (
    <div className="min-h-dvh bg-bg" aria-busy="true" aria-label="Loading">
      {/* nav row */}
      <div className="mx-auto flex max-w-[1080px] items-center gap-6 px-6 py-4 md:px-8">
        <div className={bar("w-32", "h-4")} />
        <div className="flex-1" />
        <div className={`${bar("w-44", "h-3.5")} max-[840px]:hidden`} />
      </div>

      {/* hero grid */}
      <div className="mx-auto grid max-w-[1080px] grid-cols-[1.15fr_0.85fr] items-center gap-16 px-6 pt-24 pb-[72px] md:px-8 max-[840px]:grid-cols-1 max-[840px]:gap-10">
        <div className="animate-pulse space-y-5 motion-reduce:animate-none">
          <div className={bar("w-40", "h-6")} />
          <div className={bar("w-4/5", "h-14")} />
          <div className={bar("w-3/5", "h-14")} />
          <div className={bar("w-3/4", "h-4")} />
          <div className="flex gap-3 pt-2">
            <div className={bar("w-32", "h-10")} />
            <div className={bar("w-28", "h-10")} />
          </div>
        </div>
        <div className="w-full max-w-[380px] justify-self-end max-[840px]:max-w-[340px] max-[840px]:justify-self-start">
          <div
            className="animate-pulse rounded-2xl border border-border bg-bg-subtle motion-reduce:animate-none"
            style={{ aspectRatio: "4 / 5" }}
          />
        </div>
      </div>
    </div>
  );
}
