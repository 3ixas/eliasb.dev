import { readdirSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { renderedContrast } from "./support/rendered-contrast";

// The passes and panels tokens (src/app/tokens.css; docs/design/DESIGN.md "Tokens" and "Type"), on
// /fixtures/tokens. The successor of stretch-tokens.spec.ts (retired with the quiet index in #420); it once kept checking the quiet index's
// set until #420 removes it.

type Scheme = "light" | "dark";

/** DESIGN.md's table, as the browser computes each colour. */
const colours: Record<Scheme, Record<string, string>> = {
  light: {
    page: "rgb(238, 237, 233)",
    paper: "rgb(251, 251, 249)",
    ink: "rgb(20, 20, 22)",
    muted: "rgb(95, 94, 90)",
    hair: "rgba(20, 20, 22, 0.14)",
    tint: "rgba(20, 20, 22, 0.05)",
    cobalt: "rgb(36, 67, 214)",
    green: "rgb(0, 150, 94)",
    "year-0": "rgba(20, 20, 22, 0.05)",
    "year-1": "rgb(168, 230, 196)",
    "year-2": "rgb(95, 207, 152)",
    "year-3": "rgb(31, 174, 112)",
    "year-4": "rgb(0, 128, 79)",
  },
  dark: {
    page: "rgb(13, 13, 15)",
    paper: "rgb(25, 25, 28)",
    ink: "rgb(240, 239, 235)",
    muted: "rgb(163, 162, 156)",
    hair: "rgba(240, 239, 235, 0.16)",
    tint: "rgba(240, 239, 235, 0.07)",
    cobalt: "rgb(140, 158, 255)",
    green: "rgb(62, 207, 142)",
    "year-0": "rgba(240, 239, 235, 0.07)",
    "year-1": "rgb(30, 92, 66)",
    "year-2": "rgb(35, 132, 90)",
    "year-3": "rgb(47, 176, 120)",
    "year-4": "rgb(70, 217, 150)",
  },
};

/** Each colour token as the browser resolves it, read through a probe so that registered and unregistered values compare alike. */
const readColours = (page: Page) =>
  page.evaluate((names) => {
    const probe = document.body.appendChild(document.createElement("i"));
    const read = Object.fromEntries(
      names.map((name) => {
        probe.style.color = `var(--${name})`;
        return [name, getComputedStyle(probe).color];
      }),
    );
    probe.remove();
    return read;
  }, Object.keys(colours.light));

/** DESIGN.md "Type": the scale's sizes at a given viewport width. */
const clamp = (least: number, vw: number, most: number, width: number) => Math.min(most, Math.max(least, (vw / 100) * width));
const scale = (width: number): Record<string, number> => ({
  opening: clamp(36, 3.7, 54, width),
  title: clamp(52, 7, 104, width),
  section: clamp(36, 3.6, 52, width),
  panel: clamp(30, 3, 42, width),
  figure: clamp(88, 9.6, 140, width),
  prose: width < 720 ? 19 : 20,
  row: 22,
  link: 19,
  body: 16,
  ui: 15,
  small: 14.5,
  label: 13,
});

test.describe("Colours", () => {
  // The colours are the same in every engine and at every width, so this runs once and drives both schemes itself.
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-1440-light", "Measured once, in Chromium");
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`the ${scheme} tokens match DESIGN.md`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/fixtures/tokens");
      expect(await readColours(page)).toEqual(colours[scheme]);
    });
  }

  test("a remembered choice beats the device setting, in both directions", async ({ page }) => {
    for (const [device, chosen] of [["light", "dark"], ["dark", "light"]] as const) {
      await page.emulateMedia({ colorScheme: device });
      await page.goto("/fixtures/tokens");
      await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), chosen);
      expect(await readColours(page), `${chosen} chosen on a ${device} device`).toEqual(colours[chosen]);
    }
  });

  test("the lights the controller sets choose the palette when nothing is remembered", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/fixtures/tokens");
    await page.evaluate(() => (document.documentElement.dataset.lights = "on"));
    expect(await readColours(page)).toEqual(colours.dark);
  });
});

test.describe("Text", () => {
  test.use({ reducedMotion: "reduce" });

  test("every text run on the fixture meets WCAG 2.2 AA, measured on the rendered page", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Measured in Chromium");
    await page.goto("/fixtures/tokens");
    const readings = await renderedContrast(page);
    // Six pairs, twelve type samples and their labels, and the swatches' names.
    expect(readings.length).toBeGreaterThanOrEqual(30);
    expect(readings.filter((reading) => reading.blended)).toEqual([]);
    expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
  });

  test("each step of the type scale is its DESIGN.md size at this width, and nothing is under 13 px", async ({ page }) => {
    await page.goto("/fixtures/tokens");
    const width = page.viewportSize()!.width;
    const sizes = await page.evaluate(() =>
      Object.fromEntries([...document.querySelectorAll<HTMLElement>("[data-type]")].map((element) => [element.dataset.type, Number.parseFloat(getComputedStyle(element).fontSize)])),
    );
    const expected = scale(width);
    expect(Object.keys(sizes)).toEqual(Object.keys(expected));
    for (const [step, size] of Object.entries(expected)) expect(sizes[step], step).toBeCloseTo(size, 1);

    const smallest = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.querySelector("main")!, NodeFilter.SHOW_TEXT);
      let least = Infinity;
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.textContent?.trim()) least = Math.min(least, Number.parseFloat(getComputedStyle(node.parentElement!).fontSize));
      }
      return least;
    });
    expect(smallest).toBeGreaterThanOrEqual(13);
  });

  test("the fixture does not scroll sideways", async ({ page }) => {
    await page.goto("/fixtures/tokens");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
});

// DESIGN.md: --sun is the greeting's amber and nothing else, an illustration colour and never an interface colour.
test("--sun is read only by the lamp's bulb and pool", () => {
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
