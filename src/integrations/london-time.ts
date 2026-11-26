/* London's calendar, for server and client alike. This module has no imports, so it adds nothing else to a client bundle. */

const london = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});

/** The time in London written as if it were UTC, so its calendar day is London's. */
function londonWallClock(instant: number) {
  const part = (type: string) => Number(london.formatToParts(instant).find((entry) => entry.type === type)?.value);
  return Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
}

/** The day of the week in London, counting from Monday (0) to Sunday (6). */
export function londonWeekday(now = new Date()) {
  return (new Date(londonWallClock(now.getTime())).getUTCDay() + 6) % 7;
}
