import { siteCopy } from "./site-copy.ts";

export type GreetingKey = keyof typeof siteCopy.greeting;

/** Which greeting a local hour (0 to 23) gets: morning from 05:00, afternoon from 12:00, evening from 17:00, late from 22:00 to 04:59. */
export function greetingKey(hour: number): Exclude<GreetingKey, "hello"> {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "late";
}

/** Saturday and Sunday, from `Date.getDay()` on the visitor's own clock. */
export const isWeekend = (day: number) => day === 0 || day === 6;

/** The words for a greeting: only the afternoon changes with the day. */
export function greetingLine(key: GreetingKey, weekend: boolean): string {
  const line = siteCopy.greeting[key];
  return typeof line === "string" ? line : weekend ? line.weekend : line.weekday;
}

/** Every line the greeting can say, for reserving the width of the longest. */
export const greetingLines = Object.values(siteCopy.greeting).flatMap((line) => (typeof line === "string" ? [line] : Object.values(line)));
