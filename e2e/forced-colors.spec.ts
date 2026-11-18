import { expect, test } from "@playwright/test";

/*
 * Forced colours (docs/design/DESIGN.md, "Accessibility", R-29): the bars, the GitHub year and the passes keep their data. The browser drops authored backgrounds, and the bars and the
 * GitHub year are drawn with backgrounds, so without their forced-colours rules (parts.css, off-the-clock.css) the bars and the year's levels all come out
 * as the same colour. This holds that the marks that carry data stay apart.
 */
test.describe("Forced colours", () => {
  test.use({ forcedColors: "active", reducedMotion: "reduce" });

  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== "chromium", "Forced-colours emulation is held on Chromium");
  });

  test("a comparison's before and after sides are different colours, and neither is the page's", async ({ page }) => {
    await page.goto("/work/bnp-paribas");
    const fills = await page
      .locator('section#what-changed :is(.measure--days i, .measure--minutes i[data-at="on"], .measure--minutes i[data-at="range"])')
      .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).backgroundColor));
    const page_ = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(fills.length).toBeGreaterThanOrEqual(2);
    expect(new Set(fills).size).toBeGreaterThan(1);
    for (const fill of fills) expect(fill).not.toBe(page_);
  });

  test("Flowtime's break keeps its minutes apart from a Pomodoro's, and its slider keeps its track and thumb", async ({ page }) => {
    await page.goto("/things-i-make/flowtime");
    const figure = page.locator("section#decisions .ftbreak");
    const fill = (side: string) =>
      figure.locator(`.measure--minutes[data-side="${side}"] i[data-at="on"]`).evaluateAll((elements) => [...new Set(elements.map((element) => getComputedStyle(element).backgroundColor))]);
    const page_ = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const [flowtime, pomodoro] = [await fill("after"), await fill("before")];
    expect(flowtime).toHaveLength(1);
    expect(pomodoro).toHaveLength(1);
    expect(flowtime[0]).not.toBe(pomodoro[0]);
    for (const colour of [...flowtime, ...pomodoro]) expect(colour).not.toBe(page_);
    await expect(figure.locator(".ftbreak__range")).toHaveCSS("forced-color-adjust", "none");
  });

  test("Off the clock keeps today's mark and the book's and screen's edges", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    const panel = page.locator("[data-fixture='training-saturday']");
    const highlight = await page.evaluate(() => {
      const probe = document.body.appendChild(document.createElement("i"));
      probe.style.cssText = "forced-color-adjust: none; background: Highlight";
      const colour = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return colour;
    });
    // Today's mark is the highlight: its rule on a phone, its dot from 960 px. The other days' rules stay drawn in GrayText.
    const wide = page.viewportSize()!.width >= 960;
    const mark = await panel.locator(wide ? ".otc__week li[data-today] .otc__week-day" : ".otc__week li[data-today]").evaluate((element, pseudo) => getComputedStyle(element, pseudo).backgroundColor, wide ? "::before" : "::after");
    expect(mark).toBe(highlight);
    if (!wide) {
      const others = await panel.locator(".otc__week li:not([data-today])").evaluateAll((items) => items.map((item) => getComputedStyle(item, "::after").backgroundColor));
      for (const rule of others) expect(rule).not.toBe(highlight);
      expect(new Set(others).size).toBe(1);
    }
    for (const object of [".otc__book img", ".otc__screen"]) await expect(panel.locator(object)).toHaveCSS("outline-style", "solid");
  });

  test("the GitHub year's levels are not all one colour", async ({ page }) => {
    await page.goto("/");
    const byLevel = await page.locator(".stretch-gh__day[data-level]").evaluateAll((elements) => {
      const colours: Record<string, string> = {};
      for (const element of elements) colours[(element as HTMLElement).dataset.level!] = getComputedStyle(element).backgroundColor;
      return colours;
    });
    test.skip(Object.keys(byLevel).length < 2, "The year shows fewer than two levels today");
    expect(new Set(Object.values(byLevel)).size).toBe(Object.keys(byLevel).length);
  });

  test("a staff pass keeps its printed colours: it is a picture of a printed card", async ({ page }) => {
    await page.goto("/");
    const card = page.locator(".opening .pass__card").first();
    await expect(card).toHaveCSS("forced-color-adjust", "none");
    const band = await page.locator(".opening .pass__band").first().evaluate((element) => getComputedStyle(element).backgroundColor);
    const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(band).not.toBe(canvas);
  });
});
