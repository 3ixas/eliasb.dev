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

  test("the PRD card and its caption are there", async ({ page }) => {
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
    for (const selector of [".stretch-beat__habit", ".stretch-beat__proof", ".stretch-prd__quote", ".stretch-prd__caption"]) {
      const readings = await contrastOnPaper(page, `#how-i-work ${selector}`);
      expect(readings.length, selector).toBeGreaterThan(0);
      for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("nothing in the section overflows, and the page does not scroll sideways", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    for (const selector of [".stretch-beat", ".stretch-prd"]) {
      for (const box of await Promise.all((await section(page).locator(selector).all()).map((item) => item.boundingBox()))) {
        expect(box!.x, selector).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width, selector).toBeLessThanOrEqual(width);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("the margin notes are there: a circled number, an arrow to the next habit, and a line under each proof's phrase", async ({ page }) => {
    const beats = section(page).locator(".stretch-beat");
    await expect(section(page).locator(".stretch-ink--circle")).toHaveCount(3);
    await expect(section(page).locator(".stretch-ink--next")).toHaveCount(2);
    await expect(section(page).locator(".stretch-ink--under")).toHaveCount(3);
    for (const [index, phrase] of ["no clear idea", "57 user stories", "under 5"].entries()) {
      await expect(beats.nth(index).locator(".stretch-beat__number .stretch-ink--circle")).toHaveCount(1);
      await expect(beats.nth(index).locator(".stretch-mark")).toHaveText(phrase);
      await expect(beats.nth(index).locator(".stretch-mark .stretch-ink--under")).toHaveCount(1);
    }
    for (const stroke of await section(page).locator(".stretch-ink").all()) await expect(stroke).toHaveAttribute("aria-hidden", "true");
    // Dashes measure in pathLength units; a non-scaling stroke would measure them in pixels.
    for (const path of await section(page).locator(".stretch-ink path").all()) {
      await expect(path).toHaveAttribute("pathLength", "1");
      expect(await path.evaluate((element) => getComputedStyle(element).vectorEffect)).toBe("none");
    }
  });

  test("the arrow to the PRD card is on wide screens and gone on phones", async ({ page }) => {
    const arrow = section(page).locator(".stretch-ink--to-prd");
    await expect(arrow).toHaveCount(1);
    if ((page.viewportSize()?.width ?? 0) < 761) return expect(arrow).toBeHidden();
    await expect(arrow).toBeVisible();
    await expect
      .poll(async () => {
        const from = (await arrow.boundingBox())!;
        const card = (await section(page).locator(".stretch-prd").boundingBox())!;
        // The arrow ends at the card, not past it, and reaches down to it.
        return from.x + from.width <= card.x + 1 && from.y + from.height > card.y;
      })
      .toBe(true);
  });

  test.describe("the PRD card holds still", () => {
    test.use({ reducedMotion: "no-preference" });

    test("its transform is the same wherever the section is scrolled, at its own tilt", async ({ page }) => {
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
      const card = section(page).locator("figure.stretch-prd");
      const pose = () => card.evaluate((element) => ({ transform: getComputedStyle(element).transform, rotate: getComputedStyle(element).rotate, translate: getComputedStyle(element).translate }));
      await card.scrollIntoViewIfNeeded();
      const resting = await pose();
      expect(resting.rotate).toBe("none");
      expect(resting.translate).toBe("none");
      // rotate(-1deg) as a matrix: sin(-1deg) is negative.
      expect(Number(resting.transform.match(/matrix\(([^,]+), ([^,]+)/)?.[2])).toBeCloseTo(-0.01745, 4);
      for (const at of [0.95, 0.5, 0.1]) {
        await card.evaluate((element, down) => {
          const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
          const { top, height } = element.getBoundingClientRect();
          scrollBy(0, top + height / 2 - (padding + (innerHeight - padding) * down));
        }, at);
        await expect.poll(pose).toEqual(resting);
      }
    });
  });

  test("beats stack on phones, and sit beside the card on wide screens", async ({ page }) => {
    const beats = await section(page).locator(".stretch-beats").boundingBox();
    const card = await section(page).locator(".stretch-prd").boundingBox();
    if ((page.viewportSize()?.width ?? 0) < 761) expect(card!.y).toBeGreaterThan(beats!.y + beats!.height - 1);
    else expect(card!.x).toBeGreaterThan(beats!.x + beats!.width - 1);
  });
});
