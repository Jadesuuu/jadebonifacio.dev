"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef } from "react";
import { createStoryBackdrop, type StoryBackdrop } from "./storyBackdrop";

/**
 * "The story so far" as a pinned carousel — the About page's set piece.
 *
 * On a desktop with motion allowed the section PINS to the viewport for about
 * three screens of scroll (Jade: the scrolling is the part he loves) — the
 * stage is CSS `position: sticky` inside a section made tall enough for the
 * scroll, not a GSAP pin: the browser holds it natively and, unlike a pin
 * that flips to position: fixed, a sticky element is exempt from layout-shift
 * scoring (a GSAP pin registered 0.89 CLS at pin start and again at release).
 * ScrollTrigger scrubs the timeline over the same distance. The
 * three chapters are CARDS on one horizontal track — photograph beside year,
 * title, date and body on a plain card surface — and the track slides
 * sideways as the reader scrolls down, like a carousel: the current chapter
 * sits centred at full strength while its neighbours wait at the edges of
 * the screen, dimmed and a touch smaller, so the reader can see there are
 * three and where they are. Behind the cards a TROPHY BUILT FROM DOTS (the
 * About particle cloud, moved here and given one shape) is seen through a
 * camera that PANS along one path as the reader scrolls — low and looking
 * up, rising over the mouth of the cup, coming down again on the far side —
 * continuously, never cutting: slow through a hold, quicker through a
 * change, and the trophy itself never turns. The hold
 * is long and the change is short, and a scroll that stops mid-change
 * settles onto the nearer chapter (ScrollTrigger snap). A brass hairline
 * under the track fills with progress through the story. Everything is
 * scrubbed to the scrollbar (GSAP ScrollTrigger, loaded on demand): scroll
 * back and it all runs in reverse.
 *
 * Below 900px the same DOM lays out as three plain rows — photo above or
 * beside text — nothing pins, no backdrop; each row settles into view once
 * as it arrives. Under prefers-reduced-motion or without JS the rows are
 * simply there.
 */

type Chapter = { meta: string; title: string; body: string; img: string; alt: string };

const HOLD = 1.25; // scroll "units" a chapter holds — the point of the section
const TRANS = 0.5; // units a change takes — passed through, not dwelt in
const EASE = "power1.inOut"; // one curve for everything that moves with the track
const ASIDE = { opacity: 0.45, scale: 0.94 }; // a neighbour waiting at the edge

const yearOf = (meta: string) => /\b20\d\d\b/.exec(meta)?.[0] ?? "";

export function StoryChapters({ chapters }: { chapters: Chapter[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const section = root?.closest<HTMLElement>("section");
    if (!root || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    let backdrop: StoryBackdrop | null = null;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const words = gsap.utils.toArray<HTMLElement>("[data-word]", section);
      const cards = gsap.utils.toArray<HTMLElement>(".v2-chapter", section);
      const photos = cards.map((r) => r.querySelector<HTMLElement>(".v2-chapter-photo")!);
      const texts = cards.map((r) => r.querySelector<HTMLElement>(".v2-chapter-text")!);
      const n = cards.length;

      const heading = () =>
        words.length
          ? gsap.from(words, {
              yPercent: 115,
              autoAlpha: 0,
              duration: 0.75,
              stagger: 0.07,
              ease: "power4.out",
              scrollTrigger: { trigger: section, start: "top 88%", once: true },
            })
          : null;

      const stage = window.matchMedia("(min-width: 900px)").matches;
      if (!stage) {
        // Stacked rows (phones): no pin, but each chapter still arrives — the
        // photo settles in from a slight scale, the text a beat behind.
        ctx = gsap.context(() => {
          gsap.set(photos, { autoAlpha: 0, scale: 0.94, y: 28 });
          gsap.set(texts, { autoAlpha: 0, y: 32 });
          ScrollTrigger.batch(cards, {
            start: "top 85%",
            once: true,
            onEnter: (els) => {
              const ps = els.map((r) => (r as HTMLElement).querySelector(".v2-chapter-photo"));
              const ts = els.map((r) => (r as HTMLElement).querySelector(".v2-chapter-text"));
              gsap.to(ps, { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12 });
              gsap.to(ts, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.12, stagger: 0.12 });
            },
          });
          heading();
        }, section);
        return;
      }

      root.dataset.mode = "stage";
      const track = root.querySelector<HTMLElement>(".v2-story-track")!;
      const canvas = section.querySelector<HTMLCanvasElement>(".v2-story-backdrop")!;
      const progress = section.querySelector<HTMLElement>(".v2-story-progress");
      const header = document.querySelector<HTMLElement>(".site-header");
      const headerH = () => (header ? header.getBoundingClientRect().height : 72) + 16;
      const TOTAL = n * HOLD + (n - 1) * TRANS;
      // The section is the stage plus the scroll distance; the stage sticks
      // under the header for exactly that distance. Both written as CSS vars
      // so the CSS and the ScrollTrigger agree, re-measured on refresh.
      const distance = () => Math.round(window.innerHeight * 0.95 * TOTAL);
      const setVars = () => {
        section.style.setProperty("--story-top", `${headerH()}px`);
        section.style.setProperty("--story-scroll", `${distance()}px`);
      };
      setVars();

      backdrop = createStoryBackdrop(canvas);
      const cam = backdrop?.cam;

      // Where the track must sit for card k to be centred in the viewport.
      // Function-based so a resize (invalidateOnRefresh) re-measures.
      const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
      const cx = (k: number) => (root.clientWidth - cards[0].offsetWidth) / 2 - k * (cards[0].offsetWidth + gap());

      // Where the changes live on the scroll axis, as timeline progress —
      // snap sends a scroll that stops inside one to the nearer chapter and
      // leaves a scroll that stops in a hold exactly where it is.
      const changes = Array.from({ length: n - 1 }, (_, k) => {
        const s0 = (k * (HOLD + TRANS) + HOLD) / TOTAL;
        return [s0, s0 + TRANS / TOTAL] as const;
      });
      const snapTo = (p: number) => {
        for (const [s0, e0] of changes) if (p > s0 && p < e0) return p - s0 < e0 - p ? s0 : e0;
        return p;
      };

      ctx = gsap.context(() => {
        // Opening state: chapter 1 centred and whole, the rest waiting aside.
        gsap.set(track, { x: () => cx(0) });
        gsap.set(cards.slice(1), ASIDE);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: () => `top ${headerH()}`,
            end: () => `+=${distance()}`,
            scrub: 0.5,
            invalidateOnRefresh: true,
            onRefreshInit: setVars,
            snap: { snapTo, duration: { min: 0.15, max: 0.4 }, delay: 0.1, ease: "power2.inOut", inertia: false },
          },
        });
        if (progress) tl.fromTo(progress, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: TOTAL }, 0);
        // The camera rides its whole path over the whole story, linear to scroll.
        if (cam) tl.fromTo(cam, { t: 0 }, { t: 1, duration: TOTAL, onUpdate: () => backdrop?.sync() }, 0);

        for (let k = 0; k < n - 1; k++) {
          const at = k * (HOLD + TRANS) + HOLD; // the change begins as the hold ends
          // The track advances one card; the leaving card steps aside and
          // the arriving card comes up to full strength — one curve, one clock.
          if (k === 0) tl.fromTo(track, { x: () => cx(0) }, { x: () => cx(1), duration: TRANS, ease: EASE }, at);
          else tl.to(track, { x: () => cx(k + 1), duration: TRANS, ease: EASE }, at);
          tl.to(cards[k], { ...ASIDE, duration: TRANS, ease: EASE }, at);
          tl.to(cards[k + 1], { opacity: 1, scale: 1, duration: TRANS, ease: EASE }, at);
        }
        heading();
      }, section);
      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
      backdrop?.destroy();
      if (root) root.dataset.mode = "stack";
      section.style.removeProperty("--story-top");
      section.style.removeProperty("--story-scroll");
    };
  }, [chapters]);

  const shell = "mx-auto w-full max-w-column-wide px-6 md:px-8";

  return (
    <section id="story" data-field-boost className="v2-story-section pt-20 md:pt-24" aria-labelledby="story-h">
      {/* The stage: sticky under the header while the section scrolls past. */}
      <div className="v2-story-stage">
      {/* The trophy, behind everything in the stage. Stage only; painted by storyBackdrop.ts. */}
      <canvas className="v2-story-backdrop" aria-hidden="true" />
      <div className={shell}>
        <h2 id="story-h" className="font-display m-0 mb-10" style={{ fontSize: "clamp(28px,3.6vw,38px)", lineHeight: 1.12 }}>
          {/* Each word in its own mask so the words can rise one by one; reads
              as plain text to assistive tech and without JS. */}
          {["The", "story", "so", "far"].map((word, i) => (
            <Fragment key={word}>
              <span className="v2-word-mask">
                <span data-word className="inline-block">
                  {word}
                </span>
              </span>
              {i < 3 ? " " : null}
            </Fragment>
          ))}
        </h2>
      </div>
      <div ref={rootRef} data-mode="stack" className="v2-story">
        <div className="v2-story-track">
          {chapters.map((ch, i) => (
            <article key={ch.title} className="v2-chapter" aria-label={`${yearOf(ch.meta)} — ${ch.title}`}>
              <div className="v2-chapter-photo">
                <Image src={ch.img} alt={ch.alt} fill sizes="(max-width:900px) 100vw, 400px" className="object-cover" priority={i === 0} />
              </div>
              <div className="v2-chapter-text">
                <div className="v2-chapter-copy">
                  <p aria-hidden="true" className="v2-chapter-year font-display">
                    {yearOf(ch.meta)}
                  </p>
                  <h3 className="m-0 text-[clamp(24px,2.8vw,34px)] font-medium leading-[1.2]">
                    {ch.title}
                  </h3>
                  <p className="mt-2 mb-3 font-mono text-[14px] tracking-[0.02em] text-accent">{ch.meta}</p>
                  <p className="v2-chapter-body m-0 max-w-[46ch] text-[17px] leading-relaxed text-fg-muted">{ch.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className={shell}>
        {/* Progress through the story: a hairline that fills with brass as the
            reader scrolls the pinned section. Stage only. */}
        <span aria-hidden="true" className="v2-story-progress" />
      </div>
      </div>
    </section>
  );
}
