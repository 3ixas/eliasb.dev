"use client";

import { useCallback, useEffect, useState } from "react";

const statement = "I build thoughtful software for complex problems.";

export function SignatureLine({ direction }: { direction: string }) {
  const [visible, setVisible] = useState(statement);
  const [complete, setComplete] = useState(true);

  const play = useCallback(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisible(statement);
      setComplete(true);
      return;
    }

    setVisible("");
    setComplete(false);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(statement.slice(0, index));
      if (index >= statement.length) {
        window.clearInterval(timer);
        setComplete(true);
        sessionStorage.setItem(`concept-seen-${direction}`, "true");
      }
    }, 38);

    return () => window.clearInterval(timer);
  }, [direction]);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let frame: number | undefined;
    if (!sessionStorage.getItem(`concept-seen-${direction}`)) {
      frame = window.requestAnimationFrame(() => { stop = play(); });
    }
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
  }, [direction, play]);

  return (
    <h1 className={complete ? "signature complete" : "signature typing"} aria-label={statement}>
      <span aria-hidden="true">{visible}</span>
      <span className="signature-space" aria-hidden="true">{statement}</span>
    </h1>
  );
}
