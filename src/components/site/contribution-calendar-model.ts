import type { ActivityDay } from "@/integrations/types";

export const CONTRIBUTION_WINDOW_DAYS = 365;
// Explicit English names keep server and browser output identical during hydration.
// Their Intl locale data can disagree, for example "Sept" versus "Sep".
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;
const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"] as const;
export const CONTRIBUTION_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export type ContributionCalendarModel = {
  days: ActivityDay[];
  rows: (ActivityDay | null)[][];
  startWeekday: number;
  weekCount: number;
  monthLabels: { column: number; label: string; row: number; span: number }[];
};

function dateFromIsoDay(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function createContributionCalendar(activity: ActivityDay[]): ContributionCalendarModel | null {
  const days = activity.slice(-CONTRIBUTION_WINDOW_DAYS);
  if (!days.length) return null;

  const startWeekday = dateFromIsoDay(days[0].date).getUTCDay();
  const weekCount = Math.ceil((startWeekday + days.length) / 7);
  const columns = Array.from({ length: weekCount * 7 }, () => null as ActivityDay | null);
  days.forEach((day, index) => { columns[startWeekday + index] = day; });

  const rows = CONTRIBUTION_WEEKDAYS.map((_, weekday) =>
    Array.from({ length: weekCount }, (_, week) => columns[week * 7 + weekday]),
  );
  const monthsByColumn = new Map<number, string[]>();
  let previousMonth = "";

  days.forEach((day, index) => {
    const date = dateFromIsoDay(day.date);
    const month = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (month === previousMonth) return;
    previousMonth = month;

    const column = Math.floor((startWeekday + index) / 7);
    const labels = monthsByColumn.get(column) ?? [];
    labels.push(SHORT_MONTH_NAMES[date.getUTCMonth()]);
    monthsByColumn.set(column, labels);
  });

  const occupiedUntilByRow: number[] = [];
  const monthLabels = [...monthsByColumn].map(([column, labels]) => {
    const label = labels.join(" · ");
    const span = Math.min(weekCount, Math.max(2, Math.ceil((label.length * 6) / 16)));
    const visibleColumn = Math.min(column, weekCount - span);
    let row = occupiedUntilByRow.findIndex((occupiedUntil) => visibleColumn >= occupiedUntil);

    if (row === -1) row = occupiedUntilByRow.length;
    occupiedUntilByRow[row] = visibleColumn + span;

    return { column: visibleColumn, label, row, span };
  });

  return {
    days,
    rows,
    startWeekday,
    weekCount,
    monthLabels,
  };
}

export function moveContributionCalendarIndex(
  calendar: ContributionCalendarModel,
  index: number,
  key: string,
) {
  const week = Math.floor((calendar.startWeekday + index) / 7);
  const weekStart = week * 7 - calendar.startWeekday;
  const moves: Record<string, number> = {
    ArrowLeft: index - 7,
    ArrowRight: index + 7,
    ArrowUp: index - 1,
    ArrowDown: index + 1,
    Home: Math.max(0, weekStart),
    End: Math.min(calendar.days.length - 1, weekStart + 6),
  };

  if (!(key in moves)) return null;
  return Math.max(0, Math.min(calendar.days.length - 1, moves[key]));
}

type ContributionDateOptions = {
  day?: "numeric";
  month?: "short" | "long";
  year?: "numeric";
  weekday?: "short" | "long";
};

export function formatContributionDate(value: string, options: ContributionDateOptions = {}) {
  const date = dateFromIsoDay(value);
  const month = (options.month === "short" ? SHORT_MONTH_NAMES : MONTH_NAMES)[date.getUTCMonth()];
  const day = `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
  if (!options.weekday) return day;
  const weekday = CONTRIBUTION_WEEKDAYS[date.getUTCDay()];
  return `${options.weekday === "short" ? weekday.slice(0, 3) : weekday}, ${day}`;
}

/** The four-week window the busiest stretch covers. */
export const BUSIEST_STRETCH_WEEKS = 4;

/**
 * The four consecutive weeks (columns) with the most contributions, and where
 * in the year they fall: "mid-January" by the window's middle day. A tie goes
 * to the most recent stretch. Null when there's nothing to circle.
 */
export function busiestStretch(calendar: ContributionCalendarModel) {
  const weekly = Array.from({ length: calendar.weekCount }, (_, week) =>
    calendar.rows.reduce((total, row) => total + (row[week]?.count ?? 0), 0),
  );
  if (calendar.weekCount < BUSIEST_STRETCH_WEEKS) return null;

  let best = { column: 0, total: -1 };
  for (let column = 0; column + BUSIEST_STRETCH_WEEKS <= calendar.weekCount; column += 1) {
    const total = weekly.slice(column, column + BUSIEST_STRETCH_WEEKS).reduce((sum, count) => sum + count, 0);
    if (total >= best.total) best = { column, total };
  }
  if (best.total <= 0) return null;

  // The window's middle day, clamped to days that exist in the year.
  const middle = Math.min(calendar.days.length - 1, Math.max(0, best.column * 7 + 14 - calendar.startWeekday));
  const date = dateFromIsoDay(calendar.days[middle].date);
  const day = date.getUTCDate();
  const part = day <= 10 ? "early" : day <= 20 ? "mid" : "late";
  return { column: best.column, span: BUSIEST_STRETCH_WEEKS, total: best.total, when: `${part}-${MONTH_NAMES[date.getUTCMonth()]}` };
}

/** A day's pencilled tag: "12 contributions on Thu 15 Jan", or "Nothing on Thu 15 Jan". */
export function contributionTag({ date, count }: ActivityDay) {
  const day = dateFromIsoDay(date);
  const when = `${CONTRIBUTION_WEEKDAYS[day.getUTCDay()].slice(0, 3)} ${day.getUTCDate()} ${SHORT_MONTH_NAMES[day.getUTCMonth()]}`;
  if (count === 0) return `Nothing on ${when}`;
  return `${count} ${count === 1 ? "contribution" : "contributions"} on ${when}`;
}

/** GitHub's five levels, from no contributions to busy. */
export function contributionLevel(count: number) {
  return count >= 4 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0;
}
