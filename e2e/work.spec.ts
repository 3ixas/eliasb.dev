import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { roleStories } from "../src/content/stretch/role-stories";
import { passRecords } from "../src/content/stretch/staff-pass";
import { shownSource, work } from "../src/content/stretch/work";
import { contrastOnPaper } from "./support/contrast";

const section = (page: Page) => page.locator("section#work");
const slugs = work.employers.map((employer) => employer.slug);
const strandIds = work.headed.bars.map((bar) => `strand-${bar.label.toLowerCase()}`);
const rowFor = (page: Page, id: string) => section(page).locator(`[data-look="${id}"]`);
const margin = (page: Page) => page.locator(".qi-margin");
/** A locator's box, which the test needs whole. */
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
const viewportWidth = (page: Page) => page.viewportSize()?.width ?? 0;
/** The margin is for wide screens with a hovering pointer (docs/design/DESIGN.md, "The margin"). */
const wide = (page: Page) => viewportWidth(page) >= 1180;

test.describe("Work: the rows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("three employers, newest first, each a row linking to its Role story", async ({ page }) => {
    const items = section(page).locator(".qi-list").first().locator(".qi-row");
    await expect(items).toHaveCount(work.employers.length);
    for (const [index, { slug }] of work.employers.entries()) {
      const row = items.nth(index);
      await expect(row).toHaveJSProperty("tagName", "A");
      await expect(row).toHaveAttribute("href", `/work/${slug}`);
      await expect(row.locator(".qi-row__title")).toHaveText(passRecords[slug].short);
      await expect(row.locator(".qi-row__line")).toHaveText(`${roleStories[slug].role} · ${roleStories[slug].dates}`.replaceAll(" · ", " · "));
    }
  });

  test("a row is 68 px or more, with a 44 px object, and the text starts at one edge down the list", async ({ page }) => {
    const rows = section(page).locator(".qi-row");
    await expect(rows).toHaveCount(work.employers.length + work.headed.bars.length);
    const edges = new Set<number>();
    for (const row of await rows.all()) {
      expect((await boxOf(row)).height).toBeGreaterThanOrEqual(68);
      const object = await boxOf(row.locator(".qi-row__object"));
      expect(object.width).toBe(44);
      expect(object.height).toBe(44);
      edges.add(Math.round((await boxOf(row.locator(".qi-row__text"))).x));
    }
    expect(edges.size, "every row's text starts at the same edge").toBe(1);
  });

  test("only the employer rows are links; the strands take focus because they have closer looks", async ({ page }) => {
    await expect(section(page).getByRole("link")).toHaveCount(work.employers.length);
    for (const id of strandIds) {
      await expect(rowFor(page, id)).toHaveAttribute("tabindex", "0");
      await expect(rowFor(page, id).getByRole("link")).toHaveCount(0);
    }
    // No other element in Work takes focus.
    await expect(section(page).locator("[tabindex]:not([data-look])")).toHaveCount(0);
  });

  test("Where I'm headed is its line and three strand rows: the title, then the label, with a thread in the source's colour", async ({ page }) => {
    const group = section(page).getByRole("group", { name: work.headed.heading });
    await expect(group.getByRole("heading", { level: 3 })).toHaveText(work.headed.heading);
    await expect(group.locator(".qi-note-line")).toHaveText(work.headed.line);
    const rows = group.locator(".qi-row");
    await expect(rows).toHaveCount(3);
    for (const [index, bar] of work.headed.bars.entries()) {
      await expect(rows.nth(index).locator(".qi-row__title")).toHaveText(bar.title);
      await expect(rows.nth(index).locator(".qi-row__line")).toHaveText(bar.label);
      const expected = await page.evaluate((thread) => {
        const probe = document.createElement("i");
        probe.style.color = thread;
        document.body.append(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        return resolved;
      }, shownSource(bar.source).thread);
      const thread = rows.nth(index).locator(".qi-thread");
      await expect(thread).toHaveCSS("width", "4px");
      await expect(thread).toHaveCSS("background-color", expected);
    }
    expect(work.headed.bars.map((bar) => shownSource(bar.source).name)).toEqual(["Optegra", "BNP Paribas", "Threshold"]);
  });

  test("each employer's mini pass is a 28 × 38 portrait pass in its own colour, and a row's object is not read aloud", async ({ page }) => {
    const fields = await Promise.all(
      slugs.map(async (slug) => {
        const card = rowFor(page, slug).locator(".qi-mini__card");
        const { width, height } = await boxOf(card);
        expect([Math.round(width), Math.round(height)]).toEqual([28, 38]);
        await expect(rowFor(page, slug).locator(".qi-row__object")).toHaveAttribute("aria-hidden", "true");
        return card.evaluate((element) => getComputedStyle(element).backgroundColor);
      }),
    );
    expect(new Set(fields).size, "Joveen's pass is not BNP's").toBeGreaterThan(1);
  });

  test("the pass rail and its hanging physics are gone from the homepage", async ({ page }) => {
    await expect(section(page).locator(".stretch-pass, [data-lean], .stretch-work__rail")).toHaveCount(0);
    const text = (await section(page).innerText()).replace(/\s+/g, " ");
    for (const retired of ["Valid · present", "How I got here", "I want to be really good at this", "Returned"]) expect(text, retired).not.toContain(retired);
  });

  test("the timing tokens exist with the contract's values", async ({ page }) => {
    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      // A production build strips the spaces after the commas; the values are the same.
      return [style.getPropertyValue("--spring"), style.getPropertyValue("--out")].map((value) => value.replace(/\s/g, ""));
    });
    expect(tokens).toEqual(["cubic-bezier(.34,1.56,.64,1)", "cubic-bezier(.2,.8,.2,1)"]);
  });

  test("a Role story's ← Work lands on this section, below the header", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/bnp-paribas");
    await page.locator("article").getByRole("link", { name: "Work", exact: true }).first().click();
    await expect(page).toHaveURL(/\/#work$/);
    const headerBottom = await page.locator("[data-stretch-header]").evaluate((header) => header.getBoundingClientRect().bottom);
    await expect.poll(() => page.locator("#work h2").evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headerBottom - 1);
  });

  test("no link points at the retired anchor, and every in-page anchor exists", async ({ page }) => {
    const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
    expect(hrefs.filter((href) => href.includes("where-ive-been"))).toEqual([]);
    for (const href of hrefs.filter((href) => href.startsWith("#") && href.length > 1)) await expect(page.locator(`[id="${href.slice(1)}"]`), href).toHaveCount(1);
  });

  test("it is in the server-rendered page, with each closer look's facts as the row's description", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(section(page).getByRole("link")).toHaveCount(work.employers.length);
    await expect(section(page)).toContainText(work.headed.line);
    for (const { slug, pins, proofs } of work.employers) {
      const description = await rowFor(page, slug).evaluate((row) => document.getElementById(row.getAttribute("aria-describedby")!)?.textContent ?? "");
      for (const { label, detail } of pins) expect(description, `${slug}: ${label}`).toContain(`${label}. ${detail}`);
      for (const proof of proofs) expect(description).toContain(proof);
    }
    const strand = await rowFor(page, strandIds[0]).evaluate((row) => document.getElementById(row.getAttribute("aria-describedby")!)?.textContent ?? "");
    expect(strand).toBe(`${work.headed.soFar}, ${shownSource(work.headed.bars[0].source).name}. ${work.headed.bars[0].soFar.text}`);
  });

  test("it fits the screen, and every row is at least 44 px tall", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const width = viewportWidth(page);
    for (const box of await Promise.all((await section(page).locator("*").all()).map((item) => item.boundingBox()))) {
      if (box) expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    }
    for (const row of await section(page).locator(".qi-row").all()) expect((await boxOf(row)).height).toBeGreaterThanOrEqual(44);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`text passes WCAG 2.2 AA contrast (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      for (const selector of [".qi-title", ".qi-note-line", ".qi-row__title", ".qi-row__line"]) {
        const readings = await contrastOnPaper(page, `#work ${selector}`);
        expect(readings.length, selector).toBeGreaterThan(0);
        for (const reading of readings) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test(`has no axe violations, with a closer look open on a wide screen (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      if (wide(page)) {
        await rowFor(page, "bnp-paribas").hover();
        // Axe reads the colour on screen, so it waits for the 0.2 s fade to finish.
        await expect(margin(page).locator(".qi-look")).toHaveCSS("opacity", "1");
      }
      const results = await new AxeBuilder({ page }).include("#work").analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("Work: the margin", () => {
  test.skip(({ page }) => !page.viewportSize() || viewportWidth(page) < 1180, "the margin is for wide screens");

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(margin(page)).toHaveCount(0);
  });

  test("pointing at a row shows its closer look, 40 px right of the column, level with the row's top less 6 px, and never over the column", async ({ page }) => {
    const row = rowFor(page, "bnp-paribas");
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await expect(margin(page)).toBeVisible();
    await expect(margin(page)).toHaveAttribute("aria-hidden", "true");
    await expect(margin(page).locator(".qi-pass")).toBeVisible();
    await expect(margin(page)).toHaveCSS("pointer-events", "none");
    // Placement follows the row as images load and the page scrolls, so it is read until it settles.
    await expect
      .poll(async () => {
        const [m, r, column, height] = await Promise.all([boxOf(margin(page)), boxOf(row), boxOf(page.locator("#work .qi-column")), page.evaluate(() => innerHeight)]);
        const wanted = Math.max(16, Math.min(r.y - 6, height - 16 - m.height));
        return [Math.abs(m.x - (column.x + column.width + 40)) < 1, Math.abs(m.y - wanted) < 1, m.x >= column.x + column.width, m.x + m.width <= viewportWidth(page) - 16 + 1, m.width];
      })
      .toEqual([true, true, true, true, 300]);
  });

  test("it stays 16 px inside the window: a row near the bottom lifts the margin, and the margin follows scrolling", async ({ page }) => {
    const row = rowFor(page, strandIds[2]);
    await row.scrollIntoViewIfNeeded();
    await row.evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().bottom - innerHeight + 24));
    await row.hover();
    await expect(margin(page)).toBeVisible();
    await expect
      .poll(async () => {
        const [m, height] = await Promise.all([boxOf(margin(page)), page.evaluate(() => innerHeight)]);
        return m.y >= 16 - 1 && m.y + m.height <= height - 16 + 1;
      })
      .toBe(true);
    // A scroll small enough that the pointer, which does not move, stays over the row: a browser re-reports the pointer
    // after a scroll, and one that lands off the row hides the margin (or shows the next row's), which is the design.
    await page.mouse.wheel(0, 24);
    await expect
      .poll(async () => {
        const [m, r, height] = await Promise.all([boxOf(margin(page)), boxOf(row), page.evaluate(() => innerHeight)]);
        return Math.abs(m.y - Math.max(16, Math.min(r.y - 6, height - 16 - m.height))) < 1;
      })
      .toBe(true);
  });

  test("it hides after the pointer leaves, and glides to the next row's top less 6 px", async ({ page }) => {
    const [bnp, joveen] = [rowFor(page, "bnp-paribas"), rowFor(page, "joveen")];
    await bnp.scrollIntoViewIfNeeded();
    // Near the top of the window, so neither row's margin is lifted by the bottom edge.
    await bnp.evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().top - 140));
    await bnp.hover();
    await expect(margin(page)).toBeVisible();
    await expect.poll(async () => Math.abs((await boxOf(margin(page))).y - ((await boxOf(bnp)).y - 6))).toBeLessThan(1);
    await joveen.hover();
    await expect(margin(page).locator(`.qi-pass[data-pass-slug="joveen"]`)).toBeVisible();
    await expect(margin(page)).toHaveAttribute("data-glide", "");
    await expect.poll(async () => Math.abs((await boxOf(margin(page))).y - ((await boxOf(joveen)).y - 6))).toBeLessThan(1);
    await page.mouse.move(5, 5);
    await expect(margin(page)).toHaveCount(0);
  });

  test("focus shows it the same way; Escape hides it and focus stays on the row", async ({ page }) => {
    const row = rowFor(page, strandIds[0]);
    await row.scrollIntoViewIfNeeded();
    await row.focus();
    await expect(margin(page)).toBeVisible();
    await expect(margin(page).locator(".qi-strand")).toContainText(work.headed.bars[0].soFar.text);
    await page.keyboard.press("Escape");
    await expect(margin(page)).toHaveCount(0);
    await expect(row).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(rowFor(page, strandIds[1])).toBeFocused();
    await expect(margin(page).locator(".qi-strand")).toContainText(work.headed.bars[1].soFar.text);
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(margin(page)).toHaveCount(0);
  });

  test("Escape also hides a margin the pointer opened", async ({ page }) => {
    const row = rowFor(page, "bnp-paribas");
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await expect(margin(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(margin(page)).toHaveCount(0);
  });

  test("the margin refits when the window shrinks, staying 16 px inside it", async ({ page }) => {
    const row = rowFor(page, strandIds[2]);
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await expect(margin(page)).toBeVisible();
    await page.setViewportSize({ width: viewportWidth(page), height: 560 });
    await expect
      .poll(async () => {
        const m = await boxOf(margin(page));
        return m.y >= 15 && m.y + m.height <= 560 - 16 + 1;
      })
      .toBe(true);
  });

  test("a focused row keeps its closer look when the pointer crosses the column", async ({ page }) => {
    const row = rowFor(page, strandIds[0]);
    await row.scrollIntoViewIfNeeded();
    await row.focus();
    await expect(margin(page)).toBeVisible();
    await page.locator("#work-heading").hover();
    await page.waitForTimeout(300);
    await expect(margin(page)).toBeVisible();
  });

  test("a focused row keeps its closer look when the pointer visits that row and leaves the column", async ({ page }) => {
    const row = rowFor(page, strandIds[0]);
    await row.scrollIntoViewIfNeeded();
    await row.focus();
    await expect(margin(page)).toBeVisible();
    await row.hover();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(300);
    await expect(margin(page)).toBeVisible();
    await expect(margin(page).locator(".qi-strand")).toBeVisible();
  });

  test("every employer's closer look is its pass and three enamel Pass pins with glyphs, in one form", async ({ page }) => {
    for (const employer of work.employers) {
      const row = rowFor(page, employer.slug);
      await row.scrollIntoViewIfNeeded();
      await row.hover();
      const look = margin(page).locator(`.qi-pass[data-pass-slug="${employer.slug}"]`);
      await expect(look).toBeVisible();
      await expect(look.locator(".qi-pass__slot, .qi-pass__strap, .qi-pass__clip, .qi-pass__barcode")).toHaveCount(4);
      const card = await boxOf(look.locator(".qi-pass__card"));
      expect(card.width / card.height).toBeCloseTo(85.6 / 54, 1);
      const pins = margin(page).locator(".qi-pins__item");
      await expect(pins).toHaveCount(3);
      await expect(margin(page).locator(".qi-pin svg")).toHaveCount(3);
      for (const [index, pin] of employer.pins.entries()) {
        await expect(pins.nth(index)).toContainText(pin.label);
        await expect(pins.nth(index)).toContainText(pin.detail);
      }
      for (const proof of employer.proofs) await expect(margin(page)).toContainText(proof);
      await page.mouse.move(5, 5);
      await expect(margin(page)).toHaveCount(0);
    }
  });

  test("a figure counts up to the pass's headline and rests on it", async ({ page }) => {
    for (const slug of ["joveen", "optegra"] as const) {
      const row = rowFor(page, slug);
      await row.scrollIntoViewIfNeeded();
      await row.hover();
      await expect(margin(page).locator(".qi-pass__figure strong")).toHaveText(passRecords[slug].headline.value);
      await page.mouse.move(5, 5);
      await expect(margin(page)).toHaveCount(0);
    }
  });

  test("reduced motion: each closer look fades in over 0.2 s, with no arrival motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const row = rowFor(page, "bnp-paribas");
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await expect(margin(page)).toBeVisible();
    await expect(margin(page).locator(".qi-look")).toHaveCSS("animation-name", "qi-fade");
    await expect(margin(page).locator(".qi-look")).toHaveCSS("animation-duration", "0.2s");
    await expect(margin(page).locator(".qi-pass")).toHaveCSS("animation-name", "none");
    await expect(margin(page).locator(".qi-pins__item").first()).toHaveCSS("animation-name", "none");
    for (const id of strandIds) {
      await rowFor(page, id).hover();
      await expect(margin(page).locator(".qi-strand__thread")).toHaveCSS("animation-name", "none");
    }
  });

  test("a row's object plays its reaction on hover: the pass swings", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const row = rowFor(page, "bnp-paribas");
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await expect(row.locator(".qi-mini")).toHaveCSS("animation-name", "qi-swing");
  });
});

test.describe("Work: narrower than the margin", () => {
  test.skip(({ page }) => viewportWidth(page) >= 1180, "the wide layout has a margin");

  test("no margin appears when a row is focused or hovered", async ({ page }) => {
    await page.goto("/");
    await rowFor(page, strandIds[0]).focus();
    await rowFor(page, "bnp-paribas").hover();
    await expect(margin(page)).toHaveCount(0);
  });
});
