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

export type FantasySignal = PersonalSignal & {
  leftLabel: string;
  matchupLabel: string;
  rightLabel: string;
};

export type HomepageSignals = {
  github: GitHubSignal;
  reading: PersonalSignal;
  training: PersonalSignal;
  fantasy: FantasySignal;
  culture: PersonalSignal;
  status: PersonalSignal;
};
