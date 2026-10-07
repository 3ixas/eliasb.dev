import { homeTitle, siteDescription, siteName } from "@/content/site";
import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./board.css";

// Newsreader as two fixed optical sizes rather than the variable font with its
// opsz axis (274 KiB): a text cut for body sizes and a display cut for
// headlines, Latin subset, from Google Fonts under the OFL (fonts/newsreader).
const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader/text-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader/text-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/newsreader/text-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader/text-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-newsreader",
  adjustFontFallback: "Times New Roman",
});

const newsreaderDisplay = localFont({
  src: [
    { path: "./fonts/newsreader/display-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader/display-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/newsreader/display-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader/display-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-newsreader-display",
  adjustFontFallback: "Times New Roman",
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
      className={`${newsreader.variable} ${newsreaderDisplay.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
