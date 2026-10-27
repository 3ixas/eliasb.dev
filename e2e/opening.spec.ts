import { expect, test, type Page } from "@playwright/test";
import { opening } from "../src/content/stretch/opening";
import { contrastOnPaper } from "./support/contrast";
import { onFirstLine } from "./support/first-line";

/*
 * The opening line (docs/design/DESIGN.md, "The opening line"): the page's one h1 and the supporting line, the
 * employer that reacts where it stands, and "products of my own." with its underline. The reveal words and their
 * closer looks are in reveal-words.spec.ts.
 */

const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const bnp = (page: Page) => page.locator(".qi-bnp");
const tail = (page: Page) => page.locator(".qi-opening__tail");
/** On the name itself: the click point Playwright picks for the word is the pass hanging under it, which takes no pointer events. */
const overBnp = async (page: Page) => ({ position: await onFirstLine(bnp(page)) });
const canHover = (page: Page) => page.evaluate(() => matchMedia("(hover: hover)").matches);
/** BNP's green in the two themes: the light field, and the lifted green that keeps 3:1 on the dark page. */
const BNP_GREEN = /^rgb\((0, 150, 94|47, 208, 143)\)$/;
const COBALT = /^rgb\((35, 64, 255|139, 156, 255)\)$/;

test.describe("The opening line", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("the page has one h1, real text with the approved opening line, complete as an accessible name", async ({ page }) => {
    await expect(heading(page)).toHaveCount(1);
    await expect(heading(page)).toHaveAccessibleName(opening.headline);
    await expect(heading(page)).toHaveText(opening.headline);
    await expect(heading(page)).toBeVisible();
    expect(opening.headline.match(/BNP Paribas/g)).toHaveLength(1);
  });

  test("the supporting line follows it, in 17 px muted text, and is the approved copy", async ({ page }) => {
    const support = page.locator(".qi-opening__support");
    await expect(support).toHaveText(opening.support);
    await expect(support).toHaveCSS("font-size", "17px");
    const [h1, line] = await Promise.all([heading(page).boundingBox(), support.boundingBox()]);
    expect(line!.y, "under the opening line").toBeGreaterThanOrEqual(h1!.y + h1!.height);
  });

  test("the opening line and its supporting line are in the page with no script", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(heading(page)).toBeVisible();
    await expect(heading(page)).toHaveText(opening.headline);
    await expect(page.locator(".qi-opening__support")).toHaveText(opening.support);
  });

  test("it is Bricolage at clamp(34px, 5.4vw, 50px), weight 650, and the largest type on the page", async ({ page }) => {
    const expected = Math.min(50, Math.max(34, page.viewportSize()!.width * 0.054));
    await expect(heading(page)).toHaveCSS("font-weight", "650");
    await expect(heading(page)).toHaveCSS("font-family", /Bricolage/);
    const size = await heading(page).evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(size).toBeCloseTo(expected, 1);
    expect(await heading(page).evaluate((element) => parseFloat(getComputedStyle(element).lineHeight) / parseFloat(getComputedStyle(element).fontSize))).toBeCloseTo(1.1, 2);
    // The sections still in the Stretch style keep their display headings until their own tickets move them (#295 to #299); #300 asserts this for the whole page.
    const larger = await page.evaluate((limit) => {
      const found: string[] = [];
      for (const element of document.querySelectorAll("body *")) {
        if (element.closest("#things-i-make, #how-i-work, #off-the-clock, #say-hello, footer, [hidden]") || !element.checkVisibility()) continue;
        const hasText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
        if (hasText && parseFloat(getComputedStyle(element).fontSize) > limit + 0.01) found.push(`${element.tagName.toLowerCase()}.${element.className}`);
      }
      return found;
    }, size);
    expect(larger).toEqual([]);
  });

  test("the hero's name, tilted portrait, label and actions are gone", async ({ page }) => {
    await expect(page.locator(".stretch-hero, .stretch-name, .stretch-portrait, .stretch-hero__role")).toHaveCount(0);
    await expect(page.getByText("See my work")).toHaveCount(0);
    await expect(page.getByText("Based in London")).toHaveCount(0);
  });

  test("a visitor's wider letter spacing does not push the page sideways", async ({ page }) => {
    // WCAG 1.4.12: letter spacing 0.12em, word spacing 0.16em, line height 1.5, paragraph spacing 2em.
    await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("the opening line and its supporting line fit the first screen of a short laptop", async ({ page }) => {
    const { width, height } = page.viewportSize()!;
    await page.setViewportSize({ width, height: Math.min(760, height) });
    const bottom = await page.locator(".qi-opening__support").evaluate((element) => element.getBoundingClientRect().bottom);
    expect(bottom, "the supporting line ends above the fold").toBeLessThanOrEqual(Math.min(760, height));
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`the opening's text meets WCAG 2.2 AA (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.reload();
      // The opening line is large text (24 px or more), which needs 3:1; the supporting line needs 4.5:1.
      for (const [selector, needs] of [[".qi-opening__line", 3], [".qi-opening__tail", 3], [".qi-opening__support", 4.5]] as const) {
        const [reading] = await contrastOnPaper(page, selector);
        expect(reading.ratio, `${selector} (${scheme})`).toBeGreaterThanOrEqual(needs);
      }
    });

    test(`BNP Paribas in BNP green stays legible at the opening line's size (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.reload();
      await bnp(page).focus();
      await expect(bnp(page)).toHaveCSS("color", BNP_GREEN);
      const [reading] = await contrastOnPaper(page, ".qi-bnp");
      expect(reading.ratio, `BNP green (${scheme})`).toBeGreaterThanOrEqual(3);
    });
  }
});

test.describe("BNP Paribas reacts where it stands", () => {
  test.use({ reducedMotion: "no-preference" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("it turns BNP green and a small pass hangs below it on hover (a tap on phones), and goes back when it ends", async ({ page }) => {
    const pass = page.locator(".qi-bnp__pass");
    await expect(pass).toHaveCSS("opacity", "0");
    if (await canHover(page)) await bnp(page).hover(await overBnp(page));
    else await bnp(page).click(await overBnp(page));
    await expect(bnp(page)).toHaveCSS("color", BNP_GREEN);
    await expect(pass).toHaveCSS("opacity", "1");
    const [word, hung] = await Promise.all([bnp(page).boundingBox(), pass.boundingBox()]);
    expect(hung!.y, "below the word").toBeGreaterThanOrEqual(word!.y + word!.height - 12);
    await expect(pass.locator('.qi-mini[data-pass-slug="bnp-paribas"]')).toHaveCount(1);
    // Moving away and tapping elsewhere (which blurs it) puts it back.
    await page.mouse.move(0, 0);
    await page.locator(".qi-opening__support").click({ position: { x: 2, y: 2 } });
    await expect(pass).toHaveCSS("opacity", "0");
    await expect(bnp(page)).not.toHaveCSS("color", BNP_GREEN);
  });

  test("it is a reaction only: nothing opens, on hover, focus or tap", async ({ page }) => {
    await bnp(page).click(await overBnp(page));
    await bnp(page).focus();
    await expect(page.locator(".qi-margin, .qi-inline__in")).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test("the pass is decoration: the h1's name does not mention it", async ({ page }) => {
    await expect(page.locator(".qi-bnp__pass")).toHaveAttribute("aria-hidden", "true");
    await expect(heading(page)).toHaveAccessibleName(opening.headline);
  });
});

test.describe("products of my own.", () => {
  test("it is cobalt, with its underline drawing once on arrival", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect(tail(page)).toHaveText("products of my own.");
    await expect(tail(page)).toHaveCSS("color", COBALT);
    await expect(tail(page).locator("path")).toHaveCSS("stroke", COBALT);
    const draw = tail(page).locator("svg");
    await expect(draw).toHaveCSS("animation-name", "qi-underline");
    await expect(draw).toHaveCSS("animation-iteration-count", "1");
    // Once drawn it stays drawn: nothing loops.
    await expect.poll(() => draw.evaluate((svg) => svg.getAnimations().every((animation) => animation.playState === "finished"))).toBe(true);
  });

  test("no animation name is defined twice, so no stylesheet replaces another's keyframes", async ({ page }) => {
    await page.goto("/");
    const names = await page.evaluate(() => [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules].filter((rule): rule is CSSKeyframesRule => rule instanceof CSSKeyframesRule).map((rule) => rule.name)));
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
  });

  test("the underline is drawn from the first frame when motion is reduced, and nothing animates", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(tail(page).locator("svg")).toHaveCSS("animation-name", "none");
    if (await canHover(page)) await tail(page).hover();
    await expect(tail(page).locator(".qi-letter").first()).toHaveCSS("animation-name", "none");
    await expect(tail(page).locator("path")).toHaveCSS("animation-name", "none");
  });

  test("on hover its letters lift in a wave and the underline scribbles out and back, and the line stays plain text", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    test.skip(!(await canHover(page)), "Hover only");
    const letters = tail(page).locator(".qi-letter");
    await expect(letters.first()).toHaveCSS("display", "inline");
    await expect(letters.first()).toHaveCSS("position", "relative");
    await tail(page).hover();
    await expect(letters.first()).toHaveCSS("animation-name", "qi-lift");
    await expect(letters.last()).toHaveCSS("animation-name", "qi-lift");
    const delay = (locator: typeof letters) => locator.evaluate((element) => parseFloat(getComputedStyle(element).animationDelay));
    expect(await delay(letters.last()), "later letters start later").toBeGreaterThan(await delay(letters.first()));
    await expect(tail(page).locator("path")).toHaveCSS("animation-name", "qi-scribble");
    await expect(letters.first()).toHaveCSS("display", "inline");
    await expect(heading(page)).toHaveAccessibleName(opening.headline);
  });

  test("hovering it does not move the line", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    test.skip(!(await canHover(page)), "Hover only");
    // The baseline is taken once the display font is in and the line has stopped moving: a font swap changes widths on its own.
    await expect.poll(() => page.evaluate(() => [...document.fonts].some((face) => face.family.replaceAll('"', "") === "Bricolage Grotesque" && face.status === "loaded"))).toBe(true);
    const boxes = () => Promise.all([heading(page), page.locator(".qi-opening__support"), tail(page)].map((locator) => locator.boundingBox()));
    let before = await boxes();
    await expect
      .poll(async () => {
        const now = await boxes();
        const still = JSON.stringify(now) === JSON.stringify(before);
        before = now;
        return still;
      })
      .toBe(true);
    await tail(page).hover();
    // The wave has started, and the line is where it was.
    await expect(tail(page).locator(".qi-letter").first()).toHaveCSS("animation-name", "qi-lift");
    await expect.poll(boxes).toEqual(before);
  });
});
