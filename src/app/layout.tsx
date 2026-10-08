import { homeTitle, siteDescription, siteName } from "@/content/site";
import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./board.css";
import "./stretch-tokens.css";
import "./stretch-type.css";
import "./stretch-shell.css";

// Self-hosted at build time by next/font, so no request goes to Google when a
// visitor loads a page. Bricolage Grotesque is variable in weight, optical size
// and width: the width axis gives the condensed display style (stretch-type.css).
// Latin only, which covers the accented letters the site has used so far; adding
// latin-ext would preload another 53 KB file on every page.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
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
    // The browser's toolbar colour follows the page, including a remembered
    // choice that differs from the device. This meta is made here, not in JSX:
    // React would recreate a hoisted meta whose attributes script had changed.
    // The page colours, as in TOOLBAR_COLOUR (components/site/theme.ts); theme.spec.ts keeps them level.
    const toolbar = { light: '#fbfbf8', dark: '#0d0d12' };
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
      className={`${bricolage.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
