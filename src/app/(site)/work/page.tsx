import type { Metadata } from "next";
import { EmployerGroup } from "@/components/home/EmployerRow";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { WorkCard } from "@/components/home/WorkCard";
import { WorkIndexMotion } from "@/components/home/WorkIndexMotion";
import { smallerThings } from "@/content/about";
import { dayJobLead, employers, engagementsOf, recentWork } from "@/content/projects";
import { site } from "@/lib/site";

const title = "Work";
const description =
  "Case studies from the evenings and from the day job: what each one does, what broke, and how it was fixed.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/work" },
  openGraph: { url: "/work", title: `${title} · ${site.title}`, description },
  twitter: { title: `${title} · ${site.title}`, description },
};

// Section headings carry themselves: the meta line (who, when) sits BELOW
// each one as a mono subtitle, never above it as a label.
const h2 = "font-display m-0";
const h2Size = { fontSize: "clamp(28px,3.6vw,38px)", lineHeight: 1.12 };

/**
 * /work — the case-study index, in two registers.
 *
 * "Recent work" is the side projects: built from zero in the evenings, each
 * with real screenshots, so they get the full alternating rows (media one
 * side, description, stack, CTA) and the page's one authored motion — the
 * capture unveils as the row scrolls in (WorkIndexMotion). The home page
 * shows the newest three of these as compact cards.
 *
 * "The day job" is the employer engagements: client work under NDA, nothing
 * to screenshot, so a card would only ever hold a hatched slot. They are a
 * grouped ledger instead (EmployerGroup): one group per employer, the
 * employer in a left column spanning its engagements, each engagement a row
 * on the right with the shape of the work and the figures that travel with
 * it. New engagements slot in as rows; a new employer is a new group. Recent work comes first because its evidence is visual and the
 * reader is here to look; the day job's evidence is numbers, and it reads
 * better once the reader has seen what the evenings produce.
 *
 * Below both: the smaller things — builds that did not earn a write-up but
 * are still work, so they live here rather than on /about. Renders from
 * src/content/projects.ts, the single source for what counts as a work.
 */
export default function WorkIndexPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px] px-6 pt-16 md:px-8 md:pt-24">
      <WorkIndexMotion />
      <ScrollReveal />

      <h1 className="v2-h1">{title}</h1>
      <p className="mt-4 max-w-[56ch] text-[18px] leading-relaxed text-fg-muted">{description}</p>

      {/* The rows choreograph themselves (scrubbed unveil), so ScrollReveal
          leaves this section alone. */}
      <section className="mt-14 md:mt-20" aria-labelledby="recent-h" data-no-reveal>
        <h2 id="recent-h" className={h2} style={h2Size}>
          Recent work
        </h2>
        <p className="mt-3 text-meta-mono text-fg-muted">built from zero in the evenings, alongside the day job · 2025–26</p>
        <div className="mt-8 flex flex-col gap-8 md:mt-10">
          {recentWork.map((project, i) => (
            <WorkCard key={project.slug} project={project} imageFirst={i % 2 === 0} />
          ))}
        </div>
      </section>

      <section className="mt-20 md:mt-28" aria-labelledby="dayjob-h">
        <h2 id="dayjob-h" className={h2} style={h2Size}>
          The day job
        </h2>
        <p className="mt-4 max-w-[56ch] text-[18px] leading-relaxed text-fg-muted">{dayJobLead}</p>
        <div className="mt-8 flex flex-col gap-12 md:mt-10">
          {employers.map((employer) => (
            <EmployerGroup key={employer.id} employer={employer} engagements={engagementsOf(employer)} />
          ))}
        </div>
      </section>

      <section className="mt-20 max-w-column md:mt-28" aria-labelledby="smaller-h">
        <h2 id="smaller-h" className={`${h2} mb-6`} style={h2Size}>
          Smaller things
        </h2>
        <ul data-stagger className="space-y-6">
          {smallerThings.map((thing) => (
            <li key={thing.title} className="flex flex-col gap-1">
              {thing.href ? (
                <a href={thing.href} className="link-body self-start font-medium" rel="noopener">
                  {thing.title}
                </a>
              ) : (
                <span className="font-medium">{thing.title}</span>
              )}
              <p className="text-[16px] leading-relaxed text-fg-muted">
                {thing.description}
                {thing.title === "This site" && thing.href ? (
                  <>
                    {" "}
                    Source on{" "}
                    <a href={thing.href} className="link-body" rel="noopener">
                      GitHub
                    </a>
                    .
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
