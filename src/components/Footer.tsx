import Link from "next/link";
import { BackToTop } from "@/components/BackToTop";
import { LocalClock } from "@/components/home/LocalClock";
import { navLinks, site } from "@/lib/site";

// Baked in at build time; the site is fully static.
const year = new Date().getFullYear();

/**
 * Footer: hairline top border with the back-to-top half-disc breaking it at
 * centre; then, in mono --fg-faint, the © line and the Manila clock left and
 * the same links as the nav right — the footer mirrors the header so the way
 * out is always the way in; the © line itself is a link home. The same 1080px shell as the nav on every page:
 * the frame never changes width, only the reading column inside it does.
 */
export function Footer() {
  const row = (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-7 pt-9 font-mono text-[14px] tracking-[0.02em] text-fg-faint">
      <span className="flex flex-wrap items-center gap-x-2">
        <Link href="/" className="link-quiet tap-target" aria-label="Home">
          © {year} {site.name}
        </Link>
        <span aria-hidden="true">·</span>
        <span>
          manila · <LocalClock />
        </span>
      </span>
      <nav aria-label="Footer">
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              {link.external ? (
                <a href={link.href} target="_blank" rel="noopener" className="link-quiet tap-target">
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className="link-quiet tap-target">
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return (
    <footer className="site-footer relative mt-20 border-t border-border bg-bg-subtle md:mt-28">
      <BackToTop />
      <div className="mx-auto max-w-[1080px] px-6 md:px-8">{row}</div>
    </footer>
  );
}
