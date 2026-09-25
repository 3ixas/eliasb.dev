import type { Metadata } from "next";
import { WorkArchiveCard } from "@/components/site/featured-work";
import { PageHeader } from "@/components/site/page-header";
import { caseStudies } from "@/content/case-studies";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected product and systems case studies by Elias Bennett.",
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    siteName: "Elias B.",
    url: "/work",
    title: "Work · Elias B.",
    description: "Selected product and systems case studies by Elias Bennett.",
    images: [{
      url: "/work/threshold/landing.webp",
      width: 2294,
      height: 1750,
      alt: "Threshold landing page introducing the real cost of moving out",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work · Elias B.",
    description: "Selected product and systems case studies by Elias Bennett.",
    images: [{
      url: "/work/threshold/landing.webp",
      alt: "Threshold landing page introducing the real cost of moving out",
    }],
  },
};

export default function WorkPage() {
  const studies = Object.values(caseStudies);

  return (
    <div className="work-index-page">
      <PageHeader />
      <main id="main-content" tabIndex={-1}>
        <header className="work-index-hero">
          <p>{studies.length} case studies</p>
          <h1>A closer look at how I built these projects.</h1>
          <span>What I set out to solve, the choices I made, and what I learned along the way.</span>
        </header>
        <ol className="work-index-list">
          {studies.map((study) => <WorkArchiveCard key={study.slug} study={study} />)}
        </ol>
      </main>
    </div>
  );
}
