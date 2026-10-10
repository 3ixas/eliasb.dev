/*
 * Off the clock: labels and fallbacks for the training plan and the live
 * signals, from docs/content/redesign-copy.md. Live values ({title}, {fact},
 * counts) are passed in. The training week is authored here, from the plan
 * Elias approved on 3 October 2026 (docs/content/copy/09-training-log.md) and
 * confirmed for the Stretch poster on 8 October 2026.
 */

export const offTheClock = {
  heading: "Off the clock",
  note: "What my own time looks like this week.",
  /** Shown on an item whose saved data has gone stale (from the Board's approved states copy). */
  asOf: (date: string) => `as of ${date}`,
  training: {
    today: "Today",
    week: "My training week",
    zone2: "Zone 2 means slow on purpose.",
    photoCaption: "Out on a run, central London.",
    photo: {
      src: "/signals/running-central-london.webp",
      alt: "Elias mid-run on a rainy street in central London",
      width: 960,
      height: 1280,
    },
    /** Monday to Sunday: his usual week, a plan and never a log. */
    days: [
      { short: "Mon", long: "Monday", session: "Full-body gym" },
      { short: "Tue", long: "Tuesday", session: "Zone 2 run" },
      { short: "Wed", long: "Wednesday", session: "Full-body gym" },
      { short: "Thu", long: "Thursday", session: "Interval run" },
      { short: "Fri", long: "Friday", session: "Full-body gym" },
      { short: "Sat", long: "Saturday", session: "Zone 2, rower or bike" },
      { short: "Sun", long: "Sunday", session: "Assault bike intervals" },
    ],
  },
  reading: {
    label: "Now reading",
    source: "Goodreads ↗",
    fallback: "Between books.",
    coverAlt: (title: string, author: string) => `Cover of ${title} by ${author}`,
  },
  watched: {
    kicker: "Admit one",
    label: "Last watched",
    source: "Letterboxd ↗",
    fallback: "Nothing logged yet.",
    posterAlt: (title: string, year: string | null) => (year ? `Poster for ${title} (${year})` : `Poster for ${title}`),
  },
  curiosity: {
    label: "Odd but true, from this week in history",
    more: (n: number) => `${n} more oddities this week ↓`,
    source: "Read on Wikipedia ↗",
    fallback: "From the archive",
    /** From the Board's approved clipping copy. */
    readMore: "Read more ↗",
    imageCredit: "Image:",
    born: (date: string) => `Born ${date}`,
  },
  nowMaking: {
    label: "Now making",
    line: "Rebuilding Professor Past from scratch.",
    note: "v1 is on GitHub if you want to meet the professor.",
    code: "Code ↗",
    href: "https://github.com/3ixas/ask-professor-past",
    /** The entry counts as "now" for 8 weeks from the day it was written (Elias, 3 October 2026). */
    writtenOn: "2026-10-03",
    currentDays: 56,
    fallback: {
      label: "Latest on GitHub",
      latest: (repo: string, updated: string) => `${repo}, updated ${updated}`,
      link: "View on GitHub ↗",
    },
  },
  github: {
    /** Heard by screen readers only; the visible card leads with the total. */
    heading: "GitHub, the past year",
    contributions: (count: string) => `${count} contributions in the past year`,
    busiest: (stretch: string) => `busiest stretch, ${stretch} →`,
    /** The same note when the stretch sits to its right. */
    busiestAfter: (stretch: string) => `← busiest stretch, ${stretch}`,
    keys: "Use the arrow keys to move between days.",
    name: (count: string, stretch: string | null) =>
      `GitHub contributions over the past year: ${count}${stretch ? `, busiest in ${stretch}` : ""}.`,
    swipe: "← swipe for the whole year",
    legend: { quiet: "Quiet", busy: "Busy", today: "today" },
    asOf: (date: string) => `as of ${date}`,
  },
} as const;

export type NowMakingNote =
  | { kind: "authored" }
  | { kind: "latest"; repository: { name: string; href: string; pushedAt: string } };

/** What Now making shows: the written entry while it counts as now, else the latest public repository, else nothing. */
export function nowMakingNote(now: Date, latest: { name: string; href: string; pushedAt: string } | null): NowMakingNote | null {
  const { writtenOn, currentDays } = offTheClock.nowMaking;
  const expires = new Date(`${writtenOn}T00:00:00Z`).getTime() + currentDays * 86_400_000;
  if (now.getTime() < expires) return { kind: "authored" };
  return latest ? { kind: "latest", repository: latest } : null;
}
