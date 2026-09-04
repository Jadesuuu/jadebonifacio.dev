import type { Metadata } from "next";
import Link from "next/link";

// Next adds <meta name="robots" content="noindex"> to not-found on its own.
export const metadata: Metadata = {
  title: "Nothing here",
};

/**
 * 404 (DESIGN.md). The one place brass fills the screen: full-viewport
 * --accent, --fg-on-accent text in both themes, one line and a mono link
 * home. Rendered outside the (site) shell, so no nav or footer. Fades in over
 * 150ms; the global reduced-motion rule collapses that to nothing.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-1 animate-fade-in flex-col items-center justify-center gap-4 bg-accent px-6 text-center text-fg-on-accent">
      <h1 className="text-display text-fg-on-accent">nothing here.</h1>
      <Link
        href="/"
        className="text-meta-mono text-fg-on-accent underline decoration-fg-on-accent/50 underline-offset-[3px] transition-colors duration-150 ease-out-quiet hover:decoration-fg-on-accent focus-visible:outline-fg-on-accent motion-reduce:transition-none"
      >
        back home
      </Link>
    </main>
  );
}
