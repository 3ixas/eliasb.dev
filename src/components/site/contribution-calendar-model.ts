import type { ActivityDay } from "@/integrations/types";
import { MONTH_NAMES, SHORT_MONTH_NAMES } from "../../integrations/pin-rules.ts";

export const CONTRIBUTION_WINDOW_DAYS = 365;
// Explicit English names keep server and browser output identical during hydration.
// Their Intl locale data can disagree, for example "Sept" versus "Sep".
export const CONTRIBUTION_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export type ContributionCalendarModel = {
  days: ActivityDay[];
  rows: (ActivityDay | null)[][];
  startWeekday: number;
  weekCount: number;
  monthLabels: { column: number; label: string; row: 0; span: number }[];
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
  // One label per month, at the week the month starts, all on one row. A label with no room before the next one is
  // left out, as GitHub's own graph does for the partial month the window opens on.
  const starts: { column: number; label: string }[] = [];
  let previousMonth = "";
  days.forEach((day, index) => {
    const date = dateFromIsoDay(day.date);
    const month = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (month === previousMonth) return;
    previousMonth = month;
    starts.push({ column: Math.floor((startWeekday + index) / 7), label: SHORT_MONTH_NAMES[date.getUTCMonth()] });
  });

  const placed = starts.map(({ column, label }) => {
    const span = Math.min(weekCount, Math.max(2, Math.ceil((label.length * 6) / 16)));
    return { column: Math.min(column, weekCount - span), label, row: 0 as const, span };
  });
  const monthLabels = placed.filter(({ column, span }, index) => column + span <= (placed[index + 1]?.column ?? weekCount));

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

function formatContributionTag({ date, count }: ActivityDay, format: "short" | "long") {
  const day = dateFromIsoDay(date);
  const weekday = CONTRIBUTION_WEEKDAYS[day.getUTCDay()];
  const when = format === "short"
    ? `${weekday.slice(0, 3)} ${day.getUTCDate()} ${SHORT_MONTH_NAMES[day.getUTCMonth()]}`
    : `${weekday} ${day.getUTCDate()} ${MONTH_NAMES[day.getUTCMonth()]}`;
  return `${count} ${count === 1 ? "contribution" : "contributions"} on ${when}`;
}

/** A day's pencilled tag: "12 contributions on Thu 15 Jan", or "0 contributions on Thu 15 Jan". */
export function contributionTag(day: ActivityDay) {
  return formatContributionTag(day, "short");
}

/** A day's spoken label for assistive technology: "12 contributions on Thursday 15 January". */
export function contributionAccessibleTag(day: ActivityDay) {
  return formatContributionTag(day, "long");
}

/** GitHub's five levels, from no contributions to busy. */
export function contributionLevel(count: number) {
  return count >= 4 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0;
}
