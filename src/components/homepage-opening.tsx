"use client";

import { useEffect, useMemo, useState } from "react";

type OpeningPhase = "ready" | "typing" | "landing" | "highlight" | "revealing" | "complete";

const BACKGROUND_PAUSE_MS = 420;
const CHARACTER_DELAY_MS = 46;
const COMMA_PAUSE_MS = 280;
const WORD_LANDING_STAGGER_MS = 48;
const WORD_LANDING_SETTLE_MS = 440;

function splitAtComma(statement: string) {
  const comma = statement.indexOf(",");
  if (comma < 0) return { first: statement, second: "" };

  return {
    first: statement.slice(0, comma + 1),
    second: statement.slice(comma + 1).trim(),
  };
}

export function HomepageSignature({ statement }: { statement: string }) {
  const { first, second } = splitAtComma(statement);
  const secondWords = useMemo(() => second.split(/\s+/).filter(Boolean), [second]);
  const [visibleFirst, setVisibleFirst] = useState("");
  const [landedWords, setLandedWords] = useState(0);
  const [phase, setPhase] = useState<OpeningPhase>("ready");

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
      const landingDuration = secondWords.length
        ? (secondWords.length - 1) * WORD_LANDING_STAGGER_MS + WORD_LANDING_SETTLE_MS
        : 0;
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
          }, 620);
        }, 660);
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
      className={`signature homepage-signature is-${phase}`}
      id="homepage-headline"
      aria-label={statement}
    >
      <span className="homepage-signature-static" aria-hidden="true">{statement}</span>
      <span className="homepage-signature-stage" aria-hidden="true">
        <span className="homepage-signature-first">{visibleFirst}</span>
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
