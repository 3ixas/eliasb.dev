import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BookPin, FilmPin } from "@/components/board/culture-corner";
import { Pinboard } from "@/components/board/pinboard";
import { BoardSurface } from "@/components/board/surface";
import type { Book, Film, FilmSignal, ReadingSignal } from "@/integrations/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// A fixed "now" and fixture feeds, so each state renders the same every run.
const now = new Date("2026-10-02T12:00:00.000Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

const book: Book = {
  title: "Dark Age",
  author: "Pierce Brown",
  startedAt: "2026-09-14T10:52:45.000Z",
  coverUrl: "/signals/london-st-pauls.jpg",
};
const film: Film = {
  title: "The Invite",
  year: "2026",
  rating: 4.5,
  watchedOn: "2026-09-14",
  posterUrl: "/signals/football-stadium.jpg",
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

const fixtures = [
  { name: "book", pin: <BookPin reading={reading({})} now={now} /> },
  { name: "book-empty", pin: <BookPin reading={reading({ book: null })} now={now} /> },
  { name: "book-unfetched", pin: <BookPin reading={reading({ state: "pending", book: null, updatedAt: null })} now={now} /> },
  { name: "film", pin: <FilmPin film={diary({})} now={now} /> },
  { name: "film-empty", pin: <FilmPin film={diary({ film: null })} now={now} /> },
  { name: "film-stale", pin: <FilmPin film={diary({ updatedAt: daysAgo(61) })} now={now} /> },
  { name: "film-unrated", pin: <FilmPin film={diary({ film: { ...film, rating: null, posterUrl: null } })} now={now} /> },
];

/**
 * The culture corner's book and film pins from fixture feeds, for the
 * end-to-end suite: current, empty, never fetched, stale, and missing parts.
 * It exists only when the server is started with BOARD_FIXTURES=1.
 */
export default async function CultureFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 className="sr-only">Culture corner fixtures</h1>
      <BoardSurface kind="wall" className="p-4 sm:p-16">
        <Pinboard>
          {fixtures.map(({ name, pin }) => (
            <div key={name} data-fixture={name} className="board:col-span-4">
              {pin}
            </div>
          ))}
        </Pinboard>
      </BoardSurface>
    </main>
  );
}
