"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { passLean } from "@/components/site/signature-springs";

/** How far, in degrees, a pass is pushed when the pointer arrives at its edge. */
const KICK_DEGREES = 4;
const KICK_MS = 120;

/**
 * An employer Staff pass's lanyard, on a fine pointer: the pass leans away from
 * where the pointer arrived, then swings back through rest with a small
 * overshoot and settles (`passLean`, a spring of bounce 0.4 over 0.7 s). Only
 * the individual `rotate` property moves, so it adds to the pass's resting
 * tilt. Touch has no pointer to lean from; its pendulum is CSS, driven by
 * scroll. The markup inside is rendered by the server.
 */
export function PassHang({ className, style, pass, children }: { className: string; style: CSSProperties; pass: string; children: ReactNode }) {
  const hang = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = hang.current;
    if (!element) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let playing: Animation[] = [];
    const stop = () => {
      playing.forEach((animation) => animation.cancel());
      playing = [];
    };

    const onEnter = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || event.pointerType === "touch") return;
      const box = element.getBoundingClientRect();
      const side = Math.max(-1, Math.min(1, (event.clientX - (box.left + box.width / 2)) / (box.width / 2)));
      // The kick is never so small it goes unseen, and a pointer at the very middle still pushes one way.
      const kick = -(Math.sign(side) || 1) * Math.max(Math.abs(side), 0.4) * KICK_DEGREES;
      const now = Number.parseFloat(getComputedStyle(element).rotate) || 0;
      stop();
      const push = element.animate([{ rotate: `${now}deg` }, { rotate: `${kick}deg` }], { duration: KICK_MS, easing: "ease-out", fill: "forwards" });
      playing.push(push);
      push.onfinish = () => {
        const swing = element.animate([{ rotate: `${kick}deg` }, { rotate: "0deg" }], { duration: passLean.duration, easing: passLean.easing });
        playing.push(swing);
        push.cancel();
      };
    };

    element.addEventListener("pointerenter", onEnter);
    return () => {
      element.removeEventListener("pointerenter", onEnter);
      stop();
    };
  }, []);

  return (
    <div ref={hang} className={className} style={style} data-pass={pass} data-lean="">
      {children}
    </div>
  );
}
