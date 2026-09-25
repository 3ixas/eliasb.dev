import type { ActivityDay } from "@/integrations/types";

export const CONTRIBUTION_WINDOW_DAYS = 365;
export const CONTRIBUTION_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export type ContributionCalendarModel = {
  days: ActivityDay[];
  rows: (ActivityDay | null)[][];
  startWeekday: number;
  weekCount: number;
  monthLabels: { column: number; label: string }[];
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
    labels.push(new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(date));
    monthsByColumn.set(column, labels);
  });

  return {
    days,
    rows,
    startWeekday,
    weekCount,
    monthLabels: [...monthsByColumn].map(([column, labels]) => ({ column, label: labels.join(" · ") })),
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

export function formatContributionDate(value: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  }).format(dateFromIsoDay(value));
}
