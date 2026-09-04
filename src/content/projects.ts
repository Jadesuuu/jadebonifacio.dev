export type Project = {
  slug: string;
  title: string;
  /** One-line description shown on the project row. */
  description: string;
  stack: string[];
  /** Lowercase mono label, e.g. "live in production". */
  status: string;
  /** False for work that cannot be shown (NDA). The row then has no image slot. */
  hasImage: boolean;
  /** 360x240 screenshot (2x for a 180x120 slot). Required when hasImage is true. */
  thumbnail?: string;
};

// TODO: /images/projects/*.png are transparent 360x240 placeholders so the
// layout is right. Replace with real screenshots taken against seeded demo
// data (DESIGN.md, Images).
export const projects: Project[] = [
  {
    slug: "jf-and-the-world",
    title: "JF & The World",
    description:
      "A private, two-person map of where we've been and where we want to go. Live in production.",
    stack: ["next.js 15", "supabase", "mapbox gl", "cloudinary"],
    status: "live in production",
    hasImage: true,
    thumbnail: "/images/projects/jf-and-the-world.png",
  },
  {
    slug: "scoutboard",
    title: "ScoutBoard",
    description:
      "A realtime marketplace for buying and selling small businesses, built in three weeks of evenings.",
    stack: ["nestjs", "mongodb", "redis", "socket.io"],
    status: "public repo · ci green",
    hasImage: true,
    thumbnail: "/images/projects/scoutboard.png",
  },
  {
    slug: "enterprise-platform-work",
    title: "Enterprise platform work",
    description:
      "Two years shipping into a large, mature codebase I didn't write, for a Japanese client, on a bilingual team. Client under NDA.",
    stack: ["react", "typescript", "node", "oracle", "aws"],
    status: "full-time · client under nda",
    hasImage: false,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
