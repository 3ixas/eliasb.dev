"use client";

import { useEffect, type RefObject } from "react";

/**
 * Hangs a stage's staff passes in 3D (#448). The CSS passes inside are the server render, the accessible names and the
 * fallback: with no script, no WebGL or reduced motion they are all there is. When the stage comes near the view, the
 * scene (three.js) loads, paints each card from its pass's own print and takes its place at its exact size; the passes
 * stay in the page, unseen, for assistive technology and the keyboard.
 */
export function useLanyard(stage: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = stage.current;
    const passes = element ? [...element.querySelectorAll<HTMLElement>(".pass")] : [];
    if (!element || !passes.length) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose: (() => void) | undefined;
    let cancelled = false;
    // Loading takes a moment; if the page is left or reduced motion turns on meanwhile, the scene is not shown.
    const wanted = () => !cancelled && !still.matches;

    const start = () => {
      if (!wanted() || !canDraw()) return;
      near.disconnect();
      import("./scene")
        .then(({ mountLanyard }) => mountLanyard({ stage: element, passes, onReady: () => wanted() && (element.dataset.lanyard = "3d") }))
        .then((stop) => (wanted() ? (dispose = stop) : stop()))
        .catch(() => delete element.dataset.lanyard);
    };
    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && start(), { rootMargin: "200px" });
    near.observe(element);
    // Reduced motion turned on later puts the printed passes back.
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
  }, [stage]);
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
