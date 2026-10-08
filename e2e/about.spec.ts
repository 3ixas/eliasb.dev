import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";
import { scrollInstantlyTo, scrollSettled } from "./support/scroll";

const about = (page: Page) => page.locator("#about");
const tags = ["History at uni", "Into marketing", "The click", "Learning to code", "BNP Paribas, today"];
const drawn = (page: Page) =>
  page.locator(".board-string").evaluateAll((paths) => paths.map((path) => parseFloat(getComputedStyle(path).strokeDashoffset) || 0));
/** Where the journey is on screen: its top and bottom, in viewport pixels. */
const journeyOnScreen = (page: Page) =>
  page.locator("[data-journey]").evaluate((element) => {
    const { top, bottom } = element.getBoundingClientRect();
    return { top, bottom };
  });
/** Scrolls until the journey's top is `top` px down the screen, once the arrival at #about has finished scrolling. */
const scrollJourneyTo = async (page: Page, top: number) => {
  await scrollSettled(page);
  const target = await page.locator("[data-journey]").evaluate((element, at) => element.getBoundingClientRect().top + window.scrollY - at, top);
  await scrollInstantlyTo(page, target);
};

test.describe("About", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#about");
  });

  test("tells the story from history to today, with Experiments gone", async ({ page }) => {
    const section = about(page);
    await expect(section.getByText("03 / About", { exact: true })).toBeVisible();
    await expect(section.getByRole("heading", { level: 2, name: "A bit about me." })).toBeVisible();
    await expect(section.locator("p").filter({ hasText: /^I studied history at university\./ })).toBeVisible();
    await expect(section.getByText(/a Greggs campaign/)).toBeVisible();
    await expect(section.getByRole("img", { name: "Elias smiling in a grey jumper outside a stone building on a sunny day" })).toBeVisible();
    await expect(page.locator("#experiments, .career-employer, .about-contact-cta")).toHaveCount(0);
  });

  test("the five stops are an ordered list that reads in order without the string", async ({ page }) => {
    const list = about(page).getByRole("list");
    const items = list.getByRole("listitem");
    await expect(items).toHaveCount(5);
    for (const [index, tag] of tags.entries()) await expect(items.nth(index)).toContainText(tag);
    await expect(items.nth(2)).toContainText("“I need that feeling from what I do.”");
    // The string, the numbers drawn on the wall and the drawings are hidden from assistive technology.
    await expect(about(page).locator("[data-journey] svg[aria-hidden='true']").first()).toBeAttached();
    const snapshot = await list.ariaSnapshot();
    expect(snapshot.indexOf("History at uni")).toBeLessThan(snapshot.indexOf("BNP Paribas, today"));
  });

  test("the string draws itself on scroll, stretch by stretch", async ({ page }) => {
    const supported = await page.evaluate(() => CSS.supports("animation-timeline: view()"));
    await expect.poll(async () => (await drawn(page)).length).toBe(4);
    if (!supported) {
      // Without scroll-driven animations the string is simply there.
      expect(await drawn(page)).toEqual([0, 0, 0, 0]);
      return;
    }
    // Each stretch is a running animation on the journey's view timeline.
    await expect
      .poll(() => page.locator(".board-string").evaluateAll((paths) => paths.map((path) => path.getAnimations().length)), {
        message: "every stretch has its scroll-driven animation",
      })
      .toEqual([1, 1, 1, 1]);
    // The journey just coming up from the bottom of the screen: the last stretch isn't drawn yet.
    await scrollJourneyTo(page, 700);
    // Landed where intended (within a few pixels of rounding), not somewhere a mid-scroll measurement put it.
    expect((await journeyOnScreen(page)).top).toBeCloseTo(700, -1);
    await expect.poll(async () => (await drawn(page)).at(-1)).toBeGreaterThan(0.9);
    // Scrolled until the journey's end is near the top of the screen: all four stretches are drawn.
    const { top, bottom } = await journeyOnScreen(page);
    await scrollJourneyTo(page, 150 - (bottom - top));
    expect((await journeyOnScreen(page)).bottom).toBeCloseTo(150, -1);
    await expect.poll(async () => (await drawn(page)).every((offset) => offset < 0.05)).toBe(true);
  });

  test("with reduced motion the string is complete and the candle holds still", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await scrollJourneyTo(page, 700);
    await expect.poll(async () => (await drawn(page)).length).toBe(4);
    expect(await drawn(page)).toEqual([0, 0, 0, 0]);
    await expect(page.locator(".board-candle-flicker").first()).toHaveCSS("animation-name", "none");
  });

  test("the candle is out by day and lit at night, with a gentle flicker", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
    await page.reload();
    const flame = page.locator(".board-candle-flame");
    await expect(flame).toHaveCSS("opacity", "0");
    await page.evaluate(() => (document.documentElement.dataset.lights = "on"));
    await expect.poll(() => flame.evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.85);
    await expect(page.locator(".board-candle-flicker").first()).toHaveCSS("animation-name", "board-candle-flicker");
  });

  test("on phones it's a single column, with nothing overlapping", async ({ page }) => {
    const width = page.viewportSize()!.width;
    test.skip(width >= 900, "Wide screens set the story beside the journey");
    const boxes = await about(page).locator("[data-stop]").evaluateAll((stops) =>
      stops.map((stop) => {
        const box = stop.getBoundingClientRect();
        return { top: box.top + window.scrollY, bottom: box.bottom + window.scrollY, left: box.left, right: box.right };
      }),
    );
    for (let index = 1; index < boxes.length; index += 1) expect(boxes[index].top).toBeGreaterThanOrEqual(boxes[index - 1].bottom);
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(width);
    }
    // The story comes first, then the photo, then the journey.
    const order = await page.evaluate(() =>
      [".board-about-story", "#about [data-pin='photo']", "[data-journey]"].map((selector) => document.querySelector(selector)!.getBoundingClientRect().top),
    );
    expect(order[0]).toBeLessThan(order[1]);
    expect(order[1]).toBeLessThan(order[2]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });

  test("text keeps AA contrast by day and at night, and passes axe", async ({ page }) => {
    const selector = "#about :is(p, span, h2):not(.sr-only)";
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    await page.evaluate(() => (document.documentElement.dataset.lights = "on"));
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}" at night`).toBeGreaterThanOrEqual(4.5);
    const results = await new AxeBuilder({ page }).include("#about").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
