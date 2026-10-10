import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projects } from "../src/content/projects";
import { caseStudies, caseStudySlugs } from "../src/content/stretch/case-studies";
import { caseStudySectionKeys, caseStudySectionLabels } from "../src/content/stretch/case-study";
import { contrastOnPaper } from "./support/contrast";

const slugs = caseStudySlugs;

const article = (page: Page, name: string) => page.getByRole("article", { name });

for (const slug of slugs) {
  const study = caseStudies[slug];
  const project = projects.find((entry) => entry.slug === slug)!;

  test.describe(`Case study: ${project.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/work/${slug}`);
    });

    test("the opening band carries the number, name, outcome, metadata, stack and links", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.name);
      const band = page.getByRole("region", { name: "Overview" });
      await expect(band.locator(".stretch-cs-open__number")).toHaveText(study.number);
      await expect(band).toContainText(project.outcome);
      await expect(band).toContainText(`${project.type} · ${project.year}`);
      await expect(band).toContainText(study.stack.join(", "));
      if (study.note) await expect(band).toContainText(study.note);
      const live = band.getByRole("link", { name: "Live site", exact: true });
      if (project.links.live) await expect(live).toHaveAttribute("href", project.links.live);
      else await expect(live).toHaveCount(0);
      await expect(band.getByRole("link", { name: "Code", exact: true })).toHaveAttribute("href", project.links.code!);
      await expect(band.getByRole("link", { name: "Work", exact: true })).toHaveAttribute("href", "/work");
      await expect(band.locator("img")).toHaveAttribute("alt", project.screenshot!.alt);
    });

    test("the band is in the project's colours", async ({ page }) => {
      const colours = project.colours!;
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
        const { heading, paragraphs, points } = study.sections[key];
        const section = page.locator(`section#${key}`);
        await expect(section.getByRole("heading", { level: 2 })).toHaveText(heading ?? caseStudySectionLabels[key]);
        for (const paragraph of paragraphs ?? []) await expect(section).toContainText(paragraph);
        for (const { lead, text } of points ?? []) await expect(section).toContainText(`${lead} ${text}`);
      }
    });

    test("the PRD card and the evidence strip show only the project's own figures", async ({ page }) => {
      const section = page.locator("section#written-down-first");
      await expect(section.locator("blockquote")).toHaveText(study.prd.quote);
      for (const around of [study.prd.lead, study.prd.after]) if (around) await expect(section).toContainText(around);
      if (study.prd.date) await expect(section.locator("figcaption")).toContainText(study.prd.date);
      else await expect(section.locator("figcaption")).toHaveCount(0);
      const items = section.getByRole("list", { name: "Evidence" }).getByRole("listitem");
      await expect(items).toHaveText(study.evidence.map(({ value, label }) => `${value}${label}`));
    });

    test("wide figures are framed in the project's colour, with their captions", async ({ page }) => {
      const figures = caseStudySectionKeys.flatMap((key) => {
        const figure = study.sections[key].figure;
        return figure ? [{ key, figure }] : [];
      });
      await expect(article(page, project.name).locator(".stretch-cs-figure")).toHaveCount(figures.length);
      for (const { key, figure } of figures) {
        const frame = page.locator(`section#${key} .stretch-cs-figure`);
        await expect(frame.locator("img")).toHaveAttribute("alt", figure.alt);
        await expect(frame.locator("figcaption")).toHaveText(figure.caption);
        const box = await frame.locator(".stretch-cs-figure__frame").boundingBox();
        const text = await page.locator(`section#${key} .stretch-cs-section__text`).boundingBox();
        expect(text!.width).toBeLessThanOrEqual(720);
        expect(box!.width).toBeGreaterThanOrEqual(Math.min(text!.width, 720));
      }
    });

    test("the Next project tile links to the next case study", async ({ page }) => {
      const tile = page.getByRole("region", { name: "Next project" }).getByRole("link");
      const next = projects.find((entry) => entry.slug === study.next)!;
      await expect(tile).toHaveAttribute("href", `/work/${study.next}`);
      await expect(tile).toContainText(next.name);
      await expect(tile).toContainText(caseStudies[study.next].number);
      expect((await tile.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await tile.click();
      await expect(page).toHaveURL(new RegExp(`/work/${study.next}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(next.name);
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
      await page.goto(`/work/${slug}`);
      expect(await page.evaluate(() => document.documentElement.hasAttribute("data-entering"))).toBe(false);
      await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
      expect(await page.evaluate(() => Number(getComputedStyle(document.querySelector("main")!).opacity))).toBe(1);
    });

    test("it is in the server-rendered page", async ({ page }) => {
      await page.route("**/*.js", (route) => route.abort());
      await page.reload();
      await expect(page.locator("article section[id]")).toHaveCount(6);
      await expect(page.getByRole("list", { name: "Evidence" }).getByRole("listitem")).toHaveCount(study.evidence.length);
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
        // A study without figures has no captions to read.
        if ((await page.locator(selector).count()) === 0 && selector.includes("figure")) continue;
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
}

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
  expect(caseStudies).not.toHaveProperty("ask-professor-past");
  expect(projects.find((project) => project.slug === "ask-professor-past")?.links.caseStudy).toBeUndefined();
  expect((await page.goto("/work/ask-professor-past"))?.status()).toBe(404);
  expect((await page.goto("/work/constructor"))?.status()).toBe(404);
});
