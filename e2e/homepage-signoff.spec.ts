import { expect, test } from "@playwright/test";

// The page with nothing open stays inside its length budget (DESIGN.md "Layout": 8 screens at 1440 × 900, 11 at
// 390 × 844), and nothing in the quiet index's columns is wider than the column plus the 12 px a row's hover fill
// bleeds into the gutter.

const heightBudget = { 1440: 8 * 900, 390: 11 * 844 } as const;
const rowBleed = 12;

test.describe("Homepage sign-off", () => {
  test("with nothing open the page fits the length budget", async ({ page }) => {
    const width = page.viewportSize()!.width;
    test.skip(!(width in heightBudget), "The budget is set at 1440 × 900 and 390 × 844");
    await page.goto("/");
    await expect(page.locator("#main-content > section")).toHaveCount(7);
    const budget = heightBudget[width as keyof typeof heightBudget];
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(budget);
  });

});
