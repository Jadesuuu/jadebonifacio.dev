import type { ReactNode } from "react";

/**
 * Case-study callout (DESIGN.md): left 2px --accent border, --fg-muted text,
 * 16px left padding, no background, no radius. For the one-line lessons.
 */
export function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className="my-6 border-l-2 border-accent pl-4 text-fg-muted">{children}</aside>
  );
}
