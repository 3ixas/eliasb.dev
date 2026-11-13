import { expect, test, type Page } from "@playwright/test";

// Real classic scrollbars, which Playwright hides by default, so the reserved gutter has something to hold steady. In its own file because launch options apply to the whole worker.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

/** The page's left edge: the header's name, which every page shares (the homepage's h1 is in the page frame, not the column). */
const column = (page: Page) => page.locator("[data-site-header] .site-header__name").evaluate((element) => element.getBoundingClientRect().left);

test.beforeEach(({ page, browserName }) => {
  test.skip(browserName !== "chromium" || (page.viewportSize()?.width ?? 0) < 761, "Chromium on a desktop width");
});

test("opening a dialog does not move the column", async ({ page }) => {
  await page.goto("/things-i-make/threshold");
  const before = await column(page);
  const button = page.locator(".qi-case__below .qi-zoom").first();
  await expect.poll(() => button.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
  await button.click();
  await expect(page.locator(".qi-zoom__dialog").first()).toBeVisible();
  expect(await column(page)).toBeCloseTo(before, 1);
});

test("a short page and a tall one share a column", async ({ page }) => {
  await page.goto("/things-i-make");
  const short = await column(page);
  await page.goto("/");
  expect(await column(page)).toBeCloseTo(short, 1);
});
