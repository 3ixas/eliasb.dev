import { expect, test, type Page } from "@playwright/test";
import { tap } from "./support/tap";

// An inline closer look closes the way it opens (docs/design/DESIGN.md, "Inline"): tapping the row, its object or the look
// itself folds it away, and the row it belongs to stays where it was on screen.

const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 761;

const hydrated = (page: Page) =>
  page.waitForFunction(() => {
    const columns = [...document.querySelectorAll("[data-quiet-column]")];
    return columns.length > 0 && columns.every((column) => Object.keys(column).some((key) => key.startsWith("__reactProps$")));
  });

const row = (page: Page) => page.locator("#off-the-clock .qi-row[data-look-tap='training']");
/** Where the row sits on the page, whatever the scroll: a tap scrolls its target into view before it lands. */
const rowTop = (page: Page) => row(page).evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
const open = (page: Page) => page.locator("#off-the-clock [data-look-slot='training'] .qi-inline__in");

test.describe("Inline closer looks close as smoothly as they open", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!phone(page), "Inline looks are for phones and touch");
    await page.goto("/");
    await hydrated(page);
    await row(page).scrollIntoViewIfNeeded();
  });

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("tapping the open look folds it away, and the row does not move", async ({ page }) => {
      await tap(page, row(page));
      await expect(open(page)).toBeVisible();
      await expect.poll(() => open(page).evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(100);
      const before = await rowTop(page);
      await tap(page, open(page).locator(".qi-look"));
      // It is folding, not gone: it stays in place, marked, while its height runs down.
      await expect(open(page)).toHaveAttribute("data-leaving", "");
      await expect(open(page)).toHaveCount(0, { timeout: 2000 });
      expect(Math.abs((await rowTop(page)) - before)).toBeLessThan(1);
    });

    test("the row itself closes it, and a tap while it folds opens it again", async ({ page }) => {
      await tap(page, row(page));
      await expect(open(page)).toBeVisible();
      await tap(page, row(page));
      await expect(open(page)).toHaveAttribute("data-leaving", "");
      await tap(page, row(page));
      await expect(open(page)).toBeVisible();
      await expect(open(page)).not.toHaveAttribute("data-leaving", "");
    });
  });

  test("with reduced motion it goes at once", async ({ page }) => {
    await tap(page, row(page));
    await expect(open(page)).toBeVisible();
    await tap(page, open(page).locator(".qi-look"));
    await expect(open(page)).toHaveCount(0);
  });
});
