import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";

/**
 * One row of "selected work". The whole row is the link. Text column 1fr,
 * image 180px on desktop; stacked with the image first on mobile. Top hairline,
 * 24px vertical padding. Rows without an image have no image slot at all.
 *
 * Hover (transform only, 200ms): image rotates -1.5deg and scales 1.02; the
 * title's accent underline draws left to right (see .underline-draw).
 */
export function ProjectRow({ project }: { project: Project }) {
  const showImage = project.hasImage && project.thumbnail;

  return (
    <Link
      href={`/work/${project.slug}`}
      className={[
        "group grid items-center gap-6 border-t border-border py-6 text-fg",
        showImage ? "md:grid-cols-[1fr_180px] md:gap-8" : "",
      ].join(" ")}
    >
      <span className="flex flex-col gap-2">
        <span
          className="underline-draw self-start text-h3"
          style={{ viewTransitionName: `work-title-${project.slug}` }}
        >
          {project.title}
        </span>
        <span className="text-small text-fg-muted">{project.description}</span>
        <span className="text-meta-mono text-fg-faint">{project.stack.join(" · ")}</span>
      </span>

      {showImage ? (
        <Image
          src={project.thumbnail as string}
          alt={`${project.title} screenshot`}
          width={360}
          height={240}
          sizes="180px"
          className={[
            "h-[120px] w-[180px] rounded-[6px] bg-bg-subtle max-md:order-first",
            "transition-transform duration-200 ease-out-quiet",
            "group-hover:-rotate-[1.5deg] group-hover:scale-[1.02]",
            "motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100",
          ].join(" ")}
        />
      ) : null}
    </Link>
  );
}
