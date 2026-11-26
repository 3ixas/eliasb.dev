import type { Metadata, ResolvingMetadata } from "next";
import "../projects.css";
import { WorkArchivePage } from "@/components/site/work-archive-page";
import { projects } from "@/content/projects";
import { pageTitle, siteName } from "@/content/site";
import { workArchive } from "@/content/stretch/site-copy";

const title = pageTitle("Things I make");

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  // This page's openGraph replaces the root's whole, so it takes the root's card, cache hash included, from the parent.
  // Twitter's image follows it.
  const images = (await parent).openGraph?.images;
  return {
    title: "Things I make",
    description: workArchive.description,
    alternates: { canonical: "/things-i-make" },
    openGraph: { type: "website", siteName, url: "/things-i-make", title, description: workArchive.description, images },
    twitter: { card: "summary_large_image", title, description: workArchive.description },
  };
}

export default function ThingsIMakePage() {
  return <WorkArchivePage catalogue={projects} />;
}
