import type { FantasyTicket } from "./fantasy";

export type SignalState = "live" | "curated" | "pending" | "unavailable";

export type ActivityDay = {
  date: string;
  count: number;
};

export type GitHubSignal = {
  state: SignalState;
  statusLabel: string;
  headline: string;
  description: string;
  activity: ActivityDay[];
  activityLabel: string;
  totalContributions?: number;
  updatedAt: string | null;
  href: string;
};

export type TrainingCategory = {
  label: string;
  count: number;
};

export type TrainingSignal = PersonalSignal & {
  weekly: TrainingCategory[];
  totalActivities: number;
  windowLabel: string;
  updatedAt: string | null;
};

export type HistoryEvent = {
  year: number;
  kind: "event" | "birth";
  text: string;
  sourceUrl: string;
  image?: HistoryImage;
};

export type HistoryImage = {
  src: string;
  alt: string;
  creator: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string | null;
  width: number;
  height: number;
};

/**
 * The Weekly Curiosity: three oddities from this week in history, the most
 * surprising first. Saved examples have no week (weekOf is null).
 */
export type HistorySignal = {
  state: SignalState;
  /** The Monday the week starts, YYYY-MM-DD; the facts happened on this day. */
  weekOf: string | null;
  events: HistoryEvent[];
  /** The readable Wikipedia page for the day, or the history portal for saved examples. */
  sourceUrl: string;
  updatedAt: string | null;
};

export type PersonalSignal = {
  state: SignalState;
  statusLabel: string;
  headline: string;
  description: string;
  href?: string;
};

/** The book on my currently-reading shelf. */
export type Book = {
  title: string;
  author: string;
  /** When the book went onto the shelf, which is when I started it. */
  startedAt: string | null;
  coverUrl: string | null;
};

/**
 * Goodreads, live only: book is null when the shelf is empty. "pending" means
 * nothing has been fetched successfully yet, so there is nothing to show.
 */
export type ReadingSignal = {
  state: SignalState;
  book: Book | null;
  href: string;
  updatedAt: string | null;
};

/** The latest film in my Letterboxd diary. */
export type Film = {
  title: string;
  year: string | null;
  /** Out of 5, in half stars. */
  rating: number | null;
  /** The diary date, YYYY-MM-DD. */
  watchedOn: string | null;
  posterUrl: string | null;
  href: string;
};

/** Letterboxd, live only: film is null when the diary is empty. */
export type FilmSignal = {
  state: SignalState;
  film: Film | null;
  href: string;
  updatedAt: string | null;
};

/** Sleeper, read against the NFL calendar: ticket is null when there's no pin. */
export type FantasySignal = {
  state: SignalState;
  ticket: FantasyTicket | null;
  updatedAt: string | null;
};

export type HomepageSignals = {
  github: GitHubSignal;
  training: TrainingSignal;
};
