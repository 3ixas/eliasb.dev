import { expect, test, type Page } from "@playwright/test";
import { TEXT_LIMITS } from "../src/content/stretch/story";

// R-35: the worst plausible value for each printed field, plus empty, one and huge, rendered by the real parts on
// /fixtures/worst-case (which exists only with BOARD_FIXTURES=1). Each project of the matrix is a width and a theme, so
// 320 px, the widest layout and dark are covered by running it; 200% zoom of a 1280 px window is the second test.

const fixture = "/fixtures/worst-case";

async function open(page: Page) {
  await page.goto(fixture);
  for (const family of ["Newsreader", "Instrument Sans"]) {
    await expect
      .poll(() => page.evaluate((name) => [...document.fonts].some((face) => face.family.replaceAll('"', "") === name && face.status === "loaded"), family), { message: `${family} loaded` })
      .toBe(true);
  }
}

/** Anything that reaches past the page's right edge, or past its own panel's, named by its class and text. */
async function overflows(page: Page) {
  return page.evaluate(() => {
    const edge = document.documentElement.clientWidth;
    const out: string[] = [];
    for (const element of document.querySelectorAll<HTMLElement>("[data-case] *, [data-case]")) {
      if (element.closest(".sr-only") || element.classList.contains("sr-only")) continue;
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      const name = `${(element.getAttribute("class") ?? element.tagName).slice(0, 30)} "${(element.textContent ?? "").trim().slice(0, 24)}"`;
      if (box.right > edge + 1) out.push(`${name} ends at ${Math.round(box.right)}, past the page's ${edge}`);
      const panel = element.closest<HTMLElement>(".panel, .pass__card");
      if (panel && panel !== element && !element.closest(".project__shot")) {
        const inside = panel.getBoundingClientRect();
        if (box.right > inside.right + 1 && getComputedStyle(element).position !== "absolute") out.push(`${name} ends at ${Math.round(box.right)}, past its panel's ${Math.round(inside.right)}`);
      }
    }
    return out;
  });
}

test.describe("Worst-case data", () => {
  test("no value reaches past the page or its own panel", async ({ page }) => {
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(await overflows(page)).toEqual([]);
  });

  test("the same at 200% zoom of a 1280 px window", async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 900 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(await overflows(page)).toEqual([]);
  });

  test("a pass band holds a name at its limit in two lines, and ends a longer one with an ellipsis", async ({ page }) => {
    await open(page);
    const names = page.locator(".pass__band span");
    expect(await names.count()).toBe(4);
    const read = (index: number) =>
      names.nth(index).evaluate((element) => {
        const style = getComputedStyle(element);
        const line = Number.parseFloat(style.lineHeight);
        return { lines: Math.round((element.clientHeight - Number.parseFloat(style.paddingBottom)) / line), cut: element.scrollHeight > element.clientHeight + 1, text: element.textContent!.length };
      });
    const limit = await read(0);
    expect(limit.text).toBe(TEXT_LIMITS.passName);
    expect(limit.lines).toBeLessThanOrEqual(2);
    expect(limit.cut, "a name at the limit is not cut").toBe(false);
    for (const index of [1, 2]) expect((await read(index)).lines, `pass ${index}`).toBeLessThanOrEqual(2);
    expect((await read(1)).cut, "a longer name is cut to two lines").toBe(true);
  });

  test("a figure at its limit stays on one line", async ({ page }) => {
    await open(page);
    for (const value of await page.locator("[data-case=figures] b, [data-case=projects] .project__figures b").all()) {
      expect((await value.boundingBox())!.height, (await value.textContent()) ?? "").toBeLessThan(46 * 1.3);
    }
  });

  test("a name at its limit still fits, and an unbroken one breaks inside its panel", async ({ page }) => {
    await open(page);
    expect(TEXT_LIMITS.name).toBe(60);
    for (const heading of await page.locator("[data-case=heads] .panel__name, [data-case=projects] .project__name, [data-case=next] .next-panel__name").all()) {
      const fits = await heading.evaluate((element) => {
        const panel = element.closest<HTMLElement>(".panel")!.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        return box.left >= panel.left - 1 && box.right <= panel.right + 1;
      });
      expect(fits, (await heading.textContent()) ?? "").toBe(true);
    }
  });

  test("an empty value leaves the part its padding and the figures list its place", async ({ page }) => {
    await open(page);
    for (const panel of await page.locator("[data-case=heads] .panel").all()) {
      expect((await panel.boundingBox())!.height).toBeGreaterThan(40);
    }
    expect(await page.locator("[data-case=figures] .story-figures").count()).toBe(3);
  });
});
