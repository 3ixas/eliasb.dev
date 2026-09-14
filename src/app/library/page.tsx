import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { libraryObjects } from "@/content/collections";

export const metadata: Metadata = {
  title: "Library",
  description: "Books, cinema, history, science fiction, and music kept within reach by Elias Bennett.",
};

export default function LibraryPage() {
  return (
    <div className="collection-page library-page">
      <PageHeader active="library" />
      <main>
        <header className="collection-hero library-hero">
          <p>Library · Culture and curiosities</p>
          <h1>A shelf for ideas I want to keep <em>within reach.</em></h1>
          <span>
            Books, films, history, science fiction, and music—kept as a collection of objects and notes rather than an endless feed.
          </span>
        </header>

        <section className="library-room" aria-labelledby="first-shelf">
          <div className="library-room-heading">
            <p>First shelf · awaiting selections</p>
            <h2 id="first-shelf">Three spaces, deliberately left open.</h2>
            <span>Open an object to see how live and authored material will meet.</span>
          </div>
          <div className="library-objects">
            {libraryObjects.map((object) => (
              <details key={object.number} className={`library-object ${object.className}`}>
                <summary>
                  <span>{object.kind}</span>
                  <strong>{object.title}</strong>
                  <i>{object.number}</i>
                </summary>
                <div>
                  <p>{object.status}</p>
                  <h3>{object.title}</h3>
                  <span>{object.description}</span>
                  <small>Close object ↑</small>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="library-index" aria-labelledby="library-index-title">
          <p>Other drawers</p>
          <h2 id="library-index-title">History and science fiction will run through the whole room.</h2>
          <div>
            <article><span>H</span><h3>History</h3><p>People, systems, turning points, and the strange persistence of old decisions.</p></article>
            <article><span>SF</span><h3>Science fiction</h3><p>Possible worlds as a way to examine technology, power, society, and what remains human.</p></article>
          </div>
        </section>
      </main>
    </div>
  );
}
