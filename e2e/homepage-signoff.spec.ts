import { expect, test } from "@playwright/test";

// The removal rule (docs/design/DESIGN.md) as tests: the page with nothing open stays inside its length budget,
// and nothing but the margin is wider than the column plus the 12 px a row's hover fill bleeds into the gutter.

const heightBudget = { 1440: 3600, 390: 4220 } as const;
const rowBleed = 12;

test.describe("Homepage sign-off", () => {
  test("with nothing open the page fits the length budget", async ({ page }) => {
    const width = page.viewportSize()!.width;
    test.skip(!(width in heightBudget), "The budget is set at 1440 × 900 and 390 × 844");
    await page.goto("/");
    await expect(page.locator("#main-content > section")).toHaveCount(6);
    const budget = heightBudget[width as keyof typeof heightBudget];
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(budget);
  });

  test("nothing but the margin is wider than the column and its row bleed", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".qi-column")).toHaveCount(6);
    const wide = await page.evaluate((bleed) => {
      const offenders: string[] = [];
      // What shows is the box clipped by every ancestor that clips: a screenshot crop inside its frame is as wide as the frame.
      const visible = (element: Element) => {
        const box = element.getBoundingClientRect();
        let { left, right } = box;
        for (let parent = element.parentElement; parent; parent = parent.parentElement) {
          if (getComputedStyle(parent).overflowX === "visible") continue;
          const clip = parent.getBoundingClientRect();
          left = Math.max(left, clip.left);
          right = Math.min(right, clip.right);
        }
        return { left, right };
      };
      for (const column of document.querySelectorAll<HTMLElement>(".qi-column")) {
        const { left, right } = column.getBoundingClientRect();
        for (const element of column.querySelectorAll<HTMLElement>("*")) {
          if (element.closest("[data-margin], svg, [hidden], .qi-list:has([data-card])")) continue;
          const box = element.getBoundingClientRect();
          if (box.width === 0 || box.height === 0) continue;
          const shown = visible(element);
          if (shown.left < left - bleed - 1 || shown.right > right + bleed + 1) {
            offenders.push(`${column.parentElement?.id || "opening"}: ${element.tagName.toLowerCase()}.${element.className}`);
          }
        }
      }
      return offenders;
    }, rowBleed);
    // On phones the three featured projects are cards in a swipeable strip that runs edge to edge, so its contents are not measured
    // against the column; the strip itself must stay inside the window.
    const strip = page.locator(".qi-list:has([data-card])");
    const stripBox = await strip.boundingBox();
    const window = page.viewportSize()!;
    if (stripBox) {
      expect(stripBox.x).toBeGreaterThanOrEqual(0);
      expect(stripBox.x + stripBox.width).toBeLessThanOrEqual(window.width);
    }
    expect(wide).toEqual([]);
  });
});
