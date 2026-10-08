import { expect, test, type Page } from "@playwright/test";
import { profile } from "../src/content/site";
import { sayHello, siteCopy } from "../src/content/stretch/site-copy";
import { contrastOnPaper } from "./support/contrast";

const section = (page: Page) => page.locator("section#say-hello");
const hrefs = [profile.links.resume, profile.links.github, profile.links.linkedin];

test.describe("Say hello and the footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("the copy matches the approved text", async ({ page }) => {
    await expect(section(page).getByRole("link", { name: sayHello.bigLink, exact: true })).toBeVisible();
    await expect(section(page).locator(".stretch-hello__line")).toHaveText(sayHello.line);
    await expect(section(page).locator(".stretch-hello__link")).toHaveCount(sayHello.links.length);
  });

  test("the big link emails Elias, and it is the one cobalt block", async ({ page }) => {
    const big = section(page).locator(".stretch-hello__big");
    await expect(big).toHaveAttribute("href", profile.links.email);
    expect(profile.links.email.startsWith("mailto:")).toBe(true);
    const [background, link] = await Promise.all([big.evaluate((el) => getComputedStyle(el).backgroundColor), section(page).locator(".stretch-hello__link").first().evaluate((el) => getComputedStyle(el).backgroundColor)]);
    expect(background).not.toBe(link);
  });

  test("Résumé, GitHub and LinkedIn go where the profile says, in a new tab", async ({ page }) => {
    for (const [index, label] of sayHello.links.entries()) {
      const link = section(page).locator(".stretch-hello__link").nth(index);
      await expect(link).toContainText(label);
      await expect(link).toHaveAttribute("href", hrefs[index]);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noreferrer/);
    }
  });

  test("the hero's Say hello button lands on this section", async ({ page }) => {
    await page.getByRole("link", { name: "Say hello", exact: true }).first().click();
    await expect(page).toHaveURL(/#say-hello$/);
    await expect(section(page)).toBeInViewport();
  });

  test("the footer is there, and it is in the server-rendered page", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(page.getByRole("contentinfo")).toHaveText(siteCopy.footer);
    await expect(section(page).locator(".stretch-hello__link")).toHaveCount(3);
  });

  test("every target is at least 44 px and nothing overflows", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    for (const link of await section(page).locator("a").all()) {
      const box = (await link.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("focus is visible on each link", async ({ page }) => {
    for (const link of await section(page).locator("a").all()) {
      await link.focus();
      const outline = await link.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: parseFloat(getComputedStyle(el).outlineWidth) }));
      expect(outline.style).not.toBe("none");
      expect(outline.width).toBeGreaterThanOrEqual(2);
    }
  });

  test("text passes WCAG 2.2 AA contrast", async ({ page }) => {
    for (const selector of [".stretch-hello__big", ".stretch-hello__line", ".stretch-hello__link"]) {
      const readings = await contrastOnPaper(page, `#say-hello ${selector}`);
      expect(readings.length, selector).toBeGreaterThan(0);
      for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
    const footer = await contrastOnPaper(page, ".stretch-footer p");
    for (const reading of footer) expect(reading.ratio).toBeGreaterThanOrEqual(4.5);
  });
});
