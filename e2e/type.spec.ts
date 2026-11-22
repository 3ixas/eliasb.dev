import { expect, test, type Page } from "@playwright/test";

// The passes and panels faces (layout.tsx, tokens.css; docs/design/DESIGN.md "Type"), on /fixtures/tokens and the pages.
// Bricolage Grotesque, DM Mono, JetBrains Mono and the Fine cut are all retired (#420, #468).

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

  type Measure = Record<"opening" | "prose" | "body", { lines: number; height: number }>;

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
      return { opening: read("opening"), prose: read("prose"), body: read("body") };
    });
  }

  test("the opening line, prose and body text keep their lines and height when the real faces replace their fallbacks", async ({ page, context }) => {
    const fallback = await measure(page, { blockFonts: true });
    // A new page: a font that failed to load can stay failed for the life of the page.
    const real = await measure(await context.newPage(), { blockFonts: false });
    for (const step of ["prose", "body"] as const) {
      expect(fallback[step].lines, `${step} wraps over more than one line`).toBeGreaterThan(1);
    }
    // The opening line's size too: the homepage's h1 is Newsreader since #412 (font-swap.spec.ts measured its old face).
    for (const step of ["opening", "prose", "body"] as const) {
      expect(fallback[step].lines, `${step}: the same number of lines in either face`).toBe(real[step].lines);
      expect(Math.abs(fallback[step].height - real[step].height), `${step} height`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("Faces on the pages", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(!/-1440-light$/.test(testInfo.project.name), "Measured once per engine");
  });

  for (const route of ["/", "/things-i-make", "/things-i-make/threshold", "/work/bnp-paribas", "/nothing-pinned-here"]) {
    test(`${route} sets its body in Instrument Sans and loads no retired face, from this origin`, async ({ page }) => {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const { body, loaded, external } = await page.evaluate(() => ({
        body: getComputedStyle(document.body).fontFamily,
        loaded: [...document.fonts].filter((face) => face.status === "loaded").map((face) => face.family.replaceAll('"', "")),
        external: performance.getEntriesByType("resource").filter((entry) => !entry.name.startsWith(location.origin) && /\.(woff2?|ttf|otf)(\?|$)|fonts\./.test(entry.name)).length,
      }));
      expect(body.replaceAll('"', "")).toMatch(/^Instrument Sans/);
      expect(loaded.filter((family) => /bricolage|dm mono|hanken|jetbrains/i.test(family))).toEqual([]);
      expect(external, "font requests to another host").toBe(0);
    });
  }

  test("/resume sets its name, summary and section titles in Newsreader, everything else in Instrument Sans with tabular figures, and loads no retired face", async ({ page }) => {
    await page.goto("/resume");
    await page.evaluate(() => document.fonts.ready);
    const reading = await page.evaluate(() => ({
      loaded: [...document.fonts].filter((face) => face.status === "loaded").map((face) => face.family.replaceAll('"', "")),
      external: performance.getEntriesByType("resource").filter((entry) => !entry.name.startsWith(location.origin) && /\.(woff2?|ttf|otf)(\?|$)|fonts\./.test(entry.name)).length,
      name: getComputedStyle(document.querySelector(".resume__name")!).fontFamily.replaceAll('"', ""),
      summary: getComputedStyle(document.querySelector(".resume__summary")!).fontFamily.replaceAll('"', ""),
      heading: getComputedStyle(document.querySelector(".resume__heading")!).fontFamily.replaceAll('"', ""),
      sheet: getComputedStyle(document.querySelector(".resume__sheet")!).fontFamily.replaceAll('"', ""),
      dates: {
        family: getComputedStyle(document.querySelector('[data-resume="dates"]')!).fontFamily.replaceAll('"', ""),
        numeric: getComputedStyle(document.querySelector('[data-resume="dates"]')!).fontVariantNumeric,
      },
      link: {
        family: getComputedStyle(document.querySelector(".resume__link")!).fontFamily.replaceAll('"', ""),
        numeric: getComputedStyle(document.querySelector(".resume__link")!).fontVariantNumeric,
      },
    }));
    expect(reading.loaded.filter((family) => /bricolage|dm mono|hanken|jetbrains/i.test(family))).toEqual([]);
    expect(reading.external, "font requests to another host").toBe(0);
    expect(reading.name).toMatch(/^Newsreader/);
    expect(reading.summary).toMatch(/^Newsreader/);
    expect(reading.heading).toMatch(/^Newsreader/);
    expect(reading.sheet).toMatch(/^Instrument Sans/);
    expect(reading.dates.family).toMatch(/^Instrument Sans/);
    expect(reading.dates.numeric).toContain("tabular-nums");
    expect(reading.link.family).toMatch(/^Instrument Sans/);
    expect(reading.link.numeric).toContain("tabular-nums");
  });
});

test("the skip link is on the type scale", async ({ page }) => {
  await page.goto("/things-i-make/threshold");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.locator(".skip-link").evaluate((element) => getComputedStyle(element).fontSize)).toBe("15px");
});

test("dark mode smooths text to greyscale and light mode keeps the default", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.lights)).toBeTruthy();
  const smoothing = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("-webkit-font-smoothing"));
  expect(smoothing).toBe(/-dark$/.test(testInfo.project.name) ? "antialiased" : "auto");
});

test("homepage sections sit 128 px apart on a wide screen and 88 px on a phone (R-03)", async ({ page }) => {
  await page.goto("/");
  const width = page.viewportSize()!.width;
  const padding = await page.locator("#main-content > section.section").first().evaluate((element) => getComputedStyle(element).paddingTop);
  expect(padding).toBe(width >= 720 ? "128px" : "88px");
});
