import { links } from "@/content/links";

/** One headline figure on an employer row: the numeral counts up on /work. */
export type Figure = { value: string; label: string; count?: boolean };

export type Project = {
  slug: string;
  title: string;
  /**
   * "side": built from zero in the evenings; gets a card with a screenshot.
   * "employer": the day job; client work under NDA, so it gets a ledger row
   * on /work (title, shape, figures) and never a card with a picture.
   */
  kind: "side" | "employer";
  /** Mono accent line under the title on cards and rows, e.g. "live in production". */
  eyebrow: string;
  /** One or two sentences shown on the card or row. */
  description: string;
  /** Lowercase mono stack line. The case study carries the full stack. */
  stack: string[];
  /** Lowercase mono status for the command palette and metadata. */
  status: string;
  /** Label of the link into the case study. */
  cta: string;
  /** False for work that cannot be shown (NDA). A card then shows a hatched slot. */
  hasImage: boolean;
  /** Thumbnail under public/. Required when hasImage is true. */
  thumbnail?: string;
  thumbnailAlt?: string;
  /** Public source, when there is one. */
  repo?: string;
  /** Hosted demo, when there is one. Cards with a demo get a `live demo ↗` chip. */
  demo?: string;
  /** Employer rows only: up to three figures, the numbers that travel with the work. */
  figures?: Figure[];
  /** Employer rows only: the id of the employer this engagement sits under. */
  employer?: string;
  /** Employer rows only: when, as a lowercase mono line, e.g. "2024 – present". */
  period?: string;
};

/** An employer on /work: its engagements hang off it as ledger rows. */
export type Employer = {
  id: string;
  name: string;
  /** Lowercase mono. */
  role: string;
  /** Lowercase mono, e.g. "jul 2024 – present". */
  tenure: string;
  /** Lowercase mono, one line of scope the section lead does not already say. */
  note: string;
};

/**
 * Every work with a case study, newest first within its kind. The home page
 * shows the three newest side projects; /work shows the side projects as
 * "Recent work" and the employer engagements under "The day job".
 */
export const projects: Project[] = [
  {
    slug: "reel",
    title: "Reel",
    kind: "side",
    eyebrow: "ten job sources, one inbox",
    description:
      "A job-hunt tracker that does the boring part: reads ten public job sources on a schedule, scores every posting against your criteria, and reminds you exactly once when an application goes quiet.",
    stack: ["nestjs", "prisma · postgres", "redis · bullmq", "next.js 16"],
    status: "live demo · public repo · ci green",
    cta: "read the case study →",
    hasImage: true,
    thumbnail: "/images/work/reel/thumbnail.png",
    thumbnailAlt:
      "Reel's dashboard: '42 new matches waiting in your inbox, 11 applications in motion, and 5 things due in the next three days', over a stage funnel and a list of what is coming up",
    repo: links.repos.reel,
    demo: links.demos.reel,
  },
  {
    slug: "jf-and-the-world",
    title: "JF & The World",
    kind: "side",
    eyebrow: "live in production",
    description:
      "A private, two-person map of where we've been and where we want to go. Pins move from dream to memory.",
    stack: ["next.js 15", "supabase", "mapbox gl", "cloudinary"],
    status: "live in production · live demo",
    cta: "read the case study →",
    hasImage: true,
    thumbnail: "/images/work/jf-and-the-world/thumbnail.png",
    thumbnailAlt: "JF & The World — the shared travel map",
    repo: links.repos.jfAndTheWorld,
    demo: links.demos.jfAndTheWorld,
  },
  {
    slug: "scoutboard",
    title: "ScoutBoard",
    kind: "side",
    eyebrow: "five evenings",
    description:
      "A realtime marketplace for buying and selling small businesses — live offers over websockets, a market simulator keeping it moving.",
    stack: ["nestjs", "mongodb", "redis", "socket.io"],
    status: "live demo · public repo · ci green",
    cta: "read the case study →",
    hasImage: true,
    thumbnail: "/images/work/scoutboard/thumbnail.png",
    thumbnailAlt: "ScoutBoard — 'Buy a real business with real numbers', over a live count of offers on the book",
    repo: links.repos.scoutboard,
    demo: links.demos.scoutboard,
  },
  {
    slug: "enterprise-platform-work",
    title: "Enterprise platform work",
    kind: "employer",
    employer: "advanced-world-solutions",
    period: "2024 – present",
    eyebrow: "top-3 defect resolver · zero rework",
    description:
      "Two years shipping into a 460-screen codebase I didn't write, for a Japanese client, on a 60+ engineer bilingual team. Client under NDA.",
    stack: ["react 18", "typescript", "node · express", "oracle", "redis", "aws"],
    status: "full-time · client under nda",
    cta: "the shape of the work →",
    // Nothing to show: the client and product are under NDA. The row on
    // /work carries the figures instead of a picture.
    hasImage: false,
    figures: [
      { value: "204", label: "pull requests merged of 222 · 97% acceptance", count: true },
      { value: "262", label: "screens carrying my code · 10 of 11 subsystems", count: true },
      { value: "213", label: "of 223 owned defects shipped · zero returned for rework", count: true },
    ],
  },
];

/** The side projects, newest first: "Recent work" on /work. */
export const recentWork = projects.filter((p) => p.kind === "side");

/** The employer engagements, newest first: "The day job" on /work. */
export const employerWork = projects.filter((p) => p.kind === "employer");

/** The three newest side projects: the cards on the home page. */
export const homeProjects = recentWork.slice(0, 3);

/**
 * Employers, newest first. /work renders one grouped ledger per employer:
 * the employer in the left column, its engagements (the `kind: "employer"`
 * projects whose `employer` matches) as rows on the right. A new engagement
 * at the same employer is one more project; a new employer is one more entry.
 */
export const employers: Employer[] = [
  {
    id: "advanced-world-solutions",
    name: "Advanced World Solutions",
    role: "research & development engineer",
    tenure: "jul 2024 – present",
    note: "a 4602011screen japanese property platform · 60+ engineer bilingual en/jp team",
  },
];

/** The engagements under one employer, in `projects` order. */
export function engagementsOf(employer: Employer): Project[] {
  return employerWork.filter((p) => p.employer === employer.id);
}

/** The line under the "The day job" heading. */
export const dayJobLead =
  "Full-time since July 2024, on client work under NDA: no product names, no screenshots. What I can show is the shape of each engagement and its numbers.";

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
