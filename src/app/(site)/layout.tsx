import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

/** The site shell: skip link, sticky nav, main landmark, footer. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#content" className="skip-link text-meta-mono">
        skip to content
      </a>
      <Nav />
      <main id="content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
