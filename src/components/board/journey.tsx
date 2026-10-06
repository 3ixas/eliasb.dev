"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Pin } from "@/components/board/pin";
import { stringStretches } from "@/components/board/journey-geometry";
import { about, type AboutStop } from "@/content/about";

/**
 * About's journey: five objects, numbered and pinned in order, joined by a red
 * string. The stops are an ordered list, so they read in order with the
 * string hidden; the string and the objects' drawings are decoration. On
 * scroll the string draws itself; with reduced motion it's simply there.
 */
export function Journey() {
  const frame = useRef<HTMLDivElement>(null);
  const [stretches, setStretches] = useState<string[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = () => {
      const box = element.getBoundingClientRect();
      const pins = [...element.querySelectorAll("[data-stop] [data-fixing-mark='pushpin']")].map((pin) => {
        const head = pin.getBoundingClientRect();
        // The pin's head: its centre, a third of the way down the mark.
        return { x: head.left + head.width / 2 - box.left, y: head.top + head.height / 3 - box.top };
      });
      setSize({ width: box.width, height: box.height });
      setStretches(stringStretches(pins));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className="board-journey relative mx-auto w-full max-w-[420px]" data-journey>
      <p aria-hidden="true" className="board-string-note m-0 mb-6 ml-6 w-fit">{about.start}</p>
      {/* role="list" keeps the list's numbers for VoiceOver, which drops them from unstyled lists. */}
      <ol role="list" className="relative z-10 m-0 grid list-none gap-y-10 p-0">
        {about.stops.map((stop, index) => (
          // The tag comes first, so it's read before the object's words; the object is shown above it.
          <li
            key={stop.tag}
            data-stop={index + 1}
            className={`flex w-fit max-w-[220px] flex-col-reverse ${index % 2 ? "justify-self-end" : "justify-self-start"}`}
          >
            <p className="m-0 mt-3 flex items-baseline gap-2">
              <span aria-hidden="true" className="board-string-number">{index + 1}</span>
              <span className="font-mono text-label uppercase text-wall-muted">
                {stop.tag}
                {stop.words.length > 0 && <span className="sr-only">:</span>}
              </span>
            </p>
            <StopObject stop={stop} />
          </li>
        ))}
      </ol>
      {stretches.length > 0 && (
        <svg
          aria-hidden="true"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="pointer-events-none absolute inset-0 z-0 overflow-visible"
        >
          <defs>
            <marker id="journey-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 1 L9 5 L0 9 Z" fill="var(--string-red)" />
            </marker>
          </defs>
          {stretches.map((d, index) => (
            <path
              key={index}
              d={d}
              pathLength={1}
              className="board-string"
              // Each stretch draws in its turn as the journey scrolls by.
              style={{ "--stretch": index } as CSSProperties}
              fill="none"
              stroke="var(--string-red)"
              strokeWidth="2.2"
              strokeLinecap="round"
              markerEnd="url(#journey-arrow)"
            />
          ))}
        </svg>
      )}
    </div>
  );
}

/** Each stop's object, pinned to the wall. Only its words are read out; the drawing is decoration. */
function StopObject({ stop }: { stop: AboutStop }) {
  switch (stop.object) {
    case "essay":
      return (
        <Pinned stock="paper" tilt={-3} className="board-essay h-40 w-32 p-3">
          <span aria-hidden="true" className="block h-0.5 w-3/4 rounded-sm bg-(--essay-rule)" />
          <Words stop={stop} className="mt-2 font-display text-small italic text-(--essay-ink)" />
          <span aria-hidden="true" className="board-essay-lines" />
        </Pinned>
      );
    case "bakery-bag":
      return (
        <Pinned stock="none" tilt={3} className="w-36">
          <BakeryBag />
        </Pinned>
      );
    case "speech-bubble":
      return (
        <Pinned stock="bubble" tilt={-2} className="w-52 px-4 pt-4 pb-3.5">
          <Words stop={stop} className="font-display text-lead leading-snug italic" />
        </Pinned>
      );
    case "sticky-note":
      return (
        <Pinned stock="ochre" tilt={-2} className="board-code-note w-48 px-4 pt-6 pb-4">
          <Words stop={stop} className="font-mono text-small leading-relaxed text-(--code-note-ink)" />
        </Pinned>
      );
    case "lanyard":
      return (
        <div className="w-40 rotate-[3deg]">
          <svg aria-hidden="true" viewBox="0 0 150 90" className="board-lanyard-strap block h-auto w-full">
            <path d="M75 0 C 40 10, 40 60, 72 82 M75 0 C 110 10, 110 60, 78 82" strokeWidth="8" fill="none" />
            <rect x="66" y="76" width="18" height="14" rx="3" className="fill-(--lanyard-clip)" />
          </svg>
          <Pinned stock="paper" tilt={0} className="board-pass -mt-0.5 p-3">
            <span aria-hidden="true" className="block h-2 w-2/5 rounded-sm bg-(--lanyard)" />
            <Words stop={stop} className="mt-3 [&>span:first-child]:font-display [&>span:first-child]:text-body [&>span:last-child]:font-mono [&>span:last-child]:text-[10px] [&>span:last-child]:uppercase [&>span:last-child]:text-muted" />
          </Pinned>
        </div>
      );
  }
}

function Pinned({ stock, tilt, className, children }: { stock: "paper" | "ochre" | "bubble" | "none"; tilt: number; className: string; children: ReactNode }) {
  return (
    <Pin object="object" fixing="pushpin" surface="wall" looseness="loose" tilt={tilt} stock={stock} fixingAt={50} className={className}>
      {children}
    </Pin>
  );
}

/** The words on an object, one line each, read after the stop's tag. */
function Words({ stop, className }: { stop: AboutStop; className: string }) {
  if (!stop.words.length) return null;
  return (
    <p className={`m-0 flex flex-col ${className}`}>
      {stop.words.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </p>
  );
}

/** A plain paper bakery bag with a doughnut: no logo. */
function BakeryBag() {
  return (
    <svg aria-hidden="true" viewBox="0 0 150 170" className="block h-auto w-full drop-shadow-[6px_10px_10px_rgb(40_25_10/0.25)]">
      <path d="M18 30 L132 30 L140 166 L10 166 Z" fill="#E3CFA8" />
      <path d="M18 30 L26 14 L36 26 L46 12 L56 26 L66 12 L76 26 L86 12 L96 26 L106 12 L116 26 L126 14 L132 30 Z" fill="#E3CFA8" />
      <path d="M18 30 L132 30" stroke="#C9B28A" strokeWidth="2" />
      <circle cx="75" cy="96" r="30" fill="#D9A36A" />
      <path d="M47 90 C 55 70, 95 70, 103 90 C 96 84, 86 88, 80 84 C 72 90, 60 82, 47 90 Z" fill="#E7849A" />
      <circle cx="75" cy="96" r="9" fill="#E3CFA8" />
      <g strokeWidth="2.5" strokeLinecap="round">
        <line x1="62" y1="80" x2="66" y2="78" stroke="#F4E27A" />
        <line x1="82" y1="78" x2="86" y2="81" stroke="#8FC1E0" />
        <line x1="92" y1="86" x2="95" y2="89" stroke="#F4E27A" />
      </g>
    </svg>
  );
}
