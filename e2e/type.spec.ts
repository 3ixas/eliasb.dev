import { expect, test, type Page } from "@playwright/test";

// The passes and panels faces (layout.tsx, tokens.css; docs/design/DESIGN.md "Type"), on /fixtures/tokens.
// The successor of stretch-type.spec.ts and font-swap.spec.ts for Newsreader and Instrument Sans; those
// keep checking Bricolage Grotesque and DM Mono until #420 retires them.

const serifSteps = ["opening", "title", "section", "panel", "figure", "prose"];
const sansSteps = ["body", "ui", "small", "label"];

const families = (page: Page) =>
  page.evaluate(() =>
    Object.fromEntries([...document.querySelectorAll<HTMLElement>("[data-type]")].map((element) => [element.dataset.type, getComputedStyle(element).fontFamily.replaceAll('"', "")])),
  );

const loaded = (page: Page, family: string) =>
  page.evaluate((name) => [...document.fonts].some((face) => face.family.replaceAll('"', "") === name && face.status === "loaded"), family);

test.describe("Faces", () => {
  // Fonts are the same at every width and in both schemes, so this runs once per engine.
  test.beforeEach(({}, testInfo) => {
    test.skip(!/-1440-light$/.test(testInfo.project.name), "Measured once per engine");
  });

  test("headings, figures and prose are Newsreader and interface text is Instrument Sans, from this origin", async ({ page }) => {
    await page.goto("/fixtures/tokens");
    await expect.poll(() => loaded(page, "Newsreader")).toBe(true);
    await expect.poll(() => loaded(page, "Instrument Sans")).toBe(true);
    const family = await families(page);
    for (const step of serifSteps) expect(family[step], step).toMatch(/^Newsreader, Newsreader Fallback,/);
    for (const step of sansSteps) expect(family[step], step).toMatch(/^Instrument Sans, Instrument Sans Fallback,/);
    const external = await page.evaluate(
      () => performance.getEntriesByType("resource").filter((entry) => !entry.name.startsWith(location.origin) && /\.(woff2?|ttf|otf)(\?|$)|fonts\./.test(entry.name)).length,
    );
    expect(external, "font requests to another host").toBe(0);
  });

  test("Newsreader sets its optical size from the type size, and figures are lining and tabular", async ({ page }) => {
    await page.goto("/fixtures/tokens");
    const figure = await page.locator("[data-type='figure']").evaluate((element) => {
      const style = getComputedStyle(element);
      return { optical: style.fontOpticalSizing, numbers: style.fontVariantNumeric, weight: style.fontWeight };
    });
    expect(figure).toEqual({ optical: "auto", numbers: "lining-nums tabular-nums", weight: "500" });
  });
});

// A face that arrives late must not move what is already on screen (R-02, R-36). next/font gives each face a
// fallback sized from the font's own metrics; this blocks the font files, measures two paragraphs in their
// fallbacks, loads the page again with the real faces and compares. Chromium only, like font-swap.spec.ts:
// the fallbacks are local faces WebKit on Linux does not have.
test.describe("Fallback faces", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(!/^chromium-(390|1440)-light$/.test(testInfo.project.name), "Measured at a phone and a desktop width, in Chromium");
  });

  type Measure = Record<"prose" | "body", { lines: number; height: number }>;

  async function measure(page: Page, { blockFonts }: { blockFonts: boolean }): Promise<Measure> {
    if (blockFonts) await page.route(/\.woff2(\?|$)/, (route) => route.abort());
    await page.goto("/fixtures/tokens");
    await page.evaluate(() => document.fonts.ready);
    if (!blockFonts) {
      await expect.poll(() => loaded(page, "Newsreader")).toBe(true);
      await expect.poll(() => loaded(page, "Instrument Sans")).toBe(true);
    }
    expect(await loaded(page, "Newsreader"), blockFonts ? "the fallback run had the font" : "the real run lacks the font").toBe(!blockFonts);
    return page.evaluate(() => {
      const read = (step: string) => {
        const element = document.querySelector<HTMLElement>(`[data-type='${step}']`)!;
        const height = element.getBoundingClientRect().height;
        return { lines: Math.round(height / Number.parseFloat(getComputedStyle(element).lineHeight)), height };
      };
      return { prose: read("prose"), body: read("body") };
    });
  }

  test("prose and body text keep their lines and height when the real faces replace their fallbacks", async ({ page, context }) => {
    const fallback = await measure(page, { blockFonts: true });
    // A new page: a font that failed to load can stay failed for the life of the page.
    const real = await measure(await context.newPage(), { blockFonts: false });
    for (const step of ["prose", "body"] as const) {
      expect(fallback[step].lines, `${step} wraps over more than one line`).toBeGreaterThan(1);
      expect(fallback[step].lines, `${step}: the same number of lines in either face`).toBe(real[step].lines);
      expect(Math.abs(fallback[step].height - real[step].height), `${step} height`).toBeLessThanOrEqual(1);
    }
  });
});
