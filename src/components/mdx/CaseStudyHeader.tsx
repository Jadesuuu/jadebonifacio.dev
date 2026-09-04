import { Fragment } from "react";
import { resolveWorkLink, type WorkFrontmatter } from "@/lib/work";

/**
 * Case-study header (DESIGN.md): mono label in --accent (year · kind · status),
 * H1, one-sentence summary in --fg-muted, meta line of stack, links row. The
 * H1 carries a shared view-transition-name so the project-row title morphs into
 * it on navigation.
 */
export function CaseStudyHeader({ slug, meta }: { slug: string; meta: WorkFrontmatter }) {
  const label = [meta.year, meta.kind, meta.status].filter(Boolean).join(" · ");

  return (
    <header>
      <p className="text-meta-mono text-accent">{label}</p>

      <h1 className="mt-4" style={{ viewTransitionName: `work-title-${slug}` }}>
        {meta.title}
      </h1>

      <p className="mt-4 text-fg-muted">{meta.summary}</p>

      <p className="mt-4 text-meta-mono text-fg-faint">{meta.stack.join(" · ")}</p>

      {meta.links && meta.links.length > 0 ? (
        <ul className="mt-2 flex flex-wrap items-center gap-x-2 text-meta-mono text-fg-muted">
          {meta.links.map((link, i) => {
            const href = link.to ? resolveWorkLink(link.to) : null;
            return (
              <Fragment key={link.label}>
                {i > 0 ? (
                  <li aria-hidden="true" className="text-fg-faint">
                    ·
                  </li>
                ) : null}
                <li>
                  {href ? (
                    <a href={href} className="link-quiet" rel="noopener" target="_blank">
                      {link.label}
                    </a>
                  ) : (
                    <span className="text-fg-faint">
                      {link.label}
                      {link.note ? `: ${link.note}` : ""}
                    </span>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ul>
      ) : null}
    </header>
  );
}
