import { spring } from "./spring.ts";

/**
 * The springs the Signature motions play (GLOSSARY.md), each specified as
 * `spring(bounce, duration)` so a motion's feel is one pair of numbers
 * (#199). `scripts/verify-springs.mjs` checks `spring` against Motion's.
 */

/** Each spring's `[bounce, visualDuration]`, so `scripts/verify-springs.mjs` checks the pairs actually played. */
export const signatureSpringPairs = { passLean: [0.4, 0.7], tagSwing: [0.4, 0.6], nameFill: [0, 0.7] } as const;

/** The employer Staff pass leaning away from the pointer and settling. */
export const passLean = spring(...signatureSpringPairs.passLean);

/** The 404's lost-property tag swinging in on its string and settling (#217). */
export const tagSwing = spring(...signatureSpringPairs.tagSwing);

/** "Elias" in the footer filling with cobalt from the baseline up, and draining again (#216). It never overshoots: a fill past full has no meaning. */
export const nameFill = spring(...signatureSpringPairs.nameFill);
