import { expect, test, type Page } from "@playwright/test";

// The display font arrives after the first paint on a slow connection, and the
// opening line must not move when it does (#252). This blocks the font files,
// measures the opening line in the Arial fallback, loads the page again with the
// real font and compares the two. Nothing is throttled and nothing waits on
// timing: the fallback run has no font to wait for.
//
// Chromium only: the fallback is local("Arial"), which WebKit on Linux cannot
// resolve (its CI build wrapped text onto an extra line in a wider font), so
// there is no Arial-metric face there to measure. Safari on a Mac has Arial.
test.beforeEach(({}, testInfo) => {
  test.skip(!/^chromium-(390|1440)-light$/.test(testInfo.project.name), "Measured at a phone and a desktop width, in Chromium");
});

type Measure = { lines: number; box: { top: number; height: number }; supportTop: number };

const displayFontLoaded = (page: Page) =>
  page.evaluate(() => [...document.fonts].some((face) => face.family.replaceAll('"', "") === "Bricolage Grotesque" && face.status === "loaded"));

async function measureOpening(page: Page, { blockFonts }: { blockFonts: boolean }): Promise<Measure> {
  if (blockFonts) await page.route(/\.woff2(\?|$)/, (route) => route.abort());
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  // The real font is requested lazily (WebKit resolves fonts.ready before it
  // starts), so wait for it to be in; the blocked run never gets it.
  if (!blockFonts) await expect.poll(() => displayFontLoaded(page)).toBe(true);
  // Guards against comparing a font with itself.
  expect(await displayFontLoaded(page), blockFonts ? "the fallback run had the font" : "the real run lacks the font").toBe(!blockFonts);
  return page.evaluate(() => {
    const line = document.querySelector<HTMLElement>(".qi-opening__line")!;
    const box = line.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(line).lineHeight);
    return {
      lines: Math.round(box.height / lineHeight),
      box: { top: box.top, height: box.height },
      supportTop: document.querySelector(".qi-opening__support")!.getBoundingClientRect().top,
    };
  });
}

test("the opening line does not move, rewrap or resize when the display font replaces its fallback", async ({ page, context }) => {
  const fallback = await measureOpening(page, { blockFonts: true });
  // A new page: WebKit keeps a font that failed to load for the life of the page.
  const real = await measureOpening(await context.newPage(), { blockFonts: false });

  expect(fallback.lines).toBeGreaterThan(1);
  expect(fallback.lines, "the same number of lines in either font").toBe(real.lines);

  // The ascent and descent overrides make each line's content area as tall as
  // Bricolage's, and size-adjust makes the fallback as wide, so the opening line
  // wraps in the same places and everything under it stays put. 1 px is rounding.
  const tolerance = 1;
  expect(Math.abs(fallback.box.top - real.box.top), "opening line top").toBeLessThanOrEqual(tolerance);
  expect(Math.abs(fallback.box.height - real.box.height), "opening line height").toBeLessThanOrEqual(tolerance);
  expect(Math.abs(fallback.supportTop - real.supportTop), "the supporting line stays put").toBeLessThanOrEqual(tolerance);
});
