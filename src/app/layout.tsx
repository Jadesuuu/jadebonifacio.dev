import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ViewTransitions } from "@/components/ViewTransitions";
import { site } from "@/lib/site";
import { DEFAULT_THEME, THEME_COOKIE } from "@/lib/theme";
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

// Every page is prerendered at build time and served from the CDN. Reading a
// cookie or header during render would silently turn the whole tree into
// per-request serverless rendering (cold starts, no cache); fail the build
// instead. Server actions (the contact form) are unaffected by this flag.
export const dynamic = "error";

// Runs before first paint. The HTML is built with the dark default; if the
// visitor previously chose light, flip the attribute before anything renders so
// there is no flash. Keeping this out of React (and out of the server) is what
// lets the page stay static.
const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);if(m&&m[1]!=="${DEFAULT_THEME}")document.documentElement.dataset.theme=m[1]}catch(e){}})()`;

/**
 * Root: fonts, theme attribute, body. The site shell (skip link, nav, main,
 * footer) lives in app/(site)/layout.tsx so the 404 page can render without it.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      // The pre-paint script above may have switched this to "light" before
      // hydration; that difference is intentional.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ViewTransitions />
        {children}
      </body>
    </html>
  );
}
