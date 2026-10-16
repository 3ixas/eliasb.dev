import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoleStoryPage } from "@/components/site/role-story";
import { isRoleVariant, RoleStoryVariant, TodaySwitcher } from "@/components/site/role-story-visuals.prototype";
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { slug } = await params;
  const story = roleStoryFor(slug);
  if (!story) notFound();
  // PROTOTYPE (#198): ?variant= picks a BNP Paribas Role story variant; outside production only.
  if (process.env.NODE_ENV !== "production" && slug === "bnp-paribas") {
    const { variant } = await searchParams;
    if (isRoleVariant(variant)) return <RoleStoryVariant story={story} variant={variant} />;
    return (
      <>
        <RoleStoryPage story={story} />
        <TodaySwitcher />
      </>
    );
  }
  return <RoleStoryPage story={story} />;
}
