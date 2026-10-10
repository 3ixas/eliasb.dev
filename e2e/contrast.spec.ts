import { expect, test } from "@playwright/test";
import { caseStudies } from "../src/content/stretch/case-studies";
import { focusContrast, minimumChanged, minimumShare, type FocusReading } from "./support/focus-contrast";
import { renderedContrast } from "./support/rendered-contrast";

// The colours are the same in every engine, so this measures in Chromium only,
// at every width (layouts, and so the backgrounds behind text, change with it),
// by day and by night (the project's colour scheme sets the lights).
test.use({ reducedMotion: "reduce" });

const routes = ["/", "/work", ...Object.keys(caseStudies).map((slug) => `/work/${slug}`), "/nothing-pinned-here"];

test.describe("Contrast, measured from the rendered page", () => {
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

    test(`every focus ring on ${route} stands out at 3:1`, async ({ page }) => {
      await page.goto(route);
      const { readings, complete } = await focusContrast(page);
      expect(complete, "tabbed all the way round").toBe(true);
      expect(readings.length).toBeGreaterThan(3);
      expect(weakRings(readings)).toEqual([]);
    });
  }
});

/** An indicator that changes nothing is invisible; one that does must contrast. */
const weakRings = (readings: FocusReading[]) =>
  readings.filter((reading) => reading.changed < minimumChanged || reading.contrasting < minimumShare);
