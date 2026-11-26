import { homeTitle, siteDescription, siteName } from "@/content/site";
import type { Metadata } from "next";
import { SiteDocument } from "./site-document";

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
  // The SVG favicon (app/icon.svg), Safari PNG fallback (app/icon1.png), Apple touch icon (app/apple-icon.png)
  // and social image (app/opengraph-image.tsx) are all linked by Next.js from their file names.
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument>{children}</SiteDocument>;
}
