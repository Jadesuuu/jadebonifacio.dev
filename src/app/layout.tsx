import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { cookies } from "next/headers";
import { ViewTransitions } from "@/components/ViewTransitions";
import { site } from "@/lib/site";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// Display serif for the v2 home headings (Instrument Serif, regular + italic).
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.defaultTitle, template: `%s · ${site.title}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.title,
    locale: "en_US",
    url: "/",
    title: site.defaultTitle,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.defaultTitle,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Root: fonts, theme attribute, body. The site shell (skip link, nav, main,
 * footer) lives in app/(site)/layout.tsx so the 404 page can render without it.
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read the theme cookie on the server so <html data-theme> is correct in the
  // first byte. No inline script, no flash. Dark when the cookie is absent.
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <ViewTransitions />
        {children}
      </body>
    </html>
  );
}
