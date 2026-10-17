import { spring } from "./spring.ts";

/**
 * The springs the Signature motions play (GLOSSARY.md), each specified as
 * `spring(bounce, duration)` so a motion's feel is one pair of numbers
 * (#199). `scripts/verify-opening.mjs` checks `spring` against Motion's.
 */

/** The employer Staff pass leaning away from the pointer and settling. */
export const passLean = spring(0.4, 0.7);

/** The 404's lost-property tag swinging in on its string and settling (#217). */
export const tagSwing = spring(0.4, 0.6);
