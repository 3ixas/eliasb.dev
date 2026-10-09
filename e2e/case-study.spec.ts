import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projects } from "../src/content/projects";
import { caseStudies } from "../src/content/stretch/case-studies";
import { caseStudySectionKeys, caseStudySectionLabels } from "../src/content/stretch/case-study";
import { contrastOnPaper } from "./support/contrast";

const slugs = Object.keys(caseStudies);
const threshold = caseStudies.threshold;
const thresholdProject = projects.find((project) => project.slug === "threshold")!;

const article = (page: Page) => page.getByRole("article", { name: thresholdProject.name });

test.describe("Case study: Threshold", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work/threshold");
  });

  test("the opening band carries the number, name, outcome, metadata, stack and links", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Threshold");
    const band = page.getByRole("region", { name: "Overview" });
    await expect(band.locator(".stretch-cs-open__number")).toHaveText(threshold.number);
    await expect(band).toContainText(thresholdProject.outcome);
    await expect(band).toContainText(`${thresholdProject.type} · ${thresholdProject.year}`);
    await expect(band).toContainText("React 19, TypeScript, MapLibre");
    await expect(band.getByRole("link", { name: "Live site", exact: true })).toHaveAttribute("href", thresholdProject.links.live!);
    await expect(band.getByRole("link", { name: "Code", exact: true })).toHaveAttribute("href", thresholdProject.links.code!);
    await expect(band.getByRole("link", { name: "Work", exact: true })).toHaveAttribute("href", "/work");
    await expect(band.locator("img")).toHaveAttribute("alt", thresholdProject.screenshot!.alt);
  });

  test("the band is in the project's colours", async ({ page }) => {
    const colours = thresholdProject.colours!;
    const band = page.locator(".stretch-cs-open");
    const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
    await expect(band).toHaveCSS("background-color", rgb(colours.field));
    await expect(band).toHaveCSS("color", rgb(colours.ink));
  });

  test("six sections in the keyed order, each reachable from the row of section links", async ({ page }) => {
    const links = page.getByRole("navigation", { name: "Sections" }).getByRole("link");
    await expect(links).toHaveText(caseStudySectionKeys.map((key, index) => `0${index + 1} ${caseStudySectionLabels[key]}`));
    const ids = await page.locator("article section[id]").evaluateAll((sections) => sections.map((section) => section.id));
    expect(ids).toEqual([...caseStudySectionKeys]);
    for (const key of caseStudySectionKeys) {
      await expect(page.locator(`section#${key} h2`)).toHaveCount(1);
      await expect(links.filter({ hasText: caseStudySectionLabels[key] })).toHaveAttribute("href", `#${key}`);
    }
    await links.last().click();
    await expect(page).toHaveURL(/#whats-next$/);
    await expect(page.locator("section#whats-next")).toBeInViewport();
  });

  test("section copy is the approved copy", async ({ page }) => {
    for (const key of caseStudySectionKeys) {
      const { heading, paragraphs, points } = threshold.sections[key];
      const section = page.locator(`section#${key}`);
      await expect(section.getByRole("heading", { level: 2 })).toHaveText(heading ?? caseStudySectionLabels[key]);
      for (const paragraph of paragraphs ?? []) await expect(section).toContainText(paragraph);
      for (const { lead, text } of points ?? []) await expect(section).toContainText(`${lead} ${text}`);
    }
  });

  test("the PRD card and the evidence strip show only the project's own figures", async ({ page }) => {
    const section = page.locator("section#written-down-first");
    await expect(section.locator("blockquote")).toHaveText(threshold.prd.quote);
    await expect(section.locator("figcaption")).toContainText(threshold.prd.date!);
    const items = section.getByRole("list", { name: "Evidence" }).getByRole("listitem");
    await expect(items).toHaveText(threshold.evidence.map(({ value, label }) => `${value}${label}`));
  });

  test("wide figures are framed in the project's colour, with their captions", async ({ page }) => {
    const frames = article(page).locator(".stretch-cs-figure");
    await expect(frames).toHaveCount(2);
    for (const [index, key] of (["decisions", "how-its-built"] as const).entries()) {
      const figure = threshold.sections[key].figure!;
      await expect(frames.nth(index).locator("img")).toHaveAttribute("alt", figure.alt);
      await expect(frames.nth(index).locator("figcaption")).toHaveText(figure.caption);
    }
    const frame = await frames.first().locator(".stretch-cs-figure__frame").boundingBox();
    const text = await page.locator("section#decisions .stretch-cs-section__text").boundingBox();
    expect(text!.width).toBeLessThanOrEqual(720);
    expect(frame!.width).toBeGreaterThanOrEqual(Math.min(text!.width, 720));
  });

  test("the Next project tile links to the next case study", async ({ page }) => {
    const tile = page.getByRole("region", { name: "Next project" }).getByRole("link");
    await expect(tile).toHaveAttribute("href", "/work/argus-risk");
    await expect(tile).toContainText("Argus Risk");
    expect((await tile.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await tile.click();
    await expect(page).toHaveURL(/\/work\/argus-risk$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Argus Risk");
  });

  test("cobalt is not used on the page", async ({ page }) => {
    const cobalt = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--stretch-cobalt").trim());
    const toRgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
    const used = await page.locator("[data-stretch-shell] *").evaluateAll((elements, colour) => {
      return elements.filter((element) => {
        // The skip link is cobalt, but only when focused; it waits off-screen.
        if (element.classList.contains("stretch-skip")) return false;
        const style = getComputedStyle(element);
        return [style.color, style.backgroundColor, style.borderTopColor].includes(colour) && element.checkVisibility();
      }).length;
    }, toRgb(cobalt));
    expect(used).toBe(0);
  });

  test("opens at once: no entrance holds the page, even with motion on", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/work/threshold");
    expect(await page.evaluate(() => document.documentElement.hasAttribute("data-entering"))).toBe(false);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    expect(await page.evaluate(() => Number(getComputedStyle(document.querySelector("main")!).opacity))).toBe(1);
  });

  test("it is in the server-rendered page", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(page.locator("article section[id]")).toHaveCount(6);
    await expect(page.getByRole("list", { name: "Evidence" }).getByRole("listitem")).toHaveCount(4);
  });

  test("text passes WCAG 2.2 AA contrast over the project's colours and the page", async ({ page }) => {
    const selectors = [
      ".stretch-cs-back",
      ".stretch-cs-open__name",
      ".stretch-cs-open__outcome",
      ".stretch-cs-open__meta",
      ".stretch-cs-button",
      ".stretch-cs-links-row a",
      ".stretch-cs-h2",
      ".stretch-cs-p",
      ".stretch-cs-lead",
      ".stretch-cs-kicker",
      ".stretch-prd__quote",
      ".stretch-cs-evidence__value",
      ".stretch-cs-evidence__label",
      ".stretch-cs-figure figcaption",
      ".stretch-cs-next__label",
      ".stretch-cs-next__name",
      ".stretch-cs-next__outcome",
    ];
    for (const selector of selectors) {
      const readings = await contrastOnPaper(page, selector);
      expect(readings.length, selector).toBeGreaterThan(0);
      for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("has no axe violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

for (const slug of slugs) {
  test.describe(`Case study layout: ${slug}`, () => {
    test("renders all six sections, the evidence and a different Next project, without sideways scroll", async ({ page }) => {
      const response = await page.goto(`/work/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("article section[id]")).toHaveCount(6);
      await expect(page.getByRole("list", { name: "Evidence" }).getByRole("listitem")).toHaveCount(caseStudies[slug].evidence.length);
      await expect(page.getByRole("region", { name: "Next project" }).getByRole("link")).toHaveAttribute("href", `/work/${caseStudies[slug].next}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const width = page.viewportSize()?.width ?? 0;
      for (const box of await Promise.all((await page.locator("[data-case-study] main *").all()).map((item) => item.boundingBox()))) {
        if (box) expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      }
    });

    test("every link and button is at least 44 px tall", async ({ page }) => {
      await page.goto(`/work/${slug}`);
      for (const target of await page.locator("[data-case-study] a:visible, [data-case-study] button:visible").all()) {
        if (await target.evaluate((element) => element.classList.contains("stretch-skip"))) continue;
        const box = await target.boundingBox();
        expect(box!.height, (await target.textContent()) ?? "").toBeGreaterThanOrEqual(44);
      }
    });
  });
}

test("a slug with no case study is a 404", async ({ page }) => {
  expect((await page.goto("/work/ask-professor-past"))?.status()).toBe(404);
  expect((await page.goto("/work/constructor"))?.status()).toBe(404);
});
