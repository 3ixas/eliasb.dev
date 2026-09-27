"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type OpeningPhase = "ready" | "typing" | "landing" | "highlight" | "revealing" | "complete";

const BACKGROUND_PAUSE_MS = 420;
const CHARACTER_DELAY_MS = 46;
const COMMA_PAUSE_MS = 280;
const WORD_LANDING_STAGGER_MS = 48;
const WORD_LANDING_SETTLE_MS = 440;
const HIGHLIGHT_MS = 660;
const PAGE_REVEAL_MS = 620;

type MarkerPath = { d: string; strokeWidth: number };
type MarkerMeasure = { viewBox: string; paths: MarkerPath[] };

function measureMarker(headline: HTMLHeadingElement, text: HTMLSpanElement): MarkerMeasure {
  const originalTransform = headline.style.transform;
  headline.style.transform = "none";

  try {
    const headingRect = headline.getBoundingClientRect();
    const fontSize = Number.parseFloat(window.getComputedStyle(headline).fontSize);
    const range = document.createRange();
    range.selectNodeContents(text);

    const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0);
    const lineTolerance = fontSize * 0.18;
    const lines: { top: number; rects: DOMRect[] }[] = [];

    for (const rect of rects) {
      const line = lines.find((candidate) => Math.abs(candidate.top - rect.top) < lineTolerance);
      if (line) line.rects.push(rect);
      else lines.push({ top: rect.top, rects: [rect] });
    }

    const strokeWidth = fontSize * 0.14;
    const amplitude = Math.max(1.2, fontSize * 0.012);
    const offset = fontSize * -0.34;
    const paths = lines.map((line) => {
      const left = Math.min(...line.rects.map((rect) => rect.left)) - headingRect.left;
      const right = Math.max(...line.rects.map((rect) => rect.right)) - headingRect.left;
      const y = Math.max(...line.rects.map((rect) => rect.bottom)) - headingRect.top + offset;
      const width = right - left;
      const midpoint = left + width * 0.5;

      return {
        d: `M ${left.toFixed(2)} ${y.toFixed(2)} C ${(left + width * 0.2).toFixed(2)} ${(y - amplitude).toFixed(2)}, ${(left + width * 0.32).toFixed(2)} ${(y + amplitude).toFixed(2)}, ${midpoint.toFixed(2)} ${(y + amplitude * 0.08).toFixed(2)} C ${(left + width * 0.68).toFixed(2)} ${(y - amplitude * 0.72).toFixed(2)}, ${(left + width * 0.84).toFixed(2)} ${(y + amplitude * 0.78).toFixed(2)}, ${right.toFixed(2)} ${(y + amplitude * 0.06).toFixed(2)}`,
        strokeWidth,
      };
    });

    return { viewBox: `0 0 ${headingRect.width.toFixed(2)} ${headingRect.height.toFixed(2)}`, paths };
  } finally {
    headline.style.transform = originalTransform;
  }
}

export function HomepageSignature({ first, second }: { first: string; second: string }) {
  const statement = `${first} ${second}`;
  const secondWords = useMemo(() => second.split(/\s+/).filter(Boolean), [second]);
  const [visibleFirst, setVisibleFirst] = useState("");
  const [landedWords, setLandedWords] = useState(0);
  const [phase, setPhase] = useState<OpeningPhase>("ready");
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const staticTextRef = useRef<HTMLSpanElement>(null);
  const [marker, setMarker] = useState<MarkerMeasure>({ viewBox: "0 0 0 0", paths: [] });

  useEffect(() => {
    const headline = headlineRef.current;
    const text = staticTextRef.current;
    if (!headline || !text) return;

    let frame = 0;
    let disposed = false;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!disposed) setMarker(measureMarker(headline, text));
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(headline);
    window.addEventListener("resize", measure);
    void document.fonts.ready.then(measure);
    measure();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [statement]);

  useEffect(() => {
    const root = document.documentElement;
    const characters = Array.from(first);
    let timers: number[] = [];
    let cancelled = false;

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers = timers.filter((activeTimer) => activeTimer !== timer);
        if (!cancelled) callback();
      }, delay);
      timers.push(timer);
    };

    const complete = () => {
      timers.forEach(window.clearTimeout);
      timers = [];
      setVisibleFirst(first);
      setLandedWords(secondWords.length);
      setPhase("complete");
      if (root.hasAttribute("data-home-opening")) root.dataset.homeOpening = "complete";
    };

    window.addEventListener("home-opening-finish", complete);

    if (root.dataset.homeOpening !== "running") {
      schedule(complete, 0);
      return () => {
        cancelled = true;
        timers.forEach(window.clearTimeout);
        window.removeEventListener("home-opening-finish", complete);
      };
    }

    const landingDuration = secondWords.length
      ? (secondWords.length - 1) * WORD_LANDING_STAGGER_MS + WORD_LANDING_SETTLE_MS
      : 0;
    const durationMs = BACKGROUND_PAUSE_MS
      + Math.max(0, characters.length - 1) * CHARACTER_DELAY_MS
      + COMMA_PAUSE_MS + landingDuration + HIGHLIGHT_MS + PAGE_REVEAL_MS;
    window.dispatchEvent(new CustomEvent("home-opening-started", { detail: { durationMs } }));

    const type = (index: number) => {
      setVisibleFirst(characters.slice(0, index + 1).join(""));
      if (index + 1 < characters.length) {
        schedule(() => type(index + 1), CHARACTER_DELAY_MS);
        return;
      }

      schedule(landSecondPhrase, COMMA_PAUSE_MS);
    };

    const landSecondPhrase = () => {
      setPhase("landing");
      secondWords.forEach((_, index) => {
        schedule(() => setLandedWords(index + 1), index * WORD_LANDING_STAGGER_MS);
      });
      schedule(() => {
        setPhase("highlight");
        root.dataset.homeOpening = "highlight";
        schedule(() => {
          setPhase("revealing");
          root.dataset.homeOpening = "revealing";
          schedule(() => {
            setPhase("complete");
            root.dataset.homeOpening = "complete";
            window.dispatchEvent(new Event("home-opening-completed"));
          }, PAGE_REVEAL_MS);
        }, HIGHLIGHT_MS);
      }, landingDuration);
    };

    schedule(() => {
      setPhase("typing");
      type(0);
    }, BACKGROUND_PAUSE_MS);

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      window.removeEventListener("home-opening-finish", complete);
    };
  }, [first, second, secondWords]);

  return (
    <h1
      ref={headlineRef}
      className={`signature homepage-signature is-${phase}`}
      id="homepage-headline"
      aria-label={statement}
    >
      <svg
        className="homepage-signature-marker"
        viewBox={marker.viewBox}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {marker.paths.map((path, index) => (
          <path key={index} d={path.d} pathLength={1} strokeWidth={path.strokeWidth} />
        ))}
      </svg>
      <span ref={staticTextRef} className="homepage-signature-static" aria-hidden="true">{statement}</span>
      <span className="homepage-signature-stage" aria-hidden="true">
        <span className="homepage-signature-first">
          {visibleFirst}
          {phase === "typing" && <span className="homepage-signature-caret" aria-hidden="true">│</span>}
        </span>
        {secondWords.length > 0 && (
          <>
            {" "}
            <span className="homepage-signature-second">
              {secondWords.map((word, index) => (
                <span key={`${index}-${word}`}>
                  {index > 0 && " "}
                  <span className={`homepage-signature-word${index < landedWords ? " is-landed" : ""}`}>
                    {word}
                  </span>
                </span>
              ))}
            </span>
          </>
        )}
      </span>
    </h1>
  );
}
