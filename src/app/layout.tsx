import { homeTitle, siteDescription, siteName } from "@/content/site";
import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Mono, Instrument_Sans, Newsreader } from "next/font/google";
import "./base.css";
import "./stretch-tokens.css";
import "./tokens.css";
import "./stretch-type.css";
import "./stretch-shell.css";
import "./quiet-index.css";
import "./quiet-opening.css";
import "./quiet-long-form.css";
import "./quiet-forced-colors.css";
import "./shell.css";
import "./parts.css";
import "./stretch-resume.css";

// Self-hosted at build time by next/font, so no request goes to Google when a
// visitor loads a page. Bricolage Grotesque is variable in weight, optical size
// and width: the width axis gives the condensed display style (stretch-type.css).
// Latin only, which covers the accented letters the site has used so far; adding
// latin-ext would preload another 53 KB file on every page.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  // The fallback faces are in stretch-type.css, sized per style; next/font's
  // own would be one width for every style, wrong for the condensed display type.
  adjustFontFallback: false,
  fallback: ["Bricolage Fallback", "system-ui", "sans-serif"],
});

// Metadata, dates, counts and captions. The Résumé sheet keeps JetBrains Mono, loaded by its own layout.
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-mono",
});

// Passes and panels (docs/design/DESIGN.md "Type"): Newsreader for headings, figures and prose, with its
// optical-size axis; Instrument Sans for interface text. Both variable in weight, Latin only, and given
// next/font's fallback faces, which it sizes from each font's own metrics so a late font moves nothing.
// tokens.css reads them as --serif and --sans. Bricolage and DM Mono stay until #420.
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: "normal",
  variable: "--font-newsreader",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  style: "normal",
  variable: "--font-instrument-sans",
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
    // Script runs: the header's links may wait behind Menu on a phone (shell.css). Without it they show.
    root.dataset.script = '';
    let saved = null;
    try { saved = localStorage.getItem('elias-theme'); } catch (_) {}
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
    else delete root.dataset.theme;
    // data-lights follows the appearance once script runs, so the theme
    // controller decides when the room changes, including when the device
    // setting does.
    const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.lights = dark ? 'on' : 'off';
    // The browser's toolbar colour follows the page, including a remembered
    // choice that differs from the device. This meta is made here, not in JSX:
    // React would recreate a hoisted meta whose attributes script had changed.
    // The page colours, as in TOOLBAR_COLOUR (components/site/theme.ts); theme.spec.ts keeps them level.
    const toolbar = { light: '#eeede9', dark: '#0d0d0f' };
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = dark ? toolbar.dark : toolbar.light;
    document.head.appendChild(meta);
  } catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${dmMono.variable} ${newsreader.variable} ${instrumentSans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
