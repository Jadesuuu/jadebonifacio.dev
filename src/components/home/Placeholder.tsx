/**
 * Hatched image placeholder. Stands in for photos and screenshots that aren't
 * shot yet (portrait, timeline, bento tiles). The look — diagonal hatch, mono
 * caption — comes from `.v2-placeholder` in globals.css. Decorative, so it is
 * hidden from assistive tech; swap in a real <Image> when the asset lands.
 */
export function Placeholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={`v2-placeholder ${className}`} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}
