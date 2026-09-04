import Link from "next/link";

type NextRowProps = {
  /** Lowercase mono label, e.g. "next project" or "work". Arrow is added. */
  label: string;
  title: string;
  href: string;
};

/**
 * The closing row so no page dead-ends: hairline top border, mono label with
 * an arrow, then the destination title. The whole row is the link and the
 * title underline draws on hover like a project row.
 */
export function NextRow({ label, title, href }: NextRowProps) {
  return (
    <Link href={href} className="group flex flex-col gap-2 border-t border-border pt-6 text-fg">
      <span className="text-meta-mono text-fg-faint">{label} →</span>
      <span className="underline-draw self-start text-h3">{title}</span>
    </Link>
  );
}
