import { createContext } from "react";

/**
 * Whether the closer look being shown replaces another in the margin: the first look of a visit arrives in full, and
 * the ones after it only crossfade in, with their arrival already played (docs/design/DESIGN.md, "Moving between rows").
 * CSS animations are finished by `arriveFinished`; a look that drives its own arrival in script reads this instead.
 */
export const LookArrival = createContext(false);

/** Plays every finite animation inside `look` to its end before it is first painted, leaving the look's own fade to run. */
export function arriveFinished(look: HTMLElement) {
  for (const animation of look.getAnimations({ subtree: true })) {
    const { iterations } = animation.effect?.getComputedTiming() ?? {};
    if ((animation.effect as KeyframeEffect | null)?.target !== look && Number.isFinite(iterations)) animation.finish();
  }
}
