"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { LookArrival } from "@/components/quiet/look-arrival";

const COUNT_MS = 900;

/**
 * A figure that counts from `from` to `to` once: when its closer look arrives, or with `whenSeen`, the first time it
 * is on screen. The server (and a visitor who prefers reduced motion) get the finished text: the counting only
 * rewrites the text node, never the layout. A look that replaces another in the margin arrives finished, so it does not count. `format` writes each step, and should be one stable function.
 */
export function CountUp({ from, to, prefix = "", suffix = "", format = String, whenSeen = false }: { from: number; to: number; prefix?: string; suffix?: string; format?: (value: number) => string; whenSeen?: boolean }) {
  const text = useRef<HTMLSpanElement>(null);
  /** Read once: a look that is already counting is not stopped because the pointer came back to it. */
  const [arrivesFinished] = useState(useContext(LookArrival));
  useEffect(() => {
    const element = text.current;
    if (!element || arrivesFinished || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const count = () => {
      const started = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - started) / COUNT_MS, 1);
        const eased = 1 - (1 - progress) ** 3;
        element.textContent = `${prefix}${format(Math.round(from + (to - from) * eased))}${suffix}`;
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      element.textContent = `${prefix}${format(from)}${suffix}`;
      frame = requestAnimationFrame(step);
    };
    if (!whenSeen) {
      count();
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      count();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [from, to, prefix, suffix, format, whenSeen, arrivesFinished]);
  return <span ref={text}>{`${prefix}${format(to)}${suffix}`}</span>;
}
