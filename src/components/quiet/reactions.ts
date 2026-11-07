/**
 * Reactions that finish (docs/design/DESIGN.md, "Reactions that aren't closer looks"): a row's mini pass and calendar
 * tile, the employer's pass and the letters of "products of my own." start when the pointer arrives at them and are
 * not held by it staying, so leaving never cuts one short. CSS plays the reaction while `data-reacting` is on the
 * element; this sets it on arrival and removes it once the animations inside have finished.
 */
const REACTS = ".qi-row, .qi-bnp, .qi-opening__tail";
const FINE = "(hover: hover) and (prefers-reduced-motion: no-preference)";

export function startReaction(event: { target: EventTarget | null; relatedTarget: EventTarget | null; pointerType: string }) {
  if (event.pointerType === "touch" || !window.matchMedia(FINE).matches) return;
  const element = (event.target as Element).closest(REACTS);
  // Arriving from inside the same element is not arriving; one already playing finishes before another begins.
  if (!element || element.hasAttribute("data-reacting") || element.contains(event.relatedTarget as Node | null)) return;
  element.setAttribute("data-reacting", "");
  // Reading the animations flushes style, so those the attribute started are listed.
  const playing = element.getAnimations({ subtree: true }).filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().iterations));
  Promise.allSettled(playing.map((animation) => animation.finished)).then(() => element.removeAttribute("data-reacting"));
}
