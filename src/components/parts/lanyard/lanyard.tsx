"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hangs a staff pass in 3D (#448). The CSS pass inside is the server render, the accessible name and the fallback: with no
 * script, no WebGL or reduced motion it is all there is. When the stage comes near the view, the scene (three.js) loads,
 * paints the card from the pass's own print and takes the pass's place at its exact size; the pass stays in the page,
 * unseen, for assistive technology.
 */
export function LanyardStage({ className, children }: { className?: string; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = stage.current;
    const pass = element?.querySelector<HTMLElement>(".pass");
    if (!element || !pass) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose: (() => void) | undefined;
    let cancelled = false;
    // Loading takes a moment; if the page is left or reduced motion turns on meanwhile, the scene is not shown.
    const wanted = () => !cancelled && !still.matches;

    const start = () => {
      if (!wanted() || !canDraw()) return;
      near.disconnect();
      import("./scene")
        .then(({ mountLanyard }) => mountLanyard({ stage: element, pass, onReady: () => wanted() && (element.dataset.lanyard = "3d") }))
        .then((stop) => (wanted() ? (dispose = stop) : stop()))
        .catch(() => delete element.dataset.lanyard);
    };
    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && start(), { rootMargin: "200px" });
    near.observe(element);
    // Reduced motion turned on later puts the printed pass back.
    const stop = () => {
      if (!still.matches) return;
      dispose?.();
      dispose = undefined;
      delete element.dataset.lanyard;
    };
    still.addEventListener("change", stop);

    return () => {
      cancelled = true;
      near.disconnect();
      still.removeEventListener("change", stop);
      dispose?.();
      delete element.dataset.lanyard;
    };
  }, []);

  return (
    <div ref={stage} className={className ? `lanyard ${className}` : "lanyard"}>
      {children}
    </div>
  );
}

function canDraw() {
  try {
    const context = document.createElement("canvas").getContext("webgl2");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}
