/*
 * The fantasy ticket's state, taken from the NFL calendar rather than
 * Sleeper's own week. Sleeper moves on to the new week before its games
 * start, which is where the old "0.0 vs 0.0" came from.
 *
 * Times are US Eastern wall-clock times, so the windows follow the clocks
 * and cover London games (09:30 Eastern) without a special case. Each NFL
 * week runs from Tuesday 00:30, after Monday night's game, and splits into:
 *
 *   Tue 00:30  last week   last week's final score, until Thursday's kickoff
 *   Thu 20:00  live        Thursday night
 *   Fri 00:30  between     back on Sunday
 *   Sun 09:00  live        Sunday, through Sunday night
 *   Mon 00:30  between     back on Monday night
 *   Mon 19:00  live        Monday night
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** Eighteen NFL weeks and a few more for the playoffs; beyond that it's the off-season. */
export const LAST_FANTASY_WEEK = 22;

export type FantasyPhase = "last-week" | "live" | "between";
export type FantasyGate = "thursday" | "live" | "sunday" | "monday";

/** Where a moment sits in the NFL season. */
export type FantasyMoment = {
  /** The season, by the year it started in. */
  season: number;
  week: number;
  phase: FantasyPhase;
  /** Which of the week's six windows, counting from Tuesday. */
  window: number;
  gate: FantasyGate;
};

const windows: { from: number; phase: FantasyPhase; gate: FantasyGate }[] = [
  { from: 0, phase: "last-week", gate: "thursday" },
  { from: 2 * DAY + 19 * HOUR + 30 * MINUTE, phase: "live", gate: "live" },
  { from: 3 * DAY, phase: "between", gate: "sunday" },
  { from: 5 * DAY + 8 * HOUR + 30 * MINUTE, phase: "live", gate: "live" },
  { from: 6 * DAY, phase: "between", gate: "monday" },
  { from: 6 * DAY + 18 * HOUR + 30 * MINUTE, phase: "live", gate: "live" },
];

const eastern = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

/** The time in New York written as if it were UTC, so wall-clock sums ignore daylight saving. */
function easternWallClock(date: Date) {
  const part = (type: string) => Number(eastern.formatToParts(date).find((entry) => entry.type === type)?.value);
  return Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"));
}

/**
 * Week 1 starts at 00:30 on the Tuesday after Labor Day (September's first
 * Monday), two days before the season opener on the Thursday.
 */
function seasonStart(year: number) {
  const septemberFirst = Date.UTC(year, 8, 1);
  const laborDay = septemberFirst + ((8 - new Date(septemberFirst).getUTCDay()) % 7) * DAY;
  return laborDay + DAY + 30 * MINUTE;
}

/** The season, week, and window a moment falls in, or null in the off-season. */
export function fantasyMoment(now: Date): FantasyMoment | null {
  const wall = easternWallClock(now);
  const year = new Date(wall).getUTCFullYear();
  const season = wall >= seasonStart(year) ? year : year - 1;
  const sinceStart = wall - seasonStart(season);
  const week = Math.floor(sinceStart / WEEK) + 1;
  if (week > LAST_FANTASY_WEEK) return null;

  const intoWeek = sinceStart - (week - 1) * WEEK;
  const window = windows.findLastIndex(({ from }) => intoWeek >= from);
  return { season, week, window, phase: windows[window].phase, gate: windows[window].gate };
}

/** My score and my opponent's for one week. */
export type FantasyScores = { team: number; opponent: number };
export type FantasyRecord = { wins: number; losses: number; ties: number };

/** What Sleeper said for one NFL week, fetched together. */
export type FantasySnapshot = {
  fetchedAt: string;
  season: number;
  week: number;
  teamName: string;
  /** My season record, as Sleeper had it. */
  record: FantasyRecord;
  /** The last regular-season week; playoff weeks don't count towards the record. */
  regularSeasonWeeks: number;
  /** This week's matchup and last week's; null where I had none. */
  thisWeek: FantasyScores | null;
  lastWeek: FantasyScores | null;
};

export type FantasyOutcome = "won" | "lost" | "tied" | "ahead" | "behind" | "level";

/** Everything the ticket stub shows. */
export type FantasyTicket = {
  week: number;
  outcome: FantasyOutcome;
  scores: FantasyScores;
  /** The gap between the scores, to the hundredth of a point. */
  margin: number;
  teamName: string;
  record: FantasyRecord;
  /** The line at the foot; none while last week's result is held over during play. */
  gate: FantasyGate | null;
};

/** A snapshot this old can't stand in for the live score. */
const LIVE_SCORES_FOR = HOUR;

/**
 * The ticket for this moment, or null when there should be no pin: the
 * off-season, a season that's over, or Sleeper data too old to trust.
 */
export function fantasyTicket(snapshot: FantasySnapshot | null, now: Date): FantasyTicket | null {
  const moment = fantasyMoment(now);
  if (!moment || !snapshot || snapshot.season !== moment.season || snapshot.week !== moment.week) return null;
  // No matchup this week: I'm out of the playoffs, or missed them.
  if (!snapshot.thisWeek) return null;

  const fetched = new Date(snapshot.fetchedAt);
  const fetchedIn = fantasyMoment(fetched);
  // Scores only move during play, so a fetch from this window, or a recent one, is still true.
  const current = (fetchedIn?.week === moment.week && fetchedIn.window === moment.window) || now.getTime() - fetched.getTime() <= LIVE_SCORES_FOR;
  const { thisWeek, lastWeek } = snapshot;
  const record = settledRecord(snapshot);

  if (moment.phase !== "last-week") {
    if (!current) return null;
    const scored = thisWeek.team > 0 || thisWeek.opponent > 0;
    if (scored) {
      return {
        week: moment.week,
        outcome: compare(thisWeek, "ahead", "behind", "level"),
        scores: thisWeek,
        margin: fantasyMargin(thisWeek),
        teamName: snapshot.teamName,
        record,
        gate: moment.gate,
      };
    }
  }

  // Last week's final, held over until either side scores this week.
  if (!lastWeek || moment.week < 2) return null;
  return {
    week: moment.week - 1,
    outcome: compare(lastWeek, "won", "lost", "tied"),
    scores: lastWeek,
    margin: fantasyMargin(lastWeek),
    teamName: snapshot.teamName,
    record,
    gate: moment.phase === "last-week" ? moment.gate : null,
  };
}

function compare<T extends FantasyOutcome>({ team, opponent }: FantasyScores, more: T, less: T, same: T) {
  const margin = fantasyMargin({ team, opponent });
  return margin === 0 ? same : team > opponent ? more : less;
}

/** The gap between the scores, to the hundredth of a point Sleeper scores in. */
function fantasyMargin({ team, opponent }: FantasyScores) {
  return Math.round(Math.abs(team - opponent) * 100) / 100;
}

/**
 * The record over finished weeks. Sleeper settles a week's result some hours
 * after Monday night, so until it does, last week's result is added here.
 */
function settledRecord({ record, week, regularSeasonWeeks, lastWeek }: FantasySnapshot): FantasyRecord {
  const finished = Math.min(week - 1, regularSeasonWeeks);
  const counted = record.wins + record.losses + record.ties;
  if (!lastWeek || week - 1 > regularSeasonWeeks || counted !== finished - 1) return record;

  const result = compare(lastWeek, "won", "lost", "tied");
  return {
    wins: record.wins + (result === "won" ? 1 : 0),
    losses: record.losses + (result === "lost" ? 1 : 0),
    ties: record.ties + (result === "tied" ? 1 : 0),
  };
}
