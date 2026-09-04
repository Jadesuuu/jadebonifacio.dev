import { cookies } from "next/headers";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

/** The site shell: skip link, sticky nav, main landmark, footer. */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <>
      <a href="#content" className="skip-link text-meta-mono">
        skip to content
      </a>
      <Nav theme={theme} />
      <main id="content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
