import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { notFound } from "../src/content/stretch/site-copy";

test.describe("The 404", () => {
  test("shows the approved copy with a 404 status and no indexing", async ({ page }) => {
    const response = await page.goto("/nothing-here");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(`${notFound.title} · Elias Bennett`);
    await expect(page.getByRole("heading", { level: 1, name: notFound.heading })).toBeVisible();
    await expect(page.getByText(notFound.line)).toBeVisible();
    const robots = await page.locator('meta[name="robots"]').evaluateAll((tags) => tags.map((tag) => tag.getAttribute("content")));
    expect(robots.length).toBeGreaterThan(0);
    for (const content of robots) expect(content).toMatch(/noindex/);
  });

  test("the link home is a 44 px target and works", async ({ page }) => {
    await page.goto("/nothing-here");
    const back = page.getByRole("link", { name: "Back to the homepage" });
    expect((await back.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await back.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("has no entrance, no sideways scroll and no axe violations", async ({ page }) => {
    await page.goto("/nothing-here");
    await expect(page.locator("[data-entrance-layer]")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Redirects from the old routes", () => {
  for (const [from, anchor] of [
    ["/about", "#where-ive-been"],
    ["/lab", "#off-the-clock"],
    ["/library", "#off-the-clock"],
  ] as const) {
    test(`${from} redirects permanently to /${anchor}`, async ({ request, page }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      expect(response.headers()["location"]).toBe(`/${anchor}`);
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`/${anchor}$`));
      await expect(page.locator(anchor)).toHaveCount(1);
    });
  }
});
