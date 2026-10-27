import { expect, test, type Page } from "@playwright/test";
import { opening } from "../src/content/stretch/opening";

const headline = opening.headline;

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
 * hover preview on an index row, London's time beside the greeting (shown on
 * hover or focus), and hidden, template or closed-dialog content.
 * It runs in the page, so it is self-contained.
 */
const findHeld = (): Sample => {
  const describe = (element: Element) => element.tagName.toLowerCase() + (element.className ? `.${String(element.className).split(" ")[0]}` : "");
  const held: string[] = [];
  for (const element of document.querySelectorAll("body *")) {
    if (element.closest("[hidden], dialog, noscript, template, [aria-hidden='true'], .stretch-index__shot, .qi-greeting__more")) continue;
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

    test("nothing is held once the page has hydrated either", async ({ page }) => {
      await page.goto("/");
      // The greeting names its time of day only once the browser's own clock has been read, which is when the page has hydrated.
      await expect(page.locator("[data-greeting]")).toHaveAttribute("data-greeting", /^(morning|afternoon|evening|late)$/);
      expect(flatten([await page.evaluate(findHeld)])).toEqual([]);
    });

    test("the real h1 is complete and visible as soon as the document commits", async ({ page }) => {
      await page.goto("/", { waitUntil: "commit" });
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();
      await expect(heading).toHaveAccessibleName(headline);
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
  // The tail's letters are separate elements (they lift on hover), so the sentences are read as text.
  const text = html.replace(/<[^>]+>/g, "");
  expect(text).toContain(opening.headline);
  expect(text).toContain(opening.support);
  expect(html).toContain(">Say hello</a>");
  expect(html).not.toMatch(/data-entering|data-entrance/);
});

// Without script nothing can hold or release the page, so each poll reads the document as it is; a CSS-only hold would show here.
for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test.describe(`with JavaScript blocked (motion ${reducedMotion})`, () => {
    test.use({ javaScriptEnabled: false, reducedMotion });

    test("the page is complete and nothing is faded", async ({ page }) => {
      await page.goto("/", { waitUntil: "commit" });
      await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(headline);
      await expect.poll(async () => flatten([await page.evaluate(findHeld)])).toEqual([]);
    });
  });
}
