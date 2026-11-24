"use client";

import { useEffect, useState } from "react";

/** How far down the window a section's top may be and still count as the one in view: a third of the way. */
const READING_LINE = 1 / 3;

/**
 * The id of the last section whose top has passed the reading line, or `ids[0]` (when `fallbackFirst`) / `null` above
 * the first. At the foot of the page the last section counts as in view, since a short one never reaches the line.
 */
function sectionInView(ids: readonly string[], fallbackFirst = false): string | null {
  const atFoot = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atFoot) return ids[ids.length - 1] ?? null;
  const line = window.innerHeight * READING_LINE;
  let current: string | null = fallbackFirst ? (ids[0] ?? null) : null;
  for (const id of ids) {
    const top = document.getElementById(id)?.getBoundingClientRect().top;
    if (top !== undefined && top <= line) current = id;
  }
  return current;
}

/** Tracks which section id is currently in view across scroll, resize, and hash navigation; stays `null` on SSR. */
export function useSectionInView(ids: readonly string[], track = true, fallbackFirst = false) {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    if (!track || ids.length === 0) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCurrent(sectionInView(ids, fallbackFirst)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("hashchange", update);
    };
  }, [ids, track, fallbackFirst]);
  return current;
}
