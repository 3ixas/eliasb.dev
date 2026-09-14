import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import type { CaseStudy } from "@/content/case-studies";

export function CaseStudyPage({ study }: { study: CaseStudy }) {
  return (
    <div className={`case-study case-${study.slug}`}>
      <PageHeader />
      <main>
        <header className="case-hero">
          <div className="case-crumbs">
            <Link href="/work">← All work</Link>
            <span>{study.index} / 03</span>
          </div>
          <p className="case-kind">{study.kind} · {study.year}</p>
          <h1>{study.headline}</h1>
          <div className="case-intro">
            <p>{study.summary}</p>
            <dl>
              <div><dt>Project</dt><dd>{study.name}</dd></div>
              <div><dt>Role</dt><dd>{study.role}</dd></div>
              <div><dt>Stack</dt><dd>{study.stack.join(" · ")}</dd></div>
            </dl>
          </div>
          <div className="case-actions">
            {study.liveUrl && <a href={study.liveUrl} target="_blank" rel="noreferrer">Open project ↗</a>}
            <a href={study.codeUrl} target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </header>

        <figure className="case-hero-image">
          <Image
            src={study.hero.src}
            alt={study.hero.alt}
            width={study.hero.width}
            height={study.hero.height}
            priority
          />
          <figcaption>{study.name} · {study.kind}</figcaption>
        </figure>

        <dl className="case-facts">
          {study.facts.map((fact) => (
            <div key={fact.label}><dt>{fact.value}</dt><dd>{fact.label}</dd></div>
          ))}
        </dl>

        <div className="case-chapters">
          {study.chapters.map((chapter, index) => (
            <section key={chapter.title} className="case-chapter">
              <div className="chapter-heading">
                <p>{chapter.eyebrow}</p>
                <h2>{chapter.title}</h2>
              </div>
              <div className="chapter-body">
                {chapter.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {chapter.notes && (
                  <ul aria-label={`Key ideas in ${chapter.title}`}>
                    {chapter.notes.map((note) => <li key={note}>{note}</li>)}
                  </ul>
                )}
              </div>
              {study.gallery[index] && (
                <figure className="chapter-image">
                  <Image
                    src={study.gallery[index].src}
                    alt={study.gallery[index].alt}
                    width={study.gallery[index].width}
                    height={study.gallery[index].height}
                  />
                </figure>
              )}
            </section>
          ))}
        </div>

        <section className="case-takeaway" aria-labelledby="takeaway-title">
          <p>What stayed with me</p>
          <h2 id="takeaway-title">{study.takeaway}</h2>
        </section>

        <nav className="case-next" aria-label="More case studies">
          <Link href="/work">See all work <span>↗</span></Link>
          <Link href="/#contact">Start a conversation <span>↗</span></Link>
        </nav>
      </main>
    </div>
  );
}
