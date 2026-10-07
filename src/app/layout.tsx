import { homeTitle, siteDescription, siteName } from "@/content/site";
import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./board.css";

// Newsreader as two fixed optical sizes rather than the variable font with its
// opsz axis (274 KiB): a text cut for body sizes and a display cut for
// headlines. Each face is split by unicode-range: a core file every page needs
// (preloaded) and an accents file fetched only for a page that uses one. The
// two are combined into --font-newsreader and --font-newsreader-display in
// board.css.
// Built by scripts/fonts/newsreader.py from Google Fonts, under the OFL; it
// also writes the two ranges below, which must be literals for next/font.

const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader/text-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader/text-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/newsreader/text-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader/text-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-newsreader-core",
  declarations: [{ prop: "unicode-range", value: "U+0020-007E, U+00A0, U+00B7, U+00BA, U+00D7, U+2013-2014, U+2018-201A, U+201C-201E, U+2022, U+2026, U+2032-2033, U+2039-203A, U+2044, U+20AC, U+2122, U+2212" }],
  adjustFontFallback: "Times New Roman",
});

const newsreaderAccents = localFont({
  src: [
    { path: "./fonts/newsreader/text-400-accents.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader/text-400-italic-accents.woff2", weight: "400", style: "italic" },
    { path: "./fonts/newsreader/text-500-accents.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader/text-600-accents.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-newsreader-accents",
  declarations: [{ prop: "unicode-range", value: "U+00A1-00B6, U+00B8-00B9, U+00BB-00D6, U+00D8-00FF, U+0131, U+0152-0153, U+02BC, U+02C6, U+02DA, U+02DC, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+2215" }],
  adjustFontFallback: false,
  preload: false,
});

const newsreaderDisplay = localFont({
  src: [
    { path: "./fonts/newsreader/display-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader/display-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/newsreader/display-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader/display-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-newsreader-display-core",
  declarations: [{ prop: "unicode-range", value: "U+0020-007E, U+00A0, U+00B7, U+00BA, U+00D7, U+2013-2014, U+2018-201A, U+201C-201E, U+2022, U+2026, U+2032-2033, U+2039-203A, U+2044, U+20AC, U+2122, U+2212" }],
  adjustFontFallback: "Times New Roman",
});

const newsreaderDisplayAccents = localFont({
  src: [
    { path: "./fonts/newsreader/display-400-accents.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader/display-400-italic-accents.woff2", weight: "400", style: "italic" },
    { path: "./fonts/newsreader/display-500-accents.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader/display-600-accents.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-newsreader-display-accents",
  declarations: [{ prop: "unicode-range", value: "U+00A1-00B6, U+00B8-00B9, U+00BB-00D6, U+00D8-00FF, U+0131, U+0152-0153, U+02BC, U+02C6, U+02DA, U+02DC, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+2215" }],
  adjustFontFallback: false,
  preload: false,
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const isIndexable = process.env.SITE_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.eliasb.dev"),
  title: {
    default: homeTitle,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  // The favicon is app/icon.svg and the social image app/opengraph-image.tsx;
  // Next.js links both from their file names.
  openGraph: {
    type: "website",
    siteName,
    url: "/",
    title: homeTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: siteDescription,
  },
  robots: { index: isIndexable, follow: isIndexable },
};

const siteBootScript = `
  try {
    const root = document.documentElement;
    let saved = null;
    try { saved = localStorage.getItem('elias-theme'); } catch (_) {}
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
    else delete root.dataset.theme;
    // The Board follows data-lights once script runs, so the theme controller
    // decides when the room changes, including when the device setting does.
    const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.lights = dark ? 'on' : 'off';
  } catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${newsreader.variable} ${newsreaderAccents.variable} ${newsreaderDisplay.variable} ${newsreaderDisplayAccents.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
