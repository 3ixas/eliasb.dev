/*
 * Flowtime's break that follows how long you focused (#464): the case study's working figure under "Count from a fixed
 * point, and ask instead of guessing.", beside its point "The break follows the focus." The rule is Flowtime's own,
 * read from `3ixas/flowtime-focus-timer` on its `main`: `calculateBreakDuration` in `src/hooks/useTimer.ts` (work time
 * ÷ ratio, rounded up to the minute) with `DEFAULT_BREAK_RATIO` from `src/lib/constants.ts`.
 * `scripts/verify-flowtime-break.mjs` pins it to that repository's own cases (`src/lib/breakCalculation.test.ts`).
 */

/** The figure's words (docs/content/redesign-copy.md, "Flowtime"). */
export const flowtimeBreakCopy = {
  slider: "How long you focused",
  flowtime: "Flowtime",
  pomodoro: "A Pomodoro",
  focus: "Focus",
  break: "Break",
  caption: "Flowtime’s break is a fifth of your focus, rounded up to the minute. A Pomodoro is 25 and 5, however the work is going.",
  /** "45 min". */
  minutes: (minutes: number) => `${minutes} min`,
  /** What the slider says as its value: "45 minutes of focus, a 9-minute break". "Eight", "eleven" and "eighteen" take "an". */
  valueText: (focus: number, rest: number) => `${focus} minutes of focus, ${[8, 11, 18].includes(rest) ? "an" : "a"} ${rest}-minute break`,
} as const;

/** Flowtime's default ratio: the break is work time ÷ 5 (`DEFAULT_BREAK_RATIO`). */
export const DEFAULT_BREAK_RATIO = 5;

/** Flowtime's `calculateBreakDuration`: work time ÷ ratio, rounded up to the nearest minute, in seconds. */
export const breakSeconds = (focusSeconds: number, ratio: number = DEFAULT_BREAK_RATIO) => Math.ceil(focusSeconds / ratio / 60) * 60;

/** The break Flowtime gives for whole minutes of focus, in minutes. */
export const breakMinutes = (focusMinutes: number) => breakSeconds(focusMinutes * 60) / 60;

/** A Pomodoro's fixed rounds, in minutes, for comparison. */
export const pomodoro = { focus: 25, rest: 5 } as const;

/** The slider, in whole minutes: a short sitting to an hour and a half, starting well past where a Pomodoro stops. */
export const focusRange = { min: 5, max: 90, start: 45 } as const;
