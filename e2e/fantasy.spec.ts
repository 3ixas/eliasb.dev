import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";

// The fixtures page has no header or light switch, so night is set as the switch would set it.
const lightsOn = (page: Page) => page.evaluate(() => (document.documentElement.dataset.lights = "on"));
const stub = (page: Page, name: string) => page.locator(`[data-fixture='${name}'] [data-board-pin='fantasy']`);

test.describe("The fantasy ticket on the Board", () => {
  test("is up only in season, names my team alone, and links nowhere", async ({ page }) => {
    await page.goto("/#outside-work");
    const pin = page.locator("[data-board-pin='fantasy']");
    // Whether the pin is up depends on the real NFL calendar and Sleeper.
    if (await pin.count()) {
      await expect(pin.getByText(/^NFL fantasy · Week\s\d+$/)).toBeVisible();
      await expect(pin.getByText(/vs\. a rival who shall remain nameless$/)).toBeVisible();
      await expect(pin.getByText(/^0\.00 – 0\.00$/)).toHaveCount(0);
      await expect(pin.locator("a")).toHaveCount(0);
    }
    await expect(page.locator("a[href*='sleeper.com']")).toHaveCount(0);
    // The legacy fantasy card is gone from below the Board.
    await expect(page.locator(".signal-fantasy, .fantasy-scoreboard")).toHaveCount(0);
  });
});

test.describe("Fantasy ticket states", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/fantasy");
  });

  test("from Tuesday until Thursday kickoff, it shows last week's final and the record", async ({ page }) => {
    const pin = stub(page, "last-week");
    await expect(pin.getByText("NFL fantasy · Week 3", { exact: true })).toBeVisible();
    await expect(pin.getByText("Won", { exact: true })).toBeVisible();
    await expect(pin.getByText("Not even close.", { exact: true })).toBeVisible();
    await expect(pin.getByText("151.24 – 90.52", { exact: true })).toBeVisible();
    await expect(pin.getByText("K9 Unit vs. a rival who shall remain nameless", { exact: true })).toBeVisible();
    await expect(pin.getByText("Gates open Thursday night", { exact: true })).toBeVisible();
    await expect(pin.getByText("1–2 · Sleeper", { exact: true })).toBeVisible();
    await expect(pin.locator("a")).toHaveCount(0);
  });

  test("screen readers hear the stub as one passage", async ({ page }) => {
    await expect(stub(page, "last-week").locator(".sr-only")).toHaveText(
      "NFL fantasy, week 3. K9 Unit won 151.24 to 90.52 against a rival who shall remain nameless. Not even close. Season record: 1 win, 2 losses. Gates open Thursday night.",
    );
    // The visible parts and the sideways record are decoration for assistive technology.
    const spokenTwice = await stub(page, "last-week").locator("p, span").evaluateAll((elements) =>
      elements.filter((element) => element.textContent?.trim() && !element.closest("[aria-hidden='true'], .sr-only")).map((element) => element.textContent),
    );
    expect(spokenTwice).toEqual([]);
  });

  test("the pencilled verdict goes by the margin", async ({ page }) => {
    await expect(stub(page, "lost-close").getByText("By less than a field goal. Ouch.", { exact: true })).toBeVisible();
    await expect(stub(page, "lost-close").getByText("98.50 – 100.10", { exact: true })).toBeVisible();
    await expect(stub(page, "lost-blowout").getByText("Took me to the cleaners.", { exact: true })).toBeVisible();
    await expect(stub(page, "tied").getByText("Nobody’s happy.", { exact: true })).toBeVisible();
    await expect(stub(page, "tied").getByText("8–5–1 · Sleeper", { exact: true })).toBeVisible();
  });

  test("in play it shows this week's score, live or until the next window", async ({ page }) => {
    const between = stub(page, "between");
    await expect(between.getByText("NFL fantasy · Week 4", { exact: true })).toBeVisible();
    await expect(between.getByText("Ahead", { exact: true })).toBeVisible();
    await expect(between.getByText("Don’t jinx it.", { exact: true })).toBeVisible();
    await expect(between.getByText("24.60 – 0.00", { exact: true })).toBeVisible();
    await expect(between.getByText("Back on Sunday", { exact: true })).toBeVisible();

    const live = stub(page, "live");
    await expect(live.getByText("Behind", { exact: true })).toBeVisible();
    await expect(live.getByText("Plenty of time.", { exact: true })).toBeVisible();
    await expect(live.getByText("Live now", { exact: true })).toBeVisible();

    const monday = stub(page, "monday");
    await expect(monday.getByText("Level", { exact: true })).toBeVisible();
    await expect(monday.getByText("Anyone’s game.", { exact: true })).toBeVisible();
    await expect(monday.getByText("Back on Monday night", { exact: true })).toBeVisible();
  });

  test("a new week with no score yet keeps last week's final, never 0.00 – 0.00", async ({ page }) => {
    const pin = stub(page, "held-over");
    await expect(pin.getByText("NFL fantasy · Week 3", { exact: true })).toBeVisible();
    await expect(pin.getByText("151.24 – 90.52", { exact: true })).toBeVisible();
    await expect(pin.getByText(/Gates open|Live now|Back on/)).toHaveCount(0);
    await expect(page.getByText("0.00 – 0.00", { exact: true })).toHaveCount(0);
  });

  test("once my season is over there's no pin, and no gap", async ({ page }) => {
    await expect(page.locator("[data-fixture='season-over']")).toBeEmpty();
  });

  test("fits without sideways scroll, and a long team name wraps inside the stub", async ({ page }) => {
    const width = page.viewportSize()!.width;
    for (const name of ["last-week", "tied"]) {
      const box = (await stub(page, name).locator("[data-pin]").boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    const overflowing = await stub(page, "tied").locator("p:not(.sr-only)").evaluateAll((elements) =>
      elements.filter((element) => element.scrollWidth > element.clientWidth + 1).map((element) => element.textContent),
    );
    expect(overflowing).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });

  test("text keeps AA contrast by day and at night, and passes axe", async ({ page }) => {
    const selector = "[data-board-pin='fantasy'] [aria-hidden='true'] :is(p, span)";
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    await lightsOn(page);
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}" at night`).toBeGreaterThanOrEqual(4.5);
    const results = await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
