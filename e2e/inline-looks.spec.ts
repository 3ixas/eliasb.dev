import { expect, test, type Locator, type Page } from "@playwright/test";
import { tap } from "./support/tap";

/*
 * Inline closer looks on phones and touch (docs/design/DESIGN.md, "Inline"): below 1180 px a closer look opens
 * under its row, only when tapped. These run on Off the clock's training row, a plain row, and the book below it, a link
 * whose look opens on a tap, on fixed data (/fixtures/closer-looks, "pair"): no page shows these rows since #416.
 * The spec retires with Off the clock's rows in #416.
 */

const section = (page: Page) => page.locator('[data-fixture="pair"]');
const row = (page: Page, id: string) => section(page).locator(`.qi-row[data-look-tap="${id}"]`);
const openLooks = (page: Page) => page.locator(".qi-inline__in");
const inlineLook = (page: Page, id: string) => section(page).locator(`[data-look-slot="${id}"] .qi-look`);
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
const [plain, below] = ["training", "book"];
const narrow = (page: Page) => (page.viewportSize()?.width ?? 0) < 1180;

test.describe("Inline closer looks", () => {
  test.skip(({ page }) => !narrow(page), "the wide layout shows the margin instead");

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/fixtures/closer-looks");
    // The controller listens through React's props on the column, which exist only once it has hydrated; a tap before that does nothing.
    await page.waitForFunction(() => {
      const column = document.querySelector('[data-fixture="pair"] [data-quiet-column]');
      return !!column && Object.keys(column).some((key) => key.startsWith("__reactProps$"));
    });
  });

  test("scrolling the whole page opens nothing", async ({ page }) => {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height; y += 300) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await page.waitForTimeout(40);
    }
    await expect(openLooks(page)).toHaveCount(0);
    await expect(page.locator(".qi-margin")).toHaveCount(0);
  });

  test("opening a second closer look closes the first, and tapping outside any trigger leaves one open", async ({ page }) => {
    await tap(page, row(page, plain));
    await expect(inlineLook(page, plain)).toBeVisible();
    await tap(page, row(page, below));
    await expect(inlineLook(page, below)).toBeVisible();
    await expect(openLooks(page)).toHaveCount(1);
    await expect(inlineLook(page, plain)).toHaveCount(0);
    await page.locator("body").click({ position: { x: 4, y: 4 } });
    await expect(openLooks(page)).toHaveCount(1);
    await expect(inlineLook(page, below)).toBeVisible();
  });

  test("when a look above the tapped row closes, the tapped row stays where it was on screen", async ({ page }) => {
    await tap(page, row(page, plain));
    await expect(inlineLook(page, plain)).toBeVisible();
    const lower = row(page, below);
    // Let the look finish opening (the row stops moving), then put the lower row mid-screen: centring it while the look still grows
    // leaves it off-screen when the look is done, and Playwright's own scroll-into-view on the tap would move it.
    const stopsMoving = async () => {
      const first = (await boxOf(lower)).y;
      await page.waitForTimeout(250);
      return first === (await boxOf(lower)).y;
    };
    await expect.poll(stopsMoving).toBe(true);
    await lower.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect.poll(stopsMoving).toBe(true);
    const before = (await boxOf(lower)).y;
    await tap(page, lower, { position: { x: 100, y: 20 } });
    await expect(inlineLook(page, below)).toBeVisible();
    await expect(inlineLook(page, plain)).toHaveCount(0);
    await expect.poll(async () => Math.abs((await boxOf(lower)).y - before)).toBeLessThanOrEqual(2);
  });

  test("a plain row opens from anywhere on it and closes when tapped again; Enter does the same from the keyboard", async ({ page }) => {
    const plainRow = row(page, plain);
    await plainRow.click({ position: { x: 20, y: 10 } });
    await expect(inlineLook(page, plain)).toBeVisible();
    // WebKit folds a second click inside its double-click interval into the first; a person's second tap comes later.
    await page.waitForTimeout(600);
    await plainRow.click({ position: { x: 200, y: 10 } });
    await expect(openLooks(page)).toHaveCount(0);
    await plainRow.focus();
    await page.keyboard.press("Enter");
    await expect(inlineLook(page, plain)).toBeVisible();
    await page.keyboard.press("Space");
    await expect(openLooks(page)).toHaveCount(0);
    await page.keyboard.press("Enter");
    await expect(inlineLook(page, plain)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(openLooks(page)).toHaveCount(0);
  });

  test("the inline look is aria-hidden, holds no controls, and leaves the row's description unchanged", async ({ page }) => {
    const plainRow = row(page, plain);
    const describedBefore = await plainRow.evaluate((element) => document.getElementById(element.getAttribute("aria-describedby")!)!.textContent);
    await tap(page, plainRow);
    await expect(inlineLook(page, plain)).toBeVisible();
    await expect(section(page).locator(`[data-look-slot="${plain}"]`)).toHaveAttribute("aria-hidden", "true");
    await expect(section(page).locator(`[data-look-slot="${plain}"] a, [data-look-slot="${plain}"] button`)).toHaveCount(0);
    await expect(plainRow).toHaveAccessibleDescription(describedBefore!);
  });

  test("rows are at least 44 px, and nothing scrolls sideways with any closer look open", async ({ page }) => {
    for (const id of [plain, below]) {
      expect((await boxOf(row(page, id))).height).toBeGreaterThanOrEqual(44);
      await tap(page, row(page, id));
      const look = inlineLook(page, id);
      await expect(look).toBeVisible();
      await expect.poll(async () => (await boxOf(look)).height).toBeGreaterThan(40);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      const box = await boxOf(look);
      expect(box.x + box.width, `${id}'s look stays inside the screen`).toBeLessThanOrEqual(page.viewportSize()!.width);
    }
  });

  test("reduced motion: a closer look fades in over 0.2 s with no height animation or arrival motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await tap(page, row(page, plain));
    const look = inlineLook(page, plain);
    await expect(look).toBeVisible();
    await expect(look).toHaveCSS("animation-name", "qi-fade");
    await expect(look).toHaveCSS("animation-duration", "0.2s");
    await expect(section(page).locator(`[data-look-slot="${plain}"]`)).toHaveCSS("animation-name", "none");
    // Nothing inside the look plays its arrival: the fade on the look itself is all that moves.
    expect(await look.evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => (animation.effect as KeyframeEffect | null)?.target !== element).length)).toBe(0);
  });
});
