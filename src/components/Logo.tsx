/**
 * The mark: "jb" in mono with a trailing underscore cursor. Colour comes from
 * the parent (inherit) so it follows the nav's --fg; the cursor is --fg-faint.
 * The underscore is decorative, so assistive tech reads only "jade bonifacio".
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="jade bonifacio"
      className={["text-meta-mono", className].filter(Boolean).join(" ")}
    >
      <span aria-hidden="true">
        jb<span className="text-fg-faint">_</span>
      </span>
    </span>
  );
}
