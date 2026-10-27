"use client";

import { useEffect, useRef } from "react";

const COUNT_MS = 900;

/**
 * A figure that counts from `from` to `to` once, when its closer look arrives. The server (and a visitor who
 * prefers reduced motion) get the finished text: the counting only rewrites the text node, never the layout.
 */
export function CountUp({ from, to, prefix = "", suffix = "" }: { from: number; to: number; prefix?: string; suffix?: string }) {
  const text = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = text.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const started = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - started) / COUNT_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      element.textContent = `${prefix}${Math.round(from + (to - from) * eased)}${suffix}`;
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    element.textContent = `${prefix}${from}${suffix}`;
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [from, to, prefix, suffix]);
  return <span ref={text}>{`${prefix}${to}${suffix}`}</span>;
}
