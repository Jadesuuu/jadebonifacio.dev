import { links } from "@/content/links";

/** Site-wide copy. URLs live in content/links.ts. */
export const site = {
  name: "jade bonifacio",
  title: "Jade Bonifacio",
  defaultTitle: "Jade Bonifacio — full-stack developer",
  description:
    "Full-stack developer. I ship production apps from zero, and fix the ones other people wrote.",
  url: "https://jadebonifacio.dev",
  domain: "jadebonifacio.dev",
} as const;

/**
 * The nav, and the footer that mirrors it. Every destination is a real route
 * now that the home page is hero + three works: work indexes the case
 * studies, about carries everything biographical, contact carries the form.
 */
export const navLinks = [
  { href: "/work", label: "work", external: false },
  { href: "/about", label: "about", external: false },
  { href: "/contact", label: "contact", external: false },
  { href: links.resume, label: "resume", external: true },
] as const;
