import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { NextRow } from "@/components/NextRow";
import { SectionLabel } from "@/components/SectionLabel";
import { howIWorkParagraphs, lookingFor, smallerThings, who } from "@/content/about";
import { links, mailto } from "@/content/links";
import { getProject } from "@/content/projects";
import { site } from "@/lib/site";

const title = "About";

export const metadata: Metadata = {
  title,
  description: who,
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: `${title} · ${site.title}`, description: who },
  twitter: { title: `${title} · ${site.title}`, description: who },
};

const next = getProject("jf-and-the-world");

/**
 * /about (DESIGN.md, About page). Same column, H1, labelled sections at the
 * standard gap, no photo, and a closing "work →" row so the page does not
 * dead-end. No entrance motion: that is reserved for the homepage.
 */
export default function AboutPage() {
  return (
    <Container className="pt-16 md:pt-24">
      <h1>{title}</h1>

      <section className="mt-12 md:mt-16">
        <SectionLabel>who</SectionLabel>
        <p>{who}</p>
      </section>

      <section className="mt-16 md:mt-24">
        <SectionLabel>how i work</SectionLabel>
        <div className="space-y-4">
          {howIWorkParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mt-16 md:mt-24">
        <SectionLabel>smaller things</SectionLabel>
        <ul className="space-y-6">
          {smallerThings.map((thing) => (
            <li key={thing.title} className="flex flex-col gap-1">
              {thing.href ? (
                <a href={thing.href} className="link-body self-start font-medium" rel="noopener">
                  {thing.title}
                </a>
              ) : (
                <span className="font-medium">{thing.title}</span>
              )}
              <p className="text-small text-fg-muted">
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

      <section className="mt-16 md:mt-24">
        <SectionLabel>what i&apos;m looking for</SectionLabel>
        <p>{lookingFor}</p>
      </section>

      <section className="mt-16 md:mt-24">
        <SectionLabel>contact</SectionLabel>
        <ul className="flex flex-wrap items-center gap-x-2 text-meta-mono text-fg-muted">
          <li>
            <a href={mailto} className="link-quiet">
              {links.email}
            </a>
          </li>
          <li aria-hidden="true" className="text-fg-faint">
            ·
          </li>
          <li>
            <a href={links.github} className="link-quiet" rel="me noopener">
              github
            </a>
          </li>
          <li aria-hidden="true" className="text-fg-faint">
            ·
          </li>
          <li>
            <a href={links.linkedin} className="link-quiet" rel="me noopener">
              linkedin
            </a>
          </li>
          <li aria-hidden="true" className="text-fg-faint">
            ·
          </li>
          <li>
            <a href={links.resume} className="link-quiet" target="_blank" rel="noopener">
              resume (pdf)
            </a>
          </li>
        </ul>
      </section>

      {next ? (
        <div className="mt-16 md:mt-24">
          <NextRow label="work" title={next.title} href={`/work/${next.slug}`} />
        </div>
      ) : null}
    </Container>
  );
}
