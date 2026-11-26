import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { caseStudies } from "../src/content/stretch/case-studies";
import { howIWork, shortPrdDate } from "../src/content/stretch/how-i-work";
import { contrastRatio } from "../src/content/stretch/story";
import { shownSource, work } from "../src/content/stretch/work";
import { renderedContrast } from "./support/rendered-contrast";

/*
 * Where I'm headed and How I work (docs/design/DESIGN.md "The homepage, in order" 5, "How I work's cards"; R-16, R-18,
 * R-48, R-49 and #459): both share one full-bleed `--band` section with hairline top and bottom edges. Where I'm headed
 * sits on an asymmetric 4 / 7 bordered paper panel keeping its source chips and three drawn proofs; How I work is a
 * 2 × 2 grid of bordered paper cards (stacking under 720 px) with four distinct inset proof trays.
 */

const band = (page: Page) => page.locator("#main-content > section.headed-how-band");
const headed = (page: Page) => band(page).locator("section[aria-labelledby='headed-heading']");
const how = (page: Page) => band(page).locator("section#how-i-work");
const cards = (page: Page) => how(page).locator(".card");
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
const settled = (page: Page) => page.evaluate(() => document.fonts.ready.then(() => true));
const shortDate = shortPrdDate(caseStudies.threshold.prd.date!);

test.describe("Where I'm headed and the shared band", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
  });

  test("shares one full-bleed --band section with hairline top and bottom edges after Things I make", async ({ page }) => {
    await settled(page);
    const order = await page.locator("#main-content > section").evaluateAll((all) => all.map((section) => section.id || section.className));
    expect(order.indexOf("headed-how-band")).toBe(order.indexOf("things-i-make") + 1);
    const { hair, bandToken } = await page.evaluate(() => {
      const read = (token: string) => {
        const probe = document.createElement("i");
        probe.style.color = `var(${token})`;
        document.body.append(probe);
        const colour = getComputedStyle(probe).color;
        probe.remove();
        return colour;
      };
      return { hair: read("--hair"), bandToken: read("--band") };
    });
    await expect(band(page)).toHaveCSS("background-color", bandToken);
    await expect(band(page)).toHaveCSS("border-top", `1px solid ${hair}`);
    await expect(band(page)).toHaveCSS("border-bottom", `1px solid ${hair}`);
    await expect
      .poll(async () => {
        const box = await band(page).boundingBox();
        if (!box) return null;
        const { pageWidth, overflow } = await page.evaluate(() => ({
          pageWidth: document.body.getBoundingClientRect().width,
          overflow: document.documentElement.scrollWidth > innerWidth,
        }));
        return {
          flushLeft: Math.abs(box.x) <= 0.5,
          matchesBody: Math.abs(box.width - pageWidth) <= 0.5,
          fullBleed: box.width >= page.viewportSize()!.width - 20,
          overflow,
        };
      })
      .toEqual({ flushLeft: true, matchesBody: true, fullBleed: true, overflow: false });

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

  test("the lead sits beside the parts in an asymmetric 4 / 7 layout from 1260 px and above them under it", async ({ page }) => {
    const [lead, parts] = await Promise.all([boxOf(headed(page).locator(".headed__lead")), boxOf(headed(page).locator(".headed__parts"))]);
    if (width(page) >= 1260) {
      expect(parts.x).toBeGreaterThan(lead.x + lead.width);
      expect(parts.width / lead.width).toBeCloseTo(7 / 4, 1);
    } else {
      expect(parts.y).toBeGreaterThanOrEqual(lead.y + lead.height);
    }
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
    // Threshold: 57 ticks on one row leading to one filled live mark — and the 57-tick motif appears only once on the page.
    await expect(page.locator(".drawn__ticks")).toHaveCount(1);
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

  test("four bordered paper cards, each with habit, verbatim highlighted story, and its own distinct inset proof tray", async ({ page }) => {
    await expect(how(page).getByRole("heading", { level: 2 })).toHaveText(howIWork.heading);
    await expect(cards(page)).toHaveCount(4);
    const kinds: string[] = [];
    for (const [index, beat] of howIWork.beats.entries()) {
      const card = cards(page).nth(index);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(beat.habit);
      await expect(card.locator("p")).toHaveText(beat.proof);
      await expect(card.locator("mark")).toHaveText(beat.highlight);
      const tray = card.locator(".card__proof");
      await expect(tray).toBeVisible();
      kinds.push((await tray.getAttribute("data-proof"))!);
      await expect(card).toHaveClass(/\bsurface surface--paper\b/);
      await expect(card).toHaveCSS("box-shadow", /0px 6px 14px -6px/);
    }
    expect(new Set(kinds).size).toBe(4);
  });

  test("the highlight is a tint behind the words, never an underline", async ({ page }) => {
    for (const mark of await how(page).locator("mark").all()) {
      const style = await mark.evaluate((element) => ({ line: getComputedStyle(element).textDecorationLine, background: getComputedStyle(element).backgroundColor }));
      expect(style.line).toBe("none");
      expect(style.background).not.toBe("rgba(0, 0, 0, 0)");
    }
  });

  test("four distinct proof trays: project pills, 57 + 13-slice bar + PRD link, live Off/On switch, and +15% Before/After bars", async ({ page }) => {
    const [start, write, ship, measure] = [0, 1, 2, 3].map((index) => cards(page).nth(index).locator(".card__proof"));

    // Tray 1: Threshold and Flowtime pills linking straight to their case studies, >= 44 px tall.
    const pills = start.locator("a.how-project-pill");
    await expect(pills).toHaveText(["Threshold", "Flowtime"]);
    await expect(pills.nth(0)).toHaveAttribute("href", "/things-i-make/threshold");
    await expect(pills.nth(1)).toHaveAttribute("href", "/things-i-make/flowtime");
    for (const pill of await pills.all()) {
      await expect(pill.locator("img")).toBeVisible();
      expect((await boxOf(pill)).height).toBeGreaterThanOrEqual(44);
    }

    // Tray 2: 57 numeral, 13-slice stepped bar, and direct PRD link inside the tray (no separate PRD link, no 57 ticks).
    await expect(write.locator("b")).toHaveText("57");
    await expect(write.locator(".how-slices__bars i")).toHaveCount(13);
    await expect(write.locator(".drawn__ticks")).toHaveCount(0);
    await expect(how(page).locator("a.how__prd")).toHaveCount(1);
    const prdLink = write.getByRole("link", { name: `${howIWork.prd.title}, ${shortDate}` });
    await expect(prdLink).toHaveAttribute("href", "/things-i-make/threshold#written-down-first");
    expect((await boxOf(prdLink)).height).toBeGreaterThanOrEqual(44);

    // Tray 3: Off / On role="switch" named by New cached path, described by defaults to off, moving the live highlight.
    const sw = ship.getByRole("switch", { name: "New cached path" });
    const todayChip = ship.locator(".route-chip").nth(0);
    const newChip = ship.locator(".route-chip").nth(1);
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await expect(sw).toHaveAccessibleDescription("defaults to off");
    await expect(sw.locator(".flag-switch__label")).toHaveText("Off");
    await expect(sw.locator(".flag-switch__label")).toHaveAttribute("aria-hidden", "true");
    await expect(todayChip).toHaveText("Today’s path");
    await expect(newChip).toHaveText("New cached path");
    await expect(todayChip).toHaveAttribute("data-live", "true");
    await expect(newChip).toHaveAttribute("data-live", "false");
    const swBox = await boxOf(sw);
    expect(swBox.height).toBeGreaterThanOrEqual(44);
    expect(swBox.width).toBeGreaterThanOrEqual(44);

    // Tray 4: +15% over proportional Before and After bars.
    await expect(measure.locator("b")).toHaveText("+15%");
    await expect(measure.locator(".how-lift__label")).toHaveText(["Before", "After"]);
    await expect
      .poll(async () => {
        const [before, after] = await measure.locator(".bar").evaluateAll((bars) => bars.map((bar) => bar.getBoundingClientRect().width));
        return before > 0 ? after / before : 0;
      })
      .toBeCloseTo(1.15, 2);
  });

  test("the two route chips wrap as a pair, and from 1440 px share the switch's line", async ({ page }) => {
    const ship = cards(page).nth(2).locator(".card__proof");
    const width = page.viewportSize()!.width;
    test.skip(width < 390, "At 320 px the pair itself may wrap");
    await page.evaluate(() => document.fonts.ready);
    const middle = async (locator: Locator) => {
      const box = await boxOf(locator);
      return box.y + box.height / 2;
    };
    const chips = ship.locator(".route-chip");
    await expect.poll(async () => Math.abs((await middle(chips.nth(0))) - (await middle(chips.nth(1))))).toBeLessThan(1);
    if (width >= 1440) await expect.poll(async () => Math.abs((await middle(ship.locator(".flag-switch"))) - (await middle(chips.nth(0))))).toBeLessThan(1);
  });

  test("the feature-flag switch toggles with click, Space and Enter, keeps its accessible name, updates aria-checked and moves the active route highlight", async ({ page }) => {
    const ship = cards(page).nth(2).locator(".card__proof");
    const sw = ship.getByRole("switch", { name: "New cached path" });
    const todayChip = ship.locator(".route-chip").nth(0);
    const newChip = ship.locator(".route-chip").nth(1);

    await expect(sw).toHaveAttribute("aria-checked", "false");

    // Click: Off -> On
    await sw.click();
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await expect(sw).toHaveAccessibleName("New cached path");
    await expect(sw.locator(".flag-switch__label")).toHaveText("On");
    await expect(todayChip).toHaveAttribute("data-live", "false");
    await expect(newChip).toHaveAttribute("data-live", "true");

    // Space: On -> Off
    await sw.focus();
    await page.keyboard.press("Space");
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await expect(sw).toHaveAccessibleName("New cached path");
    await expect(sw.locator(".flag-switch__label")).toHaveText("Off");
    await expect(todayChip).toHaveAttribute("data-live", "true");
    await expect(newChip).toHaveAttribute("data-live", "false");

    // Enter: Off -> On
    await page.keyboard.press("Enter");
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await expect(sw).toHaveAccessibleName("New cached path");
    await expect(sw.locator(".flag-switch__label")).toHaveText("On");
    await expect(todayChip).toHaveAttribute("data-live", "false");
    await expect(newChip).toHaveAttribute("data-live", "true");
  });

  test("cards sit in a 2 × 2 grid from 720 px and stack to 1 column under 720 px, with level cobalt rules per row", async ({ page }) => {
    await settled(page);
    const rules = await cards(page).locator("h3").evaluateAll((headings) => headings.map((heading) => Math.round(heading.getBoundingClientRect().bottom)));
    const tops = await cards(page).evaluateAll((all) => all.map((card) => Math.round(card.getBoundingClientRect().top)));
    const across = width(page) >= 720 ? 2 : 1;
    for (let row = 0; row < 4; row += across) {
      const inRow = rules.slice(row, row + across);
      if (across > 1) expect(new Set(inRow).size, `rules in row ${row / across + 1}`).toBe(1);
      expect(new Set(tops.slice(row, row + across)).size).toBe(1);
    }
    if (across === 2) expect(tops[2]).toBeGreaterThan(tops[0]);
    await expect(cards(page).first().locator("h3")).toHaveCSS("border-bottom-width", "2px");
  });

  test("the PRD link inside card 2 lands on the PRD on Threshold's case study", async ({ page }) => {
    const link = cards(page).nth(1).getByRole("link", { name: `${howIWork.prd.title}, ${shortDate}` });
    await expect(link).toHaveAttribute("href", "/things-i-make/threshold#written-down-first");
    await link.click();
    await expect(page).toHaveURL(/\/things-i-make\/threshold#written-down-first$/);
    await expect(page.locator("#written-down-first")).toBeInViewport();
  });

  test("#how-i-work lands on the section", async ({ page }) => {
    await page.goto("/#how-i-work");
    await expect(how(page).getByRole("heading", { level: 2 })).toBeInViewport();
  });

  test("both sections are complete without script, and the switch renders as a still Off figure", async ({ browser }, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(headed(page).locator(".headed__parts > li")).toHaveCount(3);
    await expect(headed(page).locator(".headed__proof")).toHaveCount(3);
    await expect(cards(page)).toHaveCount(4);
    for (const card of await cards(page).all()) await expect(card).toBeVisible();
    const card3 = cards(page).nth(2);
    await expect(card3.getByRole("switch")).toHaveCount(0);
    await expect(card3.locator(".flag-switch__label")).toHaveText("Off");
    await expect(card3.locator(".flag-switch__label")).not.toHaveAttribute("aria-hidden", "true");
    await expect(card3.locator('.route-chip[data-live="true"]')).toHaveText("Today’s path");
    await context.close();
  });

  test("nothing scrolls sideways across 320 to 1440 px, and nothing in the band is under 13 px", async ({ page }) => {
    await settled(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const scope of [headed(page), how(page)]) {
      const sizes = await scope.evaluate((element) =>
        [...element.querySelectorAll("*")].filter((node) => node.childElementCount === 0 && node.textContent?.trim()).map((node) => parseFloat(getComputedStyle(node).fontSize)),
      );
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(13);
    }
  });

  test("interactive tray controls show the 2 px cobalt focus ring at 3 px offset", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit does not apply :focus-visible on programmatic keyboard focus consistently for links");
    const cobalt = await page.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.color = "var(--cobalt)";
      document.body.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });
    const controls = [
      cards(page).nth(0).locator("a.how-project-pill").first(),
      cards(page).nth(1).locator("a.how__prd"),
      cards(page).nth(2).getByRole("switch", { name: "New cached path" }),
    ];
    for (const control of controls) {
      await control.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(control).toBeFocused();
      await expect(control).toHaveCSS("outline-width", "2px");
      await expect(control).toHaveCSS("outline-style", "solid");
      await expect(control).toHaveCSS("outline-color", cobalt);
      await expect(control).toHaveCSS("outline-offset", "3px");
    }
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`every text in the band passes AA, measured on the rendered page (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      await settled(page);
      const texts = (await headed(page).innerText()) + "\n" + (await how(page).innerText());
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of ["Optegra", work.headed.bars[0].soFar.text.slice(0, 20), "no clear idea", "Before I build", "Today’s path", "New cached path", "+15%", "Before", "After", "Threshold’s PRD"]) {
        expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });

    test(`has no axe violations in either switch state (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.reload();
      const offResults = await new AxeBuilder({ page }).include("#main-content > section.headed-how-band").analyze();
      expect(offResults.violations).toEqual([]);
      const sw = cards(page).nth(2).getByRole("switch", { name: "New cached path" });
      await sw.click();
      await expect(sw).toHaveAttribute("aria-checked", "true");
      const onResults = await new AxeBuilder({ page }).include("#main-content > section.headed-how-band").analyze();
      expect(onResults.violations).toEqual([]);
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
