import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";

// The fixtures page has no header or light switch, so night is set as the switch would set it.
const lightsOn = (page: Page) => page.evaluate(() => (document.documentElement.dataset.lights = "on"));
const pin = (page: Page, name: string) => page.locator(`[data-fixture='${name}'] [data-board-pin='training']`);

test.describe("The training pin on the Board", () => {
  test("is the running photo with its caption, and the legacy card is gone", async ({ page }) => {
    await page.goto("/#outside-work");
    const training = page.locator("[data-board-pin='training']");
    await expect(training.getByRole("img", { name: "Elias mid-run on a rainy street in central London" })).toBeVisible();
    await expect(training.getByText("Out on a run, central London.")).toBeVisible();
    await expect(page.locator(".signal-training, .training-rhythm")).toHaveCount(0);
    await expect(page.getByText(/Typical week|My weekly training plan/)).toHaveCount(0);
  });
});

test.describe("Training states", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/training");
  });

  test("the diary card counts the week in tally marks, with a pencilled note", async ({ page }) => {
    const card = pin(page, "week").locator("[data-training-log]");
    await expect(card.getByText("Training this week", { exact: true })).toBeVisible();
    await expect(card.getByText("via Strava", { exact: true })).toBeVisible();
    await expect(card.getByText("Lifts", { exact: true })).toBeVisible();
    await expect(card.getByText("Runs", { exact: true })).toBeVisible();
    await expect(card.getByText("Busy week.", { exact: true })).toBeVisible();
    // Four strokes for the lifts; two for the runs.
    await expect(card.locator("svg.board-tally").first().locator("line")).toHaveCount(4);
    await expect(card.locator("svg.board-tally").nth(1).locator("line")).toHaveCount(2);
    await expect(card.getByText(/Muay Thai|Other/)).toHaveCount(0);
  });

  test("screen readers hear the card as one sentence", async ({ page }) => {
    const card = pin(page, "week").locator("[data-training-log]");
    await expect(card.locator(".sr-only")).toHaveText("Training this week, from Strava: 4 lifts and 2 runs. Busy week.");
    const spokenTwice = await card.locator("p, span").evaluateAll((elements) =>
      elements.filter((element) => element.textContent?.trim() && !element.closest("[aria-hidden='true'], .sr-only")).map((element) => element.textContent),
    );
    expect(spokenTwice).toEqual([]);
  });

  test("Muay Thai and Other appear once logged, and a big tally stops at three gates", async ({ page }) => {
    const card = pin(page, "every-category").locator("[data-training-log]");
    for (const row of ["Lifts", "Runs", "Muay Thai", "Other"]) await expect(card.getByText(row, { exact: true })).toBeVisible();
    await expect(card.getByText("17", { exact: true })).toBeVisible();
    // Three gates of five: four strokes and a fifth across each.
    await expect(card.locator("svg.board-tally").nth(1).locator("line")).toHaveCount(15);
  });

  test("with nothing logged yet, the card says so", async ({ page }) => {
    const card = pin(page, "nothing-yet").locator("[data-training-log]");
    await expect(card.getByText("Rest days, so far.", { exact: true })).toBeVisible();
    await expect(card.locator("svg.board-tally")).toHaveCount(0);
  });

  test("without Strava, the photo and caption stand alone", async ({ page }) => {
    const training = pin(page, "no-strava");
    await expect(training.getByRole("img", { name: "Elias mid-run on a rainy street in central London" })).toBeVisible();
    await expect(training.getByText("Out on a run, central London.")).toBeVisible();
    await expect(training.locator("[data-training-log]")).toHaveCount(0);
  });

  test("past its limit the card is sun-faded with its date, and the photo isn't", async ({ page }) => {
    const card = pin(page, "stale").locator("[data-training-log]");
    await expect(card).toHaveAttribute("data-pin-state", "stale");
    await expect(card.getByText("as of 22 Sept", { exact: true })).toBeVisible();
    await expect(pin(page, "stale").locator("[data-pin='photo']")).not.toHaveClass(/board-stale/);
  });

  test("fits without sideways scroll", async ({ page }) => {
    const width = page.viewportSize()!.width;
    for (const name of ["week", "every-category"]) {
      const box = (await pin(page, name).boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });

  test("text keeps AA contrast by day and at night, and passes axe", async ({ page }) => {
    const selector = "[data-board-pin='training'] :is(p, span):not(.sr-only)";
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    await lightsOn(page);
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}" at night`).toBeGreaterThanOrEqual(4.5);
    const results = await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
