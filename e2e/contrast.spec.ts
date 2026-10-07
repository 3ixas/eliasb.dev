import { expect, test } from "@playwright/test";
import { caseFileSlugs } from "../src/content/case-files";
import { renderedContrast } from "./support/rendered-contrast";

// The colours are the same in every engine, so this measures in Chromium only,
// at every width (layouts, and so the backgrounds behind text, change with it),
// by day and by night (the project's colour scheme sets the lights).
test.use({ reducedMotion: "reduce" });

const routes = ["/", "/work", ...caseFileSlugs.map((slug) => `/work/${slug}`), "/nothing-pinned-here"];

test.describe("Text contrast, measured from the rendered page", () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== "chromium", "Measured in Chromium");
  });

  for (const route of routes) {
    test(`every text run on ${route} meets WCAG 2.2 AA`, async ({ page }) => {
      await page.goto(route);
      const readings = await renderedContrast(page);
      expect(readings.length).toBeGreaterThan(5);
      // A blend mode on the text would make its reading meaningless.
      expect(readings.filter((reading) => reading.blended)).toEqual([]);
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });
  }
});
