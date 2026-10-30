import { expect, test, type Page } from "@playwright/test";
import { profile } from "../src/content/site";
import { sayHello } from "../src/content/stretch/site-copy";
import { contrastOnPaper } from "./support/contrast";

/*
 * Say hello, where the page ends (docs/design/DESIGN.md, "The homepage, in order" 7): the heading with no line after
 * it, the email with its Copy button, then Résumé, GitHub and LinkedIn as rows; and "Made by Elias", filling with
 * cobalt on hover only.
 */

const section = (page: Page) => page.locator("section#say-hello");
const address = profile.links.email.replace(/^mailto:/, "");
/** Found by class, not name: its name changes to "Copied". */
const copyButton = (page: Page) => section(page).locator(".qi-copy");
const rows = (page: Page) => section(page).locator("a.qi-row");

test.describe("Say hello", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("is a heading with no line after it, then the email, Résumé, GitHub and LinkedIn in that order", async ({ page }) => {
    const heading = section(page).getByRole("heading", { level: 2, name: "Say hello", exact: true });
    await expect(heading).toHaveCount(1);
    await expect(section(page)).toHaveAttribute("aria-labelledby", (await heading.getAttribute("id"))!);
    // Nothing is written under the heading: the email and its button are the line.
    await expect(section(page).locator("p:visible")).toHaveCount(0);
    expect(await section(page).locator("a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual([
      profile.links.email,
      profile.links.resume,
      profile.links.github,
      profile.links.linkedin,
    ]);
    expect(profile.links.email.startsWith("mailto:")).toBe(true);
    await expect(section(page).locator(".qi-email__address")).toHaveText(address);
    await expect(rows(page).locator(".qi-row__title")).toHaveText(sayHello.links.map(({ label }) => label));
  });

  test("the giant Say hello and its line are gone", async ({ page }) => {
    await expect(page.locator(".stretch-hello, .stretch-hello__big")).toHaveCount(0);
    await expect(page.getByText("Got an idea, a project")).toHaveCount(0);
    await expect(page.getByText("Say hello ↗")).toHaveCount(0);
  });

  test("Copy puts the address on the clipboard, turns cobalt and says Copied, then goes back", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Only Chromium can grant clipboard reads");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = copyButton(page);
    await expect(copy).toBeVisible();
    const quiet = await copy.evaluate((element) => getComputedStyle(element).backgroundColor);
    await copy.click();
    await expect(copy).toHaveText(sayHello.copied);
    await expect(section(page).getByRole("status")).toHaveText(sayHello.copied);
    await expect.poll(() => copy.evaluate((element) => getComputedStyle(element).backgroundColor)).toMatch(/^rgb\((35, 64, 255|139, 156, 255)\)$/);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(address);
    await expect(copy).toHaveText(sayHello.copy, { timeout: 5000 });
    await expect.poll(() => copy.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(quiet);
  });

  test("without script the email is still a working link and there is no dead button", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(section(page).getByRole("link", { name: address, exact: true })).toHaveAttribute("href", profile.links.email);
    await expect(copyButton(page)).toBeHidden();
    await expect(rows(page)).toHaveCount(3);
  });

  test("Résumé opens /resume on this site, with the internal arrow", async ({ page }) => {
    const link = rows(page).filter({ hasText: "Résumé" });
    await expect(link).toHaveAttribute("href", "/resume");
    await expect(link).not.toHaveAttribute("target", "_blank");
    await expect(link.locator(".qi-row__arrow")).toHaveText("→");
    expect(profile.links.resume).toBe("/resume");
    await link.click();
    await expect(page).toHaveURL(/\/resume$/);
  });

  test("GitHub and LinkedIn go where the profile says, in a new tab, marked ↗", async ({ page }) => {
    for (const { id, label } of sayHello.links.filter(({ id }) => id !== "resume")) {
      const link = rows(page).filter({ hasText: label });
      await expect(link).toHaveAttribute("href", profile.links[id]);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noreferrer/);
      await expect(link.locator(".qi-row__arrow")).toHaveText("↗");
    }
  });

  test("the Résumé row is a plain link to the page, with no closer look to open first", async ({ page }) => {
    const row = rows(page).filter({ hasText: "Résumé" });
    await expect(row).toHaveAttribute("href", "/resume");
    await expect(row).not.toHaveAttribute("target", /.*/);
    await expect(row).not.toHaveAttribute("data-look", /.*/);
    await expect(section(page).getByRole("button", { name: "A closer look at Résumé" })).toHaveCount(0);
    await expect(section(page).locator("[data-look-slot]")).toHaveCount(0);
  });

  test("the header's Say hello link lands on this section", async ({ page }) => {
    const link = page.locator("[data-stretch-header]").getByRole("link", { name: "Say hello", exact: true });
    test.skip(!(await link.isVisible()), "Narrow screens have no section links and no menu: the section is reached by scrolling");
    await link.click();
    await expect(page).toHaveURL(/#say-hello$/);
    await expect(section(page)).toBeInViewport();
  });

  test("every target is at least 44 px and nothing overflows", async ({ page }) => {
    await expect(copyButton(page)).toBeVisible();
    const width = page.viewportSize()?.width ?? 0;
    for (const target of await section(page).locator("a, button:visible").all()) {
      const box = (await target.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("focus is visible on the email, Copy and each row", async ({ page }) => {
    await expect(copyButton(page)).toBeVisible();
    for (const target of await section(page).locator("a, button:visible").all()) {
      await target.focus();
      const ring = await target.evaluate((element) => {
        const style = getComputedStyle(element);
        return { outline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2, shadow: style.boxShadow !== "none" };
      });
      expect(ring.outline || ring.shadow).toBe(true);
    }
  });

  test("text passes WCAG 2.2 AA contrast", async ({ page }) => {
    await expect(copyButton(page)).toBeVisible();
    for (const selector of ["#say-hello .qi-title", "#say-hello .qi-email__address", "#say-hello .qi-copy", "#say-hello .qi-row__title"]) {
      const readings = await contrastOnPaper(page, selector);
      expect(readings.length, selector).toBeGreaterThan(0);
      for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

// No page has a footer: each ends on its own last content, with room to breathe below it.
test.describe("No footer", () => {
  for (const path of ["/", "/things-i-make", "/things-i-make/threshold", "/work/joveen", "/resume", "/this-page-does-not-exist"]) {
    test(`${path} ends on its content`, async ({ page }, testInfo) => {
      test.skip(!/-(390|1440)-light$/.test(testInfo.project.name), "Sweeps its own pages: once per engine and width");
      await page.goto(path);
      await expect(page.getByRole("contentinfo")).toHaveCount(0);
      await expect(page.locator(".stretch-footer")).toHaveCount(0);
      await expect(page.getByText("Made by Elias")).toHaveCount(0);
      const main = page.locator("main").first();
      await expect.poll(() => main.evaluate((element) => parseFloat(getComputedStyle(element).paddingBottom))).toBeGreaterThanOrEqual(80);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
});
