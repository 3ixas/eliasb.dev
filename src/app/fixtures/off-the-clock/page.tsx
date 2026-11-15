import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { BookCell, FilmCell, GitHubCell, HistoryCell, OffTheClockPanel } from "@/components/site/off-the-clock-cells";
import { TrainingCell } from "@/components/site/training-today";
import { savedHistorySignal } from "@/integrations/history";
import type { ActivityDay, Book, Film, FilmSignal, GitHubSignal, HistorySignal, LatestRepositorySignal, ReadingSignal } from "@/integrations/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// A fixed "now" and fixture feeds, so each state renders the same every run.
const now = new Date("2026-10-02T12:00:00.000Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

const book: Book = {
  title: "Dark Age",
  author: "Pierce Brown",
  startedAt: "2026-09-14T10:52:45.000Z",
  coverUrl: "/projects/threshold.webp",
};
const film: Film = {
  title: "The Invite",
  year: "2026",
  rating: 4.5,
  watchedOn: "2026-09-14",
  posterUrl: "/profile/elias-evening.webp",
  href: "https://letterboxd.com/3lxas/film/the-invite/",
};
const reading = (overrides: Partial<ReadingSignal>): ReadingSignal => ({
  state: "live",
  book,
  href: "https://www.goodreads.com/user/show/171686303-elias-bennett",
  updatedAt: daysAgo(1),
  ...overrides,
});
const diary = (overrides: Partial<FilmSignal>): FilmSignal => ({
  state: "live",
  film,
  href: "https://letterboxd.com/3lxas/",
  updatedAt: daysAgo(1),
  ...overrides,
});

// A year of activity ending on the fixed "now": busy in mid-July, quiet on Sundays.
const year: ActivityDay[] = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(now.getTime() - (364 - index) * 86_400_000);
  const month = date.getUTCMonth();
  const base = month === 6 ? 6 : (date.getUTCDate() * 7 + month * 3) % 5;
  return { date: date.toISOString().slice(0, 10), count: date.getUTCDay() === 0 ? 0 : base };
});
const github = (overrides: Partial<GitHubSignal>): GitHubSignal => ({
  state: "live",
  activity: year,
  total: year.reduce((sum, day) => sum + day.count, 0),
  updatedAt: daysAgo(0),
  href: "https://github.com/3ixas",
  ...overrides,
});
const pushedAt = "2026-09-20T09:00:00.000Z";
// A repository that is not one of my projects, a project with a case study, and one without.
const repository = { name: "eliasb.dev", description: "Personal site for Elias B.", href: "https://github.com/3ixas/eliasb.dev", pushedAt };
const projectWithCaseStudy = { name: "threshold", description: "A repository description", href: "https://github.com/3ixas/threshold", pushedAt };
const projectWithoutCaseStudy = { name: "risk-event-tracker", description: "A repository description", href: "https://github.com/3ixas/risk-event-tracker", pushedAt };
const latest = (overrides: Partial<LatestRepositorySignal>): LatestRepositorySignal => ({ state: "live", repository, updatedAt: daysAgo(0), ...overrides });

// A live week: a pictured lead, a text-only event, and a pictured birth.
const week: HistorySignal = {
  state: "live",
  weekOf: "2026-09-28",
  sourceUrl: "https://en.wikipedia.org/wiki/September_28",
  updatedAt: "2026-09-28T06:00:00.000Z",
  events: [
    {
      year: 1924,
      kind: "event",
      text: "The first aerial circumnavigation is completed by a team from the US Army.",
      sourceUrl: "https://en.wikipedia.org/wiki/First_aerial_circumnavigation",
      image: {
        src: "/projects/threshold.webp",
        alt: "Douglas World Cruisers on a beach",
        creator: "The Museum of Flight",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Douglas_World_Cruisers.jpg",
        licenseName: "Public domain",
        licenseUrl: null,
        width: 1280,
        height: 867,
      },
    },
    {
      year: 1781,
      kind: "event",
      text: "A cow wanders into a cathedral and is accidentally made an honorary chorister.",
      sourceUrl: "https://en.wikipedia.org/wiki/Cow",
    },
    {
      year: 1852,
      kind: "birth",
      text: "Henri Moissan, French chemist who first isolated fluorine",
      sourceUrl: "https://en.wikipedia.org/wiki/Henri_Moissan",
      image: {
        src: "/profile/elias-evening.webp",
        alt: "Henri Moissan in his laboratory",
        creator: "Ada Example",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Henri_Moissan.jpg",
        licenseName: "CC BY-SA 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        width: 1280,
        height: 853,
      },
    },
  ],
};

// Fixed moments, so "today" lands on the same day every run.
const trainingAt = [
  // Monday 5 October, 00:30 in London (still Sunday in UTC).
  { name: "monday", at: "2026-10-04T23:30:00Z" },
  // Saturday 3 October, midday.
  { name: "saturday", at: "2026-10-03T12:00:00Z" },
  // Sunday 1 November, 23:30 in London, after the clocks went back.
  { name: "sunday", at: "2026-11-01T23:30:00Z" },
];

type Cells = { training: ReactNode; book: ReactNode; film: ReactNode; history: ReactNode; year: ReactNode };

/** The whole panel on fixed, saved data, with one cell swapped for the state under test, so each state shows the panel keeping its shape. */
const panel = (swap: Partial<Cells>) => (
  <OffTheClockPanel
    {...{
      training: <TrainingCell now={trainingAt[1].at} />,
      book: <BookCell reading={reading({ state: "curated" })} now={now} />,
      film: <FilmCell signal={diary({ state: "curated" })} now={now} />,
      history: <HistoryCell history={{ ...week, state: "curated" }} />,
      year: <GitHubCell github={github({ state: "curated" })} latest={latest({ state: "curated" })} now={now} />,
      ...swap,
    }}
  />
);
const long = "The Assassination of Jesse James by the Coward Robert Ford";

const items = [
  ...trainingAt.map(({ name, at }) => ({ name: `training-${name}`, item: panel({ training: <TrainingCell now={at} /> }) })),
  { name: "book", item: panel({ book: <BookCell reading={reading({})} now={now} /> }) },
  { name: "book-empty", item: panel({ book: <BookCell reading={reading({ book: null })} now={now} /> }) },
  { name: "book-unfetched", item: panel({ book: <BookCell reading={reading({ state: "pending", book: null, updatedAt: null })} now={now} /> }) },
  { name: "book-stale", item: panel({ book: <BookCell reading={reading({ updatedAt: daysAgo(61) })} now={now} /> }) },
  { name: "book-uncovered", item: panel({ book: <BookCell reading={reading({ state: "curated", book: { ...book, coverUrl: null } })} now={now} /> }) },
  { name: "film", item: panel({ film: <FilmCell signal={diary({})} now={now} /> }) },
  { name: "film-empty", item: panel({ film: <FilmCell signal={diary({ film: null })} now={now} /> }) },
  { name: "film-stale", item: panel({ film: <FilmCell signal={diary({ updatedAt: daysAgo(61) })} now={now} /> }) },
  { name: "film-long", item: panel({ film: <FilmCell signal={diary({ state: "curated", film: { ...film, title: long, year: "2007", rating: 3.5, watchedOn: "2026-10-09" } })} now={now} /> }) },
  { name: "film-unrated", item: panel({ film: <FilmCell signal={diary({ state: "curated", film: { ...film, rating: null, posterUrl: null } })} now={now} /> }) },
  { name: "making", item: panel({ year: <GitHubCell github={github({ state: "curated" })} latest={latest({})} now={now} /> }) },
  { name: "making-project", item: panel({ year: <GitHubCell github={github({ state: "curated" })} latest={latest({ state: "curated", repository: projectWithCaseStudy })} now={now} /> }) },
  { name: "making-project-code", item: panel({ year: <GitHubCell github={github({ state: "curated" })} latest={latest({ state: "curated", repository: projectWithoutCaseStudy })} now={now} /> }) },
  { name: "making-none", item: panel({ year: <GitHubCell github={github({ state: "curated" })} latest={latest({ state: "unavailable", repository: null })} now={now} /> }) },
  { name: "github", item: panel({}) },
  { name: "github-live", item: panel({ year: <GitHubCell github={github({})} latest={latest({ state: "curated" })} now={now} /> }) },
  { name: "github-stale", item: panel({ year: <GitHubCell github={github({ updatedAt: daysAgo(4) })} latest={latest({ state: "curated" })} now={now} /> }) },
  { name: "github-unavailable", item: panel({ year: <GitHubCell github={github({ state: "unavailable", activity: [], total: 0, updatedAt: null })} latest={latest({ state: "curated" })} now={now} /> }) },
  { name: "history-live", item: panel({ history: <HistoryCell history={week} /> }) },
  { name: "history-one", item: panel({ history: <HistoryCell history={{ ...week, state: "curated", events: week.events.slice(0, 1) }} /> }) },
  { name: "history-text-only", item: panel({ history: <HistoryCell history={{ ...week, state: "curated", events: week.events.slice(1, 2) }} /> }) },
  { name: "history-saved", item: panel({ history: <HistoryCell history={savedHistorySignal()} /> }) },
  // Every feed down at once: the panel still has its three bands.
  {
    name: "fallback",
    item: panel({
      book: <BookCell reading={reading({ state: "unavailable", book: null, updatedAt: null })} now={now} />,
      film: <FilmCell signal={diary({ state: "unavailable", film: null, updatedAt: null })} now={now} />,
      history: <HistoryCell history={savedHistorySignal()} />,
      year: <GitHubCell github={github({ state: "unavailable", activity: [], total: 0, updatedAt: null })} latest={latest({ state: "unavailable", repository: null })} now={now} />,
    }),
  },
  // The longest titles the feeds could send, at the narrowest width.
  {
    name: "long",
    item: panel({
      book: <BookCell reading={reading({ state: "curated", book: { ...book, title: "The Extraordinary and Unabridged Chronicles of an Unusually Long Book Title" } })} now={now} />,
      film: <FilmCell signal={diary({ state: "curated", film: { ...film, title: long } })} now={now} />,
    }),
  },
];

/**
 * Off the clock's panel from fixture feeds, for the end-to-end suite: the training week at fixed moments, and the book,
 * film, this week in history, Now making and the GitHub year current, empty, never fetched, stale and with missing parts,
 * each in a whole panel. It exists only when the server is started with BOARD_FIXTURES=1.
 */
export default async function OffTheClockFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <div data-site>
      <main id="main-content" tabIndex={-1} className="frame">
        <h1 className="sr-only">Off the clock fixtures</h1>
        <h2 className="sr-only">Off the clock</h2>
        {items.map(({ name, item }) => (
          <section key={name} data-fixture={name} className="section" aria-label={name}>
            {item}
          </section>
        ))}
      </main>
    </div>
  );
}
