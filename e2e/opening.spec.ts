import { expect, test, type Page } from "@playwright/test";

const headline = "I build everyday software, and make complicated things feel simple.";
const isOpening = (page: Page) => page.evaluate(() => document.documentElement.hasAttribute("data-opening"));
const typedText = (page: Page) => page.evaluate(() => document.querySelector("[data-opening-layer] > span")?.textContent ?? "");

test.describe("Opening", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });

  test("types the headline, lands it, and pins the card", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    // The heading is complete for assistive technology throughout.
    await expect(heading).toHaveAccessibleName(headline);
    expect(await isOpening(page)).toBe(true);
    const card = page.locator("[data-opening-card] [data-pin]");
    expect(Math.abs(parseFloat(await card.evaluate((element) => getComputedStyle(element).rotate)))).toBeGreaterThan(1);

    await expect.poll(() => typedText(page)).toMatch(/^I build/);
    await expect.poll(() => typedText(page), { timeout: 6000 }).toBe("I build everyday software, and make complicated things ");
    await expect(heading).toHaveAccessibleName(headline);

    await expect.poll(() => isOpening(page), { timeout: 8000 }).toBe(false);
    await expect(card).toHaveCSS("rotate", "-0.4deg");
    expect(await card.evaluate((element) => element.getAnimations().length)).toBe(0);
    await expect(page.locator("[data-opening-layer]")).toBeEmpty();
    await expect(page.locator("[data-opening-source]").first()).toHaveCSS("opacity", "1");
  });

  test("the rest of the Board is there from the first frame", async ({ page }) => {
    await page.goto("/");
    expect(await isOpening(page)).toBe(true);
    await expect(page.locator("[data-board-header]")).toBeVisible();
    await expect(page.locator("#work")).toBeAttached();
    await expect(page.getByText("Elias Bennett · Software engineer · London")).toBeVisible();
  });

  test("the typed copy breaks lines exactly where the heading does", async ({ page }) => {
    await page.goto("/");
    // Both sit in the same transformed card, so their line tops are comparable.
    const lineTops = (selector: string) =>
      page.evaluate((query) => {
        const tops: number[] = [];
        document.querySelectorAll(query).forEach((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          for (const rect of range.getClientRects()) if (rect.width > 1) tops.push(rect.top);
        });
        // The card is slightly rotated, so pieces of one line differ by a few
        // pixels; anything closer than half a line is the same line.
        const lineHeight = parseFloat(getComputedStyle(document.querySelector("h1")!).lineHeight);
        const lines: number[] = [];
        for (const top of tops.sort((a, b) => a - b)) {
          if (!lines.length || top - lines[lines.length - 1] > lineHeight / 2) lines.push(top);
        }
        return lines.map(Math.round);
      }, selector);
    await expect.poll(() => typedText(page)).toMatch(/^I build every/);
    const heading = await lineTops("[data-opening-lead]");
    const copy = await lineTops("[data-opening-layer] > span:first-child, [data-opening-layer] > .board-untyped");
    expect(copy.length).toBe(heading.length);
    copy.forEach((top, line) => expect(Math.abs(top - heading[line])).toBeLessThan(4));
  });

  test("plays again on reload", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => isOpening(page), { timeout: 8000 }).toBe(false);
    await page.reload();
    expect(await isOpening(page)).toBe(true);
  });

  test("does not play on client-side navigation back home", async ({ page }) => {
    await page.goto("/work/threshold");
    await page.getByRole("link", { name: "Elias Bennett, home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(headline);
    expect(await isOpening(page)).toBe(false);
    await expect(page.locator("[data-opening-layer]")).toBeEmpty();
  });

  test("a quick round trip mid-opening never leaves the heading blank", async ({ page }) => {
    await page.goto("/");
    expect(await isOpening(page)).toBe(true);
    await page.locator('#work a[href="/work/threshold"]').first().click();
    await expect(page).toHaveURL(/\/work\/threshold$/);
    await page.getByRole("link", { name: "Elias Bennett, home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("[data-opening-source]").first()).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-opening-layer]")).toBeEmpty();
  });

  test("does not play when coming back with the browser's Back button", async ({ page }) => {
    await page.goto("/");
    await page.goto("/work");
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(headline);
    expect(await isOpening(page)).toBe(false);
  });

  test("does not play when arriving at a section", async ({ page }) => {
    await page.goto("/#work");
    expect(await isOpening(page)).toBe(false);
  });

  test("shows the finished headline with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    expect(await isOpening(page)).toBe(false);
    await expect(page.locator("[data-opening-source]").first()).toHaveCSS("opacity", "1");
  });

  test("gives up and shows the finished headline if the page stalls", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => typedText(page)).toMatch(/^I build/);
    // Hold the main thread, as a long task during loading would.
    await page.evaluate(() => {
      const until = performance.now() + 2500;
      while (performance.now() < until) {
        // busy
      }
    });
    await expect.poll(() => isOpening(page), { timeout: 1500 }).toBe(false);
    await expect(page.locator("[data-opening-source]").first()).toHaveCSS("opacity", "1");
  });

  test("finishes at once if reduced motion is switched on midway", async ({ page }) => {
    await page.goto("/");
    expect(await isOpening(page)).toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => isOpening(page)).toBe(false);
    await expect(page.locator("[data-opening-layer]")).toBeEmpty();
  });
});

test.describe("Opening with JavaScript blocked", () => {
  test.use({ javaScriptEnabled: false });

  test("shows the complete headline", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveAccessibleName(headline);
    await expect(page.locator("[data-opening-source]").first()).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-opening-layer]")).toBeEmpty();
  });
});
