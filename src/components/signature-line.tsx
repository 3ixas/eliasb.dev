"use client";

import { useCallback, useEffect, useState } from "react";

const defaultStatement = "I build software that makes complex things easier to understand.";
type EntrancePhase = "ready" | "typing" | "settling" | "revealing" | "complete";

export function SignatureLine({
  direction,
  statement = defaultStatement,
}: {
  direction: string;
  statement?: string;
}) {
  const splitAt = statement.indexOf(" for ");
  const split = splitAt > 0 ? splitAt : Math.ceil(statement.length * 0.52);
  const lead = statement.slice(0, split);
  const tail = statement.slice(split);
  const [phase, setPhase] = useState<EntrancePhase>("ready");
  const [visibleLead, setVisibleLead] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);

  const play = useCallback(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisibleLead(lead);
      setPhase("complete");
      setHasPlayed(true);
      return;
    }

    setVisibleLead("");
    setPhase("typing");
    let index = 0;
    let settleTimer: number | undefined;
    let revealTimer: number | undefined;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleLead(lead.slice(0, index));
      if (index >= lead.length) {
        window.clearInterval(timer);
        setPhase("settling");
        settleTimer = window.setTimeout(() => {
          setPhase("revealing");
          revealTimer = window.setTimeout(() => {
            setPhase("complete");
            setVisibleLead(lead);
            setHasPlayed(true);
            sessionStorage.setItem(`concept-seen-${direction}`, "true");
          }, 480);
        }, 280);
      }
    }, 46);

    return () => {
      window.clearInterval(timer);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
    };
  }, [direction, lead]);

  useEffect(() => {
    let stop: (() => void) | undefined;
    const seen = sessionStorage.getItem(`concept-seen-${direction}`);
    const frame = window.requestAnimationFrame(() => {
      if (seen) {
        setVisibleLead(lead);
        setPhase("complete");
        setHasPlayed(true);
      } else {
        stop = play();
      }
    });
    const replay = () => {
      stop?.();
      stop = play();
    };
    window.addEventListener("replay-concept-entrance", replay);
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      stop?.();
      window.removeEventListener("replay-concept-entrance", replay);
    };
  }, [direction, lead, play]);

  return (
    <h1 className={`signature ${phase} ${hasPlayed ? "has-played" : ""}`} aria-label={statement}>
      <span className="signature-visible" aria-hidden="true">
        <span className="signature-lead">{visibleLead}</span>
        <span className="signature-tail">{tail}</span>
      </span>
      <span className="signature-space" aria-hidden="true">{statement}</span>
    </h1>
  );
}
