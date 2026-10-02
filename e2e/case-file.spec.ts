import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const tabs = [
  { name: "Problem", id: "problem" },
  { name: "Decisions", id: "decisions" },
  { name: "How it’s built", id: "how-its-built" },
  { name: "What I’d change", id: "what-id-change" },
];

test.describe("Case-file folder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work/threshold");
  });

  test("opens as a stamped folder with the thesis and a clipped screenshot", async ({ page }) => {
    const folder = page.getByRole("article", { name: "Threshold" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Threshold");
    await expect(folder.getByText("Case file Nº 01")).toBeVisible();
    await expect(folder.locator("[data-fixing='adhesive'][data-surface='paper']")).toContainText("A clearer view of what moving could cost.");
    const screenshot = folder.locator("[data-fixing='clip'] img").first();
    await expect(screenshot).toHaveAttribute("alt", /.{20,}/);
    await expect(folder.locator("[data-fixing='clip'] [data-fixing-mark='clip']").first()).toBeVisible();
    await expect(folder.getByRole("list", { name: "Built with" }).getByRole("listitem")).toHaveText(["React 19", "TypeScript", "MapLibre"]);
  });

  test("each divider tab jumps to its section", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Sections" });
    await expect(nav.getByRole("link")).toHaveText(tabs.map(({ name }) => name));
    for (const { name, id } of tabs) {
      const tab = nav.getByRole("link", { name });
      const box = (await tab.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await tab.click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      const section = page.getByRole("region", { name: await page.locator(`#${id} h2`).innerText() });
      await expect(section).toBeInViewport();
      // The heading clears the sticky header.
      const header = (await page.locator("[data-board-header]").boundingBox())!;
      const heading = (await section.getByRole("heading", { level: 2 }).boundingBox())!;
      expect(heading.y).toBeGreaterThanOrEqual(header.y + header.height);
    }
  });

  test("the divider tabs are reachable by keyboard", async ({ page, browserName }) => {
    const nav = page.getByRole("navigation", { name: "Sections" });
    const first = nav.getByRole("link", { name: "Problem" });
    // WebKit only tabs to links when the platform setting is on; focus directly.
    if (browserName === "webkit") await first.focus();
    else {
      await page.getByRole("link", { name: "Code" }).focus();
      await page.keyboard.press("Tab");
    }
    await expect(first).toBeFocused();
    await expect(first).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#problem$/);
  });

  test("Live and Code are clear buttons to the project", async ({ page }) => {
    const live = page.getByRole("link", { name: "Live site", exact: true });
    const code = page.getByRole("link", { name: "Code", exact: true });
    await expect(live).toHaveAttribute("href", "https://threshold-beta.vercel.app");
    await expect(code).toHaveAttribute("href", "https://github.com/3ixas/threshold");
    for (const link of [live, code]) {
      await expect(link).toBeVisible();
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("there is a clear way back to Work", async ({ page }) => {
    const back = page.getByRole("link", { name: "Back to Work" });
    await expect(back).toHaveCount(2);
    await expect(back.first()).toBeInViewport();
    await back.first().click();
    await expect(page).toHaveURL(/\/#work$/);
  });

  test("describes itself for search and sharing", async ({ page }) => {
    await expect(page).toHaveTitle("Threshold · Elias B.");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /what a move really costs/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/work\/threshold\/landing\.webp/);
  });

  test("on phones it is one column with gentle tilts", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1440) >= 900, "Phone layout only");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const sheet = (await page.locator("[data-board-surface='paper']").boundingBox())!;
    for (const pin of await page.locator("main [data-pin]").all()) {
      const angle = await pin.evaluate((element) => Math.abs(parseFloat(getComputedStyle(element).rotate) || 0));
      expect(angle).toBeLessThanOrEqual(1.5);
      const box = (await pin.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(sheet.x);
      expect(box.x + box.width).toBeLessThanOrEqual(sheet.x + sheet.width + 1);
    }
    // The divider tabs sit inside the sheet, not off its edge.
    const nav = (await page.getByRole("navigation", { name: "Sections" }).boundingBox())!;
    expect(nav.x + nav.width).toBeLessThanOrEqual(sheet.x + sheet.width);
  });

  test("passes axe, including contrast, in this colour scheme", async ({ page }) => {
    const results = await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
