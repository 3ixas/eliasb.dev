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
  /** A live row's source mark, and a stale one's (docs/content/redesign-copy.md, "Source marks"). */
  live: (source: string) => `Live from ${source}`,
  fromAsOf: (source: string, date: string) => `From ${source}, as of ${date}`,
  training: {
    week: "My training week",
    /** The row's line once today's session is its title. */
    rowLine: "Today’s session, from my training week",
    photoCaption: "Out on a run, central London.",
    photo: {
      src: "/signals/running-central-london.webp",
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
    sourceName: "Goodreads",
    fallback: "Between books.",
    coverAlt: (title: string, author: string) => `Cover of ${title} by ${author}`,
  },
  watched: {
    kicker: "Admit one",
    label: "Last watched",
    sourceName: "Letterboxd",
    fallback: "Nothing logged yet.",
    posterAlt: (title: string, year: string | null) => (year ? `Poster for ${title} (${year})` : `Poster for ${title}`),
  },
  curiosity: {
    /** The history row's title. */
    label: "Odd but true, from this week in history",
    /** The row's line for a week with several oddities. */
    rowLine: (n: number) => `${n} things that happened this week, some stranger than others.`,
    /** Stamped on the clipping, which restamps as the row cycles. */
    stamp: "This week in history",
    count: (position: number, total: number) => `${position} of ${total}`,
    sourceName: "Wikipedia",
    fallback: "From the archive",
    imageCredit: "Image:",
    born: (date: string) => `Born ${date}`,
  },
  nowMaking: {
    label: "Now making",
    sourceName: "GitHub",
  },
  github: {
    /** Heard by screen readers only; the visible line leads with the total. */
    heading: "GitHub, the past year",
    sourceName: "GitHub",
    contributions: (count: string) => `${count} contributions in the past year`,
    keys: "Use the arrow keys to move between days.",
    name: (count: string) => `GitHub contributions over the past year: ${count}.`,
    legend: { less: "Less", more: "More", today: "today" },
  },
} as const;

/** What Now making shows: a name, GitHub's description of it, and where it links. */
export type NowMakingEntry = { name: string; description: string | null; href: string; internal: boolean };

/**
 * The latest public repository as the card shows it. A repository that is one
 * of my projects takes the project's name and, when it has one, links to its
 * case study; any other keeps its own name and description and links to GitHub.
 */
export function nowMakingEntry(
  latest: { name: string; description: string | null; href: string } | null,
  projects: readonly { name: string; links: { caseStudy?: string; code?: string } }[],
): NowMakingEntry | null {
  if (!latest) return null;
  const project = projects.find(({ links }) => links.code?.toLowerCase() === latest.href.toLowerCase());
  if (!project) return { name: latest.name, description: latest.description, href: latest.href, internal: false };
  const caseStudy = project.links.caseStudy;
  return { name: project.name, description: null, href: caseStudy ?? latest.href, internal: Boolean(caseStudy) };
}
