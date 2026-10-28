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
    await page.evaluate(() => document.fonts.ready);
    // Measured in the page, and polled: a slow runner may still be laying out hydrated content or swapping the display font.
    const measure = () =>
      page.evaluate((bleed) => {
        const offenders: string[] = [];
        // What shows is the box clipped by every ancestor that clips: a screenshot crop inside its frame is as wide as the frame.
        const visible = (element: Element) => {
          let { left, right } = element.getBoundingClientRect();
          for (let parent = element.parentElement; parent; parent = parent.parentElement) {
            if (getComputedStyle(parent).overflowX === "visible") continue;
            const clip = parent.getBoundingClientRect();
            left = Math.max(left, clip.left);
            right = Math.min(right, clip.right);
          }
          return { left, right };
        };
        // On phones the featured projects are cards in a strip that scrolls sideways, edge to edge; elsewhere the list is plain rows.
        const strips = [...document.querySelectorAll<HTMLElement>(".qi-list:has([data-card])")].filter(
          (list) => getComputedStyle(list).overflowX !== "visible",
        );
        for (const column of document.querySelectorAll<HTMLElement>(".qi-column")) {
          const { left, right } = column.getBoundingClientRect();
          for (const element of column.querySelectorAll<HTMLElement>("*")) {
            if (element.closest("[data-margin], svg, [hidden]") || strips.some((strip) => strip.contains(element))) continue;
            const box = element.getBoundingClientRect();
            if (box.width === 0 || box.height === 0) continue;
            const shown = visible(element);
            if (shown.left < left - bleed - 1 || shown.right > right + bleed + 1) {
              offenders.push(`${column.parentElement?.id || "opening"}: ${element.tagName.toLowerCase()}.${element.className}`);
            }
          }
        }
        // The strip itself stays inside the window.
        for (const strip of strips) {
          const { left, right } = strip.getBoundingClientRect();
          if (left < 0 || right > innerWidth) offenders.push(`strip: ${Math.round(left)} to ${Math.round(right)}`);
        }
        return offenders;
      }, rowBleed);
    await expect.poll(measure).toEqual([]);
  });
});
