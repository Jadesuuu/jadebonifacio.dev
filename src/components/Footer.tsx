import { Container } from "@/components/Container";
import { site } from "@/lib/site";

/** Hairline top border. Email left, resume right, both mono. Stacks on mobile. */
export function Footer() {
  return (
    <footer className="mt-16 md:mt-24">
      <Container>
        <div className="flex flex-col gap-3 border-t border-border pt-6 pb-12 md:flex-row md:items-center md:justify-between">
          <a href={`mailto:${site.email}`} className="text-meta-mono link-quiet">
            {site.email}
          </a>
          <a href={site.resume} className="text-meta-mono link-quiet">
            resume.pdf
          </a>
        </div>
      </Container>
    </footer>
  );
}
