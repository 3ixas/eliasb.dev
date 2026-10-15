import Image from "next/image";
import Link from "next/link";
import { useId, type ReactNode } from "react";
import { TrainingWeek } from "@/components/site/training-week";
import { GitHubYear } from "@/components/site/github-year";
import { nowMakingEntry, offTheClock } from "@/content/stretch/off-the-clock";
import { projects } from "@/content/projects";
import { filmLine } from "@/content/stretch/film-line";
import { getGitHubSignal, getLatestRepositorySignal } from "@/integrations/github";
import { getReadingSignal } from "@/integrations/goodreads";
import { getCachedHistorySignal } from "@/integrations/history-cache";
import { getFilmSignal } from "@/integrations/letterboxd";
import { asOfDate, pinStatus, type PinStatus } from "@/integrations/pin-rules";
import type { FilmSignal, GitHubSignal, HistoryEvent, HistorySignal, LatestRepositorySignal, ReadingSignal } from "@/integrations/types";

const copy = offTheClock;

/** A label that ends in an arrow: the arrow is decoration, so assistive technology skips it. */
function Label({ text }: { text: string }) {
  const arrow = text.match(/ ([↗↓→])$/)?.[1];
  return arrow ? (
    <>
      {text.slice(0, -2)} <span aria-hidden="true">{arrow}</span>
    </>
  ) : (
    text
  );
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="stretch-link stretch-mono" href={href} target="_blank" rel="noreferrer">
      <span>
        <Label text={children} />
      </span>
    </a>
  );
}

/** "as of 12 Sept" on an item whose saved data has gone stale. */
function AsOf({ status }: { status: PinStatus }) {
  if (status.kind !== "stale") return null;
  return (
    <p className="stretch-mono stretch-otc__asof">
      <time dateTime={status.asOf.iso}>
        <span aria-hidden="true">{copy.asOf(status.asOf.short)}</span>
        <span className="sr-only">{copy.asOf(status.asOf.long)}</span>
      </time>
    </p>
  );
}

/** A cover or poster, or a blank print in its place, so the card keeps its shape. */
function Print({ src, alt, sizes }: { src: string | null | undefined; alt: string; sizes: string }) {
  if (!src) return <div className="stretch-otc__print stretch-otc__print--blank" data-print="blank" aria-hidden="true" />;
  return <Image className="stretch-otc__print" src={src} alt={alt} width={240} height={360} sizes={sizes} />;
}

/** This week's training, a poster with today marked, over the running photo. */
export function TrainingPoster({ now }: { now?: string }) {
  const headingId = useId();
  const { photo, week, zone2, photoCaption } = copy.training;
  return (
    <article className="stretch-otc__card stretch-otc__training" data-otc="training" aria-labelledby={headingId}>
      <span className="stretch-fastener stretch-fastener--tape" aria-hidden="true" />
      <figure className="stretch-otc__photo">
        <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 760px) 90vw, 320px" />
        <figcaption className="stretch-mono">{photoCaption}</figcaption>
      </figure>
      <div className="stretch-otc__plan">
        <h3 id={headingId} className="stretch-display stretch-otc__title">
          {week}
        </h3>
        <TrainingWeek now={now} />
        <p className="stretch-mono stretch-otc__note">{zone2}</p>
      </div>
    </article>
  );
}

/** The book on his currently-reading shelf, with its cover. */
export function BookCard({ reading, now }: { reading: ReadingSignal; now: Date }) {
  const headingId = useId();
  const { book } = reading;
  const status = pinStatus("reading", reading, now);
  return (
    <article className="stretch-otc__card stretch-otc__book" data-otc="reading" data-state={status.kind === "stale" ? "stale" : "current"} aria-labelledby={headingId}>
      <span className="stretch-fastener stretch-fastener--pin" aria-hidden="true" />
      <Print src={book?.coverUrl} alt={book ? copy.reading.coverAlt(book.title, book.author) : ""} sizes="(max-width: 760px) 40vw, 200px" />
      <div className="stretch-otc__text">
        <h3 id={headingId} className="stretch-mono stretch-otc__label">
          {copy.reading.label}
        </h3>
        {book ? (
          <>
            <p className="stretch-otc__name">{book.title}</p>
            <p className="stretch-otc__by">{book.author}</p>
            <ExternalLink href={reading.href}>{copy.reading.source}</ExternalLink>
          </>
        ) : (
          <p className="stretch-otc__name">{copy.reading.fallback}</p>
        )}
        <AsOf status={status} />
      </div>
    </article>
  );
}

/** The last film in his Letterboxd diary, as a poster and a ticket. */
export function FilmCard({ film: signal, now }: { film: FilmSignal; now: Date }) {
  const headingId = useId();
  const { film } = signal;
  const status = pinStatus("film", signal, now);
  const line = film ? filmLine(film.watchedOn ? asOfDate(new Date(`${film.watchedOn}T12:00:00Z`)) : null, film.rating) : null;
  return (
    <article className="stretch-otc__card stretch-otc__film" data-otc="film" data-state={status.kind === "stale" ? "stale" : "current"} aria-labelledby={headingId}>
      <span className="stretch-fastener stretch-fastener--tape" aria-hidden="true" />
      <Print src={film?.posterUrl} alt={film ? copy.watched.posterAlt(film.title, film.year) : ""} sizes="(max-width: 760px) 40vw, 200px" />
      <div className="stretch-otc__text">
        <p className="stretch-mono stretch-otc__kicker">{copy.watched.kicker}</p>
        <h3 id={headingId} className="stretch-mono stretch-otc__label">
          {copy.watched.label}
        </h3>
        {film ? (
          <>
            <p className="stretch-otc__name">
              {film.title}
              {film.year && <span className="stretch-otc__year"> {film.year}</span>}
            </p>
            {line && (
              <p className="stretch-mono stretch-otc__by">
                <span aria-hidden="true">{line.shown}</span>
                <span className="sr-only">{line.spoken}</span>
              </p>
            )}
            <ExternalLink href={film.href}>{copy.watched.source}</ExternalLink>
          </>
        ) : (
          <p className="stretch-otc__name">{copy.watched.fallback}</p>
        )}
        <AsOf status={status} />
      </div>
    </article>
  );
}

/** One oddity as the clipping prints it: its picture and credit, the fact, its date and source. */
function Story({ event, day, lead = false }: { event: HistoryEvent; day: ReturnType<typeof asOfDate> | null; lead?: boolean }) {
  const { image } = event;
  const date = day ? `${day.long} ${event.year}` : String(event.year);
  return (
    <article className={lead ? "stretch-story stretch-story--lead" : "stretch-story"}>
      {image && (
        <figure className="stretch-story__figure">
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 760px) 90vw, 440px" />
          <figcaption className="stretch-mono">
            {copy.curiosity.imageCredit}{" "}
            <a href={image.sourceUrl} target="_blank" rel="noreferrer">
              {image.creator}
            </a>{" "}
            ·{" "}
            <a href={image.licenseUrl ?? image.sourceUrl} target="_blank" rel="noreferrer">
              {image.licenseName}
            </a>
          </figcaption>
        </figure>
      )}
      <p className="stretch-story__fact">{event.text}</p>
      <p className="stretch-mono stretch-story__date">{event.kind === "birth" ? copy.curiosity.born(date) : date}</p>
      <ExternalLink href={event.sourceUrl}>{day ? copy.curiosity.source : copy.curiosity.readMore}</ExternalLink>
    </article>
  );
}

/**
 * The Weekly Curiosity: this week's most surprising oddity as a newspaper
 * clipping, the other two behind a disclosure. With no live week it is the
 * archive's saved examples, which say so.
 */
export function ClippingCard({ history }: { history: HistorySignal }) {
  const headingId = useId();
  const [lead, ...more] = history.events;
  const day = history.weekOf ? asOfDate(new Date(`${history.weekOf}T12:00:00Z`)) : null;
  return (
    <article className="stretch-otc__card stretch-otc__clipping" data-otc="clipping" data-state={day ? "live" : "archive"} aria-labelledby={headingId}>
      <span className="stretch-fastener stretch-fastener--pin" aria-hidden="true" />
      <h3 id={headingId} className="stretch-mono stretch-otc__label">
        {copy.curiosity.label}
      </h3>
      <p className="stretch-mono stretch-otc__kicker">{day ? day.long : copy.curiosity.fallback}</p>
      {lead && <Story event={lead} day={day} lead />}
      {more.length > 0 && (
        <details className="stretch-more">
          <summary className="stretch-mono">
            <span>
              <Label text={copy.curiosity.more(more.length)} />
            </span>
          </summary>
          {more.map((event) => (
            <Story key={`${event.year}-${event.kind}-${event.text}`} event={event} day={day} />
          ))}
        </details>
      )}
    </article>
  );
}

/**
 * What I'm making now: my latest public repository, with a pulsing cobalt
 * mark. A project of mine shows its name (linked to its case study when it has
 * one); any other repository shows GitHub's name and description. With no
 * repository to show, the card comes down.
 */
export function NowMakingCard({ latest }: { latest: LatestRepositorySignal }) {
  const headingId = useId();
  const entry = nowMakingEntry(latest.repository, projects);
  if (!entry) return null;
  const making = copy.nowMaking;
  return (
    <article className="stretch-otc__card stretch-otc__making" data-otc="making" aria-labelledby={headingId}>
      <span className="stretch-fastener stretch-fastener--pin" aria-hidden="true" />
      <h3 id={headingId} className="stretch-mono stretch-otc__label">
        <span className="stretch-now" data-now-mark aria-hidden="true" />
        {making.label}
      </h3>
      <p className="stretch-otc__name">
        {entry.internal ? (
          <Link className="stretch-link" href={entry.href}>
            {entry.name}
          </Link>
        ) : (
          entry.name
        )}
      </p>
      {entry.description && <p className="stretch-otc__by">{entry.description}</p>}
      {!entry.internal && <ExternalLink href={entry.href}>{making.link}</ExternalLink>}
    </article>
  );
}

/** My GitHub year as a grid of squares. Gone when there is no full year to show. */
export function GitHubCard({ github, now }: { github: GitHubSignal; now: Date }) {
  const headingId = useId();
  const status = pinStatus("github", github, now);
  if (status.kind === "removed" || github.activity.length === 0) return null;
  return (
    <article className="stretch-otc__card stretch-otc__github" data-otc="github" data-state={status.kind === "stale" ? "stale" : "current"} aria-labelledby={headingId}>
      <span className="stretch-fastener stretch-fastener--tape" aria-hidden="true" />
      <h3 id={headingId} className="sr-only">
        {copy.github.heading}
      </h3>
      <GitHubYear activity={github.activity} total={github.total} />
      <AsOf status={status} />
    </article>
  );
}

/** The six items, in independent columns. `todayAt` fixes the training week's "now" for the fixtures route. */
export function OffTheClockItems({
  history,
  reading,
  film,
  latest,
  github,
  now,
  todayAt,
}: {
  history: HistorySignal;
  reading: ReadingSignal;
  film: FilmSignal;
  latest: LatestRepositorySignal;
  github: GitHubSignal;
  now: Date;
  todayAt?: string;
}): ReactNode {
  return (
    <div className="stretch-otc">
      <div className="stretch-otc__column">
        <TrainingPoster now={todayAt} />
        <div className="stretch-otc__media">
          <BookCard reading={reading} now={now} />
          <FilmCard film={film} now={now} />
        </div>
      </div>
      <div className="stretch-otc__column">
        <ClippingCard history={history} />
        <NowMakingCard latest={latest} />
      </div>
      <GitHubCard github={github} now={now} />
    </div>
  );
}

/** The live version: reads the signals, each of which falls back to written copy. */
export async function OffTheClock() {
  const now = new Date();
  const [history, reading, film, latest, github] = await Promise.all([
    getCachedHistorySignal(),
    getReadingSignal(),
    getFilmSignal(),
    getLatestRepositorySignal(),
    getGitHubSignal(),
  ]);
  return <OffTheClockItems history={history} reading={reading} film={film} latest={latest} github={github} now={now} />;
}
