import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { hostLabel } from "../src/components/site/host-label";
import { projects } from "../src/content/projects";
import { caseStudies, caseStudySlugs } from "../src/content/stretch/case-studies";
import { caseStudyCopy, caseStudySectionKeys, caseStudySectionLabels } from "../src/content/stretch/case-study";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * Case studies (docs/design/DESIGN.md "Long-form pages", R-22): a panel in the project's colour holding the back link,
 * the name, the description, the stack, Live site and Code, the evidence figures and the landing screenshot; the
 * sections in the Role story's layout; the PRD as a paper card with a cobalt rule; then the next project as a panel.
 */

const schemes = ["light", "dark"] as const;
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const opening = (page: Page) => page.locator("header.case-open");

for (const slug of caseStudySlugs) {
  const study = caseStudies[slug];
  const project = projects.find((entry) => entry.slug === slug)!;
  const next = projects.find((entry) => entry.slug === study.next)!;

  test.describe(`Case study: ${project.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/things-i-make/${slug}`);
    });

    test("the opening is a panel in the project's colour: the back link, the name as the one h1, the description and the stack", async ({ page }) => {
      await expect(opening(page)).toHaveCSS("background-color", rgb(project.panel!.field));
      await expect(opening(page)).toHaveCSS("color", rgb(project.panel!.ink));
      const back = opening(page).getByRole("link", { name: "Things I make", exact: true });
      await expect(back).toHaveAttribute("href", "/things-i-make");
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.name);
      await expect(opening(page).locator(".case-open__lede")).toHaveText(study.description);
      await expect(opening(page).getByRole("list", { name: "Stack" }).getByRole("listitem")).toHaveText([...study.stack]);
      if (study.note) await expect(opening(page)).toContainText(study.note);
    });

    test("Live site and Code are the links it has, marked external and opening in a new tab", async ({ page }) => {
      for (const [name, href] of [
        ["Live site", project.links.live],
        ["Code", project.links.code],
      ] as const) {
        const link = opening(page).getByRole("link", { name: new RegExp(`^${name} opens`) });
        if (!href) {
          await expect(link).toHaveCount(0);
          continue;
        }
        await expect(link).toHaveAttribute("href", href);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAccessibleName(`${name} opens ${hostLabel(href)} in a new tab`);
        await expect(link.locator(".arrow")).toHaveText("↗");
      }
    });

    test("the evidence figures are in the opening, and four of them wrap without overflow", async ({ page }) => {
      const list = opening(page).getByRole("list", { name: "Evidence" });
      await expect(list.getByRole("listitem")).toHaveText(study.evidence.map(({ value, label }) => `${value} ${label}`));
      expect(await list.evaluate((element) => element.scrollWidth <= element.clientWidth + 0.5)).toBe(true);
      for (const item of await list.getByRole("listitem").all()) expect(await item.evaluate((element) => element.scrollWidth <= element.clientWidth + 0.5)).toBe(true);
    });

    test("the landing screenshot sits in the panel, at the right of the text from 1260 px and beneath it under that", async ({ page }) => {
      const shot = opening(page).locator(".case-open__shot");
      await expect(shot.locator(".zoom img")).toHaveAttribute("alt", project.screenshot!.alt);
      await expect(shot.locator("img").first()).toHaveCSS("border-radius", "16px");
      const text = opening(page).locator(".case-open__text");
      await expect
        .poll(async () => {
          const [t, s] = [(await text.boundingBox())!, (await shot.boundingBox())!];
          return width(page) >= 1260 ? s.x >= t.x + t.width - 1 : s.y >= t.y + t.height - 1;
        })
        .toBe(true);
    });

    test("the header is the shared one, and the six sections are in order, each under its own heading in the Role story's layout", async ({ page }) => {
      await expect(page.locator("[data-site-header]")).toHaveCount(1);
      const ids = await page.locator("article section[id]").evaluateAll((sections) => sections.map((section) => section.id));
      expect(ids).toEqual([...caseStudySectionKeys]);
      await expect(page.locator("article h2")).toHaveText(caseStudySectionKeys.map((key) => study.sections[key].heading ?? caseStudySectionLabels[key]));
      for (const text of await page.locator("article h2").allTextContents()) expect(text).not.toMatch(/^\d/);
      const [heading, body] = [page.locator("section#decisions h2"), page.locator("section#decisions .story-section__body")];
      await expect
        .poll(async () => {
          const [h, b] = [(await heading.boundingBox())!, (await body.boundingBox())!];
          return width(page) >= 720 ? b.x >= h.x + h.width - 1 : b.y >= h.y + h.height - 1;
        })
        .toBe(true);
    });

    test("a section's address opens on that section and focuses it", async ({ page }) => {
      await page.goto(`/things-i-make/${slug}#decisions`);
      await expect(page.locator("section#decisions")).toBeInViewport();
      await expect(page.locator("section#decisions")).toBeFocused();
      await expect.poll(() => page.locator("section#decisions h2").evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
    });

    test("section copy is the approved copy", async ({ page }) => {
      for (const key of caseStudySectionKeys) {
        const { paragraphs, points } = study.sections[key];
        const section = page.locator(`section#${key}`);
        for (const paragraph of paragraphs ?? []) await expect(section).toContainText(paragraph);
        for (const { lead, text } of points ?? []) await expect(section).toContainText(`${lead} ${text}`);
      }
    });

    test("the PRD is a paper card with a cobalt rule: the quote in Newsreader, then its source and date", async ({ page }) => {
      const card = page.locator("section#written-down-first figure.prd");
      await expect(card).toHaveCount(1);
      await expect(card).toHaveCSS("border-top-width", "2px");
      const cobalt = await page.evaluate(() => {
        const probe = document.body.appendChild(document.createElement("i"));
        probe.style.color = "var(--cobalt)";
        const colour = getComputedStyle(probe).color;
        probe.remove();
        return colour;
      });
      await expect(card).toHaveCSS("border-top-color", cobalt);
      await expect(card.locator("blockquote")).toHaveText(`“${study.prd.quote}”`);
      await expect(card.locator("blockquote")).toHaveCSS("font-family", /Newsreader/);
      for (const around of [study.prd.lead, study.prd.after]) if (around) await expect(card).toContainText(around);
      await expect(card.locator("figcaption")).toHaveText(study.prd.date ? `${caseStudyCopy.fromPrd} · ${study.prd.date}` : caseStudyCopy.fromPrd);
    });

    test("figures sit in the text column with a hairline edge and their captions", async ({ page }) => {
      const figures = caseStudySectionKeys.flatMap((key) => {
        const figure = study.sections[key].figure;
        return figure ? [{ key, figure }] : [];
      });
      await expect(page.locator("article section .story-fig")).toHaveCount(figures.length);
      for (const { key, figure } of figures) {
        const frame = page.locator(`section#${key} .story-fig`);
        const image = frame.locator(".zoom img");
        await expect(image).toHaveAttribute("alt", figure.alt);
        await expect(image).toHaveCSS("border-radius", "16px");
        await expect(image).toHaveCSS("box-shadow", /1px/);
        await expect(frame.locator("figcaption")).toHaveText(figure.caption);
        expect((await frame.boundingBox())!.width).toBeLessThanOrEqual(760.5);
      }
    });

    test("it ends on the next project as a panel in its colour, then Say hello; following it opens that case study", async ({ page }) => {
      const panel = page.getByRole("navigation", { name: caseStudyCopy.nextProject }).getByRole("link");
      await expect(panel).toHaveCount(1);
      await expect(panel).toHaveAttribute("href", `/things-i-make/${study.next}`);
      await expect(panel).toContainText(caseStudyCopy.nextProject);
      await expect(panel).toContainText(next.name);
      await expect(panel).toContainText(next.outcome);
      await expect(panel).toHaveCSS("background-color", rgb(next.panel!.field));
      expect((await panel.boundingBox())!.y).toBeLessThan((await page.locator("#say-hello").boundingBox())!.y);
      await panel.click();
      await expect(page).toHaveURL(new RegExp(`/things-i-make/${study.next}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(next.name);
    });

    test("there is no footer", async ({ page }) => {
      await expect(page.locator("main > footer, [data-case-study] footer")).toHaveCount(0);
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
      await expect(page.locator('nav[aria-label="On this page"] a')).toHaveCount(5);
      await expect(page.getByRole("list", { name: "Evidence" }).getByRole("listitem")).toHaveCount(study.evidence.length);
      await expect(page.locator(".case-open__shot img")).not.toHaveCount(0);
    });

    for (const scheme of schemes) {
      test(`every text pair passes AA on the rendered page, and nothing is under 13 px (${scheme})`, async ({ page, browserName }) => {
        test.skip(browserName !== "chromium", "Measured in Chromium");
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
        await page.reload();
        await page.evaluate(() => document.fonts.ready);
        const texts = await page.evaluate(() => [...document.querySelectorAll("[data-case-study] article, nav.story-next")].map((part) => (part as HTMLElement).innerText).join("\n"));
        const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
        for (const expected of [project.name, study.stack[0], study.evidence[0].label, caseStudyCopy.fromPrd, caseStudyCopy.nextProject]) {
          expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
        }
        expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
        const small = await page.evaluate(() =>
          [...document.querySelectorAll("[data-case-study] article *, nav.story-next *")]
            .filter((element) => [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim()))
            .filter((element) => !element.closest("[aria-hidden='true'], .sr-only") && parseFloat(getComputedStyle(element).fontSize) < 13)
            .map((element) => element.textContent),
        );
        expect(small).toEqual([]);
      });

      test(`has no axe violations (${scheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
        await page.reload();
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }

    test("renders without sideways scroll, and every link and button in the page is at least 44 px tall", async ({ page }) => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const target of await page.locator("[data-case-study] main a:visible, [data-case-study] main button:visible").all()) {
        expect((await target.boundingBox())!.height, (await target.textContent()) ?? "").toBeGreaterThanOrEqual(44);
      }
    });

    test("the keyboard reaches the back link, Live site and Code, each screenshot and the next project in order, each with a visible ring", async ({ page }, testInfo) => {
      // Safari Tabs to links only with Option held, as a visitor with its default settings does.
      const tab = testInfo.project.name.startsWith("webkit") ? "Alt+Tab" : "Tab";
      const scope = "[data-case-study] article, [data-case-study] nav.story-next";
      const order = await page.locator(`:is(${scope}) :is(a, button):not(dialog *)`).evaluateAll((elements) => elements.map((element) => element.textContent?.trim() ?? ""));
      expect(order.length).toBeGreaterThan(3);
      const reached: string[] = [];
      await page.locator("body").focus();
      for (let step = 0; step < 40 && reached.length < order.length; step++) {
        await page.keyboard.press(tab);
        const focused = await page.evaluate((within) => {
          const element = document.activeElement as HTMLElement | null;
          if (!element?.closest(within)) return null;
          const style = getComputedStyle(element);
          return { text: element.textContent?.trim() ?? "", ring: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2 };
        }, scope);
        if (!focused) continue;
        expect(focused.ring, focused.text).toBe(true);
        reached.push(focused.text);
      }
      expect(reached).toEqual(order);
    });

    for (const at of [320, 390, 820, 1440]) {
      test(`the title breaks only between words, and the opening fits, at ${at} px`, async ({ page }, testInfo) => {
        test.skip(!/-1440-light$/.test(testInfo.project.name), "Sweeps its own widths: once per engine");
        await page.setViewportSize({ width: at, height: 900 });
        await page.goto(`/things-i-make/${slug}`);
        await page.evaluate(() => document.fonts.ready);
        const widestWordFits = (element: Element) => {
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
          return widest <= element.clientWidth + 0.5;
        };
        await expect.poll(() => page.getByRole("heading", { level: 1 }).evaluate(widestWordFits)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const overflowing = await opening(page).evaluate((panel) => [...panel.querySelectorAll("*")].filter((element) => element.scrollWidth > element.clientWidth + 0.5 && getComputedStyle(element).overflowX === "visible" && element.clientWidth > 0).map((element) => element.className));
        expect(overflowing).toEqual([]);
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

test("the homepage's PRD link lands on the card's section", async ({ page }) => {
  await page.goto("/");
  const link = page.locator("a.how__prd");
  await expect(link).toHaveAttribute("href", "/things-i-make/threshold#written-down-first");
  await link.click();
  await expect(page).toHaveURL(/\/things-i-make\/threshold#written-down-first$/);
  await expect(page.locator("section#written-down-first figure.prd")).toBeInViewport();
});
