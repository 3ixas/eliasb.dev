/*
 * Off the clock: labels and fallbacks for the training plan and the live
 * signals, from docs/content/redesign-copy.md. Live values ({title}, {fact},
 * counts) are passed in; the copy has no authored training week yet, so the
 * plan itself is not here.
 */

export const offTheClock = {
  heading: "Off the clock",
  note: "What my own time looks like this week.",
  training: {
    today: "Today",
    week: "My training week",
    zone2: "Zone 2 means slow on purpose.",
    photoCaption: "Out on a run, central London.",
  },
  reading: {
    label: "Now reading",
    source: "Goodreads ↗",
    fallback: "Between books.",
  },
  watched: {
    kicker: "Admit one",
    label: "Last watched",
    source: "Letterboxd ↗",
    fallback: "Nothing logged yet.",
  },
  curiosity: {
    label: "Odd but true, from this week in history",
    more: (n: number) => `${n} more oddities this week ↓`,
    source: "Read on Wikipedia ↗",
    fallback: "From the archive",
  },
  nowMaking: {
    label: "Now making",
    line: "Rebuilding Professor Past from scratch.",
    note: "v1 is on GitHub if you want to meet the professor.",
    code: "Code ↗",
    fallback: {
      label: "Latest on GitHub",
      latest: (repo: string, updated: string) => `${repo}, updated ${updated}`,
      link: "View on GitHub ↗",
    },
  },
  github: {
    contributions: (count: string) => `${count} contributions in the past year`,
    busiest: (stretch: string) => `busiest stretch, ${stretch} →`,
    swipe: "← swipe for the whole year",
    legend: { quiet: "Quiet", busy: "Busy", today: "today" },
    asOf: (date: string) => `as of ${date}`,
  },
} as const;
