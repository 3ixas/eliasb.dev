import { expect, test, type Locator, type Page } from "@playwright/test";
import { roleStories } from "../src/content/stretch/role-stories";
import { passLinkLabel, passRecords, passStatus } from "../src/content/stretch/staff-pass";

/** BNP's award pins that lead into its Role story: the only links on its pass besides the pass itself. */
const pinLinks = (passRecords["bnp-paribas"].pins ?? []).filter((pin) => pin.href).length;

// The Staff pass in every state, on its fixture route, before any section uses it.
const fixture = (page: Page, name: string) => page.locator(`[data-fixture="${name}"]`);
const hang = (page: Page, name: string) => fixture(page, name).locator(".stretch-pass");
/** The text a pass shows, in document order, without the page's text-transform. */
const text = (pass: Locator) => pass.locator(".stretch-pass__card").evaluate((card) => card.textContent ?? "");
/** The pass's resting angle, from its transform. */
const tilt = (pass: Locator) =>
  pass.evaluate((element) => {
    const { a, b } = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return Math.atan2(b, a) * (180 / Math.PI);
  });

test.describe("Staff pass", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/staff-pass");
  });

  test("the current pass shows every field, top to bottom", async ({ page }) => {
    const story = roleStories["bnp-paribas"];
    const record = passRecords["bnp-paribas"];
    const shown = await text(hang(page, "current"));
    const fields = [
      `Staff · ${story.number}`,
      passStatus(story, "current"),
      record.short,
      story.role,
      story.dates,
      record.headline.value,
      record.headline.label,
      passLinkLabel(record),
    ];
    const positions = fields.map((field) => shown.indexOf(field));
    expect(positions, `every field is there: ${fields.join(" | ")}`).not.toContain(-1);
    expect(positions, "and in this order").toEqual([...positions].sort((a, b) => a - b));
    await expect(hang(page, "current").locator(".stretch-pass__status")).toHaveText("Valid · present");
    await expect(hang(page, "current").locator(".stretch-pass__photo")).toHaveAttribute("alt", "");
    await expect(hang(page, "current").locator(".stretch-pass__barcode")).toHaveAttribute("aria-hidden", "true");
  });

  test("a returned pass shows the month it ended and says Returned, never Expired", async ({ page }) => {
    for (const [name, slug] of [
      ["returned-joveen", "joveen"],
      ["returned-optegra", "optegra"],
    ] as const) {
      const story = roleStories[slug];
      const pass = hang(page, name);
      await expect(pass.locator(".stretch-pass__status")).toHaveText(passStatus(story, "returned"));
      await expect(pass.locator(".stretch-pass__stamp")).toHaveText("Returned");
      const shown = await text(pass);
      expect(shown.indexOf("Returned"), "the stamp comes before the employer").toBeLessThan(shown.indexOf(passRecords[slug].short));
      expect(shown).not.toMatch(/expired/i);
      expect(shown).toContain(passLinkLabel(passRecords[slug]));
    }
    expect(await page.locator("body").textContent()).not.toMatch(/expired/i);
    await expect(hang(page, "current").locator(".stretch-pass__stamp")).toHaveCount(0);
  });

  test("the pins are text in a list, not images", async ({ page }) => {
    const pins = hang(page, "current").getByRole("list", { name: "Awards" }).getByRole("listitem");
    await expect(pins).toHaveCount(3);
    await expect(pins.nth(0)).toContainText("Winner");
    await expect(pins.nth(1)).toContainText("Take Ownership");
    await expect(pins.nth(2)).toContainText("AI Champion");
    for (let index = 0; index < 3; index += 1) await expect(pins.nth(index)).toBeVisible();
    await expect(hang(page, "current").locator(".stretch-pass__pins img, .stretch-pass__pins svg, .stretch-pass__pins canvas")).toHaveCount(0);
    await expect(hang(page, "returned-joveen").locator(".stretch-pass__pins")).toHaveCount(0);
    await expect(hang(page, "self-issued").locator(".stretch-pass__pins")).toHaveCount(0);
  });

  test("a linking pass is exactly one link, and focusing it shows a ring and straightens the pass", async ({ page }) => {
    for (const [name, slug] of [
      ["current", "bnp-paribas"],
      ["returned-joveen", "joveen"],
      ["returned-optegra", "optegra"],
    ] as const) {
      const pass = hang(page, name);
      // The pass is one link to its story; the only other link on a pass is a pin that leads to its evidence.
      await expect(pass.locator(`a[href="/work/${slug}"]`)).toHaveCount(1);
      await expect(pass.getByRole("link")).toHaveCount(name === "current" ? 1 + pinLinks : 1);
    }

    const pass = hang(page, "current");
    const link = pass.locator('a[href="/work/bnp-paribas"]');
    expect(await tilt(pass), "it hangs at its resting tilt").toBeCloseTo(-1, 1);
    await page.keyboard.press("Tab");
    await link.focus();
    await expect(link).toBeFocused();
    const ring = await link.evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), offset: parseFloat(style.outlineOffset) };
    });
    expect(ring).toEqual({ style: "solid", width: 3, offset: 5 });
    await expect.poll(() => tilt(pass), { timeout: 4000 }).toBeCloseTo(0, 1);
  });

  test("an opening pass and the self-issued pass are not links to a story", async ({ page }) => {
    // The opening pass's pins still lead to their evidence, inside the story it opens.
    await expect(hang(page, "opening").locator('a[href="/work/bnp-paribas"]')).toHaveCount(0);
    await expect(hang(page, "opening").getByRole("link")).toHaveCount(pinLinks);
    await expect(hang(page, "opening").locator(".stretch-pass__foot")).not.toContainText("story");
    await expect(hang(page, "self-issued").getByRole("link")).toHaveCount(0);
  });

  test("the self-issued pass has no employer, status, dates or pins, and holds still", async ({ page }) => {
    const pass = hang(page, "self-issued");
    const shown = await text(pass);
    expect(shown).toContain("Staff pass");
    expect(shown).toContain("Self-issued");
    expect(shown).toContain("Issued by: Elias Bennett");
    for (const employer of ["BNP", "Joveen", "Optegra", "Valid", "Returned", "Not yet issued"]) expect(shown).not.toContain(employer);
    await expect(pass).not.toHaveAttribute("data-lean");
    expect(await tilt(pass)).toBe(0);
  });
});
