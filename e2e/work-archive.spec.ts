import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projectIndex, projects } from "../src/content/projects";
import { caseStudies } from "../src/content/stretch/case-studies";
import { roleStorySlugs } from "../src/content/stretch/role-stories";
import { siteCopy, thingsIMake, workArchive } from "../src/content/stretch/site-copy";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * The Work archive (docs/design/DESIGN.md "The Work archive", R-23): the h1 and its note, then every project as a panel,
 * newest first, three across. The three with case studies take their colours; the others are on paper and link out.
 * Filters appear only above ten projects. The panel itself is the homepage's part (things-i-make.spec.ts).
 */

const panels = (page: Page) => page.locator(".archive__grid .project");
const names = (page: Page) => panels(page).locator(".project__name").allTextContents();
const years = async (page: Page) => (await panels(page).locator(".project__meta").allTextContents()).map((meta) => Number(meta.match(/\d{4}/)![0]));
const filters = (page: Page) => page.getByRole("group", { name: "Filter projects" });
const newestFirst = (list: number[]) => expect(list).toEqual([...list].sort((a, b) => b - a));
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(", ")})`;

test.describe("Work archive: the catalogue", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/things-i-make");
  });

  test("the h1 is the page's only one, with its note beneath", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(workArchive.heading);
    await expect(page.locator(".archive__note")).toHaveText(workArchive.note);
  });

  test("every project is a panel, newest first, each named one level below the h1, and the homepage's link shows the same count", async ({ page }) => {
    const ordered = projectIndex(projects, []);
    expect(await names(page)).toEqual(ordered.map(({ name }) => name));
    await expect(panels(page).getByRole("heading", { level: 2 })).toHaveCount(ordered.length);
    newestFirst(await years(page));
    await page.goto("/");
    await expect(page.getByRole("link", { name: thingsIMake.allThings(ordered.length) })).toHaveAttribute("href", "/things-i-make");
  });

  test("three across from 1260 px, two under it and one under 720 px", async ({ page }) => {
    const tops = await panels(page).evaluateAll((all) => all.slice(0, 3).map((panel) => Math.round(panel.getBoundingClientRect().top)));
    const across = width(page) >= 1260 ? 3 : width(page) >= 720 ? 2 : 1;
    expect(new Set(tops.slice(0, across)).size).toBe(1);
    if (across < 3) expect(tops[across]).toBeGreaterThan(tops[0]);
  });

  test("a project with a case study takes its field and ink and opens it; the others are on paper and open elsewhere in a new tab, marked ↗", async ({ page }) => {
    for (const project of projectIndex(projects, [])) {
      const panel = panels(page).filter({ has: page.getByRole("heading", { name: project.name, exact: true }) });
      if (project.links.caseStudy) {
        await expect(panel).toHaveAttribute("href", project.links.caseStudy);
        await expect(panel).toHaveCSS("background-color", rgb(project.panel!.field));
        await expect(panel).toHaveCSS("color", rgb(project.panel!.ink));
        await expect(panel).not.toHaveAttribute("target", "_blank");
      } else {
        await expect(panel).toHaveAttribute("href", (project.links.live ?? project.links.code)!);
        await expect(panel).toHaveAttribute("target", "_blank");
        await expect(panel).toHaveClass(/panel--paper/);
        await expect(panel.locator(".project__meta")).toContainText("↗");
        await expect(panel).toHaveAccessibleName(/opens .+ in a new tab/);
      }
    }
  });

  test("in dark a project with a case study glows in its own colour; in light no panel has a shadow", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.reload();
    const shadows = () => panels(page).evaluateAll((all) => all.map((panel) => [panel.classList.contains("panel--glow"), getComputedStyle(panel).boxShadow]));
    // The glow's colour is transparent in light, so it draws nothing.
    const noShadow = (shadow: string) => shadow === "none" || /^rgba\([^)]*, 0\) /.test(shadow);
    for (const [glow, shadow] of await shadows()) if (glow) expect(noShadow(shadow as string), shadow as string).toBe(true);
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.reload();
    const dark = await shadows();
    expect(dark.filter(([glow]) => glow)).toHaveLength(3);
    for (const [glow, shadow] of dark) if (glow) expect(shadow).toMatch(/-56px/);
  });

  test("the header has the way home and the links to the homepage's sections", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: siteCopy.header.linksLabel, includeHidden: true });
    await expect(nav.locator("a").first()).toHaveAttribute("href", "/#work");
  });

  test("has no filters at ten or fewer projects", async ({ page }) => {
    expect(projects.length).toBeLessThanOrEqual(workArchive.filtersAfter);
    await expect(filters(page)).toHaveCount(0);
    await expect(page.locator(".archive__filters")).toHaveCount(0);
  });

  test("renders without script", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(panels(page)).toHaveCount(projects.length);
    for (const panel of await panels(page).all()) await expect(panel).toBeVisible();
  });

  test("the first screen's screenshots load at once", async ({ page }) => {
    const images = panels(page).locator(".project__shot img");
    for (const image of (await images.all()).slice(0, 3)) await expect(image).toHaveAttribute("loading", "eager");
  });

  test("has no sideways scroll, nothing under 13 px, and passes axe", async ({ page }) => {
    expect(await noOverflow(page)).toBeLessThanOrEqual(0);
    const sizes = await panels(page).evaluateAll((all) => all.flatMap((panel) => [...panel.querySelectorAll("*")].filter((node) => node.childElementCount === 0 && node.textContent?.trim()).map((node) => parseFloat(getComputedStyle(node).fontSize))));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(13);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`every text on the panels passes AA, measured on the rendered page (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      await page.evaluate(() => document.fonts.ready);
      const texts = await page.locator(".archive").innerText();
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of [workArchive.note.slice(0, 20), "Threshold", "Argus Risk", "Home Secretary", "Risk Event Tracker"]) {
        expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });
  }
});

test.describe("Work archive: either side of the filters' threshold (fixtures)", () => {
  test("ten projects have no filters and eleven have them", async ({ page }) => {
    await page.goto(`/fixtures/work-archive?count=${workArchive.filtersAfter}`);
    await expect(panels(page)).toHaveCount(workArchive.filtersAfter);
    await expect(filters(page)).toHaveCount(0);
    await page.goto(`/fixtures/work-archive?count=${workArchive.filtersAfter + 1}`);
    await expect(panels(page)).toHaveCount(workArchive.filtersAfter + 1);
    await expect(filters(page)).toBeVisible();
  });
});

test.describe("Work archive: a catalogue above ten (fixtures)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/work-archive");
  });

  test("lists all twelve, newest first, with the filters as outline pills", async ({ page }) => {
    await expect(panels(page)).toHaveCount(12);
    newestFirst(await years(page));
    await expect(filters(page).getByRole("button")).toHaveText(workArchive.filters.map(({ label }) => label));
    await expect(filters(page).getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(filters(page).getByRole("button").first()).toHaveClass(/pill--outline/);
  });

  test("each filter narrows the list to its category and All restores it", async ({ page }) => {
    await page.waitForFunction(() => Object.keys(document.querySelector(".archive__filters button")!).some((key) => key.startsWith("__reactProps$")));
    for (const [label, expected] of [
      ["Products", ["Fixture 1", "Fixture 4", "Fixture 7", "Fixture 10"]],
      ["Systems", ["Fixture 2", "Fixture 5", "Fixture 8", "Fixture 11"]],
      ["Experiments", ["Fixture 3", "Fixture 6", "Fixture 9", "Fixture 12"]],
    ] as const) {
      await filters(page).getByRole("button", { name: label, exact: true }).click();
      await expect(filters(page).getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect.poll(async () => [...(await names(page))].sort()).toEqual([...expected].sort());
      newestFirst(await years(page));
      await expect(page.locator("main").getByRole("status").filter({ hasText: /\S/ })).toHaveText(workArchive.count(4));
    }
    await filters(page).getByRole("button", { name: "All", exact: true }).click();
    await expect(panels(page)).toHaveCount(12);
  });

  test("a project with no screenshot is still a complete panel: its name, line and meta", async ({ page }) => {
    const panel = panels(page).filter({ has: page.getByRole("heading", { name: "Fixture 12", exact: true }) });
    await expect(panel).toHaveClass(/project--text/);
    await expect(panel.locator("img")).toHaveCount(0);
    await expect(panel.locator(".project__line")).toHaveText("Outcome of fixture 12.");
    await expect(panel.locator(".project__meta")).toContainText("Prototype");
    expect((await panel.boundingBox())!.height).toBeGreaterThan(100);
  });

  test("filters are at least 44 px tall, with no sideways scroll and no axe violations", async ({ page }) => {
    for (const button of await filters(page).getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await noOverflow(page)).toBeLessThanOrEqual(0);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Things I make: moved from /work", () => {
  // The three case studies that were published at /work/<slug>. Frozen: a later one never lived there.
  const legacySlugs = ["threshold", "argus-risk", "flowtime"];
  const moved = [["/work", "/things-i-make"], ...legacySlugs.map((slug) => [`/work/${slug}`, `/things-i-make/${slug}`])];

  test("the archive and each case study redirect permanently, one path at a time", async ({ request }) => {
    for (const [from, to] of moved) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), `${from} is a permanent redirect`).toBe(308);
      expect(new URL(response.headers().location, "http://localhost").pathname, `${from} goes to ${to}`).toBe(to);
    }
  });

  test("nothing else under /work/ moves: screenshots stay put and other paths are not redirected", async ({ request }) => {
    const image = await request.get(projects[0].screenshot!.src, { maxRedirects: 0 });
    expect(image.status(), "a screenshot is still served from its published address").toBe(200);
    // Role stories will live under /work/ (#172), so nothing else there may be sent anywhere.
    for (const path of ["/work/bnp-paribas", "/work/ask-professor-past"]) {
      const other = await request.get(path, { maxRedirects: 0 });
      expect(other.status(), `${path} is not redirected`).not.toBe(308);
    }
  });

  test("the archive and case studies use /things-i-make for their canonical and Open Graph URLs", async ({ page }) => {
    for (const path of ["/things-i-make", "/things-i-make/threshold"]) {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", new RegExp(`${path}$`));
    }
    await page.goto("/things-i-make");
    await expect(page).toHaveTitle(/^Things I make · Elias Bennett$/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", workArchive.description);
  });

  test("the sitemap lists home, the archive, the case studies at their new paths, the Role stories and the Résumé, and no moved /work paths", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
    const expected = ["/", "/things-i-make", ...Object.keys(caseStudies).map((slug) => `/things-i-make/${slug}`), ...roleStorySlugs.map((slug) => `/work/${slug}`), "/resume"];
    expect(paths.sort()).toEqual(expected.sort());
  });
});
