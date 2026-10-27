import { expect, test, type Page } from "@playwright/test";

// Opening the phone menu moves nothing (#265, from the measurements in #246). Playwright hides
// scrollbars by default, which would hide the 15 px this guards; Chromium gets them back here.
// WebKit's headless build draws overlay scrollbars only, so there the check covers the pill.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

const menuButton = (page: Page) => page.getByRole("button", { name: "Menu" });
const closeButton = (page: Page) => page.getByRole("button", { name: "Close", exact: true });
const clientWidth = (page: Page) => page.evaluate(() => document.documentElement.clientWidth);

/** Instant, because the page's smooth scrolling would still be moving when the menu opened. */
async function scrollTo600(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);
}

/** A real pointer: locator.click() scrolls its target into view first, which would hide a jump. */
async function pressMenu(page: Page) {
  const box = (await menuButton(page).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.up();
}

/** What the eye tracks when the menu opens: the pill's right edge, top and height. */
async function pill(button: ReturnType<typeof menuButton>) {
  const box = (await button.boundingBox())!;
  return { right: box.x + box.width, top: box.y, height: box.height };
}

test.describe("Opening the phone menu", () => {
  test.beforeEach(async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) >= 900, "Phone layout");
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
  });

  const cases = [
    { name: "at the top of the page", scrolled: false, height: 0 },
    { name: "after scrolling down", scrolled: true, height: 0 },
    // Short enough that the menu's own list scrolls, which must not push Close sideways.
    { name: "in a window too short for the menu", scrolled: false, height: 390 },
  ];
  for (const { name, scrolled, height } of cases) {
    test(`moves nothing ${name}`, async ({ page, browserName }) => {
      if (height) await page.setViewportSize({ width: page.viewportSize()!.width, height });
      if (scrolled) await scrollTo600(page);
      if (browserName === "chromium") {
        // Without a classic scrollbar there is no 15 px to lose, and the check would pass for nothing.
        await expect.poll(() => page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)).toBeGreaterThan(0);
      }
      await expect(menuButton(page)).toBeVisible();
      const before = { pill: await pill(menuButton(page)), width: await clientWidth(page) };

      await pressMenu(page);

      await expect(closeButton(page)).toBeVisible();
      await expect.poll(() => pill(closeButton(page))).toEqual(before.pill);
      await expect.poll(() => clientWidth(page)).toBe(before.width);
    });
  }

  test("pins the page while open, and puts it back where it was on Close", async ({ page }) => {
    await scrollTo600(page);
    await pressMenu(page);
    await expect(closeButton(page)).toBeVisible();
    // Nothing is left to scroll, so a dragged scrollbar has nothing to move either.
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight <= document.documentElement.clientHeight)).toBe(true);
    const pinned = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 400);
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: "instant" }));
    // Nothing to wait for when the scroll is ignored, so give one that would happen time to start.
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(pinned);
    await closeButton(page).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);
  });
});
