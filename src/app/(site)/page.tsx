import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { ProjectRow } from "@/components/ProjectRow";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { projects } from "@/content/projects";
import { howIWork } from "@/lib/site";

/**
 * Home: hero, selected work, how i work, contact. Sections are 64px apart on
 * mobile and 96px on desktop. Each block fades up once per session
 * (RevealGroup). Anchored sections carry scroll-mt so nav anchors land below
 * the sticky nav.
 */
export default function HomePage() {
  return (
    <RevealGroup>
      <RevealItem>
        <Container as="header" className="pt-16 md:pt-24">
          <Hero />
        </Container>
      </RevealItem>

      <RevealItem>
        <Container as="section" id="work" className="mt-16 scroll-mt-14 md:mt-24">
          <SectionLabel>selected work</SectionLabel>
          <div>
            {projects.map((project) => (
              <ProjectRow key={project.slug} project={project} />
            ))}
          </div>
        </Container>
      </RevealItem>

      <RevealItem>
        <Container as="section" className="mt-16 md:mt-24">
          <SectionLabel>how i work</SectionLabel>
          <p>{howIWork}</p>
        </Container>
      </RevealItem>

      <RevealItem>
        <Container as="section" id="contact" className="mt-16 scroll-mt-14 md:mt-24">
          <SectionLabel>contact</SectionLabel>
          <ContactForm />
        </Container>
      </RevealItem>
    </RevealGroup>
  );
}
