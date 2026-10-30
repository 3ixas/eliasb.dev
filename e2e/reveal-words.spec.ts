import { expect, test, type Locator, type Page } from "@playwright/test";
import { opening, type RevealId } from "../src/content/stretch/opening";
import { onFirstLine } from "./support/first-line";
import { tap } from "./support/tap";

/*
 * The reveal words (GLOSSARY.md; docs/design/DESIGN.md, "Closer looks"): the words of the opening line and its
 * supporting line that name something real and can show it. From 1180 px with a hovering pointer, hover or focus
 * shows the look in the margin; below that a tap opens it inline, under the line that holds the word.
 */

const words = [...opening.headlineRuns, ...opening.supportRuns].flatMap((run) =>
  run.mark && run.mark !== "employer" && run.mark !== "emphasis" ? [{ id: run.mark as RevealId, phrase: run.text }] : [],
);
const { engines, cores, digitisation, ownership } = opening.looks;
/** What each word's accessible description must contain: the caption its closer look shows, which is also the row-free way to read it. */
const described: Record<RevealId, string> = {
  engines: `${engines.caption} ${engines.note}`,
  cores: cores.caption,
  digitisation: digitisation.line,
  ownership: ownership.certificate.caption,
};

const COBALT = /^rgb\((35, 64, 255|139, 156, 255)\)$/;
const BNP_GREEN = /^rgb\((0, 150, 94|47, 208, 143)\)$/;
const LIT = "rgb(127, 149, 255)";
const word = (page: Page, id: RevealId) => page.locator(`.qi-word[data-look="${id}"]`);
const margin = (page: Page) => page.locator(".qi-margin");
const slot = (page: Page, id: RevealId) => page.locator(`[data-look-slot="${id}"]`);
const openInline = (page: Page) => page.locator(".qi-inline__in");
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1180;
/** The pointer and thumb go on a word's first line: a word that wraps has a box whose middle can be other text. */
const hoverWord = async (page: Page, id: RevealId) => word(page, id).hover({ position: await onFirstLine(word(page, id)) });
const tapWord = async (page: Page, id: RevealId) => tap(page, word(page, id), { position: await onFirstLine(word(page, id)) });
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
const escaped = (text: string) => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
/** The animations that loop forever, by name, on the page right now. */
const loops = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => animation.playState === "running" && animation.effect?.getTiming().iterations === Infinity)
      .map((animation) => (animation as CSSAnimation).animationName),
  );

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  // The controller listens through React's props on the column, which exist only once it has hydrated; a hover or tap before that does nothing.
  await page.waitForFunction(() => {
    const column = document.querySelector(".qi-opening [data-quiet-column]");
    return !!column && Object.keys(column).some((key) => key.startsWith("__reactProps$"));
  });
});

test.describe("The reveal words", () => {
  test("there are four, in the opening and the supporting line, in reading order", async () => {
    expect(words.map(({ phrase }) => phrase)).toEqual(["pricing and risk engines", "CPU and GPU", "digitisation competition", "Take Ownership award"]);
  });

  test("each is a focusable button with the dotted underline, named for its words and described by its look", async ({ page }) => {
    for (const { id, phrase } of words) {
      const target = word(page, id);
      await expect(target).toHaveText(phrase);
      await expect(target).toHaveAttribute("tabindex", "0");
      await expect(target).toHaveAttribute("role", "button");
      await expect(target).toHaveAccessibleName(phrase);
      await expect(target).toHaveAccessibleDescription(escaped(described[id]));
      await expect(target).toHaveCSS("text-decoration-line", "underline");
      await expect(target).toHaveCSS("text-decoration-style", "dotted");
      await expect(target).toHaveCSS("text-decoration-thickness", "1.5px");
      await expect(target).toHaveCSS("text-underline-offset", "5px");
      await expect(target).not.toHaveAttribute("href", /.*/);
    }
  });

  test("the dotted underline turns cobalt on focus and on hover", async ({ page }) => {
    const target = word(page, "cores");
    await expect(target).not.toHaveCSS("text-decoration-color", COBALT);
    await target.focus();
    await expect(target).toHaveCSS("text-decoration-color", COBALT);
    await page.locator(".qi-opening__support").evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(target).not.toHaveCSS("text-decoration-color", COBALT);
    if (await page.evaluate(() => matchMedia("(hover: hover)").matches)) {
      await hoverWord(page, "cores");
      await expect(target).toHaveCSS("text-decoration-color", COBALT);
    }
  });

  test("the opening's focus order follows the reading order, and the employer takes part", async ({ page }) => {
    const order = await page.locator(".qi-opening [tabindex='0']").evaluateAll((all) => all.map((element) => element.textContent?.replace(/\s+/g, " ").trim()));
    expect(order).toEqual(["pricing and risk engines", "BNP Paribas", "CPU and GPU", "digitisation competition", "Take Ownership award"]);
  });

  test("the words are not links, and nothing in a closer look is", async ({ page }) => {
    await expect(page.locator(".qi-opening a")).toHaveCount(0);
    if (wide(page)) {
      for (const { id } of words) {
        await hoverWord(page, id);
        await expect(margin(page).locator("a")).toHaveCount(0);
      }
    }
  });
});

test.describe("On wide screens: the margin", () => {
  test.skip(({ page }) => !wide(page), "Phones and narrow windows open the look inline");

  /** What a look must show, and the one thing about it that proves it is the right one. */
  const shows: Record<RevealId, (look: Locator) => Promise<void>> = {
    engines: async (look) => {
      expect(await look.locator(".qi-sim__path").count(), "a fan of paths").toBeGreaterThanOrEqual(10);
      await expect(look.locator(".qi-sim__path[data-highlight]")).toHaveCount(1);
      await expect(look.locator(".qi-sim__path[data-highlight]")).toHaveCSS("stroke", BNP_GREEN);
      await expect(look.locator("figcaption")).toHaveText(`${engines.caption} ${engines.note}`);
      await expect(look.locator("figcaption")).toContainText("Illustrative paths, not real prices.");
    },
    cores: async (look) => {
      await expect(look.locator(".qi-chip--cpu .qi-core")).toHaveCount(4);
      expect(await look.locator(".qi-chip--gpu .qi-core").count(), "the GPU has many more").toBeGreaterThanOrEqual(16);
      await expect(look.locator(".qi-chip__name")).toHaveText(["CPU", "GPU"]);
      await expect(look.locator("figcaption")).toHaveText(cores.caption);
    },
    digitisation: async (look) => {
      await expect(look.locator(".qi-pins__item")).toHaveCount(1);
      await expect(look.locator(".qi-pins__text")).toContainText(`${digitisation.pin.label} ${digitisation.pin.detail}`);
      await expect(look.locator(".qi-competition__line")).toHaveText(digitisation.line);
      await expect(look.locator(".qi-bar strong")).toHaveText(["30–40 min", "Under 5"]);
      // To scale once the shrinking has finished: 5 against 40.
      await expect
        .poll(async () => {
          const [longer, shorter] = await Promise.all([boxOf(look.locator(".qi-bar__fill").nth(0)), boxOf(look.locator(".qi-bar__fill").nth(1))]);
          return Math.round((shorter.width / longer.width) * 1000) / 1000;
        })
        .toBeCloseTo(5 / 40, 2);
    },
    ownership: async (look) => {
      const image = look.locator("img");
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      await expect(image).toHaveAttribute("alt", ownership.certificate.alt);
      await expect(look.locator("figcaption")).toHaveText(ownership.certificate.caption);
    },
  };

  test("hovering a word shows its closer look beside the column, level with the word, and leaving hides it", async ({ page }) => {
    const column = await boxOf(page.locator(".qi-opening [data-quiet-column]"));
    for (const { id } of words) {
      const target = word(page, id);
      await hoverWord(page, id);
      await expect(margin(page)).toHaveCount(1);
      await shows[id](margin(page).locator(".qi-look"));
      // 40 px right of the column, and level with the word's top less 6 px, kept inside the window.
      await expect
        .poll(async () => {
          const [placed, at] = await Promise.all([boxOf(margin(page)), boxOf(target)]);
          const top = Math.max(16, Math.min(at.y - 6, page.viewportSize()!.height - 16 - placed.height));
          return [Math.round(placed.x - (column.x + column.width)), Math.abs(placed.y - top) < 1];
        })
        .toEqual([40, true]);
      await page.mouse.move(0, 0);
      await expect(margin(page)).toHaveCount(0);
    }
  });

  test("it never covers the opening, and takes no pointer events", async ({ page }) => {
    await hoverWord(page, "digitisation");
    const [placed, h1] = await Promise.all([boxOf(margin(page)), boxOf(page.getByRole("heading", { level: 1 }))]);
    expect(placed.x).toBeGreaterThanOrEqual(h1.x + h1.width);
    await expect(margin(page)).toHaveCSS("pointer-events", "none");
    await expect(margin(page)).toHaveAttribute("aria-hidden", "true");
  });

  test("focus shows the look too, and Escape hides it and leaves focus where it was", async ({ page }) => {
    await word(page, "ownership").focus();
    await expect(margin(page).locator(".qi-certificate")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(margin(page)).toHaveCount(0);
    await expect(word(page, "ownership")).toBeFocused();
    await word(page, "cores").focus();
    await expect(margin(page).locator(".qi-cores")).toBeVisible();
    await page.locator("body").click({ position: { x: 1, y: 1 } });
    await expect(margin(page)).toHaveCount(0);
  });

  test("moving from one word to another swaps the look: only one is ever shown", async ({ page }) => {
    await hoverWord(page, "engines");
    await expect(margin(page).locator(".qi-sim")).toBeVisible();
    await hoverWord(page, "cores");
    await expect(margin(page).locator(".qi-cores")).toBeVisible();
    await expect(margin(page).locator(".qi-sim")).toHaveCount(0);
    await expect(margin(page)).toHaveCount(1);
  });

  test("a look in Work replaces the opening's, and the other way round: one margin on the page", async ({ page }) => {
    const row = page.locator('#work a[data-look="joveen"]');
    await hoverWord(page, "cores");
    await expect(margin(page).locator(".qi-cores")).toBeVisible();
    await row.hover();
    await expect(margin(page).locator(".qi-pass")).toBeVisible();
    await expect(margin(page)).toHaveCount(1);
    await expect(margin(page).locator(".qi-cores")).toHaveCount(0);
    await hoverWord(page, "ownership");
    await expect(margin(page).locator(".qi-certificate")).toBeVisible();
    await expect(margin(page)).toHaveCount(1);
    await expect(margin(page).locator(".qi-pass")).toHaveCount(0);
  });

  test("the slots for inline looks are not used on wide screens", async ({ page }) => {
    for (const { id } of words) await expect(slot(page, id)).toBeHidden();
    await word(page, "cores").click({ position: await onFirstLine(word(page, "cores")) });
    await expect(openInline(page)).toHaveCount(0);
  });

  test("the cores are the only looping motion, and only while their closer look is shown", async ({ page }) => {
    expect(await loops(page), "nothing loops before").toEqual([]);
    for (const { id } of words.filter((entry) => entry.id !== "cores")) {
      await hoverWord(page, id);
      await expect(margin(page)).toHaveCount(1);
      await page.waitForTimeout(150);
      expect(await loops(page), `nothing loops while ${id} is shown`).toEqual([]);
    }
    await hoverWord(page, "cores");
    await expect(margin(page).locator(".qi-cores")).toBeVisible();
    await expect.poll(async () => [...new Set(await loops(page))].sort()).toEqual(["qi-core-together", "qi-core-turn"]);
    await page.mouse.move(0, 0);
    await expect(margin(page)).toHaveCount(0);
    expect(await loops(page), "nothing loops once it is hidden").toEqual([]);
  });

  test("with reduced motion every look fades in with no arrival motion, and the cores are still", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const { id } of words) {
      await hoverWord(page, id);
      await expect(margin(page)).toHaveCount(1);
      await shows[id](margin(page).locator(".qi-look"));
      const look = margin(page).locator(".qi-look");
      await expect(look).toHaveCSS("animation-name", "qi-fade");
      for (const selector of [".qi-sim__path", ".qi-bar__fill", ".qi-certificate", ".qi-core"]) {
        for (const element of await look.locator(selector).all()) await expect(element).toHaveCSS("animation-name", "none");
      }
      expect(await loops(page)).toEqual([]);
      await page.mouse.move(0, 0);
      await expect(margin(page)).toHaveCount(0);
    }
    await hoverWord(page, "cores");
    await expect(margin(page).locator(".qi-chip--gpu .qi-core").first()).toHaveCSS("background-color", LIT);
    await expect(margin(page).locator(".qi-chip--cpu .qi-core").first()).toHaveCSS("background-color", LIT);
  });
});

test.describe("On phones and narrow windows: inline", () => {
  test.skip(({ page }) => wide(page), "Wide screens show the margin instead");

  test("nothing is open on arrival, and there is no margin", async ({ page }) => {
    await expect(openInline(page)).toHaveCount(0);
    await expect(margin(page)).toHaveCount(0);
    for (const { id } of words) await expect(word(page, id)).toHaveAttribute("aria-expanded", "false");
  });

  test("tapping the opening line's word opens its look under the opening line, on the column edge, and pushes the supporting line down", async ({ page }) => {
    const h1 = page.getByRole("heading", { level: 1 });
    const support = page.locator(".qi-opening__support");
    const supportBefore = await boxOf(support);
    await tapWord(page, "engines");
    const look = slot(page, "engines").locator(".qi-look");
    await expect(look.locator(".qi-sim")).toBeVisible();
    await expect(word(page, "engines")).toHaveAttribute("aria-expanded", "true");
    const [opened, heading] = await Promise.all([boxOf(slot(page, "engines")), boxOf(h1)]);
    expect(opened.y, "under the opening line").toBeGreaterThanOrEqual(heading.y + heading.height - 1);
    expect(Math.abs(opened.x - heading.x), "starting on the column edge").toBeLessThanOrEqual(1);
    await expect.poll(async () => (await boxOf(support)).y, "the supporting line moves down").toBeGreaterThan(supportBefore.y + 100);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "no sideways scroll").toBe(true);
    await expect(page).toHaveURL(/\/$/);
  });

  test("a word in the supporting line opens under the supporting line", async ({ page }) => {
    for (const id of ["cores", "digitisation", "ownership"] as const) {
      await tapWord(page, id);
      await expect(openInline(page)).toHaveCount(1);
      const [opened, support] = await Promise.all([boxOf(slot(page, id)), boxOf(page.locator(".qi-opening__support"))]);
      expect(opened.y, `${id} opens under the supporting line`).toBeGreaterThanOrEqual(support.y + support.height - 1);
      await tapWord(page, id);
      await expect(openInline(page)).toHaveCount(0);
    }
  });

  test("tapping the same word again closes it, and opening another closes the first", async ({ page }) => {
    await tapWord(page, "cores");
    await expect(slot(page, "cores").locator(".qi-cores")).toBeVisible();
    await tapWord(page, "digitisation");
    await expect(openInline(page)).toHaveCount(1);
    await expect(slot(page, "cores").locator(".qi-look")).toHaveCount(0);
    await expect(word(page, "cores")).toHaveAttribute("aria-expanded", "false");
    await expect(slot(page, "digitisation").locator(".qi-bar")).toHaveCount(2);
    await tapWord(page, "digitisation");
    await expect(openInline(page)).toHaveCount(0);
  });

  test("a look in Work closes the opening's, and the other way round: one look is open on the page, and the tapped object stays put", async ({ page }) => {
    const object = page.locator('#work button[data-look-tap="joveen"]');
    await tapWord(page, "cores");
    await expect(slot(page, "cores").locator(".qi-cores")).toBeVisible();
    // The opening look has finished growing, so the object has stopped moving down the page.
    await expect
      .poll(async () => {
        const first = (await boxOf(object)).y;
        await page.waitForTimeout(100);
        return Math.abs((await boxOf(object)).y - first);
      })
      .toBe(0);
    // Centred, so the page has room to hold the object where it is when the look above it closes.
    await object.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    const before = await boxOf(object);
    await tap(page, object);
    await expect(page.locator('#work [data-look-slot="joveen"] .qi-pass')).toBeVisible();
    await expect(openInline(page)).toHaveCount(1);
    await expect(slot(page, "cores").locator(".qi-look")).toHaveCount(0);
    await expect(word(page, "cores")).toHaveAttribute("aria-expanded", "false");
    // The look above it closed, and the tapped object is where it was on screen.
    await expect.poll(async () => Math.abs((await boxOf(object)).y - before.y)).toBeLessThanOrEqual(1);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await tapWord(page, "engines");
    await expect(slot(page, "engines").locator(".qi-sim")).toBeVisible();
    await expect(openInline(page)).toHaveCount(1);
    await expect(object).toHaveAttribute("aria-expanded", "false");
  });

  test("tapping elsewhere does nothing, and scrolling opens or closes nothing", async ({ page }) => {
    await tapWord(page, "ownership");
    await expect(openInline(page)).toHaveCount(1);
    await tap(page, page.locator(".qi-opening__support"), { position: { x: 2, y: 2 } });
    await page.evaluate(() => scrollTo({ top: 400, behavior: "instant" }));
    await page.waitForTimeout(100);
    await expect(openInline(page)).toHaveCount(1);
    await expect(word(page, "ownership")).toHaveAttribute("aria-expanded", "true");
  });

  test("Enter and Space open and close a focused word", async ({ page }) => {
    await word(page, "engines").focus();
    await page.keyboard.press("Enter");
    await expect(slot(page, "engines").locator(".qi-sim")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(openInline(page)).toHaveCount(0);
  });

  test("every look fits the screen without a sideways scroll", async ({ page }) => {
    for (const { id } of words) {
      await tapWord(page, id);
      await expect(openInline(page)).toHaveCount(1);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const [opened, viewport] = [await boxOf(slot(page, id)), page.viewportSize()!];
      expect(opened.x + opened.width).toBeLessThanOrEqual(viewport.width + 0.5);
      await tapWord(page, id);
    }
  });
});
