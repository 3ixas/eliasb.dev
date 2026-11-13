import { readdirSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { roleStories } from "../src/content/stretch/role-stories";
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
          .replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/, "#$1$1$2$2$3$3")
          .replace(/^rgb\((\d+), (\d+), (\d+)\)$/, (_, r, g, b) => `#${[r, g, b].map((channel) => Number(channel).toString(16).padStart(2, "0")).join("")}`)
          .replace("rgba(0, 0, 0, 0)", "transparent"),
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

    test("every Employer's pass ink meets 4.5:1 on its field, and Optegra's hold the values chosen for them", () => {
      const channel = (hex: string, at: number) => {
        const c = parseInt(hex.slice(at, at + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (hex: string) => 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
      const ratio = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
      for (const [slug, story] of Object.entries(roleStories)) {
        const { field, ink } = story.colours[scheme];
        expect(ratio(ink, field), `${slug} ink on its field`).toBeGreaterThanOrEqual(4.5);
      }
      // docs/design/DESIGN.md "Finish": Optegra takes its logo's two teals, swapped by theme, so it stays apart from BNP Paribas's green at 44 px.
      const { field, ink } = roleStories.optegra.colours[scheme];
      expect(ratio(ink, field)).toBeCloseTo(scheme === "dark" ? 6.59 : 6.35, 2);
      expect(field).toBe(scheme === "dark" ? "#00aa90" : "#006765");
    });

    test("--sun is the greeting's amber, in the contract's two values", async ({ page }) => {
      // Read as a colour, because the theme controller registers it once script runs so that it can crossfade.
      const sun = await page.evaluate(() => {
        const probe = document.body.appendChild(document.createElement("i"));
        probe.style.color = "var(--sun)";
        const colour = getComputedStyle(probe).color;
        probe.remove();
        return colour;
      });
      expect(sun).toBe(scheme === "dark" ? "rgb(245, 184, 79)" : "rgb(227, 154, 45)");
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

// DESIGN.md: --sun is the greeting's amber and nothing else, an illustration colour and never an interface colour.
test("--sun is read only by the lamp's bulb and pool and the clock's pivot", () => {
  const readers: string[] = [];
  for (const file of readdirSync("src/app").filter((name) => name.endsWith(".css"))) {
    let selector = "";
    for (const line of readFileSync(`src/app/${file}`, "utf8").split("\n")) {
      if (line.endsWith("{") && !line.trimStart().startsWith("@")) selector = line.slice(0, -1).trim();
      if (line.includes("var(--sun)")) readers.push(`${file} ${selector}`);
    }
  }
  expect(readers.sort()).toEqual(["shell.css .scene__lit", "shell.css .scene__pool"]);
});
