import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ContactForm } from "@/components/home/ContactForm";
import { CopyEmailButton } from "@/components/home/CopyEmailButton";
import { links } from "@/content/links";
import { site } from "@/lib/site";

const title = "Contact";
const description = "Have a role, a project, or a codebase that needs fixing? I'd love to hear about it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: `${title} · ${site.title}`, description },
  twitter: { title: `${title} · ${site.title}`, description },
};

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.42.36.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .31.21.69.82.57A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

/**
 * /contact — the form, on its own route. Email to copy and the socials first
 * (the fastest paths), then the form. Same server action as before; the
 * layout is the single column rather than the old two-column block.
 */
export default function ContactPage() {
  return (
    <Container className="pt-16 md:pt-24">
      <h1 className="v2-h1">{title}</h1>
      <p className="mt-4 max-w-[44ch] text-[18px] leading-relaxed text-fg-muted">{description}</p>

      <div className="mt-8 flex flex-col gap-4">
        <CopyEmailButton />
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="v2-btn-b inline-flex size-10 items-center justify-center rounded-lg border border-border text-fg-muted"
          >
            <GitHubIcon />
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="v2-btn-b inline-flex size-10 items-center justify-center rounded-lg border border-border text-fg-muted"
          >
            <LinkedInIcon />
          </a>
          <a
            href={links.resume}
            target="_blank"
            rel="noreferrer"
            className="v2-btn-b inline-flex h-10 items-center rounded-lg border border-border px-4 font-mono text-[14px] text-fg-muted"
          >
            resume.pdf
          </a>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-bg-subtle p-6 md:mt-14 md:p-8">
        <ContactForm />
      </div>
    </Container>
  );
}
