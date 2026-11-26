import type { Metadata, ResolvingMetadata } from "next";
import { ResumePage } from "@/components/site/resume";
import { resumeCopy } from "@/content/resume";
import { pageTitle, siteName } from "@/content/site";

const title = pageTitle(resumeCopy.title);

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  // This page's openGraph replaces the root's whole, so it takes the root's card, cache hash included, from the parent.
  // Twitter's image follows it.
  const images = (await parent).openGraph?.images;
  return {
    title: resumeCopy.title,
    description: resumeCopy.description,
    alternates: { canonical: "/resume" },
    openGraph: { type: "website", siteName, url: "/resume", title, description: resumeCopy.description, images },
    twitter: { card: "summary_large_image", title, description: resumeCopy.description },
  };
}

export default function Resume() {
  return <ResumePage />;
}
