import type { Book, Film } from "./types";

export type ActivityDay = { date: string; count: number };

export type GitHubEventShape = {
  type: string;
  repo: { name: string };
  created_at: string;
};

export type ContributionDayShape = { date: string; contributionCount: number };

export const GITHUB_ACTIVITY_DAYS = 365;

export function datesForWindow(length: number, now = new Date()): ActivityDay[] {
  return Array.from({ length }, (_, index) => {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - (length - index - 1));
    return { date: date.toISOString().slice(0, 10), count: 0 };
  });
}

export function mapPublicActivity(events: GitHubEventShape[], length = GITHUB_ACTIVITY_DAYS, now = new Date()) {
  const activity = datesForWindow(length, now);
  const byDate = new Map(activity.map((day, index) => [day.date, index]));

  for (const event of events) {
    const index = byDate.get(event.created_at.slice(0, 10));
    if (index !== undefined) activity[index].count += 1;
  }

  return activity;
}

export function mapContributionDays(days: ContributionDayShape[], length = GITHUB_ACTIVITY_DAYS, now = new Date()) {
  const byDate = new Map(days.map((day) => [day.date, day.contributionCount]));

  return datesForWindow(length, now).map((day) => ({
    date: day.date,
    count: byDate.get(day.date) ?? 0,
  }));
}

const london = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});

/** The time in London written as if it were UTC, so its calendar day is London's. */
function londonWallClock(instant: number) {
  const part = (type: string) => Number(london.formatToParts(instant).find((entry) => entry.type === type)?.value);
  return Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
}

/** The day of the week in London, counting from Monday (0) to Sunday (6). */
export function londonWeekday(now = new Date()) {
  return (new Date(londonWallClock(now.getTime())).getUTCDay() + 6) % 7;
}

/** The fields read from a Goodreads currently-reading item, already decoded. */
export type GoodreadsItemShape = {
  title?: string;
  author?: string;
  dateAdded?: string;
  coverUrl?: string;
};

/**
 * A Goodreads item as the book I'm reading. The series suffix comes off the
 * title, and the day it went onto the shelf stands in for the day I started.
 * Without a title and author it isn't a book, so the result is null.
 */
export function bookFromGoodreads(item: GoodreadsItemShape): Book | null {
  const title = item.title
    ?.replace(/\s+by\s+.+$/i, "")
    .replace(/\s+\([^)]*#\d+[^)]*\)\s*$/, "")
    .trim();
  const author = item.author?.trim();
  if (!title || !author) return null;
  return { title, author, startedAt: isoInstant(item.dateAdded), coverUrl: item.coverUrl ?? null };
}

/** The fields read from a Letterboxd diary item, already decoded. */
export type LetterboxdItemShape = {
  title?: string;
  year?: string;
  rating?: string;
  watchedDate?: string;
  posterUrl?: string;
  href?: string;
};

/** A Letterboxd diary item as the film I last watched, or null if it names no film. */
export function filmFromLetterboxd(item: LetterboxdItemShape, profileUrl: string): Film | null {
  const title = item.title?.trim();
  if (!title) return null;
  const rating = Number(item.rating);
  return {
    title,
    year: item.year?.trim() || null,
    // Letterboxd rates in half stars, from half a star to five.
    rating: Number.isFinite(rating) && rating >= 0.5 && rating <= 5 ? Math.round(rating * 2) / 2 : null,
    watchedOn: /^\d{4}-\d{2}-\d{2}$/.test(item.watchedDate ?? "") ? item.watchedDate! : null,
    posterUrl: item.posterUrl ?? null,
    href: item.href ?? profileUrl,
  };
}

function isoInstant(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
