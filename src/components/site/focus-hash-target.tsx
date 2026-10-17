"use client";

import { useEffect } from "react";

/**
 * Sends focus to the element a link's `#fragment` names, as a browser does when
 * it follows an in-page link. The router moves the URL after the click and
 * scrolls, but does not always focus the target, so a keyboard user would be
 * left where they were. Targets are focusable sections and figures.
 */
export function FocusHashTarget() {
  useEffect(() => {
    const focusTarget = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (target && document.activeElement !== target) target.focus({ preventScroll: true });
    };
    // The URL changes just after the click, so read it two frames later.
    const afterNavigation = () => requestAnimationFrame(() => requestAnimationFrame(focusTarget));
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element).closest("a[href*='#']")) afterNavigation();
    };

    afterNavigation();
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", focusTarget);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", focusTarget);
    };
  }, []);

  return null;
}
