import { links } from "@/content/links";

/** Copy for /about. Quoted verbatim from the brief; edit here, not in the page. */

export const who =
  "I'm Jade Bonifacio, a full-stack developer in the Philippines. I've spent the last two years at Advanced World Solutions working inside a large enterprise codebase for a Japanese client, and my evenings building things from zero. I'm looking for a remote role at a small startup where I can do more of the second.";

export const howIWorkParagraphs = [
  "I read before I write. In a mature codebase the most useful thing I can do is trace how something actually works before I touch it, and I've carried that habit into my own projects.",
  "I make small changes I can defend. Big refactors in a system with years of accumulated behavior break things you find out about a month later. I'd rather ship the smallest fix and explain exactly why it's safe.",
  "I write down what broke. Every project here has a section on what went wrong and how I fixed it, because that's the part I actually learned from and the part I'd want to know about someone else's work.",
  "I use Claude Code every day, at work and at home, and I built my team's tooling on it: the bug-fix pipeline, staging log fetchers, a metrics dashboard. The useful skill turned out not to be prompting. It's knowing where it saves hours and where it confidently makes things worse.",
];

export type SmallerThing = {
  title: string;
  description: string;
  /** GitHub repo, when public. Recogn has none yet. */
  href?: string;
};

export const smallerThings: SmallerThing[] = [
  {
    title: "Recogn",
    description:
      "A cross-platform mobile app for on-device image recognition, React Native and a TensorFlow Lite model trained in Python, built for a research paper (2023–2024).",
  },
  {
    title: "HTTP Monitor",
    description:
      "A NestJS endpoint monitor: cron-driven checks, Redis, Socket.IO, an AI summary of failures. A companion to ScoutBoard.",
    href: links.repos.httpMonitor,
  },
  {
    title: "This site",
    description: "Next.js 15, MDX, no component library.",
    href: links.repos.site,
  },
];

export const lookingFor =
  "A remote full-stack role on a small team, in the TypeScript ecosystem, where I own features end to end and the codebase is still young enough that decisions matter. Startup pace, real users, people who write things down.";

/* ---- Moved from the home page when it became hero + three works. ---- */

/** The day job, in numbers. `count` marks figures that count up from 0. */
export const dayJobStats: { value: string; label: string; count: boolean }[] = [
  { value: "206", label: "pull requests merged", count: true },
  { value: "317", label: "screen modules with my code", count: true },
  { value: "169", label: "customer defects resolved & shipped", count: true },
  { value: "top 3", label: "defect resolver on the 9-engineer uat team", count: false },
];
export const dayJobScope =
  "two years · a ~420-screen japanese property platform · 60+ engineer bilingual en/jp team";
export const dayJobQuote = "I write down what broke.";
export const dayJobQuoteNote = "the habit every case study on this site follows";

export type TimelineItem = {
  meta: string;
  title: string;
  body: string;
  img: string;
  alt: string;
};
export const timeline: TimelineItem[] = [
  {
    meta: "2020 · baguio",
    title: "Moved up the mountain for CS",
    body: "B.S. Computer Science at Saint Louis University.",
    img: "/images/home/baguio-slu.jpg",
    alt: "Baguio, where I moved for Computer Science at Saint Louis University",
  },
  {
    meta: "jul 1–2, 2024 · baguio → makati",
    title: "Graduated cum laude — at work the next day",
    body:
      "B.S. Computer Science — with TOPCIT, JLPT N4, and PhilNITS FE the same year. The next morning: Advanced World Solutions in Makati, as an R&D engineer.",
    img: "/images/home/graduation.jpg",
    alt: "Graduating cum laude, B.S. Computer Science, July 2024",
  },
  {
    meta: "2025–26 · after work",
    title: "Kept shipping after hours",
    body:
      "Still at Advanced World Solutions by day. Three of the evening builds got write-ups here: HTTP Monitor, ScoutBoard, then JF & The World — live with its two intended users. The rest didn't — a QR parking lot, a property management system, a hospital Kardex, client sites.",
    img: "/images/home/late-night.png",
    alt: "A late-night session at the desk, mid-build on a side project",
  },
];

export const irl = ["gym", "badminton", "long walks", "snorkeling", "food trips — all kinds", "coffee, always"];
export const inGame = [
  "valorant", "league of legends", "arc raiders", "path of exile",
  "palworld", "helldivers 2", "every mainline pokémon", "switch oled",
];
export const afterHoursLead = "Some of this happens more than the rest. Here’s what I’d rather be doing.";
export const afterHoursPhotos = [
  { label: "me", img: "/images/home/me.png", alt: "Me in a yukata at a Tanabata festival" },
  { label: "the court", img: "/images/home/court.png", alt: "Mid-rally on a badminton court" },
];
