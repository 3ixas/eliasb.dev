import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseFilePage } from "@/components/board/case-file";
import { caseFiles, caseFileSlugs, isCaseFileSlug } from "@/content/case-files";

export function generateStaticParams() {
  return caseFileSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isCaseFileSlug(slug)) return {};
  const { name, description, screenshot: image } = caseFiles[slug];
  return {
    title: name,
    description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "website",
      siteName: "Elias B.",
      url: `/work/${slug}`,
      title: `${name} · Elias B.`,
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
      title: `${name} · Elias B.`,
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
  if (!isCaseFileSlug(slug)) notFound();
  return <CaseFilePage file={caseFiles[slug]} />;
}
