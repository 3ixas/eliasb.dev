import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/site/page-header";
import { integrationConfig } from "@/content/integration-config";
import { getReadingSignal } from "@/integrations/goodreads";
import { getCultureSignal } from "@/integrations/letterboxd";

export const metadata: Metadata = {
  title: "Library",
  description: "Books, cinema, history, science fiction, and music kept within reach by Elias Bennett.",
};

export default async function LibraryPage() {
  const [reading, culture] = await Promise.all([getReadingSignal(), getCultureSignal()]);

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
            <p>First shelf · live and authored</p>
            <h2 id="first-shelf">Three objects that change with me.</h2>
            <span>Open each object for the latest public signal and its source.</span>
          </div>
          <div className="library-objects">
            <details className="library-object library-object-book">
              <summary>
                <span>Reading · {reading.statusLabel}</span>
                {reading.coverUrl && <Image src={reading.coverUrl} alt="" width={180} height={270} />}
                <strong>{reading.headline}</strong>
                <i>001</i>
              </summary>
              <div>
                <p>Currently reading</p>
                <h3>{reading.headline}</h3>
                <span>{reading.author ? `By ${reading.author}. ` : ""}The live shelf supplies the book; my own notes will give it a place in this room.</span>
                {reading.href && <a href={reading.href} target="_blank" rel="noreferrer">View on Goodreads ↗</a>}
                <small>Close object ↑</small>
              </div>
            </details>
            <details className="library-object library-object-poster">
              <summary>
                <span>Cinema · latest diary entry</span>
                {culture.filmPosterUrl && <Image src={culture.filmPosterUrl} alt="" fill sizes="(max-width: 800px) 88vw, 30vw" />}
                <strong>{culture.filmTitle ?? culture.headline}</strong>
                <i>002</i>
              </summary>
              <div>
                <p>Recently watched</p>
                <h3>{culture.filmTitle ?? culture.headline}</h3>
                <span>{culture.filmYear}{culture.filmRating ? ` · ${culture.filmRating} out of 5` : ""}</span>
                {culture.filmHref && <a href={culture.filmHref} target="_blank" rel="noreferrer">View on Letterboxd ↗</a>}
                <small>Close object ↑</small>
              </div>
            </details>
            <details className="library-object library-object-record">
              <summary>
                <span>Music · manually kept</span>
                <strong>The current rotation</strong>
                <i>003</i>
              </summary>
              <div>
                <p>Currently listening</p>
                <h3>The current rotation</h3>
                <span>A public playlist I update in Spotify when the mood changes.</span>
                <a href={integrationConfig.spotify.playlistUrl} target="_blank" rel="noreferrer">Open in Spotify ↗</a>
                <small>Close object ↑</small>
              </div>
            </details>
          </div>
        </section>

        <section className="playlist-room" aria-labelledby="playlist-title">
          <div>
            <p>Now playing · Spotify</p>
            <h2 id="playlist-title">A playlist with the aux cable.</h2>
            <span>Kept by hand, played through Spotify, and allowed to change without turning the Library into a dashboard.</span>
          </div>
          <iframe
            title="Elias’s currently listening Spotify playlist"
            src={`https://open.spotify.com/embed/playlist/${integrationConfig.spotify.playlistId}?utm_source=generator&theme=0`}
            width="100%"
            height="352"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
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
