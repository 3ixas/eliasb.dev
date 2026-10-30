"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps the to-scale bars so they shrink to their share once, as they scroll into view (DESIGN.md, "Motion on
 * long-form pages"). The server draws them finished. A page that arrives with them already in view, a visitor who
 * prefers reduced motion and a browser without script all see them drawn: only bars that start below the fold are
 * set long (`data-armed`) and released when 40% of them is on screen, once.
 */
export function ShrinkOnView({ className, children }: { className?: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = box.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.setAttribute("data-armed", "");
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.removeAttribute("data-armed");
        watcher.disconnect();
      },
      { threshold: 0.4 },
    );
    watcher.observe(element);
    return () => watcher.disconnect();
  }, []);

  return (
    <div ref={box} className={className}>
      {children}
    </div>
  );
}
