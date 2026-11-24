"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SIM, simulate, simulation, type Simulation } from "@/components/site/simulation-model";
import { simulationCopy as copy } from "@/content/stretch/simulation-copy";

/** A run of a thousand walks that takes longer than this to work out falls back to a hundred (#457). */
const SLOW_MS = 300;
const grouped = new Intl.NumberFormat("en-GB");

/** How many walks one dot stands for: one, until a thousand would crowd a band, then ten (as Isotype counts in units). */
const perDot = (walks: number) => (walks >= 1000 ? 10 : 1);

/**
 * A band's dots: one per `per` walks, rounded up so a band with any walks shows one. Each dot lands with the last walk
 * it stands for, so the band fills as its walks arrive.
 */
const dotsOf = (members: readonly number[], per: number) =>
  Array.from({ length: Math.ceil(members.length / per) }, (_, dot) => members[Math.min(members.length - 1, (dot + 1) * per - 1)]);

/**
 * Paints a run's walks on the canvas in its own text colour (the panel's ink, or the text colour in forced colours): the
 * walks sit back, faint and thin, and once all have arrived the featured three stand out over them. With `from` above
 * zero it adds only the walks from `from` to `to` over what is there, so an arrival draws each walk once, however many.
 */
function paint(canvas: HTMLCanvasElement, run: Simulation, to: number, from = 0) {
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  const ratio = window.devicePixelRatio || 1;
  if (from === 0) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (from === 0) {
    context.clearRect(0, 0, width, height);
    // Today's starting level: a crisp dashed baseline across the plot so drift reads at rest (R-53).
    context.save();
    context.strokeStyle = getComputedStyle(canvas).color;
    context.globalAlpha = 0.28;
    context.lineWidth = 1;
    context.setLineDash([4, 4]);
    context.beginPath();
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);
    context.stroke();
    context.restore();
  }
  context.strokeStyle = getComputedStyle(canvas).color;
  context.lineJoin = "round";
  const trace = (walk: readonly number[]) => {
    context.beginPath();
    walk.forEach((at, step) => context.lineTo((step / SIM.steps) * width, (at / SIM.height) * height));
    context.stroke();
  };
  const done = to >= run.walks.length;
  const featured = new Set(done ? run.featured : []);
  // Keep background walks legible at rest on #00965e while scaling opacity down so 1,000 walks read as an airy cloud (R-53).
  context.globalAlpha = Math.min(0.56, Math.max(0.1, 3.2 / Math.sqrt(run.walks.length)));
  context.lineWidth = run.walks.length <= 10 ? 1.35 : run.walks.length <= 100 ? 1.1 : 1;
  for (let index = from; index < to; index += 1) if (!featured.has(index)) trace(run.walks[index]);
  if (!done) return;
  context.globalAlpha = 1;
  context.lineWidth = 2.2;
  for (const index of run.featured) trace(run.walks[index]);
}

type Phase = "waiting" | "arriving" | "settled";

/**
 * The simulation's plot and its controls (#457). The default run (a hundred walks from one seed) is drawn on the server:
 * the axes, a dot per endpoint in its band, and "One price" at their mean; the walks are painted on a canvas when the
 * plot comes into view, so they never delay first paint (R-36). A plot that starts below the fold arrives: the walks one
 * after another over 1.6 s, each endpoint landing as a dot, and the price at the mean of the walks so far, settling as
 * they add up. "Run again" draws a new set from a new seed, and Paths sets how many (10, 100 or 1,000), each arriving
 * the same way; nothing moves otherwise. A screen reader is told each new run's paths and price. With reduced motion
 * every run is drawn finished. Styles are in work.css.
 */
export function SimulationPlot() {
  const plot = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const arrived = useRef(0);
  const asked = useRef(false);
  const [run, setRun] = useState<Simulation>(simulation);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [said, setSaid] = useState("");

  const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The first sight: arm a plot below the fold, and arrive (or draw it finished) when it comes into view.
  useEffect(() => {
    const element = plot.current;
    if (!element) return;
    const below = element.getBoundingClientRect().top >= window.innerHeight * 0.85;
    const arriving = below && !still();
    if (arriving) element.setAttribute("data-armed", "");
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        watcher.disconnect();
        setPhase(arriving ? "arriving" : "settled");
      },
      { rootMargin: `0px 0px -${Math.round(window.innerHeight * 0.15)}px 0px` },
    );
    watcher.observe(element);
    return () => watcher.disconnect();
  }, []);

  // Play the current run: arrive walk by walk, or draw it finished. A new run, or a control pressed mid-arrival, cancels
  // this one through the cleanup, and the next starts from an empty plot.
  useEffect(() => {
    const element = plot.current;
    const surface = canvas.current;
    if (!element || !surface || phase === "waiting") return;
    const price = element.querySelector<HTMLElement>(".sim__price");
    if (phase === "settled") {
      arrived.current = run.walks.length;
      paint(surface, run, arrived.current);
      price?.style.setProperty("--at", String(run.mean));
      element.removeAttribute("data-armed");
      element.setAttribute("data-arrived", String(arrived.current));
      if (asked.current) setSaid(copy.settled(grouped.format(run.walks.length), run.change, run.spread));
      return;
    }
    element.setAttribute("data-armed", "");
    price?.removeAttribute("data-pricing");
    const dots = new Map([...element.querySelectorAll<HTMLElement>(".sim__bin i[data-walk]")].map((dot) => [Number(dot.dataset.walk), dot]));
    // Pressing the step already chosen draws the same run again, and React keeps its dots: clear what landed before.
    for (const dot of dots.values()) dot.removeAttribute("data-landed");
    const started = performance.now();
    let sum = 0;
    let frame = 0;
    arrived.current = 0;
    paint(surface, run, 0);
    const step = (now: number) => {
      const from = arrived.current;
      const due = Math.min(run.walks.length, Math.ceil(((now - started) / SIM.arrival) * run.walks.length));
      while (arrived.current < due) {
        sum += run.ends[arrived.current];
        dots.get(arrived.current)?.setAttribute("data-landed", "");
        arrived.current += 1;
      }
      if (arrived.current > 0) {
        price?.style.setProperty("--at", String(sum / arrived.current / SIM.height));
        price?.setAttribute("data-pricing", "");
      }
      element.setAttribute("data-arrived", String(arrived.current));
      if (arrived.current < run.walks.length) {
        paint(surface, run, arrived.current, from);
        frame = requestAnimationFrame(step);
      } else {
        setPhase("settled");
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [run, phase]);

  // Repaint whenever the plot changes size, so the walks stay sharp at any width, mid-arrival too.
  useEffect(() => {
    const surface = canvas.current;
    if (!surface || phase === "waiting") return;
    const sizes = new ResizeObserver(() => paint(surface, run, arrived.current));
    sizes.observe(surface);
    return () => sizes.disconnect();
  }, [run, phase]);

  /** A new run, from a new seed or with a new count. A thousand that takes too long to work out falls back to a hundred. */
  const draw = (seed: number, paths: number) => {
    asked.current = true;
    const began = performance.now();
    let next = simulate(seed, paths);
    if (paths > SIM.paths && performance.now() - began > SLOW_MS) next = simulate(seed, SIM.paths);
    arrived.current = 0;
    setRun(next);
    setPhase(still() ? "settled" : "arriving");
  };
  const fresh = () => Math.floor(Math.random() * 2 ** 31);
  const per = perDot(run.walks.length);

  return (
    <>
      <div ref={plot} className="sim__plot" data-paths={run.walks.length} data-seed={run.seed} data-drawn={phase === "settled" ? run.walks.length : undefined}>
        <canvas ref={canvas} className="sim__paths" aria-hidden="true" />
        <div className="sim__hist" data-per={per} style={{ "--most": Math.ceil(Math.max(...run.bins) / per) } as CSSProperties} aria-hidden="true">
          {run.bins.map((count, band) => (
            <span key={band} className="sim__bin" data-count={count} data-mean={band === run.meanBin ? "" : undefined}>
              {dotsOf(run.members[band], per).map((walk) => (
                <i key={`${run.seed}-${run.walks.length}-${walk}`} data-walk={walk} />
              ))}
            </span>
          ))}
        </div>
        <span className="sim__price" style={{ "--at": run.mean } as CSSProperties}>
          <b>{copy.price}</b>
        </span>
        <span className="sim__x sim__x--start" aria-hidden="true">
          {copy.start}
        </span>
        <span className="sim__x sim__x--end" aria-hidden="true">
          {copy.end}
        </span>
      </div>
      <div className="sim__controls">
        <button type="button" className="pill pill--outline" onClick={() => draw(fresh(), run.walks.length)}>
          {copy.again}
        </button>
        <div className="sim__steps" role="group" aria-labelledby="sim-paths">
          <span id="sim-paths">{copy.paths}</span>
          {SIM.counts.map((count) => (
            <button key={count} type="button" className="sim__step" aria-pressed={run.walks.length === count} onClick={() => draw(run.seed, count)}>
              {grouped.format(count)}
            </button>
          ))}
        </div>
        <div className="sim__spread">
          <span className="sim__spread-label">{copy.spread}</span>
          <span className="sim__spread-value">{copy.formatSpread(run.spread)}</span>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
    </>
  );
}
