/*
 * How an inline closer look folds and comes into view (docs/design/DESIGN.md, "Inline"). A fold lasts as long as the look is
 * tall, so a small look does not drag and a tall one is not abrupt; the slot's CSS reads the length from `--fold-ms`, and
 * the controller unmounts the look once that long has passed.
 */

/** The shortest and longest a fold lasts, and what each pixel of the look's height adds to the base. */
const BASE_MS = 180;
const PER_PX = 0.35;
const MIN_MS = 220;
const MAX_MS = 420;
/** A look that is mostly below the screen is brought up until its bottom edge is this far above the screen's. */
const BOTTOM_GAP = 16;
/** How long that scroll takes. */
export const REVEAL_MS = 320;

/** The fold's length for a look `height` px tall. */
export const foldMs = (height: number) => Math.min(MAX_MS, Math.max(MIN_MS, Math.round(BASE_MS + height * PER_PX)));

const inner = (slot: HTMLElement) => slot.querySelector<HTMLElement>(".qi-inline__in");

/**
 * Writes the length of `slot`'s fold from the look inside it and returns it. A look that has just mounted is measured with
 * the slot held shut, so reading its height does not start the opening before its length is known.
 */
export function setFold(slot: HTMLElement, shut: boolean) {
  const look = inner(slot);
  if (shut) slot.style.gridTemplateRows = "0fr";
  const height = look?.scrollHeight ?? 0;
  const ms = foldMs(height);
  slot.style.setProperty("--fold-ms", `${ms}ms`);
  if (shut) slot.style.removeProperty("grid-template-rows");
  return { ms, height };
}

/**
 * How far to scroll so a look just opened under `trigger` is in view, or 0 when at least half of it already is. The look
 * is `height` tall once open and starts at the slot's top. The scroll never takes the trigger's row off the top of the
 * screen.
 */
export function revealDistance(trigger: HTMLElement, slot: HTMLElement, height: number) {
  const viewport = window.innerHeight;
  const below = slot.getBoundingClientRect().top + height - viewport;
  if (below <= height / 2) return 0;
  const room = trigger.getBoundingClientRect().top;
  return Math.max(0, Math.min(below + BOTTOM_GAP, room));
}
