import type { Metadata } from "next";
import { WorkDrawer } from "@/components/board/work-drawer";
import { caseFiles, drawer } from "@/content/case-files";
import { pageTitle, siteName } from "@/content/site";

const image = caseFiles.threshold.screenshot;

export const metadata: Metadata = {
  title: "Work",
  description: drawer.description,
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    siteName,
    url: "/work",
    title: pageTitle("Work"),
    description: drawer.description,
    images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle("Work"),
    description: drawer.description,
    images: [{ url: image.src, alt: image.alt }],
  },
};

export default function WorkPage() {
  return <WorkDrawer />;
}
