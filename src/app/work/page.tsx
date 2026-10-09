import type { Metadata } from "next";
import { WorkArchivePage } from "@/components/site/work-archive-page";
import { projects } from "@/content/projects";
import { pageTitle, siteName } from "@/content/site";
import { workArchive } from "@/content/stretch/site-copy";

const image = projects[0].screenshot!;

export const metadata: Metadata = {
  title: "Work",
  description: workArchive.description,
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    siteName,
    url: "/work",
    title: pageTitle("Work"),
    description: workArchive.description,
    images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle("Work"),
    description: workArchive.description,
    images: [{ url: image.src, alt: image.alt }],
  },
};

export default function WorkPage() {
  return <WorkArchivePage catalogue={projects} />;
}
