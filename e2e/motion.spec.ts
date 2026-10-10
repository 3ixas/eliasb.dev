import { expect, test, type Page } from "@playwright/test";

// Motion that is not the entrance: scroll sway, and hover that only moves things where there is a hover.
const tile = (page: Page) => page.locator("#work .stretch-tile").first();
const released = (page: Page) => expect.poll(() => page.evaluate(() => !document.documentElement.hasAttribute("data-entering")), { timeout: 8000 }).toBe(true);
const sway = (page: Page) =>
  tile(page).evaluate((element) => {
    const style = getComputedStyle(element);
    const y = style.translate === "none" ? 0 : parseFloat(style.translate.split(" ")[1] ?? "0");
    const angle = style.rotate === "none" ? 0 : parseFloat(style.rotate);
    return { y, angle, translate: style.translate, rotate: style.rotate };
  });
// Scrolls so the tile's middle sits this far down the visible area (0.5 is its middle, 1 its bottom edge). The
// scroll timeline measures from under the fixed header (the page's scroll padding), so the visible area does too.
const scrollTileTo = (page: Page, down: number) =>
  tile(page).evaluate((element, at) => {
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const { top, height } = element.getBoundingClientRect();
    scrollBy(0, top + height / 2 - (padding + (innerHeight - padding) * at));
  }, down);

test.describe("Scroll sway", () => {
  test.use({ reducedMotion: "no-preference" });

  test("tiles drift up to 14 px and tilt at most 0.6 degrees, and sit level in the middle of the screen", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Scroll-driven animation, Chromium");
    await page.goto("/");
    await released(page);
    expect(await page.evaluate(() => CSS.supports("animation-timeline", "view()"))).toBe(true);
    // The site scrolls smoothly; measuring a position needs the scroll to land where it is sent.
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    await tile(page).scrollIntoViewIfNeeded();

    await scrollTileTo(page, 0.5);
    await expect.poll(async () => Math.abs((await sway(page)).y)).toBeLessThanOrEqual(1);
    expect(Math.abs((await sway(page)).angle)).toBeLessThanOrEqual(0.05);

    await scrollTileTo(page, 0.85);
    await expect.poll(async () => Math.abs((await sway(page)).y)).toBeGreaterThan(3);
    const near = await sway(page);
    expect(Math.abs(near.y)).toBeLessThanOrEqual(14.01);
    expect(Math.abs(near.angle)).toBeLessThanOrEqual(0.61);
    expect(Math.abs(near.angle)).toBeGreaterThan(0);
  });

  test("cards sway too, the PRD card keeping its own resting tilt", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Scroll-driven animation, Chromium");
    await page.goto("/");
    await released(page);
    const prd = page.locator(".stretch-prd");
    await prd.scrollIntoViewIfNeeded();
    const { rotate, transform } = await prd.evaluate((element) => ({ rotate: getComputedStyle(element).rotate, transform: getComputedStyle(element).transform }));
    expect(rotate).not.toBe("none");
    expect(transform, "the resting 1 degree tilt is still there").not.toBe("none");
    const card = page.locator("#off-the-clock .stretch-otc__card").first();
    expect(await card.evaluate((element) => getComputedStyle(element).translate)).not.toBe("none");
  });

  test("with reduced motion nothing sways", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await tile(page).scrollIntoViewIfNeeded();
    const { translate, rotate } = await sway(page);
    expect(translate).toBe("none");
    expect(rotate).toBe("none");
    expect(await page.locator(".stretch-prd").evaluate((element) => getComputedStyle(element).rotate)).toBe("none");
  });
});

test.describe("Hover that needs a hover", () => {
  test.use({ reducedMotion: "no-preference", hasTouch: true, isMobile: true, viewport: { width: 1200, height: 900 } });

  test("a tile does not take its hover pose on a device with no hover", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Touch emulation, Chromium");
    await page.goto("/");
    await released(page);
    expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(false);
    const shot = tile(page).locator(".stretch-tile__shot");
    await tile(page).scrollIntoViewIfNeeded();
    const resting = await shot.evaluate((element) => getComputedStyle(element).transform);
    await tile(page).hover();
    await page.waitForTimeout(700);
    expect(await shot.evaluate((element) => getComputedStyle(element).transform)).toBe(resting);
  });
});
