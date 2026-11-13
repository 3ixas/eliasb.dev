import { expect, test } from "@playwright/test";
import { caseStudySlugs } from "../src/content/stretch/case-studies";
import { roleStorySlugs } from "../src/content/stretch/role-stories";
import { sayHello } from "../src/content/stretch/site-copy";

/*
 * Share cards (docs/design/DESIGN.md, "Share cards"): one template, so every card is a 1200 × 630 PNG, and the
 * pages that take the homepage's card say so in their metadata. The Copy button's fallback is held here too.
 */

const pngSize = (bytes: Buffer) => ({ width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) });

test.describe("Share cards", () => {
  for (const path of ["/opengraph-image", ...roleStorySlugs.map((slug) => `/work/${slug}/opengraph-image`), ...caseStudySlugs.map((slug) => `/things-i-make/${slug}/opengraph-image`)]) {
    test(`${path} is one 1200 × 630 PNG`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toBe("image/png");
      expect(pngSize(await response.body())).toEqual({ width: 1200, height: 630 });
    });
  }

  // Each page names a card from this template, never a screenshot: the headline card, or its own.
  const cards = [
    ["/", "/opengraph-image"],
    ["/things-i-make", "/opengraph-image"],
    ["/resume", "/opengraph-image"],
    ...roleStorySlugs.map((slug) => [`/work/${slug}`, `/work/${slug}/opengraph-image`]),
    ...caseStudySlugs.map((slug) => [`/things-i-make/${slug}`, `/things-i-make/${slug}/opengraph-image`]),
  ];
  for (const [path, card] of cards) {
    test(`${path} shares with ${card}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(`${card}(\\?|$)`));
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", new RegExp(`${card}(\\?|$)`));
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    });
  }
});

test.describe("Copy, when the clipboard refuses", () => {
  test("selects the address and says nothing new", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("refused")) }, configurable: true });
    });
    await page.goto("/");
    await page.waitForFunction(() => {
      const columns = [...document.querySelectorAll("[data-quiet-column]")];
      return columns.length > 0 && columns.every((column) => Object.keys(column).some((key) => key.startsWith("__reactProps$")));
    });
    const copy = page.locator(".copy-button");
    const label = sayHello.copy;
    const address = (await page.locator("#say-hello-email").textContent())!.trim();
    await copy.click();
    await expect.poll(() => page.evaluate(() => window.getSelection()?.toString().trim())).toBe(address);
    await expect(copy).toHaveAccessibleName(label);
    await expect(copy).not.toHaveAttribute("data-copied", "");
  });
});
