import { expect, test, type Page } from "@playwright/test";
import { featuredProjects, featuredSlugs, HOMEPAGE_INDEX_ROWS, projectIndex, projects } from "../src/content/projects";
import { thingsIMake } from "../src/content/stretch/site-copy";
import { contrastOnPaper } from "./support/contrast";

/*
 * Things I make (docs/design/DESIGN.md, "The homepage, in order"): one list of rows, the featured projects first,
 * each with an object cropped from its own screenshot; on phones the featured three are swipeable cards.
 */

const featured = featuredProjects(projects, featuredSlugs);
const shown = [...featured, ...projectIndex(projects, featuredSlugs).slice(0, HOMEPAGE_INDEX_ROWS)];
const section = (page: Page) => page.locator("section#things-i-make");
const items = (page: Page) => section(page).locator(".qi-list__item");
const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 761;
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(", ")})`;

test.describe("Things I make: the rows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("one list: the featured three in order, the others newest first, then the archive link with the true count", async ({ page }) => {
    await expect(section(page).locator("ul")).toHaveCount(1);
    await expect(items(page)).toHaveCount(shown.length);
    expect(shown.slice(0, 3).map((project) => project.slug)).toEqual(["threshold", "argus-risk", "flowtime"]);
    for (const [index, project] of shown.entries()) {
      const item = items(page).nth(index);
      await expect(item.locator(".qi-row__title")).toHaveText(project.name);
      await expect(item.locator(".qi-row__line")).toHaveText(thingsIMake.rowOutcomes[project.slug] ?? project.outcome);
      await expect(item.locator(".qi-row__meta")).toHaveText(String(project.year));
    }
    const years = await section(page).locator(".qi-row__meta").allTextContents();
    const others = years.slice(featured.length).map(Number);
    expect(others).toEqual([...others].sort((a, b) => b - a));
    await expect(section(page).locator(".qi-row-box > a, .qi-row-box > div")).toHaveCount(shown.length);
    const all = section(page).getByRole("link", { name: thingsIMake.allThings(projects.length) });
    await expect(all).toHaveAttribute("href", "/things-i-make");
    expect((await all.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

  test("the rows are in the server-rendered page", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(items(page)).toHaveCount(shown.length);
  });

  test("the Featured tiles, their tilt and their Fasteners are gone from the homepage", async ({ page }) => {
    await expect(section(page).locator(".stretch-tile, .stretch-tiles, .stretch-fastener, .stretch-index, .stretch-intro")).toHaveCount(0);
  });

  test("a project row goes to its case study, else its live site, else its code; external ones are marked ↗ and open in a new tab", async ({ page }) => {
    for (const [index, project] of shown.entries()) {
      const link = items(page).nth(index).locator(".qi-row-box > a");
      const href = project.links.caseStudy ?? project.links.live ?? project.links.code!;
      await expect(link).toHaveAttribute("href", href);
      if (href.startsWith("http")) {
        const where = new URL(href).hostname === "github.com" ? "GitHub" : new URL(href).hostname.replace(/^www\./, "");
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noreferrer/);
        await expect(link.locator(".qi-row__arrow")).toHaveText("↗");
        await expect(link).toHaveAccessibleName(new RegExp(`^${project.name}.* opens ${where} in a new tab$`));
      } else {
        await expect(link).not.toHaveAttribute("target", "_blank");
        await expect(link.locator(".qi-row__arrow")).toHaveText("→");
        await expect(link).not.toHaveAccessibleName(/new tab/);
      }
    }
  });

  test("an object is a 44 px crop of the project's own screenshot that fills its slot, on its Project colour", async ({ page }) => {
    for (const [index, project] of shown.entries()) {
      // A phone's featured projects are cards, which have no object.
      if (phone(page) && index < featured.length) continue;
      const object = items(page).nth(index).locator(".qi-crop");
      const image = object.locator("img");
      await expect(image).toHaveAttribute("src", /\/_next\/image/);
      const [slot, shot] = await Promise.all([object.boundingBox(), image.boundingBox()]);
      expect(slot!.width).toBeCloseTo(44, 0);
      expect(slot!.height).toBeCloseTo(44, 0);
      // The screenshot is zoomed in beyond the slot, and covers all of it.
      expect(shot!.width, project.slug).toBeGreaterThan(slot!.width * (project.crop!.zoom - 0.1));
      expect(shot!.x).toBeLessThanOrEqual(slot!.x + 0.5);
      expect(shot!.y).toBeLessThanOrEqual(slot!.y + 0.5);
      expect(shot!.x + shot!.width).toBeGreaterThanOrEqual(slot!.x + slot!.width - 0.5);
      expect(shot!.y + shot!.height).toBeGreaterThanOrEqual(slot!.y + slot!.height - 0.5);
      await expect(object).toHaveCSS("border-top-left-radius", "11px");
      if (project.colours) await expect(object).toHaveCSS("background-color", rgb(project.colours.field));
    }
  });

  test("project colours pass contrast: their ink on their field reads at 4.5:1 and their swatch at 3:1", async () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((start) => {
        const c = parseInt(hex.slice(start, start + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
    for (const { slug, colours } of featured) {
      expect(ratio(colours!.ink, colours!.field), slug).toBeGreaterThanOrEqual(4.5);
      expect(ratio(colours!.swatch, colours!.field), slug).toBeGreaterThanOrEqual(3);
    }
  });
});

test.describe("Things I make: the closer look in the margin", () => {
  test("hovering a project slides in its screenshot on its Project colour, with its type and year", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    test.skip(!(await page.evaluate(() => matchMedia("(min-width: 1180px) and (hover: hover)").matches)), "The margin is for wide screens with a hover");
    const column = section(page).locator("[data-quiet-column]");
    await page.waitForFunction(() => Object.keys(document.querySelector("#things-i-make [data-quiet-column]")!).some((key) => key.startsWith("__reactProps$")));
    for (const project of featured) {
      await section(page).locator(`.qi-list__item:has([data-look="project-${project.slug}"]) .qi-row`).hover();
      const look = page.locator(".qi-margin .qi-project");
      await expect(look).toBeVisible();
      await expect(look.locator("figcaption")).toHaveText(`${project.type} · ${project.year}`);
      await expect(look.locator("img")).toBeVisible();
      await expect(look).toHaveCSS("background-color", rgb(project.colours!.field));
      const readings = await contrastOnPaper(page, ".qi-margin .qi-project figcaption");
      expect(readings.every((reading) => reading.ratio >= 4.5)).toBe(true);
    }
    await page.mouse.move(0, 0);
    await expect(page.locator(".qi-margin")).toHaveCount(0);
    await expect(column).toBeVisible();
  });
});

test.describe("Things I make: phone cards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("at phone width the featured three are scroll-snapping cards at 82% and the rest stay rows, in the one list", async ({ page }) => {
    test.skip(!phone(page), "Phones only");
    const list = section(page).locator("ul");
    await expect(list).toHaveCount(1);
    await expect(list).toHaveCSS("scroll-snap-type", "x mandatory");
    const listBox = (await list.boundingBox())!;
    const content = listBox.width - 32;
    for (const [index, project] of featured.entries()) {
      const card = items(page).nth(index);
      const box = (await card.boundingBox())!;
      expect(box.width, project.slug).toBeCloseTo(content * 0.82, 0);
      await expect(card).toHaveCSS("scroll-snap-align", "start");
      await expect(card.getByRole("img", { name: project.screenshot!.alt })).toBeVisible();
      await expect(card.locator(".qi-row__object")).toBeHidden();
      await expect(card.locator(".qi-row__tap")).toBeHidden();
      await expect(card.locator(".qi-row__title")).toHaveText(project.name);
      await expect(card.locator(".qi-row__line")).toHaveText(thingsIMake.rowOutcomes[project.slug] ?? project.outcome);
    }
    expect((await items(page).first().boundingBox())!.x).toBeCloseTo(16, 0);
    for (let index = featured.length; index < shown.length; index++) {
      const row = items(page).nth(index);
      const box = (await row.boundingBox())!;
      expect(box.width).toBeCloseTo(content, 0);
      expect((await row.locator(".qi-row").boundingBox())!.width).toBeCloseTo(content + 24, 0);
      await expect(row.locator(".qi-card__shot")).toHaveCount(0);
      await expect(row.locator(".qi-row__object")).toBeVisible();
    }
    // Swiping moves the cards and leaves the rows where they are.
    const rowBefore = (await items(page).nth(featured.length).boundingBox())!;
    const cardBefore = (await items(page).first().boundingBox())!;
    await list.evaluate((element) => element.scrollTo({ left: element.scrollWidth, behavior: "instant" }));
    await expect.poll(async () => (await items(page).first().boundingBox())!.x).toBeLessThan(cardBefore.x - 40);
    expect((await items(page).nth(featured.length).boundingBox())!.x).toBeCloseTo(rowBefore.x, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("a card's text passes contrast on its Project colour and it opens the case study in one tap", async ({ page }) => {
    test.skip(!phone(page), "Phones only");
    for (const selector of [".qi-row__title", ".qi-row__line"]) {
      const readings = await contrastOnPaper(page, `#things-i-make [data-card] ${selector}`);
      expect(readings).toHaveLength(featured.length);
      for (const reading of readings) expect(reading.ratio, reading.text ?? "").toBeGreaterThanOrEqual(4.5);
    }
    await items(page).first().locator(".qi-row").click();
    await expect(page).toHaveURL(/\/things-i-make\/threshold$/);
  });

  test("a focused card keeps its Project colour", async ({ page, browserName }) => {
    test.skip(!phone(page) || browserName !== "chromium", "Phones, Chromium (Safari does not Tab to links)");
    const link = items(page).first().locator(".qi-row");
    await link.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(items(page).first()).toHaveCSS("background-color", rgb(featured[0].colours!.field));
    expect(parseFloat(await link.evaluate((element) => getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
  });

  test("from 761 px the list is not a carousel and shows no card screenshot", async ({ page }) => {
    test.skip(phone(page), "Wider than a phone only");
    const list = section(page).locator("ul");
    expect(await list.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await expect(section(page).locator(".qi-card__shot").first()).toBeHidden();
    await expect(items(page).first().locator(".qi-row__object")).toBeVisible();
  });
});
