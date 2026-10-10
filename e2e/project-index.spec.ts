import { expect, test, type Page } from "@playwright/test";
import { featuredSlugs, projectIndex, projects } from "../src/content/projects";
import { workSection } from "../src/content/stretch/site-copy";

const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 761;
const rows = (page: Page) => page.locator(".stretch-index__row");
const expected = projectIndex(projects, featuredSlugs);

test.describe("Work: Project index on the homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("rows are the non-featured projects, newest first, with outcome, type and year", async ({ page }) => {
    await expect(rows(page)).toHaveCount(expected.length);
    for (const [index, project] of expected.entries()) {
      const row = rows(page).nth(index);
      await expect(row.locator(".stretch-index__name")).toHaveText(project.name);
      await expect(row.locator(".stretch-index__outcome")).toHaveText(project.outcome);
      await expect(row.locator(".stretch-index__meta")).toHaveText(`${project.type} · ${project.year}`);
      await expect(row.getByRole("link")).toHaveAttribute("href", project.links.caseStudy ?? project.links.live ?? project.links.code!);
    }
    const years = await rows(page).locator(".stretch-index__meta").allTextContents();
    const sorted = years.map((text) => Number(text.slice(-4)));
    expect(sorted).toEqual([...sorted].sort((a, b) => b - a));
  });

  test("the index is in the server-rendered page and All work links to /work", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(rows(page)).toHaveCount(expected.length);
    const all = page.locator("#work").getByRole("link", { name: workSection.allWork(projects.length) });
    await expect(all).toHaveAttribute("href", "/work");
  });

  test("a row turns cobalt and nudges its arrow on hover and on focus", async ({ page, browserName }) => {
    const cobalt = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--stretch-cobalt)";
      document.body.appendChild(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });
    const link = rows(page).first().getByRole("link");
    const name = rows(page).first().locator(".stretch-index__name");
    await expect(name).not.toHaveCSS("color", cobalt);
    await link.hover();
    await expect(name).toHaveCSS("color", cobalt);
    await expect(rows(page).first().locator(".stretch-index__arrow")).toHaveCSS("color", cobalt);
    await page.mouse.move(0, 0);
    await expect(name).not.toHaveCSS("color", cobalt);
    test.skip(browserName !== "chromium", "WebKit does not Tab to links");
    await link.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(name).toHaveCSS("color", cobalt);
  });

  test("rows without a screenshot render cleanly and with no preview", async ({ page }) => {
    for (const [index, project] of expected.entries()) {
      if (project.screenshot) continue;
      const row = rows(page).nth(index);
      await expect(row.locator(".stretch-index__shot")).toHaveCount(0);
      await row.getByRole("link").hover();
      await expect(row.locator(".stretch-index__name")).toBeVisible();
    }
  });

  test("rows are single-tap, 44 px targets with no sideways scroll on phones", async ({ page }) => {
    for (const index of expected.keys()) {
      const box = await rows(page).nth(index).getByRole("link").boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const all = await page.locator(".stretch-index__all a").boundingBox();
    expect(all!.height).toBeGreaterThanOrEqual(44);
    if (phone(page)) {
      const first = await rows(page).first().getByRole("link").boundingBox();
      expect(first!.width).toBeGreaterThan((page.viewportSize()?.width ?? 0) - 40);
    }
  });
});

test.describe("Work: Project index with a long catalogue", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/project-index");
  });

  test("stops at ten rows and All work shows the true count", async ({ page }) => {
    await expect(rows(page)).toHaveCount(10);
    await expect(page.getByRole("link", { name: workSection.allWork(14) })).toHaveAttribute("href", "/work");
    await expect(rows(page).first().locator(".stretch-index__number")).toHaveText("01");
    await expect(rows(page).nth(9).locator(".stretch-index__number")).toHaveText("10");
  });

  test("a row with a screenshot previews it on hover or shows a thumbnail on phones", async ({ page }) => {
    const shot = rows(page).first().locator(".stretch-index__shot");
    if (phone(page)) {
      await expect(shot).toBeVisible();
      const box = await shot.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(100);
    } else {
      await expect(shot).toBeHidden();
      await rows(page).first().getByRole("link").hover();
      await expect(shot).toBeVisible();
      const list = await page.locator(".stretch-index__list").boundingBox();
      const box = await shot.boundingBox();
      expect(box!.x).toBeGreaterThan(list!.x + list!.width * 0.55);
    }
  });
});
