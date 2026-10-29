import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// A screenshot on a long-form page opens large in the same window: a case study's, and a Role story's.
const pages = [
  { route: "/things-i-make/threshold", trigger: ".qi-case__below .qi-zoom" },
  { route: "/things-i-make/argus-risk", trigger: "section#decisions .qi-zoom" },
  { route: "/work/joveen", trigger: ".qi-screens .qi-zoom" },
  { route: "/work/optegra", trigger: ".qi-screens .qi-zoom" },
];

for (const { route, trigger } of pages) {
  test.describe(`Expanding a screenshot: ${route}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(route);
      await expect(page.locator(trigger).first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
    });

    test("a click opens the same image large, in a dialog in this window, and Esc closes it and returns focus", async ({ page }) => {
      const button = page.locator(trigger).first();
      const alt = (await button.locator("img").getAttribute("alt"))!;
      const inline = (await button.locator("img").boundingBox())!;
      await expect(button).toHaveAttribute("aria-haspopup", "dialog");
      await expect(button).toHaveCSS("cursor", "zoom-in");
      const dialog = page.getByRole("dialog", { name: alt });
      await expect(dialog).toBeHidden();
      const url = page.url();
      await button.click();
      await expect(dialog).toBeVisible();
      expect(page.url()).toBe(url);
      const image = dialog.locator("img");
      await expect.poll(() => image.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
      const large = (await image.boundingBox())!;
      const viewport = page.viewportSize()!;
      expect(large.width).toBeGreaterThan(inline.width);
      expect(large.x).toBeGreaterThanOrEqual(0);
      expect(large.x + large.width).toBeLessThanOrEqual(viewport.width);
      expect(large.y + large.height).toBeLessThanOrEqual(viewport.height + 1);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(button).toBeFocused();
    });

    test("Enter opens it from the keyboard; a click on it and its Close button close it", async ({ page }) => {
      const button = page.locator(trigger).first();
      const dialog = page.getByRole("dialog");
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Close" }).click();
      await expect(dialog).toBeHidden();
      await expect(button).toBeFocused();
      await button.click();
      await expect(dialog).toBeVisible();
      await dialog.locator("img").click();
      await expect(dialog).toBeHidden();
    });

    test("the page behind does not scroll, nothing scrolls sideways, and it has no axe violations while open", async ({ page }) => {
      await page.locator(trigger).first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    test("the dialog arrives with a short fade, and with none under reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.reload();
      await page.locator(trigger).first().click();
      const names = () => page.getByRole("dialog").evaluate((dialog) => dialog.getAnimations().map((animation) => (animation as CSSAnimation).animationName));
      await expect.poll(names).toContain("qi-zoom-in");
      await page.keyboard.press("Escape");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.locator(trigger).first().click();
      await expect.poll(names).toEqual([]);
    });

    test("the screenshot is in the server-rendered page without script", async ({ page }) => {
      await page.route("**/*.js", (route) => route.abort());
      await page.reload();
      await expect(page.locator(`${trigger} img`).first()).toBeVisible();
    });
  });
}
