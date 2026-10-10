import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { featuredSlugs, projects } from "../src/content/projects";
import { careerLog } from "../src/content/stretch/career";
import { howIWork } from "../src/content/stretch/how-i-work";
import { offTheClock } from "../src/content/stretch/off-the-clock";
import { hero, sayHello, siteCopy, workSection } from "../src/content/stretch/site-copy";
import { renderedContrast } from "./support/rendered-contrast";

const menuLabels = siteCopy.menu.map(({ label }) => label);

const sections = [
  { id: "work", heading: "Work", note: workSection.note(projects.length, featuredSlugs.length) },
  { id: "how-i-work", heading: howIWork.heading, note: howIWork.note },
  { id: "where-ive-been", heading: careerLog.heading, note: careerLog.note },
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

  test("the counts are the catalogue's: 06 built, 03 featured", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#work .stretch-note")).toHaveText("06 things I’ve built · 03 I’m proudest of");
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

test.describe("The London clock", () => {
  // Far from London in both directions, so the clock can't be reading the device.
  for (const timezoneId of ["Pacific/Auckland", "America/Los_Angeles"]) {
    test(`shows London's time from ${timezoneId}`, async ({ browser }) => {
      const context = await browser.newContext({ timezoneId });
      const page = await context.newPage();
      await page.goto("/");
      const clock = page.locator("[data-london-clock]");
      await expect(clock).toHaveAttribute("data-london-clock", /^\d\d:\d\d$/);
      const shown = (await clock.getAttribute("data-london-clock"))!;
      const london = (date: Date) =>
        new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
      // The minute may tick between the page's read and ours.
      expect([london(new Date()), london(new Date(Date.now() - 60_000))]).toContain(shown);
      await expect(clock).toContainText(`London ${shown}`);
      await expect(clock.locator(".sr-only")).toHaveText(`The time in London: ${shown}`);
      await context.close();
    });
  }

  test("the server-rendered page shows 'London' with no time, so hydration matches", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.goto("/");
    await expect(page.locator("[data-london-clock]")).toHaveText("London");
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
      // The clock is hydrated by now, and the pill, nav, headings and notes were measured.
      for (const expected of [siteCopy.menu[0].label, siteCopy.menu[4].label, "Work", workSection.note(projects.length, featuredSlugs.length)]) {
        expect(texts.some((text) => text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });
  }
});
