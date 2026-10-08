import { expect, test, type Page } from "@playwright/test";
import { featuredProjects, featuredSlugs, projects } from "../src/content/projects";
import { workSection } from "../src/content/stretch/site-copy";
import { contrastOnPaper } from "./support/contrast";

const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 761;
const featured = featuredProjects(projects, featuredSlugs);
const tiles = (page: Page) => page.locator("#work .stretch-tile");
const shotRotation = (page: Page, index: number) =>
  tiles(page).nth(index).locator(".stretch-tile__shot").evaluate((element) => {
    const [a, b] = getComputedStyle(element).transform.match(/-?[\d.]+/g)!.map(Number);
    return Math.round(Math.atan2(b, a) * (180 / Math.PI) * 10) / 10;
  });

test.describe("Work: featured tiles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("tiles come from the featured list in its order and the count reads true", async ({ page }) => {
    await expect(tiles(page)).toHaveCount(featured.length);
    await expect(page.locator("#work .stretch-note")).toHaveText(workSection.note(projects.length, featured.length));
    for (const [index, project] of featured.entries()) {
      const tile = tiles(page).nth(index);
      await expect(tile.getByRole("heading", { level: 3 })).toHaveText(project.name);
      await expect(tile.locator(".stretch-tile__outcome")).toHaveText(project.outcome);
      await expect(tile.locator(".stretch-tile__meta")).toHaveText(`${project.type} · ${project.year}`);
      await expect(tile.locator(".stretch-tile__number")).toHaveText(String(index + 1).padStart(2, "0"));
      await expect(tile).toHaveAttribute("href", project.links.caseStudy!);
      await expect(tile.getByRole("img", { name: project.screenshot!.alt })).toBeVisible();
    }
  });

  test("the tiles are in the server-rendered page", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(tiles(page)).toHaveCount(featured.length);
  });

  test("each tile wears its project colour and one fastener", async ({ page }) => {
    for (const [index, project] of featured.entries()) {
      const tile = tiles(page).nth(index);
      const rgb = (hex: string) => `rgb(${[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(", ")})`;
      await expect(tile).toHaveCSS("background-color", rgb(project.colours!.field));
      await expect(tile).toHaveCSS("color", rgb(project.colours!.ink));
      await expect(tile.locator(".stretch-fastener")).toHaveCount(1);
      await expect(tile.locator(`.stretch-fastener--${project.fastener}`)).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("the first tile spans two columns on wide screens and tiles are one column on phones", async ({ page }) => {
    const boxes = await Promise.all(featured.map((_, index) => tiles(page).nth(index).boundingBox()));
    const [first, second, third] = boxes.map((box) => box!);
    if (phone(page)) {
      expect(second.x).toBeCloseTo(first.x, 0);
      expect(second.width).toBeCloseTo(first.width, 0);
      expect(second.y).toBeGreaterThan(first.y + first.height);
      // 16 px gutters either side.
      expect(first.x).toBeCloseTo(16, 0);
      expect(first.x + first.width).toBeCloseTo((page.viewportSize()?.width ?? 0) - 16, 0);
    } else {
      expect(first.width).toBeGreaterThan(second.width * 1.8);
      expect(third.x).toBeGreaterThan(second.x);
      expect(third.y).toBeCloseTo(second.y, 0);
    }
  });

  test("screenshots are tilted between 1 and 1.5 degrees at rest", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const index of featured.keys()) {
      const angle = Math.abs(await shotRotation(page, index));
      expect(angle).toBeGreaterThanOrEqual(1);
      expect(angle).toBeLessThanOrEqual(1.5);
    }
  });

  test("hover straightens the screenshot", async ({ page }) => {
    test.skip(phone(page), "Phones straighten on scroll, not hover");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const tile = tiles(page).first();
    await tile.scrollIntoViewIfNeeded();
    await tile.hover();
    await expect.poll(() => shotRotation(page, 0)).toBe(0);
    await page.mouse.move(0, 0);
    await expect.poll(() => shotRotation(page, 0)).not.toBe(0);
  });

  test("keyboard focus straightens the screenshot", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium" || phone(page), "Safari does not tab through links; phones have no focus ring to check");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await tiles(page).first().focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(tiles(page).first()).toBeFocused();
    await expect.poll(() => shotRotation(page, 0)).toBe(0);
  });

  test("on phones the screenshot straightens as it passes the middle of the screen", async ({ page, browserName }) => {
    test.skip(!phone(page) || browserName !== "chromium", "Scroll-driven animation on phone widths, Chromium");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const shot = tiles(page).nth(1).locator(".stretch-tile__shot");
    await shot.evaluate((element) => {
      const { top, height } = element.getBoundingClientRect();
      scrollBy(0, top + height / 2 - innerHeight / 2);
    });
    await expect.poll(async () => Math.abs(await shotRotation(page, 1))).toBeLessThanOrEqual(0.3);
    await page.evaluate(() => scrollTo(0, 0));
    await expect.poll(async () => Math.abs(await shotRotation(page, 1))).toBeGreaterThanOrEqual(1);
  });

  test("reduced motion straightens on hover without movement", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const tile = tiles(page).first();
    await tile.scrollIntoViewIfNeeded();
    expect(Math.abs(await shotRotation(page, 0))).toBeGreaterThanOrEqual(1);
    await tile.hover();
    const shot = tile.locator(".stretch-tile__shot");
    const state = await shot.evaluate((element) => {
      const style = getComputedStyle(element);
      return { transform: style.transform, seconds: parseFloat(style.transitionDuration) };
    });
    // Instant: the Board's reduced-motion rule clamps this to a hair above zero.
    expect(state.seconds).toBeLessThan(0.001);
    // Straight and level, with no lift or scale.
    expect(state.transform).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    const names = await tile.locator(".stretch-fastener").evaluateAll((all) => all.map((el) => getComputedStyle(el).animationName));
    expect(names).toEqual(["none"]);
  });

  test("keyboard focus is visible on each tile", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Safari does not tab through links");
    for (const index of featured.keys()) {
      const tile = tiles(page).nth(index);
      await tile.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(tile).toBeFocused();
      const outline = await tile.evaluate((element) => {
        const style = getComputedStyle(element);
        return { width: parseFloat(style.outlineWidth), style: style.outlineStyle };
      });
      expect(outline.style).not.toBe("none");
      expect(outline.width).toBeGreaterThanOrEqual(2);
    }
  });

  test("targets are at least 44 px and the page does not scroll sideways", async ({ page }) => {
    for (const index of featured.keys()) {
      const box = (await tiles(page).nth(index).boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("tiles keep a visible edge in dark and none in light", async ({ page }, info) => {
    const dark = info.project.use.colorScheme === "dark";
    const tile = tiles(page).first();
    await expect(tile).toHaveCSS("border-top-color", dark ? "rgb(42, 42, 51)" : "rgba(0, 0, 0, 0)");
    await expect(tile).toHaveCSS("border-top-width", "1px");
  });

  test("text over every project colour passes WCAG 2.2 AA", async ({ page }) => {
    for (const selector of [".stretch-tile__name", ".stretch-tile__outcome", ".stretch-tile__meta"]) {
      const readings = await contrastOnPaper(page, `#work ${selector}`);
      expect(readings).toHaveLength(featured.length);
      for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("the outline numbers are decorative and readable as graphics (3:1)", async ({ page }) => {
    for (const [index, project] of featured.entries()) {
      const { swatch, field } = project.colours!;
      const channel = (hex: string, start: number) => parseInt(hex.slice(start, start + 2), 16) / 255;
      const luminance = (hex: string) => {
        const [r, g, b] = [1, 3, 5].map((start) => {
          const c = channel(hex, start);
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const [a, b] = [luminance(swatch), luminance(field)];
      expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), project.slug).toBeGreaterThanOrEqual(3);
      await expect(tiles(page).nth(index).locator(".stretch-tile__number")).toHaveAttribute("aria-hidden", "true");
    }
  });
});
