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
  privateContributions?: number;
  updatedAt: string | null;
  href: string;
};

export type TrainingCategory = {
  label: string;
  count: number;
};

export type TrainingDay = {
  day: string;
  activity: string;
};

export type TrainingSignal = PersonalSignal & {
  weekly: TrainingCategory[];
  schedule?: readonly TrainingDay[];
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
};

export type HistorySignal = {
  state: SignalState;
  statusLabel: string;
  headline: string;
  description: string;
  dateLabel: string;
  events: HistoryEvent[];
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

export type ReadingSignal = PersonalSignal & {
  author?: string;
  coverUrl?: string;
  bookDescription?: string;
  updatedAt: string | null;
};

export type CultureSignal = PersonalSignal & {
  filmTitle?: string;
  filmYear?: string;
  filmRating?: string;
  filmDescription?: string;
  filmPosterUrl?: string;
  filmHref?: string;
  playlistHref: string;
  updatedAt: string | null;
};

export type FantasySignal = PersonalSignal & {
  matchupLabel: string;
  teamScore?: number;
  opponentScore?: number;
  updatedAt: string | null;
};

export type HomepageSignals = {
  github: GitHubSignal;
  reading: ReadingSignal;
  training: TrainingSignal;
  fantasy: FantasySignal;
  culture: CultureSignal;
};
