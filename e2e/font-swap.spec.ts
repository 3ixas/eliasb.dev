import { expect, test, type Page } from "@playwright/test";

// The display font arrives after the first paint on a slow connection, and the
// name must not move when it does (#252). This blocks the font files, measures
// the name in the Arial fallback, loads the page again with the real font and
// compares the two. Nothing is throttled and nothing waits on timing: the
// fallback run has no font to wait for.
test.beforeEach(({}, testInfo) => {
  test.skip(!/-(390|1440)-light$/.test(testInfo.project.name), "Measured at a phone and a desktop width");
});

type Measure = { fontLoaded: boolean; lines: { top: number; height: number; width: number }[]; box: { top: number; height: number } };

async function measureName(page: Page, { blockFonts }: { blockFonts: boolean }): Promise<Measure> {
  if (blockFonts) await page.route(/\.woff2(\?|$)/, (route) => route.abort());
  await page.goto("/");
  // Both runs settle the same way: every font either loaded or failed.
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const name = document.querySelector<HTMLElement>(".stretch-name")!;
    const lines = [...name.querySelectorAll("span")].map((span) => {
      const range = document.createRange();
      range.selectNodeContents(span);
      const rect = range.getBoundingClientRect();
      return { top: rect.top, height: rect.height, width: rect.width };
    });
    const box = name.getBoundingClientRect();
    return {
      fontLoaded: document.fonts.check("800 100px 'Bricolage Grotesque'"),
      lines,
      box: { top: box.top, height: box.height },
    };
  });
}

test("the name does not move or resize when the display font replaces its fallback", async ({ page }) => {
  const fallback = await measureName(page, { blockFonts: true });
  await page.unrouteAll();
  const real = await measureName(page, { blockFonts: false });

  // Guard against a test that compares a font with itself.
  expect(fallback.fontLoaded, "fallback run still had the font").toBe(false);
  expect(real.fontLoaded, "real run never loaded the font").toBe(true);
  expect(fallback.lines.length).toBeGreaterThan(0);
  expect(fallback.lines.length).toBe(real.lines.length);

  // Before the ascent and descent overrides the name sat 34 px (390) and 70 px
  // (1440) lower in the fallback and its lines were up to 139 px shorter; with
  // them every vertical reading matches to the pixel. 1 px is rounding. Widths
  // are only close, since size-adjust is one measured ratio per style: the
  // fallback ran 1.8% narrower on "Bennett" at 1440, so 3% is the bound.
  const verticalTolerance = 1;
  const widthTolerance = 0.03;
  expect(Math.abs(fallback.box.top - real.box.top), "name box top").toBeLessThanOrEqual(verticalTolerance);
  expect(Math.abs(fallback.box.height - real.box.height), "name box height").toBeLessThanOrEqual(verticalTolerance);
  fallback.lines.forEach((line, i) => {
    expect(Math.abs(line.top - real.lines[i].top), `line ${i} top`).toBeLessThanOrEqual(verticalTolerance);
    expect(Math.abs(line.height - real.lines[i].height), `line ${i} height`).toBeLessThanOrEqual(verticalTolerance);
    expect(Math.abs(line.width - real.lines[i].width) / real.lines[i].width, `line ${i} width`).toBeLessThanOrEqual(widthTolerance);
  });
});
