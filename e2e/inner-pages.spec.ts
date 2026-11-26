import { expect, test } from "@playwright/test";
import { caseStudies } from "../src/content/stretch/case-studies";
import { roleStorySlugs } from "../src/content/stretch/role-stories";
import { siteCopy } from "../src/content/stretch/site-copy";

// Every inner page has one `h1`, the shared header whose links lead to the homepage's sections (DESIGN.md "The header"),
// and nothing wider than the frame (the Résumé's sheet aside).
/** The passes and panels frame (DESIGN.md "Layout"). */
const FRAME = 1216;

const routes = ["/things-i-make", "/resume", "/nothing-here", ...roleStorySlugs.map((slug) => `/work/${slug}`), ...Object.keys(caseStudies).map((slug) => `/things-i-make/${slug}`)];

for (const route of routes) {
  test.describe(route, () => {
    test("has exactly one h1", async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });

    test("has nothing wider than the frame, and no sideways scroll", async ({ page }) => {
      await page.goto(route);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      // The page's own wrapper spans the window, and Say hello is the page's width; what sits inside the column is measured.
      const widest = await page.locator("main :not(.stretch-wrap, .say-hello, .say-hello *)").evaluateAll((elements) => Math.max(...elements.map((element) => element.getBoundingClientRect().width)));
      // Every inner page is on the frame since #419; the Résumé is its A4 sheet.
      const limit = route === "/resume" ? 900 : FRAME;
      expect(widest).toBeLessThanOrEqual(limit);
    });
  });
}

test("an inner page's header links lead to the homepage's five sections", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const nav = page.locator("[data-site-header]").getByRole("navigation", { name: siteCopy.header.siteLinksLabel, includeHidden: true });
    expect(await nav.locator("a").evaluateAll((anchors) => anchors.map((anchor) => [anchor.textContent, anchor.getAttribute("href")])), route).toEqual(
      siteCopy.menu.map(({ id, label }) => [label, `/#${id}`]),
    );
    await expect(nav.locator("[aria-current]"), route).toHaveCount(0);
  }
});

test.describe("route stylesheet loading and client navigation (#572)", () => {
  test("every route loads its own stylesheets on direct navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".opening__actions")).toHaveCSS("display", "flex");
    await expect(page.locator(".pass__card").first()).toHaveCSS("display", "block");
    await expect(page.locator(".work-metrics").first()).toHaveCSS("display", "grid");
    await expect(page.locator(".project").first()).toHaveCSS("display", "grid");
    await expect(page.locator(".cards")).toHaveCSS("display", "grid");
    await expect(page.locator(".otc__section").first()).toHaveCSS("display", "grid");
    await expect(page.locator(".zoom").first()).toHaveCSS("cursor", "zoom-in");

    await page.goto("/things-i-make");
    await expect(page.locator(".archive__grid .project").first()).toHaveCSS("display", "grid");

    await page.goto("/things-i-make/threshold");
    await expect(page.locator(".story-back")).toHaveCSS("display", "inline-flex");
    await expect(page.locator(".zoom").first()).toHaveCSS("cursor", "zoom-in");

    await page.goto("/work/bnp-paribas");
    await expect(page.locator(".story-back")).toHaveCSS("display", "inline-flex");
    await expect(page.locator(".pass__card").first()).toHaveCSS("display", "block");
    await expect(page.locator(".sim")).toHaveCSS("display", "grid");
    await expect(page.locator(".sim figcaption")).toHaveCSS("font-size", "15px");

    await page.goto("/resume");
    await expect(page.locator(".resume__sheet")).toHaveCSS("background-color", "rgb(255, 255, 255)");

    await page.goto("/nothing-here");
    await expect(page.locator(".not-found__pass")).toHaveCSS("display", "flex");
    await expect(page.locator(".pass__card").first()).toHaveCSS("display", "block");
  });

  test("client navigation loads target route styles and keeps cascade intact", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Start on the leanest route (projects.css only), then traverse into story, home, simulation, and resume.
    await page.goto("/things-i-make");
    await expect(page.locator(".archive__grid .project").first()).toHaveCSS("display", "grid");

    await page.locator('.archive__grid a[href="/things-i-make/threshold"]').click();
    await expect(page).toHaveURL(/\/things-i-make\/threshold$/);
    await expect(page.locator(".story-back")).toHaveCSS("display", "inline-flex");
    await expect(page.locator(".zoom").first()).toHaveCSS("cursor", "zoom-in");

    await page.locator(".site-header__name").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".opening__actions")).toHaveCSS("display", "flex");
    await expect(page.locator(".pass__card").first()).toHaveCSS("display", "block");
    await expect(page.locator(".work-metrics").first()).toHaveCSS("display", "grid");
    await expect(page.locator(".cards")).toHaveCSS("display", "grid");
    await expect(page.locator(".otc__section").first()).toHaveCSS("display", "grid");

    // story.css is already loaded before simulation.css here; .sim figcaption must still keep simulation.css's 15px size.
    await page.locator('a[href="/work/bnp-paribas"]').first().click();
    await expect(page).toHaveURL(/\/work\/bnp-paribas$/);
    await expect(page.locator(".sim")).toHaveCSS("display", "grid");
    await expect(page.locator(".sim figcaption")).toHaveCSS("font-size", "15px");

    await page.locator('a[href="/resume"]').first().click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.locator(".resume__sheet")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });
});
