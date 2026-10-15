import type { siteCopy } from "./site-copy";

export type GreetingKey = keyof typeof siteCopy.greeting;

/** Which greeting a local hour (0 to 23) gets: morning from 05:00, afternoon from 12:00, evening from 18:00, late from 22:00 to 04:59. */
export function greetingKey(hour: number): Exclude<GreetingKey, "hello"> {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "late";
}
