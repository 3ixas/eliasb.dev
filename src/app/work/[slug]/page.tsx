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
  return { title: study.name, description: study.summary };
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
