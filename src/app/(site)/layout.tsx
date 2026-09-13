import { ConstellationBg } from "@/components/ConstellationBg";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

/**
 * The site shell: skip link, sticky nav, main landmark, footer, and the
 * constellation field behind all of it. The layout persists across soft
 * navigations, so the field never restarts between pages.
 */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#content" className="skip-link text-meta-mono">
        skip to content
      </a>
      <ConstellationBg ambient={0.55} />
      <Nav />
      <main id="content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
