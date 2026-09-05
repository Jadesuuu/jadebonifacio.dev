import { Container } from "@/components/Container";
import { links, mailto } from "@/content/links";

/** Hairline top border. Email left, resume right, both mono. Stacks on mobile. */
export function Footer() {
  return (
    <footer className="mt-16 md:mt-24">
      <Container>
        <div className="flex flex-col gap-3 border-t border-border pt-6 pb-12 md:flex-row md:items-center md:justify-between">
          <a href={mailto} className="text-meta-mono link-quiet tap-target">
            {links.email}
          </a>
          <a href={links.resume} target="_blank" rel="noopener" className="text-meta-mono link-quiet tap-target">
            resume.pdf
          </a>
        </div>
      </Container>
    </footer>
  );
}
