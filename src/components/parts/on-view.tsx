"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

type Arrival = {
  /** Sets the start state. */
  arm: (element: HTMLElement) => void;
  /** Plays the arrival. */
  release: (element: HTMLElement) => void;
  /** Shows the end state at once, when the element goes or the effect re-runs while still armed. */
  finish: (element: HTMLElement) => void;
};

/**
 * Runs `arm` for an element that starts below the fold, then `release` once, the first time it is 15% of the way
 * into the viewport (DESIGN.md "Motion"). Nothing happens for an element already in view, for a visitor who prefers
 * reduced motion, or without script, so they get the finished state the server drew and nothing is held back.
 *
 * The 15% is of the viewport, not of the element: a panel taller than the screen still arrives.
 */
function useFirstSight(ref: RefObject<HTMLElement | null>, arrival: Arrival) {
  const actions = useRef(arrival);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    // Read once: the arrival is fixed for the element's life.
    const { arm, release, finish } = actions.current;
    arm(element);
    let waiting = true;
    let watcher: IntersectionObserver | undefined;
    // The line is 15% of the viewport's height up from its bottom, in pixels: a percentage rootMargin resolves
    // against the root's width, which would put release on a different line from the arming check above.
    const watch = () => {
      watcher?.disconnect();
      watcher = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          stop();
          waiting = false;
          release(element);
        },
        { rootMargin: `0px 0px -${Math.round(window.innerHeight * 0.15)}px 0px` },
      );
      watcher.observe(element);
    };
    const stop = () => {
      watcher?.disconnect();
      window.removeEventListener("resize", watch);
    };
    watch();
    window.addEventListener("resize", watch);
    return () => {
      stop();
      if (waiting) finish(element);
    };
  }, [ref]);
}

const released = (element: HTMLElement) => element.removeAttribute("data-armed");
const lift: Arrival = { arm: (element) => element.setAttribute("data-armed", ""), release: released, finish: released };

/**
 * Wraps a panel or card so it rises 16 px and fades in once (`rise`), or wraps bars to scale so they grow from the
 * left once (`grow`; mark them `.bar` and the after bar `.bar--after`). Styles are in parts.css.
 */
export function OnView({ motion, className, children }: { motion: "rise" | "grow"; className?: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  useFirstSight(box, lift);
  const marker = motion === "rise" ? { "data-rise": "" } : { "data-grow": "" };
  return (
    <div ref={box} className={className} {...marker}>
      {children}
    </div>
  );
}

const COUNT_MS = 1200;
const grouped = new Intl.NumberFormat("en-GB");

/**
 * A display figure that counts to its value once, over 1.2 s, when it comes into view. The server writes the finished
 * figure, and only the text node changes, so nothing moves. Tabular figures (DESIGN.md "Type") keep its width steady.
 */
export function Count({ to, from = 0, prefix = "", suffix = "" }: { to: number; from?: number; prefix?: string; suffix?: string }) {
  const text = useRef<HTMLSpanElement>(null);
  const write = (element: HTMLElement, value: number) => {
    element.textContent = `${prefix}${grouped.format(value)}${suffix}`;
  };
  const frame = useRef(0);
  useFirstSight(text, {
    arm: (element) => write(element, from),
    release: (element) => {
      const started = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - started) / COUNT_MS, 1);
        write(element, Math.round(from + (to - from) * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame.current = requestAnimationFrame(step);
      };
      frame.current = requestAnimationFrame(step);
    },
    finish: (element) => write(element, to),
  });
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return <span ref={text}>{`${prefix}${grouped.format(to)}${suffix}`}</span>;
}
