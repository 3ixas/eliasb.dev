import Image from "next/image";
import type { ReactNode } from "react";
import { Panel } from "@/components/parts/panel";
import { GitHubYear } from "@/components/site/github-year";
import { HistoryBand } from "@/components/site/history-band";
import { hostLabel } from "@/components/site/host-label";
import { isInternalHref, SiteLink } from "@/components/site/site-link";
import { projects } from "@/content/projects";
import { profile } from "@/content/site";
import { filmLine } from "@/content/stretch/film-line";
import { nowMakingEntry, offTheClock as copy } from "@/content/stretch/off-the-clock";
import { asOfDate, pinStatus, type PinStatus } from "@/integrations/pin-rules";
import type { FilmSignal, GitHubSignal, HistorySignal, LatestRepositorySignal, ReadingSignal } from "@/integrations/types";

/*
 * Off the clock's cells (DESIGN.md "The homepage, in order" 7, R-19, R-30, R-34). Each takes its integration's signal as
 * it is, live, saved or fallen back, and is complete in every state, so the panel keeps its three bands. Styles are in
 * off-the-clock.css.
 */

/** Saved data gone stale says so, dated: "From Goodreads, as of 2 Nov", heard with the full date. Live data says nothing. */
function Stale({ source, status }: { source: string; status: PinStatus }) {
  if (status.kind !== "stale") return null;
  return (
    <p className="otc__source">
      <time dateTime={status.asOf.iso}>
        <span aria-hidden="true">{copy.fromAsOf(source, status.asOf.short)}</span>
        <span className="sr-only">{copy.fromAsOf(source, status.asOf.long)}</span>
      </time>
    </p>
  );
}

/** "↗", and what a screen reader hears for a link that opens elsewhere. */
function Out({ href }: { href: string }) {
  return (
    <>
      {" "}
      <span className="arrow arrow--out" aria-hidden="true">
        ↗
      </span>
      <span className="sr-only"> opens {hostLabel(href)} in a new tab</span>
    </>
  );
}

/** A cell for the book or the film: a link out with its cover, or, with nothing to show, its fallback line and no cover. */
function MediaCell({ item, href, cover, title, line, stale }: { item: string; href: string | null; cover: ReactNode; title: string; line: ReactNode; stale?: ReactNode }) {
  const body = (
    <>
      {cover}
      <span className="otc__media-text">
        <h3>{title}</h3>
        <p>
          {line}
          {href && <Out href={href} />}
        </p>
        {stale}
      </span>
    </>
  );
  return (
    <div className="otc__cell" data-otc={item}>
      {href ? (
        <SiteLink href={href} className="otc__media">
          {body}
        </SiteLink>
      ) : (
        <div className="otc__media">{body}</div>
      )}
    </div>
  );
}

/** The book on his currently-reading shelf, linking to Goodreads; between books, "Between books." with no cover. */
export function BookCell({ reading, now }: { reading: ReadingSignal; now: Date }) {
  const { book } = reading;
  const status = pinStatus("reading", reading, now);
  if (!book) return <MediaCell item="reading" href={null} cover={null} title={copy.reading.fallback} line={copy.reading.label} />;
  return (
    <MediaCell
      item="reading"
      href={reading.href}
      cover={book.coverUrl ? <Image className="otc__cover" src={book.coverUrl} alt={copy.reading.coverAlt(book.title, book.author)} width={128} height={192} sizes="64px" /> : null}
      title={book.title}
      line={`${copy.reading.label} · ${book.author}`}
      stale={<Stale source={copy.reading.sourceName} status={status} />}
    />
  );
}

/** The last film in his Letterboxd diary, linking to it; with an empty diary, "Nothing logged yet." with no poster. */
export function FilmCell({ signal, now }: { signal: FilmSignal; now: Date }) {
  const { film } = signal;
  const status = pinStatus("film", signal, now);
  if (!film) return <MediaCell item="film" href={null} cover={null} title={copy.watched.fallback} line={copy.watched.label} />;
  const day = film.watchedOn ? asOfDate(new Date(`${film.watchedOn}T12:00:00Z`)) : null;
  const watched = filmLine(day, film.rating, copy.watched.label);
  return (
    <MediaCell
      item="film"
      href={film.href}
      cover={film.posterUrl ? <Image className="otc__cover" src={film.posterUrl} alt={copy.watched.posterAlt(film.title, film.year)} width={128} height={192} sizes="64px" /> : null}
      title={film.title}
      line={
        watched ? (
          <>
            <span aria-hidden="true">{watched.shown}</span>
            <span className="sr-only">{watched.spoken}</span>
          </>
        ) : (
          copy.watched.label
        )
      }
      stale={<Stale source={copy.watched.sourceName} status={status} />}
    />
  );
}

/** The oddity's date as written: "28 September 1924", or "Born 28 September 1852"; the year alone for the archive. */
function printedDate(event: HistorySignal["events"][number], day: ReturnType<typeof asOfDate> | null) {
  const date = day ? `${day.long} ${event.year}` : String(event.year);
  return event.kind === "birth" ? copy.curiosity.born(date) : date;
}

/** This week in history's band: the live week, or the archive's saved oddities, which say so. */
export function HistoryCell({ history }: { history: HistorySignal }) {
  if (history.events.length === 0) return null;
  const day = history.weekOf ? asOfDate(new Date(`${history.weekOf}T12:00:00Z`)) : null;
  return <HistoryBand events={history.events} dates={history.events.map((event) => printedDate(event, day))} source={day ? undefined : copy.curiosity.fallback} />;
}

/** The GitHub year's band: the total and, under it, Now making, beside the year's grid. Saved data gone stale says so. */
export function GitHubCell({ github, latest, now }: { github: GitHubSignal; latest: LatestRepositorySignal; now: Date }) {
  const status = pinStatus("github", github, now);
  const making = nowMakingEntry(latest.repository, projects);
  const year = status.kind !== "removed" && github.activity.length > 0;
  return (
    <div className="otc__year" data-otc="github" data-state={status.kind === "stale" ? "stale" : "current"}>
      <h3 className="sr-only">{copy.github.heading}</h3>
      {year && <GitHubYear activity={github.activity} total={github.total} />}
      <div className="otc__year-side">
        <Stale source={copy.github.sourceName} status={status} />
        {/* With no year and nothing being made, the band still has something of GitHub's, so the panel keeps its three bands. */}
        {!year && !making && (
          <p>
            <SiteLink href={profile.links.github} className="otc__making">
              {copy.github.sourceName}
              <Out href={profile.links.github} />
            </SiteLink>
          </p>
        )}
        {making && (
          <p data-otc="making">
            <SiteLink href={making.href} className="otc__making">
              <i className="otc__dot" aria-hidden="true" />
              {copy.nowMaking.label} · {making.name}
              {!isInternalHref(making.href) && <Out href={making.href} />}
            </SiteLink>
          </p>
        )}
      </div>
    </div>
  );
}

/** The one paper panel: three cells, then this week in history, then the GitHub year. */
export function OffTheClockPanel({ training, book, film, history, year }: { training: ReactNode; book: ReactNode; film: ReactNode; history: ReactNode; year: ReactNode }) {
  return (
    <Panel className="otc">
      {training}
      {book}
      {film}
      {history}
      {year}
    </Panel>
  );
}
