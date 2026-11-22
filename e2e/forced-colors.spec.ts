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

  test("Where I'm headed keeps its split test, ticks and live mark distinct", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section[aria-labelledby='headed-heading']");
    const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const colours = await section.evaluate((root) => {
      const other = root.querySelector('[data-proof="split"] [data-variant="other"] rect')!;
      const chosen = root.querySelector('[data-proof="split"] .headed__split-box')!;
      const bnpTick = root.querySelector('[data-proof="count"] .drawn__ticks i')!;
      const thresholdTick = root.querySelector('[data-proof="count-to-live"] .drawn__ticks i')!;
      const live = root.querySelector('[data-proof="count-to-live"] .headed__live')!;
      return {
        other: getComputedStyle(other).stroke,
        chosen: getComputedStyle(chosen).stroke,
        bnpTick: getComputedStyle(bnpTick).backgroundColor,
        thresholdTick: getComputedStyle(thresholdTick).backgroundColor,
        live: getComputedStyle(live).backgroundColor,
      };
    });
    expect(colours.chosen).not.toBe(colours.other);
    for (const colour of Object.values(colours)) expect(colour).not.toBe(canvas);
    expect(colours.bnpTick).toBe(colours.chosen);
    expect(colours.thresholdTick).toBe(colours.chosen);
    expect(colours.live).toBe(colours.chosen);
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

  test("the 404's visitor pass keeps its card stock and print", async ({ page }) => {
    await page.goto("/nothing-here");
    const card = page.locator(".pass--visitor .pass__card");
    await expect(card).toHaveCSS("forced-color-adjust", "none");
    // The stock stays a drawn gradient, and the print keeps its own inks rather than the system's.
    expect(await card.evaluate((element) => getComputedStyle(element).backgroundImage)).toContain("gradient");
    await expect(card.locator(".pass__address")).toHaveCSS("color", "rgb(75, 74, 70)");
    await expect(card.locator(".pass__silhouette")).toHaveCSS("fill", "rgb(185, 184, 177)");
  });
});
