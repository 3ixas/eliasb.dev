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

export const signalFallbacks: HomepageSignals = {
  github: {
    state: "unavailable",
    statusLabel: "Last known",
    headline: "Building eliasb.dev, again",
    description: "The selected Cabinet direction is becoming the real site.",
    activity: recentDates(28),
    activityLabel: "Public activity is temporarily unavailable",
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
    coverUrl: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1525464420l/29226553._SY475_.jpg",
    href: "https://www.goodreads.com/book/show/29226553-dark-age",
  },
  training: {
    state: "curated",
    statusLabel: "Public log",
    headline: "Lift · Run · Muay Thai",
    description: "Running activity is public on Strava; the wider training rhythm stays deliberately broad.",
    href: "https://www.strava.com/athletes/79346179",
  },
  fantasy: {
    state: "pending",
    statusLabel: "Sleeper pending",
    headline: "Main redraft league",
    description: "The seasonal view is ready for an anonymised league connection.",
    leftLabel: "EB",
    matchupLabel: "in season",
    rightLabel: "—",
  },
  culture: {
    state: "curated",
    statusLabel: "Last known culture",
    headline: "Avengers: Infinity War",
    description: "Latest public Letterboxd entry · playlist kept in rotation",
    href: "https://open.spotify.com/playlist/3t859SH3i1qKfvsDlGWm9F",
    filmTitle: "Avengers: Infinity War",
    filmYear: "2018",
    filmRating: "4.5",
    filmPosterUrl: "https://a.ltrbxd.com/resized/film-poster/2/2/6/6/6/1/226661-avengers-infinity-war-0-600-0-900-crop.jpg?v=8b35f60c0c",
    filmHref: "https://letterboxd.com/3lxas/film/avengers-infinity-war/",
    playlistHref: "https://open.spotify.com/playlist/3t859SH3i1qKfvsDlGWm9F",
  },
};
