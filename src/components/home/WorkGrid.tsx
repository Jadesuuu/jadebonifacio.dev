import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";

/**
 * The three latest works, as three equal cards in a row (stacked below
 * 840px). Thumbnail on top at 16:10, then the title and one line of kind.
 * A project with a hosted demo carries a nested `live demo ↗` link, so its
 * card is an <article> with the case-study link stretched over it and the
 * demo link layered above; a project without one is a single <Link>. The
 * NDA project has no image and shows the hatched slot — the honest
 * thumbnail, never a fabricated mockup.
 */
export function WorkGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-3 gap-5 max-[840px]:grid-cols-1 max-[840px]:gap-4">
      {projects.map((project) => (
        <WorkGridCard key={project.slug} project={project} />
      ))}
    </div>
  );
}

function WorkGridCard({ project }: { project: Project }) {
  const href = `/work/${project.slug}`;
  const shell =
    "v2-card group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-bg-subtle";

  const body = (
    <>
      <Media project={project} />
      <div className="flex flex-col gap-1.5 px-5 pb-5 pt-4">
        <h3 className="m-0 text-[20px] font-medium leading-snug">{project.title}</h3>
        <p className="m-0 font-mono text-[13.5px] text-fg-muted">
          {project.eyebrow}
          {project.demo ? (
            <>
              {" · "}
              <a
                href={project.demo}
                target="_blank"
                rel="noopener"
                className="tap-target relative z-10 text-accent underline decoration-transparent decoration-1 underline-offset-[3px] transition-colors hover:decoration-accent"
              >
                live demo ↗
              </a>
            </>
          ) : null}
        </p>
      </div>
    </>
  );

  if (project.demo) {
    return (
      <article className={shell}>
        {body}
        <Link
          href={href}
          aria-label={`${project.title} — read the case study`}
          className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </article>
    );
  }
  return (
    <Link href={href} className={shell}>
      {body}
    </Link>
  );
}

function Media({ project }: { project: Project }) {
  if (project.hasImage && project.thumbnail) {
    return (
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={project.thumbnail}
          alt={project.thumbnailAlt ?? `${project.title} screenshot`}
          fill
          sizes="(max-width:840px) 100vw, 340px"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className="flex aspect-[16/10] w-full items-center justify-center"
      style={{
        background:
          "repeating-linear-gradient(-45deg,var(--bg-subtle),var(--bg-subtle) 8px,var(--bg) 8px,var(--bg) 16px)",
      }}
    >
      <span className="rounded-md border border-border bg-bg px-3 py-1.5 font-mono text-[14px] text-fg-muted">
        no screenshots — nda
      </span>
    </div>
  );
}
