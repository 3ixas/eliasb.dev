import { expect, test } from "@playwright/test";
import { caseStudies } from "../src/content/stretch/case-studies";
import { work } from "../src/content/stretch/work";
import { focusContrast, minimumChanged, minimumShare, type FocusReading } from "./support/focus-contrast";
import { renderedContrast } from "./support/rendered-contrast";

// The colours are the same in every engine, so this measures in Chromium only,
// at every width (layouts, and so the backgrounds behind text, change with it),
// by day and by night (the project's colour scheme sets the lights).
test.use({ reducedMotion: "reduce" });

const currentProofs = work.rail.flatMap((pass) => (pass.state === "current" ? pass.proofs : []));
const routes = ["/", "/resume", "/things-i-make", ...Object.keys(caseStudies).map((slug) => `/things-i-make/${slug}`), "/nothing-pinned-here"];
/** Pages that are not the site's own routes but must meet the same bar: every state of the Staff pass. */
const fixtureRoutes = ["/fixtures/staff-pass"];
/** Fewest text runs a page shows; the 404 has five now that the theme button carries no text, and the Staff pass fixture dozens. */
const minimumRuns = (route: string) => (route === "/nothing-pinned-here" ? 5 : fixtureRoutes.includes(route) ? 30 : 6);

test.describe("Contrast, measured from the rendered page", () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== "chromium", "Measured in Chromium");
  });

  for (const route of [...routes, ...fixtureRoutes]) {
    test(`every text run on ${route} meets WCAG 2.2 AA`, async ({ page }) => {
      await page.goto(route);
      const readings = await renderedContrast(page);
      expect(readings.length).toBeGreaterThanOrEqual(minimumRuns(route));
      // A blend mode on the text would make its reading meaningless.
      expect(readings.filter((reading) => reading.blended)).toEqual([]);
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });
  }

  test("Work's passes, pins and History are among the text measured on /", async ({ page }) => {
    await page.goto("/");
    const readings = await renderedContrast(page);
    // A long run is recorded by its opening words, so match each long line by its first 30 characters.
    const normal = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim();
    const measured = normal(readings.map((reading) => reading.text).join(" "));
    const targets = [...currentProofs.map((proof) => proof.slice(0, 30)), "Valid · present", "Returned", "Take Ownership", "Q1 2026", "AI Champion", "The Joveen story", "The Optegra story", work.history.note.slice(0, 30), work.headed.line.slice(0, 30), ...work.headed.bars.flatMap((bar) => [bar.title.slice(0, 30), bar.soFar.text.slice(0, 30)])];
    for (const text of targets) expect(measured, `"${text}" is measured`).toContain(normal(text));
    const ofTargets = readings.filter((reading) => targets.some((text) => normal(reading.text).includes(normal(text)) || normal(text).includes(normal(reading.text))));
    expect(ofTargets.length).toBeGreaterThan(targets.length);
    expect(ofTargets.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
  });

  for (const route of routes) {
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
