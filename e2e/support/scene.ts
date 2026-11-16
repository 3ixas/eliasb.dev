import type { BrowserContext, Page } from "@playwright/test";

/**
 * Loads pages as a browser without WebGL 2 would, so the printed staff passes stay on screen instead of the 3D scene
 * (#448, parts/lanyard). For specs about the printed pass's own motion (its arrival swing, its hover lean), which the
 * scene replaces wherever it can draw.
 */
export const withoutScene = (target: Page | BrowserContext) =>
  target.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...rest: unknown[]) {
      return kind === "webgl2" ? null : (getContext as (...args: unknown[]) => unknown).call(this, kind, ...rest);
    } as typeof getContext;
  });

/**
 * Lets the scene run on a software renderer. The scene keeps the printed passes where WebGL runs on the processor
 * (lanyard.ts, scene.ts), which is how headless browsers draw in CI, where one frame takes seconds and holds up the
 * page's input. Specs about the scene's behaviour (its links, drags, sizes and shifts, not its pixels) report a graphics
 * chip and skip the drawing itself: the scene, its physics and its hit tests run as they would.
 */
export const withScene = (page: Page) =>
  page.addInitScript(() => {
    // CI's Chromium also reports software rendering as a major performance caveat.
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, options?: Record<string, unknown>) {
      const relaxed = { ...options };
      delete relaxed.failIfMajorPerformanceCaveat;
      return (getContext as (...args: unknown[]) => unknown).call(this, kind, relaxed);
    } as typeof getContext;
    // The scene times one frame, read back once drawn, and keeps the printed passes if it is slow, as software rendering is;
    // here the draws themselves are skipped, so a frame costs nothing.
    for (const name of ["readPixels", "drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced", "drawRangeElements"] as const) {
      WebGL2RenderingContext.prototype[name] = () => {};
    }
    const getParameter = WebGL2RenderingContext.prototype.getParameter;
    WebGL2RenderingContext.prototype.getParameter = function (this: WebGL2RenderingContext, name: number) {
      // WEBGL_debug_renderer_info's UNMASKED_RENDERER_WEBGL.
      return name === 0x9246 ? "Test GPU" : getParameter.call(this, name);
    };
  });

/** Whether this browser can draw the scene at all. */
export const canDrawScene = (page: Page) => page.evaluate(() => Boolean(document.createElement("canvas").getContext("webgl2")));
