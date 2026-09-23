import Link from "next/link";
import type { Project } from "@/content/projects";

/**
 * One engagement under "The day job" on /work. Client work under NDA has no
 * picture to show, so the row is a ledger, not a card: the title and the
 * shape of the work on the left, the figures that travel with it on the
 * right, each numeral in the display face on its own hairline so they read
 * as a smaller sibling of the four on /about (and count up the same way:
 * data-count is ScrollReveal's). The whole row is the link; the title's
 * brass underline draws on hover like every other row on the site.
 */
export function EmployerRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-x-14 gap-y-7 border-t border-border py-9 text-fg max-[840px]:grid-cols-1"
    >
      <div className="flex flex-col gap-3">
        <h3
          className="m-0 self-start text-[26px] font-medium leading-tight"
          style={{ viewTransitionName: `work-title-${project.slug}` }}
        >
          <span className="underline-draw">{project.title}</span>
        </h3>
        <p className="m-0 -mt-1.5 font-mono text-[14px] tracking-[0.04em] text-accent">{project.eyebrow}</p>
        <p className="m-0 max-w-[52ch] text-[16px] leading-relaxed text-fg-muted">{project.description}</p>
        <p className="m-0 text-pretty font-mono text-[14px] text-fg-faint">{project.stack.join(" · ")}</p>
        <span className="v2-underline mt-2 self-start font-mono text-[14px] text-fg">{project.cta}</span>
      </div>

      {/* Three columns down to phones, where the figures become ledger rows
          (numeral beside its fact, like the /about ledger) rather than a
          2 + 1 orphan. */}
      {project.figures?.length ? (
        <dl className="m-0 grid grid-cols-3 gap-x-6 gap-y-6 self-start max-[560px]:grid-cols-1 max-[560px]:gap-y-0">
          {project.figures.map((figure) => (
            <div
              key={figure.label}
              className="border-t border-border pt-3 max-[560px]:grid max-[560px]:grid-cols-[4.5ch_minmax(0,1fr)] max-[560px]:items-baseline max-[560px]:gap-x-4 max-[560px]:py-3"
            >
              <dt
                className="font-display m-0 leading-none tabular-nums"
                style={{ fontSize: "clamp(30px,3.2vw,40px)" }}
                data-count={figure.count ? figure.value : undefined}
              >
                {figure.value}
              </dt>
              <dd className="m-0 mt-2.5 font-mono text-[14px] leading-snug text-fg-muted max-[560px]:mt-0">
                {figure.label}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Link>
  );
}
