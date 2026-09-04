import type { ReactNode } from "react";

/** Lowercase mono section label, --fg-faint, 16px below. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-meta-mono text-fg-faint">{children}</p>;
}
