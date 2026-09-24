"use client";

import { useCallback, useEffect, useState } from "react";

const defaultStatement = "I build software that makes complex things easier to understand.";
type EntrancePhase = "ready" | "typing" | "settling" | "complete";

export function SignatureLine({
  direction,
  statement = defaultStatement,
}: {
  direction: string;
  statement?: string;
}) {
  const [phase, setPhase] = useState<EntrancePhase>("ready");
  const [visibleText, setVisibleText] = useState("");
  const sessionKey = `concept-seen-${direction}`;

  const complete = useCallback(() => {
    setVisibleText(statement);
    setPhase("complete");
  }, [statement]);

  const play = useCallback(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      complete();
      return;
    }

    const characters = Array.from(statement);
    setVisibleText("");
    setPhase("typing");
    let index = 0;
    let settleTimer: number | undefined;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleText(characters.slice(0, index).join(""));
      if (index >= characters.length) {
        window.clearInterval(timer);
        setPhase("settling");
        settleTimer = window.setTimeout(() => {
          complete();
          sessionStorage.setItem(sessionKey, "true");
        }, 180);
      }
    }, 34);

    return () => {
      window.clearInterval(timer);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    };
  }, [complete, sessionKey, statement]);

  useEffect(() => {
    let stop: (() => void) | undefined;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const seen = sessionStorage.getItem(sessionKey);
    const frame = window.requestAnimationFrame(() => {
      if (seen || motionPreference.matches) complete();
      else stop = play();
    });

    const finishForReducedMotion = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      window.cancelAnimationFrame(frame);
      stop?.();
      stop = undefined;
      complete();
    };
    const replay = () => {
      stop?.();
      stop = play();
    };
    motionPreference.addEventListener("change", finishForReducedMotion);
    window.addEventListener("replay-concept-entrance", replay);
    return () => {
      window.cancelAnimationFrame(frame);
      stop?.();
      motionPreference.removeEventListener("change", finishForReducedMotion);
      window.removeEventListener("replay-concept-entrance", replay);
    };
  }, [complete, play, sessionKey]);

  return (
    <h1 className={`signature ${phase}`} aria-label={statement}>
      <span className="signature-visible" aria-hidden="true">
        <span className="signature-typed-text">{visibleText}</span>
      </span>
      <span className="signature-space" aria-hidden="true">{statement}</span>
    </h1>
  );
}
