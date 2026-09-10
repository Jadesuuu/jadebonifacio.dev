import Image from "next/image";
import { ConstellationBg } from "@/components/ConstellationBg";
import { ContactForm } from "@/components/home/ContactForm";
import { CopyEmailButton } from "@/components/home/CopyEmailButton";
import { HomeNav } from "@/components/home/HomeNav";
import { ParticleCloud } from "@/components/home/ParticleCloud";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { StoryEffects } from "@/components/home/StoryEffects";
import { Toolbox } from "@/components/home/Toolbox";
import { Typewriter } from "@/components/home/Typewriter";
import { WorkCard } from "@/components/home/WorkCard";
import { Footer } from "@/components/Footer";
import { links } from "@/content/links";
import { projects } from "@/content/projects";

const IN_GAME = [
  "valorant — peak radiant", "league of legends", "arc raiders", "path of exile",
  "palworld", "helldivers 2", "every mainline pokémon", "switch oled",
];
const IRL = ["gym", "badminton", "long walks", "snorkeling", "food trips — all kinds", "coffee, always"];

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.42.36.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .31.21.69.82.57A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const sectionLabel = "font-mono text-[13px] tracking-[0.02em] text-accent";
const serifHeading = "font-display italic font-normal";
const tlCard =
  "box-border w-[min(660px,100%)] rounded-2xl border border-border bg-bg-subtle p-5 grid grid-cols-[180px_minmax(0,1fr)] gap-7 items-center max-[840px]:grid-cols-1";

/**
 * Home v2. A long single-page landing: hero, skills marquee, selected work,
 * the day job in numbers, about, beyond-the-resume, an animated timeline, the
 * toolbox, off-keyboard life, and a contact block. Uses the root layout only
 * (its own nav + footer at 1080px); /about and /work keep the narrower shell.
 */
export default function HomePage() {
  return (
    <div id="top" className="min-h-dvh text-fg">
      <ConstellationBg revealAfterHero />
      <StoryEffects />
      <ScrollReveal />
      <HomeNav />

      {/* Hero. Two columns sharing one baseline: the copy sits on a 72px
          bottom pad, the photo is bottom-aligned and stretched to the same
          row height, and a hairline runs under both. */}
      <header className="v2-fade-up relative mx-auto grid max-w-[1080px] grid-cols-[1fr_1.05fr] items-end gap-11 px-6 pt-24 md:px-8 max-[840px]:grid-cols-1 max-[840px]:gap-10">
        <div className="flex min-w-0 flex-col gap-5 pb-[72px]">
          <p className={`${serifHeading} m-0 text-2xl text-accent`}>Hello, world — I&apos;m</p>
          <h1
            className={`${serifHeading} m-0`}
            style={{ fontSize: "clamp(46px,6.5vw,72px)", lineHeight: 1.05, letterSpacing: "-0.01em" }}
          >
            Jade Bonifacio<span className="text-accent">.</span>
          </h1>
          <p
            className="m-0 min-h-[1.6em] font-mono tracking-[0.02em] text-fg"
            style={{ fontSize: "clamp(15px,2vw,18px)" }}
          >
            <Typewriter />
          </p>
          <p className="m-0 max-w-[46ch] text-base leading-relaxed text-fg-muted">
            Full-stack developer in the TypeScript ecosystem. Makati, Metro Manila, Philippines ·
            remote, GMT+8 · open to global startup roles.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3.5">
            <a
              href="#contact"
              className="v2-btn-a rounded-lg bg-accent px-5 py-3 font-mono text-[13px] tracking-[0.02em] text-fg-on-accent"
            >
              get in touch →
            </a>
            <a
              href={links.github}
              target="_blank"
              rel="noreferrer"
              className="v2-btn-b inline-flex items-center gap-2 rounded-lg border border-border px-5 py-[11px] font-mono text-[13px] tracking-[0.02em] text-fg"
            >
              <GitHubIcon />
              github
            </a>
            <a
              href={links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="v2-btn-b inline-flex items-center gap-2 rounded-lg border border-border px-5 py-[11px] font-mono text-[13px] tracking-[0.02em] text-fg"
            >
              <LinkedInIcon />
              linkedin
            </a>
          </div>
          <p className="mt-2 flex items-center gap-2 font-mono text-[13px] text-fg-muted">
            <span aria-hidden="true" className="v2-pulse size-2 rounded-full bg-accent" />
            open to work · replies within a day
          </p>
        </div>
        {/* The photo is a cutout trimmed to its own silhouette, so it is sized
            by width and never cropped — object-fit would clip a shoulder. It
            bottom-aligns onto this hairline, which is drawn over it so the line
            reads as ground the figure stands on rather than a frame edge. */}
        <div className="flex w-full max-w-[620px] items-end justify-self-end self-stretch max-[840px]:max-w-full max-[840px]:justify-self-start">
          {/* The camera's native file is only 962×768 after trimming, and the
              optimizer will not upscale past it, so `sizes` deliberately
              overstates the box: every device then pulls the full-resolution
              variant instead of a downscaled 640w. Cut by scripts/key-hero.mjs. */}
          <Image
            src="/images/home/hero.png"
            alt="Jade Bonifacio"
            width={962}
            height={768}
            priority
            quality={95}
            sizes="(max-width:840px) 100vw, 960px"
            className="pointer-events-none h-auto w-full"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-0 z-[2] h-px bg-border md:inset-x-8"
        />
      </header>

      {/* Selected work */}
      <section id="work" className="mx-auto max-w-[1080px] scroll-mt-16 px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>selected work</p>
        <h2 className={`${serifHeading} m-0 mb-10`} style={{ fontSize: "clamp(34px,4.5vw,50px)" }}>
          Things I&apos;ve shipped<span className="text-accent">.</span>
        </h2>
        <div data-stagger className="flex flex-col gap-8">
          {projects.map((project, i) => (
            <WorkCard key={project.slug} project={project} imageFirst={i % 2 === 0} />
          ))}
        </div>
      </section>

      {/* The day job, in numbers */}
      <section className="mx-auto max-w-[1080px] px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>the day job, in numbers</p>
        <div data-stagger className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-6">
          {[
            ["206", "pull requests merged"],
            ["317", "screen modules with my code"],
            ["169", "customer defects resolved & shipped"],
            ["top 3", "defect resolver on the 9-engineer uat team"],
          ].map(([n, label]) => (
            <div key={label} className="border-t border-border pt-4">
              <p
                className="font-display m-0 leading-none"
                style={{ fontSize: "clamp(40px,5vw,56px)" }}
                data-count={/^\d/.test(n) ? n : undefined}
              >
                {n}
              </p>
              <p className="mt-2.5 m-0 font-mono text-xs text-fg-muted">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 font-mono text-xs text-fg-faint">
          two years · a ~420-screen japanese property platform · 60+ engineer bilingual en/jp team
        </p>
        <p
          className={`${serifHeading} mx-auto mt-[72px] max-w-[20ch] text-center`}
          style={{ fontSize: "clamp(26px,3.5vw,38px)" }}
        >
          &ldquo;I write down what broke<span className="text-accent">.</span>&rdquo;
        </p>
        <p className="mt-3.5 text-center font-mono text-xs text-fg-faint">
          the habit every case study on this site follows
        </p>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-[1080px] scroll-mt-16 px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>about</p>
        <h2 className={`${serifHeading} m-0 mb-8`} style={{ fontSize: "clamp(34px,4.5vw,50px)" }}>
          How I work<span className="text-accent">.</span>
        </h2>
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-center gap-14 max-[840px]:grid-cols-1 max-[840px]:gap-10">
        <div className="flex max-w-[680px] flex-col gap-4 text-[17px] leading-relaxed">
          <p className="m-0">
            I&apos;m Jade Mark Angelo Bonifacio — from San Fernando, B.S. Computer Science at Saint
            Louis University in Baguio (cum laude, 2024), now shipping enterprise software for a
            Makati firm and side projects from wherever there&apos;s fiber.
          </p>
          <p className="m-0">
            By day I ship into a large, mature enterprise codebase — a WinForms-to-React legacy port,
            cross-stack defect work, my first production message queues. It taught me to read before
            writing and to make small, defensible changes.
          </p>
          <p className="m-0">
            By night I build from zero: a live two-person travel app, a realtime marketplace on a
            stack I had five evenings to learn. I write down what broke and how I fixed it.
          </p>
          <p className="m-0">
            That work taught me how to be careful. What I want now is somewhere I can also be fast: a
            smaller team, more ownership, shipping features rather than maintaining someone else&apos;s.
          </p>
          <p className="m-0">
            I use Claude Code every day, at work and at home. I&apos;ve built internal tooling around
            it for my team — and a good part of that job is knowing where it saves hours and where it
            confidently makes things worse.
          </p>
        </div>
        <ParticleCloud />
        </div>
        <div data-stagger className="mt-8 flex flex-wrap gap-3">
          <span className="v2-chip">currently reading: designing data-intensive applications</span>
          <span className="v2-chip">building at night, shipping by day</span>
          <span className="v2-chip">gmt+8 · overlaps us mornings</span>
        </div>
      </section>

      {/* Beyond the resume */}
      <section className="mx-auto max-w-[1080px] px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>beyond the resume</p>
        <h2 className={`${serifHeading} m-0 mb-10`} style={{ fontSize: "clamp(34px,4.5vw,50px)" }}>
          Always shipping, always learning<span className="text-accent">.</span>
        </h2>
        <div
          data-stagger
          className="grid grid-cols-[0.9fr_1.1fr] items-center gap-12 max-[840px]:grid-cols-1"
        >
          <div
            className="rounded-2xl border border-border bg-bg-subtle p-2.5"
            style={{ aspectRatio: "1 / 1" }}
          >
            <div className="relative size-full">
              <Image
                src="/images/home/at-work.png"
                alt="Presenting to the team in a conference room at Advanced World Solutions"
                fill
                sizes="(max-width:840px) 90vw, 420px"
                className="rounded-[10px] object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-8 gap-y-9">
            {[
              {
                title: "Speaks 3 languages",
                body:
                  "Filipino natively, English fluently, and enough Japanese (JLPT N4) to work day-to-day with a Tokyo-side client on a bilingual EN/JP team.",
                icon: (
                  <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18" />
                    <ellipse cx="12" cy="12" rx="4.5" ry="9" />
                  </>
                ),
              },
              {
                title: "Reads legacy code for breakfast",
                body:
                  "C#, Java Struts, Oracle PL/SQL — I trace how a system actually works before I change it, then make the smallest fix I can defend.",
                icon: (
                  <>
                    <path d="m8 8-4 4 4 4" />
                    <path d="m16 8 4 4-4 4" />
                    <path d="m13 5-2 14" />
                  </>
                ),
              },
              {
                title: "Builds at night",
                body:
                  "Side projects most years — an uptime monitor, a realtime marketplace, a QR parking lot, a property management system, and a travel app my girlfriend and I use every day.",
                icon: <path d="M20 13A8 8 0 1 1 11 4a6.5 6.5 0 0 0 9 9Z" />,
              },
              {
                title: "Collects certificates",
                body:
                  "CS50x, PhilNITS FE, TOPCIT, an NVIDIA deep-learning workshop, AWS Cloud Practitioner '26. There's always one exam in progress.",
                icon: (
                  <>
                    <circle cx="12" cy="9" r="5" />
                    <path d="M9.5 13.5 8 21l4-2 4 2-1.5-7.5" />
                  </>
                ),
              },
            ].map((card) => (
              <div key={card.title} className="flex min-w-0 flex-col gap-3">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {card.icon}
                </svg>
                <h3 className="m-0 text-[19px] font-medium">{card.title}</h3>
                <p className="m-0 text-[14.5px] leading-relaxed text-fg-muted">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="story" className="mx-auto max-w-[1080px] px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>the story so far</p>
        <h2 className={`${serifHeading} m-0 mb-16`} style={{ fontSize: "clamp(34px,4.5vw,50px)" }}>
          My timeline<span className="text-accent">.</span>
        </h2>
        <div className="flex flex-col gap-24">
          {[
            {
              side: "start",
              meta: "2020 · baguio",
              title: "Moved up the mountain for CS",
              body: "B.S. Computer Science at Saint Louis University.",
              img: "/images/home/baguio-slu.jpg",
              alt: "Baguio, where I moved for Computer Science at Saint Louis University",
            },
            {
              side: "end",
              meta: "jul 1–2, 2024 · baguio → makati",
              title: "Graduated cum laude — at work the next day",
              body:
                "B.S. Computer Science — with TOPCIT, JLPT N4, and PhilNITS FE the same year. The next morning: Advanced World Solutions in Makati, as an R&D engineer.",
              img: "/images/home/graduation.jpg",
              alt: "Graduating cum laude, B.S. Computer Science, July 2024",
            },
            {
              side: "start",
              meta: "2025–26 · after work",
              title: "Kept shipping after hours",
              body:
                "Still at Advanced World Solutions by day. Three of the evening builds got write-ups here: HTTP Monitor, ScoutBoard, then JF & The World — live with its two intended users. The rest didn't — a QR parking lot, a property management system, a hospital Kardex, client sites.",
              img: "/images/home/late-night.png",
              alt: "A late-night session at the desk, mid-build on a side project",
            },
          ].map((item) => (
            <div
              key={item.title}
              data-tl-card
              className={`${tlCard} ${item.side === "end" ? "self-end" : "self-start"}`}
            >
              <div className="relative min-w-0" style={{ aspectRatio: "3 / 4" }}>
                <Image
                  src={item.img}
                  alt={item.alt}
                  fill
                  sizes="(max-width:840px) 90vw, 180px"
                  className="rounded-[10px] object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="m-0 font-mono text-[13px] tracking-[0.02em] text-accent">{item.meta}</p>
                <h3
                  className="mt-2 mb-2.5 font-medium leading-[1.25]"
                  style={{ fontSize: "clamp(24px,2.8vw,30px)" }}
                >
                  {item.title}
                </h3>
                <p className="m-0 text-[15px] leading-relaxed text-fg-muted">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Toolbox */}
      <section id="toolbox" className="mx-auto max-w-[1080px] px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>toolbox</p>
        <h2 className={`${serifHeading} m-0 mb-8`} style={{ fontSize: "clamp(34px,4.5vw,50px)" }}>
          What I reach for<span className="text-accent">.</span>
        </h2>
        <Toolbox />
      </section>

      {/* Off keyboard */}
      <section id="off-keyboard" className="mx-auto max-w-[1080px] px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>after hours</p>
        <h2 className={`${serifHeading} m-0 mb-4`} style={{ fontSize: "clamp(34px,4.5vw,50px)" }}>
          Away from the keyboard<span className="text-accent">.</span>
        </h2>
        <p className="m-0 mb-7 flex max-w-[56ch] flex-wrap items-center gap-3 text-base leading-relaxed text-fg-muted">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M10 2v2" />
            <path d="M14 2v2" />
            <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
            <path d="M6 2v2" />
          </svg>
          Most of it happens off-screen: the gym, a badminton court, a long walk, somewhere to
          snorkel, and a food trip to end the day. When I do queue up, the same patience that gets
          me through legacy PL/SQL is how I peaked Radiant.
        </p>
        <p className="m-0 mb-2.5 font-mono text-xs tracking-[0.04em] text-fg-faint">irl</p>
        <div data-stagger className="mb-5 flex flex-wrap gap-2.5">
          {IRL.map((tag) => (
            <span key={tag} className="v2-chip !px-3.5 !py-1.5 !text-[13px]">
              {tag}
            </span>
          ))}
        </div>
        <p className="m-0 mb-2.5 font-mono text-xs tracking-[0.04em] text-fg-faint">in-game</p>
        <div data-stagger className="mb-6 flex flex-wrap gap-2.5">
          {IN_GAME.map((tag) => (
            <span key={tag} className="v2-chip !px-3.5 !py-1.5 !text-[13px]">
              {tag === "valorant — peak radiant" ? (
                <>
                  valorant — peak <span className="ml-1 text-accent">radiant</span>
                </>
              ) : (
                tag
              )}
            </span>
          ))}
        </div>
        <div
          data-stagger
          className="grid max-w-[780px] grid-cols-2 gap-5 max-[840px]:max-w-[420px] max-[840px]:grid-cols-1"
        >
          {[
            {
              label: "me",
              img: "/images/home/me.png",
              alt: "Me in a yukata at a Tanabata festival",
            },
            {
              label: "the court",
              img: "/images/home/court.png",
              alt: "Mid-rally on a badminton court",
            },
          ].map((tile) => (
            <div key={tile.label} className="relative min-w-0" style={{ aspectRatio: "4 / 5" }}>
              <Image
                src={tile.img}
                alt={tile.alt}
                fill
                sizes="(max-width:840px) 90vw, 380px"
                className="rounded-[14px] object-cover"
              />
              <span className="pointer-events-none absolute top-3 left-3 z-[2] rounded-full border border-border bg-bg px-3 py-[5px] font-mono text-xs text-fg">
                {tile.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-[1080px] scroll-mt-16 px-6 pt-32 pb-24 md:px-8">
        <div className="grid grid-cols-2 gap-16 rounded-2xl border border-border bg-bg-subtle p-[clamp(28px,4vw,56px)] max-[840px]:grid-cols-1">
          <div className="flex min-w-0 flex-col gap-4">
            <p className={sectionLabel}>contact</p>
            <h2 className={`${serifHeading} m-0`} style={{ fontSize: "clamp(34px,4.5vw,50px)" }}>
              Say hello<span className="text-accent">.</span>
            </h2>
            <p className="m-0 max-w-[40ch] text-base leading-relaxed text-fg-muted">
              Have a role, a project, or a codebase that needs fixing? I&apos;d love to hear about it.
            </p>
            <CopyEmailButton />
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={links.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="v2-btn-b inline-flex size-10 items-center justify-center rounded-lg border border-border text-fg-muted"
              >
                <GitHubIcon />
              </a>
              <a
                href={links.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="v2-btn-b inline-flex size-10 items-center justify-center rounded-lg border border-border text-fg-muted"
              >
                <LinkedInIcon />
              </a>
              <a
                href={links.resume}
                target="_blank"
                rel="noreferrer"
                className="v2-btn-b inline-flex h-10 items-center rounded-lg border border-border px-4 font-mono text-[13px] text-fg-muted"
              >
                resume.pdf
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <Footer wide />
    </div>
  );
}
