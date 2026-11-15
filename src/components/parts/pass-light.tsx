"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Holds the passes and lets each catch the light where a fine pointer is (DESIGN.md "Motion"): the sheen follows the
 * pointer and the hologram turns. Hover adds feedback only, so nothing here is needed to read a pass, and with reduced
 * motion or a touch screen nothing moves.
 */
export function PassLight({ className, children }: { className: string; children: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    // Read on every move, so a preference or pointer that changes after the page loads is followed.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const move = (event: PointerEvent) => {
      if (!fine.matches || still.matches) return;
      const card = (event.target as Element).closest<HTMLElement>(".pass__card");
      if (!card) return;
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      card.style.setProperty("--light-x", `${x * 100}%`);
      card.style.setProperty("--light-y", `${y * 100}%`);
      card.style.setProperty("--holo-turn", `${20 + x * 200}deg`);
    };
    element.addEventListener("pointermove", move, { passive: true });
    return () => element.removeEventListener("pointermove", move);
  }, []);

  return (
    <div ref={rail} className={className}>
      {children}
    </div>
  );
}
