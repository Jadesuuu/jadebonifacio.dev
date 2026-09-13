"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navLinks, site } from "@/lib/site";

// The palette pulls in cmdk and Radix Dialog. Load it only on first open so it
// stays out of the initial bundle on every page. It never renders on the
// server, so ssr:false is correct here.
const CommandPalette = dynamic(
  () => import("@/components/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false },
);

/**
 * The one sticky nav, on every page, at the 1080px shell the footer shares:
 * the frame never changes width between routes, only the reading column
 * inside it does. Wordmark with the blinking accent underscore left, the
 * route links and resume right, then the theme toggle and the ⌘K palette
 * hint (desktop only). Sits on a --bg-subtle band with a hairline always on,
 * so the header reads as a zone rather than floating on the page.
 *
 * `site-header` carries a view-transition-name (globals.css): on route
 * changes the header holds still while the page beneath it crossfades. The
 * current route's link carries aria-current="page", which the CSS draws as a
 * hairline accent underline sliding in from the left (`.v2-navlink::after`).
 *
 * The Cmd/Ctrl+K shortcut and the trigger live here (lightweight); they mount
 * the lazy palette on first use.
 */
export function Nav() {
  const pathname = usePathname();
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteMounted, setPaletteMounted] = useState(false);
  const paletteTrigger = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  function openPalette() {
    lastFocused.current = document.activeElement as HTMLElement | null;
    setPaletteMounted(true);
    setPaletteOpen(true);
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      if (paletteOpen) {
        setPaletteOpen(false);
        return;
      }
      openPalette();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen]);

  return (
    <header className="site-header sticky top-0 z-30 border-b border-border bg-bg-subtle">
      <div className="mx-auto flex max-w-[1080px] items-center gap-3 px-5 py-4 md:gap-6 md:px-8">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap font-mono text-[14px] tracking-[0.02em] text-fg"
          aria-label={site.name}
        >
          {/* The full wordmark needs ~124px; on a phone that space buys the
              about and contact routes instead, so the mark contracts to its
              initials below 480px. The aria-label keeps the full name. */}
          <span aria-hidden="true" className="max-[479px]:hidden">{site.name}</span>
          <span aria-hidden="true" className="min-[480px]:hidden">jb</span>
          <span className="v2-blink text-accent" aria-hidden="true">
            _
          </span>
        </Link>
        <div className="flex-1" />
        <nav aria-label="Primary">
          {/* All four routes stay to 380px: the primary reader is often on a
              phone, and about was reachable only from the footer. The wordmark
              contracts instead (see above). Below 380px contact yields — the
              hero's "get in touch" button already leads there. */}
          <ul className="flex shrink-0 items-center gap-4 font-mono text-[14px] tracking-[0.02em] md:gap-5">
            {navLinks.map((link) => (
              <li key={link.href} className={link.href === "/contact" ? "max-[379px]:hidden" : undefined}>
                {link.external ? (
                  <a href={link.href} target="_blank" rel="noopener" className="v2-navlink tap-target">
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="v2-navlink tap-target"
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <ThemeToggle />

        <button
          ref={paletteTrigger}
          type="button"
          aria-label="Open command palette"
          aria-keyshortcuts="Meta+K Control+K"
          aria-haspopup="dialog"
          aria-expanded={paletteOpen}
          onClick={openPalette}
          className="hidden items-center rounded-[4px] px-1 font-mono text-[14px] text-fg-faint transition-colors duration-150 ease-out-quiet hover:text-fg motion-reduce:transition-none md:inline-flex"
        >
          <span aria-hidden="true">⌘K</span>
        </button>
      </div>

      {paletteMounted ? (
        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          triggerRef={paletteTrigger}
          lastFocusedRef={lastFocused}
        />
      ) : null}
    </header>
  );
}
