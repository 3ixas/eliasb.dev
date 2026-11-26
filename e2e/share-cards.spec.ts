import { expect, test } from "@playwright/test";
import { sharePage } from "../src/app/share-card";
import { projects } from "../src/content/projects";
import { caseStudySlugs } from "../src/content/stretch/case-studies";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories";
import { sayHello } from "../src/content/stretch/site-copy";

/*
 * Share cards and favicon (docs/design/DESIGN.md, "Share cards", R-26, #469, R-44): one template in Newsreader carrying
 * each page's object on 1200 × 630 PNG (the current BNP Paribas pass on the homepage, the employer's pass on a Role
 * story, the screenshot on a case study), the Newsreader "E" favicon in site cobalt with dark-scheme SVG + PNG + Apple
 * touch icon fallbacks, and the Copy button's fallback.
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

  // R-26 & #469: every card is drawn on its field (corner check) and carries its object on the right side (not empty field).
  const fields: [string, string][] = [
    ["/opengraph-image", sharePage.field],
    ...roleStorySlugs.map((slug): [string, string] => [`/work/${slug}/opengraph-image`, roleStories[slug].panel.field]),
    ...caseStudySlugs.map((slug): [string, string] => [`/things-i-make/${slug}/opengraph-image`, projects.find((project) => project.slug === slug)!.panel!.field]),
  ];
  for (const [path, field] of fields) {
    test(`${path} is drawn on ${field}, carries its object and clips nothing at the edges`, async ({ page }) => {
      await page.goto(path);
      const expectedRgb = [1, 3, 5].map((at) => parseInt(field.slice(at, at + 2), 16));
      const { corner, nonFieldInObjectArea, clippedEdgePixels } = await page.locator("img").evaluate(async (image: HTMLImageElement, rgb: number[]) => {
        await image.decode();
        const canvas = document.createElement("canvas");
        [canvas.width, canvas.height] = [image.naturalWidth, image.naturalHeight];
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        const differs = (x: number, y: number, tol = 12) => {
          const [r, g, b] = context.getImageData(x, y, 1, 1).data;
          return Math.abs(r - rgb[0]) > tol || Math.abs(g - rgb[1]) > tol || Math.abs(b - rgb[2]) > tol;
        };
        const corner = [...context.getImageData(8, 8, 1, 1).data].slice(0, 3);
        // Sample the right-side object region (x: 680..1120, y: 120..520) on a 16 px grid.
        let nonFieldInObjectArea = 0;
        for (let x = 680; x <= 1120; x += 16) {
          for (let y = 120; y <= 520; y += 16) {
            if (differs(x, y)) nonFieldInObjectArea += 1;
          }
        }
        // Sample the outer left, right and bottom margin bands (20 px inside each edge) to confirm nothing clips off the card.
        let clippedEdgePixels = 0;
        for (let y = 8; y < 622; y += 16) {
          if (differs(12, y, 18)) clippedEdgePixels += 1;
          if (differs(1188, y, 18)) clippedEdgePixels += 1;
        }
        for (let x = 8; x < 1192; x += 16) {
          if (differs(x, 618, 18)) clippedEdgePixels += 1;
        }
        return { corner, nonFieldInObjectArea, clippedEdgePixels };
      }, expectedRgb);
      expect(corner).toEqual(expectedRgb);
      expect(nonFieldInObjectArea).toBeGreaterThan(80);
      expect(clippedEdgePixels).toBe(0);
    });
  }

  test("/opengraph-image hangs only the single current BNP Paribas pass from the top edge (R-44)", async ({ page }) => {
    await page.goto("/opengraph-image");
    const fieldRgb = [1, 3, 5].map((at) => parseInt(sharePage.field.slice(at, at + 2), 16));
    const { lanyards, bnpGreenPixels } = await page.locator("img").evaluate(async (image: HTMLImageElement, rgb: number[]) => {
      await image.decode();
      const canvas = document.createElement("canvas");
      [canvas.width, canvas.height] = [image.naturalWidth, image.naturalHeight];
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const pixel = (x: number, y: number) => [...context.getImageData(x, y, 1, 1).data].slice(0, 3);
      const differs = (x: number, y: number) => {
        const [r, g, b] = pixel(x, y);
        return Math.abs(r - rgb[0]) > 14 || Math.abs(g - rgb[1]) > 14 || Math.abs(b - rgb[2]) > 14;
      };
      // Group top-edge lanyard plies (y = 8, within 40 px for one two-ply V-strap): 1 lanyard for a single pass, 3 for the retired cluster.
      const lanyards: [number, number][] = [];
      let start: number | null = null;
      for (let x = 0; x < canvas.width; x += 2) {
        if (differs(x, 8)) {
          if (start === null) start = x;
        } else if (start !== null) {
          if (x - start >= 10) {
            const last = lanyards[lanyards.length - 1];
            if (last && start - last[1] <= 40) last[1] = x;
            else lanyards.push([start, x]);
          }
          start = null;
        }
      }
      if (start !== null && canvas.width - start >= 10) {
        const last = lanyards[lanyards.length - 1];
        if (last && start - last[1] <= 40) last[1] = canvas.width;
        else lanyards.push([start, canvas.width]);
      }
      // Confirm the pass header band on the right carries BNP Paribas emerald green (#00965e family).
      let bnpGreenPixels = 0;
      for (let x = 840; x <= 1120; x += 8) {
        for (let y = 240; y <= 360; y += 8) {
          const [r, g, b] = pixel(x, y);
          if (g > 110 && g > r + 60 && g > b + 20) bnpGreenPixels += 1;
        }
      }
      return { lanyards, bnpGreenPixels };
    }, fieldRgb);
    expect(lanyards).toHaveLength(1);
    expect(lanyards[0][0]).toBeGreaterThan(800);
    expect(lanyards[0][1] - lanyards[0][0]).toBeLessThanOrEqual(80);
    expect(bnpGreenPixels).toBeGreaterThan(40);
  });

  // Each page names a card from this template, never a raw screenshot: the headline card, or its own.
  const cards = [
    ["/", "/opengraph-image"],
    ["/things-i-make", "/opengraph-image"],
    ["/resume", "/opengraph-image"],
    ...roleStorySlugs.map((slug) => [`/work/${slug}`, `/work/${slug}/opengraph-image`]),
    ...caseStudySlugs.map((slug) => [`/things-i-make/${slug}`, `/things-i-make/${slug}/opengraph-image`]),
  ];
  for (const [path, card] of cards) {
    // The query is Next's cache hash, so a changed card is fetched again.
    const hashed = new RegExp(`${card}\\?.`);
    test(`${path} shares with ${card}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", hashed);
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", hashed);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    });
  }
});

test.describe("Favicon", () => {
  test("serves the Newsreader E SVG (with dark variant), 32 px PNG fallback and 180 px Apple touch icon", async ({ page, request }) => {
    await page.goto("/");

    const svgHref = await page.locator('link[rel="icon"][type="image/svg+xml"]').first().getAttribute("href");
    expect(svgHref).toMatch(/^\/icon\.svg/);
    const svgResponse = await request.get(svgHref!);
    expect(svgResponse.status()).toBe(200);
    const svg = await svgResponse.text();
    expect(svg).toContain("prefers-color-scheme: dark");
    expect(svg).toContain("#2443d6");
    expect(svg).toContain("#8c9eff");

    const pngHref = await page.locator('link[rel="icon"][type="image/png"]').first().getAttribute("href");
    expect(pngHref).toBeTruthy();
    const pngResponse = await request.get(pngHref!);
    expect(pngResponse.status()).toBe(200);
    expect(pngResponse.headers()["content-type"]).toBe("image/png");
    expect(pngSize(await pngResponse.body())).toEqual({ width: 32, height: 32 });

    const appleHref = await page.locator('link[rel="apple-touch-icon"]').first().getAttribute("href");
    expect(appleHref).toBeTruthy();
    const appleResponse = await request.get(appleHref!);
    expect(appleResponse.status()).toBe(200);
    expect(appleResponse.headers()["content-type"]).toBe("image/png");
    expect(pngSize(await appleResponse.body())).toEqual({ width: 180, height: 180 });
  });
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
    const label = `${sayHello.copy} ${sayHello.copySrSuffix}`;
    const address = (await page.locator("#say-hello-email").textContent())!.trim();
    await copy.click();
    await expect.poll(() => page.evaluate(() => window.getSelection()?.toString().trim())).toBe(address);
    await expect(copy).toHaveAccessibleName(label);
    await expect(copy).not.toHaveAttribute("data-copied", "");
  });
});
