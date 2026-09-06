"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/Container";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navLinks, site } from "@/lib/site";
import type { Theme } from "@/lib/theme";

// The palette pulls in cmdk and Radix Dialog. Load it only on first open so it
// stays out of the initial bundle on every page. It never renders on the
// server, so ssr:false is correct here.
const CommandPalette = dynamic(
  () => import("@/components/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false },
);

/**
 * Sticky nav. Name left (mono, --fg), links right (mono, --fg-muted, hover
 * --fg), theme toggle, then the ⌘K palette hint (desktop only) at far right.
 * No border until the page has scrolled, then a hairline. The border is
 * always laid out (transparent at top) so toggling it never shifts content.
 *
 * The Cmd/Ctrl+K shortcut and the trigger live here (lightweight); they mount
 * the lazy palette on first use.
 */
export function Nav({ theme }: { theme: Theme }) {
  const [scrolled, setScrolled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteMounted, setPaletteMounted] = useState(false);
  const paletteTrigger = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

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
    <header
      className={[
        "sticky top-0 z-10 border-b bg-bg",
        "transition-colors duration-150 ease-out-quiet motion-reduce:transition-none",
        scrolled ? "border-border" : "border-transparent",
      ].join(" ")}
    >
      <Container>
        <div className="flex h-14 items-center justify-between gap-3 md:gap-4">
          <Link href="/" className="text-meta-mono link-quiet whitespace-nowrap text-fg">
            {site.name}
            <span className="v2-blink text-accent" aria-hidden="true">
              _
            </span>
          </Link>

          <div className="flex items-center gap-3 md:gap-6">
            <nav aria-label="Primary">
              <ul className="flex items-center gap-3 whitespace-nowrap md:gap-5">
                {navLinks.map((link) =>
                  link.external ? (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener"
                        className="text-meta-mono link-quiet"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <Link href={link.href} className="text-meta-mono link-quiet">
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <ThemeToggle initialTheme={theme} />

            <button
              ref={paletteTrigger}
              type="button"
              aria-label="Open command palette"
              aria-keyshortcuts="Meta+K Control+K"
              aria-haspopup="dialog"
              aria-expanded={paletteOpen}
              onClick={openPalette}
              className={[
                "hidden items-center rounded-[4px] px-1 text-meta-mono text-fg-faint md:inline-flex",
                "transition-colors duration-150 ease-out-quiet hover:text-fg motion-reduce:transition-none",
              ].join(" ")}
            >
              <span aria-hidden="true">⌘K</span>
            </button>
          </div>
        </div>
      </Container>

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
