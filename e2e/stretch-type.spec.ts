import { expect, test } from "@playwright/test";

// Fonts and their metrics are the same at every width and in both schemes, so
// this runs once, in each engine the suite covers.
test.beforeEach(({}, testInfo) => {
  test.skip(!/-1440-light$/.test(testInfo.project.name), "Measured once per engine");
});

const routes = ["/", "/work", "/work/threshold", "/nothing-pinned-here"];

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
    expect(loaded.filter((family) => /newsreader|hanken/i.test(family))).toEqual([]);
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
  expect(readings.mono.family.replaceAll('"', "")).toMatch(/JetBrains Mono/);
});
