import type { Metadata } from "next";
import { WorkCard } from "@/components/home/WorkCard";
import { smallerThings } from "@/content/about";
import { projects } from "@/content/projects";
import { site } from "@/lib/site";

const title = "Work";
const description =
  "Three case studies: what each project does, what broke, and how it was fixed.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/work" },
  openGraph: { url: "/work", title: `${title} · ${site.title}`, description },
  twitter: { title: `${title} · ${site.title}`, description },
};

/**
 * /work — the case-study index. The home page shows the same three works as
 * compact cards; here they get the full alternating rows (media one side,
 * description, stack, CTA) so the index earns its own route. Renders from
 * src/content/projects.ts, the single source for what counts as a work.
 * Below the three: the smaller things — builds that did not earn a write-up
 * but are still work, so they live here rather than on /about.
 */
export default function WorkIndexPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px] px-6 pt-16 md:px-8 md:pt-24">
      <h1 className="v2-h1">{title}</h1>
      <p className="mt-4 max-w-[56ch] text-[18px] leading-relaxed text-fg-muted">{description}</p>
      <div className="mt-12 flex flex-col gap-8 md:mt-16">
        {projects.map((project, i) => (
          <WorkCard key={project.slug} project={project} imageFirst={i % 2 === 0} />
        ))}
      </div>

      <section className="mt-20 max-w-column md:mt-24" aria-labelledby="smaller-h">
        <h2 id="smaller-h" className="font-display m-0 mb-6" style={{ fontSize: "clamp(28px,3.6vw,38px)", lineHeight: 1.12 }}>
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
