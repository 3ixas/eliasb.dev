"use client";

import { useEffect, type RefObject } from "react";

/** Seamless material textures fetched in parallel with the scene chunk (#486). */
const WEBBING_URL = "/lanyard/webbing.webp";
const FOIL_URL = "/lanyard/foil.webp";
/** How long the scene waits for a material texture before falling back to the printed pass (ms). */
const TEXTURE_WAIT = 4000;
/** How long the scene may take to arrive before the print shows meanwhile (ms). */
const SLOW_MS = 5000;

/**
 * Hangs a stage's staff passes in 3D (#448). The CSS passes inside are the server render, the accessible names and the
 * fallback: with no script, no WebGL or reduced motion they are all there is. Once the page has painted its first frame
 * and the stage is near the view, the scene (three.js) and its textures load in parallel, painting each card from its
 * pass's own print and taking its place at its exact size; the passes stay in the page, unseen, for assistive technology
 * and the keyboard.
 */
export function useLanyard(stage: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = stage.current;
    const passes = element ? [...element.querySelectorAll<HTMLElement>(".pass")] : [];
    if (!element || !passes.length) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose: (() => void) | undefined;
    let cancelPaint: (() => void) | undefined;
    let loading = false;
    let cancelled = false;
    // Loading takes a moment; if the page is left or reduced motion turns on meanwhile, the scene is not shown.
    const wanted = () => !cancelled && !still.matches;

    // The stage says how far the scene got (`data-lanyard`: waiting, loading, 3d, or failed with `data-lanyard-error`, or
    // slow; the scene adds what a frame cost, `data-lanyard-frame`). Waiting, loading and 3d keep the printed passes
    // unseen (pass.css), so the print never shows and is then swapped; failed and slow show it. /fixtures/lanyard prints
    // the state, so a phone with no console can still say what happened. One scene per stage at a time: none starts while
    // one is up or loading.
    const cannot = cannotDraw();
    const fail = (reason: string) => {
      element.dataset.lanyard = "failed";
      element.dataset.lanyardError = reason;
    };
    const clear = () => {
      cancelPaint?.();
      cancelPaint = undefined;
      dispose?.();
      dispose = undefined;
      delete element.dataset.lanyardFrame;
    };
    let slow = 0;
    // The print waits unseen from here, unless the scene cannot draw at all.
    const wait = () => {
      if (cannot) fail(cannot);
      else if (!dispose && !loading) element.setAttribute("data-lanyard", "waiting");
    };
    const rearm = () => {
      clear();
      if (!wanted()) return;
      wait();
      near.observe(element);
    };
    const start = () => {
      cancelPaint = undefined;
      if (!wanted() || dispose || loading) return;
      // A stage hidden by CSS stays unmounted until it has non-zero layout dimensions.
      if (!element.offsetWidth || !element.offsetHeight) return;
      if (cannot) return fail(cannot);
      near.disconnect();
      element.dataset.lanyard = "loading";
      loading = true;
      // A scene that takes this long to arrive shows the print meanwhile; it still takes over when it draws.
      slow = window.setTimeout(() => element.dataset.lanyard === "loading" && (element.dataset.lanyard = "slow"), SLOW_MS);
      const needsFoil = passes.some((pass) => Boolean(pass.querySelector(".pass__holo")));
      Promise.all([
        import("./scene"),
        loadImage(WEBBING_URL, TEXTURE_WAIT),
        needsFoil ? loadImage(FOIL_URL, TEXTURE_WAIT) : Promise.resolve(null),
      ])
        .then(([{ mountLanyard }, webbing, foil]) => {
          if (!wanted()) return undefined;
          return mountLanyard({
            stage: element,
            passes,
            textures: { webbing, foil },
            isWanted: wanted,
            onReady: () => wanted() && (element.dataset.lanyard = "3d"),
            onHide: rearm,
            onContextLost: () => {
              clear();
              if (wanted()) fail("WebGL context lost");
            },
          });
        })
        .then((stop) => {
          loading = false;
          clearTimeout(slow);
          if (!stop) return rearm();
          if (wanted()) dispose = stop;
          else stop();
        })
        .catch((error: unknown) => {
          loading = false;
          clearTimeout(slow);
          if (wanted()) fail(error instanceof Error ? error.message : String(error));
        });
    };
    const scheduleStart = () => {
      if (cancelPaint || !wanted() || dispose || loading) return;
      // Let the first frame paint cleanly before starting three.js chunk + texture fetches.
      cancelPaint = afterPaint(start);
    };
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) scheduleStart();
        else {
          cancelPaint?.();
          cancelPaint = undefined;
        }
      },
      { rootMargin: "200px" },
    );
    if (wanted()) wait();
    near.observe(element);
    // Reduced motion turned on later puts the printed passes back; turned off again, the passes hang once more when the
    // stage is near the view.
    const changed = () => {
      if (!still.matches) {
        wait();
        near.observe(element);
        return;
      }
      clear();
      delete element.dataset.lanyard;
      delete element.dataset.lanyardError;
    };
    still.addEventListener("change", changed);

    return () => {
      cancelled = true;
      clearTimeout(slow);
      near.disconnect();
      still.removeEventListener("change", changed);
      clear();
      delete element.dataset.lanyard;
      delete element.dataset.lanyardError;
    };
  }, [stage]);
}

/** Runs `callback` after the next browser paint (two animation frames), returning a cancel function. */
function afterPaint(callback: () => void): () => void {
  let frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(callback);
  });
  return () => cancelAnimationFrame(frame);
}

/** Loads an image texture with a hard timeout so a broken or hung asset falls back cleanly to the printed pass. */
async function loadImage(url: string, timeoutMs: number): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  let timer = 0;
  try {
    await Promise.race([
      image.decode().catch(() => Promise.reject(new Error(`Could not load ${url}`))),
      new Promise<never>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error(`Timed out loading ${url}`)), timeoutMs);
      }),
    ]);
    return image;
  } finally {
    clearTimeout(timer);
  }
}

/** Renderers that draw on the processor, not a graphics chip: the scene would take the page's time from everything else. */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;
/** What a browser says when it hides its renderer's name. */
const UNNAMED = /^(webkit )?webgl$|^webkit$|^mozilla$/i;

/** Why this browser should keep the printed passes, or nothing if it can draw the scene on a graphics chip. */
function cannotDraw() {
  try {
    const context = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!context) return "No hardware WebGL 2";
    const info = context.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    context.getExtension("WEBGL_lose_context")?.loseContext();
    // A browser that will not name its renderer, or names only itself, may be drawing on the processor; Safari names Apple's GPU.
    if (!renderer || UNNAMED.test(renderer)) return `Unnamed renderer (${renderer})`;
    return SOFTWARE.test(renderer) ? `Software renderer (${renderer})` : null;
  } catch {
    return "No WebGL 2";
  }
}
