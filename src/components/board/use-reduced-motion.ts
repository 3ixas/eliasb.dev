"use client";

import { useSyncExternalStore } from "react";

/*
 * Motion's own useReducedMotion and MotionConfig reducedMotion="user" read the
 * bare "(prefers-reduced-motion)" query. On Linux WebKit (CI) the clipping's
 * fan-out still ran its full spring with reduced motion on, while the CSS
 * rules, written as "(prefers-reduced-motion: reduce)", applied. This reads
 * that explicit form, so Motion and the stylesheet always agree.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Whether the visitor asked for reduced motion; false while rendering on the server. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
