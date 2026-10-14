import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoleStoryPage } from "@/components/site/role-story";
import { pageTitle, siteName } from "@/content/site";
import { roleStoryFor, roleStorySlugs } from "@/content/stretch/role-stories";
import { roleStoryDescription, roleStoryName } from "@/content/stretch/role-story";

export function generateStaticParams() {
  return roleStorySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = roleStoryFor(slug);
  if (!story) return {};
  // The social card is this route's opengraph-image, which Next adds to the tags.
  const name = roleStoryName(story);
  const title = pageTitle(name);
  const description = roleStoryDescription(story);
  return {
    title: name,
    description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: { type: "website", siteName, url: `/work/${slug}`, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RoleStoryRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = roleStoryFor(slug);
  if (!story) notFound();
  return <RoleStoryPage story={story} />;
}
