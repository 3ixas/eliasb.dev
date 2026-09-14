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
    state: "pending",
    statusLabel: "Awaiting selection",
    headline: "First shelf in progress",
    description: "The current book and a short personal note will live here.",
  },
  training: {
    state: "curated",
    statusLabel: "Curated",
    headline: "Lift · Run · Muay Thai",
    description: "A deliberately broad weekly rhythm until a public source is chosen.",
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
    state: "pending",
    statusLabel: "Selections pending",
    headline: "The current rotation",
    description: "A Spotify playlist and recent cinema will meet here.",
  },
};
