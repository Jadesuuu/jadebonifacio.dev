import { links } from "@/content/links";

/** Site-wide copy. Quoted from DESIGN.md; keep in sync. URLs live in content/links.ts. */
export const site = {
  name: "jade bonifacio",
  title: "Jade Bonifacio",
  defaultTitle: "Jade Bonifacio — full-stack developer",
  description:
    "Full-stack developer. I ship production apps from zero, and fix the ones other people wrote.",
  url: "https://jadebonifacio.dev",
  domain: "jadebonifacio.dev",
} as const;

export const hero = {
  headline:
    "Full-stack developer. I ship production apps from zero, and fix the ones other people wrote.",
  context: "Philippines · open to remote startup roles",
  tools:
    "typescript · react · next.js · nestjs · node · postgres · mongodb · redis · aws",
} as const;

export const navLinks = [
  { href: "/#work", label: "work", external: false },
  { href: "/about", label: "about", external: false },
  { href: links.resume, label: "resume", external: true },
] as const;

/** "How I work" paragraph, quoted from DESIGN.md. */
export const howIWork =
  "The day job taught me how to be careful: read before writing, make small defensible changes. Side projects taught me how to ship. What I want now is somewhere I can do both: a smaller team, more ownership, features rather than maintenance.";
