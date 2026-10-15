import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { hero } from "../src/content/stretch/site-copy";
import { work } from "../src/content/stretch/work";
import { contrastOnPaper } from "./support/contrast";

const section = (page: Page) => page.locator("section#work");

test.describe("Work", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Now names the role and carries its three proofs, ending on the BNP Paribas story", async ({ page }) => {
    const now = section(page).getByRole("article", { name: work.now.heading });
    await expect(now.getByRole("heading", { level: 3 })).toHaveText(work.now.heading);
    await expect(now).toContainText([work.now.role, work.now.organisation, work.now.dates].join(" · "));
    await expect(now.getByRole("listitem")).toHaveText(work.now.proofs);
    await expect(now.getByRole("link", { name: work.now.link.label })).toHaveAttribute("href", "/work/bnp-paribas");
  });

  test("Where I'm headed has its line and three strands, each with one proof and its link", async ({ page }) => {
    const headed = section(page).getByRole("article", { name: work.headed.heading });
    await expect(headed.locator(".stretch-work__line")).toHaveText(work.headed.line);
    const strands = headed.getByRole("listitem");
    await expect(strands).toHaveCount(3);
    for (const [index, strand] of work.headed.strands.entries()) {
      const item = strands.nth(index);
      await expect(item.locator(".stretch-work__strand")).toHaveText(strand.title);
      await expect(item.locator(".stretch-work__proof")).toHaveText(strand.proof);
      await expect(item.getByRole("link")).toHaveText(strand.link.label);
      await expect(item.getByRole("link")).toHaveAttribute("href", strand.link.href);
    }
    expect(work.headed.strands.map((strand) => strand.link.href)).toEqual(["/work/bnp-paribas", "#things-i-make", "/work/bnp-paribas"]);
  });

  test("How I got here runs newest first: whole-row links to the Role stories, and History with no link", async ({ page }) => {
    const part = section(page).getByRole("article", { name: work.gotHere.heading });
    await expect(part.locator(".stretch-work__note")).toHaveText(work.gotHere.note);
    const rows = part.locator(".stretch-work__row");
    await expect(rows).toHaveCount(3);
    for (const [index, row] of work.gotHere.rows.entries()) {
      const item = rows.nth(index);
      await expect(item.locator(".stretch-work__dates")).toHaveText(row.dates);
      await expect(item.locator(".stretch-work__name")).toHaveText(row.role);
      await expect(item.locator(".stretch-work__outcome")).toHaveText(row.note);
      if (row.organisation) await expect(item.locator(".stretch-work__org")).toHaveText(row.organisation);
      if (row.story) {
        // The row is the link: its whole box is the target.
        const link = item.getByRole("link");
        await expect(link).toHaveCount(1);
        await expect(link).toHaveAttribute("href", `/work/${row.story}`);
        const [rowBox, linkBox] = await Promise.all([item.boundingBox(), link.boundingBox()]);
        expect(linkBox!.width).toBeCloseTo(rowBox!.width, 0);
        expect(linkBox!.height).toBeGreaterThanOrEqual(44);
      } else {
        await expect(item.getByRole("link")).toHaveCount(0);
        await expect(item.locator(".stretch-work__arrow")).toHaveCount(0);
      }
    }
  });

  test("a row opens its Role story", async ({ page }) => {
    await section(page).getByRole("link", { name: new RegExp(work.gotHere.rows[1].role) }).click();
    await expect(page).toHaveURL(/\/work\/optegra$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(work.gotHere.rows[1].organisation!);
  });

  test("the Things I make strand scrolls to that section", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await section(page).getByRole("link", { name: work.headed.strands[1].link.label }).click();
    await expect(page).toHaveURL(/#things-i-make$/);
    await expect(page.locator("#things-i-make h2")).toBeInViewport();
  });

  test("a Role story's ← Work lands on this section, below the header", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/bnp-paribas");
    await page.getByRole("region", { name: "Overview" }).getByRole("link", { name: "Work", exact: true }).click();
    await expect(page).toHaveURL(/\/#work$/);
    const headerBottom = await page.locator("[data-stretch-header]").evaluate((header) => header.getBoundingClientRect().bottom);
    const top = await page.locator("#work h2").evaluate((element) => element.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(headerBottom - 1);
  });

  test("it does not repeat the First glance's wording", async ({ page }) => {
    const text = (await section(page).innerText()).replace(/\s+/g, " ");
    for (const phrase of [hero.support, hero.headline.lead, "Early Careers", "Take Ownership", "C# and Java", "on CPU and GPU"]) {
      expect(text, phrase).not.toContain(phrase);
    }
  });

  test("no link anywhere points at the retired anchor, and every in-page anchor exists", async ({ page }) => {
    const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
    expect(hrefs.filter((href) => href.includes("where-ive-been"))).toEqual([]);
    await expect(page.locator("#where-ive-been")).toHaveCount(0);
    for (const href of hrefs.filter((href) => href.startsWith("#") && href.length > 1)) {
      await expect(page.locator(`[id="${href.slice(1)}"]`), href).toHaveCount(1);
    }
  });

  test("it is in the server-rendered page", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(section(page).getByRole("link")).toHaveCount(1 + work.headed.strands.length + work.gotHere.rows.filter((row) => row.story).length);
    await expect(section(page)).toContainText(work.now.proofs[0]);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`text passes WCAG 2.2 AA contrast (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      for (const selector of [".stretch-work__h3", ".stretch-work__role", ".stretch-work__proofs li", ".stretch-work__line", ".stretch-work__strand", ".stretch-work__proof", ".stretch-work__link", ".stretch-work__note", ".stretch-work__dates", ".stretch-work__name", ".stretch-work__outcome", ".stretch-work__org"]) {
        const readings = await contrastOnPaper(page, `#work ${selector}`);
        expect(readings.length, selector).toBeGreaterThan(0);
        for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test(`has no axe violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      const results = await new AxeBuilder({ page }).include("#work").analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("it fits the screen, and every link is at least 44 px tall", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const width = page.viewportSize()?.width ?? 0;
    for (const box of await Promise.all((await section(page).locator("*").all()).map((item) => item.boundingBox()))) {
      if (box) expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    }
    for (const link of await section(page).getByRole("link").all()) {
      expect((await link.boundingBox())!.height, (await link.textContent()) ?? "").toBeGreaterThanOrEqual(44);
    }
  });
});
