import type { Metadata } from "next";
import { WorkArchiveCard } from "@/components/site/featured-work";
import { PageHeader } from "@/components/site/page-header";
import { caseStudies } from "@/content/case-studies";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected product and systems case studies by Elias Bennett.",
};

export default function WorkPage() {
  const studies = Object.values(caseStudies);

  return (
    <div className="work-index-page">
      <PageHeader />
      <main id="main-content">
        <header className="work-index-hero">
          <p>Work archive · {studies.length} case studies</p>
          <h1>A growing collection of complex state made <em>understandable.</em></h1>
          <span>Product decisions, system behaviour, and the details that help people trust what they see.</span>
        </header>
        <ol className="work-index-list">
          {studies.map((study) => <WorkArchiveCard key={study.slug} study={study} />)}
        </ol>
      </main>
    </div>
  );
}
