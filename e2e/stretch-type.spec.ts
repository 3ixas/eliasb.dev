import { expect, test } from "@playwright/test";

// Fonts and their metrics are the same at every width and in both schemes, so
// this runs once, in each engine the suite covers.
test.beforeEach(({}, testInfo) => {
  const measuredOnce = /^(the display style|only the Résumé|the Fine cut|dotted words)|renders its body/.test(testInfo.title);
  test.skip(measuredOnce && !/-1440-light$/.test(testInfo.project.name), "Measured once per engine");
});

const routes = ["/", "/things-i-make", "/things-i-make/threshold", "/nothing-pinned-here"];

for (const route of routes) {
  test(`${route} renders its body and mono text in the new faces, from this origin`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const { body, loaded, external } = await page.evaluate(() => ({
      body: getComputedStyle(document.body).fontFamily,
      loaded: [...document.fonts].filter((face) => face.status === "loaded").map((face) => face.family),
      external: performance.getEntriesByType("resource").filter((entry) => !entry.name.startsWith(location.origin) && /\.(woff2?|ttf|otf)(\?|$)|fonts\./.test(entry.name)).length,
    }));
    expect(body.replaceAll('"', "")).toMatch(/Bricolage Grotesque/);
    expect(loaded).toContain("Bricolage Grotesque");
    // Newsreader is the shell's (#411); Hanken Grotesk, the Board's, never returns.
    expect(loaded.filter((family) => /hanken/i.test(family))).toEqual([]);
    expect(external, "font requests to another host").toBe(0);
  });
}

test("the display style computes to weight 800, uppercase and 75% width, and really is condensed", async ({ page }) => {
  await page.goto("/fixtures/stretch-type");
  await page.evaluate(() => document.fonts.ready);
  const readings = await page.evaluate(() => {
    const read = (sample: string) => {
      const element = document.querySelector<HTMLElement>(`[data-sample='${sample}']`)!;
      const style = getComputedStyle(element);
      return {
        weight: style.fontWeight,
        transform: style.textTransform,
        stretch: style.fontStretch,
        family: style.fontFamily,
        width: element.getBoundingClientRect().width,
      };
    };
    return { display: read("display"), normal: read("display-normal-width"), mono: read("mono") };
  });
  expect(readings.display.weight).toBe("800");
  expect(readings.display.transform).toBe("uppercase");
  expect(readings.display.stretch).toBe("75%");
  expect(readings.display.family.replaceAll('"', "")).toMatch(/^Bricolage Grotesque,/);
  // The width axis is loaded: the same words are clearly narrower at 75% than at 100%.
  expect(readings.display.width).toBeLessThan(readings.normal.width * 0.9);
  expect(readings.mono.family.replaceAll('"', "")).toMatch(/^DM Mono/);
});

test("only the Résumé loads JetBrains Mono, and its sheet sets metadata in it", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => [...document.fonts].some((face) => face.family === "JetBrains Mono"))).toBe(false);
  await page.goto("/resume");
  await page.evaluate(() => document.fonts.ready);
  const sheetMono = await page.locator(".stretch-resume__sheet .stretch-mono").first().evaluate((element) => getComputedStyle(element).fontFamily);
  expect(sheetMono.replaceAll('"', "")).toMatch(/^JetBrains Mono/);
});

test("the Fine cut: section titles and row titles take the agreed values", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const read = (selector: string) =>
    page.locator(selector).first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { weight: style.fontWeight, tracking: Number.parseFloat(style.letterSpacing) / Number.parseFloat(style.fontSize), axes: style.fontVariationSettings };
    });
  const title = await read(".qi-title");
  expect(title.weight).toBe("620");
  expect(title.tracking).toBeCloseTo(-0.008, 3);
  const row = await read(".qi-row__title");
  expect(row.weight).toBe("570");
  expect(row.tracking).toBeCloseTo(-0.008, 3);
});

test("the bold lead-ins in prose take the section title's weight, and the skip link is on the type scale", async ({ page }) => {
  await page.goto("/work/bnp-paribas");
  await page.evaluate(() => document.fonts.ready);
  const weight = (selector: string) => page.locator(selector).first().evaluate((element) => getComputedStyle(element).fontWeight);
  expect(await weight(".qi-long__p strong")).toBe("620");
  expect(await page.locator(".skip-link").evaluate((element) => getComputedStyle(element).fontSize)).toBe("15px");
});

test("dotted words skip no ink", async ({ page }) => {
  // The homepage's opening lost its dotted words in #412; a Role story keeps them until #417.
  await page.goto("/work/bnp-paribas");
  await expect(page.locator(".qi-word").first()).toHaveCSS("text-decoration-skip-ink", "none");
});

test("dark mode smooths text to greyscale and light mode keeps the default", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.lights)).toBeTruthy();
  const smoothing = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("-webkit-font-smoothing"));
  expect(smoothing).toBe(/-dark$/.test(testInfo.project.name) ? "antialiased" : "auto");
});

test("homepage sections sit 80 px apart on a wide screen and 64 px on a phone", async ({ page }) => {
  await page.goto("/");
  const width = page.viewportSize()!.width;
  const padding = await page.locator("#main-content > section.stretch-section").first().evaluate((element) => getComputedStyle(element).paddingTop);
  expect(padding).toBe(width >= 820 ? "80px" : "64px");
});

test("a long-form page's sections sit 56 px apart", async ({ page }) => {
  await page.goto("/work/bnp-paribas");
  const margin = await page.locator(".qi-long__section").first().evaluate((element) => getComputedStyle(element).marginTop);
  expect(margin).toBe("56px");
});
