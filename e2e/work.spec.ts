import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { roleStories } from "../src/content/stretch/role-stories";
import { passRecords } from "../src/content/stretch/staff-pass";
import { shownSource, work } from "../src/content/stretch/work";
import { comparisonRow, workPanels } from "../src/content/stretch/work-panels";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * Work (docs/design/DESIGN.md "The homepage, in order" 3 and "Figures", R-13 to R-15): the title and subheading,
 * BNP Paribas's panel with its figure, the simulation and two comparisons, then Joveen and Optegra side by side with a
 * display figure and three pairs each. Where I'm headed's rows follow until #414; their tests are at the end.
 */

const section = (page: Page) => page.locator("section#work");
const slugs = ["bnp-paribas", "joveen", "optegra"] as const;
const panel = (page: Page, slug: string) => page.locator(`#${slug}`);
const plot = (page: Page) => page.locator(".sim__plot");
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
const settled = (page: Page) => page.evaluate(() => document.fonts.ready.then(() => true));
const hydrated = (page: Page) =>
  page.waitForFunction(() => {
    const element = document.querySelector(".sim__plot");
    return !!element && Object.keys(element).some((key) => key.startsWith("__reactProps$"));
  });

/** Each bar's drawn width, before then after, for every comparison or pair in a panel, in reading order. */
const barWidths = (scope: Locator, item: string) =>
  scope.locator(item).evaluateAll((items) => items.map((element) => [...element.querySelectorAll(".bar")].map((bar) => bar.getBoundingClientRect().width)));

test.describe("Work: the panels", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
  });

  test("the title and its subheading, then BNP Paribas, Joveen and Optegra, each named one level below Work with its role and dates", async ({ page }) => {
    await expect(section(page).getByRole("heading", { level: 2 }).first()).toHaveText(workPanels.heading);
    await expect(section(page).locator(".work__subheading")).toHaveText(workPanels.subheading);
    const names = section(page).locator(".panel h3");
    await expect(names).toHaveText(slugs.map((slug) => passRecords[slug].short));
    for (const slug of slugs) {
      await expect(panel(page, slug).getByRole("heading", { level: 3 })).toHaveText(passRecords[slug].short);
      await expect(panel(page, slug).locator(".panel__meta")).toHaveText(`${roleStories[slug].role}${roleStories[slug].dates}`);
      const link = panel(page, slug).getByRole("link");
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAccessibleName(`The ${passRecords[slug].short} story`);
      await expect(link).toHaveAttribute("href", `/work/${slug}`);
    }
  });

  test("BNP Paribas is full width; Joveen and Optegra sit side by side from 720 px and stack under it", async ({ page }) => {
    const [bnp, joveen, optegra] = await Promise.all(slugs.map((slug) => boxOf(panel(page, slug))));
    expect(joveen.y).toBeGreaterThan(bnp.y + bnp.height);
    if (width(page) >= 720) {
      expect(Math.abs(joveen.y - optegra.y)).toBeLessThan(1);
      expect(Math.abs(joveen.width + optegra.width + 16 - bnp.width)).toBeLessThan(2);
    } else {
      expect(optegra.y).toBeGreaterThan(joveen.y + joveen.height);
      expect(Math.abs(joveen.width - bnp.width)).toBeLessThan(1);
    }
  });

  test("BNP Paribas's panel holds one display figure, one chart and two comparisons, and nothing else at display size", async ({ page }) => {
    const bnp = panel(page, "bnp-paribas");
    await expect(bnp.locator(".figure__words")).toHaveText(workPanels.bnp.figure.value);
    await expect(bnp.locator(".figure__label")).toHaveText(workPanels.bnp.figure.label);
    await expect(bnp.locator("figure")).toHaveCount(1);
    await expect(bnp.locator(".work-bnp__comparisons li")).toHaveCount(2);
    const display = await bnp.evaluate((element) =>
      [...element.querySelectorAll("*")].filter((node) => node.childElementCount === 0 && node.textContent?.trim() && parseFloat(getComputedStyle(node).fontSize) >= 48).map((node) => node.textContent),
    );
    expect(display).toEqual([workPanels.bnp.figure.value]);
  });

  test("each comparison names both sides and writes their values, with bars in proportion to the Role story's amounts", async ({ page }) => {
    const story = roleStories["bnp-paribas"];
    const items = panel(page, "bnp-paribas").locator(".work-bnp__comparisons li");
    const widths = await barWidths(panel(page, "bnp-paribas"), ".work-bnp__comparisons li");
    for (const [index, comparison] of workPanels.bnp.comparisons.entries()) {
      const row = comparisonRow(story, comparison)!;
      await expect(items.nth(index).getByRole("heading", { level: 4 })).toHaveText(row.what);
      for (const side of [comparison.before, comparison.after]) {
        await expect(items.nth(index)).toContainText(side.name);
        await expect(items.nth(index)).toContainText(side.value);
      }
      const [before, after] = widths[index];
      expect(after / before, row.what).toBeCloseTo(row.after.amount / row.before.amount, 2);
    }
    // 10 and 2 working days; 40 and 5 minutes (R-14).
    expect(widths.map(([before, after]) => Math.round((after / before) * 1000) / 1000)).toEqual([0.2, 0.125]);
  });

  test("Joveen and Optegra each show a display figure and its label, three pairs to scale with their values, and the link to the story", async ({ page }) => {
    for (const { slug, figure, pairs } of workPanels.roles) {
      const evidence = roleStories[slug].evidence[figure.evidence];
      await expect(panel(page, slug).locator(".figure__value")).toHaveText(evidence.value);
      await expect(panel(page, slug).locator(".figure__label")).toHaveText(evidence.label);
      const rows = panel(page, slug).locator(".pair");
      await expect(rows).toHaveCount(3);
      const widths = await barWidths(panel(page, slug), ".pair");
      for (const [index, pair] of pairs.entries()) {
        await expect(rows.nth(index).locator(".pair__what")).toHaveText(pair.what);
        await expect(rows.nth(index).locator(".pair__value")).toHaveText(pair.value);
        const [before, after] = widths[index];
        // A bar too narrow to read is a collapsed track: side by side at 720 to 1000 px the panels are at their narrowest.
        expect(Math.max(before, after), `${slug}: ${pair.what} has room for its bars`).toBeGreaterThan(120);
        expect(after / before, `${slug}: ${pair.what}`).toBeCloseTo(pair.after / pair.before, 2);
      }
    }
  });

  test("the simulation: its bins sum to the number of paths, the price line sits at the mean of the endpoints, and it says it is illustrative", async ({ page }) => {
    const sim = page.locator(".sim");
    await expect(sim).toHaveAccessibleDescription(/^Illustrative simulated paths/);
    await expect(sim.locator("figcaption")).toHaveText(workPanels.bnp.simulation.caption);
    await expect(sim.locator(".sim__price")).toHaveText(workPanels.bnp.simulation.price);
    await expect(sim.locator(".sim__x")).toHaveText([workPanels.bnp.simulation.start, workPanels.bnp.simulation.end]);
    await sim.scrollIntoViewIfNeeded();
    await expect(plot(page)).toHaveAttribute("data-drawn", "");
    const reading = await plot(page).evaluate((element) => {
      const paths = [...element.querySelectorAll(".sim__paths path")];
      const ends = paths.map((path) => Number(path.getAttribute("d")!.trim().split(/\s+/).at(-1)));
      const viewBox = element.querySelector("svg")!.viewBox.baseVal;
      const mean = ends.reduce((sum, end) => sum + end, 0) / ends.length / viewBox.height;
      const box = element.getBoundingClientRect();
      const line = element.querySelector(".sim__price")!.getBoundingClientRect();
      return {
        paths: paths.length,
        expected: Number(element.getAttribute("data-paths")),
        bins: [...element.querySelectorAll<HTMLElement>(".sim__bin")].reduce((sum, bin) => sum + Number(bin.dataset.count), 0),
        offset: Math.abs(line.top - (box.top + mean * box.height)),
      };
    });
    expect(reading.paths).toBe(reading.expected);
    expect(reading.bins).toBe(reading.paths);
    expect(reading.offset).toBeLessThan(1.5);
  });

  test("the simulation's paths are drawn only when it comes into view, and are not in the server's HTML", async ({ page }) => {
    const html = await (await page.request.get("/")).text();
    expect(html).not.toMatch(/class="sim__paths"[^>]*>\s*<path/);
    await page.setViewportSize({ width: width(page), height: 700 });
    await page.goto("/");
    await hydrated(page);
    await expect(page.locator(".sim__paths path")).toHaveCount(0);
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await expect(page.locator(".sim__paths path")).toHaveCount(70);
  });

  test("without script every panel's text, the histogram and the price line are there", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    for (const slug of slugs) await expect(panel(page, slug)).toBeVisible();
    await expect(page.locator(".sim__bin")).toHaveCount(17);
    await expect(page.locator(".sim__price")).toBeVisible();
    for (const { pairs } of workPanels.roles) for (const pair of pairs) await expect(section(page)).toContainText(pair.value);
  });

  test("each staff pass in the opening lands on its employer's panel", async ({ page }) => {
    for (const slug of slugs) {
      await page.locator(`.opening a.pass[href="#${slug}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${slug}$`));
      await expect(panel(page, slug)).toBeInViewport();
    }
  });

  test("a Role story's ← Work lands on this section, its heading on screen", async ({ page }) => {
    await page.goto("/work/bnp-paribas");
    await page.locator("article").getByRole("link", { name: "Work", exact: true }).first().click();
    await expect(page).toHaveURL(/\/#work$/);
    await expect(page.locator("#work h2")).toBeInViewport();
  });

  test("every in-page anchor exists, and no link points at a retired one", async ({ page }) => {
    const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
    expect(hrefs.filter((href) => href.includes("where-ive-been"))).toEqual([]);
    for (const href of hrefs.filter((href) => href.startsWith("#") && href.length > 1)) await expect(page.locator(`[id="${href.slice(1)}"]`), href).toHaveCount(1);
  });

  test("the mini passes, enamel pins and employer rows are gone from Work", async ({ page }) => {
    await expect(section(page).locator(".qi-mini, .qi-pins, .qi-pass, a.qi-row")).toHaveCount(0);
  });

  test("it fits the screen, nothing is under 13 px, and the links are 44 px targets", async ({ page }) => {
    await settled(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const sizes = await section(page)
      .locator(".panel")
      .evaluateAll((panels) => panels.flatMap((element) => [...element.querySelectorAll("*")].filter((node) => node.childElementCount === 0 && node.textContent?.trim() && !node.closest("[hidden]")).map((node) => parseFloat(getComputedStyle(node).fontSize))));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(13);
    for (const link of await section(page).locator(".panel a").all()) expect((await boxOf(link)).height).toBeGreaterThanOrEqual(44);
    for (const slug of slugs) {
      const box = await boxOf(panel(page, slug));
      expect(box.x + box.width).toBeLessThanOrEqual(width(page));
    }
  });

  test("a story link is a keyboard stop with the panel's ink as its ring", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Safari does not Tab to links by default");
    const link = panel(page, "joveen").getByRole("link");
    await link.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    const [style, ink] = await link.evaluate((element) => [getComputedStyle(element).outline, getComputedStyle(element.closest(".panel")!).color]);
    expect(style).toContain(ink);
    expect(style).toContain("2px");
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`every text on the panels passes AA, measured on the rendered page (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      await settled(page);
      await page.locator(".sim").scrollIntoViewIfNeeded();
      await expect(plot(page)).toHaveAttribute("data-drawn", "");
      // The axis labels are hidden from assistive technology, which the measure skips, so they are measured with it shown.
      await page.evaluate(() => document.querySelectorAll("#work .panel [aria-hidden='true']").forEach((element) => element.removeAttribute("aria-hidden")));
      const texts = await section(page).evaluate((element) => [...element.querySelectorAll(".panel")].map((panelElement) => (panelElement as HTMLElement).innerText).join("\n"));
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of [workPanels.subheading.slice(0, 20), "Six months", "One price", "Horizon", "Key API p95", "Consultation", "The Optegra story"]) {
        expect(readings.some((reading) => reading.text.includes(expected) || expected.includes(reading.text)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });

    test(`has no axe violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      const results = await new AxeBuilder({ page }).include("#work").analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("Work: arriving", () => {
  test.use({ reducedMotion: "no-preference" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
  });

  test("below the fold the figures wait at their start, the bars and the simulation are armed, and each arrives once in view", async ({ page }) => {
    const joveen = panel(page, "joveen");
    await expect(joveen.locator(".figure__value")).toHaveText("−0%");
    await expect(panel(page, "optegra").locator(".figure__value")).toHaveText("62%");
    await expect(plot(page)).toHaveAttribute("data-armed", "");
    await expect(joveen.locator("[data-grow]")).toHaveAttribute("data-armed", "");
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await expect(plot(page)).toHaveAttribute("data-released", "");
    await expect(plot(page)).not.toHaveAttribute("data-armed", "");
    // Seek the draw instead of waiting it out.
    await plot(page).evaluate((element) => element.getAnimations({ subtree: true }).forEach((animation) => animation.finish()));
    await expect(page.locator(".sim__paths")).toHaveCSS("clip-path", "none");
    await joveen.scrollIntoViewIfNeeded();
    await expect(joveen.locator("[data-grow]")).not.toHaveAttribute("data-armed", "");
    await expect(joveen.locator(".figure__value")).toHaveText("−40%");
    // On a phone Optegra is stacked under Joveen, so it arrives only when it is scrolled to.
    await panel(page, "optegra").locator(".figure__value").evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect(panel(page, "optegra").locator(".figure__value")).toHaveText("88%");
  });

  test("the simulation arrives in order: the paths draw over 1.1 s, the histogram grows from 1.1 s, the price line appears at 1.8 s", async ({ page }) => {
    await expect(plot(page)).toHaveAttribute("data-armed", "");
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await expect(plot(page)).toHaveAttribute("data-released", "");
    const [paths, bin, price] = await Promise.all([
      page.locator(".sim__paths").evaluate((element) => [getComputedStyle(element).transitionProperty, getComputedStyle(element).transitionDuration]),
      page.locator(".sim__bin").first().evaluate((element) => [getComputedStyle(element).transitionDuration, getComputedStyle(element).transitionDelay]),
      page.locator(".sim__price").evaluate((element) => getComputedStyle(element).transitionDelay),
    ]);
    expect(paths).toEqual(["clip-path", "1.1s"]);
    expect(bin).toEqual(["0.9s", "1.1s"]);
    expect(price).toBe("1.8s");
  });
});

test.describe("Work: reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("everything is at its end state: the figures written, the bars full and the simulation drawn on sight with nothing armed", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    await expect(section(page).locator("[data-armed]")).toHaveCount(0);
    await expect(panel(page, "joveen").locator(".figure__value")).toHaveText("−40%");
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await expect(plot(page)).toHaveAttribute("data-drawn", "");
    await expect(plot(page)).not.toHaveAttribute("data-released", "");
    await expect(page.locator(".sim__paths")).toHaveCSS("clip-path", "none");
  });
});

test.describe("Where I'm headed: the rows", () => {
  const strandIds = work.headed.bars.map((bar) => `strand-${bar.label.toLowerCase()}`);
  const rowFor = (page: Page, id: string) => section(page).locator(`[data-look="${id}"]`);
  const margin = (page: Page) => page.locator(".qi-margin");

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("its line and three strand rows: the title, then the label, with a thread in the source's colour", async ({ page }) => {
    const group = section(page).getByRole("group", { name: work.headed.heading });
    await expect(group.getByRole("heading", { level: 3 })).toHaveText(work.headed.heading);
    await expect(group.locator(".qi-note-line")).toHaveText(work.headed.line);
    const rows = group.locator(".qi-row");
    await expect(rows).toHaveCount(work.headed.bars.length);
    for (const [index, bar] of work.headed.bars.entries()) {
      await expect(rows.nth(index).locator(".qi-row__title")).toHaveText(bar.title);
      await expect(rows.nth(index).locator(".qi-row__line")).toHaveText(bar.label);
    }
    expect(work.headed.bars.map((bar) => shownSource(bar.source).name)).toEqual(["Optegra", "BNP Paribas", "Threshold"]);
    const strand = await rowFor(page, strandIds[0]).evaluate((row) => document.getElementById(row.getAttribute("aria-describedby")!)?.textContent ?? "");
    expect(strand).toBe(`${work.headed.soFar}, ${shownSource(work.headed.bars[0].source).name}. ${work.headed.bars[0].soFar.text}`);
  });

  test("on a wide screen focus shows a strand's closer look in the margin; Escape hides it and focus stays on the row", async ({ page }) => {
    test.skip(width(page) < 1180, "the margin is for wide screens");
    const row = rowFor(page, strandIds[0]);
    await row.scrollIntoViewIfNeeded();
    await row.focus();
    await expect(margin(page)).toBeVisible();
    await expect(margin(page).locator(".qi-strand")).toContainText(work.headed.bars[0].soFar.text);
    await page.keyboard.press("Escape");
    await expect(margin(page)).toHaveCount(0);
    await expect(row).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(rowFor(page, strandIds[1])).toBeFocused();
    await expect(margin(page).locator(".qi-strand")).toContainText(work.headed.bars[1].soFar.text);
  });

  test("on a wide screen the margin sits 40 px right of the column, level with the row's top less 6 px, and stays 16 px inside the window", async ({ page }) => {
    test.skip(width(page) < 1180, "the margin is for wide screens");
    const row = rowFor(page, strandIds[0]);
    await row.scrollIntoViewIfNeeded();
    await row.evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().top - 140));
    await row.hover();
    await expect(margin(page)).toBeVisible();
    await expect(margin(page)).toHaveAttribute("aria-hidden", "true");
    await expect
      .poll(async () => {
        const [m, r, column, height] = await Promise.all([boxOf(margin(page)), boxOf(row), boxOf(page.locator("#work .qi-column")), page.evaluate(() => innerHeight)]);
        const wanted = Math.max(16, Math.min(r.y - 6, height - 16 - m.height));
        return [Math.abs(m.x - (column.x + column.width + 40)) < 1, Math.abs(m.y - wanted) < 1, m.x + m.width <= width(page) - 16 + 1];
      })
      .toEqual([true, true, true]);
    await page.mouse.move(5, 5);
    await expect(margin(page)).toHaveCount(0);
  });

  test("narrower than the margin, none appears when a row is focused or hovered", async ({ page }) => {
    test.skip(width(page) >= 1180, "the wide layout has a margin");
    await rowFor(page, strandIds[0]).focus();
    await rowFor(page, strandIds[1]).hover();
    await expect(margin(page)).toHaveCount(0);
  });
});
