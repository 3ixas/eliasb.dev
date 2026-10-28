"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
 * The live dots on the homepage take turns. Each sets `data-rung`, which starts its ring's three plays in CSS,
 * the first time it is on screen. Only one ring plays at once (the page's one self-running motion): a dot that
 * arrives while another plays waits for it to finish (the one nearest the middle of the window goes first), and a
 * dot that leaves the screen gives up its turn. A dot that has finished is let go, so scrolling away and back never
 * starts it again. With reduced motion the CSS plays nothing, so every dot is marked at once and the still dot is
 * all there is.
 */
const visible = new Set<HTMLElement>();
const waiting: HTMLElement[] = [];
let playing: HTMLElement | null = null;
let observer: IntersectionObserver | null = null;

function forget(dot: HTMLElement) {
  visible.delete(dot);
  const at = waiting.indexOf(dot);
  if (at >= 0) waiting.splice(at, 1);
}

/** How far a dot is from the middle of the window: the one the reader is looking at goes first. */
const offCentre = (dot: HTMLElement) => {
  const { top, bottom } = dot.getBoundingClientRect();
  return Math.abs((top + bottom) / 2 - window.innerHeight / 2);
};

function advance() {
  if (playing) return;
  const next = waiting.filter((dot) => visible.has(dot)).sort((a, b) => offCentre(a) - offCentre(b))[0];
  if (!next) return;
  forget(next);
  playing = next;
  next.setAttribute("data-rung", "");
  // Ending or being cancelled hands the turn on, once, and only if the dot still holds it.
  const finished = (event: Event) => {
    next.removeEventListener("animationend", finished);
    next.removeEventListener("animationcancel", finished);
    if (playing !== next) return;
    if (event.type === "animationend") observer?.unobserve(next);
    playing = null;
    advance();
  };
  next.addEventListener("animationend", finished);
  next.addEventListener("animationcancel", finished);
}

function sighted(entries: IntersectionObserverEntry[]) {
  for (const { target, isIntersecting } of entries) {
    const dot = target as HTMLElement;
    if (isIntersecting) {
      visible.add(dot);
      if (dot !== playing && !waiting.includes(dot)) waiting.push(dot);
    } else {
      forget(dot);
      // Leaving mid-ring stops it, so it plays whole the next time it is seen.
      if (playing === dot) {
        dot.removeAttribute("data-rung");
        playing = null;
      }
    }
  }
  advance();
}

/** The cobalt dot of a live source. */
export function NowMark() {
  const mark = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = mark.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.setAttribute("data-rung", "");
      return;
    }
    observer ??= new IntersectionObserver(sighted);
    observer.observe(element);
    return () => {
      observer?.unobserve(element);
      forget(element);
      if (playing === element) {
        // A dot that is going away stops its ring and gives up its turn; its listener ignores what comes after.
        element.removeAttribute("data-rung");
        playing = null;
        advance();
      }
    };
  }, []);
  return <span ref={mark} className="stretch-now" data-now-mark aria-hidden="true" />;
}

/** A source mark: for live data the dot, then what the data is ("Live from Goodreads", "From Goodreads, as of 12 Sept"). */
export function SourceMark({ live, children }: { live: boolean; children: ReactNode }) {
  return (
    <span className="qi-source">
      {live && <NowMark />}
      {children}
    </span>
  );
}
