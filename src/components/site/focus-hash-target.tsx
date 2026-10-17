"use client";

import { useEffect } from "react";

/** Frames to keep trying: the router changes the URL and mounts the target a little after the click. */
const FRAMES = 60;

/**
 * Sends focus to the element a link's `#fragment` names, as a browser does when
 * it follows an in-page link. The router scrolls but does not always focus the
 * target, so a keyboard user would be left where they were. Targets are
 * focusable sections and figures.
 */
export function FocusHashTarget() {
  useEffect(() => {
    let frame = 0;
    // Retry until the named element exists and holds focus, or the frames run out.
    const focusWhenReady = (idNow: () => string, left = FRAMES) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const id = idNow();
        const target = id ? document.getElementById(id) : null;
        if (target && document.activeElement !== target) target.focus({ preventScroll: true });
        if (left > 0 && (!target || document.activeElement !== target)) focusWhenReady(idNow, left - 1);
      });
    };
    const hashOfUrl = () => decodeURIComponent(window.location.hash.slice(1));
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href*='#']");
      if (!link) return;
      const id = decodeURIComponent(new URL(link.href, window.location.href).hash.slice(1));
      focusWhenReady(() => id);
    };

    // Back and Forward change the fragment without a click.
    const onHistory = () => focusWhenReady(hashOfUrl);

    focusWhenReady(hashOfUrl);
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHistory);
    window.addEventListener("popstate", onHistory);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHistory);
      window.removeEventListener("popstate", onHistory);
    };
  }, []);

  return null;
}
