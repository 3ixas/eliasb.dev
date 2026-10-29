import { expect, test } from "@playwright/test";
import { caseStudies } from "../src/content/stretch/case-studies";
import { roleStorySlugs } from "../src/content/stretch/role-stories";

// The removal rule for the inner pages (docs/design/DESIGN.md): every inner page has one `h1`, its header links are
// its own sections (none on the archive, the Résumé and the 404), and nothing is wider than the column plus the margin.
const COLUMN = 600;
const MARGIN = 300 + 40;

const linkless = ["/things-i-make", "/resume", "/nothing-here"];
const sectioned = [...roleStorySlugs.map((slug) => `/work/${slug}`), ...Object.keys(caseStudies).map((slug) => `/things-i-make/${slug}`)];

for (const route of [...linkless, ...sectioned]) {
  test.describe(route, () => {
    test("has exactly one h1", async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });

    test("has nothing wider than the column plus the margin, and no sideways scroll", async ({ page }) => {
      await page.goto(route);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      // The page's own wrapper spans the window; what sits inside it is measured.
      const widest = await page.locator("main :not(.stretch-wrap)").evaluateAll((elements) => Math.max(...elements.map((element) => element.getBoundingClientRect().width)));
      // The Résumé's sheet is the page: A4 is wider than the column, and it is the one thing allowed to be.
      expect(widest).toBeLessThanOrEqual(route === "/resume" ? 900 : COLUMN + MARGIN);
    });
  });
}

for (const route of linkless) {
  test(`${route} has no header links`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("[data-stretch-header] .qi-header__links a")).toHaveCount(0);
    await expect(page.locator("[data-stretch-header] nav")).toHaveCount(0);
  });
}

for (const route of sectioned) {
  test(`${route} has header links equal to its own sections`, async ({ page }) => {
    await page.goto(route);
    const links = await page.locator("[data-stretch-header] .qi-header__links a").evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href")));
    const sections = await page.locator("main section[id]").evaluateAll((elements) => elements.map((element) => `#${element.id}`));
    expect(links.length).toBeGreaterThan(0);
    expect(links).toEqual(sections);
  });
}
