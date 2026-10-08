import type { Page } from "@playwright/test";

/**
 * Resolves once the page has stopped scrolling: the same scroll position for
 * three animation frames in a row. Arriving at a #fragment smooth-scrolls to it
 * (`scroll-behavior: smooth`), and on a slow runner that is still under way
 * when a test starts measuring; mid-scroll, WebKit can report a scroll position
 * and element positions from different moments.
 */
export const scrollSettled = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = window.scrollY;
        let still = 0;
        const check = () => {
          still = window.scrollY === last ? still + 1 : 0;
          last = window.scrollY;
          if (still >= 3) resolve();
          else requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      }),
  );

/** Scrolls straight to `top`, without the page's smooth scrolling, and waits until it's there. */
export const scrollInstantlyTo = async (page: Page, top: number) => {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
  await scrollSettled(page);
};
