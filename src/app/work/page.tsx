import type { Metadata } from "next";
import { WorkDrawer } from "@/components/board/work-drawer";
import { caseFiles, drawer } from "@/content/case-files";

const image = caseFiles.threshold.screenshot;

export const metadata: Metadata = {
  title: "Work",
  description: drawer.description,
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    siteName: "Elias B.",
    url: "/work",
    title: "Work · Elias B.",
    description: drawer.description,
    images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work · Elias B.",
    description: drawer.description,
    images: [{ url: image.src, alt: image.alt }],
  },
};

export default function WorkPage() {
  return <WorkDrawer />;
}
