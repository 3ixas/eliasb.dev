import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyPage } from "@/components/site/case-study";
import { pageTitle, siteName } from "@/content/site";
import { projects } from "@/content/projects";
import { caseStudyFor, caseStudySlugs } from "@/content/stretch/case-studies";
import { caseStudyOpening } from "@/content/stretch/case-study";

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudyFor(slug);
  if (!study) return {};
  const { name, screenshot: image } = caseStudyOpening(study, projects);
  const { description } = study;
  return {
    title: name,
    description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "website",
      siteName,
      url: `/work/${slug}`,
      title: pageTitle(name),
      description,
      images: [{
        url: image.src,
        width: image.width,
        height: image.height,
        alt: image.alt,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle(name),
      description,
      images: [{ url: image.src, alt: image.alt }],
    },
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudyFor(slug);
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
