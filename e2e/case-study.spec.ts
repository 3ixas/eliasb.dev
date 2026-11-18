import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { hostLabel } from "../src/components/site/host-label";
import { projects } from "../src/content/projects";
import { caseStudies, caseStudySlugs } from "../src/content/stretch/case-studies";
import { caseStudyCopy, caseStudySectionKeys, caseStudySectionLabels } from "../src/content/stretch/case-study";
import { firstDistrict, thresholdLink, thresholdLinkCopy, thresholdStart } from "../src/content/stretch/threshold-link";
import { argusPositions, argusProvenanceCopy, formatUsd, pricedAt, priceSteps, unrealisedUsd } from "../src/content/stretch/argus-provenance";
import { renderedContrast } from "./support/rendered-contrast";
import { spoken } from "./support/roll";

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
        await expect(link.locator(".arrow")).toHaveText("\u2197\uFE0E");
      }
    });

    test("the evidence figures are in the opening, and four of them wrap without overflow", async ({ page }) => {
      const list = opening(page).getByRole("list", { name: "Evidence" });
      expect(await spoken(list.getByRole("listitem"))).toEqual(study.evidence.map(({ value, label }) => `${value} ${label}`));
      expect(await list.evaluate((element) => element.scrollWidth <= element.clientWidth + 0.5)).toBe(true);
      for (const item of await list.getByRole("listitem").all()) expect(await item.evaluate((element) => element.scrollWidth <= element.clientWidth + 0.5)).toBe(true);
    });

    test("the screenshot sits in the panel, at the right of the text from 960 px and beneath it under that", async ({ page }) => {
      const shot = opening(page).locator(".case-open__shot");
      await expect(shot.locator(".zoom img")).toHaveAttribute("alt", project.screenshot!.alt);
      await expect(shot.locator("img").first()).toHaveCSS("border-radius", "16px");
      const text = opening(page).locator(".case-open__text");
      await expect
        .poll(async () => {
          const [t, s] = [(await text.boundingBox())!, (await shot.boundingBox())!];
          return width(page) >= 960 ? s.x >= t.x + t.width - 1 : s.y >= t.y + t.height - 1;
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

    test("the PRD is a lit paper card with a cobalt rule: the quote in Newsreader, then its source and date", async ({ page }) => {
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
      // A paper surface (#476): lit from above, its edge the hairline, over a neutral shadow.
      await expect(card).toHaveClass(/\bsurface surface--paper\b/);
      await expect(card).toHaveCSS("box-shadow", /0px 6px 14px -6px/);
      await expect(card.locator("blockquote")).toHaveText(`“${study.prd.quote}”`);
      await expect(card.locator("blockquote")).toHaveCSS("font-family", /Newsreader/);
      for (const around of [study.prd.lead, study.prd.after]) if (around) await expect(card).toContainText(around);
      await expect(card.locator("figcaption")).toHaveText(study.prd.date ? `${caseStudyCopy.fromPrd} · ${study.prd.date}` : caseStudyCopy.fromPrd);
    });

    test("figures take the text side's whole width, with a hairline edge and their captions", async ({ page }) => {
      // A working figure keeps its screenshot for a visitor without script (checked below), so only the others show one.
      const figures = caseStudySectionKeys.flatMap((key) => {
        const { figure, working } = study.sections[key];
        return figure && !working ? [{ key, figure }] : [];
      });
      await expect(page.locator("article section .story-fig:visible")).toHaveCount(figures.length);
      for (const { key, figure } of figures) {
        const frame = page.locator(`section#${key} .story-fig`);
        const image = frame.locator(".zoom img");
        await expect(image).toHaveAttribute("alt", figure.alt);
        await expect(image).toHaveCSS("border-radius", "16px");
        await expect(image).toHaveCSS("box-shadow", /1px/);
        await expect(frame.locator("figcaption")).toHaveText(figure.caption);
        // A figure takes the text side's whole width, past the text's 760 px measure (#461).
        const side = (await page.locator(`section#${key} .story-section__body`).boundingBox())!.width;
        expect(Math.abs((await frame.boundingBox())!.width - side)).toBeLessThan(1);
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
      // The working figure's choices are in the order too; its screenshot, shown only without script, is not.
      for (const working of await page.locator(".working-fig").all()) {
        await working.scrollIntoViewIfNeeded();
        await expect(working.locator("[data-live]")).toHaveCount(1);
      }
      await page.evaluate(() => scrollTo(0, 0));
      const order = await page.locator(`:is(${scope}) :is(a, button, select):not(dialog *):visible`).evaluateAll((elements) => elements.map((element) => element.textContent?.trim() ?? ""));
      expect(order.length).toBeGreaterThan(3);
      const reached: string[] = [];
      // Start on the back link: scrolling the figure into view above may have moved where Tab would start from the body.
      await page.locator(`:is(${scope}) :is(a, button, select):not(dialog *):visible`).first().focus();
      for (let step = 0; step < 50 && reached.length < order.length; step++) {
        if (step > 0) await page.keyboard.press(tab);
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

/*
 * Threshold's link that rewrites itself (#462): under "The link is the save file.", City, District and Place write the
 * live product's own link, and Copy link copies it. It is drawn by the server at its start and loads as it nears the view.
 */
test.describe("Case study: Threshold's working link", () => {
  const figure = (page: Page) => page.locator("section#how-its-built figure.working-fig");
  const address = (page: Page) => figure(page).locator("output.tlink__address");
  const shown = (link: string) => link.replace(/^https:\/\//, "");
  const live = async (page: Page) => {
    await figure(page).scrollIntoViewIfNeeded();
    await expect(figure(page).locator(".tlink[data-live]")).toHaveCount(1);
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/things-i-make/threshold");
  });

  test("it takes the screenshot's place on paper under Threshold's colour, with its own caption, and loads only as it nears the view", async ({ page }) => {
    await expect(figure(page)).toBeVisible();
    await expect(page.locator("section#how-its-built .working-fig__still")).toBeHidden();
    await expect(figure(page).locator(".working-fig__frame")).toHaveClass(/\bsurface surface--paper\b/);
    await expect(figure(page).locator(".working-fig__frame")).toHaveCSS("border-top-color", rgb(projects.find(({ slug }) => slug === "threshold")!.panel!.field));
    await expect(figure(page).locator("figcaption")).toHaveText(thresholdLinkCopy.caption);
    // Drawn by the server at its start, the choices held still until the island arrives: once the page has hydrated
    // (Say hello's Copy shows), a figure more than 600 px below the view is still the drawing.
    await expect(address(page)).toHaveText(shown(thresholdLink(thresholdStart)));
    await expect(page.locator("#say-hello .copy-button")).toBeVisible();
    if (await figure(page).evaluate((element) => element.getBoundingClientRect().top > innerHeight + 700)) {
      await expect(figure(page).locator(".tlink[data-live]")).toHaveCount(0);
      await expect(figure(page).getByLabel(thresholdLinkCopy.city, { exact: true })).toBeDisabled();
    }
    await live(page);
    await expect(address(page)).toHaveText(shown(thresholdLink(thresholdStart)));
  });

  test("each choice rewrites the link in Threshold's own format, and a new city starts on its first district", async ({ page }) => {
    await live(page);
    const choose = (name: string, value: string) => figure(page).getByLabel(name, { exact: true }).selectOption(value);
    await choose(thresholdLinkCopy.place, "2bed");
    await expect(address(page)).toHaveText(shown(thresholdLink({ ...thresholdStart, place: "2bed" })));
    await choose(thresholdLinkCopy.district, "lambeth");
    await expect(address(page)).toHaveText("threshold-beta.vercel.app/london?district=lambeth&type=2bed");
    await choose(thresholdLinkCopy.city, "zurich");
    await expect(address(page)).toHaveText(shown(thresholdLink({ city: "zurich", district: firstDistrict("zurich"), place: "2bed" })));
    await expect(figure(page).getByLabel(thresholdLinkCopy.district, { exact: true })).toHaveValue("kreis-1");
    // Only the parts that changed arrive afresh: the city and its district.
    await expect(figure(page).locator(".tlink__part[data-new]")).toHaveText(["zurich", "kreis-1"]);
  });

  test("its controls are labelled, 44 px, and the link is an output announced politely", async ({ page }) => {
    await live(page);
    for (const name of [thresholdLinkCopy.city, thresholdLinkCopy.district, thresholdLinkCopy.place]) {
      const control = figure(page).getByRole("combobox", { name, exact: true });
      await expect(control).toBeEnabled();
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await expect(address(page)).toHaveCount(1);
    const copy = figure(page).getByRole("button", { name: thresholdLinkCopy.copy });
    expect((await copy.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

  test("Copy link copies the working link for the choices shown", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Only Chromium can grant clipboard reads");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await live(page);
    await figure(page).getByLabel(thresholdLinkCopy.city, { exact: true }).selectOption("basel");
    await figure(page).getByRole("button", { name: thresholdLinkCopy.copy }).click();
    await expect(figure(page).getByRole("button", { name: thresholdLinkCopy.copied })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(thresholdLink({ city: "basel", district: firstDistrict("basel"), place: thresholdStart.place }));
  });

  test("when the browser refuses the clipboard, Copy link selects the link instead", async ({ page }) => {
    await live(page);
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new DOMException("Denied", "NotAllowedError")) } });
    });
    await figure(page).getByRole("button", { name: thresholdLinkCopy.copy }).click();
    await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe(shown(thresholdLink(thresholdStart)));
  });

  test("a value never breaks across lines, and the link's room holds for the longest, so Copy link never moves", async ({ page }) => {
    await live(page);
    // On a phone Copy link sits under the address, which keeps room for the longest link; wider, it sits beside it, level with its first line.
    const copy = figure(page).getByRole("button", { name: thresholdLinkCopy.copy });
    const tops = new Set<number>();
    for (const [city, district, place] of [
      ["zurich", "kreis-1", "room"],
      ["london", "kensington-chelsea", "studio"],
      ["london", "city-of-london", "studio"],
      ["basel", "kleinbasel-nord", "1bed"],
    ]) {
      await figure(page).getByLabel(thresholdLinkCopy.city, { exact: true }).selectOption(city);
      await figure(page).getByLabel(thresholdLinkCopy.district, { exact: true }).selectOption(district);
      await figure(page).getByLabel(thresholdLinkCopy.place, { exact: true }).selectOption(place);
      await expect(address(page)).toContainText(`district=${district}&type=${place}`);
      for (const part of await figure(page).locator(".tlink__part").all()) expect(await part.evaluate((element) => element.getClientRects().length)).toBe(1);
      tops.add(Math.round((await copy.boundingBox())!.y + (await page.evaluate(() => scrollY))));
    }
    expect([...tops]).toHaveLength(1);
  });

  test.describe("without script", () => {
    test.use({ javaScriptEnabled: false });

    test("it is the screenshot with its caption, as before", async ({ page }) => {
      const still = caseStudies.threshold.sections["how-its-built"].figure!;
      await expect(figure(page)).toBeHidden();
      const shot = page.locator("section#how-its-built .working-fig__still .story-fig");
      await expect(shot.locator("img").first()).toHaveAttribute("alt", still.alt);
      await expect(shot.locator("figcaption")).toHaveText(still.caption);
    });
  });
});

/*
 * Argus Risk's numbers with their history (#463): under "Show the number with its history.", each position's P&L opens
 * the price tick it came from and that price's age, which counts while open; New event brings a new price for the oldest.
 */
test.describe("Case study: Argus Risk's numbers with their history", () => {
  const figure = (page: Page) => page.locator("section#decisions figure.working-fig");
  const number = (page: Page, symbol: string) => figure(page).getByRole("button", { name: new RegExp(`^${symbol.replace(".", "\\.")} `) });
  const source = (page: Page, symbol: string) => figure(page).locator(`#argus-provenance-${symbol.replace(/\W/g, "-")}`);
  const live = async (page: Page) => {
    await figure(page).scrollIntoViewIfNeeded();
    await expect(figure(page).locator(".argus[data-live]")).toHaveCount(1);
  };

  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto("/things-i-make/argus-risk");
  });

  test("it takes the screenshot's place, says it is illustrative, and starts closed", async ({ page }) => {
    await expect(figure(page)).toBeVisible();
    await expect(page.locator("section#decisions .working-fig__still")).toBeHidden();
    await expect(figure(page).locator("figcaption")).toHaveText(argusProvenanceCopy.caption);
    await expect(figure(page).getByRole("list")).toHaveAccessibleDescription(argusProvenanceCopy.description);
    await live(page);
    for (const position of argusPositions) {
      await expect(number(page, position.symbol)).toHaveAccessibleName(`${position.symbol} ${formatUsd(unrealisedUsd(position))}`);
      await expect(number(page, position.symbol)).toHaveAttribute("aria-expanded", "false");
      await expect(source(page, position.symbol)).toBeHidden();
    }
  });

  test("a number opens on its source and its age, which counts while open and marks the price stale past 5 s", async ({ page }) => {
    await live(page);
    const [first] = argusPositions;
    await number(page, first.symbol).click();
    await expect(number(page, first.symbol)).toHaveAttribute("aria-expanded", "true");
    await expect(source(page, first.symbol)).toContainText(argusProvenanceCopy.topic);
    await expect(source(page, first.symbol)).toContainText(pricedAt(first));
    await expect(source(page, first.symbol)).toContainText(`${argusProvenanceCopy.age}${first.age} s`);
    await expect(source(page, first.symbol)).not.toContainText(argusProvenanceCopy.stale);
    await page.clock.runFor(5000);
    await expect(source(page, first.symbol)).toContainText(`${first.age + 5} s`);
    await expect(source(page, first.symbol).locator(".argus__stale")).toHaveText(argusProvenanceCopy.stale);
    await number(page, first.symbol).press("Enter");
    await expect(source(page, first.symbol)).toBeHidden();
  });

  test("New event brings a new price for the oldest: its number, its source and its age change, it opens, and it is announced", async ({ page }) => {
    await live(page);
    const oldest = argusPositions.reduce((a, b) => (b.age > a.age ? b : a));
    const next = { ...oldest, price: Math.round(oldest.price * (1 + priceSteps[0]) * 100) / 100 };
    await figure(page).getByRole("button", { name: argusProvenanceCopy.newEvent }).click();
    await expect(number(page, oldest.symbol)).toHaveAccessibleName(`${oldest.symbol} ${formatUsd(unrealisedUsd(next))}`);
    await expect(number(page, oldest.symbol)).toHaveAttribute("aria-expanded", "true");
    await expect(source(page, oldest.symbol)).toContainText(pricedAt(next));
    await expect(source(page, oldest.symbol)).toContainText(`${argusProvenanceCopy.age}0 s`);
    await expect(figure(page).getByRole("status")).toHaveText(argusProvenanceCopy.announce(oldest.symbol, formatUsd(unrealisedUsd(next))));
  });

  test("every control is a button of at least 44 px, reached by the keyboard", async ({ page }) => {
    await live(page);
    for (const button of await figure(page).getByRole("button").all()) {
      await expect(button).toBeEnabled();
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test.describe("without script", () => {
    test.use({ javaScriptEnabled: false });

    test("it is the screenshot with its caption, as before", async ({ page }) => {
      const still = caseStudies["argus-risk"].sections.decisions.figure!;
      await expect(figure(page)).toBeHidden();
      const shot = page.locator("section#decisions .working-fig__still .story-fig");
      await expect(shot.locator("img").first()).toHaveAttribute("alt", still.alt);
      await expect(shot.locator("figcaption")).toHaveText(still.caption);
    });
  });
});
