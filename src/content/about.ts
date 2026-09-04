import { links } from "@/content/links";

/** Copy for /about. Quoted verbatim from the brief; edit here, not in the page. */

export const who =
  "I'm Jade Bonifacio, a full-stack developer in the Philippines. I've spent the last two years at Advanced World Solutions working inside a large enterprise codebase for a Japanese client, and my evenings building things from zero. I'm looking for a remote role at a small startup where I can do more of the second.";

export const howIWorkParagraphs = [
  "I read before I write. In a mature codebase the most useful thing I can do is trace how something actually works before I touch it, and I've carried that habit into my own projects.",
  "I make small changes I can defend. Big refactors in a system with years of accumulated behavior break things you find out about a month later. I'd rather ship the smallest fix and explain exactly why it's safe.",
  "I write down what broke. Every project here has a section on what went wrong and how I fixed it, because that's the part I actually learned from and the part I'd want to know about someone else's work.",
  "I use Claude Code every day, at work and at home. I've built internal tooling around it for my team, and a good part of that job is knowing where it saves hours and where it confidently makes things worse.",
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
