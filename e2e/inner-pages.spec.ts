import { expect, test } from "@playwright/test";
import { caseStudies } from "../src/content/stretch/case-studies";
import { roleStorySlugs } from "../src/content/stretch/role-stories";
import { siteCopy } from "../src/content/stretch/site-copy";

// Every inner page has one `h1`, the shared header whose links lead to the homepage's sections (DESIGN.md "The header"),
// and nothing wider than the column plus the margin.
const COLUMN = 600;
const MARGIN = 300 + 40;

const routes = ["/things-i-make", "/resume", "/nothing-here", ...roleStorySlugs.map((slug) => `/work/${slug}`), ...Object.keys(caseStudies).map((slug) => `/things-i-make/${slug}`)];

for (const route of routes) {
  test.describe(route, () => {
    test("has exactly one h1", async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });

    test("has nothing wider than the column plus the margin, and no sideways scroll", async ({ page }) => {
      await page.goto(route);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      // The page's own wrapper spans the window, and Say hello is the page's width; what sits inside the column is measured.
      const widest = await page.locator("main :not(.stretch-wrap, .say-hello, .say-hello *)").evaluateAll((elements) => Math.max(...elements.map((element) => element.getBoundingClientRect().width)));
      // The Résumé's sheet is the page: A4 is wider than the column, and it is the one thing allowed to be.
      expect(widest).toBeLessThanOrEqual(route === "/resume" ? 900 : COLUMN + MARGIN);
    });
  });
}

test("an inner page's header links lead to the homepage's five sections", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const nav = page.locator("[data-site-header]").getByRole("navigation", { name: siteCopy.header.linksLabel, includeHidden: true });
    expect(await nav.locator("a").evaluateAll((anchors) => anchors.map((anchor) => [anchor.textContent, anchor.getAttribute("href")])), route).toEqual(
      siteCopy.menu.map(({ id, label }) => [label, `/#${id}`]),
    );
    await expect(nav.locator("[aria-current]"), route).toHaveCount(0);
  }
});
