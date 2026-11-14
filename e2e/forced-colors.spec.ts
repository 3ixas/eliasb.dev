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

  test("a to-scale comparison's before and after bars are different colours, and neither is the page's", async ({ page }) => {
    await page.goto("/work/bnp-paribas");
    const fills = await page.locator("section#what-changed .bar").evaluateAll((elements) => elements.map((element) => getComputedStyle(element).backgroundColor));
    const page_ = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(fills.length).toBeGreaterThanOrEqual(2);
    expect(new Set(fills).size).toBeGreaterThan(1);
    for (const fill of fills) expect(fill).not.toBe(page_);
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
