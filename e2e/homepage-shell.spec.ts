import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { howIWork } from "../src/content/stretch/how-i-work";
import { offTheClock } from "../src/content/stretch/off-the-clock";
import { opening } from "../src/content/stretch/opening";
import { greetingLine } from "../src/content/stretch/greeting";
import { siteCopy, thingsIMake } from "../src/content/stretch/site-copy";
import { work } from "../src/content/stretch/work";
import { renderedContrast } from "./support/rendered-contrast";

const menuLabels = siteCopy.menu.map(({ label }) => label);

const sections = [
  { id: "work", heading: work.heading, note: work.note },
  { id: "things-i-make", heading: thingsIMake.heading, note: thingsIMake.note },
  { id: "how-i-work", heading: howIWork.heading, note: howIWork.note },
  { id: "off-the-clock", heading: offTheClock.heading, note: offTheClock.note },
  { id: "say-hello", heading: "Say hello", note: null },
];

test.describe("Homepage shell", () => {
  test("six sections in order, the five after the opening anchored", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("#main-content");
    await expect(main.locator("> section")).toHaveCount(6);
    expect(await main.locator("> section").evaluateAll((all) => all.map((section) => section.id))).toEqual([
      "",
      ...sections.map((section) => section.id),
    ]);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(opening.headline);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(sections.map((section) => section.id === "say-hello" ? "Say hello" : section.heading));
  });

  // Work is the first section in the quiet index's language: a 17 px title and a 15 px note, not a giant heading (#291).
  test("Work has a quiet title and its note", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section#work");
    const title = section.getByRole("heading", { level: 2, name: work.heading, exact: true });
    await expect(title).toHaveCSS("font-size", "17px");
    await expect(title).toHaveCSS("font-weight", "650");
    await expect(section.locator(".qi-note-line").first()).toHaveText(work.note);
  });

  test("Off the clock has a quiet title and its note", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section#off-the-clock");
    const title = section.getByRole("heading", { level: 2, name: offTheClock.heading, exact: true });
    await expect(title).toHaveCSS("font-size", "17px");
    await expect(title).toHaveCSS("font-weight", "650");
    await expect(section.locator(".qi-note-line").first()).toHaveText(offTheClock.note);
  });

  test("Things I make has a quiet title and its note", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section#things-i-make");
    const title = section.getByRole("heading", { level: 2, name: thingsIMake.heading, exact: true });
    await expect(title).toHaveCSS("font-size", "17px");
    await expect(title).toHaveCSS("font-weight", "650");
    await expect(section.locator(".qi-note-line").first()).toHaveText(thingsIMake.note);
  });

  test("How I work has a quiet title and its note", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section#how-i-work");
    const title = section.getByRole("heading", { level: 2, name: howIWork.heading, exact: true });
    await expect(title).toHaveCSS("font-size", "17px");
    await expect(title).toHaveCSS("font-weight", "650");
    await expect(section.locator(".qi-note-line").first()).toHaveText(howIWork.note);
  });

  test("the header links jump to each section, below the sticky header, and underline the one in view", async ({ page }) => {
    // Below 900 px there are no links at all (the next test).
    test.skip((page.viewportSize()?.width ?? 0) < 900, "Desktop header");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: siteCopy.header.linksLabel });
    await expect(nav.getByRole("link")).toHaveText(menuLabels);
    expect(await nav.getByRole("link").evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(sections.map(({ id }) => `#${id}`));
    // At the top, before the first section, no link is current.
    await expect(nav.locator("[aria-current]")).toHaveCount(0);
    const headerBottom = await page.locator("[data-stretch-header]").evaluate((header) => header.getBoundingClientRect().bottom);
    for (const [index, { id, heading }] of sections.entries()) {
      const link = nav.getByRole("link", { name: siteCopy.menu[index].label, exact: true });
      await link.click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      const top = await page.locator(`section#${id}`).getByRole("heading", { name: heading, exact: true }).evaluate((element) => element.getBoundingClientRect().top);
      expect(top, id).toBeGreaterThanOrEqual(headerBottom - 1);
      // Only the section in view is current, and it is underlined.
      await expect(nav.locator("[aria-current]")).toHaveCount(1);
      await expect(link).toHaveAttribute("aria-current", "location");
      await expect(link).toHaveCSS("text-decoration-line", "underline");
    }
  });

  test("the links are quiet: muted 15 px text, turning ink on hover", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 900, "Desktop header");
    await page.goto("/");
    const link = page.getByRole("navigation", { name: siteCopy.header.linksLabel }).getByRole("link", { name: "How I work", exact: true });
    await expect(link).toHaveCSS("font-size", "15px");
    await expect(link).toHaveCSS("text-decoration-line", "none");
    const muted = await link.evaluate((element) => getComputedStyle(element).color);
    await link.hover();
    await expect.poll(() => link.evaluate((element) => getComputedStyle(element).color)).not.toBe(muted);
  });

  test("phones have no menu: no links, no menu button, no dialog and no focus trap, and the greeting sits under the name", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) >= 900, "Phone header");
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: siteCopy.header.linksLabel })).toBeHidden();
    await expect(page.getByRole("button", { name: "Menu", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Close", exact: true })).toHaveCount(0);
    await expect(page.locator("dialog, [aria-haspopup]")).toHaveCount(0);
    const name = (await page.locator(".qi-header__name").boundingBox())!;
    const greeting = (await page.locator("[data-greeting]").boundingBox())!;
    expect(greeting.y).toBeGreaterThanOrEqual(name.y + name.height - 1);
    // In line with the name, not with the portrait: the greeting's scene starts a few px left of the name's text.
    expect(greeting.x).toBeGreaterThanOrEqual(name.x - 14);
    // The greeting is a button on a phone, so it is a tab stop.
    await expect(page.locator("[data-greeting]")).toHaveAttribute("tabindex", "0");
  });

  test("on a phone Tab walks the page's own controls: the skip link, the portrait, the greeting, then the Eclipse, and nothing traps focus", async ({ page, browserName }) => {
    test.skip((page.viewportSize()?.width ?? 0) >= 900, "Phone header");
    test.skip(browserName === "webkit", "Safari does not Tab to links by default");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator(".stretch-skip")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "A closer look at Elias", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("[data-greeting]")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("[data-eclipse]")).toBeFocused();
  });

  test("the header has the portrait as a 40 px circle, the name, the greeting and the Eclipse, and never scrolls sideways", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("[data-stretch-header]");
    const face = header.locator(".qi-header__face");
    await expect(face).toBeVisible();
    const box = (await face.boundingBox())!;
    expect([box.width, box.height]).toEqual([40, 40]);
    await expect(face).toHaveCSS("border-top-left-radius", "50%");
    await expect.poll(() => face.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(header.locator(".qi-header__name")).toHaveText("Elias Bennett");
    await expect(header.locator("[data-greeting]")).toBeVisible();
    await expect(header.locator("[data-eclipse]")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    // Every control in the header is at least 44 px.
    for (const control of await header.locator("a[href]:visible, button:visible").all()) {
      if ((await control.getAttribute("class"))?.includes("stretch-skip")) continue;
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("the header stays in view while the page scrolls", async ({ page }) => {
    await page.goto("/");
    await page.mouse.wheel(0, 1200);
    await expect(page.locator("[data-stretch-header]")).toBeInViewport();
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
  const greeting = (page: Page) => page.locator("[data-greeting]");
  const shownText = (page: Page) => greeting(page).locator(".qi-greeting__words > span");
  /** The animation a part of the scene is running now ("none" when it rests). */
  const playing = (page: Page, part: string) => page.locator(`.qi-scene__${part}`).evaluate((element) => getComputedStyle(element).animationName);

  // Whole hours in a zone with no daylight saving, so the visitor's hour is exactly the hour asked for. 15 October 2026 is a Thursday.
  for (const [hour, key] of [
    [4, "late"], [5, "morning"], [11, "morning"], [12, "afternoon"], [17, "afternoon"], [18, "evening"], [21, "evening"], [22, "late"],
  ] as const) {
    test(`${String(hour).padStart(2, "0")}:30 on the visitor's clock says "${greetingLine(key, false)}"`, async ({ browser }) => {
      const context = await browser.newContext({ timezoneId: "Etc/GMT" });
      const page = await context.newPage();
      await page.clock.setFixedTime(new Date(Date.UTC(2026, 9, 15, hour, 30)));
      await page.goto("/");
      await expect(greeting(page)).toHaveAttribute("data-greeting", key);
      await expect(shownText(page)).toHaveText(greetingLine(key, false));
      await context.close();
    });
  }

  // Only the afternoon knows the day, and it is the visitor's own: 16 October 2026 is a Friday, 17 a Saturday, 18 a Sunday.
  for (const [at, key, line] of [
    ["2026-10-16T17:30:00Z", "afternoon", "Nearly five?"],
    ["2026-10-16T18:00:00Z", "evening", "Home yet?"],
    ["2026-10-17T11:59:00Z", "morning", "Kettle’s on."],
    ["2026-10-17T12:00:00Z", "afternoon", "Nowhere to be?"],
    ["2026-10-17T14:00:00Z", "afternoon", "Nowhere to be?"],
    ["2026-10-18T17:59:00Z", "afternoon", "Nowhere to be?"],
    ["2026-10-18T18:00:00Z", "evening", "Home yet?"],
    ["2026-10-17T23:00:00Z", "late", "Still up?"],
  ] as const) {
    test(`${at} on the visitor's clock says "${line}"`, async ({ browser }) => {
      const context = await browser.newContext({ timezoneId: "Etc/GMT" });
      const page = await context.newPage();
      await page.clock.setFixedTime(new Date(at));
      await page.goto("/");
      await expect(greeting(page)).toHaveAttribute("data-greeting", key);
      await expect(shownText(page)).toHaveText(line);
      await context.close();
    });
  }

  test("the day is the visitor's own, not London's", async ({ browser }) => {
    // 12:00 on Saturday in Auckland is 16:00 on Friday in Los Angeles, and midnight in London.
    const at = new Date("2026-10-16T23:00:00Z");
    for (const [timezoneId, line] of [["Pacific/Auckland", "Nowhere to be?"], ["America/Los_Angeles", "Nearly five?"]] as const) {
      const context = await browser.newContext({ timezoneId });
      const page = await context.newPage();
      await page.clock.setFixedTime(at);
      await page.goto("/");
      await expect(shownText(page), timezoneId).toHaveText(line);
      await context.close();
    }
  });

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
    await expect(greeting(page)).toHaveAttribute("data-greeting", "hello");
    await expect(shownText(page)).toHaveText(siteCopy.greeting.hello);
    // Hello has a terminal prompt with a cursor, and nothing of the day.
    await expect(page.locator(".qi-scene")).toBeVisible();
    await expect(page.locator(".qi-scene > *")).toHaveCount(2);
    await expect(page.locator(".qi-scene__cursor")).toHaveCount(1);
  });

  test("the words are the same width before and after the greeting appears", async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: "Etc/GMT" });
    const without = await context.newPage();
    await without.route("**/*.js", (route) => route.abort());
    await without.goto("/");
    const before = await greeting(without).boundingBox();
    // The longest line is the weekend afternoon's, so every line, on every day, takes the same room.
    for (const [at, key] of [["2026-10-15T14:00:00Z", "afternoon"], ["2026-10-17T14:00:00Z", "afternoon"], ["2026-10-15T08:00:00Z", "morning"], ["2026-10-15T23:00:00Z", "late"]] as const) {
      const page = await context.newPage();
      await page.clock.setFixedTime(new Date(at));
      await page.goto("/");
      await expect(greeting(page)).toHaveAttribute("data-greeting", key);
      const after = await greeting(page).boundingBox();
      expect(after!.width, at).toBeCloseTo(before!.width, 1);
      expect(after!.height, at).toBeCloseTo(before!.height, 1);
      // The shown text shares the reservation's cell, so it sits in the middle, not a row below.
      const text = (await shownText(page).boundingBox())!;
      expect(text.y + text.height / 2, at).toBeCloseTo(after!.y + after!.height / 2, 0);
    }
    await context.close();
  });

  test("is not a live region", async ({ page }) => {
    await page.goto("/");
    expect(await greeting(page).evaluate((element) => element.closest("[aria-live], [role=status], [role=alert], [role=log]") === null)).toBe(true);
    // The text the page holds is the one greeting; the width reservation is not in the document.
    await expect(greeting(page)).toHaveText(/^(Hello|Kettle’s on\.|Nearly five\?|Nowhere to be\?|Home yet\?|Still up\?)$/);
  });

  // The scene for each line: its own object, and none of another's.
  const parts = ["ink", "cursor", "steam", "minute", "pool", "lit", "horizon", "moon", "star"] as const;
  for (const [at, key, drawn] of [
    ["2026-10-15T08:00:00Z", "morning", { ink: 2, steam: 1, horizon: 1 }],
    ["2026-10-15T14:00:00Z", "afternoon", { ink: 3, minute: 1, lit: 1 }],
    ["2026-10-17T14:00:00Z", "afternoon", { ink: 3, minute: 1, lit: 1 }],
    ["2026-10-15T19:00:00Z", "evening", { ink: 2, pool: 1, lit: 1, horizon: 1 }],
    ["2026-10-15T23:00:00Z", "late", { moon: 1, star: 3 }],
  ] as const) {
    test(`the ${key} scene is drawn for ${at}`, async ({ browser }) => {
      const context = await browser.newContext({ timezoneId: "Etc/GMT" });
      const page = await context.newPage();
      await page.clock.setFixedTime(new Date(at));
      await page.goto("/");
      await expect(greeting(page)).toHaveAttribute("data-greeting", key);
      for (const part of parts) await expect(page.locator(`.qi-scene__${part}`), part).toHaveCount((drawn as Record<string, number>)[part] ?? 0);
      await context.close();
    });
  }

  test("the amber is the lamp's bulb and pool and the clock's pivot, and the cursor is cobalt", async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: "Etc/GMT" });
    const fillOf = (page: Page, part: string) => page.locator(`.qi-scene__${part}`).evaluate((element) => getComputedStyle(element).fill);
    const sun = (page: Page) => page.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.color = getComputedStyle(document.documentElement).getPropertyValue("--sun");
      document.body.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });
    const evening = await context.newPage();
    await evening.clock.setFixedTime(new Date("2026-10-15T19:00:00Z"));
    await evening.goto("/");
    await expect(greeting(evening)).toHaveAttribute("data-greeting", "evening");
    expect(await fillOf(evening, "lit")).toBe(await sun(evening));
    expect(await fillOf(evening, "pool")).toBe(await sun(evening));
    const afternoon = await context.newPage();
    await afternoon.clock.setFixedTime(new Date("2026-10-15T14:00:00Z"));
    await afternoon.goto("/");
    await expect(greeting(afternoon)).toHaveAttribute("data-greeting", "afternoon");
    expect(await fillOf(afternoon, "lit")).toBe(await sun(afternoon));
    const hello = await context.newPage();
    await hello.route("**/*.js", (route) => route.abort());
    await hello.goto("/");
    const cursor = await hello.locator(".qi-scene__cursor").evaluate((element) => getComputedStyle(element).stroke);
    const cobalt = await hello.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.color = getComputedStyle(document.documentElement).getPropertyValue("--stretch-cobalt");
      document.body.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });
    expect(cursor).toBe(cobalt);
    await context.close();
  });

  test("the morning scene plays on load: the steam curls, and rests again with reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: "Etc/GMT", reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date("2026-10-15T08:00:00Z"));
    await page.goto("/");
    await expect(greeting(page)).toHaveAttribute("data-greeting", "morning");
    await expect(greeting(page)).toHaveAttribute("data-playing", "true");
    expect(await playing(page, "steam")).toBe("qi-steam");
    // When the play is over the kettle is just drawn, and nothing is left running.
    await expect(greeting(page)).not.toHaveAttribute("data-playing", /.*/, { timeout: 8000 });
    expect(await playing(page, "steam")).toBe("none");
    await context.close();

    const calm = await browser.newContext({ timezoneId: "Etc/GMT", reducedMotion: "reduce" });
    const resting = await calm.newPage();
    await resting.clock.setFixedTime(new Date("2026-10-15T08:00:00Z"));
    await resting.goto("/");
    await expect(resting.locator("[data-greeting]")).toHaveAttribute("data-playing", "true");
    // It was told to play, and it stayed where it was.
    expect(await playing(resting, "steam")).toBe("none");
    await resting.locator("[data-greeting]").hover();
    expect(await playing(resting, "steam")).toBe("none");
    await calm.close();
  });

  test("the clock's minute hand ticks up on load, and the lamp's pool fades in again on hover", async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: "Etc/GMT", reducedMotion: "no-preference" });
    const clock = await context.newPage();
    await clock.clock.setFixedTime(new Date("2026-10-15T14:00:00Z"));
    await clock.goto("/");
    await expect(greeting(clock)).toHaveAttribute("data-playing", "true");
    expect(await playing(clock, "minute")).toBe("qi-minute");

    const lamp = await context.newPage();
    await lamp.clock.setFixedTime(new Date("2026-10-15T19:00:00Z"));
    await lamp.goto("/");
    await expect(greeting(lamp)).toHaveAttribute("data-greeting", "evening");
    await expect(greeting(lamp)).not.toHaveAttribute("data-playing", /.*/, { timeout: 8000 });
    expect(await playing(lamp, "pool")).toBe("none");
    await greeting(lamp).hover();
    expect(await playing(lamp, "pool")).toBe("qi-pool");
    await context.close();
  });

  test("Hello's cursor blinks, and holds still with reduced motion", async ({ browser }) => {
    for (const [reducedMotion, name] of [["no-preference", "qi-cursor"], ["reduce", "none"]] as const) {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      await page.route("**/*.js", (route) => route.abort());
      await page.goto("/");
      expect(await playing(page, "cursor"), reducedMotion).toBe(name);
      await context.close();
    }
  });

  test("on a wide screen hover adds London's time without widening anything", async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: "America/Los_Angeles", viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
    const page = await context.newPage();
    // 13:28 UTC is 14:28 in London in October, and 06:28 for this visitor.
    await page.clock.setFixedTime(new Date("2026-10-15T13:28:00Z"));
    await page.goto("/");
    await expect(greeting(page)).toHaveAttribute("data-greeting", "morning");
    const before = (await greeting(page).boundingBox())!;
    const scrollWidth = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const more = page.locator(".qi-greeting__more");
    await expect(more).toHaveCSS("opacity", "0");
    await greeting(page).hover();
    await expect(more).toHaveText(siteCopy.header.londonTime("14:28"));
    await expect(more).toHaveCSS("opacity", "1");
    // The links step aside while it shows, and an invisible link cannot be clicked.
    await expect(page.locator(".qi-header__links")).toHaveCSS("opacity", "0");
    await expect(page.locator(".qi-header__links")).toHaveCSS("pointer-events", "none");
    const after = (await greeting(page).boundingBox())!;
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(await scrollWidth()).toBeLessThanOrEqual(0);
    // Keyboard focus shows it too, and the greeting is a tab stop here.
    await page.mouse.move(0, 400);
    await expect(more).toHaveCSS("opacity", "0");
    await greeting(page).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(greeting(page)).toBeFocused();
    await expect(more).toHaveCSS("opacity", "1");
    await context.close();
  });

  test("below a wide screen the greeting is a button: a tap opens London's time on its own line, and a second tap puts it away", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto("/");
    await expect(greeting(page)).toHaveAttribute("data-greeting", /^(morning|afternoon|evening|late)$/);
    await expect(greeting(page)).toHaveAttribute("role", "button");
    await expect(greeting(page)).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".qi-greeting__more")).toBeHidden();
    await greeting(page).tap();
    await expect(greeting(page)).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".qi-greeting__more")).toHaveText(/^it’s \d\d:\d\d here in London$/);
    const [words, more] = await Promise.all([page.locator(".qi-greeting__words").boundingBox(), page.locator(".qi-greeting__more").boundingBox()]);
    expect(more!.y).toBeGreaterThanOrEqual(words!.y + words!.height - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    await greeting(page).tap();
    await expect(page.locator(".qi-greeting__more")).toBeHidden();
    await context.close();
  });
});

test.describe("The Eclipse", () => {
  test("turns the icon over when pressed, and not with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    // The button's handler exists once it has hydrated, and aria-pressed appears with it.
    await expect(page.locator("[data-eclipse]")).toHaveAttribute("aria-pressed", /^(true|false)$/);
    const turning = () =>
      page.evaluate(() => {
        const icon = document.querySelector("[data-eclipse] svg")!;
        icon.getAnimations().forEach((animation) => animation.cancel());
        document.querySelector<HTMLButtonElement>("[data-eclipse]")!.click();
        return icon.getAnimations().length;
      });
    expect(await turning()).toBe(1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await turning()).toBe(0);
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
      for (const expected of [siteCopy.menu[0].label, siteCopy.menu[4].label, thingsIMake.heading, thingsIMake.note.split(",")[0]]) {
        expect(texts.some((text) => text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });
  }
});
