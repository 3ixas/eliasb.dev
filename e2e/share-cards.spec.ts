import { expect, test } from "@playwright/test";
import { sharePage } from "../src/app/share-card";
import { projects } from "../src/content/projects";
import { caseStudySlugs } from "../src/content/stretch/case-studies";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories";
import { sayHello } from "../src/content/stretch/site-copy";

/*
 * Share cards (docs/design/DESIGN.md, "Share cards", R-26): one template in Newsreader, so every card is a 1200 × 630 PNG on
 * its page's field, and the
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

  // R-26: the homepage's card is on the page colour; a Role story's and a case study's take their panel's field.
  const fields: [string, string][] = [
    ["/opengraph-image", sharePage.field],
    ...roleStorySlugs.map((slug): [string, string] => [`/work/${slug}/opengraph-image`, roleStories[slug].panel.field]),
    ...caseStudySlugs.map((slug): [string, string] => [`/things-i-make/${slug}/opengraph-image`, projects.find((project) => project.slug === slug)!.panel!.field]),
  ];
  for (const [path, field] of fields) {
    test(`${path} is drawn on ${field}`, async ({ page }) => {
      await page.goto(path);
      const corner = await page.locator("img").evaluate(async (image: HTMLImageElement) => {
        await image.decode();
        const canvas = document.createElement("canvas");
        [canvas.width, canvas.height] = [image.naturalWidth, image.naturalHeight];
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        return [...context.getImageData(8, 8, 1, 1).data].slice(0, 3);
      });
      expect(corner).toEqual([1, 3, 5].map((at) => parseInt(field.slice(at, at + 2), 16)));
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
    // The Copy button answers once it has hydrated (the homepage has no quiet column to wait on since #416).
    await page.waitForFunction(() => {
      const button = document.querySelector(".copy-button");
      return !!button && Object.keys(button).some((key) => key.startsWith("__reactProps$"));
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
