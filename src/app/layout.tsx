import type { Metadata } from "next";
import "./globals.css";

const isIndexable = process.env.SITE_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.eliasb.dev"),
  title: {
    default: "Elias B. — Software that untangles complex systems",
    template: "%s · Elias B.",
  },
  description:
    "I’m Elias, a software engineer in London. Here’s what I build and what I get up to outside work.",
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
    title: "Elias B. — Software that untangles complex systems",
    description:
      "Projects, ideas, and interests from Elias Bennett, a software engineer in London.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elias B. — Software that untangles complex systems",
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
  try {
    (() => {
      const root = document.documentElement;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (location.pathname !== '/' || location.hash || motion.matches) return;
      root.dataset.homeOpening = 'running';
      let fallbackTimer;
      const cleanup = () => {
        window.clearTimeout(fallbackTimer);
        window.removeEventListener('keydown', finish, true);
        window.removeEventListener('focusin', finish, true);
        window.removeEventListener('pointerdown', finish, true);
        window.removeEventListener('touchstart', finish, true);
        window.removeEventListener('wheel', finish, true);
        motion.removeEventListener('change', onMotionChange);
        window.removeEventListener('home-opening-completed', cleanup);
      };
      const finish = () => {
        if (!root.hasAttribute('data-home-opening')) return;
        root.removeAttribute('data-home-opening');
        cleanup();
        window.dispatchEvent(new Event('home-opening-finish'));
      };
      const onMotionChange = (event) => {
        if (event.matches) finish();
      };
      window.addEventListener('keydown', finish, true);
      window.addEventListener('focusin', finish, true);
      window.addEventListener('pointerdown', finish, true);
      window.addEventListener('touchstart', finish, true);
      window.addEventListener('wheel', finish, true);
      motion.addEventListener('change', onMotionChange);
      window.addEventListener('home-opening-completed', cleanup);
      fallbackTimer = window.setTimeout(finish, 7000);
    })();
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
