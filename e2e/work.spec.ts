import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { roleStories } from "../src/content/stretch/role-stories";
import { passRecords } from "../src/content/stretch/staff-pass";
import { comparisonRow, workPanels } from "../src/content/stretch/work-panels";
import { drawn, expectDrawn } from "./support/measure";
import { shown } from "./support/roll";
import { SIM, simulation } from "../src/components/site/simulation-model";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * Work (docs/design/DESIGN.md "The homepage, in order" 3 and "Figures", R-13 to R-15): the title and subheading,
 * BNP Paribas's panel with its figure, the simulation and two comparisons, then Joveen and Optegra side by side with a
 * display figure and three pairs each.
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

  test("BNP Paribas's panel holds one display figure, one chart and two comparisons, and nothing else at display size but the employer's name", async ({ page }) => {
    const bnp = panel(page, "bnp-paribas");
    await expect(bnp.locator(".figure__words")).toHaveText(workPanels.bnp.figure.value);
    await expect(bnp.locator(".figure__label")).toHaveText(workPanels.bnp.figure.label);
    await expect(bnp.locator("figure")).toHaveCount(1);
    await expect(bnp.locator(".work-bnp__comparisons li")).toHaveCount(2);
    const display = await bnp.evaluate((element) =>
      [...element.querySelectorAll("*")].filter((node) => node.childElementCount === 0 && node.textContent?.trim() && !node.matches(".panel__name") && parseFloat(getComputedStyle(node).fontSize) >= 32).map((node) => node.textContent),
    );
    expect(display).toEqual([workPanels.bnp.figure.value]);
  });

  test("each comparison names both sides and writes their values, drawn in its own unit from the Role story's amounts", async ({ page }) => {
    const story = roleStories["bnp-paribas"];
    const items = panel(page, "bnp-paribas").locator(".work-bnp__comparisons li");
    const drawings = await drawn(panel(page, "bnp-paribas"), ".work-bnp__comparisons li");
    for (const [index, comparison] of workPanels.bnp.comparisons.entries()) {
      const row = comparisonRow(story, comparison)!;
      await expect(items.nth(index).getByRole("heading", { level: 4 })).toHaveText(row.what);
      for (const side of [comparison.before, comparison.after]) {
        await expect(items.nth(index)).toContainText(side.name);
        await expect(items.nth(index)).toContainText(side.value);
      }
      expectDrawn(drawings[index], row, row.what);
    }
    // Ten working days against two; 30–40 minutes against under 5, on one scale of 40 (R-14).
    expect(drawings[0].days).toEqual([10, 2]);
    expect(drawings[1].minutes).toEqual([
      { on: 30, range: 10, scale: 40 },
      { on: 0, range: 5, scale: 40 },
    ]);
  });

  test("Joveen and Optegra each show a display figure and its label, three pairs drawn in their units with their values, and the link to the story", async ({ page }) => {
    for (const { slug, figure, pairs } of workPanels.roles) {
      const evidence = roleStories[slug].evidence[figure.evidence];
      await expect.poll(() => shown(panel(page, slug).locator(".figure__value"))).toBe(evidence.value);
      await expect(panel(page, slug).locator(".figure__label")).toHaveText(evidence.label);
      const rows = panel(page, slug).locator(".pair");
      await expect(rows).toHaveCount(3);
      const drawings = await drawn(panel(page, slug), ".pair");
      for (const [index, pair] of pairs.entries()) {
        await expect(rows.nth(index).locator(".pair__what")).toHaveText(pair.what);
        await expect(rows.nth(index).locator(".pair__value")).toHaveText(pair.value);
        // A drawing too narrow to read is a collapsed track: side by side at 720 to 1000 px the panels are at their narrowest.
        const room = await rows.nth(index).locator(".measure-pair").evaluate((element) => element.getBoundingClientRect().width);
        expect(room, `${slug}: ${pair.what} has room for its drawing`).toBeGreaterThan(120);
        expectDrawn(drawings[index], pair, `${slug}: ${pair.what}`);
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
    await expect(plot(page)).toHaveAttribute("data-drawn", String(SIM.paths));
    const { mean } = simulation();
    const reading = await plot(page).evaluate((element, at) => {
      const box = element.getBoundingClientRect();
      const line = element.querySelector(".sim__price")!.getBoundingClientRect();
      const canvas = element.querySelector<HTMLCanvasElement>(".sim__paths")!;
      const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
      let painted = 0;
      for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) painted += 1;
      return {
        bins: [...element.querySelectorAll<HTMLElement>(".sim__bin")].map((bin) => [Number(bin.dataset.count), bin.querySelectorAll("i").length]),
        offset: Math.abs(line.top - (box.top + at * box.height)),
        painted: painted / (canvas.width * canvas.height),
      };
    }, mean);
    // Each endpoint is one dot in its band, and the bands hold every walk.
    for (const [count, dots] of reading.bins) expect(dots).toBe(count);
    expect(reading.bins.reduce((sum, [count]) => sum + count, 0)).toBe(SIM.paths);
    expect(reading.offset).toBeLessThan(1.5);
    // The walks are painted: a cloud, not an empty canvas.
    expect(reading.painted).toBeGreaterThan(0.05);
  });

  test("the simulation's walks are painted only when it comes into view, and are not in the server's HTML", async ({ page }) => {
    const html = await (await page.request.get("/")).text();
    expect(html).toMatch(/<canvas class="sim__paths"[^>]*><\/canvas>/);
    await page.setViewportSize({ width: width(page), height: 700 });
    await page.goto("/");
    await hydrated(page);
    await expect(plot(page)).not.toHaveAttribute("data-drawn");
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await expect(plot(page)).toHaveAttribute("data-drawn", String(SIM.paths));
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
      await expect(plot(page)).toHaveAttribute("data-drawn", String(SIM.paths));
      // The axis labels are hidden from assistive technology, which the measure skips, so they are measured with it shown.
      await page.evaluate(() => document.querySelectorAll("#work .panel [aria-hidden='true']").forEach((element) => element.removeAttribute("aria-hidden")));
      const texts = await section(page).evaluate((element) => [...element.querySelectorAll(".work__subheading, .panel")].map((part) => (part as HTMLElement).innerText).join("\n"));
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of [workPanels.subheading.slice(0, 20), "Six months", "One price", "Horizon", "Key API p95", "Consultation", "The Optegra story"]) {
        expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
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
    await expect.poll(() => shown(joveen.locator(".figure__value"))).toBe("−0%");
    await expect.poll(() => shown(panel(page, "optegra").locator(".figure__value"))).toBe("62%");
    // A screen reader is read the value, never the start.
    await expect(joveen.locator(".figure__value .sr-only")).toHaveText("−40%");
    await expect(plot(page)).toHaveAttribute("data-armed", "");
    await expect(joveen.locator("[data-grow]")).toHaveAttribute("data-armed", "");
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await expect(plot(page)).toHaveAttribute("data-released", "");
    await expect(plot(page)).not.toHaveAttribute("data-armed", "");
    // Seek the draw instead of waiting it out: halfway through, part of the paths is drawn, and at the end all of them.
    const halfway = await page.locator(".sim__paths").evaluate((element) => {
      const draw = element.getAnimations().find((animation) => (animation as CSSTransition).transitionProperty === "clip-path")!;
      draw.pause();
      draw.currentTime = 550;
      return getComputedStyle(element).clipPath;
    });
    const hidden = Number(halfway.match(/inset\(0px ([\d.]+)%/)?.[1]);
    expect(hidden, halfway).toBeGreaterThan(0);
    expect(hidden, halfway).toBeLessThan(100);
    await plot(page).evaluate((element) => element.getAnimations({ subtree: true }).forEach((animation) => animation.finish()));
    await expect(page.locator(".sim__paths")).toHaveCSS("clip-path", "inset(0px)");
    await joveen.scrollIntoViewIfNeeded();
    await expect(joveen.locator("[data-grow]")).not.toHaveAttribute("data-armed", "");
    await expect(joveen.locator(".roll")).not.toHaveAttribute("data-armed", "");
    await joveen.locator(".figure__value").evaluate((element) => element.getAnimations({ subtree: true }).forEach((animation) => animation.finish()));
    await expect.poll(() => shown(joveen.locator(".figure__value"))).toBe("−40%");
    // On a phone Optegra is stacked under Joveen, so it arrives only when it is scrolled to.
    const optegra = panel(page, "optegra").locator(".figure__value");
    await optegra.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect(optegra.locator(".roll")).not.toHaveAttribute("data-armed", "");
    await optegra.evaluate((element) => element.getAnimations({ subtree: true }).forEach((animation) => animation.finish()));
    await expect.poll(() => shown(optegra)).toBe("88%");
  });

  test("Joveen's key API p95 fills in its own time: 520 ms against 230 ms, together and at a constant rate", async ({ page }) => {
    const joveen = panel(page, "joveen");
    await expect(joveen.locator("[data-grow]")).toHaveAttribute("data-armed", "");
    // Catch each fill as it is created and pause it there, so none can finish before it is read, however slow the runner.
    await joveen.evaluate((element) => {
      const caught: Animation[] = [];
      (window as unknown as { fills: Animation[] }).fills = caught;
      element.addEventListener("transitionrun", (event) => {
        const { target, propertyName } = event as TransitionEvent;
        const bar = target as Element;
        if (propertyName !== "transform" || !bar.matches(".measure--ms .bar")) return;
        const fill = bar.getAnimations().find((animation) => (animation as CSSTransition).transitionProperty === "transform")!;
        fill.pause();
        caught[[...element.querySelectorAll(".measure--ms .bar")].indexOf(bar)] = fill;
      });
    });
    await joveen.locator(".measure--ms").first().evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => (window as unknown as { fills: Animation[] }).fills.filter(Boolean).length)).toBe(2);
    // Seek both fills to where the faster one ends, rather than wait them out.
    const fills = await joveen.evaluate((element) =>
      (window as unknown as { fills: Animation[] }).fills.map((fill, index) => {
        const { duration, delay } = fill.effect!.getComputedTiming();
        fill.currentTime = Number(delay) + 230;
        const bar = element.querySelectorAll(".measure--ms .bar")[index];
        const scale = new DOMMatrix(getComputedStyle(bar).transform).a;
        fill.finish();
        return { duration: Number(duration), delay: Number(delay), scale };
      }),
    );
    const [before, after] = fills;
    // Each fill lasts its value, within 20 ms.
    expect(Math.abs(before.duration - 520)).toBeLessThanOrEqual(20);
    expect(Math.abs(after.duration - 230)).toBeLessThanOrEqual(20);
    expect(after.delay).toBe(before.delay);
    // At 230 ms the after bar is full and the before bar, filling at the same rate, is 230 / 520 of the way.
    expect(after.scale).toBeCloseTo(1, 2);
    expect(before.scale).toBeCloseTo(230 / 520, 2);
  });

  test("BNP Paribas's working days arrive a square at a time, before then after", async ({ page }) => {
    const days = panel(page, "bnp-paribas").locator(".measure--days");
    const delays = await days.evaluateAll((sides) => sides.map((side) => [...side.children].map((square) => parseFloat(getComputedStyle(square).transitionDelay.split(",")[0]))));
    expect(delays.map((side) => side.length)).toEqual([10, 2]);
    for (const side of delays) expect(side).toEqual([...side].sort((a, b) => a - b));
    expect(delays[1][0]).toBeGreaterThan(delays[0][0]);
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
    await expect.poll(() => shown(panel(page, "joveen").locator(".figure__value"))).toBe("−40%");
    await page.locator(".sim").scrollIntoViewIfNeeded();
    await expect(plot(page)).toHaveAttribute("data-drawn", String(SIM.paths));
    await expect(plot(page)).not.toHaveAttribute("data-released", "");
    await expect(page.locator(".sim__paths")).toHaveCSS("clip-path", "inset(0px)");
  });
});

// A visitor reads where I worked first (DESIGN.md "Type"): the employer is larger than the figure on every Work panel.
test.describe("Work: the employer leads", () => {
  for (const slug of ["bnp-paribas", "joveen", "optegra"] as const) {
    test(`${slug}: the employer's name is larger than its figure`, async ({ page }) => {
      await page.goto("/");
      const size = (selector: string) => panel(page, slug).locator(selector).first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
      expect(await size(".panel__name")).toBeGreaterThan(await size(slug === "bnp-paribas" ? ".figure__words" : ".figure__value"));
    });
  }
});
