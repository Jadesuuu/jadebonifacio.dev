import { Container } from "@/components/Container";
import { LocalClock } from "@/components/home/LocalClock";

// Baked in at build time; the site is fully static.
const year = new Date().getFullYear();

/**
 * Footer (DESIGN.md): hairline top border, mono --fg-faint. Left the © line,
 * right the Manila clock. The same on every page; `wide` uses the home page's
 * 1080px shell instead of the 680px column.
 */
export function Footer({ wide = false }: { wide?: boolean }) {
  const row = (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6 font-mono text-[13px] tracking-[0.02em] text-fg-faint">
      <span>© {year} jade bonifacio · hand-built, no template</span>
      <span>
        manila · <LocalClock />
      </span>
    </div>
  );

  if (wide) {
    return (
      <footer className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-6 md:px-8">{row}</div>
      </footer>
    );
  }
  return (
    <footer className="mt-16 md:mt-24">
      <Container>
        <div className="border-t border-border pb-6">{row}</div>
      </Container>
    </footer>
  );
}
