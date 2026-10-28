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
      // The spaced tap helper waits longer than a look takes to fold, so these taps are made as quickly as a thumb could.
      await row(page).click();
      await expect(open(page)).toHaveAttribute("data-leaving", "");
      await row(page).click();
      await expect(open(page)).not.toHaveAttribute("data-leaving", "");
      // It is the same look, still there well after the first fold's removal would have fired.
      await page.waitForTimeout(500);
      await expect(open(page)).toBeVisible();
    });

    test("scrolling while a look opens is the user's: the page is not pulled back to the tapped row", async ({ page, browserName }) => {
      // Headless WebKit's own scroll anchoring moves the page a moment after a synthetic wheel scroll while the look grows, with no
      // call to scrollBy from the page, so what this guards (the page's own correction) can only be told apart in Chromium.
      test.skip(browserName === "webkit", "WebKit moves the page itself while a look opens");
      const before = await page.evaluate(() => window.scrollY);
      await row(page).click();
      await page.mouse.wheel(0, 240);
      // Wheel scrolling can take a moment to run its course, and the hold lasts 400 ms: it must end with the page where the user took it.
      await page.waitForTimeout(600);
      await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 }).toBeGreaterThan(before + 120);
    });

    test("following the employer's link right after opening its look leaves the next page where it loads", async ({ page }) => {
      const object = page.locator('#work button[data-look-tap="joveen"]');
      await object.scrollIntoViewIfNeeded();
      await object.click();
      await page.locator('#work a.qi-row[href="/work/joveen"]').click();
      await expect(page).toHaveURL(/\/work\/joveen$/);
      // The hold's frame loop is gone with the controller: nothing scrolls the new page afterwards.
      await page.waitForTimeout(700);
      expect(await page.evaluate(() => window.scrollY)).toBeLessThan(40);
    });

    test("a look above the tapped row goes at once and the row does not move, however slow the page", async ({ page, browserName }) => {
      const cores = page.locator('.qi-word[data-look="cores"]');
      await cores.scrollIntoViewIfNeeded();
      await tap(page, cores);
      const above = page.locator('[data-look-slot="cores"] .qi-inline__in');
      await expect(above).toBeVisible();
      const object = page.locator('#work button[data-look-tap="joveen"]');
      // The look has finished growing once the row below it stops moving down the page.
      await expect
        .poll(async () => {
          const first = (await object.boundingBox())!.y;
          await page.waitForTimeout(150);
          return Math.abs((await object.boundingBox())!.y - first);
        })
        .toBe(0);
      await object.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
      const before = (await object.boundingBox())!.y;
      // Where the engine allows it (Chromium) the page is as slow as it can be made: a fold above the row would be left behind by it,
      // but a look that goes at once cannot be.
      const cdp = browserName === "chromium" ? await page.context().newCDPSession(page) : null;
      await cdp?.send("Emulation.setCPUThrottlingRate", { rate: 6 });
      await object.click();
      // Gone in the commit that opens the next look, not after a fold (which takes 340 ms before it is unmounted, and longer on a slow page).
      await expect(above).toHaveCount(0, { timeout: 250 });
      await expect.poll(async () => Math.abs((await object.boundingBox())!.y - before)).toBeLessThanOrEqual(1);
      await cdp?.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    });

    test("closing again while it folds starts a new fold that the first one's timer cannot cut short", async ({ page }) => {
      await page.clock.install();
      await tap(page, row(page));
      await expect(open(page)).toBeVisible();
      // On a clock the test drives: close and reopen at once, then close again 120 ms later. The first fold's removal is due 340 ms
      // after the first close and the second's 120 ms after that, so at 350 ms only the second fold is still going.
      await row(page).evaluate((element: HTMLElement) => {
        element.click();
        element.click();
      });
      await page.clock.runFor(120);
      await row(page).evaluate((element: HTMLElement) => element.click());
      await page.clock.runFor(230);
      await expect(open(page)).toHaveAttribute("data-leaving", "");
      await page.clock.runFor(200);
      await expect(open(page)).toHaveCount(0);
    });
  });

  test("with reduced motion it goes at once", async ({ page }) => {
    await tap(page, row(page));
    await expect(open(page)).toBeVisible();
    await tap(page, open(page).locator(".qi-look"));
    await expect(open(page)).toHaveCount(0);
  });
});
