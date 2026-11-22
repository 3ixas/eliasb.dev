import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { caseStudies } from "../src/content/stretch/case-studies";
import { howIWork } from "../src/content/stretch/how-i-work";
import { contrastRatio } from "../src/content/stretch/story";
import { shownSource, work } from "../src/content/stretch/work";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * Where I'm headed and How I work (docs/design/DESIGN.md "The homepage, in order" 4 and 6, "How I work's cards"; R-16,
 * R-18 and #459): one paper panel with three parts, each from a chip naming its source and its proof drawn beneath its
 * line; then four upright cards, each the habit above a cobalt rule, the story with its proof phrase highlighted, and
 * the proof drawn in the foot; then the PRD link.
 */

const headed = (page: Page) => page.locator("section[aria-labelledby='headed-heading']");
const how = (page: Page) => page.locator("section#how-i-work");
const cards = (page: Page) => how(page).locator(".card");
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
const settled = (page: Page) => page.evaluate(() => document.fonts.ready.then(() => true));
const date = caseStudies.threshold.prd.date!;

test.describe("Where I'm headed", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
  });

  test("is its own section after Work: one paper panel with the title, the lead and three parts", async ({ page }) => {
    const order = await page.locator("#main-content > section").evaluateAll((all) => all.map((section) => section.id || section.getAttribute("aria-labelledby")));
    expect(order.indexOf("headed-heading")).toBe(order.indexOf("work") + 1);
    await expect(headed(page).getByRole("heading", { level: 2 })).toHaveText(work.headed.heading);
    await expect(headed(page).locator(".surface--paper")).toHaveCount(1);
    await expect(headed(page).locator(".headed__lead p")).toHaveText(work.headed.line);
    const parts = headed(page).locator(".headed__parts > li");
    await expect(parts).toHaveCount(3);
    for (const [index, bar] of work.headed.bars.entries()) {
      await expect(parts.nth(index).locator(".chip")).toHaveText(shownSource(bar.source).name);
      await expect(parts.nth(index).getByRole("heading", { level: 3 })).toHaveText(bar.title);
      await expect(parts.nth(index).locator("p")).toHaveText(bar.soFar.text);
    }
  });

  test("names no destination and no job title", async ({ page }) => {
    const text = await headed(page).innerText();
    for (const retired of ["product engineer", "So far", "Judgement", "Depth", "Range"]) expect(text).not.toContain(retired);
  });

  test("the lead sits beside the parts from 1260 px and above them under it", async ({ page }) => {
    const [lead, parts] = await Promise.all([boxOf(headed(page).locator(".headed__lead")), boxOf(headed(page).locator(".headed__parts"))]);
    if (width(page) >= 1260) expect(parts.x).toBeGreaterThan(lead.x + lead.width);
    else expect(parts.y).toBeGreaterThanOrEqual(lead.y + lead.height);
  });

  test("each part draws its proof, hidden from assistive technology and matching its line", async ({ page }) => {
    const parts = headed(page).locator(".headed__parts > li");
    const [optegra, bnp, threshold] = [0, 1, 2].map((index) => parts.nth(index).locator(".headed__proof"));
    for (const proof of [optegra, bnp, threshold]) {
      await expect(proof).toBeVisible();
      await expect(proof).toHaveAttribute("aria-hidden", "true");
    }
    // Optegra: a split test with two variants side by side, one marked as the one that went on.
    const [other, chosen] = await Promise.all([
      boxOf(optegra.locator('[data-variant="other"]')),
      boxOf(optegra.locator('[data-variant="chosen"] .headed__split-box')),
    ]);
    expect(chosen.x).toBeGreaterThan(other.x + other.width);
    await expect(optegra.locator('[data-variant="other"] rect').first()).toHaveAttribute("stroke-dasharray", /\d/);
    await expect(optegra.locator(".headed__split-arrow")).toBeVisible();
    // BNP Paribas: six months from hollow zero to production code.
    await expect(bnp.locator(".headed__zero")).toHaveAttribute("stroke-dasharray", /\d/);
    await expect(bnp.locator(".headed__month")).toHaveCount(6);
    const [zero, firstMonth, lastMonth, prod] = await Promise.all([
      boxOf(bnp.locator(".headed__zero")),
      boxOf(bnp.locator(".headed__month").first()),
      boxOf(bnp.locator(".headed__month").last()),
      boxOf(bnp.locator(".headed__prod-box")),
    ]);
    expect(firstMonth.x).toBeGreaterThan(zero.x + zero.width);
    expect(lastMonth.x).toBeGreaterThan(firstMonth.x);
    expect(prod.x).toBeGreaterThan(lastMonth.x + lastMonth.width);
    // Threshold: 57 ticks on one row leading to one filled live mark.
    await expect(threshold.locator(".drawn__ticks i")).toHaveCount(57);
    const tickRows = await threshold.locator(".drawn__ticks i").evaluateAll((ticks) => new Set(ticks.map((tick) => Math.round(tick.getBoundingClientRect().top))).size);
    expect(tickRows).toBe(1);
    await expect(threshold.locator(".headed__live")).toBeVisible();
    const [lastTick, liveMark] = await Promise.all([boxOf(threshold.locator(".drawn__ticks i").last()), boxOf(threshold.locator(".headed__live"))]);
    expect(liveMark.x).toBeGreaterThan(lastTick.x);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`each drawn proof holds 3:1 against paper and uses cobalt where its source thread falls short (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      await settled(page);
      const measured = await headed(page).evaluate((section) => {
        const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
        const resolveHex = (cssColour: string) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = cssColour;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
          return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
        };
        const panel = section.querySelector(".headed")!;
        const tokenHex = (token: string) => {
          const probe = document.createElement("span");
          probe.style.color = `var(${token})`;
          panel.append(probe);
          const hex = resolveHex(getComputedStyle(probe).color);
          probe.remove();
          return hex;
        };
        const optegra = section.querySelector('[data-proof="split"] .headed__split-box')!;
        const bnp = section.querySelector('[data-proof="months-to-prod"] .headed__month')!;
        const bnpProd = section.querySelector('[data-proof="months-to-prod"] .headed__prod-box')!;
        const threshold = section.querySelector('[data-proof="count-to-live"] .drawn__ticks i')!;
        const live = section.querySelector('[data-proof="count-to-live"] .headed__live')!;
        return {
          surfaceStops: [tokenHex("--lit"), tokenHex("--field"), tokenHex("--foot")],
          cobalt: tokenHex("--cobalt"),
          optegra: resolveHex(getComputedStyle(optegra).stroke),
          bnp: resolveHex(getComputedStyle(bnp).fill),
          bnpProd: resolveHex(getComputedStyle(bnpProd).stroke),
          threshold: resolveHex(getComputedStyle(threshold).backgroundColor),
          live: resolveHex(getComputedStyle(live).backgroundColor),
        };
      });
      const stops = [...new Set(measured.surfaceStops)];
      expect(stops.length).toBeGreaterThanOrEqual(2);
      expect(measured.optegra).toBe(measured.cobalt);
      expect(measured.bnp).not.toBe(measured.cobalt);
      expect(measured.bnpProd).toBe(measured.bnp);
      expect(measured.threshold).not.toBe(measured.cobalt);
      expect(measured.live).toBe(measured.threshold);
      for (const colour of [measured.optegra, measured.bnp, measured.bnpProd, measured.threshold, measured.live]) {
        for (const surface of stops) {
          expect(contrastRatio(colour, surface), `${colour} on ${surface}`).toBeGreaterThanOrEqual(3);
        }
      }
    });
  }
});

test.describe("How I work", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
  });

  test("four cards, each the habit, its story verbatim with the proof phrase highlighted, and a drawn proof", async ({ page }) => {
    await expect(how(page).getByRole("heading", { level: 2 })).toHaveText(howIWork.heading);
    await expect(cards(page)).toHaveCount(4);
    for (const [index, beat] of howIWork.beats.entries()) {
      const card = cards(page).nth(index);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(beat.habit);
      await expect(card.locator("p")).toHaveText(beat.proof);
      await expect(card.locator("mark")).toHaveText(beat.highlight);
      await expect(card.locator(".card__proof")).toBeVisible();
      // A paper surface (#476): lit from above, its edge the hairline, over a neutral shadow.
      await expect(card).toHaveClass(/\bsurface surface--paper\b/);
      await expect(card).toHaveCSS("box-shadow", /0px 6px 14px -6px/);
    }
  });

  test("the highlight is a tint behind the words, never an underline", async ({ page }) => {
    for (const mark of await how(page).locator("mark").all()) {
      const style = await mark.evaluate((element) => ({ line: getComputedStyle(element).textDecorationLine, background: getComputedStyle(element).backgroundColor }));
      expect(style.line).toBe("none");
      expect(style.background).not.toBe("rgba(0, 0, 0, 0)");
    }
  });

  test("the proofs are drawn from the content: the two projects, 57 ticks, a switch that is off, a bar 15% longer", async ({ page }) => {
    const [start, write, ship, measure] = [0, 1, 2, 3].map((index) => cards(page).nth(index).locator(".card__proof"));
    await expect(start.locator(".drawn__dot")).toHaveText(["Threshold", "Flowtime"]);
    await expect(write.locator("b")).toHaveText("57");
    await expect(write.locator(".drawn__ticks i")).toHaveCount(57);
    await expect(ship).toHaveText("Off");
    await expect(ship.locator(".drawn__switch")).toHaveCount(1);
    await expect(measure.locator("b")).toHaveText("+15%");
    const [before, after] = await measure.locator(".bar").evaluateAll((bars) => bars.map((bar) => bar.getBoundingClientRect().width));
    expect(after / before).toBeCloseTo(1.15, 2);
  });

  test("every card's rule sits at one height, and the cards are four across, two under 1260 px and one under 720 px", async ({ page }) => {
    await settled(page);
    const rules = await cards(page).locator("h3").evaluateAll((headings) => headings.map((heading) => Math.round(heading.getBoundingClientRect().bottom)));
    const tops = await cards(page).evaluateAll((all) => all.map((card) => Math.round(card.getBoundingClientRect().top)));
    const across = width(page) >= 1260 ? 4 : width(page) >= 720 ? 2 : 1;
    for (let row = 0; row < 4; row += across) {
      const inRow = rules.slice(row, row + across);
      if (across > 1) expect(new Set(inRow).size, `rules in row ${row / across + 1}`).toBe(1);
      expect(new Set(tops.slice(row, row + across)).size).toBe(1);
    }
    await expect(cards(page).first().locator("h3")).toHaveCSS("border-bottom-width", "2px");
  });

  test("the PRD link names its date and lands on the PRD on Threshold's case study", async ({ page }) => {
    const link = how(page).getByRole("link", { name: `${howIWork.prd.title}, ${date}` });
    await expect(link).toHaveAttribute("href", "/things-i-make/threshold#written-down-first");
    expect((await boxOf(link)).height).toBeGreaterThanOrEqual(44);
    await link.click();
    await expect(page).toHaveURL(/\/things-i-make\/threshold#written-down-first$/);
    await expect(page.locator("#written-down-first")).toBeInViewport();
  });

  test("#how-i-work still lands on the section", async ({ page }) => {
    await page.goto("/#how-i-work");
    await expect(how(page).getByRole("heading", { level: 2 })).toBeInViewport();
  });

  test("both sections are complete without script", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(headed(page).locator(".headed__parts > li")).toHaveCount(3);
    await expect(headed(page).locator(".headed__proof")).toHaveCount(3);
    await expect(cards(page)).toHaveCount(4);
    for (const card of await cards(page).all()) await expect(card).toBeVisible();
  });

  test("nothing scrolls sideways, and nothing in either section is under 13 px", async ({ page }) => {
    await settled(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const scope of [headed(page), how(page)]) {
      const sizes = await scope.evaluate((element) =>
        [...element.querySelectorAll("*")].filter((node) => node.childElementCount === 0 && node.textContent?.trim()).map((node) => parseFloat(getComputedStyle(node).fontSize)),
      );
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(13);
    }
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`every text in both sections passes AA, measured on the rendered page (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      await settled(page);
      const texts = (await headed(page).innerText()) + "\n" + (await how(page).innerText());
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of ["Optegra", work.headed.bars[0].soFar.text.slice(0, 20), "no clear idea", "Before I build", "Off", "+15%", "Threshold’s PRD"]) {
        expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });

    test(`has no axe violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      const results = await new AxeBuilder({ page }).include("section[aria-labelledby='headed-heading']").include("#how-i-work").analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("How I work: arriving", () => {
  test.use({ reducedMotion: "no-preference" });

  test("below the fold the cards rise and the +15% bars grow once in view; reduced motion arms nothing", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => Object.keys(document.querySelector("#how-i-work .card")!).some((key) => key.startsWith("__reactProps$")));
    await expect(cards(page).first()).toHaveAttribute("data-armed", "");
    await expect(how(page).locator(".drawn__bars")).toHaveAttribute("data-armed", "");
    await how(page).locator(".drawn__bars").evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect(cards(page).last()).not.toHaveAttribute("data-armed", "");
    await expect(how(page).locator(".drawn__bars")).not.toHaveAttribute("data-armed", "");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("#how-i-work [data-armed], section[aria-labelledby='headed-heading'] [data-armed]")).toHaveCount(0);
  });
});
