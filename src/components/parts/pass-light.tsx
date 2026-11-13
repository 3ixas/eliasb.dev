"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Holds the passes and lets each catch the light where a fine pointer is (DESIGN.md "Motion"): the sheen follows the
 * pointer and the hologram turns. Hover adds feedback only, so nothing here is needed to read a pass, and with reduced
 * motion or a touch screen nothing listens.
 */
export function PassLight({ className, children }: { className: string; children: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = rail.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || !fine.matches || still.matches) return;
    const move = (event: PointerEvent) => {
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
