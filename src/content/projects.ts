import { links } from "@/content/links";

export type Project = {
  slug: string;
  title: string;
  /** Mono accent eyebrow on the home card, e.g. "live in production". */
  eyebrow: string;
  /** One or two sentences shown on the home card. */
  description: string;
  /** Lowercase mono stack line on the home card. The case study carries the full stack. */
  stack: string[];
  /** Lowercase mono status for the command palette and metadata. */
  status: string;
  /** Label of the card's link into the case study. */
  cta: string;
  /** False for work that cannot be shown (NDA). The card then shows a hatched slot. */
  hasImage: boolean;
  /** Thumbnail under public/. Required when hasImage is true. */
  thumbnail?: string;
  thumbnailAlt?: string;
  /** Public source, when there is one. */
  repo?: string;
  /** Hosted demo, when there is one. Cards with a demo get a `live demo ↗` chip. */
  demo?: string;
};

/** The three projects on the home page, in order. Home cards render from this list. */
export const projects: Project[] = [
  {
    slug: "jf-and-the-world",
    title: "JF & The World",
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
    eyebrow: "the day job · top-3 defect resolver",
    description:
      "Shipping into a large, mature codebase I didn't write, for a Japanese client, on a bilingual team. Client under NDA.",
    stack: ["react", "typescript", "node", "oracle", "dynamodb", "aws"],
    status: "full-time · client under nda",
    cta: "the shape of the work →",
    hasImage: false,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
