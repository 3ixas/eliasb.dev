import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyPage } from "@/components/site/case-study-page";
import { caseStudies, isCaseStudySlug } from "@/content/case-studies";

export function generateStaticParams() {
  return Object.keys(caseStudies).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isCaseStudySlug(slug)) return {};
  const study = caseStudies[slug];
  return {
    title: study.name,
    description: study.summary,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "website",
      siteName: "Elias B.",
      url: `/work/${slug}`,
      title: `${study.name} · Elias B.`,
      description: study.summary,
      images: [{
        url: study.hero.src,
        width: study.hero.width,
        height: study.hero.height,
        alt: study.hero.alt,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${study.name} · Elias B.`,
      description: study.summary,
      images: [{ url: study.hero.src, alt: study.hero.alt }],
    },
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isCaseStudySlug(slug)) notFound();
  return <CaseStudyPage study={caseStudies[slug]} />;
}
