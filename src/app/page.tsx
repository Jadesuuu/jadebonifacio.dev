import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { CopyEmailButton } from "@/components/home/CopyEmailButton";
import { HomeNav } from "@/components/home/HomeNav";
import { LocalClock } from "@/components/home/LocalClock";
import { MailtoForm } from "@/components/home/MailtoForm";
import { Placeholder } from "@/components/home/Placeholder";
import { StoryEffects } from "@/components/home/StoryEffects";
import { Typewriter } from "@/components/home/Typewriter";
import { links } from "@/content/links";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

// Skills scrolled in the marquee; rendered twice for a seamless -50% loop.
const MARQUEE = [
  "typescript", "react", "next.js", "nestjs", "node", "postgres", "mongodb",
  "redis", "socket.io", "supabase", "mapbox gl", "aws", "docker",
];

const TOOLBOX = [
  ["front-end", "react · next.js (app router · rsc) · typescript · tailwind css · shadcn/ui · material ui"],
  ["back-end", "node.js · nestjs (di · guards · gateways) · python"],
  ["data", "postgresql / supabase (rls) · mongodb · redis · oracle pl/sql · tanstack query · zustand"],
  ["cloud & ai", "aws (ec2 · s3 · sns · sqs) · vercel · docker · github actions · websockets · socket.io · openai api · claude code · jest"],
  ["languages", "filipino · english · japanese (jlpt n4)"],
  ["papers", "aws ccp '26 · philnits fe · topcit · cs50x · nvidia dl workshop"],
];

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
export default async function HomePage() {
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <div id="top" className="min-h-dvh bg-bg text-fg">
      <StoryEffects />
      <HomeNav theme={theme} />

      {/* Hero */}
      <header className="v2-fade-up relative mx-auto grid max-w-[1080px] grid-cols-[1.15fr_0.85fr] items-center gap-16 px-6 pt-24 pb-[72px] md:px-8 max-[840px]:grid-cols-1 max-[840px]:gap-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[220px] -right-[140px] size-[640px] rounded-full opacity-[0.07] blur-[80px]"
          style={{ background: "radial-gradient(circle,var(--accent) 0%,transparent 60%)" }}
        />
        <div className="flex min-w-0 flex-col gap-5">
          <p className={`${serifHeading} m-0 text-2xl text-accent`}>Hello, world — I&apos;m</p>
          <h1
            className="m-0 font-medium"
            style={{ fontSize: "clamp(48px,7vw,80px)", lineHeight: 1.02, letterSpacing: "-0.02em" }}
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
            Full-stack developer in the TypeScript ecosystem. San Fernando, Philippines · remote,
            GMT+8 · open to global startup roles.
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
        <div className="w-full max-w-[380px] justify-self-end max-[840px]:max-w-[340px] max-[840px]:justify-self-start">
          <div
            className="rounded-2xl border border-border bg-bg-subtle p-2.5"
            style={{ aspectRatio: "4 / 5", transform: "rotate(-1.5deg)" }}
          >
            <Placeholder label="drop your photo here" />
          </div>
          <p className="mt-3.5 text-center font-mono text-xs text-fg-faint">
            manila, philippines · <LocalClock /> local
          </p>
        </div>
      </header>

      {/* Skills marquee */}
      <div
        className="v2-marquee overflow-hidden border-y border-border py-3.5"
        aria-hidden="true"
      >
        <div className="v2-marquee-track inline-flex gap-9 whitespace-nowrap font-mono text-[13px] tracking-[0.04em] text-fg-faint">
          {[...MARQUEE, ...MARQUEE].map((word, i) => (
            <span key={i} className="inline-flex items-center gap-9">
              <span>{word}</span>
              <span className="text-accent">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Selected work */}
      <section id="work" className="mx-auto max-w-[1080px] scroll-mt-16 px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>selected work</p>
        <h2 className={`${serifHeading} m-0 mb-10`} style={{ fontSize: "clamp(34px,4.5vw,50px)" }}>
          Things I&apos;ve shipped<span className="text-accent">.</span>
        </h2>
        <div className="flex flex-col gap-8">
          {/* JF & The World */}
          <Link
            href="/work/jf-and-the-world"
            className="v2-card grid grid-cols-[1.1fr_1fr] overflow-hidden rounded-[14px] border border-border bg-bg-subtle max-[840px]:grid-cols-1"
          >
            <div className="relative min-h-[240px] max-[840px]:order-first max-[840px]:aspect-[16/10]">
              <Image
                src="/images/work/jf-and-the-world/thumbnail.png"
                alt="JF & The World — the shared travel map"
                fill
                sizes="(max-width:840px) 100vw, 540px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-3 p-9">
              <p className="m-0 font-mono text-xs tracking-[0.04em] text-accent">live in production</p>
              <h3 className="m-0 text-[26px] font-medium">JF &amp; The World</h3>
              <p className="m-0 text-[15px] leading-relaxed text-fg-muted">
                A private, two-person map of where we&apos;ve been and where we want to go. Pins move
                from dream to memory.
              </p>
              <p className="m-0 font-mono text-xs text-fg-faint">
                next.js 15 · supabase · mapbox gl · cloudinary
              </p>
              <span className="v2-underline mt-2 self-start font-mono text-[13px] text-fg">
                read the case study →
              </span>
            </div>
          </Link>

          {/* ScoutBoard */}
          <Link
            href="/work/scoutboard"
            className="v2-card grid grid-cols-[1fr_1.1fr] overflow-hidden rounded-[14px] border border-border bg-bg-subtle max-[840px]:grid-cols-1"
          >
            <div className="flex flex-col justify-center gap-3 p-9">
              <p className="m-0 font-mono text-xs tracking-[0.04em] text-accent">three weeks of evenings</p>
              <h3 className="m-0 text-[26px] font-medium">ScoutBoard</h3>
              <p className="m-0 text-[15px] leading-relaxed text-fg-muted">
                A realtime marketplace for buying and selling small businesses — live offers over
                websockets, a market simulator keeping it moving.
              </p>
              <p className="m-0 font-mono text-xs text-fg-faint">nestjs · mongodb · redis · socket.io</p>
              <span className="v2-underline mt-2 self-start font-mono text-[13px] text-fg">
                read the case study →
              </span>
            </div>
            <div className="relative min-h-[240px] max-[840px]:order-first max-[840px]:aspect-[16/10]">
              <Image
                src="/images/work/scoutboard/thumbnail.png"
                alt="ScoutBoard — the realtime marketplace board"
                fill
                sizes="(max-width:840px) 100vw, 540px"
                className="object-cover"
              />
            </div>
          </Link>

          {/* Enterprise (NDA) */}
          <Link
            href="/work/enterprise-platform-work"
            className="v2-card grid grid-cols-[1.1fr_1fr] overflow-hidden rounded-[14px] border border-border bg-bg-subtle max-[840px]:grid-cols-1"
          >
            <div
              className="flex min-h-[240px] items-center justify-center max-[840px]:order-first max-[840px]:aspect-[16/10]"
              style={{
                background:
                  "repeating-linear-gradient(-45deg,var(--bg-subtle),var(--bg-subtle) 8px,var(--bg) 8px,var(--bg) 16px)",
              }}
            >
              <span className="rounded-md border border-border bg-bg px-3.5 py-2 font-mono text-[13px] text-fg-muted">
                no screenshots — nda
              </span>
            </div>
            <div className="flex flex-col justify-center gap-3 p-9">
              <p className="m-0 font-mono text-xs tracking-[0.04em] text-accent">the day job · 2 years</p>
              <h3 className="m-0 text-[26px] font-medium">Enterprise platform work</h3>
              <p className="m-0 text-[15px] leading-relaxed text-fg-muted">
                Shipping into a large, mature codebase I didn&apos;t write, for a Japanese client, on
                a bilingual team. Client under NDA.
              </p>
              <p className="m-0 font-mono text-xs text-fg-faint">react · typescript · node · oracle · aws</p>
              <span className="v2-underline mt-2 self-start font-mono text-[13px] text-fg">
                the shape of the work →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* The day job, in numbers */}
      <section className="mx-auto max-w-[1080px] px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>the day job, in numbers</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-6">
          {[
            ["206", "pull requests merged"],
            ["317", "screen modules with my code"],
            ["169", "customer defects resolved & shipped"],
            ["top 3", "defect resolver on the 9-engineer uat team"],
          ].map(([n, label]) => (
            <div key={label} className="border-t border-border pt-4">
              <p className="font-display m-0 leading-none" style={{ fontSize: "clamp(40px,5vw,56px)" }}>
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
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="v2-chip">currently reading: designing data-intensive applications</span>
          <span className="v2-chip">building at night, shipping by day</span>
          <span className="v2-chip">utc+8 · overlaps us mornings</span>
        </div>
      </section>

      {/* Beyond the resume */}
      <section className="mx-auto max-w-[1080px] px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>beyond the resume</p>
        <h2 className={`${serifHeading} m-0 mb-10`} style={{ fontSize: "clamp(34px,4.5vw,50px)" }}>
          Always shipping, always learning<span className="text-accent">.</span>
        </h2>
        <div className="grid grid-cols-[0.9fr_1.1fr] items-center gap-12 max-[840px]:grid-cols-1">
          <div
            className="rounded-2xl border border-border bg-bg-subtle p-2.5"
            style={{ aspectRatio: "1 / 1" }}
          >
            <Placeholder label="drop a photo of you at work" />
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
                  "Three side projects in two years — an uptime monitor, a realtime marketplace, and a travel app my girlfriend and I use every day.",
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
              ph: "baguio / slu photo",
            },
            {
              side: "end",
              meta: "2023–24 · college",
              title: "Interned, then went freelance",
              body:
                "QA at NOAH Business Applications, then freelance — a web Kardex for SLU Sacred Heart Hospital, client sites, an LGU spot-map — while building Recogn for my thesis.",
              ph: "college-era photo",
            },
            {
              side: "start",
              meta: "jul 1, 2024 · baguio",
              title: "Graduated cum laude",
              body: "B.S. Computer Science — with TOPCIT, JLPT N4, and PhilNITS FE picked up the same year.",
              ph: "graduation photo",
            },
            {
              side: "end",
              meta: "jul 2, 2024 · makati",
              title: "First day of work — the very next day",
              body: "Straight to Advanced World Solutions as an R&D engineer.",
              ph: "first-day / office photo",
            },
            {
              side: "start",
              meta: "2025–26 · nights",
              title: "Shipped side projects",
              body: "HTTP Monitor, then ScoutBoard, then JF & The World — live with its two intended users.",
              ph: "late-night setup photo",
            },
          ].map((item) => (
            <div
              key={item.title}
              data-tl-card
              className={`${tlCard} ${item.side === "end" ? "self-end" : "self-start"}`}
            >
              <div className="relative min-w-0" style={{ aspectRatio: "3 / 4" }}>
                <Placeholder label={item.ph} className="absolute inset-0" />
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
        <div className="max-w-[820px]">
          {TOOLBOX.map(([label, body]) => (
            <div
              key={label}
              className="grid grid-cols-[150px_1fr] items-baseline gap-x-6 gap-y-3 border-t border-border py-[26px] max-[840px]:grid-cols-1"
            >
              <span className="font-mono text-xs tracking-[0.04em] text-accent">{label}</span>
              <p className="m-0 font-mono text-[13.5px] leading-[1.9] text-fg-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Off keyboard */}
      <section id="off-keyboard" className="mx-auto max-w-[1080px] px-6 pt-32 md:px-8">
        <p className={`${sectionLabel} mb-3`}>after hours</p>
        <h2 className={`${serifHeading} m-0 mb-4`} style={{ fontSize: "clamp(34px,4.5vw,50px)" }}>
          AFK, probably in-game<span className="text-accent">.</span>
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
            <path d="M6 11h4M8 9v4" />
            <circle cx="15.5" cy="10.5" r="0.5" fill="var(--accent)" />
            <circle cx="17.5" cy="12.5" r="0.5" fill="var(--accent)" />
            <path d="M17.3 5H6.7a4.7 4.7 0 0 0-4.6 5.5l.9 5a2.8 2.8 0 0 0 4.9 1.3L9.6 15h4.8l1.7 1.8a2.8 2.8 0 0 0 4.9-1.3l.9-5A4.7 4.7 0 0 0 17.3 5Z" />
          </svg>
          When I&apos;m not shipping, I&apos;m queuing — PC and a Switch OLED both. The same patience
          that gets me through legacy PL/SQL is how I peaked Radiant.
        </p>
        <p className="m-0 mb-2.5 font-mono text-xs tracking-[0.04em] text-fg-faint">in-game</p>
        <div className="mb-5 flex flex-wrap gap-2.5">
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
        <p className="m-0 mb-2.5 font-mono text-xs tracking-[0.04em] text-fg-faint">irl</p>
        <div className="mb-6 flex flex-wrap gap-2.5">
          {IRL.map((tag) => (
            <span key={tag} className="v2-chip !px-3.5 !py-1.5 !text-[13px]">
              {tag}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4 max-[840px]:grid-cols-2">
          {[
            { label: "me", ph: "a photo of you — candid beats formal", accent: false },
            { label: "the battlestation", ph: "your pc battlestation", accent: false },
            { label: "peak radiant", ph: "valorant rank card screenshot", accent: true },
            { label: "wildcard", ph: "wildcard — coffee, coast, or court", accent: false },
          ].map((tile) => (
            <div key={tile.label} className="relative min-w-0" style={{ aspectRatio: "4 / 5" }}>
              <Placeholder label={tile.ph} className="absolute inset-0" />
              <span
                className={[
                  "pointer-events-none absolute top-3 left-3 z-[2] rounded-full border px-3 py-[5px] font-mono text-xs",
                  tile.accent
                    ? "border-accent bg-accent text-fg-on-accent"
                    : "border-border bg-bg text-fg",
                ].join(" ")}
              >
                {tile.label}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-xs text-fg-faint">
          real photos land here as they&apos;re shot — the tiles are placeholders for now.
        </p>
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
          <MailtoForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-4 px-6 py-6 font-mono text-[13px] text-fg-faint md:px-8">
          <span>© 2026 jade bonifacio · hand-built, no template</span>
          <span>
            manila · <LocalClock />
          </span>
        </div>
      </footer>
    </div>
  );
}
