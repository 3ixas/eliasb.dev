import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { labItems } from "@/content/collections";

export const metadata: Metadata = {
  title: "Lab",
  description: "Experiments, works in progress, and interface studies by Elias Bennett.",
};

export default function LabPage() {
  return (
    <div className="collection-page lab-page">
      <PageHeader active="lab" />
      <main id="main-content">
        <header className="collection-hero lab-hero">
          <p>Lab · Experiments and useful mistakes</p>
          <h1>Things I’m making before I know <em>exactly</em> what they are.</h1>
          <span>
            Small tools, interface studies, data experiments, and unfinished ideas. Some become products. The useful ones always leave a note.
          </span>
        </header>

        <section className="lab-board" aria-label="Lab projects">
          {labItems.map((item) => (
            <article id={`lab-${item.index}`} key={item.index} className={`lab-specimen specimen-${item.treatment}`}>
              <div className="specimen-meta">
                <span>{item.index}</span>
                <span>{item.status}</span>
              </div>
              <div className="specimen-object">
                <Image src={item.image} alt={item.imageAlt} fill sizes="(max-width: 800px) min(82vw, 330px), 33vw" />
                <span>{item.title}</span>
              </div>
              <div className="specimen-copy">
                <p>{item.kind}</p>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <span>{item.note}</span>
                {(item.liveUrl || item.codeUrl) && (
                  <div className="specimen-links">
                    {item.liveUrl && <a href={item.liveUrl} target="_blank" rel="noreferrer">Open experiment <span className="arrow-mark" aria-hidden="true">↗︎</span></a>}
                    {item.codeUrl && <a href={item.codeUrl} target="_blank" rel="noreferrer">Source <span className="arrow-mark" aria-hidden="true">↗︎</span></a>}
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        <aside className="lab-principle">
          <p>Lab rule / 01</p>
          <blockquote>Show the rough edges when they explain what changed.</blockquote>
          <Link href="/work">Finished work lives this way →</Link>
        </aside>
      </main>
    </div>
  );
}
