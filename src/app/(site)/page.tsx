import Link from "next/link";
import { HeroPortrait } from "@/components/home/HeroPortrait";
import { WorkGrid } from "@/components/home/WorkGrid";
import { projects } from "@/content/projects";
import { site } from "@/lib/site";

/**
 * Home. One portrait rendered two ways, three latest works, one line of ask,
 * the footer. Under two screens on desktop. Everything biographical moved to
 * /about, the case-study index to /work, the form to /contact — the page earns
 * the click rather than trying to be the whole site.
 *
 * Home shares the (site) shell (skip link, nav, main, footer, constellation)
 * with every other route, so the frame is identical from page to page. The
 * hero is a <section>, not a <header>; the nav owns the banner.
 */
export default function HomePage() {
  return (
    <>
        {/* Hero. One centred column: the name, the portrait bottom-aligned
            onto a full-shell hairline (the ground the figure stands on,
            painted over the cutout's foot), then one row — the line left,
            the ask right. No text flanks the portrait; the empty sides are
            the design. The name is present from the first paint — it is the
            label, the portrait is the subject, and a label that arrives after
            its subject is backwards (it also made the h1 the LCP element and
            pinned LCP to the end of a ~2s canvas animation). Only the
            supporting row waits for the face to settle: .v2-hero-copy--late
            in globals.css. */}
        <section
          aria-label="Introduction"
          className="v2-hero-stage relative mx-auto max-w-[1080px] px-6 pt-10 md:px-8 md:pt-10"
        >
          <h1
            className="font-display m-0 text-center"
            style={{ fontSize: "clamp(40px,6.5vw,72px)", lineHeight: 1.05 }}
          >
            Jade Bonifacio
          </h1>

          <div className="relative mt-6 md:mt-8">
            <HeroPortrait />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 bottom-0 z-[2] h-px bg-border md:-inset-x-8"
            />
          </div>

          <div className="v2-hero-copy v2-hero-copy--late mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-10 gap-y-5 md:mt-6 max-[840px]:grid-cols-1">
            <p className="m-0 max-w-[44ch] text-[18px] leading-relaxed text-fg-muted">
              {site.description}
            </p>
            <div className="flex flex-col items-start gap-3 max-[840px]:items-start">
              <Link
                href="/contact"
                className="v2-btn-a rounded-lg bg-accent px-5 py-3 font-mono text-[14px] tracking-[0.02em] text-fg-on-accent"
              >
                get in touch →
              </Link>
              <p className="m-0 flex items-center gap-2 font-mono text-[14px] text-fg-muted">
                <span aria-hidden="true" className="v2-pulse size-2 rounded-full bg-accent" />
                open to work · replies within a day
              </p>
            </div>
          </div>
        </section>

        {/* Three latest works. The heading sits between two hairlines — the
            reference's device — but as a real heading step in the display
            face, not the small tracked label the reference uses: a 12px h2
            under 17px body inverts the type scale and is the eyebrow costume
            promoted to a heading. Tight enough above that the rule-and-heading
            row lands inside the first viewport at 1440×900, so the page
            visibly continues. */}
        <section aria-labelledby="latest-work" className="mx-auto max-w-[1080px] px-6 pt-14 md:px-8 md:pt-12">
          <div className="mb-6 flex items-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <h2 id="latest-work" className="font-display m-0 whitespace-nowrap text-[20px] text-fg-muted">
              Some of my latest work
            </h2>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
          <WorkGrid projects={projects} />

          <p className="mx-auto mt-14 max-w-[52ch] text-center text-[16px] leading-relaxed text-fg-muted md:mt-16">
            Have a role, a project, or a codebase that needs fixing?{" "}
            <Link href="/contact" className="link-body tap-target text-fg">
              I&apos;d love to hear about it →
            </Link>
          </p>
        </section>
    </>
  );
}
