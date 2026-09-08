import { resolveWorkLink, type WorkFrontmatter } from "@/lib/work";

/**
 * Case-study header (DESIGN.md): mono label in --accent (year · kind), serif
 * H1, one-sentence summary in --fg-muted, lowercase mono stack line, optional
 * scale line, then the button row: the first link is a filled brass pill, the
 * rest are ghost pills, and any note renders as faint mono text beside them.
 * Status lives in the pills, not the label. The H1 carries a shared
 * view-transition-name so the project-card title morphs into it on navigation.
 */
export function CaseStudyHeader({ slug, meta }: { slug: string; meta: WorkFrontmatter }) {
  const label = [meta.year, meta.kind].filter(Boolean).join(" · ");

  const items = (meta.links ?? []).map((link) => ({
    ...link,
    href: link.to ? resolveWorkLink(link.to) : null,
  }));
  const primary = items.find((item) => item.href);

  return (
    <header className="v2-fade-up">
      <p className="text-meta-mono text-accent">{label}</p>

      <h1 className="v2-h1 mt-4" style={{ viewTransitionName: `work-title-${slug}` }}>
        {meta.title}
      </h1>

      <p className="mt-4 text-fg-muted">{meta.summary}</p>

      <p className="mt-4 text-meta-mono text-fg-faint">
        {meta.stack.map((s) => s.toLowerCase()).join(" · ")}
      </p>

      {meta.scale ? <p className="mt-2 text-meta-mono text-fg-muted">{meta.scale}</p> : null}

      {items.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {items.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                className={item === primary ? "v2-pill v2-pill-primary" : "v2-pill v2-pill-ghost"}
                rel="noopener"
                target="_blank"
              >
                {item.label} ↗
              </a>
            ) : (
              <span key={item.label} className="font-mono text-xs text-fg-faint">
                {item.label}
                {item.note ? ` — ${item.note}` : ""}
              </span>
            ),
          )}
        </div>
      ) : null}
    </header>
  );
}
