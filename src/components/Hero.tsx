import { links, mailto } from "@/content/links";
import { hero } from "@/lib/site";

/** Display headline, one small context line, mono tools, mono links. No image. */
export function Hero() {
  return (
    <>
      <h1 className="text-display md:text-display-lg">{hero.headline}</h1>

      <p className="mt-4 text-small text-fg-muted">{hero.context}</p>

      <p className="mt-2 text-meta-mono text-fg-faint">{hero.tools}</p>

      <ul className="mt-4 flex flex-wrap items-center gap-x-2 text-meta-mono text-fg-muted">
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
          <a href={mailto} className="link-quiet">
            email
          </a>
        </li>
      </ul>
    </>
  );
}
