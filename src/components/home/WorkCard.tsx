import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";

/**
 * One "selected work" card (DESIGN.md, Selected work): --bg-subtle, hairline
 * border, 16px radius, media on one side and text on the other, alternating
 * per row. A project with a hosted demo carries a nested `live demo ↗` link, so
 * its card is an <article> with the case-study link stretched over it via a
 * pseudo-element and the demo link layered above. A project without a demo is
 * one big <Link>. A project that cannot be shown has no image; it shows a
 * hatched slot. The data-work-* hooks are WorkIndexMotion's (the scrubbed
 * unveil on /work); the default CSS leaves everything visible without them.
 */
export function WorkCard({ project, imageFirst }: { project: Project; imageFirst: boolean }) {
  const href = `/work/${project.slug}`;
  const shell = [
    "v2-card group grid overflow-hidden rounded-2xl border border-border bg-bg-subtle",
    imageFirst ? "grid-cols-[1.1fr_1fr]" : "grid-cols-[1fr_1.1fr]",
    "max-[840px]:grid-cols-[minmax(0,1fr)]",
  ].join(" ");

  const media = <Media key="media" project={project} />;
  const body = <Body key="body" project={project} href={href} stretched={Boolean(project.demo)} />;
  const children = imageFirst ? [media, body] : [body, media];
  const rowKind = imageFirst ? "image-first" : "text-first";

  if (project.demo) {
    return (
      <article className={`${shell} relative`} data-work-row={rowKind}>
        {children}
      </article>
    );
  }
  return (
    <Link href={href} className={shell} data-work-row={rowKind}>
      {children}
    </Link>
  );
}

// overflow-hidden: the unveil settles the capture from a slight zoom, which
// must not spill into the text column.
const mediaBox =
  "relative min-h-[240px] overflow-hidden max-[840px]:order-first max-[840px]:aspect-[16/10] max-[840px]:min-h-0";

function Media({ project }: { project: Project }) {
  if (project.hasImage && project.thumbnail) {
    return (
      <div className={mediaBox} data-work-media>
        <Image
          src={project.thumbnail}
          alt={project.thumbnailAlt ?? `${project.title} screenshot`}
          fill
          sizes="(max-width:840px) 100vw, 540px"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className={`${mediaBox} flex items-center justify-center`}
      data-work-media
      style={{
        background:
          "repeating-linear-gradient(-45deg,var(--bg-subtle),var(--bg-subtle) 8px,var(--bg) 8px,var(--bg) 16px)",
      }}
    >
      <span className="rounded-md border border-border bg-bg px-3.5 py-2 font-mono text-[14px] text-fg-muted">
        no screenshots — nda
      </span>
    </div>
  );
}

function Body({ project, href, stretched }: { project: Project; href: string; stretched: boolean }) {
  const cta = "v2-underline mt-2 self-start font-mono text-[14px] text-fg";
  return (
    <div className="flex flex-col justify-center gap-3 p-9" data-work-body>
      {/* An h3: the rows sit under /work's "Recent work" h2.
          Title first; the mono line sits under it as a subtitle. A small
          tracked label above a heading is the one thing the craft floor bans
          outright, and the home cards already read this way. */}
      <h3 className="m-0 text-[26px] font-medium" style={{ viewTransitionName: `work-title-${project.slug}` }}>
        {project.title}
      </h3>
      <p className="m-0 -mt-1.5 font-mono text-[14px] tracking-[0.04em] text-accent">{project.eyebrow}</p>
      <p className="m-0 text-[16px] leading-relaxed text-fg-muted">{project.description}</p>
      <p className="m-0 text-pretty font-mono text-[14px] text-fg-faint">
        {/* nbsp before each separator: the line may break only between items, never
            leaving a lone middot or the demo arrow on its own line. */}
        {project.stack.join("\u00a0· ")}
        {project.demo ? (
          <span className="text-accent">
            {"\u00a0· "}
            <a
              href={project.demo}
              target="_blank"
              rel="noopener"
              className="relative z-10 whitespace-nowrap text-accent underline decoration-transparent decoration-1 underline-offset-[3px] transition-colors hover:decoration-accent"
            >
              live demo ↗
            </a>
          </span>
        ) : null}
      </p>
      {stretched ? (
        <Link href={href} className={`${cta} after:absolute after:inset-0 after:z-[1] after:content-['']`}>
          {project.cta}
        </Link>
      ) : (
        <span className={cta}>{project.cta}</span>
      )}
    </div>
  );
}
