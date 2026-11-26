import { spring } from "./spring.ts";

/**
 * Named springs, each specified as `spring(bounce, duration)` so a motion's
 * feel is one pair of numbers (#199). No surface plays them today (spring.ts);
 * `scripts/verify-springs.mjs` checks them against Motion's.
 */

/** Each spring's `[bounce, visualDuration]`, which `scripts/verify-springs.mjs` checks. */
export const signatureSpringPairs = { passLean: [0.4, 0.7] } as const;

/** Tuned for a Staff pass leaning away from the pointer and settling; the pass plays `--spring` today. */
export const passLean = spring(...signatureSpringPairs.passLean);
