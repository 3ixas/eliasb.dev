import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
      <PageHeader active="work" />
      <main id="main-content">
        <header className="work-index-hero">
          <p>Selected work · 2026</p>
          <h1>Three ways of making complex state <em>understandable.</em></h1>
          <span>Product decisions, system behaviour, and the details that help people trust what they see.</span>
        </header>
        <ol className="work-index-list">
          {studies.map((study) => (
            <li key={study.slug} className={`work-index-card work-card-${study.slug}`}>
              <Link href={`/work/${study.slug}`}>
                <span className="work-card-number">{study.index}</span>
                <div className="work-card-copy">
                  <p>{study.kind}</p>
                  <h2>{study.name}</h2>
                  <span>{study.headline}</span>
                </div>
                <Image
                  src={study.hero.src}
                  alt={study.hero.alt}
                  width={study.hero.width}
                  height={study.hero.height}
                  sizes="(max-width: 800px) calc(100vw - 56px), 55vw"
                />
                <span className="work-card-arrow">Read case study ↗</span>
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
