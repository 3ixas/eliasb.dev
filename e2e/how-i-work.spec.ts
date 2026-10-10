import { expect, test, type Page } from "@playwright/test";
import { caseStudies } from "../src/content/stretch/case-studies";
import { howIWork } from "../src/content/stretch/how-i-work";
import { contrastOnPaper } from "./support/contrast";

const section = (page: Page) => page.locator("section#how-i-work");

test.describe("How I work", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("three beats, each habit with its proof, verbatim from the approved copy", async ({ page }) => {
    const beats = section(page).locator(".stretch-beat");
    await expect(beats).toHaveCount(3);
    for (const [index, beat] of howIWork.beats.entries()) {
      await expect(beats.nth(index).getByRole("heading", { level: 3 })).toHaveText(beat.habit);
      await expect(beats.nth(index).locator(".stretch-beat__proof")).toHaveText(beat.proof);
    }
  });

  test("the honest line and the PRD card with its caption are there", async ({ page }) => {
    await expect(section(page).locator(".stretch-honest")).toHaveText(howIWork.honestLine);
    const card = section(page).locator("figure.stretch-prd");
    await expect(card.locator("blockquote")).toHaveText(caseStudies.threshold.prd.quote);
    await expect(card.locator("figcaption")).toHaveText(howIWork.prdCaption);
    await expect(card.locator(".stretch-fastener")).toHaveCount(1);
    await expect(card.locator(".stretch-fastener")).toHaveAttribute("aria-hidden", "true");
  });

  test("it is in the server-rendered page", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(section(page).locator(".stretch-beat")).toHaveCount(3);
  });

  test("the beat numbers are decorative", async ({ page }) => {
    for (const number of await section(page).locator(".stretch-beat__number").all()) {
      await expect(number).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("text passes WCAG 2.2 AA contrast", async ({ page }) => {
    for (const selector of [".stretch-beat__habit", ".stretch-beat__proof", ".stretch-honest", ".stretch-prd__quote", ".stretch-prd__caption"]) {
      const readings = await contrastOnPaper(page, `#how-i-work ${selector}`);
      expect(readings.length, selector).toBeGreaterThan(0);
      for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("nothing in the section overflows, and the page does not scroll sideways", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    for (const selector of [".stretch-beat", ".stretch-prd", ".stretch-honest"]) {
      for (const box of await Promise.all((await section(page).locator(selector).all()).map((item) => item.boundingBox()))) {
        expect(box!.x, selector).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width, selector).toBeLessThanOrEqual(width);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("beats stack on phones, and sit beside the card on wide screens", async ({ page }) => {
    const beats = await section(page).locator(".stretch-beats").boundingBox();
    const card = await section(page).locator(".stretch-prd").boundingBox();
    if ((page.viewportSize()?.width ?? 0) < 761) expect(card!.y).toBeGreaterThan(beats!.y + beats!.height - 1);
    else expect(card!.x).toBeGreaterThan(beats!.x + beats!.width - 1);
  });
});
