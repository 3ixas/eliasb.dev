import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseFilePage } from "@/components/board/case-file";
import { CaseStudyPage } from "@/components/site/case-study-page";
import { caseFiles } from "@/content/case-files";
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
  const file = caseFiles[slug];
  const description = file?.description ?? study.summary;
  const image = file?.screenshot ?? study.hero;
  return {
    title: study.name,
    description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "website",
      siteName: "Elias B.",
      url: `/work/${slug}`,
      title: `${study.name} · Elias B.`,
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
      title: `${study.name} · Elias B.`,
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
  if (!isCaseStudySlug(slug)) notFound();
  const file = caseFiles[slug];
  return file ? <CaseFilePage file={file} /> : <CaseStudyPage study={caseStudies[slug]} />;
}
