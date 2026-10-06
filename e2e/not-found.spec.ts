import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("The 404", () => {
  test("says something was pinned here, with a 404 status", async ({ page }) => {
    const response = await page.goto("/nothing-pinned-here");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle("Nothing pinned here · Elias Bennett");
    await expect(page.getByRole("heading", { level: 1, name: "Something was pinned here." })).toBeVisible();
    await expect(page.getByText("It’s been taken down, or it was never up. The rest of the board is still here.")).toBeVisible();
    const robots = await page.locator('meta[name="robots"]').evaluateAll((tags) => tags.map((tag) => tag.getAttribute("content")));
    expect(robots.length).toBeGreaterThan(0);
    for (const content of robots) expect(content).toMatch(/noindex/);
  });

  test("the gap is drawn on the linen, and only decoration", async ({ page }) => {
    await page.goto("/nothing-pinned-here");
    const gap = page.locator("[data-not-found-gap]");
    await expect(gap).toHaveAttribute("aria-hidden", "true");
    await expect(gap.locator('[data-fixing-mark="pushpin"]')).toBeVisible();
    await expect(gap.getByText("404")).toBeVisible();
    await expect(gap.locator("xpath=ancestor::*[@data-board-surface='linen']")).toHaveCount(1);
  });

  test("leads back to the board, and the header points at the home page's sections", async ({ page }) => {
    await page.goto("/nothing-pinned-here");
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Work" })).toHaveAttribute("href", "/#work");
    const back = page.getByRole("link", { name: "Back to the board" });
    const box = await back.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await back.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("has no axe violations, by day and by night", async ({ page }) => {
    await page.goto("/nothing-pinned-here");
    for (const lights of ["off", "on"]) {
      await page.evaluate((value) => (document.documentElement.dataset.lights = value), lights);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, `lights ${lights}`).toEqual([]);
    }
  });
});
