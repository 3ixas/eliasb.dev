import type { Metadata } from "next";
import { WorkArchivePage } from "@/components/site/work-archive-page";
import { projects } from "@/content/projects";
import { headlineCard } from "@/content/share";
import { pageTitle, siteName } from "@/content/site";
import { workArchive } from "@/content/stretch/site-copy";

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
    images: [headlineCard],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle("Things I make"),
    description: workArchive.description,
    images: [headlineCard],
  },
};

export default function ThingsIMakePage() {
  return <WorkArchivePage catalogue={projects} />;
}
