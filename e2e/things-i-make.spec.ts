import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { featuredProjects, featuredSlugs, HOMEPAGE_INDEX_ROWS, projectIndex, projects } from "../src/content/projects";
import { caseStudies } from "../src/content/stretch/case-studies";
import { thingsIMake } from "../src/content/stretch/site-copy";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * Things I make (docs/design/DESIGN.md "The homepage, in order" 5, R-17): Threshold as a wide panel with three of its
 * figures and its screenshot bleeding off the right, Argus Risk and Flowtime side by side, the others as rows newest
 * first (at most ten), then the archive link with the true count.
 */

const featured = featuredProjects(projects, featuredSlugs);
const others = projectIndex(projects, featuredSlugs).slice(0, HOMEPAGE_INDEX_ROWS);
const section = (page: Page) => page.locator("section#things-i-make");
const panels = (page: Page) => section(page).locator(".project");
const rows = (page: Page) => section(page).locator(".rows .row");
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(", ")})`;
const line = (slug: string, outcome: string) => thingsIMake.rowOutcomes[slug] ?? outcome;

test.describe("Things I make", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
  });

  test("the featured three are panels in order, each in its field and ink, named one level below the section, linking to its case study", async ({ page }) => {
    await expect(section(page).getByRole("heading", { level: 2 })).toHaveText(thingsIMake.heading);
    await expect(panels(page)).toHaveCount(featured.length);
    for (const [index, project] of featured.entries()) {
      const panel = panels(page).nth(index);
      await expect(panel.getByRole("heading", { level: 3 })).toHaveText(project.name);
      await expect(panel.locator(".project__line")).toHaveText(line(project.slug, project.outcome));
      await expect(panel).toHaveAttribute("href", project.links.caseStudy!);
      await expect(panel).toHaveCSS("background-color", rgb(project.panel!.field));
      await expect(panel).toHaveCSS("color", rgb(project.panel!.ink));
    }
  });

  test("Threshold is wide with three figures from its case study and its screenshot at the right; the other two sit side by side from 720 px", async ({ page }) => {
    const wide = panels(page).first();
    await expect(wide).toHaveClass(/project--wide/);
    const evidence = caseStudies.threshold.evidence;
    await expect(wide.locator(".project__figures > span")).toHaveText(thingsIMake.wideFigures.map((index) => `${evidence[index].value} ${evidence[index].label}`));
    const [text, shot] = await Promise.all([boxOf(wide.locator(".project__text")), boxOf(wide.locator(".project__shot"))]);
    if (width(page) >= 1260) expect(shot.x).toBeGreaterThan(text.x + text.width - 1);
    else expect(shot.y).toBeGreaterThan(text.y + text.height - 1);
    const [a, b] = await Promise.all([boxOf(panels(page).nth(1)), boxOf(panels(page).nth(2))]);
    if (width(page) >= 720) expect(Math.abs(a.y - b.y)).toBeLessThan(1);
    else expect(b.y).toBeGreaterThan(a.y + a.height);
  });

  test("the others are rows newest first, at most ten, each its name, line and year, marked ↗ and opening in a new tab when it leaves the site", async ({ page }) => {
    await expect(rows(page)).toHaveCount(others.length);
    expect(others.length).toBeLessThanOrEqual(HOMEPAGE_INDEX_ROWS);
    for (const [index, project] of others.entries()) {
      const row = rows(page).nth(index);
      await expect(row.locator(".row__name")).toHaveText(project.name);
      await expect(row.locator(".row__line")).toHaveText(line(project.slug, project.outcome));
      await expect(row.locator(".row__meta")).toContainText(String(project.year));
      const href = (project.links.caseStudy ?? project.links.live ?? project.links.code)!;
      await expect(row).toHaveAttribute("href", href);
      if (href.startsWith("http")) {
        await expect(row).toHaveAttribute("target", "_blank");
        await expect(row.locator(".arrow--out")).toHaveText("↗");
        await expect(row).toHaveAccessibleName(/opens .+ in a new tab/);
      }
      expect((await boxOf(row)).height).toBeGreaterThanOrEqual(44);
    }
  });

  test("the archive link has the true count", async ({ page }) => {
    const all = section(page).getByRole("link", { name: thingsIMake.allThings(projects.length) });
    await expect(all).toHaveAttribute("href", "/things-i-make");
    await expect(all).toContainText("(06)");
  });

  test("the phone carousel, the 44 px objects and the closer looks are gone", async ({ page }) => {
    await expect(section(page).locator(".qi-crop, .qi-row, [data-card], [data-quiet-column], .qi-project")).toHaveCount(0);
  });

  test("in light no panel has a shadow; in dark each glows in its own colour", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.reload();
    // The glow's colour is transparent in light, so it draws nothing.
    const noShadow = (shadow: string) => shadow === "none" || /^rgba\([^)]*, 0\) /.test(shadow);
    for (const shadow of await panels(page).evaluateAll((all) => all.map((panel) => getComputedStyle(panel).boxShadow))) expect(noShadow(shadow), shadow).toBe(true);
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.reload();
    for (const panel of await panels(page).all()) await expect(panel).toHaveCSS("box-shadow", /-56px/);
  });

  test("it is complete without script", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(panels(page)).toHaveCount(featured.length);
    await expect(rows(page)).toHaveCount(others.length);
  });

  test("a panel is one keyboard stop with the panel's ink as its ring, and Enter opens its case study", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Safari does not Tab to links by default");
    const panel = panels(page).nth(1);
    await panel.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(panel).toBeFocused();
    const [outline, ink] = await panel.evaluate((element) => [getComputedStyle(element).outline, getComputedStyle(element).color]);
    expect(outline).toContain(ink);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${featured[1].links.caseStudy}$`));
  });

  test("nothing scrolls sideways and nothing is under 13 px", async ({ page }) => {
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const sizes = await section(page).evaluate((element) => [...element.querySelectorAll("*")].filter((node) => node.childElementCount === 0 && node.textContent?.trim()).map((node) => parseFloat(getComputedStyle(node).fontSize)));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(13);
  });

  test("project colours pass contrast: each panel's ink on its field reads at 4.5:1", async () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((start) => {
        const c = parseInt(hex.slice(start, start + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
    for (const { slug, panel } of featured) expect(ratio(panel!.ink, panel!.field), slug).toBeGreaterThanOrEqual(4.5);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`every text in the section passes AA, measured on the rendered page (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      await page.evaluate(() => document.fonts.ready);
      const texts = await section(page).innerText();
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of ["Threshold", "user stories", "Argus Risk", "Flowtime", "Home Secretary", "Everything I’ve built"]) {
        expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });

    test(`has no axe violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      const results = await new AxeBuilder({ page }).include("#things-i-make").analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("Things I make: hover", () => {
  test("a screenshot lifts 10 px under a hovering fine pointer, and not with reduced motion", async ({ page, browserName }) => {
    test.skip(width(page) < 1180, "A hovering fine pointer");
    test.skip(browserName === "webkit", "Hover emulation, Chromium");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const panel = panels(page).nth(1);
    await panel.scrollIntoViewIfNeeded();
    await panel.hover();
    await expect.poll(() => panel.locator(".project__shot").evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42)).toBe(-10);
  });
});
