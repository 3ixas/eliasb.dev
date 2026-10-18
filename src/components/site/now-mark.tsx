"use client";

import { useEffect, useRef } from "react";

/**
 * The cobalt dot in front of "Now making". When its card first comes into view
 * it sets `data-rung`, which starts the ring's three plays in CSS; the ring is
 * then done and the dot rests. The observer lets go after that first sighting,
 * so scrolling away and back never starts it again.
 */
export function NowMark() {
  const mark = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = mark.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      element.setAttribute("data-rung", "");
      observer.disconnect();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <span ref={mark} className="stretch-now" data-now-mark aria-hidden="true" />;
}
