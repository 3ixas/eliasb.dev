import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";

const contact = (page: Page) => page.locator("#contact");
const lightsOn = (page: Page) => page.evaluate(() => (document.documentElement.dataset.lights = "on"));

/** Contrast of the neon's letters against the lighter top of the sign's dark backboard (#2b2724). */
const neonContrast = (page: Page) =>
  page.locator(".board-neon").evaluateAll((letters) => {
    const luminance = (colour: string) => {
      const [r, g, b] = colour.match(/[\d.]+/g)!.slice(0, 3).map((channel) => {
        const c = Number(channel) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const board = luminance("rgb(43, 39, 36)");
    return letters.map((letter) => {
      const text = luminance(getComputedStyle(letter).color);
      return (Math.max(text, board) + 0.05) / (Math.min(text, board) + 0.05);
    });
  });

test.describe("Contact and the footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#contact");
  });

  test("says hello in neon, with the heading for screen readers", async ({ page }) => {
    const section = contact(page);
    await expect(section.getByText("04 / Contact", { exact: true })).toBeVisible();
    await expect(section.getByRole("heading", { level: 2, name: "Say hello" })).toBeAttached();
    await expect(section.locator(".board-neon-sign")).toHaveAttribute("aria-hidden", "true");
  });

  test("the postcard is the email link, and the most obvious action", async ({ page }) => {
    const postcard = contact(page).getByRole("link", { name: "Email me at eliasthebennett@gmail.com" });
    await expect(postcard).toHaveAttribute("href", "mailto:eliasthebennett@gmail.com");
    await expect(postcard).toHaveAccessibleDescription(/^Got an idea, a project, or just want to talk about building things\?/);
    await expect(postcard.getByText("Wish you were here.")).toBeVisible();
    const areas = await contact(page).getByRole("link").evaluateAll((links) =>
      links.map((link) => link.getBoundingClientRect().width * link.getBoundingClientRect().height),
    );
    expect(areas[0]).toBe(Math.max(...areas));
  });

  test("the CV, GitHub and LinkedIn cards follow, by keyboard, with 44 px targets", async ({ page, browserName }) => {
    const links = contact(page).getByRole("link");
    await expect(links).toHaveCount(4);
    const names = ["Email me at eliasthebennett@gmail.com", /^Résumé Read my CV/, /^GitHub 3ixas/, /^LinkedIn Elias Bennett/];
    const hrefs = [
      "mailto:eliasthebennett@gmail.com",
      /^https:\/\/docs\.google\.com\//,
      "https://github.com/3ixas",
      "https://linkedin.com/in/elias-t-bennett/",
    ];
    await links.first().focus();
    for (const [index, name] of names.entries()) {
      const link = links.nth(index);
      await expect(link).toHaveAccessibleName(name);
      await expect(link).toHaveAttribute("href", hrefs[index]);
      await expect(link).toBeFocused();
      const box = (await link.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
      if (index > 0) await expect(link).toHaveAttribute("target", "_blank");
      // Safari's Tab skips links unless Option is held, as its users know.
      await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    }
  });

  test("the neon reads by day and glows at night, and its flicker respects reduced motion", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
    await page.reload();
    // Unlit tubes still read as large text (3:1).
    for (const ratio of await neonContrast(page)) expect(ratio).toBeGreaterThanOrEqual(3);
    const flicker = page.locator(".board-neon-flicker");
    await expect(flicker).toHaveCSS("animation-name", "none");
    await lightsOn(page);
    for (const ratio of await neonContrast(page)) expect(ratio).toBeGreaterThanOrEqual(4.5);
    await expect(page.locator(".board-neon-hot")).not.toHaveCSS("text-shadow", "none");
    await expect(flicker).toHaveCSS("animation-name", "board-neon-flicker");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(flicker).toHaveCSS("animation-name", "none");
  });

  test("the footer is the frame's edge and my signature", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toHaveText("Made by Elias");
    await expect(footer.locator(".board-frame-edge")).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to top/ })).toHaveCount(0);
  });

  test("fits without sideways scroll", async ({ page }) => {
    const width = page.viewportSize()!.width;
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });

  test("postcard and card text keep AA contrast by day and at night, and pass axe", async ({ page }) => {
    const selector = "#contact a span:not([aria-hidden]), footer p";
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    await lightsOn(page);
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}" at night`).toBeGreaterThanOrEqual(4.5);
    const results = await new AxeBuilder({ page }).include("#contact").include("footer").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
