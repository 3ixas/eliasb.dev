import { expect, test, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";

// The tokens are the same in every engine and at every width, so this runs once
// and drives both schemes itself.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440-light", "Measured once, in Chromium");
});

type Scheme = "light" | "dark";

// docs/specs/STRETCH-REDESIGN-SPEC.md, "Design tokens".
const tokens: Record<Scheme, Record<string, string>> = {
  light: {
    page: "#fbfbf8",
    ink: "#111114",
    muted: "#5a5a63",
    rule: "#dcdcd6",
    card: "#f0f0ea",
    cobalt: "#2340ff",
    "on-cobalt": "#ffffff",
    "tile-edge": "transparent",
  },
  dark: {
    page: "#0d0d12",
    ink: "#f1f1f4",
    muted: "#a2a2ad",
    rule: "#2a2a33",
    card: "#17171f",
    cobalt: "#8b9cff",
    "on-cobalt": "#0d0d12",
    "tile-edge": "#2a2a33",
  },
};

const textPairs = [
  "ink-on-page",
  "muted-on-page",
  "cobalt-on-page",
  "ink-on-card",
  "muted-on-card",
  "cobalt-on-card",
  "on-cobalt-on-cobalt",
];

const readTokens = (page: Page) =>
  page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(
      ["page", "ink", "muted", "rule", "card", "cobalt", "on-cobalt", "tile-edge"].map((name) => [
        name,
        // The CSS minifier may shorten #ffffff to #fff; it is the same colour.
        style
          .getPropertyValue(`--stretch-${name}`)
          .trim()
          .toLowerCase()
          .replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/, "#$1$1$2$2$3$3"),
      ]),
    );
  });

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/fixtures/stretch-tokens");
    });

    test("the tokens match the spec table", async ({ page }) => {
      expect(await readTokens(page)).toEqual(tokens[scheme]);
    });

    test("every text pair meets WCAG 2.2 AA (4.5:1) on its surface", async ({ page }) => {
      for (const pair of textPairs) {
        const [reading] = await contrastOnPaper(page, `[data-pair='${pair}']`);
        expect(reading.ratio, pair).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("tiles keep the edge the spec gives them", async ({ page }) => {
      const border = await page.locator("[data-tile-edge]").evaluate((element) => getComputedStyle(element).borderTopColor);
      expect(border).toBe(scheme === "dark" ? "rgb(42, 42, 51)" : "rgba(0, 0, 0, 0)");
    });
  });
}

test("a remembered choice beats the device setting, in both directions", async ({ page }) => {
  for (const [device, chosen] of [["light", "dark"], ["dark", "light"]] as const) {
    await page.emulateMedia({ colorScheme: device });
    await page.goto("/fixtures/stretch-tokens");
    await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), chosen);
    expect(await readTokens(page), `${chosen} chosen on a ${device} device`).toEqual(tokens[chosen]);
  }
});
