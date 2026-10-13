import type { Metadata } from "next";
import { WorkArchivePage } from "@/components/site/work-archive-page";
import { projects } from "@/content/projects";
import { pageTitle, siteName } from "@/content/site";
import { workArchive } from "@/content/stretch/site-copy";

const image = projects[0].screenshot!;

export const metadata: Metadata = {
  title: "Things I make",
  description: workArchive.description,
  alternates: { canonical: "/things-i-make" },
  openGraph: {
    type: "website",
    siteName,
    url: "/things-i-make",
    title: pageTitle("Things I make"),
    description: workArchive.description,
    images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle("Things I make"),
    description: workArchive.description,
    images: [{ url: image.src, alt: image.alt }],
  },
};

export default function ThingsIMakePage() {
  return <WorkArchivePage catalogue={projects} />;
}
