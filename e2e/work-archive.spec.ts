import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projectIndex, projects } from "../src/content/projects";
import { caseStudies } from "../src/content/stretch/case-studies";
import { roleStorySlugs } from "../src/content/stretch/role-stories";
import { workArchive } from "../src/content/stretch/site-copy";

const rows = (page: Page) => page.locator(".stretch-index__row");
const names = (page: Page) => rows(page).locator(".stretch-index__name").allTextContents();
const years = async (page: Page) =>
  (await rows(page).locator(".stretch-index__meta").allTextContents()).map((text) => Number(text.slice(-4)));
const filters = (page: Page) => page.getByRole("group", { name: "Filter projects" });
const newestFirst = (list: number[]) => expect(list).toEqual([...list].sort((a, b) => b - a));

test.describe("Work archive: the catalogue", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/things-i-make");
  });

  test("names the page and lists every catalogue project, newest first", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: workArchive.heading })).toBeVisible();
    await expect(page.getByText(workArchive.note)).toBeVisible();
    expect(await names(page)).toEqual(projectIndex(projects, []).map((project) => project.name));
    newestFirst(await years(page));
  });

  test("has no filters at ten or fewer projects", async ({ page }) => {
    expect(projects.length).toBeLessThanOrEqual(workArchive.filtersAfter);
    await expect(filters(page)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Products" })).toHaveCount(0);
  });

  test("renders without script and has no entrance", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(rows(page)).toHaveCount(projects.length);
    await expect(page.locator("[data-entrance-layer]")).toHaveCount(0);
  });

  test("links home, and each row goes to its case study, live site or code", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Elias Bennett, home" })).toHaveAttribute("href", "/");
    for (const [index, project] of projectIndex(projects, []).entries()) {
      await expect(rows(page).nth(index).getByRole("link")).toHaveAttribute(
        "href",
        project.links.caseStudy ?? project.links.live ?? project.links.code!,
      );
    }
  });

  test("desktop fills the right column at rest with the first screenshot and swaps it on hover", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 761, "Phones use inline thumbnails");
    const resting = page.locator(".stretch-index__shot[data-resting]");
    await expect(resting).toHaveCount(1);
    await expect(resting).toBeVisible();
    const [list, box] = await Promise.all([page.locator(".stretch-index__list").boundingBox(), resting.boundingBox()]);
    expect(box!.x).toBeGreaterThan(list!.x + list!.width * 0.55);
    const second = rows(page).nth(1).locator(".stretch-index__shot");
    await rows(page).nth(1).getByRole("link").hover();
    await expect(second).toBeVisible();
    await expect(resting).toBeHidden();
    await page.mouse.move(0, 0);
    await expect(resting).toBeVisible();
  });

  test("has no sideways scroll, 44 px rows, and passes axe", async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    for (const index of Array.from({ length: await rows(page).count() }, (_, i) => i)) {
      const box = await rows(page).nth(index).getByRole("link").boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Work archive: a catalogue above ten (fixtures)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/work-archive");
  });

  test("lists all twelve, newest first, with the filters", async ({ page }) => {
    await expect(rows(page)).toHaveCount(12);
    newestFirst(await years(page));
    const buttons = filters(page).getByRole("button");
    await expect(buttons).toHaveText(workArchive.filters.map(({ label }) => label));
    await expect(filters(page).getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("each filter narrows the list to its category and All restores it", async ({ page }) => {
    for (const [label, expected] of [
      ["Products", ["Fixture 1", "Fixture 4", "Fixture 7", "Fixture 10"]],
      ["Systems", ["Fixture 2", "Fixture 5", "Fixture 8", "Fixture 11"]],
      ["Experiments", ["Fixture 3", "Fixture 6", "Fixture 9", "Fixture 12"]],
    ] as const) {
      await filters(page).getByRole("button", { name: label, exact: true }).click();
      await expect(filters(page).getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-pressed", "true");
      expect([...(await names(page))].sort()).toEqual([...expected].sort());
      newestFirst(await years(page));
      await expect(page.getByRole("status")).toHaveText(workArchive.count(4));
    }
    await filters(page).getByRole("button", { name: "All", exact: true }).click();
    await expect(rows(page)).toHaveCount(12);
  });

  test("filters are reachable and at least 44 px tall, with no sideways scroll", async ({ page }) => {
    for (const button of await filters(page).getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
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
