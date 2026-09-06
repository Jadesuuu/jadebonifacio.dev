"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { links } from "@/content/links";
import type { Theme } from "@/lib/theme";

/**
 * The home page's own nav (wider 1080px shell than the rest of the site). Logo
 * with a blinking accent underscore on the left, in-page anchors and resume on
 * the right, then the theme toggle. Border is transparent until the page has
 * scrolled past 8px, then a hairline — laid out always so it never shifts.
 */
export function HomeNav({ theme }: { theme: Theme }) {
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
      <div className="mx-auto flex max-w-[1080px] items-center gap-6 px-6 py-4 md:px-8">
        <a href="#top" className="font-mono text-sm text-fg">
          jb
          <span className="text-accent v2-blink" aria-hidden="true">
            _
          </span>
        </a>
        <div className="flex-1" />
        <nav
          aria-label="Primary"
          className="flex items-center gap-5 font-mono text-[13px] tracking-[0.02em]"
        >
          <a href="#work" className="v2-navlink">
            work
          </a>
          <a href="#about" className="v2-navlink max-[840px]:hidden">
            about
          </a>
          <a href="#contact" className="v2-navlink">
            contact
          </a>
          <a
            href={links.resume}
            target="_blank"
            rel="noreferrer"
            className="v2-navlink max-[840px]:hidden"
          >
            resume
          </a>
        </nav>
        <ThemeToggle initialTheme={theme} />
      </div>
    </header>
  );
}
