import { expect, test, type Page } from "@playwright/test";

/*
 * Nothing on the page should move once the eye has found it. Layout shift is summed over a first visit, scrolled to the
 * bottom and back, and held to the budget the craft bar sets (docs/runbooks/interruption-walk.md is the human half).
 * Layout shift is a Chromium measure, so this runs on Chromium at the phone and desktop widths only.
 */

/** Largest sum the craft bar allows: one first load of Threshold measured 0.0051, so 0.01 leaves room without letting a jump through. */
const budget = 0.01;
const routes = ["/", "/work/bnp-paribas", "/things-i-make/threshold"];

const shift = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
        // Records still queued are delivered before the next task, so reading after a frame includes the buffered ones.
        requestAnimationFrame(() => setTimeout(() => resolve(total), 0));
        (window as unknown as { __shift: () => number }).__shift = () => total;
      }),
  );

for (const route of routes) {
  test(`${route} shifts by no more than ${budget}`, async ({ page, browserName }, info) => {
    test.skip(browserName !== "chromium" || !/-(390|1440)-/.test(info.project.name), "Chromium at 390 and 1440 px");
    await page.goto(route);
    await page.waitForLoadState("load");
    await page.evaluate(() => document.fonts.ready);
    await shift(page);
    // Scroll to the bottom and back so lazy images and late arrivals are part of the visit.
    for (const to of ["bottom", "top"] as const) {
      await page.evaluate(async (target) => {
        const height = () => document.documentElement.scrollHeight - innerHeight;
        const step = innerHeight * 0.8;
        const goal = () => (target === "bottom" ? height() : 0);
        while (Math.abs(scrollY - goal()) > 1) {
          scrollTo(0, target === "bottom" ? Math.min(scrollY + step, goal()) : Math.max(scrollY - step, 0));
          await new Promise(requestAnimationFrame);
          await new Promise((done) => setTimeout(done, 50));
        }
      }, to);
    }
    await page.evaluate(() => new Promise(requestAnimationFrame));
    const total = await page.evaluate(() => (window as unknown as { __shift: () => number }).__shift());
    expect(total).toBeLessThanOrEqual(budget);
  });
}
