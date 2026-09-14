import type { Metadata } from "next";
import Image from "next/image";
import { ClosableDetails } from "@/components/site/closable-details";
import { PageHeader } from "@/components/site/page-header";
import { integrationConfig } from "@/content/integration-config";
import { getReadingSignal } from "@/integrations/goodreads";
import { getCultureSignal } from "@/integrations/letterboxd";
import { getHistorySignal } from "@/integrations/history";

export const metadata: Metadata = {
  title: "Library",
  description: "Books, cinema, history, science fiction, and music kept within reach by Elias Bennett.",
};

function freshnessLabel(updatedAt: string | null) {
  if (!updatedAt) return "Stable fallback";
  return `Updated ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(updatedAt))}`;
}

export default async function LibraryPage() {
  const [reading, culture, history] = await Promise.all([
    getReadingSignal(),
    getCultureSignal(),
    getHistorySignal(),
  ]);

  return (
    <div className="collection-page library-page">
      <PageHeader active="library" />
      <main id="main-content">
        <header className="collection-hero library-hero">
          <p>Library · Culture and curiosities</p>
          <h1>A shelf for ideas I want to keep <em>within reach.</em></h1>
          <span>
            Books, films, history, science fiction, and music I’m spending time with.
          </span>
        </header>

        <section className="library-room" aria-labelledby="first-shelf">
          <div className="library-room-heading">
            <p>First shelf · live and personal</p>
            <h2 id="first-shelf">A few things I’m reading and watching.</h2>
            <span>Open an object for a little more detail and its source.</span>
          </div>
          <div className="library-objects">
            <ClosableDetails
              className="library-object library-object-book"
              summary={(
                <>
                <span>Reading · {reading.statusLabel}</span>
                {reading.coverUrl && <Image src={reading.coverUrl} alt="" width={180} height={270} sizes="180px" />}
                <strong>{reading.headline}</strong>
                <i>001</i>
                </>
              )}
            >
                <p>Currently reading</p>
                <h3>{reading.headline}</h3>
                <span>{reading.bookDescription ?? `${reading.author ? `By ${reading.author}. ` : ""}A book I’m currently reading; notes will follow.`}</span>
                <small className="library-freshness">{freshnessLabel(reading.updatedAt)}</small>
                {reading.href && <a href={reading.href} target="_blank" rel="noreferrer">View on Goodreads <span className="arrow-mark" aria-hidden="true">↗︎</span></a>}
            </ClosableDetails>
            <ClosableDetails
              className="library-object library-object-poster"
              summary={(
                <>
                <span>Cinema · latest diary entry</span>
                {culture.filmPosterUrl && <Image src={culture.filmPosterUrl} alt="" fill sizes="(max-width: 800px) 88vw, 30vw" />}
                <strong>{culture.filmTitle ?? culture.headline}</strong>
                <i>002</i>
                </>
              )}
            >
                <p>Recently watched</p>
                <h3>{culture.filmTitle ?? culture.headline}</h3>
                <span>{culture.filmDescription ?? "The latest film in my diary. I keep the rating and notes on Letterboxd."}</span>
                <span>{culture.filmYear}{culture.filmRating ? ` · ${culture.filmRating} out of 5` : ""}</span>
                <small className="library-freshness">{freshnessLabel(culture.updatedAt)}</small>
                {culture.filmHref && <a href={culture.filmHref} target="_blank" rel="noreferrer">View on Letterboxd <span className="arrow-mark" aria-hidden="true">↗︎</span></a>}
            </ClosableDetails>
          </div>
        </section>

        <section className="playlist-room" aria-labelledby="playlist-title">
          <div>
            <p>Now playing · Spotify</p>
            <h2 id="playlist-title">Some tunes I’m listening to.</h2>
            <span>A playlist I update when I find something I want to keep playing.</span>
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
          <p>History · a small weekly note</p>
          <h2 id="library-index-title">A few things that happened this week.</h2>
          <div>
            <article className="history-card">
              <span>{history.dateLabel}</span>
              <h3>{history.headline}</h3>
              <div className="history-events">
                {history.events.map((event) => (
                  <p key={`${event.year}-${event.text}`}>
                    <strong>{event.year}</strong> {event.text}
                    <a href={event.sourceUrl} target="_blank" rel="noreferrer">Source <span className="arrow-mark" aria-hidden="true">↗︎</span></a>
                  </p>
                ))}
              </div>
              <small>{history.description}</small>
              <a className="history-source" href={history.sourceUrl} target="_blank" rel="noreferrer">
                {history.statusLabel} <span className="arrow-mark" aria-hidden="true">↗︎</span>
              </a>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
