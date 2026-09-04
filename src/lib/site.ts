/** Site-wide copy and links. Copy here is quoted from DESIGN.md; keep in sync. */
export const site = {
  name: "jade bonifacio",
  title: "Jade Bonifacio",
  description:
    "Full-stack developer. I ship production apps from zero, and fix the ones other people wrote.",
  // TODO: replace placeholders with real destinations.
  email: "hello@jadebonifacio.dev",
  github: "https://github.com/jadebonifacio",
  linkedin: "https://www.linkedin.com/in/jadebonifacio",
  resume: "/resume.pdf",
} as const;

export const hero = {
  headline:
    "Full-stack developer. I ship production apps from zero, and fix the ones other people wrote.",
  context: "Philippines · open to remote startup roles",
  tools:
    "typescript · react · next.js · nestjs · node · postgres · mongodb · redis · aws",
} as const;

export const navLinks = [
  { href: "/#work", label: "work" },
  { href: "/about", label: "about" },
  { href: site.resume, label: "resume" },
] as const;
