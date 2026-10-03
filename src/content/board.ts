import type { FantasyGate, FantasyOutcome, FantasyRecord, FantasyTicket } from "@/integrations/fantasy";
import type { PinKey } from "@/integrations/pin-rules";

/** The Board: the personal section's copy, approved in docs/content/copy/05-board.md. */
export const board = {
  kicker: "02 / Library",
  heading: { lead: "Some of what I’m into", emphasis: "lately." },
  /** Every pin says what it is to a stranger. */
  labels: {
    clipping: "The Weekly Curiosity",
    making: "Now making",
    github: "GitHub · the past year",
    training: "Training this week · via Strava",
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
