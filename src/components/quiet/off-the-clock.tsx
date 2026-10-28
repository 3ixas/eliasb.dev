import Image from "next/image";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { CalendarTile } from "@/components/quiet/calendar-tile";
import { ClippingLook } from "@/components/quiet/clipping";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { CycleScope } from "@/components/quiet/cycle";
import { Row } from "@/components/quiet/row";
import { TrainingLine, TrainingLook, TrainingTile, TrainingTitle } from "@/components/quiet/training";
import { TypedQuote } from "@/components/quiet/typed-quote";
import { GitHubYear } from "@/components/site/github-year";
import { SourceMark } from "@/components/site/now-mark";
import { projects } from "@/content/projects";
import { filmLine } from "@/content/stretch/film-line";
import { nowMakingEntry, offTheClock as copy } from "@/content/stretch/off-the-clock";
import { asOfDate, pinStatus, type PinStatus } from "@/integrations/pin-rules";
import type { FilmSignal, GitHubSignal, HistorySignal, LatestRepositorySignal, ReadingSignal, SignalState } from "@/integrations/types";

/** A row with its closer look: the id they share, the `Row` for the list and what the margin and the inline slot show. */
export type Entry = { id: string; row: ReactNode; look: ReactNode };

/** The parts of a row's line, joined by dots that stay with the part before them (bind-dots.ts). */
function joined(parts: (ReactNode | false | null | undefined)[]) {
  return parts
    .filter(Boolean)
    .map((part, index) => (
      <Fragment key={index}>
        {index > 0 && "\u00a0· "}
        {part}
      </Fragment>
    ));
}

/** The data attributes a source row carries: which item it is, and whether its saved data has gone stale. */
const sourceAttrs = (item: string, status: PinStatus) => ({ "data-otc": item, "data-state": status.kind === "stale" ? "stale" : "current" });

/** What a source row says about its data: live (with the pulsing dot), saved data gone stale and dated, or nothing. */
function sourceMark(name: string, state: SignalState, status?: PinStatus): { shown: ReactNode; spoken: string } | null {
  if (status?.kind === "stale") {
    return {
      spoken: copy.fromAsOf(name, status.asOf.long),
      shown: (
        <SourceMark live={false}>
          <time dateTime={status.asOf.iso}>
            <span aria-hidden="true">{copy.fromAsOf(name, status.asOf.short)}</span>
            <span className="sr-only">{copy.fromAsOf(name, status.asOf.long)}</span>
          </time>
        </SourceMark>
      ),
    };
  }
  return state === "live" ? { spoken: copy.live(name), shown: <SourceMark live>{copy.live(name)}</SourceMark> } : null;
}

/** A cover or poster at 44 px: the real print with a spine crease and shadow, or a blank one in its place. */
function Cover({ src }: { src: string | null | undefined }) {
  return (
    <span className="qi-cover" data-blank={src ? undefined : ""}>
      {src && <Image src={src} alt="" width={60} height={88} sizes="30px" />}
    </span>
  );
}

const week = copy.training.days.map((day) => `${day.long}: ${day.session}.`).join(" ");

/** Today's training: a calendar tile, today's session, and the week as its closer look. `now` fixes the moment for the fixtures route. */
export function trainingEntry(now?: string): Entry {
  const id = "training";
  return {
    id,
    look: <TrainingLook now={now} />,
    row: (
      <Row
        key={id}
        attrs={{ "data-otc": id }}
        object={<TrainingTile now={now} />}
        title={<TrainingTitle now={now} />}
        line={<TrainingLine now={now} />}
        look={{ id, description: `${week} ${copy.training.photoCaption}` }}
      />
    ),
  };
}

/** Spines the cover lifts out from: authored colours and heights, so the shelf is the same on every visit. */
const spines = [
  { color: "#3c3a44", height: 128 },
  { color: "#8a6f4d", height: 112 },
  { color: "#2d4a5c", height: 138 },
  { color: "#5c2f2f", height: 120, after: true },
  { color: "#b8b0a0", height: 104, after: true },
  { color: "#3a5040", height: 132, after: true },
];

function Spine({ color, height }: { color: string; height: number }) {
  return <span className="qi-spine" style={{ "--c": color, "--h": `${height}px` } as CSSProperties} />;
}

/** The book's closer look: its cover lifting off a row of spines, turning to face you, then its title and author. */
function BookLook({ title, author, cover }: { title: string; author: string; cover: string | null | undefined }) {
  return (
    <div className="qi-book">
      <div className="qi-shelf">
        {spines.filter(({ after }) => !after).map((spine) => (
          <Spine key={spine.color} {...spine} />
        ))}
        <span className="qi-pluck">
          <span className="qi-pluck__cover" data-blank={cover ? undefined : ""}>
            {cover && <Image src={cover} alt="" width={240} height={360} sizes="84px" />}
          </span>
        </span>
        {spines.filter(({ after }) => after).map((spine) => (
          <Spine key={spine.color} {...spine} />
        ))}
      </div>
      <p className="qi-look__name">{title}</p>
      <p className="qi-look__by">{author}</p>
    </div>
  );
}

/** The book on his currently-reading shelf. Between books it is a plain row with a blank cover. */
export function bookEntry(reading: ReadingSignal, now: Date): Entry {
  const id = "book";
  const { book } = reading;
  const status = pinStatus("reading", reading, now);
  const mark = book ? sourceMark(copy.reading.sourceName, reading.state, status) : null;
  const attrs = sourceAttrs("reading", status);
  if (!book) {
    return { id, look: null, row: <Row key={id} attrs={attrs} object={<Cover src={null} />} title={copy.reading.fallback} line={copy.reading.label} /> };
  }
  return {
    id,
    look: <BookLook title={book.title} author={book.author} cover={book.coverUrl} />,
    row: (
      <Row
        key={id}
        attrs={attrs}
        href={reading.href}
        object={<Cover src={book.coverUrl} />}
        title={book.title}
        line={joined([copy.reading.label, book.author, mark?.shown])}
        look={{ id, description: copy.reading.coverAlt(book.title, book.author) }}
      />
    ),
  };
}

/** The film's closer look: a cream ticket with the poster, the stars filling in one by one and the stub tearing off. */
function FilmLook({ film, watched }: { film: NonNullable<FilmSignal["film"]>; watched: string | undefined }) {
  const full = film.rating ? Math.floor(film.rating) : 0;
  const half = film.rating ? film.rating % 1 !== 0 : false;
  return (
    <div className="qi-ticket">
      {film.posterUrl && <Image className="qi-ticket__poster" src={film.posterUrl} alt="" width={240} height={360} sizes="72px" />}
      <div className="qi-ticket__text">
        <p className="qi-look__name">{film.title}</p>
        <p className="qi-look__by stretch-mono">{[film.year, watched].filter(Boolean).join(" · ")}</p>
        {film.rating && (
          <p className="qi-stars">
            {Array.from({ length: full + (half ? 1 : 0) }, (_, index) => (
              <span key={index} style={{ "--i": index } as CSSProperties}>
                {index < full ? "★" : "½"}
              </span>
            ))}
          </p>
        )}
      </div>
      <span className="qi-ticket__stub stretch-mono">{copy.watched.kicker}</span>
    </div>
  );
}

/** The last film in his Letterboxd diary. With an empty diary it is a plain row with a blank poster. */
export function filmEntry(signal: FilmSignal, now: Date): Entry {
  const id = "film";
  const { film } = signal;
  const status = pinStatus("film", signal, now);
  const attrs = sourceAttrs("film", status);
  if (!film) {
    return { id, look: null, row: <Row key={id} attrs={attrs} object={<Cover src={null} />} title={copy.watched.fallback} line={copy.watched.label} /> };
  }
  const day = film.watchedOn ? asOfDate(new Date(`${film.watchedOn}T12:00:00Z`)) : null;
  const row = filmLine(day, film.rating, copy.watched.label);
  const mark = sourceMark(copy.watched.sourceName, signal.state, status);
  return {
    id,
    look: <FilmLook film={film} watched={day ? `Watched ${day.short}` : undefined} />,
    row: (
      <Row
        key={id}
        attrs={attrs}
        href={film.href}
        object={<Cover src={film.posterUrl} />}
        title={film.title}
        line={joined([
          row ? (
            <Fragment key="line">
              <span aria-hidden="true">{row.shown}</span>
              <span className="sr-only">{row.spoken}</span>
            </Fragment>
          ) : (
            copy.watched.label
          ),
          mark?.shown,
        ])}
        look={{ id, description: `${copy.watched.kicker}. ${copy.watched.posterAlt(film.title, film.year)}` }}
      />
    ),
  };
}

/** Now making's object: code brackets with a cobalt slash, drawn to read at 44 px. The live dot stays for "Live from GitHub" beside it. */
function Brackets() {
  return (
    <svg className="qi-brackets" viewBox="0 0 44 44" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="qi-brackets__angle" d="M14 15 L7 22 L14 29" />
      <path className="qi-brackets__angle" d="M30 15 L37 22 L30 29" />
      <path className="qi-brackets__slash" d="M25 12 L19 32" />
    </svg>
  );
}

/** Now making's closer look: the repository's description typing itself. */
function MakingLook({ name, description }: { name: string; description: string }) {
  return (
    <div className="qi-making">
      <p className="qi-look__name">{name}</p>
      <p className="qi-look__by">
        <TypedQuote text={description} />
      </p>
    </div>
  );
}

/**
 * What I'm making now: my latest public repository. A project of mine shows its name (linked to its case study
 * when it has one); any other repository shows GitHub's name and description, the description typing itself in
 * the closer look. With no repository to show there is no row.
 */
export function makingEntry(latest: LatestRepositorySignal): Entry | null {
  const entry = nowMakingEntry(latest.repository, projects);
  if (!entry) return null;
  const id = "making";
  const mark = sourceMark(copy.nowMaking.sourceName, latest.state);
  return {
    id,
    look: entry.description ? <MakingLook name={entry.name} description={entry.description} /> : null,
    row: (
      <Row
        key={id}
        attrs={{ "data-otc": id }}
        href={entry.href}
        object={<Brackets />}
        title={entry.name}
        line={joined([copy.nowMaking.label, mark?.shown])}
        look={entry.description ? { id, description: entry.description } : undefined}
      />
    ),
  };
}

/** The oddity's date as the clipping prints it: "28 September 1924", or "Born 28 September 1852"; the year alone for the archive. */
function printedDate(event: HistorySignal["events"][number], day: ReturnType<typeof asOfDate> | null) {
  const date = day ? `${day.long} ${event.year}` : String(event.year);
  return event.kind === "birth" ? copy.curiosity.born(date) : date;
}

/**
 * This week in history: the row cycles through the week's oddities when clicked, and its closer look is the
 * clipping for the one it is on (cycle.tsx). With one oddity it is a plain row with the one clipping. Without a
 * live week it is the archive's saved examples, which say so. With none it is gone.
 */
export function historyEntry(history: HistorySignal): Entry | null {
  const { events } = history;
  if (events.length === 0) return null;
  const id = "history";
  const day = history.weekOf ? asOfDate(new Date(`${history.weekOf}T12:00:00Z`)) : null;
  const dates = events.map((event) => printedDate(event, day));
  const steps = events.map((event, index) => `${copy.curiosity.count(index + 1, events.length)}. ${dates[index]}. ${event.text}`);
  const mark = sourceMark(copy.curiosity.sourceName, history.state);
  const attrs = { "data-otc": id, "data-state": day ? "live" : "archive" };
  const line = !day ? copy.curiosity.fallback : events.length > 1 ? copy.curiosity.rowLine(events.length) : day.long;
  return {
    id,
    look: <ClippingLook id={id} events={events} dates={dates} />,
    row: (
      <Row
        key={id}
        attrs={attrs}
        object={<CalendarTile number={history.weekOf ? String(Number(history.weekOf.slice(8))) : ""} />}
        title={copy.curiosity.label}
        line={joined([line, mark?.shown])}
        look={{ id, description: steps.join(" "), cycle: events.length > 1 ? steps : undefined }}
      />
    ),
  };
}

/**
 * My GitHub year (docs/design/DESIGN.md, one of the three things that are not rows). It sits in the list as an
 * item of its own, with no closer look. Saved data gone stale says so; a year with nothing to show is gone.
 */
export function githubEntry(github: GitHubSignal, now: Date): Entry | null {
  const id = "github";
  const status = pinStatus("github", github, now);
  if (status.kind === "removed" || github.activity.length === 0) return null;
  const mark = sourceMark(copy.github.sourceName, github.state, status);
  return {
    id,
    look: null,
    row: (
      <li key={id} className="qi-list__item qi-github" {...sourceAttrs(id, status)}>
        <h3 className="sr-only">{copy.github.heading}</h3>
        <GitHubYear activity={github.activity} total={github.total} mark={mark?.shown} />
      </li>
    ),
  };
}

/**
 * The list of Off the clock rows (GLOSSARY.md, Row) with the controller that shows their closer looks. `children`
 * are the section's heading and note, inside the controller's column like Work's.
 */
export function OffTheClockList({ entries, children }: { entries: (Entry | null)[]; children?: ReactNode }) {
  const shown = entries.filter((entry) => entry !== null);
  const looks = Object.fromEntries(shown.filter(({ look }) => look).map(({ id, look }) => [id, look]));
  return (
    <CycleScope>
      <CloserLookRoot looks={looks} className="qi-column">
        {children}
        <ul className="qi-list" data-off-the-clock="">
          {shown.map(({ row }) => row)}
        </ul>
      </CloserLookRoot>
    </CycleScope>
  );
}
