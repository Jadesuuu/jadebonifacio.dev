import Link from "next/link";
import type { Employer, Project } from "@/content/projects";

/**
 * "The day job" on /work is a grouped ledger, one group per employer: the
 * employer (name, role, tenure, what can be shown) in a left column that
 * spans every engagement under it, the engagements stacked on the right as
 * rows. The employer is the frame and the rows are its items — a reader
 * squinting sees one block per employer, not a section and a stray project.
 * New engagements at the same employer extend the right column; a second
 * employer is a second group. Below 900px the employer block becomes the
 * group's header and its rows nest beneath it, indented off a hairline, so
 * the employer still frames them when the two columns cannot sit side by side.
 *
 * Client work under NDA has no picture to show, so a row is a ledger, not a
 * card: title (an h4 under the employer's h3, subordinate at 22px), a muted
 * mono meta line, the shape of the work, the stack, then the figures that
 * travel with it — numerals in the display face on hairlines, tabular, three
 * up, counting up via ScrollReveal's data-count; single-column numeral-
 * beside-fact rows below 560px. The whole row is the link; the title's brass
 * underline draws on hover like every other row on the site.
 */
const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

export function EmployerGroup({ employer, engagements }: { employer: Employer; engagements: Project[] }) {
  const n = engagements.length;
  const count = `${WORDS[n] ?? String(n)} ${n === 1 ? "engagement" : "engagements"}`;
  return (
    <div className="grid grid-cols-[minmax(200px,240px)_minmax(0,1fr)] gap-x-14 border-y border-border pt-7 max-[900px]:grid-cols-1 max-[900px]:gap-x-0">
      {/* Sticky only where the two columns exist; below 900px it is the header. */}
      <div className="self-start pb-7 min-[901px]:sticky min-[901px]:top-24 max-[900px]:pb-5">
        <h3 className="m-0 text-[20px] font-medium leading-snug">{employer.name}</h3>
        <p className="m-0 mt-1.5 font-mono text-[14px] leading-snug tracking-[0.02em] text-fg-muted">{employer.role}</p>
        <p className="m-0 mt-1 font-mono text-[14px] leading-snug tracking-[0.02em] text-fg-faint">{employer.tenure}</p>
        <p className="m-0 mt-4 max-w-[28ch] font-mono text-[14px] leading-snug tracking-[0.02em] text-fg-faint">
          {count} · {employer.note}
        </p>
      </div>

      {/* The first row shares the group's top hairline; every next row draws its own. */}
      <ol data-stagger className="m-0 list-none p-0 max-[900px]:mb-7 max-[900px]:border-l max-[900px]:border-border max-[900px]:pl-5">
        {engagements.map((project, i) => (
          <li key={project.slug} className={i === 0 ? "" : "border-t border-border"}>
            <EngagementRow project={project} first={i === 0} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function EngagementRow({ project, first }: { project: Project; first: boolean }) {
  const meta = [project.period, project.eyebrow].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/work/${project.slug}`}
      // The title names the link; the body (meta, figures that count up) stays
      // readable content rather than a sixty-word, mutating link name.
      aria-labelledby={`eng-${project.slug}`}
      className={`group flex flex-col gap-3 pb-7 text-fg max-[900px]:pb-6 ${first ? "pt-0" : "pt-7 max-[900px]:pt-6"}`}
    >
      <h4
        id={`eng-${project.slug}`}
        className="m-0 self-start text-[22px] font-medium leading-tight max-[900px]:text-[20px]"
        style={{ viewTransitionName: `work-title-${project.slug}` }}
      >
        <span className="underline-draw">{project.title}</span>
      </h4>
      <p className="m-0 -mt-1.5 font-mono text-[14px] tracking-[0.02em] text-fg-muted">{meta}</p>
      <p className="m-0 max-w-[56ch] text-[16px] leading-relaxed text-fg-muted">{project.description}</p>
      <p className="m-0 text-pretty font-mono text-[14px] text-fg-faint">{project.stack.join(" · ")}</p>

      {project.figures?.length ? (
        <dl className="m-0 mt-3 grid grid-cols-3 gap-x-6 max-[560px]:grid-cols-1">
          {project.figures.map((figure) => (
            <div
              key={figure.label}
              className="border-t border-border pt-3 max-[560px]:grid max-[560px]:grid-cols-[4.5ch_minmax(0,1fr)] max-[560px]:items-baseline max-[560px]:gap-x-4 max-[560px]:py-3"
            >
              <dt
                className="font-display m-0 leading-none tabular-nums"
                style={{ fontSize: "clamp(28px,2.8vw,34px)" }}
                data-count={figure.count ? figure.value : undefined}
              >
                {figure.value}
              </dt>
              <dd className="m-0 mt-2 font-mono text-[14px] leading-snug text-fg-muted max-[560px]:mt-0">
                {figure.label}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <span className="v2-underline mt-2 self-start font-mono text-[14px] text-fg">{project.cta}</span>
    </Link>
  );
}
