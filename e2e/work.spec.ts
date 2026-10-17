import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { roleStories } from "../src/content/stretch/role-stories";
import { hero } from "../src/content/stretch/site-copy";
import { passLinkLabel, passRecords, passStatus } from "../src/content/stretch/staff-pass";
import { shownLink, work } from "../src/content/stretch/work";
import { contrastOnPaper } from "./support/contrast";

const currentProofs = work.rail.flatMap((pass) => (pass.state === "current" ? pass.proofs : []));
const section = (page: Page) => page.locator("section#work");
const rail = (page: Page) => section(page).locator(".stretch-work__rail");
const slugs = ["bnp-paribas", "joveen", "optegra"] as const;
const pass = (page: Page, slug: (typeof slugs)[number]) => section(page).locator(`[data-slug="${slug}"] .stretch-pass`);
const history = (page: Page) => section(page).locator(".stretch-work__history");
/** A locator's box, which the test needs whole. */
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
const viewportWidth = (page: Page) => page.viewportSize()?.width ?? 0;

test.describe("Work", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("three Staff passes hang from the rail, newest first, each with its fields in order", async ({ page }) => {
    await expect(section(page).locator(".stretch-pass")).toHaveCount(3);
    expect(await section(page).locator(".stretch-pass").evaluateAll((all) => all.map((element) => element.closest("[data-slug]")?.getAttribute("data-slug")))).toEqual([...slugs]);
    for (const slug of slugs) {
      const story = roleStories[slug];
      const record = passRecords[slug];
      const shown = await pass(page, slug).locator(".stretch-pass__card").evaluate((card) => card.textContent ?? "");
      const fields = [`Staff · ${story.number}`, passStatus(story, slug === "bnp-paribas" ? "current" : "returned"), record.short, story.role, story.dates, record.headline.value, record.headline.label, passLinkLabel(record)];
      const positions = fields.map((field) => shown.indexOf(field));
      expect(positions, `${slug} shows every field: ${fields.join(" | ")}`).not.toContain(-1);
      expect(positions, `${slug} shows them in this order`).toEqual([...positions].sort((a, b) => a - b));
    }
    await expect(pass(page, "bnp-paribas").locator(".stretch-pass__status")).toHaveText("Valid · present");
    const [current, joveen, optegra] = await Promise.all(slugs.map(async (slug) => boxOf(pass(page, slug))));
    for (const past of [joveen, optegra]) {
      expect(current.width, "the current pass is the widest").toBeGreaterThan(past.width);
      expect(current.height, "and the tallest").toBeGreaterThan(past.height);
    }
  });

  test("the current pass keeps the two proofs its headline does not already state", async ({ page }) => {
    await expect(pass(page, "bnp-paribas").locator(".stretch-pass__proofs li")).toHaveText(currentProofs);
    for (const slug of ["joveen", "optegra"] as const) await expect(pass(page, slug).locator(".stretch-pass__proofs")).toHaveCount(0);
  });

  test("Joveen's and Optegra's passes say Returned, and BNP's does not", async ({ page }) => {
    for (const slug of ["joveen", "optegra"] as const) {
      await expect(pass(page, slug).locator(".stretch-pass__stamp")).toHaveText("Returned");
      await expect(pass(page, slug)).not.toContainText(/expired/i);
    }
    await expect(pass(page, "bnp-paribas").locator(".stretch-pass__stamp")).toHaveCount(0);
  });

  test("each pass is one link to its Role story, and the past passes' straps differ in length", async ({ page }) => {
    for (const slug of slugs) {
      await expect(pass(page, slug).locator(`a[href="/work/${slug}"]`)).toHaveCount(1);
      await expect(pass(page, slug).locator(".stretch-pass__card")).toHaveJSProperty("tagName", "A");
    }
    // The only other link on a pass is the Take Ownership pin, below.
    await expect(pass(page, "bnp-paribas").getByRole("link")).toHaveCount(2);
    await expect(pass(page, "joveen").getByRole("link")).toHaveCount(1);
    await expect(pass(page, "optegra").getByRole("link")).toHaveCount(1);
    const [joveen, optegra] = await Promise.all((["joveen", "optegra"] as const).map(async (slug) => (await boxOf(pass(page, slug).locator(".stretch-pass__strap"))).height));
    expect(joveen).not.toBeCloseTo(optegra, 0);
  });

  test("the awards are three pins of readable text on BNP's lanyard; Take Ownership leads to the certificate", async ({ page }) => {
    const pins = pass(page, "bnp-paribas").getByRole("list", { name: "Awards" }).getByRole("listitem");
    await expect(pins).toHaveCount(3);
    for (const [index, pin] of (passRecords["bnp-paribas"].pins ?? []).entries()) {
      await expect(pins.nth(index)).toBeVisible();
      await expect(pins.nth(index)).toContainText(pin.label);
      await expect(pins.nth(index)).toContainText(pin.detail);
    }
    await expect(section(page).locator(".stretch-pass__pins")).toHaveCount(1);
    await expect(pins.locator("img, svg, canvas")).toHaveCount(0);
    await expect(pins.getByRole("link")).toHaveCount(1);
    await expect(pins.nth(1).getByRole("link")).toHaveAttribute("href", "/work/bnp-paribas#take-ownership-certificate");
  });

  test("History is a dashed note under the passes, not a pass, and Now and How I got here no longer render as text", async ({ page }) => {
    const note = history(page);
    await expect(note).toHaveText(`${work.history.dates} · ${work.history.role} · ${work.history.note}`);
    await expect(note).toHaveCSS("border-top-style", "dashed");
    await expect(note.getByRole("link")).toHaveCount(0);
    await expect(section(page).locator(".stretch-pass .stretch-work__history, .stretch-work__history .stretch-pass")).toHaveCount(0);
    const [bottomOfPasses, top] = [Math.max(...(await Promise.all((["joveen", "optegra"] as const).map(async (slug) => { const box = await boxOf(pass(page, slug)); return box.y + box.height; })))), (await boxOf(note)).y];
    expect(top, "History sits under the past passes").toBeGreaterThanOrEqual(bottomOfPasses - 1);

    await expect(section(page).getByRole("heading", { level: 3 })).toHaveText([work.headed.heading]);
    const text = (await section(page).innerText()).replace(/\s+/g, " ");
    for (const retired of ["How I got here", "Software engineer · BNP Paribas CIB", "Cut page load by 40% and deploys", "Raised the Core Web Vitals pass rate from 62%"]) {
      expect(text, retired).not.toContain(retired);
    }
  });

  test("the How I got here note sits under the Work heading", async ({ page }) => {
    await expect(section(page).locator(".stretch-note")).toHaveText(work.note);
  });

  test("on a phone the current pass is full width, the past passes sit side by side, and the pins stay clear of the strap", async ({ page }) => {
    test.skip(viewportWidth(page) > 760, "the phone layout");
    const [box, current, joveen, optegra] = await Promise.all([boxOf(rail(page)), ...slugs.map((slug) => boxOf(section(page).locator(`[data-slug="${slug}"]`)))]);
    expect(current.width, "BNP's pass is the rail's full width").toBeCloseTo(box.width, 0);
    expect(joveen.y, "the past passes hang level").toBeCloseTo(optegra.y, 0);
    expect(joveen.x + joveen.width, "side by side").toBeLessThanOrEqual(optegra.x + 1);
    expect((await boxOf(pass(page, "bnp-paribas").locator(".stretch-pass__strap"))).height, "BNP's strap is 120 px").toBeCloseTo(120, 0);
    for (const slug of ["joveen", "optegra"] as const) {
      await expect(pass(page, slug).locator(".stretch-pass__photo")).toBeHidden();
      await expect(pass(page, slug).locator(".stretch-pass__barcode")).toBeHidden();
    }
    await expect(pass(page, "bnp-paribas").locator(".stretch-pass__photo")).toBeVisible();

    const strap = await boxOf(pass(page, "bnp-paribas").locator(".stretch-pass__strap"));
    const pins = pass(page, "bnp-paribas").locator(".stretch-pass__pin-body");
    for (const pin of await Promise.all((await pins.all()).map(boxOf))) {
      const clear = pin.x + pin.width <= strap.x - 4 || pin.x >= strap.x + strap.width + 4;
      expect(clear, "a pin has at least 4 px between it and the strap").toBe(true);
      expect(pin.x).toBeGreaterThanOrEqual(0);
      expect(pin.x + pin.width).toBeLessThanOrEqual(viewportWidth(page));
    }
  });

  test("from 761 px the row ends on Optegra: nothing is left empty at its right", async ({ page }) => {
    test.skip(viewportWidth(page) <= 760, "the wide layout");
    // The hang is the layout box; the pass inside it is turned a degree or so off level, so its own box is not.
    const hang = (slug: (typeof slugs)[number]) => section(page).locator(`[data-slug="${slug}"]`);
    const [box, current, joveen, optegra] = await Promise.all([boxOf(rail(page)), ...slugs.map((slug) => boxOf(hang(slug)))]);
    expect(Math.abs(box.x + box.width - (optegra.x + optegra.width)), "Optegra's hang ends at the rail's right edge").toBeLessThanOrEqual(1);
    expect(await pass(page, "optegra").evaluate((element) => (element as HTMLElement).offsetWidth - element.parentElement!.clientWidth), "and its pass fills the hang").toBe(0);
    expect(Math.abs(current.x - box.x), "BNP is flush left").toBeLessThanOrEqual(1);
    expect(joveen.x, "Joveen is not on top of BNP").toBeGreaterThanOrEqual(current.x + current.width);
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
      const link = shownLink(strand.link);
      await expect(item.getByRole("link")).toHaveText(link.label);
      await expect(item.getByRole("link")).toHaveAttribute("href", link.href);
    }
    expect(work.headed.strands.map((strand) => shownLink(strand.link).href)).toEqual(["/work/bnp-paribas", "#things-i-make", "/work/bnp-paribas"]);
  });

  test("the Things I make strand scrolls to that section", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await section(page).getByRole("link", { name: shownLink(work.headed.strands[1].link).label }).click();
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
    for (const phrase of [hero.support, hero.headline.lead, "Early Careers", "C# and Java", "on CPU and GPU"]) {
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
    // Three passes, the Take Ownership pin, and the three strands.
    await expect(section(page).getByRole("link")).toHaveCount(3 + 1 + work.headed.strands.length);
    await expect(section(page)).toContainText(currentProofs[0]);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`text passes WCAG 2.2 AA contrast (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      for (const selector of [".stretch-work__h3", ".stretch-work__line", ".stretch-work__strand", ".stretch-work__proof", ".stretch-work__link", ".stretch-work__history"]) {
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
