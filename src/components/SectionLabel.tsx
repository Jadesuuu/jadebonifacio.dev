import type { ReactNode } from "react";

/** Lowercase mono section label in --accent (the sanctioned brass-at-rest text), 16px below. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-meta-mono text-accent">{children}</p>;
}
