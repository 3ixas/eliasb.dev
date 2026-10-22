import { expect, test, type Page } from "@playwright/test";

// Opening the phone menu moves nothing (#265, from the measurements in #246). Playwright hides
// scrollbars by default, which would hide the 15 px this guards; Chromium gets them back here.
// WebKit's headless build draws overlay scrollbars only, so there the check covers the pill.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

const menuButton = (page: Page) => page.getByRole("button", { name: "Menu" });
const closeButton = (page: Page) => page.getByRole("button", { name: "Close" });
const clientWidth = (page: Page) => page.evaluate(() => document.documentElement.clientWidth);

/** Instant, because the page's smooth scrolling would still be moving when the menu opened. */
async function scrollTo600(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);
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

  for (const scrolled of [false, true]) {
    test(`moves nothing ${scrolled ? "after scrolling down" : "at the top of the page"}`, async ({ page, browserName }) => {
      if (scrolled) {
        await scrollTo600(page);
      }
      if (browserName === "chromium") {
        // Without a classic scrollbar there is no 15 px to lose, and the check would pass for nothing.
        await expect.poll(() => page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)).toBeGreaterThan(0);
      }
      await expect(menuButton(page)).toBeVisible();
      const before = { pill: await pill(menuButton(page)), width: await clientWidth(page) };

      // A real pointer: locator.click() scrolls its target into view first, which would hide a jump.
      const box = (await menuButton(page).boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.up();

      await expect(closeButton(page)).toBeVisible();
      await expect.poll(() => pill(closeButton(page))).toEqual(before.pill);
      await expect.poll(() => clientWidth(page)).toBe(before.width);
    });
  }

  test("keeps the page behind from scrolling", async ({ page }) => {
    await scrollTo600(page);
    const box = (await menuButton(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();
    await expect(closeButton(page)).toBeVisible();
    await page.mouse.wheel(0, 400);
    // Nothing to wait for when the wheel is ignored, so give a scroll that would happen time to start.
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(600);
  });
});
