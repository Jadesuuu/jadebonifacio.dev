import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ViewTransitions } from "@/components/ViewTransitions";
import { site } from "@/lib/site";
import { DEFAULT_THEME, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

// One family, three jobs. IBM Plex is a humanist grotesque drawn for engineers:
// quiet, precise and warm, with tabular numerals that let the day-job figures
// carry weight without shouting. It replaced Instrument Serif + Geist, a trio
// the AI design tools converge on hard enough that the site read as generated
// before a word of it was read. Plex also has a Japanese cut (IBM Plex Sans JP)
// if the bilingual EN/JP work ever wants it — the choice has a reason.
//
// 600 is the display weight; 400/500 carry body and UI. That retires the old
// "two weights only, never 600" rule, which existed to keep a 400-weight serif
// from being faked bold and has no purchase on a grotesque.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: true,
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
      className={`${plexSans.variable} ${plexMono.variable}`}
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
