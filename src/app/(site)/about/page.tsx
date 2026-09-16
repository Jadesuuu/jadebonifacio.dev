import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { CopyEmailButton } from "@/components/home/CopyEmailButton";
import { NextRow } from "@/components/NextRow";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { StoryEffects } from "@/components/home/StoryEffects";
import { StoryChapters } from "@/components/home/StoryChapters";
import { Toolbox } from "@/components/home/Toolbox";
import {
  afterHoursLead,
  afterHoursPhotos,
  dayJobLedger,
  dayJobLedgerLead,
  dayJobQuote,
  dayJobQuoteNote,
  dayJobScope,
  dayJobStats,
  howIWorkParagraphs,
  inGame,
  irl,
  lookingFor,
  timeline,
  who,
} from "@/content/about";
import { links, mailto } from "@/content/links";
import { getProject } from "@/content/projects";
import { site } from "@/lib/site";

const title = "About";

export const metadata: Metadata = {
  title,
  description: who,
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: `${title} · ${site.title}`, description: who },
  twitter: { title: `${title} · ${site.title}`, description: who },
};

const next = getProject("jf-and-the-world");

// Headings carry themselves: no label above any of them. Prose stays in the
// 680px column; the set pieces (numbers, timeline, toolbox, bento) break out
// to the 840px figure width the case studies already use.
const h2 = "font-display m-0";
const h2Size = { fontSize: "clamp(28px,3.6vw,38px)", lineHeight: 1.12 };
const wide = "mx-auto w-full max-w-column-wide px-6 md:px-8";
const rowLabel = "m-0 mb-2.5 font-mono text-[14px] tracking-[0.04em] text-fg-faint";

/**
 * /about — the person. Everything biographical that used to sit on the home
 * page lives here now: who, the day job in numbers, how I work, the story,
 * the toolbox, after hours, the smaller things, what I'm looking for. Three of
 * the four ambient set pieces travel with their sections (particle cloud,
 * story glow, toolbox spotlight); the constellation stays on home and the
 * case studies.
 */
export default function AboutPage() {
  return (
    <>
      <StoryEffects />
      <ScrollReveal />

      <Container className="pt-16 md:pt-24">
        <h1 className="v2-h1">{title}</h1>
        <section className="mt-10 md:mt-12">
          <p className="text-[18px] leading-[1.6]">{who}</p>
        </section>
      </Container>

      {/* The day job, in numbers. Counts up once when 60% visible. */}
      <section className={`${wide} pt-20 md:pt-24`} aria-labelledby="numbers-h">
        <h2 id="numbers-h" className={`${h2} mb-8`} style={h2Size}>
          The day job, in numbers
        </h2>
        <div data-stagger className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-6">
          {dayJobStats.map((stat) => (
            <div key={stat.label} className="border-t border-border pt-4">
              <p
                className="font-display m-0 leading-none tabular-nums"
                style={{ fontSize: "clamp(38px,4.6vw,52px)" }}
                data-count={stat.count ? stat.value : undefined}
              >
                {stat.value}
              </p>
              <p className="m-0 mt-2.5 font-mono text-[14px] text-fg-muted">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-[65ch] font-mono text-[14px] text-fg-faint">{dayJobScope}</p>

        {/* The ledger: the second tier of figures, the ones that say how the
            work was done rather than how much. Hairline rows, the numeral in
            the display face at card-title size so it reads as a smaller
            sibling of the four above, the fact in body. A <dl>, because each
            row is a value and its meaning. */}
        <p className="mt-12 max-w-[56ch] text-[18px] leading-relaxed text-fg-muted md:mt-14">
          {dayJobLedgerLead}
        </p>
        <dl data-stagger className="m-0 mt-6 border-b border-border">
          {dayJobLedger.map((row) => (
            <div
              key={row.value}
              className="grid grid-cols-[6.5ch_minmax(0,1fr)] items-baseline gap-x-6 border-t border-border py-3.5 max-[480px]:grid-cols-[6ch_minmax(0,1fr)] max-[480px]:gap-x-4"
            >
              <dt className="font-display m-0 text-[22px] font-medium leading-none tabular-nums tracking-[-0.015em]">
                {row.value}
              </dt>
              <dd className="m-0 text-[16px] leading-relaxed text-fg-muted">{row.fact}</dd>
            </div>
          ))}
        </dl>

        <figure className="mx-auto mt-14 max-w-[24ch] text-center md:mt-16">
          <blockquote
            className="font-display m-0"
            style={{ fontSize: "clamp(24px,3vw,32px)", lineHeight: 1.2 }}
          >
            &ldquo;{dayJobQuote}&rdquo;
          </blockquote>
          <figcaption className="mt-3 font-mono text-[14px] text-fg-faint">{dayJobQuoteNote}</figcaption>
        </figure>
      </section>

      {/* At work. The one photo of the day job, framed. */}
      <section className={`${wide} pt-16 md:pt-20`} aria-label="At work">
        <div className="rounded-2xl border border-border bg-bg-subtle p-2.5">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/images/home/at-work.png"
              alt="Presenting to the team in a conference room at Advanced World Solutions"
              fill
              priority // first photograph on the page and its LCP: preload it
              sizes="(max-width:840px) 100vw, 840px"
              className="rounded-[10px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* How I work: the prose alone in the 680 reading column. The particle
          cloud that used to sit beside it now stands behind the story as the
          trophy (storyBackdrop.ts). */}
      <section className={`${wide} pt-20 md:pt-24`} aria-labelledby="how-h">
        <h2 id="how-h" className={`${h2} mb-8`} style={h2Size}>
          How I work
        </h2>
        <div className="flex max-w-column flex-col gap-4 text-[18px] leading-[1.6]">
          {howIWorkParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="m-0">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* The story so far: a pinned carousel of three cards with the dot
          trophy behind, its camera changing angle per chapter. Plain stacked
          rows below 900px and under reduced motion. */}
      <StoryChapters chapters={timeline} />

      {/* Toolbox. */}
      <section id="toolbox" className={`${wide} pt-20 md:pt-24`} aria-labelledby="tools-h">
        <h2 id="tools-h" className={`${h2} mb-8`} style={h2Size}>
          What I reach for
        </h2>
        <Toolbox />
      </section>

      {/* After hours. IRL first. */}
      <section id="off-keyboard" className={`${wide} pt-20 md:pt-24`} aria-labelledby="off-h">
        <h2 id="off-h" className={`${h2} mb-4`} style={h2Size}>
          Away from the keyboard
        </h2>
        <p className="m-0 mb-7 max-w-[56ch] text-[18px] leading-relaxed text-fg-muted">{afterHoursLead}</p>
        <p className={rowLabel}>irl</p>
        <div data-stagger className="mb-5 flex flex-wrap gap-2.5">
          {irl.map((tag) => (
            <span key={tag} className="v2-chip !px-3.5 !py-1.5 !text-[14px]">
              {tag}
            </span>
          ))}
        </div>
        <p className={rowLabel}>in-game</p>
        <div data-stagger className="mb-6 flex flex-wrap gap-2.5">
          {inGame.map((tag) => (
            <span key={tag} className="v2-chip !px-3.5 !py-1.5 !text-[14px]">
              {tag}
            </span>
          ))}
        </div>
        <div
          data-stagger
          data-reveal="scale"
          className="grid max-w-[780px] grid-cols-2 gap-5 max-[840px]:max-w-[420px] max-[840px]:grid-cols-1"
        >
          {afterHoursPhotos.map((tile) => (
            <div key={tile.label} className="relative min-w-0" style={{ aspectRatio: "4 / 5" }}>
              <Image
                src={tile.img}
                alt={tile.alt}
                fill
                sizes="(max-width:840px) 90vw, 380px"
                className="rounded-[14px] object-cover"
              />
              <span className="pointer-events-none absolute top-3 left-3 z-[2] rounded-full border border-border bg-bg px-3 py-[5px] font-mono text-[13px] text-fg">
                {tile.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Container>
        <section className="mt-20 md:mt-24" aria-labelledby="looking-h">
          <h2 id="looking-h" className={`${h2} mb-5`} style={h2Size}>
            What I&apos;m looking for
          </h2>
          <p className="text-[18px] leading-[1.6]">{lookingFor}</p>
        </section>

        <section className="mt-16 md:mt-24" aria-labelledby="contact-h">
          <h2 id="contact-h" className={`${h2} mb-5`} style={h2Size}>
            Contact
          </h2>
          <p className="m-0 mb-6 max-w-[52ch] text-[18px] leading-[1.6] text-fg-muted">
            Have a role, a project, or a codebase that needs fixing? The form is one page over; the
            address is right here.
          </p>
          <div className="mb-7 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="v2-btn-a rounded-lg bg-accent px-5 py-3 font-mono text-[14px] tracking-[0.02em] text-fg-on-accent"
            >
              get in touch →
            </Link>
            <CopyEmailButton />
          </div>
          <ul className="flex flex-wrap items-center gap-x-2 text-meta-mono text-fg-muted">
            <li>
              <a href={mailto} className="link-quiet tap-target">
                {links.email}
              </a>
            </li>
            <li aria-hidden="true" className="text-fg-faint">
              ·
            </li>
            <li>
              <a href={links.github} className="link-quiet tap-target" rel="me noopener">
                github
              </a>
            </li>
            <li aria-hidden="true" className="text-fg-faint">
              ·
            </li>
            <li>
              <a href={links.linkedin} className="link-quiet tap-target" rel="me noopener">
                linkedin
              </a>
            </li>
            <li aria-hidden="true" className="text-fg-faint">
              ·
            </li>
            <li>
              <a href={links.resume} className="link-quiet tap-target" target="_blank" rel="noopener">
                resume (pdf)
              </a>
            </li>
          </ul>
        </section>

        {next ? (
          <div className="mt-16 md:mt-24">
            <NextRow label="work" title={next.title} href={`/work/${next.slug}`} />
          </div>
        ) : null}
      </Container>
    </>
  );
}
