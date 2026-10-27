import { expect, test, type Locator, type Page } from "@playwright/test";
import { passRecords } from "../src/content/stretch/staff-pass";
import { work } from "../src/content/stretch/work";

/*
 * Inline closer looks on phones and touch (docs/design/DESIGN.md, "Inline"): below 1180 px a closer look opens
 * under its row, only when tapped. These specs run at the narrow widths; the wide layout keeps its margin
 * (work.spec.ts) and only has to show none of the phone's buttons.
 */

const section = (page: Page) => page.locator("section#work");
const rowBox = (page: Page, id: string) => section(page).locator(".qi-list__item").filter({ has: page.locator(`[data-look="${id}"], [data-look-tap="${id}"]`) });
const tapObject = (page: Page, id: string) => section(page).locator(`button[data-look-tap="${id}"]`);
const plainRow = (page: Page, id: string) => section(page).locator(`.qi-row[data-look-tap="${id}"]`);
const openLooks = (page: Page) => page.locator(".qi-inline__in");
const inlineLook = (page: Page, id: string) => section(page).locator(`[data-look-slot="${id}"] .qi-look`);
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;
const lastTap = new WeakMap<Page, number>();
/** WebKit folds a second click inside its double-click interval into the first; a person's next tap comes later, so taps are spaced like theirs. */
const tap = async (page: Page, target: Locator, options?: Parameters<Locator["click"]>[0]) => {
  const wait = 600 - (Date.now() - (lastTap.get(page) ?? 0));
  if (wait > 0) await page.waitForTimeout(wait);
  await target.click(options);
  lastTap.set(page, Date.now());
};
const strandIds = work.headed.bars.map((bar) => `strand-${bar.label.toLowerCase()}`);
const narrow = (page: Page) => (page.viewportSize()?.width ?? 0) < 1180;

test.describe("Work: inline closer looks", () => {
  test.skip(({ page }) => !narrow(page), "the wide layout shows the margin instead");

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    // The controller listens through React's props on the column, which exist only once it has hydrated; a tap before that does nothing.
    await page.waitForFunction(() => {
      const column = document.querySelector("#work [data-quiet-column]");
      return !!column && Object.keys(column).some((key) => key.startsWith("__reactProps$"));
    });
  });

  test("scrolling the whole page opens nothing and plays no reaction", async ({ page }) => {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height; y += 300) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await page.waitForTimeout(40);
    }
    await expect(openLooks(page)).toHaveCount(0);
    await expect(page.locator(".qi-margin")).toHaveCount(0);
    for (const mini of await section(page).locator(".qi-mini").all()) await expect(mini).toHaveCSS("animation-name", "none");
  });

  test("an employer's object is a button beside its link, named for what it shows, and its text opens the Role story", async ({ page }) => {
    const slugs = work.employers.map((employer) => employer.slug);
    for (const slug of slugs) {
      const button = tapObject(page, slug);
      await expect(button).toHaveAccessibleName(`A closer look at ${passRecords[slug].short}`);
      await expect(button).toHaveAttribute("aria-expanded", "false");
      // A sibling of the link, never inside it.
      await expect(section(page).locator(`a[data-look="${slug}"] button`)).toHaveCount(0);
      await expect(rowBox(page, slug).locator(".qi-row-box > a + button")).toHaveCount(1);
    }
    await section(page).locator('a[data-look="joveen"] .qi-row__title').click();
    await expect(page).toHaveURL(/\/work\/joveen$/);
  });

  test("tapping Joveen's object opens its full closer look under the row, on the row's text edge; tapping it again closes it", async ({ page }) => {
    const row = section(page).locator('a[data-look="joveen"]');
    await tap(page, tapObject(page, "joveen"));
    await expect(page).toHaveURL(/\/$/);
    const look = inlineLook(page, "joveen");
    await expect(look.locator(".qi-pass")).toBeVisible();
    await expect(look.locator(".qi-pins__item")).toHaveCount(3);
    await expect(tapObject(page, "joveen")).toHaveAttribute("aria-expanded", "true");
    await expect.poll(async () => (await boxOf(look.locator(".qi-pass__card"))).y).toBeGreaterThan((await boxOf(row)).y + (await boxOf(row)).height - 1);
    // The look starts on the row's text edge (the card is centred in the 300 px look, so measure the look's own left).
    const text = await boxOf(row.locator(".qi-row__text"));
    // On a narrow screen the 316 px look is scaled to fit, and so is its 8 px padding.
    const box = await boxOf(look);
    // The padding scales with the look, so a 320 px screen drifts by under 2 px.
    expect(Math.abs(box.x + 8 * (box.width / 316) - text.x)).toBeLessThanOrEqual(2);
    await tap(page, tapObject(page, "joveen"));
    await expect(openLooks(page)).toHaveCount(0);
    await expect(tapObject(page, "joveen")).toHaveAttribute("aria-expanded", "false");
  });

  test("opening a second closer look closes the first, and tapping outside any trigger leaves one open", async ({ page }) => {
    await tap(page, tapObject(page, "bnp-paribas"));
    await expect(inlineLook(page, "bnp-paribas")).toBeVisible();
    await tap(page, tapObject(page, "optegra"));
    await expect(inlineLook(page, "optegra")).toBeVisible();
    await expect(openLooks(page)).toHaveCount(1);
    await expect(inlineLook(page, "bnp-paribas")).toHaveCount(0);
    await page.locator("#work-heading").click();
    await section(page).locator(".qi-note-line").first().click();
    await expect(openLooks(page)).toHaveCount(1);
    await expect(inlineLook(page, "optegra")).toBeVisible();
  });

  test("when a look above the tapped row closes, the tapped row stays where it was on screen", async ({ page }) => {
    await tap(page, tapObject(page, "bnp-paribas"));
    await expect(inlineLook(page, "bnp-paribas").locator(".qi-pass")).toBeVisible();
    const strand = plainRow(page, strandIds[0]);
    // Let the look finish opening (the row stops moving), then put the lower row mid-screen: centring it while the look still grows
    // leaves it off-screen when the look is done, and Playwright's own scroll-into-view on the tap would move it.
    const stopsMoving = async () => {
      const first = (await boxOf(strand)).y;
      await page.waitForTimeout(250);
      return first === (await boxOf(strand)).y;
    };
    await expect.poll(stopsMoving).toBe(true);
    await strand.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect.poll(stopsMoving).toBe(true);
    const before = (await boxOf(strand)).y;
    await tap(page, strand, { position: { x: 100, y: 20 } });
    await expect(inlineLook(page, strandIds[0])).toBeVisible();
    await expect(inlineLook(page, "bnp-paribas")).toHaveCount(0);
    await expect.poll(async () => Math.abs((await boxOf(strand)).y - before)).toBeLessThanOrEqual(2);
  });

  test("a plain row opens from anywhere on it and closes when tapped again; Enter does the same from the keyboard", async ({ page }) => {
    const row = plainRow(page, "history-at-uni");
    await row.click({ position: { x: 20, y: 10 } });
    await expect(inlineLook(page, "history-at-uni").locator(".qi-note")).toBeVisible();
    // WebKit folds a second click inside its double-click interval into the first; a person's second tap comes later.
    await page.waitForTimeout(600);
    await row.click({ position: { x: 300, y: 10 } });
    await expect(openLooks(page)).toHaveCount(0);
    await row.focus();
    await page.keyboard.press("Enter");
    await expect(inlineLook(page, "history-at-uni")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(openLooks(page)).toHaveCount(0);
    await page.keyboard.press("Enter");
    await expect(inlineLook(page, "history-at-uni")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(openLooks(page)).toHaveCount(0);
  });

  test("every row kind opens with its own look, and the inline look is aria-hidden with the rows' descriptions unchanged", async ({ page }) => {
    const link = section(page).locator('a[data-look="optegra"]');
    const describedBefore = await link.evaluate((element) => document.getElementById(element.getAttribute("aria-describedby")!)!.textContent);
    await expect(link).toHaveAccessibleDescription(describedBefore!);
    for (const [id, kind] of [["optegra", ".qi-pass"], ["history-at-uni", ".qi-note"], [strandIds[1], ".qi-strand__thread"]] as const) {
      await tap(page, id === "optegra" ? tapObject(page, id) : plainRow(page, id));
      await expect(inlineLook(page, id).locator(kind)).toBeVisible();
      await expect(page.locator(`[data-look-slot="${id}"]`)).toHaveAttribute("aria-hidden", "true");
      await expect(page.locator(`[data-look-slot="${id}"] a, [data-look-slot="${id}"] button`)).toHaveCount(0);
    }
    await expect(link).toHaveAccessibleDescription(describedBefore!);
    const open = section(page).locator("[data-look-slot]").filter({ has: page.locator(".qi-look") });
    await expect(open).toHaveCount(1);
  });

  test("touch targets are at least 44 px, and nothing scrolls sideways with any closer look open", async ({ page }) => {
    for (const button of await section(page).locator("button.qi-row__tap").all()) {
      const box = await boxOf(button);
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    for (const row of await section(page).locator(".qi-row[data-look-tap]").all()) expect((await boxOf(row)).height).toBeGreaterThanOrEqual(44);
    const ids = [...work.employers.map((employer) => employer.slug), "history-at-uni", ...strandIds];
    for (const id of ids) {
      await tap(page, id in passRecords ? tapObject(page, id) : plainRow(page, id));
      const look = inlineLook(page, id);
      await expect(look).toBeVisible();
      await expect.poll(async () => (await boxOf(look)).height).toBeGreaterThan(40);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      const width = page.viewportSize()!.width;
      const box = await boxOf(look);
      expect(box.x + box.width, `${id}'s look stays inside the screen`).toBeLessThanOrEqual(width);
    }
  });

  test("an object plays its reaction when its row is tapped open", async ({ page }) => {
    const mini = section(page).locator('[data-look="joveen"] .qi-mini');
    await expect(mini).toHaveCSS("animation-name", "none");
    await tap(page, tapObject(page, "joveen"));
    await expect(mini).toHaveCSS("animation-name", "qi-swing");
    await expect(section(page).locator('[data-look="history-at-uni"] .qi-tile')).toHaveCSS("animation-name", "none");
    await tap(page, plainRow(page, "history-at-uni"));
    await expect(section(page).locator('[data-look="history-at-uni"] .qi-tile')).toHaveCSS("animation-name", "qi-turn");
  });

  test("reduced motion: a closer look fades in over 0.2 s with no height animation or arrival motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await tap(page, tapObject(page, "joveen"));
    const look = inlineLook(page, "joveen");
    await expect(look).toBeVisible();
    await expect(look).toHaveCSS("animation-name", "qi-fade");
    await expect(look).toHaveCSS("animation-duration", "0.2s");
    await expect(page.locator('[data-look-slot="joveen"]')).toHaveCSS("animation-name", "none");
    await expect(look.locator(".qi-pass")).toHaveCSS("animation-name", "none");
    await expect(section(page).locator('[data-look="joveen"] .qi-mini')).toHaveCSS("animation-name", "none");
  });
});

test.describe("Work: wide screens keep the margin", () => {
  test.skip(({ page }) => narrow(page), "the phone layout has inline looks");

  test("the object buttons are not shown, and clicking a row's object follows its link", async ({ page }) => {
    await page.goto("/");
    await expect(section(page).locator("button.qi-row__tap").first()).toBeHidden();
    await section(page).locator('a[data-look="joveen"] .qi-row__object').click();
    await expect(page).toHaveURL(/\/work\/joveen$/);
  });
});
