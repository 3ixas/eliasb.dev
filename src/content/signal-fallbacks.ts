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
    statusLabel: "Public only",
    headline: "Recent GitHub activity",
    description: "The chart shows public contributions only.",
    activity: recentDates(371),
    activityLabel: "GitHub contributions over the last year are currently unavailable",
    updatedAt: null,
    href: "https://github.com/3ixas",
  },
  status: {
    state: "curated",
    statusLabel: "A note from me",
    headline: "Probably thinking through an interface.",
    description: "A note from London, which I update from time to time.",
  },
  reading: {
    state: "curated",
    statusLabel: "Last known book",
    headline: "Dark Age",
    description: "By Pierce Brown. This was the last book I had marked as reading on Goodreads.",
    author: "Pierce Brown",
    bookDescription: "By Pierce Brown. This was the last book I had marked as reading on Goodreads.",
    coverUrl: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1525464420l/29226553._SY475_.jpg",
    href: "https://www.goodreads.com/book/show/29226553-dark-age",
    updatedAt: null,
  },
  training: {
    state: "curated",
    statusLabel: "Typical week",
    headline: "My weekly training plan",
    description: "I update this plan by hand.",
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
    statusLabel: "My league isn’t connected yet",
    headline: "Main redraft league",
    description: "I’ll show my score here when the league connects; other managers’ names stay private.",
    matchupLabel: "Week unavailable",
    updatedAt: null,
  },
  culture: {
    state: "curated",
    statusLabel: "Last known film",
    headline: "Avengers: Infinity War",
    description: "This was the most recent film in my Letterboxd diary when the feed last updated.",
    href: "https://open.spotify.com/playlist/3t859SH3i1qKfvsDlGWm9F",
    filmTitle: "Avengers: Infinity War",
    filmYear: "2018",
    filmRating: "4.5",
    filmDescription: "A superhero ensemble film about the Avengers making a last stand against Thanos.",
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
    statusLabel: "Week data unavailable",
    description: "Sleeper hasn’t returned the current week yet; I keep the other managers’ names private.",
    matchupLabel: "Week unavailable",
  });
}

export function fantasySourceUnavailable(href: string, week?: number): FantasySignal {
  return unavailableFantasySignal({
    href,
    statusLabel: "Sleeper unavailable",
    description: "Sleeper hasn’t returned the current matchup; the other managers’ names stay private.",
    matchupLabel: week ? `Week ${week}` : "Week unavailable",
  });
}
