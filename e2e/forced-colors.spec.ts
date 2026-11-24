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

  test("Where I'm headed keeps its split test, six months to production, ticks and live mark distinct", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section[aria-labelledby='headed-heading']");
    const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const colours = await section.evaluate((root) => {
      const other = root.querySelector('[data-proof="split"] [data-variant="other"] rect')!;
      const chosen = root.querySelector('[data-proof="split"] .headed__split-box')!;
      const zero = root.querySelector('[data-proof="months-to-prod"] .headed__zero')!;
      const month = root.querySelector('[data-proof="months-to-prod"] .headed__month')!;
      const prod = root.querySelector('[data-proof="months-to-prod"] .headed__prod-box')!;
      const thresholdTick = root.querySelector('[data-proof="count-to-live"] .drawn__ticks i')!;
      const live = root.querySelector('[data-proof="count-to-live"] .headed__live')!;
      return {
        other: getComputedStyle(other).stroke,
        chosen: getComputedStyle(chosen).stroke,
        zero: getComputedStyle(zero).stroke,
        month: getComputedStyle(month).fill,
        prod: getComputedStyle(prod).stroke,
        thresholdTick: getComputedStyle(thresholdTick).backgroundColor,
        live: getComputedStyle(live).backgroundColor,
      };
    });
    expect(colours.chosen).not.toBe(colours.other);
    expect(colours.prod).not.toBe(colours.zero);
    for (const colour of Object.values(colours)) expect(colour).not.toBe(canvas);
    expect(colours.month).toBe(colours.chosen);
    expect(colours.prod).toBe(colours.chosen);
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

  test("Threshold's city switcher keeps its selected button distinct and project bezels keep their border", async ({ page }) => {
    await page.goto("/");
    const active = page.locator('#things-i-make .project-city__btn[aria-pressed="true"]');
    const inactive = page.locator('#things-i-make .project-city__btn[aria-pressed="false"]').first();
    await expect(active).toHaveCSS("forced-color-adjust", "none");
    const [activeBg, inactiveBg, bezelBorder] = await Promise.all([
      active.evaluate((el) => getComputedStyle(el).backgroundColor),
      inactive.evaluate((el) => getComputedStyle(el).backgroundColor),
      page.locator("#things-i-make .project__shot").first().evaluate((el) => getComputedStyle(el).borderTopColor),
    ]);
    const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(activeBg).not.toBe(inactiveBg);
    expect(activeBg).not.toBe(canvas);
    expect(bezelBorder).not.toBe(canvas);
  });

  test("How I work keeps its feature-flag switch, active route chip, 13-slice bar and Before/After bars distinct", async ({ page }) => {
    await page.goto("/");
    const how = page.locator("section#how-i-work");
    const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const sw = how.getByRole("switch");
    const activeChip = how.locator('.route-chip[data-live="true"]');
    const inactiveChip = how.locator('.route-chip[data-live="false"]');
    await expect(activeChip).toHaveCSS("forced-color-adjust", "none");
    await expect(sw.locator(".flag-switch__track")).toHaveCSS("forced-color-adjust", "none");

    const readColours = () =>
      how.evaluate((root) => {
        const slice = root.querySelector(".how-slices__bars i")!;
        const track = root.querySelector(".flag-switch__track")!;
        const knob = root.querySelector(".flag-switch__knob")!;
        const live = root.querySelector('.route-chip[data-live="true"]')!;
        const idle = root.querySelector('.route-chip[data-live="false"]')!;
        const before = root.querySelector('.drawn__bars .bar:not(.bar--after)')!;
        const after = root.querySelector(".drawn__bars .bar--after")!;
        return {
          slice: getComputedStyle(slice).backgroundColor,
          track: getComputedStyle(track).backgroundColor,
          knob: getComputedStyle(knob).backgroundColor,
          liveBg: getComputedStyle(live).backgroundColor,
          idleBg: getComputedStyle(idle).backgroundColor,
          before: getComputedStyle(before).backgroundColor,
          after: getComputedStyle(after).backgroundColor,
        };
      });

    const off = await readColours();
    expect(off.slice).not.toBe(canvas);
    expect(off.knob).not.toBe(off.track);
    expect(off.liveBg).not.toBe(off.idleBg);
    expect(off.liveBg).not.toBe(canvas);
    expect(off.after).not.toBe(off.before);
    expect(off.before).not.toBe(canvas);
    expect(off.after).not.toBe(canvas);

    await expect.poll(() => sw.evaluate((el) => Object.keys(el).some((key) => key.startsWith("__reactProps$")))).toBe(true);
    await sw.click();
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await expect(inactiveChip).toBeVisible();
    const on = await readColours();
    expect(on.track).not.toBe(off.track);
    expect(on.knob).not.toBe(on.track);
    expect(on.liveBg).not.toBe(on.idleBg);
  });
});
