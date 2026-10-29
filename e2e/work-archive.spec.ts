import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projectIndex, projects } from "../src/content/projects";
import { caseStudies } from "../src/content/stretch/case-studies";
import { roleStorySlugs } from "../src/content/stretch/role-stories";
import { siteCopy, thingsIMake, workArchive } from "../src/content/stretch/site-copy";

/*
 * The Work archive (docs/design/DESIGN.md, "The Work archive"): the homepage's Things I make, unabridged. Its rows
 * are the homepage's own (one implementation, covered in things-i-make.spec.ts); this file checks what the archive
 * adds: every project, newest first, the opening, no header links, and the filters only above ten projects.
 */

const rows = (page: Page) => page.locator(".qi-list__item");
const names = (page: Page) => rows(page).locator(".qi-row__title").allTextContents();
const years = async (page: Page) => (await rows(page).locator(".qi-row__meta").allTextContents()).map(Number);
const filters = (page: Page) => page.getByRole("group", { name: "Filter projects" });
const newestFirst = (list: number[]) => expect(list).toEqual([...list].sort((a, b) => b - a));
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(", ")})`;

test.describe("Work archive: the catalogue", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/things-i-make");
  });

  test("the h1 is the page's only one, with its note beneath, in the opening line's treatment", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const title = page.getByRole("heading", { level: 1, name: workArchive.heading });
    await expect(title).toBeVisible();
    await expect(title).toHaveClass(/qi-opening__line/);
    const note = page.getByText(workArchive.note);
    await expect(note).toBeVisible();
    expect((await note.boundingBox())!.y).toBeGreaterThan((await title.boundingBox())!.y);
  });

  test("lists every project, newest first, and the homepage's link shows the same count", async ({ page }) => {
    expect(await names(page)).toEqual(projectIndex(projects, []).map((project) => project.name));
    newestFirst(await years(page));
    const listed = await rows(page).count();
    await page.goto("/");
    await expect(page.getByRole("link", { name: thingsIMake.allThings(listed) })).toHaveAttribute("href", "/things-i-make");
  });

  test("the header has the way home and no section links", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Elias Bennett, home" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("navigation", { name: siteCopy.header.linksLabel })).toHaveCount(0);
  });

  test("has no filters at ten or fewer projects", async ({ page }) => {
    expect(projects.length).toBeLessThanOrEqual(workArchive.filtersAfter);
    await expect(filters(page)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Products" })).toHaveCount(0);
  });

  test("renders without script", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: workArchive.heading })).toBeVisible();
    await expect(page.getByText(workArchive.note)).toBeVisible();
    await expect(rows(page)).toHaveCount(projects.length);
  });

  test("each row goes to its case study, live site or code, and an external one says it opens in a new tab", async ({ page }) => {
    for (const [index, project] of projectIndex(projects, []).entries()) {
      const link = rows(page).nth(index).locator(".qi-row-box > a");
      const href = project.links.caseStudy ?? project.links.live ?? project.links.code!;
      await expect(link).toHaveAttribute("href", href);
      if (href.startsWith("http")) {
        const where = new URL(href).hostname === "github.com" ? "GitHub" : new URL(href).hostname.replace(/^www\./, "");
        await expect(link).toHaveAccessibleName(new RegExp(`^${project.name}.* opens ${where} in a new tab$`));
      } else {
        await expect(link).not.toHaveAccessibleName(/new tab/);
      }
    }
  });

  test("a row's closer look is the homepage's: the margin from 1180 px with a hover, inline when tapped", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const project = projectIndex(projects, [])[0];
    const row = rows(page).filter({ has: page.locator(`[data-look="project-${project.slug}"]`) });
    const wide = await page.evaluate(() => matchMedia("(min-width: 1180px) and (hover: hover)").matches);
    await page.waitForFunction(() => Object.keys(document.querySelector(".qi-column")!).some((key) => key.startsWith("__reactProps$")));
    const look = wide ? page.locator(".qi-margin .qi-project") : page.locator(`[data-look-slot="project-${project.slug}"] .qi-project`);
    if (wide) await row.locator(".qi-row").hover();
    else await row.locator(".qi-row__tap").click();
    await expect(look).toBeVisible();
    await expect(look.locator("figcaption")).toHaveText(`${project.type} · ${project.year}`);
    if (project.colours) await expect(look).toHaveCSS("background-color", rgb(project.colours.field));
  });

  test("has no sideways scroll, 44 px rows, and passes axe", async ({ page }) => {
    expect(await noOverflow(page)).toBeLessThanOrEqual(0);
    for (const index of Array.from({ length: await rows(page).count() }, (_, i) => i)) {
      const box = await rows(page).nth(index).locator(".qi-row").boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Work archive: either side of the filters' threshold (fixtures)", () => {
  test("ten projects have no filters and eleven have them", async ({ page }) => {
    await page.goto(`/fixtures/work-archive?count=${workArchive.filtersAfter}`);
    await expect(rows(page)).toHaveCount(workArchive.filtersAfter);
    await expect(filters(page)).toHaveCount(0);
    await page.goto(`/fixtures/work-archive?count=${workArchive.filtersAfter + 1}`);
    await expect(rows(page)).toHaveCount(workArchive.filtersAfter + 1);
    await expect(filters(page)).toBeVisible();
  });
});

test.describe("Work archive: a catalogue above ten (fixtures)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/work-archive");
  });

  test("lists all twelve, newest first, with the filters", async ({ page }) => {
    await expect(rows(page)).toHaveCount(12);
    newestFirst(await years(page));
    await expect(filters(page).getByRole("button")).toHaveText(workArchive.filters.map(({ label }) => label));
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
