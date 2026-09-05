type FigureProps = {
  /** Caption, shown in mono below the image (DESIGN.md, Case study body). */
  caption: string;
  /** What the real screenshot will show; drawn inside the placeholder. */
  label?: string;
  /** Aspect ratio, e.g. "16/10" (default) or "16/9". */
  ratio?: string;
  /** Break out toward 840px on desktop (images and code blocks may). */
  breakout?: boolean;
};

// TODO: real screenshots against seeded demo data (DESIGN.md, Images). Until
// they exist, Figure reserves the correct space with a labelled --bg-subtle
// box, so there is no layout shift when images drop in. The box is not shown
// as if it were a screenshot; it is clearly a pending placeholder.
export function Figure({ caption, label, ratio = "16/10", breakout = false }: FigureProps) {
  return (
    <figure className={breakout ? "mdx-figure mdx-breakout" : "mdx-figure"}>
      <div
        className="flex items-center justify-center rounded-[6px] border border-border bg-bg-subtle"
        style={{ aspectRatio: ratio }}
      >
        {label ? (
          // --fg-muted, not --fg-faint: the box background is --bg-subtle, where
          // faint would fall under AA. Muted clears it and the label is a
          // placeholder note anyway.
          <span className="px-6 text-center text-meta-mono text-fg-muted">{label}</span>
        ) : null}
      </div>
      <figcaption className="mt-2 text-meta-mono text-fg-faint">{caption}</figcaption>
    </figure>
  );
}
