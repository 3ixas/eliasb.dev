import { expect, test, type Page } from "@playwright/test";
import { hero } from "../src/content/stretch/site-copy";
import { contrastOnPaper } from "./support/contrast";
import { heroBottoms } from "./support/hero-bottoms";

const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 761;
const name = (page: Page) => page.locator(".stretch-name");
const rotation = (page: Page, selector: string) =>
  page.locator(selector).evaluate((element) => {
    const [a, b] = getComputedStyle(element).transform.match(/-?[\d.]+/g)!.map(Number);
    return Math.round(Math.atan2(b, a) * (180 / Math.PI) * 10) / 10;
  });

test.describe("Hero", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("the h1 is real text with the approved headline, complete as an accessible name", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveAccessibleName(`${hero.headline.lead} ${hero.headline.emphasis}`);
    await expect(heading).toHaveText(`${hero.headline.lead} ${hero.headline.emphasis}`);
    await expect(heading).toBeVisible();
  });

  test("the headline, support line and actions are in the server-rendered page", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(hero.support)).toBeVisible();
    await expect(page.getByRole("link", { name: hero.actions.work })).toBeVisible();
  });

  test("the name is cobalt text reading Elias Bennett, on two lines", async ({ page }) => {
    await expect(name(page)).toHaveText(`${hero.name.first} ${hero.name.last}`);
    await expect(name(page)).toHaveCSS("color", /rgb\((35, 64, 255|139, 156, 255)\)/);
    await expect(name(page)).toHaveCSS("text-transform", "uppercase");
    const lines = await name(page).locator("span").evaluateAll((spans) => spans.map((span) => Math.round(span.getBoundingClientRect().height)));
    const font = await name(page).evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    for (const height of lines) expect(height, "each name stays on one line").toBeLessThanOrEqual(Math.round(font * 0.8) + 1);
  });

  test("the role line is plain text directly under the name, above the headline", async ({ page }) => {
    const role = page.locator(".stretch-hero__role");
    await expect(role).toHaveText(hero.role);
    await expect(role).toBeVisible();
    const [nameBox, roleBox, headingBox] = await Promise.all(
      [name(page), role, page.getByRole("heading", { level: 1 })].map(async (locator) => (await locator.boundingBox())!),
    );
    expect(roleBox.y, "under the name").toBeGreaterThanOrEqual(nameBox.y + nameBox.height - 1);
    expect(roleBox.y + roleBox.height, "above the headline").toBeLessThanOrEqual(headingBox.y);
    // Real text in the page, not an image or something hidden from readers.
    expect(await role.evaluate((element) => element.closest("[aria-hidden='true']"))).toBeNull();
  });

  test("the name takes no more than 28svh, so the whole First glance fits on the first screen", async ({ page }) => {
    // A short laptop screen on desktop, the project's own height on phones.
    if (!phone(page)) await page.setViewportSize({ width: page.viewportSize()!.width, height: 760 });
    await page.evaluate(() => document.fonts.ready);
    const { font, height, support, heading, role, nameBottom } = await page.evaluate(() => {
      const bottom = (selector: string) => document.querySelector(selector)!.getBoundingClientRect().bottom;
      return {
        font: parseFloat(getComputedStyle(document.querySelector(".stretch-name")!).fontSize),
        height: innerHeight,
        nameBottom: bottom(".stretch-name"),
        role: bottom(".stretch-hero__role"),
        heading: bottom(".stretch-hero h1"),
        support: bottom(".stretch-hero__support"),
      };
    });
    expect(font, "the name is capped at 28svh").toBeLessThanOrEqual(height * 0.28 + 0.5);
    for (const [part, bottom] of Object.entries({ name: nameBottom, role, headline: heading, "supporting line": support })) {
      expect(bottom, `the ${part} ends above the fold`).toBeLessThanOrEqual(height);
    }
  });

  test("a visitor's wider letter spacing does not push the page sideways", async ({ page }) => {
    test.skip(!phone(page), "Phone layout");
    // WCAG 1.4.12: letter spacing 0.12em, word spacing 0.16em, line height 1.5, paragraph spacing 2em.
    await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("on phones the name is 31.5vw, fills the width and does not wrap", async ({ page }) => {
    test.skip(!phone(page), "Phone layout");
    const { font, widest, column, width } = await page.evaluate(() => {
      const element = document.querySelector(".stretch-name")!;
      const widths = [...element.querySelectorAll("span")].map((span) => {
        const range = document.createRange();
        range.selectNodeContents(span);
        return range.getBoundingClientRect().width;
      });
      return {
        font: parseFloat(getComputedStyle(element).fontSize),
        widest: Math.max(...widths),
        column: element.getBoundingClientRect().width,
        width: innerWidth,
      };
    });
    expect(font).toBeCloseTo(width * 0.315, 0);
    expect(widest / column, "fills the width").toBeGreaterThan(0.9);
    expect(widest / column, "and does not run over it").toBeLessThan(1.01);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("on desktop the name is capped and the portrait sits to its right", async ({ page }) => {
    test.skip(phone(page), "Desktop layout");
    const font = await name(page).evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(font).toBeLessThanOrEqual(280);
    const nameRight = await name(page).evaluate((element) => Math.max(...[...element.querySelectorAll("span")].map((span) => {
      const range = document.createRange();
      range.selectNodeContents(span);
      return range.getBoundingClientRect().right;
    })));
    const portrait = (await page.locator(".stretch-portrait").boundingBox())!;
    expect(portrait.x).toBeGreaterThan(nameRight);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("on desktop the portrait's bottom meets the bottom of the text column", async ({ page }) => {
    test.skip(phone(page), "Desktop layout");
    await expect
      .poll(async () => {
        const { portrait, column } = await heroBottoms(page);
        return Math.abs(portrait - column);
      })
      .toBeLessThanOrEqual(1);
  });

  test("on phones the portrait is stacked below the actions", async ({ page }) => {
    test.skip(!phone(page), "Phone layout");
    const actions = (await page.locator(".stretch-hero__actions").boundingBox())!;
    const portrait = (await page.locator(".stretch-portrait").boundingBox())!;
    expect(portrait.y).toBeGreaterThan(actions.y + actions.height);
  });

  test("the portrait is tilted 3° (2° on phones) with a cobalt Based in London label", async ({ page }) => {
    expect(await rotation(page, ".stretch-portrait")).toBe(phone(page) ? 2 : 3);
    const label = page.locator(".stretch-portrait__label");
    await expect(label).toHaveText(hero.portraitLabel);
    await expect(label).toHaveCSS("background-color", /rgb\((35, 64, 255|139, 156, 255)\)/);
    const image = page.getByRole("img", { name: "Elias in a white tuxedo, smiling" });
    await expect(image).toBeVisible();
    // The label sits on the photo, not floating below it.
    const photo = (await image.boundingBox())!;
    const tag = (await label.boundingBox())!;
    expect(tag.y + tag.height).toBeLessThanOrEqual(photo.y + photo.height + 4);
    expect(tag.y).toBeGreaterThan(photo.y);
    expect(await image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  });

  test("both actions work and are at least 44 px tall", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const headerBottom = await page.locator("[data-stretch-header]").evaluate((element) => element.getBoundingClientRect().bottom);
    for (const [label, anchor, heading] of [[hero.actions.work, "work", "Work"], [hero.actions.hello, "say-hello", "Say hello"]]) {
      const link = page.locator(".stretch-hero").getByRole("link", { name: label, exact: true });
      const box = (await link.boundingBox())!;
      expect(box.height, label).toBeGreaterThanOrEqual(44);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`#${anchor}$`));
      const top = await page.locator(`#${anchor}`).getByRole("heading", { name: heading, exact: true }).evaluate((element) => element.getBoundingClientRect().top);
      expect(top, anchor).toBeGreaterThanOrEqual(headerBottom - 1);
      await page.evaluate(() => scrollTo(0, 0));
    }
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`cobalt over the page and the label's on-cobalt text meet WCAG 2.2 AA (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.reload();
      for (const [selector, needs] of [
        [".stretch-name", 4.5],
        [".stretch-hero h1 em", 4.5],
        [".stretch-portrait__label", 4.5],
        [".stretch-button--primary", 4.5],
        [".stretch-button:not(.stretch-button--primary)", 4.5],
        [".stretch-hero__support", 4.5],
      ] as const) {
        const [reading] = await contrastOnPaper(page, selector);
        expect(reading.ratio, `${selector} (${scheme})`).toBeGreaterThanOrEqual(needs);
      }
    });
  }
});
