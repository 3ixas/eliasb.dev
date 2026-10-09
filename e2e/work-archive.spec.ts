import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projectIndex, projects } from "../src/content/projects";
import { workArchive } from "../src/content/stretch/site-copy";

const rows = (page: Page) => page.locator(".stretch-index__row");
const names = (page: Page) => rows(page).locator(".stretch-index__name").allTextContents();
const years = async (page: Page) =>
  (await rows(page).locator(".stretch-index__meta").allTextContents()).map((text) => Number(text.slice(-4)));
const filters = (page: Page) => page.getByRole("group", { name: "Filter projects" });
const newestFirst = (list: number[]) => expect(list).toEqual([...list].sort((a, b) => b - a));

test.describe("Work archive: the catalogue", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work");
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
    await expect(buttons).toHaveText([...workArchive.filters]);
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
