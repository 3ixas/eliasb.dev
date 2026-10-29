import { expect, test, type Page } from "@playwright/test";
import { caseStudies } from "../src/content/stretch/case-studies";
import { howIWork } from "../src/content/stretch/how-i-work";
import { contrastOnPaper } from "./support/contrast";
import { tap } from "./support/tap";

const section = (page: Page) => page.locator("section#how-i-work");
const habits = (page: Page) => section(page).locator("[data-habits] .qi-list__item").filter({ has: page.locator(".qi-number") });
const prdRow = (page: Page) => section(page).locator('[data-look="threshold-prd"]');
const { quote } = caseStudies.threshold.prd;
const date = caseStudies.threshold.prd.date!;
const caption = `${howIWork.prd.title}, ${date}`;
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1180;

/** The PRD's closer look: in the margin on wide screens (the pointer arrives), under the row on phones (a tap). */
const openPrd = async (page: Page) => {
  // The controller listens through React's props on the column, which exist only once it has hydrated.
  await page.waitForFunction(() => {
    const column = document.querySelector("#how-i-work [data-quiet-column]");
    return !!column && Object.keys(column).some((key) => key.startsWith("__reactProps$"));
  });
  if (wide(page)) {
    await prdRow(page).hover();
    return page.locator(".qi-margin .qi-prd");
  }
  await tap(page, section(page).locator('.qi-row[data-look-tap="threshold-prd"]'));
  return section(page).locator('[data-look-slot="threshold-prd"] .qi-prd');
};

test.describe("How I work: the habits", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("four habit rows, each with its proof verbatim from the approved copy", async ({ page }) => {
    await expect(habits(page)).toHaveCount(4);
    for (const [index, beat] of howIWork.beats.entries()) {
      const row = habits(page).nth(index).locator(".qi-row");
      await expect(row.locator(".qi-row__title")).toHaveText(beat.habit);
      await expect(row.locator(".qi-row__line")).toHaveText(beat.proof);
    }
  });

  test("a habit is a plain row: not a link, and not a tab stop because it has no closer look", async ({ page }) => {
    for (const row of await habits(page).locator(".qi-row").all()) {
      await expect(row).toHaveJSProperty("tagName", "DIV");
      await expect(row).not.toHaveAttribute("tabindex", /.*/);
      await expect(row).not.toHaveAttribute("data-look", /.*/);
    }
  });

  test("it is in the server-rendered page, the PRD's whole quote included", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(habits(page)).toHaveCount(4);
    expect(await section(page).locator("#threshold-prd-description").evaluate((element) => element.textContent)).toBe(`${quote} ${caption}`);
  });

  test("the numbers are decorative, and the title and note are the quiet ones", async ({ page }) => {
    for (const number of await section(page).locator(".qi-row__object").all()) await expect(number).toHaveAttribute("aria-hidden", "true");
    await expect(section(page).getByRole("heading", { level: 2, name: howIWork.heading, exact: true })).toBeVisible();
    await expect(section(page).locator(".qi-note-line")).toHaveText(howIWork.note);
  });

  test("rows are 68 px or more, with a 44 px object, and their text starts at one edge", async ({ page }) => {
    const edges = new Set<number>();
    for (const row of await section(page).locator(".qi-row").all()) {
      expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(68);
      const object = (await row.locator(".qi-row__object").boundingBox())!;
      expect([object.width, object.height]).toEqual([44, 44]);
      edges.add(Math.round((await row.locator(".qi-row__text").boundingBox())!.x));
    }
    expect(edges.size).toBe(1);
  });

  test("text passes WCAG 2.2 AA contrast", async ({ page }) => {
    for (const selector of [".qi-row__title", ".qi-row__line", ".qi-number"]) {
      const readings = await contrastOnPaper(page, `#how-i-work ${selector}`);
      expect(readings.length, selector).toBeGreaterThan(0);
      for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("nothing in the section overflows, and the page does not scroll sideways", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    for (const box of await Promise.all((await section(page).locator(".qi-row").all()).map((row) => row.boundingBox()))) {
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

test.describe("How I work: the pen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("a ring on each number, an arrow to the next habit, and a line under each proof's phrase", async ({ page }) => {
    await expect(section(page).locator(".qi-ink--circle")).toHaveCount(4);
    await expect(section(page).locator(".qi-ink--next")).toHaveCount(3);
    await expect(section(page).locator(".qi-ink--under")).toHaveCount(4);
    for (const [index, beat] of howIWork.beats.entries()) {
      const row = habits(page).nth(index);
      await expect(row.locator(".qi-number .qi-ink--circle")).toHaveCount(1);
      await expect(row.locator(".qi-mark")).toHaveText(beat.underline);
      await expect(row.locator(".qi-mark .qi-ink--under")).toHaveCount(1);
      await expect(row.locator(".qi-ink--next")).toHaveCount(index < howIWork.beats.length - 1 ? 1 : 0);
    }
    for (const stroke of await section(page).locator(".qi-ink").all()) await expect(stroke).toHaveAttribute("aria-hidden", "true");
    // Dashes measure in pathLength units; a non-scaling stroke would measure them in pixels.
    for (const path of await section(page).locator(".qi-ink path").all()) {
      await expect(path).toHaveAttribute("pathLength", "1");
      expect(await path.evaluate((element) => getComputedStyle(element).vectorEffect)).toBe("none");
    }
  });

  test("each ring holds its number, each arrow runs from a ring to the next, and each line sits under its phrase", async ({ page }) => {
    await expect
      .poll(async () => {
        const boxes = async (selector: string) => Promise.all((await section(page).locator(selector).all()).map((element) => element.boundingBox()));
        const [rings, numbers, arrows] = await Promise.all([boxes(".qi-ink--circle"), boxes(".qi-number"), boxes(".qi-ink--next")]);
        const ringsHoldNumbers = rings.every((ring, index) => ring!.x <= numbers[index]!.x && ring!.y <= numbers[index]!.y && ring!.x + ring!.width >= numbers[index]!.x + numbers[index]!.width);
        const arrowsBetween = arrows.every((arrow, index) => arrow!.y >= rings[index]!.y + rings[index]!.height - 1 && arrow!.y + arrow!.height <= rings[index + 1]!.y + 4);
        return ringsHoldNumbers && arrowsBetween;
      })
      .toBe(true);
    for (const row of await habits(page).all()) {
      const mark = (await row.locator(".qi-mark").boundingBox())!;
      const line = (await row.locator(".qi-ink--under").boundingBox())!;
      expect(line.y + line.height / 2).toBeGreaterThanOrEqual(mark.y + mark.height - 8);
      expect(line.x).toBeLessThanOrEqual(mark.x + 1);
    }
  });
});

test.describe("How I work: Threshold's PRD", () => {
  test("a row after the habits with the Sheet as its object, and no card", async ({ page }) => {
    await page.goto("/");
    const row = prdRow(page);
    await expect(row.locator(".qi-row__title")).toHaveText(howIWork.prd.title);
    await expect(row.locator(".qi-row__line")).toHaveText(date);
    await expect(row.locator(".qi-row__object .qi-sheet")).toHaveCount(1);
    await expect(section(page).locator(".qi-list__item").last().locator('[data-look="threshold-prd"]')).toHaveCount(1);
    await expect(section(page).locator(".stretch-fastener")).toHaveCount(0);
  });

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("the quote types itself with a caret, at about 45 characters a second, and then the caret goes", async ({ page }) => {
      await page.goto("/");
      const look = await openPrd(page);
      await expect(look).toBeVisible();
      // Sampled on the page's own frames, so a busy runner cannot skip the typing between two polls.
      const run = await look.evaluate(
        (element, total) =>
          new Promise<{ lengths: number[]; seconds: number; caretShown: boolean }>((resolve) => {
            const typed = element.querySelector("blockquote span")!;
            const caret = element.querySelector<HTMLElement>(".qi-caret")!;
            const lengths: number[] = [];
            let caretShown = true;
            const started = performance.now();
            const sample = () => {
              const length = typed.textContent!.length;
              lengths.push(length);
              if (length < total) caretShown &&= getComputedStyle(caret).display !== "none";
              if (length >= total) return resolve({ lengths, seconds: (performance.now() - started) / 1000, caretShown });
              requestAnimationFrame(sample);
            };
            sample();
          }),
        quote.length,
      );
      expect(run.lengths.some((length) => length > 0 && length < quote.length), "it types, rather than appearing at once").toBe(true);
      expect([...run.lengths].sort((a, b) => a - b)).toEqual(run.lengths);
      expect(run.caretShown).toBe(true);
      // Time-based, so the whole quote takes about its length over 45 a second, whatever the frame rate.
      const expected = quote.length / 45;
      expect(run.seconds).toBeGreaterThan(expected * 0.5);
      expect(run.seconds).toBeLessThan(expected * 2);
      await expect(look.locator("blockquote")).toHaveText(quote);
      await expect(look.locator(".qi-caret")).toHaveAttribute("data-done", "");
      await expect(look.locator("figcaption")).toHaveText(caption);
    });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the quote is complete at once, with no caret", async ({ page }) => {
      await page.goto("/");
      const look = await openPrd(page);
      await expect(look).toBeVisible();
      await expect(look.locator("blockquote span").first()).toHaveText(quote);
      await expect(look.locator(".qi-caret")).toBeHidden();
    });
  });
});
