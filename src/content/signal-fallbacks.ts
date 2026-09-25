import type { FantasySignal, HomepageSignals } from "@/integrations/types";

function recentDates(length: number) {
  const today = new Date();

  return Array.from({ length }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (length - index - 1));

    return {
      date: date.toISOString().slice(0, 10),
      count: 0,
    };
  });
}

const TYPICAL_TRAINING_WEEK = [
  { day: "Mon", activity: "Full body" },
  { day: "Tue", activity: "Zone 2 run" },
  { day: "Wed", activity: "Full body" },
  { day: "Thu", activity: "Interval run" },
  { day: "Fri", activity: "Full body" },
  { day: "Sat", activity: "Zone 2 rowing machine" },
  { day: "Sun", activity: "Interval assault bike" },
] as const;

export const signalFallbacks: HomepageSignals = {
  github: {
    state: "unavailable",
    statusLabel: "No live update",
    headline: "I couldn’t load GitHub just now.",
    description: "",
    activity: recentDates(365),
    activityLabel: "GitHub contributions over the last year are unavailable right now",
    updatedAt: null,
    href: "https://github.com/3ixas",
  },
  reading: {
    state: "curated",
    statusLabel: "Last on Goodreads",
    headline: "Dark Age",
    description: "",
    author: "Pierce Brown",
    bookDescription: "",
    coverUrl: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1525464420l/29226553._SY475_.jpg",
    href: "https://www.goodreads.com/book/show/29226553-dark-age",
    updatedAt: null,
  },
  training: {
    state: "curated",
    statusLabel: "Typical week",
    headline: "My weekly training plan",
    description: "",
    weekly: [
      { label: "Lift", count: 0 },
      { label: "Run", count: 0 },
      { label: "Muay Thai", count: 0 },
      { label: "Other", count: 0 },
    ],
    totalActivities: 0,
    windowLabel: "Typical week",
    updatedAt: null,
    schedule: TYPICAL_TRAINING_WEEK,
  },
  fantasy: {
    state: "pending",
    statusLabel: "No matchup just yet",
    headline: "Main redraft league",
    description: "",
    matchupLabel: "Week unavailable",
    updatedAt: null,
  },
  culture: {
    state: "curated",
    statusLabel: "Last logged",
    headline: "Avengers: Infinity War",
    description: "",
    href: "https://open.spotify.com/playlist/3t859SH3i1qKfvsDlGWm9F",
    filmTitle: "Avengers: Infinity War",
    filmYear: "2018",
    filmRating: "4.5",
    filmDescription: "",
    filmPosterUrl: "https://a.ltrbxd.com/resized/film-poster/2/2/6/6/6/1/226661-avengers-infinity-war-0-600-0-900-crop.jpg?v=8b35f60c0c",
    filmHref: "https://letterboxd.com/3lxas/film/avengers-infinity-war/",
    playlistHref: "https://open.spotify.com/playlist/3t859SH3i1qKfvsDlGWm9F",
    updatedAt: null,
  },
};

function unavailableFantasySignal({
  href,
  statusLabel,
  description,
  matchupLabel,
}: {
  href: string;
  statusLabel: string;
  description: string;
  matchupLabel: string;
}): FantasySignal {
  return {
    ...signalFallbacks.fantasy,
    state: "unavailable",
    statusLabel,
    description,
    matchupLabel,
    href,
  };
}

export function fantasyWeekUnavailable(href: string): FantasySignal {
  return unavailableFantasySignal({
    href,
    statusLabel: "No current week yet",
    description: "",
    matchupLabel: "Week unavailable",
  });
}

export function fantasySourceUnavailable(href: string, week?: number): FantasySignal {
  return unavailableFantasySignal({
    href,
    statusLabel: "No live update from Sleeper",
    description: "",
    matchupLabel: week ? `Week ${week}` : "Week unavailable",
  });
}
