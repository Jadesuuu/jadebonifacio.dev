import { Container } from "@/components/Container";
import { hero, site } from "@/lib/site";

/**
 * Placeholder home: the hero only, with the exact copy from DESIGN.md.
 * Exists to verify tokens, fonts, spacing and both themes.
 */
export default function HomePage() {
  return (
    <Container as="section" className="pt-16 md:pt-24">
      <h1 className="text-display md:text-display-lg">{hero.headline}</h1>

      <p className="mt-4 text-small text-fg-muted">{hero.context}</p>

      <p className="mt-2 text-meta-mono text-fg-faint">{hero.tools}</p>

      <ul className="mt-4 flex flex-wrap items-center gap-x-2 text-meta-mono text-fg-muted">
        <li>
          <a href={site.github} className="link-quiet" rel="me noopener">
            github
          </a>
        </li>
        <li aria-hidden="true" className="text-fg-faint">
          ·
        </li>
        <li>
          <a href={site.linkedin} className="link-quiet" rel="me noopener">
            linkedin
          </a>
        </li>
        <li aria-hidden="true" className="text-fg-faint">
          ·
        </li>
        <li>
          <a href={`mailto:${site.email}`} className="link-quiet">
            email
          </a>
        </li>
      </ul>
    </Container>
  );
}
