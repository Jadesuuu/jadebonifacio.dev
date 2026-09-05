import Image from "next/image";

type FigureProps = {
  /** Path under public/, e.g. /images/work/scoutboard/hero.png */
  src: string;
  /** Real description of what the screenshot shows. */
  alt: string;
  /** Mono caption below the image (DESIGN.md, Case study body). */
  caption: string;
  /** Intrinsic pixel dimensions. Strings because MDX passes attributes as
   *  strings; they set the aspect ratio so nothing shifts. */
  width: number | string;
  height: number | string;
  /** Break out toward 840px on desktop (images and code blocks may). */
  breakout?: boolean;
};

/**
 * A case-study screenshot. The wrapper reserves the exact box via aspect-ratio
 * (from width/height) so there is zero layout shift when the lazy image loads;
 * --bg-subtle fills that box until it paints (DESIGN.md). next/image serves
 * WebP (quality 82) with the PNG as fallback.
 */
export function Figure({ src, alt, caption, width, height, breakout = false }: FigureProps) {
  const w = Number(width);
  const h = Number(height);

  return (
    <figure className={breakout ? "mdx-figure mdx-breakout" : "mdx-figure"}>
      <div
        className="relative overflow-hidden rounded-[6px] bg-bg-subtle"
        style={{ aspectRatio: `${w} / ${h}` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          quality={82}
          sizes={
            breakout
              ? "(min-width: 888px) 840px, calc(100vw - 48px)"
              : "(min-width: 728px) 680px, calc(100vw - 48px)"
          }
          className="object-cover"
        />
      </div>
      <figcaption className="mt-2 text-meta-mono text-fg-faint">{caption}</figcaption>
    </figure>
  );
}
