import type { HomepageSignals } from "@/integrations/types";

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
    headline: "Building eliasb.dev, again",
    description: "Public GitHub activity is visible here; private contribution totals need the site token.",
    activity: recentDates(371),
    activityLabel: "Public GitHub activity over the last year",
    updatedAt: null,
    href: "https://github.com/3ixas",
  },
  status: {
    state: "curated",
    statusLabel: "Curated",
    headline: "Probably thinking through an interface.",
    description: "London · manually updated when the mood changes",
  },
  reading: {
    state: "curated",
    statusLabel: "Last known shelf",
    headline: "Dark Age",
    description: "By Pierce Brown · Goodreads may be temporarily unavailable",
    author: "Pierce Brown",
    bookDescription: "A stable snapshot of the current Goodreads shelf until the next successful lookup.",
    coverUrl: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1525464420l/29226553._SY475_.jpg",
    href: "https://www.goodreads.com/book/show/29226553-dark-age",
    updatedAt: null,
  },
  training: {
    state: "curated",
    statusLabel: "Typical week",
    headline: "A typical training week",
    description: "My usual plan for the week, rather than a live workout log.",
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
    statusLabel: "Sleeper pending",
    headline: "Main redraft league",
    description: "The seasonal view is ready for an anonymised league connection.",
    leftLabel: "EB",
    matchupLabel: "in season",
    rightLabel: "—",
    updatedAt: null,
  },
  culture: {
    state: "curated",
    statusLabel: "Last known culture",
    headline: "Avengers: Infinity War",
    description: "The latest film logged in my Letterboxd diary.",
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
