import type { SignalState } from "./types";

/*
 * Pin rules for the Board, kept beside the integrations so every pin follows
 * them and they can be checked with plain fixture data (verify:signals).
 *
 * - A pin with nothing current is removed.
 * - A pin showing saved data, because its live source could not be reached,
 *   goes stale once that data is older than the pin's natural rhythm. It is
 *   then sun-faded with an "as of" date.
 * - Authored and curated pins never go stale.
 */

export type PinKey =
  | "clipping"
  | "making"
  | "github"
  | "training"
  | "reading"
  | "film";

/**
 * Days before a pin's saved data counts as stale (approved by Elias,
 * 2 October 2026). null means the pin never goes stale: it is authored, live,
 * or already has its own windows and fallbacks. Training became an authored
 * plan on 3 October 2026, when Strava's API went subscriber-only.
 */
export const staleAfterDays: Record<PinKey, number | null> = {
  training: null,
  github: 3,
  reading: 60,
  film: 60,
  making: null,
  clipping: null,
};

export type PinSource = {
  state: SignalState;
  /** When the pin's data was fetched from its source. */
  updatedAt: string | null;
};

/** A date for the "as of" note: short to show, long for screen readers. */
export type AsOfDate = { iso: string; short: string; long: string };

export type PinStatus = { kind: "removed" } | { kind: "current" } | { kind: "stale"; asOf: AsOfDate };

const DAY_MS = 86_400_000;

export function pinStatus(key: PinKey, source: PinSource, now: Date): PinStatus {
  if (source.state === "unavailable") return { kind: "removed" };

  const limit = staleAfterDays[key];
  if (limit === null || source.state !== "live" || !source.updatedAt) return { kind: "current" };

  const updated = new Date(source.updatedAt);
  if (Number.isNaN(updated.getTime()) || now.getTime() - updated.getTime() <= limit * DAY_MS) {
    return { kind: "current" };
  }
  return { kind: "stale", asOf: asOfDate(updated) };
}

const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"] as const;
const longMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

// Numeric parts only, so the result is the same in every locale.
const londonDay = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "numeric" });

/** The day in London, written "12 Sept" (and "12 September" for screen readers). */
export function asOfDate(date: Date): AsOfDate {
  const parts = londonDay.formatToParts(date);
  const day = Number(parts.find(({ type }) => type === "day")?.value);
  const month = Number(parts.find(({ type }) => type === "month")?.value) - 1;
  return { iso: date.toISOString(), short: `${day} ${shortMonths[month]}`, long: `${day} ${longMonths[month]}` };
}
