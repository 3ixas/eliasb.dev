"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SIM, simulate, type Simulation } from "@/components/site/simulation-model";

/**
 * Paints the first `arrived` of a run's walks on the canvas at its drawn size and the screen's pixel density, in the
 * canvas's own text colour (the panel's ink, or the text colour in forced colours): the walks sit back, faint and thin,
 * and once all have arrived the featured three stand out over them.
 */
function paint(canvas: HTMLCanvasElement, run: Simulation, arrived: number) {
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
  const done = arrived >= run.walks.length;
  const featured = new Set(done ? run.featured : []);
  // The more walks, the fainter each, so a thousand read as a cloud rather than a block.
  context.globalAlpha = Math.min(0.3, 4 / Math.sqrt(run.walks.length) / 2);
  context.lineWidth = 1;
  run.walks.slice(0, arrived).forEach((walk, index) => featured.has(index) || trace(walk));
  context.globalAlpha = 1;
  context.lineWidth = 1.75;
  for (const index of featured) trace(run.walks[index]);
}

/**
 * The simulation's plot. The server draws the axes, the endpoints' dots and the price line (`children`) for the default
 * run; the walks are worked out and painted here, on a canvas, when the plot comes into view, so they never delay first
 * paint (R-36) or weigh down the page's HTML. A plot that starts below the fold arrives (DESIGN.md "Motion"): its walks
 * one after another over 1.6 s, each endpoint landing as a dot in its band, and "One price" at the mean of the walks so
 * far, so it wobbles and settles as they add up; the featured three stand out last. One already in view, or for a
 * visitor who prefers reduced motion, is drawn finished. Styles are in work.css.
 */
export function SimulationPlot({ children }: { children: ReactNode }) {
  const plot = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const arrived = useRef(0);
  const [run, setRun] = useState<Simulation>();
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const element = plot.current;
    const surface = canvas.current;
    if (!element || !surface) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const below = element.getBoundingClientRect().top >= window.innerHeight * 0.85;
    if (below && !still) element.setAttribute("data-armed", "");
    const price = element.querySelector<HTMLElement>(".sim__price");
    const dots = new Map([...element.querySelectorAll<HTMLElement>(".sim__bin i[data-walk]")].map((dot) => [Number(dot.dataset.walk), dot]));
    let frame = 0;

    const finish = (current: Simulation) => {
      cancelAnimationFrame(frame);
      arrived.current = current.walks.length;
      paint(surface, current, arrived.current);
      // Settle on the run's own mean (the server wrote the default run's; a new run would differ).
      price?.style.setProperty("--at", String(current.mean));
      element.removeAttribute("data-armed");
      element.setAttribute("data-arrived", String(arrived.current));
      setDrawn(true);
    };

    const arrive = (current: Simulation) => {
      const started = performance.now();
      let sum = 0;
      const step = (now: number) => {
        const due = Math.min(current.walks.length, Math.ceil(((now - started) / SIM.arrival) * current.walks.length));
        while (arrived.current < due) {
          sum += current.ends[arrived.current];
          dots.get(arrived.current)?.setAttribute("data-landed", "");
          arrived.current += 1;
        }
        if (arrived.current > 0) {
          price?.style.setProperty("--at", String(sum / arrived.current / SIM.height));
          price?.setAttribute("data-pricing", "");
        }
        element.setAttribute("data-arrived", String(arrived.current));
        paint(surface, current, arrived.current);
        if (arrived.current < current.walks.length) frame = requestAnimationFrame(step);
        else finish(current);
      };
      frame = requestAnimationFrame(step);
    };

    let current: Simulation | undefined;
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        watcher.disconnect();
        current = simulate();
        setRun(current);
        if (element.hasAttribute("data-armed")) arrive(current);
        else finish(current);
      },
      { rootMargin: `0px 0px -${Math.round(window.innerHeight * 0.15)}px 0px` },
    );
    watcher.observe(element);
    return () => {
      watcher.disconnect();
      cancelAnimationFrame(frame);
      element.removeAttribute("data-armed");
    };
  }, []);

  // Repaint whenever the plot changes size, so the walks stay sharp at any width, mid-arrival too.
  useEffect(() => {
    const surface = canvas.current;
    if (!surface || !run) return;
    const sizes = new ResizeObserver(() => paint(surface, run, arrived.current));
    sizes.observe(surface);
    return () => sizes.disconnect();
  }, [run]);

  return (
    <div ref={plot} className="sim__plot" data-paths={SIM.paths} data-seed={SIM.seed} data-drawn={drawn && run ? run.walks.length : undefined}>
      <canvas ref={canvas} className="sim__paths" aria-hidden="true" />
      {children}
    </div>
  );
}
