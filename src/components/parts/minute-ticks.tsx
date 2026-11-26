"use client";

import type { CSSProperties } from "react";

/**
 * Minutes as a tick a minute across `scale`, every fifth taller (#456): the `certain` minutes full height, the uncertain
 * ones up to `amount` short, the rest of the scale faint. Hidden from assistive technology, as every drawing of words is.
 * A comparison draws its pair on the larger side's scale; a working figure (Flowtime's break, #464) on its slider's.
 * A client component so the page payload carries these four numbers, not a node for every tick (#572).
 */
export function MinuteTicks({ scale, amount, certain = amount, side }: { scale: number; amount: number; certain?: number; side: "before" | "after" }) {
  return (
    <span className="measure measure--minutes" data-side={side} aria-hidden="true">
      {Array.from({ length: scale }, (_, index) => {
        const minute = index + 1;
        const state = minute <= certain ? "on" : minute <= amount ? "range" : "off";
        return <i key={minute} data-at={state} data-fifth={minute % 5 === 0 ? "" : undefined} style={state === "off" ? undefined : ({ "--i": index }) as CSSProperties} />;
      })}
    </span>
  );
}
