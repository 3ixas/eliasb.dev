import Image from "next/image";
import type { ReactNode } from "react";
import "@/app/off-the-clock.css";
import { OUT, Panel } from "@/components/parts/panel";
import { packContributionActivity } from "@/components/site/contribution-calendar-model";
import { GitHubYear } from "@/components/site/github-year";
import { HistoryBand, type HistoryBandEvent } from "@/components/site/history-band";
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
        {OUT}
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
        <h4>{title}</h4>
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
      cover={book.coverUrl ? <Image className="otc__cover" src={book.coverUrl} alt={copy.reading.coverAlt(book.title, book.author)} width={128} height={192} sizes="(min-width: 960px) 112px, 88px" /> : null}
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
      cover={film.posterUrl ? <Image className="otc__cover" src={film.posterUrl} alt={copy.watched.posterAlt(film.title, film.year)} width={128} height={192} sizes="(min-width: 960px) 112px, 88px" /> : null}
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
  const events: HistoryBandEvent[] = history.events.map(({ year, text, image }) => ({
    year,
    text,
    ...(image
      ? {
          image: {
            src: image.src,
            alt: image.alt,
            width: image.width,
            height: image.height,
            creator: image.creator,
            licenseName: image.licenseName,
          },
        }
      : {}),
  }));
  return <HistoryBand events={events} dates={history.events.map((event) => printedDate(event, day))} source={day ? undefined : copy.curiosity.fallback} />;
}

/** What I'm building now: a full-width strip above the contribution grid with its heading, live mark, repo link and description. */
function MakingBand({ making, live }: { making: NonNullable<ReturnType<typeof nowMakingEntry>>; live: boolean }) {
  return (
    <div className="otc__making-band" data-otc="making">
      <div className="otc__making-head">
        <h4 className="otc__subtitle">{copy.nowMaking.label}</h4>
        {live && (
          <p className="otc__live">
            <i className="otc__dot" aria-hidden="true" />
            {copy.live(copy.nowMaking.sourceName)}
          </p>
        )}
      </div>
      <div className="otc__making-row">
        <SiteLink href={making.href} className="otc__making">
          {making.name}
          {!isInternalHref(making.href) && <Out href={making.href} />}
        </SiteLink>
        {making.description && <p className="otc__making-line">{making.description}</p>}
      </div>
    </div>
  );
}

/**
 * The GitHub year's nested stone row (R-50): its heading in the left margin column, with What I'm building now as a
 * full-width strip above the contribution grid. Saved data gone stale says so. With no year and nothing being made, the
 * row still has a link to GitHub, so the panel keeps its four rows.
 */
export function GitHubCell({ github, latest, now }: { github: GitHubSignal; latest: LatestRepositorySignal; now: Date }) {
  const status = pinStatus("github", github, now);
  const making = nowMakingEntry(latest.repository, projects);
  const activity = status.kind !== "removed" ? packContributionActivity(github.activity) : null;
  return (
    <div className="otc__year otc__section" data-otc="github" data-state={status.kind === "stale" ? "stale" : "current"}>
      <h3 className="otc__title">{copy.github.heading}</h3>
      <div className="otc__github-body">
        {making && <MakingBand making={making} live={latest.state === "live"} />}
        {activity && <GitHubYear activity={activity} total={github.total} />}
        <Stale source={copy.github.sourceName} status={status} />
        {!activity && !making && (
          <p>
            <SiteLink href={profile.links.github} className="otc__making">
              {copy.github.sourceName}
              <Out href={profile.links.github} />
            </SiteLink>
          </p>
        )}
      </div>
    </div>
  );
}

/** The one paper panel: four nested stone rows — the workout, the shelf and screen, this week in history, and the GitHub year. */
export function OffTheClockPanel({ training, book, film, history, year }: { training: ReactNode; book: ReactNode; film: ReactNode; history: ReactNode; year: ReactNode }) {
  return (
    <Panel className="otc">
      {training}
      <div className="otc__section otc__shelf" data-otc="shelf">
        <h3 className="otc__title">{copy.shelf.title}</h3>
        <div className="otc__shelf-cells">
          {book}
          {film}
        </div>
      </div>
      {history}
      {year}
    </Panel>
  );
}
