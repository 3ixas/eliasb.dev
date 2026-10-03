import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";

const week = (page: Page) => page.locator("[data-fixture='week']");
const toggleIn = (clipping: Locator) => clipping.getByRole("button", { name: /more oddities this week|Fold them away/ });

/** Where each extra clipping is, in page coordinates, measured together. */
const extraBoxes = (clipping: Locator) =>
  clipping.locator("[data-clipping-extra]").evaluateAll((extras) =>
    extras.map((extra) => {
      const box = extra.getBoundingClientRect();
      return { x: Math.round(box.x), y: Math.round(box.y + window.scrollY), width: Math.round(box.width), height: Math.round(box.height) };
    }),
  );

test.describe("The Weekly Curiosity on the Board", () => {
  test("is a clipping with its masthead, and its source is the readable page for the day", async ({ page }) => {
    await page.goto("/#outside-work");
    const clipping = page.locator("[data-board-pin='clipping']");
    await expect(clipping.getByRole("heading", { level: 3, name: "The Weekly Curiosity" })).toBeVisible();
    await expect(clipping.getByText("Strange but true")).toBeVisible();
    const source = clipping.getByRole("link", { name: /^(More from \d{1,2} [A-Z][a-z]+ on Wikipedia|Browse history on Wikipedia)$/ });
    await expect(source).toHaveAttribute("href", /^https:\/\/en\.wikipedia\.org\/wiki\/([A-Z][a-z]+_\d{1,2}|Portal:History)$/);
    // The legacy history section is gone from below the Board.
    await expect(page.locator(".outside-work-history")).toHaveCount(0);
  });
});

test.describe("Weekly Curiosity states", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/clipping");
  });

  test("prints the week's dateline, the lead oddity, and its credit", async ({ page }) => {
    const clipping = week(page);
    await expect(clipping.getByText("Vol. 2026 · No. 40")).toBeVisible();
    await expect(clipping.getByText("Week of 28 Sept")).toBeVisible();
    await expect(clipping.getByText("Price: one click")).toBeVisible();
    await expect(clipping.getByText("Odd but true, from this week in history")).toBeVisible();
    await expect(clipping.getByText("28 September 1924", { exact: true })).toBeVisible();
    await expect(clipping.getByRole("img", { name: "Douglas World Cruisers on a beach" })).toBeVisible();
    const credit = clipping.locator("figcaption").first();
    await expect(credit).toHaveText("Image: The Museum of Flight · Public domain");
    await expect(credit.getByRole("link", { name: "The Museum of Flight" })).toHaveAttribute("href", "https://commons.wikimedia.org/wiki/File:Douglas_World_Cruisers.jpg");
    // With no licence page, the licence links to the image's Commons record.
    await expect(credit.getByRole("link", { name: "Public domain" })).toHaveAttribute("href", "https://commons.wikimedia.org/wiki/File:Douglas_World_Cruisers.jpg");
    await expect(clipping.getByRole("link", { name: "More from 28 September on Wikipedia" })).toHaveAttribute("href", "https://en.wikipedia.org/wiki/September_28");
  });

  test("fans out by pointer and folds away again", async ({ page }) => {
    const clipping = week(page);
    const toggle = toggleIn(clipping);
    await expect(toggle).toHaveText("2 more oddities this week ↓");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(`[id="${await toggle.getAttribute("aria-controls")}"]`)).toHaveAttribute("inert", "");
    await expect(clipping.getByRole("link", { name: "Read on Wikipedia" })).toHaveCount(1);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toHaveText("Fold them away ↑");
    await expect(clipping.getByRole("link", { name: "Read on Wikipedia" })).toHaveCount(3);
    await expect(clipping.getByText("Born 28 September 1852")).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    // Folded clippings are inert: out of the tab order and the accessibility tree.
    await expect(clipping.getByRole("link", { name: "Read on Wikipedia" })).toHaveCount(1);
  });

  test("opens with the keyboard, and Escape folds it back to the button", async ({ page }) => {
    const toggle = toggleIn(week(page));
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  test("a fact without a suitable picture is printed text-only", async ({ page }) => {
    const clipping = week(page);
    await toggleIn(clipping).click();
    const story = clipping.locator("article").filter({ hasText: "A cow wanders into a cathedral" });
    await expect(story).toBeVisible();
    await expect(story.locator("img, figure, figcaption")).toHaveCount(0);
  });

  test("on every screen the oddities open below the clipping, in their measured space", async ({ page }) => {
    const clipping = week(page);
    const main = clipping.locator("[data-pin='clipping']").first();
    await toggleIn(clipping).click();
    await expect.poll(async () => (await extraBoxes(clipping)).every(({ height }) => height > 0)).toBe(true);
    // Settled: the space has grown to fit them, so the next pin moves down rather than being covered.
    await expect.poll(async () => {
      const boxes = await extraBoxes(clipping);
      const mainBox = await main.evaluate((element) => element.getBoundingClientRect().bottom + window.scrollY);
      const saved = await page.locator("[data-fixture='saved']").evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
      const last = boxes.at(-1)!;
      return boxes[0].y >= mainBox && boxes[1].y >= boxes[0].y + boxes[0].height && saved >= last.y + last.height;
    }).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test("on the Board, the open oddities cover none of the pins beside the clipping", async ({ page }) => {
    await page.goto("/#outside-work");
    const clipping = page.locator("[data-board-pin='clipping']");
    await toggleIn(clipping).click();
    await expect.poll(async () => (await extraBoxes(clipping)).every(({ height }) => height > 0)).toBe(true);
    await page.waitForTimeout(700);
    const extras = await extraBoxes(clipping);
    const others = await page.locator("[data-board-pin]:not([data-board-pin='clipping'])").evaluateAll((pins) =>
      pins.map((pin) => {
        const box = pin.getBoundingClientRect();
        return { name: pin.getAttribute("data-board-pin"), x: box.x, y: box.y + window.scrollY, width: box.width, height: box.height };
      }),
    );
    for (const extra of extras) {
      for (const pin of others) {
        const overlaps = extra.x < pin.x + pin.width && pin.x < extra.x + extra.width && extra.y < pin.y + pin.height && pin.y < extra.y + extra.height;
        expect(overlaps, `an open oddity covers the ${pin.name} pin`).toBe(false);
      }
    }
  });

  test("with reduced motion the fan-out is instant", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const clipping = week(page);
    // What the spring animates: each clipping's transform and opacity, and the narrow-screen space.
    const animated = () =>
      clipping.locator("[data-clipping-extra]").evaluateAll((extras) =>
        extras.map((extra) => [getComputedStyle(extra).transform, getComputedStyle(extra).opacity, (extra.closest("[id]") as HTMLElement).style.height]),
      );
    await toggleIn(clipping).click();
    // Two frames for React to commit the change; a spring would still be moving after that.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const first = await animated();
    await page.waitForTimeout(700);
    expect(await animated()).toEqual(first);
  });

  test("the saved examples print from the archive, by year, with their own sources", async ({ page }) => {
    const saved = page.locator("[data-fixture='saved']");
    await expect(saved.getByText("From the archive")).toBeVisible();
    await expect(saved.getByText(/Vol\./)).toHaveCount(0);
    await expect(saved.getByText("1783", { exact: true })).toBeVisible();
    await expect(saved.getByRole("link", { name: "Read more" }).first()).toHaveAttribute("href", /airandspace\.si\.edu/);
    await expect(saved.getByRole("link", { name: "Browse history on Wikipedia" })).toHaveAttribute("href", "https://en.wikipedia.org/wiki/Portal:History");
  });

  test("text keeps AA contrast by day and at night, and passes axe open and closed", async ({ page }) => {
    const selector = "[data-fixture] :is(p, a, h3, figcaption, button)";
    const axe = () => new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    expect((await axe()).violations).toEqual([]);
    await toggleIn(week(page)).click();
    await page.waitForTimeout(800);
    expect((await axe()).violations).toEqual([]);
    await page.evaluate(() => (document.documentElement.dataset.lights = "on"));
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}" at night`).toBeGreaterThanOrEqual(4.5);
  });
});
