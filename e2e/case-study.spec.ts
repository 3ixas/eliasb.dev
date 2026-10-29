import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { projects } from "../src/content/projects";
import { caseStudies, caseStudySlugs } from "../src/content/stretch/case-studies";
import { caseStudyCopy, caseStudySectionKeys, caseStudySectionLabels } from "../src/content/stretch/case-study";
import { contrastOnPaper } from "./support/contrast";

const schemes = ["light", "dark"] as const;
/** From this width the header carries the section links, on a row of their own. */
const LINKS_FROM = 900;
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

for (const slug of caseStudySlugs) {
  const study = caseStudies[slug];
  const project = projects.find((entry) => entry.slug === slug)!;
  const next = projects.find((entry) => entry.slug === study.next)!;

  test.describe(`Case study: ${project.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/things-i-make/${slug}`);
    });

    test("the opening has the project as the one h1, its outcome, type, year and stack, the links it has, and the back link", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.name);
      const opening = page.locator("article header");
      await expect(opening).toContainText(project.outcome);
      await expect(opening.locator(".qi-long__meta")).toHaveText(`${project.type} · ${project.year} · ${study.stack.join(", ")}`);
      if (study.note) await expect(opening).toContainText(study.note);
      // A project with no live site or no code shows only the links it has.
      const live = opening.getByRole("link", { name: "Live site", exact: true });
      if (project.links.live) await expect(live).toHaveAttribute("href", project.links.live);
      else await expect(live).toHaveCount(0);
      const code = opening.getByRole("link", { name: "Code", exact: true });
      if (project.links.code) await expect(code).toHaveAttribute("href", project.links.code);
      else await expect(code).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Things I make", exact: true }).first()).toHaveAttribute("href", "/things-i-make");
      // The old opening band, its number and the numbered section bar are gone.
      await expect(page.locator(".stretch-cs-open, .stretch-cs-links-row, .stretch-cs-evidence, .stretch-cs-next")).toHaveCount(0);
    });

    test("the landing screenshot sits at column width on the project's colour with a 14 px radius", async ({ page }) => {
      const shot = page.locator(".qi-case__below .qi-case__shot");
      await expect(shot.locator(".qi-zoom img")).toHaveAttribute("alt", project.screenshot!.alt);
      await expect(shot).toHaveCSS("background-color", rgb(project.colours!.field));
      await expect(shot).toHaveCSS("border-top-left-radius", "14px");
      const [box, column] = await Promise.all([shot.boundingBox(), page.locator(".qi-long .qi-column").first().boundingBox()]);
      expect(Math.abs(box!.width - column!.width)).toBeLessThanOrEqual(1);
    });

    test("the header is the shared one, and its links are this page's six sections", async ({ page }) => {
      const width = page.viewportSize()?.width ?? 0;
      await expect(page.locator("header.qi-header")).toHaveCount(1);
      await expect(page.locator(".stretch-header")).toHaveCount(0);
      await expect(page.locator('nav[aria-label="On this page"]')).toHaveCount(1);
      const links = page.locator(".qi-header__links a");
      await expect(links).toHaveText(caseStudySectionKeys.map((key) => caseStudySectionLabels[key]));
      for (const key of caseStudySectionKeys) await expect(links.filter({ hasText: caseStudySectionLabels[key] })).toHaveAttribute("href", `#${key}`);
      const ids = await page.locator("article section[id]").evaluateAll((sections) => sections.map((section) => section.id));
      expect(ids).toEqual([...caseStudySectionKeys]);
      for (const key of caseStudySectionKeys) await expect(page.locator(`section#${key} h2`)).toHaveCount(1);
      if (width < LINKS_FROM) {
        await expect(links.first()).toBeHidden();
        return;
      }
      await expect(links.first()).toBeVisible();
      // The header is the column wide: the links share the title's left edge and run along one row beneath the name.
      await expect
        .poll(async () => {
          const [title, first, last, greeting, column] = await Promise.all([
            page.getByRole("heading", { level: 1 }).boundingBox(),
            links.first().boundingBox(),
            links.last().boundingBox(),
            page.locator("[data-greeting]").boundingBox(),
            page.locator(".qi-long .qi-column").first().boundingBox(),
          ]);
          return {
            sharedLeftEdge: Math.abs(first!.x - title!.x) <= 1,
            insideColumn: last!.x + last!.width <= column!.x + column!.width + 1,
            oneLine: Math.abs(first!.y - last!.y) <= 1,
            below: first!.y >= greeting!.y + greeting!.height - 1,
          };
        })
        .toEqual({ sharedLeftEdge: true, insideColumn: true, oneLine: true, below: true });
      await links.last().click();
      await expect(page).toHaveURL(/#whats-next$/);
      await expect(page.locator("section#whats-next")).toBeInViewport();
      await expect(links.last()).toHaveAttribute("aria-current", "location");
    });

    test("the title has the opening line's treatment, sections are 17 px, and the metadata is 13 px mono", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveClass(/qi-opening__line/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-weight", "650");
      for (const heading of await page.locator("article h2").all()) {
        await expect(heading).toHaveCSS("font-size", "17px");
        await expect(heading).toHaveCSS("font-weight", "650");
      }
      await expect(page.locator(".qi-long__meta")).toHaveCSS("font-size", "13px");
    });

    test("a section's address opens on that section, below the header, and focuses it", async ({ page }) => {
      await page.goto(`/things-i-make/${slug}#decisions`);
      await expect(page.locator("section#decisions")).toBeInViewport();
      await expect(page.locator("section#decisions")).toBeFocused();
      const headerBottom = await page.locator("header.qi-header").evaluate((header) => header.getBoundingClientRect().bottom);
      await expect.poll(() => page.locator("section#decisions h2").evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headerBottom - 1);
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

    test("the PRD is one inline Sheet: the quote at 19 px, From the PRD and its date, the project's own figures as a quiet line", async ({ page }) => {
      const section = page.locator("section#written-down-first");
      await expect(section.locator(".qi-case__sheet")).toHaveCount(1);
      await expect(section.locator("blockquote")).toHaveText(`“${study.prd.quote}”`);
      await expect(section.locator("blockquote")).toHaveCSS("font-size", "19px");
      for (const around of [study.prd.lead, study.prd.after]) if (around) await expect(section).toContainText(around);
      await expect(section.locator("figcaption")).toHaveText(study.prd.date ? `From the PRD · ${study.prd.date}` : "From the PRD");
      const items = section.getByRole("list", { name: "Evidence" }).getByRole("listitem");
      await expect(items).toHaveText(study.evidence.map(({ value, label }) => `${value} ${label}`));
      await expect(items.first().locator("strong")).toHaveCSS("font-size", "17px");
      await expect(items.first().locator("strong")).toHaveCSS("font-weight", "600");
      await expect(items.first().locator("span")).toHaveCSS("font-size", "13px");
      // The old card, its separate strip and its tape are gone.
      await expect(page.locator(".stretch-prd, .stretch-cs-prd-group, .stretch-fastener")).toHaveCount(0);
    });

    test("figures sit inline at column width on the project's colour, with their captions", async ({ page }) => {
      const figures = caseStudySectionKeys.flatMap((key) => {
        const figure = study.sections[key].figure;
        return figure ? [{ key, figure }] : [];
      });
      await expect(page.locator("article section .qi-figure")).toHaveCount(figures.length);
      const column = await page.locator(".qi-long .qi-column").first().boundingBox();
      for (const { key, figure } of figures) {
        const frame = page.locator(`section#${key} .qi-figure`);
        await expect(frame.locator(".qi-zoom img")).toHaveAttribute("alt", figure.alt);
        await expect(frame.locator("figcaption")).toHaveText(figure.caption);
        await expect(frame.locator("figcaption")).toHaveCSS("font-size", "13px");
        const shot = frame.locator(".qi-case__shot");
        await expect(shot).toHaveCSS("background-color", rgb(project.colours!.field));
        await expect(shot).toHaveCSS("border-top-left-radius", "14px");
        expect(Math.abs((await shot.boundingBox())!.width - column!.width)).toBeLessThanOrEqual(1);
      }
    });

    test("it ends on one row to the next project, and following it opens that case study", async ({ page }) => {
      const region = page.getByRole("region", { name: caseStudyCopy.nextProject });
      const row = region.getByRole("link");
      await expect(row).toHaveCount(1);
      await expect(row).toHaveAttribute("href", `/things-i-make/${study.next}`);
      await expect(row).toContainText(next.name);
      await expect(row).toContainText(next.outcome);
      await expect(row.locator(".qi-row__object .qi-crop img")).toHaveCount(1);
      expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await row.click();
      await expect(page).toHaveURL(new RegExp(`/things-i-make/${study.next}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(next.name);
    });

    test("there is no footer", async ({ page }) => {
      await expect(page.locator("main > footer, [data-case-study] > footer")).toHaveCount(0);
    });

    test("opens at once, even with motion on", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`/things-i-make/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
      await expect(page.locator("main")).toHaveCSS("opacity", "1");
    });

    test("it is in the server-rendered page", async ({ page }) => {
      await page.route("**/*.js", (route) => route.abort());
      await page.reload();
      await expect(page.locator("article section[id]")).toHaveCount(caseStudySectionKeys.length);
      await expect(page.locator('nav[aria-label="On this page"] a')).toHaveCount(caseStudySectionKeys.length);
      await expect(page.getByRole("list", { name: "Evidence" }).getByRole("listitem")).toHaveCount(study.evidence.length);
      await expect(page.locator(".qi-case__shot img")).not.toHaveCount(0);
    });

    for (const scheme of schemes) {
      test(`text passes WCAG 2.2 AA contrast, ${scheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        const selectors = [
          ".qi-long__back",
          ".qi-long__title",
          ".qi-long__line",
          ".qi-long__meta",
          ".qi-case__links a",
          ".qi-title",
          ".qi-long__p",
          ".qi-long__p strong",
          ".qi-case__quote",
          ".qi-case__evidence strong",
          ".qi-case__evidence span",
          ".qi-figure__caption",
          ".qi-row__title",
          ".qi-row__line",
          ...(study.note ? [".qi-case__note"] : []),
        ];
        for (const selector of selectors) {
          const readings = await contrastOnPaper(page, selector);
          expect(readings.length, selector).toBeGreaterThan(0);
          for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
        }
      });

      test(`has no axe violations, ${scheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }

    test("renders without sideways scroll, and every link in the column is at least 44 px tall", async ({ page }) => {
      const response = await page.goto(`/things-i-make/${slug}`);
      expect(response?.status()).toBe(200);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const width = page.viewportSize()?.width ?? 0;
      for (const box of await Promise.all((await page.locator("[data-case-study] main *").all()).map((item) => item.boundingBox()))) {
        if (box) expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      }
      for (const target of await page.locator("[data-case-study] main a:visible, [data-case-study] main button:visible").all()) {
        expect((await target.boundingBox())!.height, (await target.textContent()) ?? "").toBeGreaterThanOrEqual(44);
      }
    });

    for (const width of [320, 390, 820, 1440]) {
      test(`the title and the section links break only between words at ${width} px`, async ({ page }, testInfo) => {
        test.skip(!/-1440-light$/.test(testInfo.project.name), "Sweeps its own widths: once per engine");
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/things-i-make/${slug}`);
        await page.evaluate(() => document.fonts.ready);
        // A word never splits if no word is wider than the box that holds it (a link is inline, so its list item is the box).
        const widestWordFits = (element: Element) => {
          const holder = getComputedStyle(element).display === "inline" ? element.parentElement! : element;
          const widest = Math.max(
            ...element.textContent!.trim().split(/\s+/).map((word) => {
              const probe = document.createElement("span");
              probe.textContent = word;
              probe.style.cssText = "position:absolute;white-space:nowrap;visibility:hidden";
              element.appendChild(probe);
              const wide = probe.getBoundingClientRect().width;
              probe.remove();
              return wide;
            }),
          );
          return widest <= holder.clientWidth + 0.5;
        };
        await expect.poll(() => page.getByRole("heading", { level: 1 }).evaluate(widestWordFits)).toBe(true);
        const links = page.locator(".qi-header__links a");
        await expect(links).toHaveCount(caseStudySectionKeys.length);
        if (width >= LINKS_FROM) for (const link of await links.all()) await expect.poll(() => link.evaluate(widestWordFits)).toBe(true);
      });
    }
  });
}

test("a slug with no case study is a 404", async ({ page }) => {
  expect(caseStudies).not.toHaveProperty("ask-professor-past");
  expect(projects.find((project) => project.slug === "ask-professor-past")?.links.caseStudy).toBeUndefined();
  expect((await page.goto("/things-i-make/ask-professor-past"))?.status()).toBe(404);
  expect((await page.goto("/things-i-make/constructor"))?.status()).toBe(404);
});
