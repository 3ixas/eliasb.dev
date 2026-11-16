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
 * Lets the scene draw on a software renderer. The scene keeps the printed passes where WebGL runs on the processor
 * (lanyard.ts), which is how headless Chromium draws, in CI and here; specs about the scene itself report a graphics chip.
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
    const getParameter = WebGL2RenderingContext.prototype.getParameter;
    WebGL2RenderingContext.prototype.getParameter = function (this: WebGL2RenderingContext, name: number) {
      // WEBGL_debug_renderer_info's UNMASKED_RENDERER_WEBGL.
      return name === 0x9246 ? "Test GPU" : getParameter.call(this, name);
    };
  });

/** Whether this browser can draw the scene at all. */
export const canDrawScene = (page: Page) => page.evaluate(() => Boolean(document.createElement("canvas").getContext("webgl2")));
