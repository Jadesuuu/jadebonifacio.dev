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

/** Inner-page nav (DESIGN.md, Nav). The home page has its own nav with the same links. */
export const navLinks = [
  { href: "/#work", label: "work", external: false },
  { href: "/about", label: "about", external: false },
  { href: "/#contact", label: "contact", external: false },
  { href: links.resume, label: "resume", external: true },
] as const;
