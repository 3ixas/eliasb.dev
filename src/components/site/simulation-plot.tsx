"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SIM, simulation } from "@/components/site/simulation-model";

/**
 * The simulation's plot. The server draws the axes, the histogram and the price line (`children`); the paths are
 * worked out and drawn here, when the plot comes into view, so they never delay first paint (R-36) or weigh down the
 * page's HTML. A plot that starts below the fold arrives in order: the paths draw from the left over 1.1 s, the
 * histogram grows, the price line appears last (DESIGN.md "Motion"). One already in view, or for a visitor who
 * prefers reduced motion, is drawn finished. Styles are in work.css.
 */
export function SimulationPlot({ children }: { children: ReactNode }) {
  const plot = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<readonly string[]>([]);

  useEffect(() => {
    const element = plot.current;
    if (!element) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const below = element.getBoundingClientRect().top >= window.innerHeight * 0.85;
    if (below && !still) element.setAttribute("data-armed", "");
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        watcher.disconnect();
        setPaths(simulation().paths);
        if (element.hasAttribute("data-armed")) {
          element.removeAttribute("data-armed");
          element.setAttribute("data-released", "");
        }
      },
      { rootMargin: `0px 0px -${Math.round(window.innerHeight * 0.15)}px 0px` },
    );
    watcher.observe(element);
    return () => {
      watcher.disconnect();
      element.removeAttribute("data-armed");
    };
  }, []);

  return (
    <div ref={plot} className="sim__plot" data-paths={SIM.paths} data-drawn={paths.length > 0 ? "" : undefined}>
      <svg className="sim__paths" viewBox={`0 0 ${SIM.width} ${SIM.height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      {children}
    </div>
  );
}
