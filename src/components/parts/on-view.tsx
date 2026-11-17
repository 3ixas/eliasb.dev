"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

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

/** A figure's characters: its digits, which roll, and the rest, which stay. `lead` marks those the start value does not reach. */
type Glyph = { char: string; digit?: number; from?: number; lead: boolean };

/**
 * "−40%", "230 ms" or "1,234" as glyphs rolling from `from`, or undefined when it is not one number with at most a sign
 * before and a per cent or a short unit after: "Six", "Nov 2025" and "2-minute", a number joined to a word, stay as
 * they are. The start's digits line up with the value's from the right.
 */
function rolling(value: string, from: number): Glyph[] | undefined {
  const match = value.match(/^([−+]?)(\d{1,3}(?:,\d{3})+|\d+)(%| [a-z]{1,3})?$/);
  if (!match) return undefined;
  const [, prefix, number, suffix = ""] = match;
  const start = String(Math.trunc(Math.abs(from)));
  let place = [...number].filter((char) => /\d/.test(char)).length;
  const glyphs = [...number].map((char): Glyph => {
    const reached = place <= start.length;
    if (!/\d/.test(char)) return { char, lead: !reached };
    const digit = Number(char);
    const glyph = { char, digit, from: reached ? Number(start[start.length - place]) : 0, lead: !reached };
    place -= 1;
    return glyph;
  });
  return [...(prefix ? [{ char: prefix, lead: false }] : []), ...glyphs, ...(suffix ? [{ char: suffix, lead: false }] : [])];
}

const DIGITS = [..."0123456789"];

/**
 * A display or evidence figure that rolls to its value once, over 1.2 s, when it comes into view (#456): each digit is
 * a column of 0 to 9 behind a fading window, turned from its start digit to its own, and the digits the start does not
 * reach fade in. Styles are in parts.css. A screen reader reads the value, never the columns; without script, with
 * reduced motion, in view on arrival or in print it is the finished figure. A value that is not one number is as it is.
 */
export function Count({ value, from = 0 }: { value: string; from?: number }) {
  const box = useRef<HTMLSpanElement>(null);
  useFirstSight(box, lift);
  const glyphs = rolling(value, from);
  if (!glyphs) return value;
  return (
    <span ref={box} className="roll">
      <span className="sr-only">{value}</span>
      <span className="roll__face" aria-hidden="true">
        {glyphs.map(({ char, digit, from: start, lead }, index) =>
          digit === undefined ? (
            <span key={index} data-lead={lead ? "" : undefined}>
              {char}
            </span>
          ) : (
            <span key={index} className="roll__digit" data-lead={lead ? "" : undefined} style={{ "--to": digit, "--from": start } as CSSProperties}>
              <span className="roll__strip">
                {DIGITS.map((shown) => (
                  <span key={shown}>{shown}</span>
                ))}
              </span>
            </span>
          ),
        )}
      </span>
    </span>
  );
}
