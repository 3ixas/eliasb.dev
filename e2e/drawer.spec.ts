import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const folders = [
  { name: "Threshold", slug: "threshold" },
  { name: "Argus Risk", slug: "argus-risk" },
  { name: "Flowtime", slug: "flowtime" },
];

test.describe("Work drawer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work");
  });

  test("files every case study as a manila folder", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Everything I’ve built, filed.");
    await expect(page.getByText("Work archive · 3 case files")).toBeVisible();
    const items = page.getByRole("main").getByRole("listitem");
    await expect(items).toHaveCount(folders.length);
    for (const [index, { name, slug }] of folders.entries()) {
      const folder = items.nth(index).getByRole("article", { name });
      await expect(folder.getByRole("heading", { level: 2 })).toHaveText(name);
      await expect(folder.getByRole("link", { name: `Open the ${name} folder` })).toHaveAttribute("href", `/work/${slug}`);
    }
  });

  test("every folder tab shows and stays on the page", async ({ page }) => {
    const width = page.viewportSize()!.width;
    const tabs = await page.getByRole("heading", { level: 2 }).evaluateAll((headings) =>
      headings.map((heading) => heading.parentElement!.getBoundingClientRect()).map(({ left, right }) => ({ left, right })),
    );
    for (const tab of tabs) {
      expect(tab.left).toBeGreaterThanOrEqual(0);
      expect(tab.right).toBeLessThanOrEqual(width);
    }
    // Tabs are staggered, so no two start in the same place.
    expect(new Set(tabs.map(({ left }) => Math.round(left))).size).toBe(tabs.length);
  });

  test("the whole folder opens its case file", async ({ page }) => {
    const folder = page.getByRole("article", { name: "Argus Risk" });
    await folder.scrollIntoViewIfNeeded();
    const box = (await folder.boundingBox())!;
    // Click the folder's paper, away from the link text.
    await page.mouse.click(box.x + box.width - 16, box.y + box.height - 16);
    await expect(page).toHaveURL(/\/work\/argus-risk$/);
  });

  test("leads back to the Board", async ({ page }) => {
    await page.getByRole("link", { name: "Back to the Board" }).click();
    await expect(page).toHaveURL(/\/#work$/);
  });

  test("the home page opens the drawer", async ({ page }) => {
    await page.goto("/#work");
    await page.getByRole("link", { name: "View all work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Everything I’ve built, filed.");
  });

  test("nothing scrolls sideways", async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("passes axe, including contrast, in this colour scheme", async ({ page }) => {
    const results = await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
