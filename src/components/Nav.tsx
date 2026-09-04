"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navLinks, site } from "@/lib/site";
import type { Theme } from "@/lib/theme";

/**
 * Sticky nav. Name left (mono, --fg), links right (mono, --fg-muted, hover
 * --fg), theme toggle far right. No border until the page has scrolled, then
 * a hairline. The border is always laid out (transparent at top) so toggling
 * it never shifts content.
 */
export function Nav({ theme }: { theme: Theme }) {
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <header
      className={[
        "sticky top-0 z-10 border-b bg-bg",
        "transition-colors duration-150 ease-out-quiet motion-reduce:transition-none",
        scrolled ? "border-border" : "border-transparent",
      ].join(" ")}
    >
      <Container>
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/" className="text-meta-mono link-quiet text-fg">
            {site.name}
          </Link>

          <div className="flex items-center gap-4 md:gap-6">
            <nav aria-label="Primary">
              <ul className="flex items-center gap-4 md:gap-5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-meta-mono link-quiet">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <ThemeToggle initialTheme={theme} />
          </div>
        </div>
      </Container>
    </header>
  );
}
