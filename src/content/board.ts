import type { FantasyGate, FantasyOutcome, FantasyRecord, FantasyTicket } from "@/integrations/fantasy";
import type { PinKey } from "@/integrations/pin-rules";
import type { GitHubRepository } from "@/integrations/types";

/** The Board: the personal section's copy, approved in docs/content/copy/05-board.md. */
export const board = {
  kicker: "02 / Library",
  heading: { lead: "Some of what I’m into", emphasis: "lately." },
  /** Every pin says what it is to a stranger. */
  labels: {
    clipping: "The Weekly Curiosity",
    making: "Now making",
    github: "GitHub · the past year",
    training: "My training week",
    fantasy: "NFL fantasy",
    london: "Home, London",
    reading: "Now reading",
    film: "Last watched",
    playlist: "On repeat",
  } satisfies Record<PinKey, string>,
  // A no-break space keeps "Week 3" together when the label wraps.
  fantasyWeek: (week: number) => `NFL fantasy · Week\u00a0${week}`,
  /** Approved in docs/content/copy/08-fantasy-ticket.md. */
  fantasy: {
    outcomes: { won: "Won", lost: "Lost", tied: "Tied", ahead: "Ahead", behind: "Behind", level: "Level" },
    team: (name: string) => `${name} vs. a rival who shall remain nameless`,
    gates: {
      thursday: "Gates open Thursday night",
      live: "Live now",
      sunday: "Back on Sunday",
      monday: "Back on Monday night",
    } satisfies Record<FantasyGate, string>,
    source: "Sleeper",
  },
  /** Approved in docs/content/copy/07-weekly-clipping.md. */
  clipping: {
    strapline: "Odd but true, from this week in history",
    volume: (year: number, week: number) => `Vol. ${year} · No. ${week}`,
    weekOf: (date: string) => `Week of ${date}`,
    archive: "From the archive",
    price: "Price: one click",
    stamp: "Strange but true",
    born: (date: string) => `Born ${date}`,
    imageCredit: "Image:",
    more: (count: number) => `${count} more oddities this week`,
    fold: "Fold them away",
    readOnWikipedia: "Read on Wikipedia",
    readMore: "Read more",
    moreFromDay: (day: string) => `More from ${day} on Wikipedia`,
    browseHistory: "Browse history on Wikipedia",
  },
  /** Approved in docs/content/copy/09-training-log.md (second version). */
  training: {
    photo: {
      src: "/signals/running-central-london.webp",
      alt: "Elias mid-run on a rainy street in central London",
      width: 960,
      height: 1280,
    },
    caption: "Out on a run, central London.",
    heading: "My training week",
    plan: "The plan",
    /** Monday to Sunday: my usual week. */
    days: [
      { short: "Mon", long: "Monday", session: "Full-body gym" },
      { short: "Tue", long: "Tuesday", session: "Zone 2 run" },
      { short: "Wed", long: "Wednesday", session: "Full-body gym" },
      { short: "Thu", long: "Thursday", session: "Interval run" },
      { short: "Fri", long: "Friday", session: "Full-body gym" },
      { short: "Sat", long: "Saturday", session: "Zone 2, rower or bike" },
      { short: "Sun", long: "Sunday", session: "Assault bike intervals" },
    ],
    today: "← today",
    note: "Zone 2 means slow on purpose.",
  },
  /** Approved in docs/content/copy/10-github-and-making.md. */
  github: {
    beside: "contributions in the past year",
    legend: { quiet: "Quiet", busy: "Busy" },
    link: "github.com/3ixas",
    /** The note sits right of the loop, or left of it near the year's end. */
    stretch: (when: string) => `← busiest stretch, ${when}`,
    stretchBefore: (when: string) => `busiest stretch, ${when} →`,
    swipe: "Swipe for the whole year →",
    keys: "Use the arrow keys to move between days.",
    name: (total: string, when: string | null) =>
      `GitHub contributions over the past year: ${total}${when ? `, busiest in ${when}` : ""}.`,
  },
  making: {
    /** What I'm making now. It counts as now for MAKING_CURRENT_DAYS from writtenOn. */
    entry: {
      title: "Rebuilding Professor Past from scratch.",
      line: "v1 is on GitHub if you want to meet the professor.",
      link: { label: "Code", href: "https://github.com/3ixas/ask-professor-past" },
      version: "v2",
      writtenOn: "2026-10-03",
    },
    fallbackLabel: "Latest on GitHub",
    fallbackLink: "View on GitHub",
    drawnBy: "Drawn E.B.",
    updated: (date: string) => `updated ${date}`,
  },
  cultureCorner: "The culture corner",
  /** Approved in docs/content/copy/06-culture-corner.md. */
  book: {
    source: "Goodreads",
    dateStarted: "Date started",
    started: (date: string) => `Started ${date}`,
    empty: "Between books",
    coverAlt: (title: string, author: string) => `Cover of ${title} by ${author}`,
    link: "View on Goodreads",
  },
  film: {
    ticket: "Admit one · Last watched",
    empty: "Nothing logged yet",
    posterAlt: (title: string, year: string | null) => (year ? `Poster for ${title} (${year})` : `Poster for ${title}`),
    link: "Logged on Letterboxd",
  },
  playlist: {
    title: "My playlist",
    line: "Whatever I’ve had on loop lately",
    heading: "What I’m listening to",
    badge: { brand: "E/B Sound", side: "Stereo · Side A" },
    jCard: "Side A · press play to see what’s on it",
    jCardPlaying: "Side A",
    play: "Play",
    playName: "Play my playlist on Spotify",
    playerTitle: "My Spotify playlist",
    open: "Open in Spotify",
  },
  london: {
    src: "/signals/london-st-pauls.jpg",
    alt: "London skyline from the Thames, with St Paul’s Cathedral and the City beyond",
    width: 1280,
    height: 867,
    clockName: "The time in London",
    clockLabel: (time: string) => `The time in London: ${time}`,
  },
  states: {
    asOf: (date: string) => `as of ${date}`,
    photoComing: "photo coming",
  },
} as const;

/** Half stars as the ticket shows them: 4.5 is ★★★★½. */
export function stars(rating: number) {
  return "★".repeat(Math.floor(rating)) + (rating % 1 ? "½" : "");
}

/**
 * The ticket's line, shown and spoken: "Watched 14 Sept · ★★★★", heard as
 * "Watched 14 September, rated 4 out of 5". Either half can be missing.
 */
export function filmLine(watched: { short: string; long: string } | null, rating: number | null) {
  const shown = [watched && `Watched ${watched.short}`, rating && stars(rating)].filter(Boolean);
  if (!shown.length) return null;
  const rated = rating && `rated ${rating} out of 5`;
  const spoken = watched ? [`Watched ${watched.long}`, rated].filter(Boolean).join(", ") : `Rated ${rating} out of 5`;
  return { shown: shown.join(" · "), spoken };
}

/** The ISO week number of a date: weeks start on Monday, and week 1 holds the year's first Thursday. */
export function isoWeek(date: Date) {
  const thursday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  thursday.setUTCDate(thursday.getUTCDate() + 3 - ((thursday.getUTCDay() + 6) % 7));
  const firstOfYear = Date.UTC(thursday.getUTCFullYear(), 0, 1);
  return { year: thursday.getUTCFullYear(), week: Math.ceil(((thursday.getTime() - firstOfYear) / 86_400_000 + 1) / 7) };
}

/** Scores as Sleeper gives them, to two decimals: 151.24 – 90.52. */
export function fantasyScore(points: number) {
  return points.toFixed(2);
}

/** The season record on the stub's side: 1–2, or 8–5–1 once there's a tie. */
export function fantasyRecord({ wins, losses, ties }: FantasyRecord) {
  return ties ? `${wins}–${losses}–${ties}` : `${wins}–${losses}`;
}

/**
 * The pencilled verdict beside the result. After a week it goes by the
 * margin (a field goal is 3 points, a blowout 40 or more); in play, by who's
 * ahead.
 */
export function fantasyVerdict(outcome: FantasyOutcome, margin: number) {
  switch (outcome) {
    case "ahead":
      return "Don’t jinx it.";
    case "behind":
      return "Plenty of time.";
    case "level":
      return "Anyone’s game.";
    case "tied":
      return "Nobody’s happy.";
    case "won":
      return margin >= 40 ? "Not even close." : margin >= 3 ? "I’ll take it." : "By less than a field goal.";
    case "lost":
      return margin >= 40 ? "Took me to the cleaners." : margin >= 3 ? "There’s always next week." : "By less than a field goal. Ouch.";
  }
}

const fantasyVerbs: Record<FantasyOutcome, string> = {
  won: "won",
  lost: "lost",
  tied: "tied",
  ahead: "is ahead",
  behind: "is behind",
  level: "is level",
};

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The whole stub as one passage for screen readers; the sideways text and the tear are decoration. */
export function fantasySpoken(ticket: FantasyTicket) {
  const { week, outcome, scores, margin, teamName, record, gate } = ticket;
  const tally = [count(record.wins, "win", "wins"), count(record.losses, "loss", "losses")];
  if (record.ties) tally.push(count(record.ties, "tie", "ties"));
  return [
    `NFL fantasy, week ${week}.`,
    `${teamName} ${fantasyVerbs[outcome]} ${fantasyScore(scores.team)} to ${fantasyScore(scores.opponent)} against a rival who shall remain nameless.`,
    fantasyVerdict(outcome, margin),
    `Season record: ${tally.join(", ")}.`,
    gate && `${board.fantasy.gates[gate]}.`,
  ].filter(Boolean).join(" ");
}

/**
 * The training plan as one passage for screen readers, today first:
 * "My training week, the plan. Today, Saturday: zone 2, rower or bike. Monday: …"
 */
export function trainingSpoken(today: number) {
  const { days, heading, plan, note } = board.training;
  const session = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
  const others = days.filter((_, index) => index !== today).map((day) => `${day.long}: ${session(day.session)}.`);
  return [`${heading}, ${plan.toLowerCase()}.`, `Today, ${days[today].long}: ${session(days[today].session)}.`, ...others, note].join(" ");
}

/** A count with thousands commas, written by the site so it's the same in every locale: 1,089. */
export function groupedNumber(value: number) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** How long a Making entry counts as "now": 8 weeks from the day it's written (Elias, 3 October 2026). */
export const MAKING_CURRENT_DAYS = 56;

export type MakingNote =
  | { kind: "authored"; entry: (typeof board)["making"]["entry"] }
  | { kind: "latest"; repository: GitHubRepository };

/**
 * What the Making pin shows: my authored entry while it's current, else my
 * latest public repository, else nothing (and the pin comes down).
 */
export function makingNote(now: Date, latest: GitHubRepository | null): MakingNote | null {
  const { entry } = board.making;
  const expires = new Date(`${entry.writtenOn}T00:00:00Z`).getTime() + MAKING_CURRENT_DAYS * 86_400_000;
  if (now.getTime() < expires) return { kind: "authored", entry };
  return latest ? { kind: "latest", repository: latest } : null;
}
