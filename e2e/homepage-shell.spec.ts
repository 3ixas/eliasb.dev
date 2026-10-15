import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { featuredSlugs, projects } from "../src/content/projects";
import { howIWork } from "../src/content/stretch/how-i-work";
import { offTheClock } from "../src/content/stretch/off-the-clock";
import { hero, sayHello, siteCopy, thingsIMake } from "../src/content/stretch/site-copy";
import { work } from "../src/content/stretch/work";
import { renderedContrast } from "./support/rendered-contrast";

const menuLabels = siteCopy.menu.map(({ label }) => label);

const sections = [
  { id: "work", heading: work.heading, note: null },
  { id: "things-i-make", heading: thingsIMake.heading, note: thingsIMake.note(projects.length, featuredSlugs.length) },
  { id: "how-i-work", heading: howIWork.heading, note: howIWork.note },
  { id: "off-the-clock", heading: offTheClock.heading, note: offTheClock.note },
  { id: "say-hello", heading: "Say hello", note: null },
];

test.describe("Homepage shell", () => {
  test("six sections in order, the five after the hero anchored", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("#main-content");
    await expect(main.locator("> section")).toHaveCount(6);
    expect(await main.locator("> section").evaluateAll((all) => all.map((section) => section.id))).toEqual([
      "",
      ...sections.map((section) => section.id),
    ]);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(`${hero.headline.lead} ${hero.headline.emphasis}`);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(sections.map((section) => section.id === "say-hello" ? sayHello.bigLink : section.heading));
  });

  for (const { id, heading, note } of sections.filter(({ id }) => id !== "say-hello")) {
    test(`${heading} has its giant heading${note ? ", mono note and true count" : ""}`, async ({ page }) => {
      await page.goto("/");
      const section = page.locator(`section#${id}`);
      const title = section.getByRole("heading", { level: 2, name: heading, exact: true });
      await expect(title).toHaveCSS("text-transform", "uppercase");
      await expect(title).toHaveCSS("font-weight", "800");
      expect(await title.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(64);
      if (note) await expect(section.locator(".stretch-note")).toHaveText(note);
      else await expect(section.locator(".stretch-note")).toHaveCount(0);
    });
  }

  test("Things I make is introduced by what the hero used to say", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#things-i-make");
    await expect(section.getByRole("heading", { level: 2, name: thingsIMake.heading })).toBeVisible();
    const intro = section.locator(".stretch-intro");
    await expect(intro).toContainText(thingsIMake.intro.lead);
    await expect(intro).toContainText(thingsIMake.intro.support);
    // The intro sits between the heading and the Featured work tiles.
    const [head, introBox, tiles] = await Promise.all(
      [section.locator(".stretch-section__head"), intro, section.locator(".stretch-tile").first()].map(async (locator) => (await locator.boundingBox())!),
    );
    expect(introBox.y).toBeGreaterThanOrEqual(head.y + head.height - 1);
    expect(introBox.y + introBox.height).toBeLessThanOrEqual(tiles.y);
  });

  test("the counts are the catalogue's: 06 built, 03 featured", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#things-i-make .stretch-note")).toHaveText("06 things I’ve built · 03 I’m proudest of");
  });

  test("the header links jump to each section, below the sticky header", async ({ page }) => {
    // The phone header, with its menu dialog, is its own ticket (#121).
    test.skip((page.viewportSize()?.width ?? 0) < 761, "Desktop header");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(nav.getByRole("link")).toHaveText(menuLabels);
    const headerBottom = await page.locator("[data-stretch-header]").evaluate((header) => header.getBoundingClientRect().bottom);
    for (const [index, { id, heading }] of sections.entries()) {
      await nav.getByRole("link", { name: siteCopy.menu[index].label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      const top = await page.locator(`section#${id}`).getByRole("heading", { name: heading, exact: true }).evaluate((element) => element.getBoundingClientRect().top);
      expect(top, id).toBeGreaterThanOrEqual(headerBottom - 1);
    }
  });

  test("the header stays in view while the page scrolls", async ({ page }) => {
    await page.goto("/");
    await page.mouse.wheel(0, 1200);
    await expect(page.locator("[data-stretch-header]")).toBeInViewport();
  });

  test("the footer says who made it", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toHaveText(siteCopy.footer);
  });

  test("the Board is no longer served at /", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-board-header], [data-board-surface], [data-pin]")).toHaveCount(0);
  });

  test("the title and description are the approved copy", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(siteCopy.titleHome);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", siteCopy.description);
  });
});

test.describe("The header greeting", () => {
  // Phones keep it in the menu dialog (phone-header.spec.ts); the header itself shows it from 761 px.
  test.beforeEach(({ viewport }) => {
    test.skip((viewport?.width ?? 0) < 761, "Header layout");
  });

  const greeting = (page: Page) => page.locator("[data-greeting]:visible");
  const shownText = (page: Page) => greeting(page).locator(".stretch-greeting");

  // Whole hours in a zone with no daylight saving, so the visitor's hour is exactly the hour asked for.
  for (const [hour, key] of [
    [4, "late"], [5, "morning"], [11, "morning"], [12, "afternoon"], [17, "afternoon"], [18, "evening"], [21, "evening"], [22, "late"],
  ] as const) {
    test(`${String(hour).padStart(2, "0")}:30 on the visitor's clock says "${siteCopy.greeting[key]}"`, async ({ browser }) => {
      const context = await browser.newContext({ timezoneId: "Etc/GMT" });
      const page = await context.newPage();
      await page.clock.setFixedTime(new Date(Date.UTC(2026, 9, 15, hour, 30)));
      await page.goto("/");
      await expect(greeting(page)).toHaveAttribute("data-greeting", key);
      await expect(shownText(page)).toHaveText(siteCopy.greeting[key]);
      await context.close();
    });
  }

  test("follows the visitor's time zone, not London's", async ({ browser }) => {
    const at = new Date("2026-10-15T20:00:00Z");
    // 09:00 in Auckland, 13:00 in Los Angeles, 21:00 in London.
    for (const [timezoneId, key] of [["Pacific/Auckland", "morning"], ["America/Los_Angeles", "afternoon"], ["Europe/London", "evening"]] as const) {
      const context = await browser.newContext({ timezoneId });
      const page = await context.newPage();
      await page.clock.setFixedTime(at);
      await page.goto("/");
      await expect(greeting(page), timezoneId).toHaveAttribute("data-greeting", key);
      await context.close();
    }
  });

  test("the server-rendered page says Hello, so hydration matches", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.goto("/");
    await expect(page.locator("[data-greeting]").first()).toHaveAttribute("data-greeting", "hello");
    await expect(page.locator("[data-greeting]").first().locator(".stretch-greeting")).toHaveText(siteCopy.greeting.hello);
  });

  test("the pill is the same width before and after the greeting appears", async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: "Etc/GMT" });
    const without = await context.newPage();
    await without.route("**/*.js", (route) => route.abort());
    await without.goto("/");
    const before = await greeting(without).boundingBox();
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date("2026-10-15T14:00:00Z"));
    await page.goto("/");
    await expect(greeting(page)).toHaveAttribute("data-greeting", "afternoon");
    const after = await greeting(page).boundingBox();
    expect(after!.width).toBeCloseTo(before!.width, 1);
    expect(after!.height).toBeCloseTo(before!.height, 1);
    // The shown text shares the reservation's cell, so it sits in the pill's middle, not a row below.
    const text = (await shownText(page).locator("span").boundingBox())!;
    expect(text.y + text.height / 2).toBeCloseTo(after!.y + after!.height / 2, 0);
    await context.close();
  });

  test("is not a live region, and does not animate", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const pill = greeting(page);
    expect(await pill.evaluate((element) => element.closest("[aria-live], [role=status], [role=alert], [role=log]") === null)).toBe(true);
    expect(await pill.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
    // The text the page holds is the one greeting; the width reservation is not in the document.
    await expect(pill).toHaveText(/^(Hello|Good morning|Good afternoon|Good evening|Still up\?)$/);
  });
});

test.describe("Accessibility and contrast", () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== "chromium", "Measured in Chromium");
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`axe reports no violations on the shell (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto("/");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
      expect(results.violations).toEqual([]);
    });

    test(`the header, headings and notes meet WCAG 2.2 AA (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto("/");
      const readings = await renderedContrast(page);
      const texts = readings.map((reading) => reading.text);
      // The greeting is hydrated by now, and the pill, nav, headings and notes were measured.
      for (const expected of [siteCopy.menu[0].label, siteCopy.menu[4].label, thingsIMake.heading, thingsIMake.note(projects.length, featuredSlugs.length)]) {
        expect(texts.some((text) => text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });
  }
});
