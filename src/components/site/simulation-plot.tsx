"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SIM, simulate, type Simulation } from "@/components/site/simulation-model";

/**
 * Paints a run's walks on the canvas at its drawn size and the screen's pixel density, in the canvas's own text colour
 * (the panel's ink, or the text colour in forced colours): the walks sit back, faint and thin, and the featured three
 * stand out over them (#457).
 */
function paint(canvas: HTMLCanvasElement, run: Simulation) {
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  context.strokeStyle = getComputedStyle(canvas).color;
  context.lineJoin = "round";
  const trace = (walk: readonly number[]) => {
    context.beginPath();
    walk.forEach((at, step) => context.lineTo((step / SIM.steps) * width, (at / SIM.height) * height));
    context.stroke();
  };
  const featured = new Set(run.featured);
  // The more walks, the fainter each, so a thousand read as a cloud rather than a block.
  context.globalAlpha = Math.min(0.3, 4 / Math.sqrt(run.walks.length) / 2);
  context.lineWidth = 1;
  run.walks.forEach((walk, index) => featured.has(index) || trace(walk));
  context.globalAlpha = 1;
  context.lineWidth = 1.75;
  for (const index of run.featured) trace(run.walks[index]);
}

/**
 * The simulation's plot. The server draws the axes, the histogram and the price line (`children`) for the default run;
 * the walks are worked out and painted here, on a canvas, when the plot comes into view, so they never delay first
 * paint (R-36) or weigh down the page's HTML. A plot that starts below the fold arrives in order: the walks draw from
 * the left over 1.1 s, the histogram grows, the price line appears last (DESIGN.md "Motion"). One already in view, or
 * for a visitor who prefers reduced motion, is drawn finished. Styles are in work.css.
 */
export function SimulationPlot({ children }: { children: ReactNode }) {
  const plot = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [run, setRun] = useState<Simulation>();

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
        setRun(simulate());
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

  // Paint the run, and again whenever the plot changes size, so the walks stay sharp at any width.
  useEffect(() => {
    const surface = canvas.current;
    if (!surface || !run) return;
    paint(surface, run);
    const sizes = new ResizeObserver(() => paint(surface, run));
    sizes.observe(surface);
    return () => sizes.disconnect();
  }, [run]);

  return (
    <div ref={plot} className="sim__plot" data-paths={SIM.paths} data-seed={SIM.seed} data-drawn={run ? run.walks.length : undefined}>
      <canvas ref={canvas} className="sim__paths" aria-hidden="true" />
      {children}
    </div>
  );
}
