import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Elias B. — Personal site concept study",
    template: "%s · Elias B.",
  },
  description: "Three visual directions for the next version of eliasb.dev.",
  robots: { index: false, follow: false },
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
