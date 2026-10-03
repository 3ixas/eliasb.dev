import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";

// The fixtures page has no header or light switch, so night is set as the switch would set it.
const lightsOn = (page: Page) => page.evaluate(() => (document.documentElement.dataset.lights = "on"));
const fixture = (page: Page, name: string) => page.locator(`[data-fixture='${name}']`);
const dayTag = /^(Nothing|\d+ contributions?) on [A-Z][a-z]{2} \d{1,2} [A-Z][a-z]{2,4}$/;

test.describe("GitHub and Making on the Board", () => {
  test("the Making blueprint is up, and the legacy GitHub card is gone", async ({ page }) => {
    await page.goto("/#outside-work");
    const making = page.locator("[data-board-pin='making']");
    await expect(making.getByText(/^(Now making|Latest on GitHub)$/)).toBeVisible();
    await expect(page.locator(".signal-building, .contribution-calendar, .outside-work-section")).toHaveCount(0);
    // The GitHub year is up only when there's a full year to show.
    const github = page.locator("[data-board-pin='github']");
    if (await github.count()) await expect(github.locator("button.board-github-day")).toHaveCount(365);
  });

  test("renders without a hydration mismatch", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrat|did not match/i.test(message.text())) problems.push(message.text());
    });
    await page.goto("/fixtures/github");
    await page.locator("[data-fixture='year'] button.board-github-day").first().waitFor();
    await page.goto("/#outside-work");
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
  });
});

test.describe("Making states", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/github");
  });

  test("the authored entry, with its title block", async ({ page }) => {
    const pin = fixture(page, "making");
    await expect(pin.getByText("Now making", { exact: true })).toBeVisible();
    await expect(pin.getByText("Rebuilding Professor Past from scratch.", { exact: true })).toBeVisible();
    await expect(pin.getByText("v1 is on GitHub if you want to meet the professor.", { exact: true })).toBeVisible();
    await expect(pin.getByRole("link", { name: "Code" })).toHaveAttribute("href", "https://github.com/3ixas/ask-professor-past");
    await expect(pin.getByText("Drawn E.B.", { exact: true })).toBeVisible();
    await expect(pin.getByText("v2", { exact: true })).toBeVisible();
  });

  test("after eight weeks it falls back to my latest public repository", async ({ page }) => {
    const pin = fixture(page, "making-fallback");
    await expect(pin.getByText("Latest on GitHub", { exact: true })).toBeVisible();
    await expect(pin.getByText("eliasb.dev", { exact: true })).toBeVisible();
    await expect(pin.getByRole("link", { name: "View on GitHub" })).toHaveAttribute("href", "https://github.com/3ixas/eliasb.dev");
    await expect(pin.locator("time")).toHaveAttribute("datetime", "2026-10-03T05:36:51.000Z");
    await expect(pin.getByText("updated 3 Oct", { exact: true })).toBeVisible();
  });

  test("with neither, the pin comes down", async ({ page }) => {
    await expect(fixture(page, "making-none")).toBeEmpty();
  });
});

test.describe("GitHub sheet states", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/github");
  });

  test("the year on graph paper, with the busiest stretch looped in pencil", async ({ page }) => {
    const sheet = fixture(page, "year");
    await expect(sheet.getByText("GitHub · the past year", { exact: true })).toBeVisible();
    await expect(sheet.getByText("contributions in the past year", { exact: true })).toBeVisible();
    await expect(sheet.getByRole("link", { name: "github.com/3ixas" })).toHaveAttribute("href", "https://github.com/3ixas");
    await expect(sheet.locator("button.board-github-day")).toHaveCount(365);
    await expect(sheet.locator("[data-busiest]")).toHaveCount(1);
    await expect(sheet.getByText("← busiest stretch, mid-January", { exact: true })).toBeVisible();
    await expect(sheet.getByRole("group", { name: /^GitHub contributions over the past year: [\d,]+, busiest in mid-January\.$/ })).toBeVisible();
  });

  test("a day's count shows on hover, focus and tap", async ({ page }) => {
    const sheet = fixture(page, "year");
    const days = sheet.locator("button.board-github-day");
    const tag = sheet.locator("[data-day-tag]");
    await expect(tag).toHaveCount(0);

    // Keyboard: the one tab stop is today; the arrow keys move a week or a day.
    const today = days.last();
    await today.focus();
    await expect(tag).toHaveText((await today.getAttribute("aria-label"))!);
    await page.keyboard.press("ArrowLeft");
    const weekBefore = days.nth(364 - 7);
    await expect(weekBefore).toBeFocused();
    await expect(tag).toHaveText((await weekBefore.getAttribute("aria-label"))!);
    await expect(tag).toHaveText(dayTag);
    await page.keyboard.press("Escape");
    await expect(tag).toHaveCount(0);

    // Pointer or tap: a click selects the day too.
    const spring = days.nth(200);
    await spring.scrollIntoViewIfNeeded();
    await spring.click();
    await expect(tag).toHaveText((await spring.getAttribute("aria-label"))!);
    await expect(sheet.locator("button.board-github-day[tabindex='0']")).toHaveCount(1);
  });

  test("on phones only the year scrolls sideways, with a hint", async ({ page }) => {
    const width = page.viewportSize()!.width;
    const scroller = fixture(page, "year").locator("[data-github-scroll]");
    const hint = fixture(page, "year").getByText("Swipe for the whole year →", { exact: true });
    if (width < 900) {
      expect(await scroller.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
      await expect(hint).toBeVisible();
    } else {
      await expect(hint).toBeHidden();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });

  test("a year more than 3 days old is sun-faded with its date", async ({ page }) => {
    const pin = fixture(page, "year-stale").locator("[data-board-pin='github']");
    await expect(pin).toHaveAttribute("data-pin-state", "stale");
    await expect(pin.getByText("as of 27 Sept", { exact: true })).toBeVisible();
  });

  test("text keeps AA contrast by day and at night, and passes axe", async ({ page }) => {
    const selector = "[data-board-pin='making'] :is(p, a, span), [data-fixture='year'] :is(p, a):not(.sr-only)";
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    await lightsOn(page);
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}" at night`).toBeGreaterThanOrEqual(4.5);
    const results = await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
