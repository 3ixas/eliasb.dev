import type { Metadata } from "next";
import "./globals.css";

const isIndexable = process.env.SITE_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.eliasb.dev"),
  title: {
    default: "Elias B. — Software that makes complex things easier to understand",
    template: "%s · Elias B.",
  },
  description:
    "Projects, ideas, and interests from Elias Bennett, a software engineer in London.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Elias B.",
    url: "/",
    title: "Elias B. — Software that makes complex things easier to understand",
    description:
      "Projects, ideas, and interests from Elias Bennett, a software engineer in London.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elias B. — Software that makes complex things easier to understand",
    description:
      "Projects, ideas, and interests from Elias Bennett, a software engineer in London.",
    images: ["/opengraph-image"],
  },
  robots: { index: isIndexable, follow: isIndexable },
};

const themeScript = `
  try {
    const saved = localStorage.getItem('elias-theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
  } catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
