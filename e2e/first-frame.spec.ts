import { expect, test, type Page } from "@playwright/test";
import { hero } from "../src/content/stretch/site-copy";

const headline = `${hero.headline.lead} ${hero.headline.emphasis}`;

type Sample = { held: string[]; marked: string[] };

declare global {
  interface Window {
    firstFrame?: Sample[];
  }
}

/**
 * Lists every element a visitor would see that is faded or hidden, and every
 * hold mark left on the document. It skips what is meant to be out of sight
 * until asked for: aria-hidden decoration (the mini marks, a row's arrow), the
 * hover preview on an index row, and hidden, template or closed-dialog content.
 * It runs in the page, so it is self-contained.
 */
const findHeld = (): Sample => {
  const describe = (element: Element) => element.tagName.toLowerCase() + (element.className ? `.${String(element.className).split(" ")[0]}` : "");
  const held: string[] = [];
  for (const element of document.querySelectorAll("body *")) {
    if (element.closest("[hidden], dialog, noscript, template, [aria-hidden='true'], .stretch-index__shot")) continue;
    const style = getComputedStyle(element);
    if (style.display === "none") continue;
    if (Number(style.opacity) < 1 || style.visibility === "hidden") held.push(describe(element));
  }
  const marked = [...document.querySelectorAll("[data-entrance], [data-entrance-layer]")].map(describe);
  if (document.documentElement.hasAttribute("data-entering")) marked.push("html[data-entering]");
  return { held, marked };
};

/**
 * Before any page script runs, samples the homepage at DOMContentLoaded and on
 * the next two animation frames. Reading once after load would miss a hold that
 * had already released.
 */
const sampleFirstFrames = (page: Page) =>
  page.addInitScript({
    content: `(() => {
      const find = ${findHeld.toString()};
      const sample = () => (window.firstFrame = window.firstFrame || []).push(find());
      document.addEventListener("DOMContentLoaded", () => {
        sample();
        requestAnimationFrame(() => {
          sample();
          requestAnimationFrame(sample);
        });
      });
    })();`,
  });

const sampled = (page: Page) => expect.poll(() => page.evaluate(() => window.firstFrame?.length ?? 0)).toBe(3);
const flatten = (frames: Sample[]) => frames.flatMap(({ held, marked }) => [...held, ...marked]);

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test.describe(`The homepage's first frame (motion ${reducedMotion})`, () => {
    test.use({ reducedMotion });

    test("nothing is hidden, faded or held in the first frames of a fresh load", async ({ page }) => {
      await sampleFirstFrames(page);
      await page.goto("/");
      await sampled(page);
      expect(flatten(await page.evaluate(() => window.firstFrame!))).toEqual([]);
    });

    test("the page is readable and usable at once, and the real h1 is complete", async ({ page }) => {
      await page.goto("/", { waitUntil: "commit" });
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();
      await expect(heading).toHaveAccessibleName(headline);
      await expect(page.locator("main")).toHaveCSS("opacity", "1");
      await expect(page.getByRole("link", { name: "Say hello" }).first()).toBeVisible();
    });

    test("a reload is as complete as the first load", async ({ page }) => {
      await page.goto("/");
      await sampleFirstFrames(page);
      await page.reload();
      await sampled(page);
      expect(flatten(await page.evaluate(() => window.firstFrame!))).toEqual([]);
    });
  });
}

test("the content is in the server HTML, and the document starts unheld", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain(hero.headline.lead);
  expect(html).toContain(hero.headline.emphasis);
  expect(html).toContain(hero.support);
  expect(html).toContain(">Say hello</a>");
  expect(html).not.toMatch(/data-entering|data-entrance/);
});

test.describe("with JavaScript blocked", () => {
  test.use({ javaScriptEnabled: false });

  test("the page is complete and nothing is faded", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(headline);
    expect(flatten([await page.evaluate(findHeld)])).toEqual([]);
  });
});
