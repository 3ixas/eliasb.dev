import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";

// The fixtures page has no header or light switch, so night is set as the switch would set it.
const lightsOn = (page: Page) => page.evaluate(() => (document.documentElement.dataset.lights = "on"));
const plan = (page: Page, name: string) => page.locator(`[data-fixture='${name}'] [data-training-plan]`);
const week = [
  ["Mon", "Full-body gym"],
  ["Tue", "Zone 2 run"],
  ["Wed", "Full-body gym"],
  ["Thu", "Interval run"],
  ["Fri", "Full-body gym"],
  ["Sat", "Zone 2, rower or bike"],
  ["Sun", "Assault bike intervals"],
];

test.describe("The training pin on the Board", () => {
  test("is the running photo with my training week, and nothing from Strava", async ({ page }) => {
    await page.goto("/#outside-work");
    const training = page.locator("[data-board-pin='training']");
    await expect(training.getByRole("img", { name: "Elias mid-run on a rainy street in central London" })).toBeVisible();
    await expect(training.getByText("Out on a run, central London.")).toBeVisible();
    await expect(training.getByText("My training week", { exact: true })).toBeVisible();
    await expect(training.locator("[data-today]")).toHaveCount(1);
    await expect(page.getByText(/Strava/)).toHaveCount(0);
    await expect(page.locator(".signal-training, .training-rhythm")).toHaveCount(0);
  });
});

test.describe("Training plan states", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/training");
  });

  test("the diary page lists the week, labelled as the plan", async ({ page }) => {
    const page_ = plan(page, "saturday");
    await expect(page_.getByText("The plan", { exact: true })).toBeVisible();
    const rows = page_.locator("li");
    await expect(rows).toHaveCount(7);
    for (const [index, [day, session]] of week.entries()) {
      await expect(rows.nth(index)).toContainText(day);
      await expect(rows.nth(index)).toContainText(session);
    }
    await expect(page_.getByText("Zone 2 means slow on purpose.", { exact: true })).toBeVisible();
  });

  test("today is looped in pencil, by the day in London", async ({ page }) => {
    for (const [name, day] of [["monday", "Mon"], ["saturday", "Sat"], ["sunday", "Sun"]]) {
      const today = plan(page, name).locator("[data-today]");
      await expect(today, `today on the ${name} fixture`).toHaveCount(1);
      await expect(today).toContainText(day);
      // On narrow screens the pencil loop alone marks today, so the session keeps its room.
      const arrow = today.getByText("← today", { exact: true });
      if (page.viewportSize()!.width >= 400) await expect(arrow).toBeVisible();
      else await expect(arrow).toBeHidden();
    }
  });

  test("screen readers hear the plan once, today first", async ({ page }) => {
    const pin = page.locator("[data-fixture='saturday'] [data-board-pin='training']");
    await expect(pin.locator(".sr-only")).toHaveText(
      "My training week, the plan. Today, Saturday: zone 2, rower or bike. Monday: full-body gym. Tuesday: zone 2 run. Wednesday: full-body gym. Thursday: interval run. Friday: full-body gym. Sunday: assault bike intervals. Zone 2 means slow on purpose.",
    );
    const spokenTwice = await pin.locator("[data-pin='sheet'] :is(p, span, li)").evaluateAll((elements) =>
      elements.filter((element) => element.textContent?.trim() && !element.closest("[aria-hidden='true'], .sr-only")).map((element) => element.textContent),
    );
    expect(spokenTwice).toEqual([]);
  });

  test("is authored, so it never fades", async ({ page }) => {
    for (const pin of await page.locator("[data-board-pin='training']").all()) {
      await expect(pin).toHaveAttribute("data-pin-state", "current");
      await expect(pin.locator(".board-as-of")).toHaveCount(0);
    }
  });

  test("fits without sideways scroll", async ({ page }) => {
    const width = page.viewportSize()!.width;
    const box = (await page.locator("[data-fixture='saturday'] [data-board-pin='training']").boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
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
