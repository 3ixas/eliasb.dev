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
    statusLabel: "No live update",
    headline: "I couldn’t load GitHub just now.",
    description: "",
    activity: recentDates(365),
    activityLabel: "GitHub contributions over the last year are unavailable right now",
    updatedAt: null,
    href: "https://github.com/3ixas",
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
  },
};
