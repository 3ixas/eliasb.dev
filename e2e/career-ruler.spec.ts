import { expect, test, type Page } from "@playwright/test";
import { careerLog } from "../src/content/stretch/career";
import { contrastOnPaper } from "./support/contrast";

const section = (page: Page) => page.locator("section#where-ive-been");
const stages = (page: Page) => section(page).locator(".stretch-stage");

test.describe("Where I've been", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("stages run oldest first with dates, role and organisation from the copy", async ({ page }) => {
    await expect(stages(page)).toHaveCount(careerLog.stages.length);
    for (const [index, stage] of careerLog.stages.entries()) {
      const item = stages(page).nth(index);
      await expect(item.locator(".stretch-stage__dates")).toHaveText(stage.dates);
      await expect(item.getByRole("heading", { level: 3 })).toHaveText(stage.role);
      const organisation = item.locator(".stretch-stage__org");
      if ((stage as { organisation?: string }).organisation) await expect(organisation).toHaveText((stage as { organisation: string }).organisation);
      else await expect(organisation).toHaveCount(0);
    }
  });

  test("only the isCurrent stage is the cobalt one", async ({ page }) => {
    const current = careerLog.stages.findIndex((stage) => stage.isCurrent);
    await expect(section(page).locator('.stretch-stage[data-current="true"]')).toHaveCount(1);
    await expect(stages(page).nth(current)).toHaveAttribute("data-current", "true");
    const cobalt = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--stretch-cobalt").trim());
    const colourOf = (index: number) => stages(page).nth(index).locator(".stretch-stage__role").evaluate((el) => getComputedStyle(el).color);
    const probe = await page.evaluate((value) => {
      const el = document.createElement("i");
      el.style.color = value;
      document.body.append(el);
      const resolved = getComputedStyle(el).color;
      el.remove();
      return resolved;
    }, cobalt);
    expect(await colourOf(current)).toBe(probe);
    expect(await colourOf(0)).not.toBe(probe);
  });

  test("notes show their optional when label, and milestones show text and when", async ({ page }) => {
    for (const [index, stage] of careerLog.stages.entries()) {
      const item = stages(page).nth(index);
      const notes = item.locator(".stretch-stage__notes > li");
      await expect(notes).toHaveCount(stage.notes.length);
      for (const [n, note] of stage.notes.entries()) {
        await expect(notes.nth(n)).toContainText(note.text);
        const when = notes.nth(n).locator(".stretch-stage__when");
        if ("when" in note && note.when) await expect(when).toHaveText(note.when);
        else await expect(when).toHaveCount(0);
      }
      const milestones = item.locator(".stretch-milestone");
      await expect(milestones).toHaveCount(stage.milestones.length);
      for (const [m, milestone] of stage.milestones.entries()) {
        await expect(milestones.nth(m)).toContainText(milestone.text);
        await expect(milestones.nth(m).locator(".stretch-stage__when")).toHaveText(milestone.when);
      }
    }
  });

  test("the markers are decorative", async ({ page }) => {
    for (const mark of await section(page).locator(".stretch-milestone__mark").all()) {
      await expect(mark).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("it is in the server-rendered page", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(stages(page)).toHaveCount(careerLog.stages.length);
  });

  test("text passes WCAG 2.2 AA contrast", async ({ page }) => {
    for (const selector of [".stretch-stage__dates", ".stretch-stage__role", ".stretch-stage__org", ".stretch-stage__notes li", ".stretch-stage__when", ".stretch-milestone"]) {
      const readings = await contrastOnPaper(page, `#where-ive-been ${selector}`);
      expect(readings.length, selector).toBeGreaterThan(0);
      for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("dates sit above the role on phones and beside it on wide screens, with no overflow", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    for (const item of await stages(page).all()) {
      const dates = (await item.locator(".stretch-stage__dates").boundingBox())!;
      const body = (await item.locator(".stretch-stage__body").boundingBox())!;
      if (width < 761) expect(body.y).toBeGreaterThan(dates.y + dates.height - 1);
      else expect(body.x).toBeGreaterThan(dates.x + dates.width - 1);
      for (const box of [dates, body]) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("no colleague names or internal system names appear in the BNP Paribas stage", async ({ page }) => {
    const text = (await stages(page).last().innerText()).toLowerCase();
    for (const banned of ["colleague", "manager", "reviewer"]) expect(text).not.toContain(banned);
  });
});
