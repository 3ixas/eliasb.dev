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
  updatedAt: string | null;
  href: string;
};

export type PersonalSignal = {
  state: SignalState;
  statusLabel: string;
  headline: string;
  description: string;
  href?: string;
};

export type ReadingSignal = PersonalSignal & {
  author?: string;
  coverUrl?: string;
  bookDescription?: string;
};

export type CultureSignal = PersonalSignal & {
  filmTitle?: string;
  filmYear?: string;
  filmRating?: string;
  filmDescription?: string;
  filmPosterUrl?: string;
  filmHref?: string;
  playlistHref: string;
};

export type FantasySignal = PersonalSignal & {
  leftLabel: string;
  matchupLabel: string;
  rightLabel: string;
  leftScore?: number;
  rightScore?: number;
};

export type HomepageSignals = {
  github: GitHubSignal;
  reading: ReadingSignal;
  training: PersonalSignal;
  fantasy: FantasySignal;
  culture: CultureSignal;
  status: PersonalSignal;
};
