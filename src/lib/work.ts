import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { links } from "@/content/links";

const WORK_DIR = path.join(process.cwd(), "src/content/work");

/** One entry in a case study's header links row. */
export type WorkLink = {
  label: string;
  /** Dot-path into content/links.ts, e.g. "repos.scoutboard" or "github". */
  to?: string;
  /** Plain text instead of a link (e.g. "private, two users by design"). */
  note?: string;
};

export type WorkFrontmatter = {
  title: string;
  year: number;
  kind: string;
  status: string;
  summary: string;
  stack: string[];
  links?: WorkLink[];
  /** Slug of the case study the "next project" row points to. */
  next?: string;
};

/** Resolve a frontmatter link's dot-path against content/links.ts. */
export function resolveWorkLink(to: string): string | null {
  const value = to.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, links);
  return typeof value === "string" ? value : null;
}

export function getWorkSlugs(): string[] {
  return readdirSync(WORK_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** Raw MDX source (frontmatter included) for one case study, or null. */
export function getWorkSource(slug: string): string | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return readFileSync(path.join(WORK_DIR, `${slug}.mdx`), "utf8");
  } catch {
    return null;
  }
}
