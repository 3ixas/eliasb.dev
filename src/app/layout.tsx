import { homeTitle, siteDescription, siteName } from "@/content/site";
import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Newsreader } from "next/font/google";
import "./board.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
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
      className={`${newsreader.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
