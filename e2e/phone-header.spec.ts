import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { siteCopy } from "../src/content/stretch/site-copy";

const menuLabels = siteCopy.menu.map(({ label }) => label);

const header = (page: Page) => page.locator("[data-stretch-header]");
const menuButton = (page: Page) => page.getByRole("button", { name: "Menu" });
const dialog = (page: Page) => page.getByRole("dialog", { name: "Menu" });
const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 900;
const overflows = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

/** Every visible link and button inside the scope, with its rendered height. */
const targets = (page: Page, scope: string) =>
  page.locator(`${scope} a, ${scope} button`).evaluateAll((elements) =>
    elements
      .filter((element) => element.checkVisibility())
      .map((element) => ({ name: element.textContent?.trim() ?? "", height: element.getBoundingClientRect().height, width: element.getBoundingClientRect().width })),
  );

test.describe("Phone header and menu", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(phone(page) === false, "Phone layout");
    await page.goto("/");
  });

  test("the header shows the theme button and Menu only, with no greeting", async ({ page }) => {
    const visible = await header(page).locator("a, button, p, nav").evaluateAll((elements) =>
      elements
        .filter((element) => element.checkVisibility() && !element.matches(".stretch-skip"))
        .map((element) => (element as HTMLElement).innerText.trim() || element.getAttribute("aria-label")),
    );
    expect(visible).toEqual(["Dark theme", "Menu"]);
    const box = (await page.getByRole("button", { name: "Dark theme" }).boundingBox())!;
    expect([box.width, box.height]).toEqual([44, 44]);
    await expect(page.locator("[data-greeting]:visible")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
  });

  test("Menu opens a full-screen dialog with the greeting and the section names", async ({ page }) => {
    await menuButton(page).click();
    const menu = dialog(page);
    await expect(menu).toBeVisible();
    const box = (await menu.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.width).toBe(viewport.width);
    expect(box.height).toBe(viewport.height);
    await expect(menu.locator("[data-greeting]")).toHaveAttribute("data-greeting", /^(morning|afternoon|evening|late)$/);
    await expect(menu.getByRole("navigation", { name: "Primary navigation" }).getByRole("link")).toHaveText(menuLabels);
    await expect(menu.getByRole("link", { name: "Things I make", exact: true })).toHaveCSS("text-transform", "uppercase");
  });

  test("focus moves to Close on open, and back to Menu on Close", async ({ page }) => {
    await menuButton(page).click();
    await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });

  test("Escape closes the menu and focus returns to Menu", async ({ page }) => {
    await menuButton(page).click();
    await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });

  test("choosing a section closes the menu and moves focus to that section", async ({ page }) => {
    await menuButton(page).click();
    await dialog(page).getByRole("link", { name: "How I work" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(page.locator("#how-i-work")).toBeFocused();
    expect(await page.evaluate(() => location.hash)).toBe("#how-i-work");
    // The section is a place to start from, not a control, so it wears no focus ring.
    expect(await page.locator("#how-i-work").evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");
  });

  test("focus stays inside the open menu", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Safari does not tab through links by default");
    await menuButton(page).click();
    const inside = () => page.evaluate(() => !!document.activeElement?.closest("dialog.stretch-menu"));
    for (let press = 0; press < 8; press++) {
      await page.keyboard.press("Tab");
      expect(await inside(), `after Tab ${press + 1}`).toBe(true);
    }
    for (let press = 0; press < 8; press++) {
      await page.keyboard.press("Shift+Tab");
      expect(await inside(), `after Shift+Tab ${press + 1}`).toBe(true);
    }
  });

  for (const label of [menuLabels[0], menuLabels[menuLabels.length - 1]]) {
    test(`${label} closes the menu and jumps to its section`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      // Pressed with a real pointer so the page is still at the top: the jump is then the only scrolling.
      const button = (await menuButton(page).boundingBox())!;
      await page.mouse.click(button.x + button.width / 2, button.y + button.height / 2);
      const link = dialog(page).getByRole("link", { name: label, exact: true });
      const id = (await link.getAttribute("href"))!.slice(1);
      await link.click();
      await expect(dialog(page)).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      // scroll-padding-top leaves the section just under the sticky header, or the page has run out of room (the last one).
      const sits = () =>
        page.evaluate((target) => {
          const top = document.getElementById(target)!.getBoundingClientRect().top;
          const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
          const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
          return { moved: window.scrollY > 0, offset: top >= padding - 2 && (top <= padding + 2 || atEnd) };
        }, id);
      await expect.poll(sits).toEqual({ moved: true, offset: true });
      await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    });
  }

  test("a modified click on a section name leaves the page where it was", async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);
    const button = (await menuButton(page).boundingBox())!;
    await page.mouse.click(button.x + button.width / 2, button.y + button.height / 2);
    // Control-click opens the section in a new tab (Meta does on a Mac); this page does not navigate.
    await dialog(page).getByRole("link", { name: menuLabels[menuLabels.length - 1], exact: true }).click({ modifiers: ["ControlOrMeta"] });
    await expect(dialog(page)).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);
    await expect(page).not.toHaveURL(/#/);
    await Promise.all(context.pages().filter((other) => other !== page).map((other) => other.close()));
  });

  test("every target is at least 44 px tall, in the header and in the menu", async ({ page }) => {
    for (const reading of await targets(page, "[data-stretch-header]")) expect(reading.height, reading.name).toBeGreaterThanOrEqual(44);
    await menuButton(page).click();
    const inMenu = await targets(page, "dialog.stretch-menu");
    expect(inMenu.length).toBe(1 + siteCopy.menu.length);
    for (const reading of inMenu) {
      expect(reading.height, reading.name).toBeGreaterThanOrEqual(44);
      expect(reading.width, reading.name).toBeGreaterThanOrEqual(44);
    }
  });

  test("the page never scrolls sideways, closed or open", async ({ page }) => {
    expect(await overflows(page)).toBe(false);
    await menuButton(page).click();
    expect(await overflows(page)).toBe(false);
    const names = await dialog(page).getByRole("link").evaluateAll((links) => links.map((link) => link.scrollWidth <= (link.parentElement?.clientWidth ?? 0)));
    expect(names, "the big names fit the screen").toEqual(names.map(() => true));
  });

  test("the theme button works from the phone header, and the open menu follows the theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.reload();
    await page.getByRole("button", { name: "Dark theme", pressed: false }).click();
    await expect(page.getByRole("button", { name: "Dark theme", pressed: true })).toBeVisible();
    await menuButton(page).click();
    await expect(dialog(page)).toHaveCSS("background-color", "rgb(13, 13, 18)");
  });

  test("axe reports no violations with the menu open", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Measured in Chromium");
    await menuButton(page).click();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("growing the window to the desktop layout closes the menu", async ({ page }) => {
    await menuButton(page).click();
    await expect(dialog(page)).toBeVisible();
    await page.setViewportSize({ width: 1100, height: 800 });
    await expect(dialog(page)).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  });
});

// 760 and 761 straddle the old phone breakpoint, 899 and 900 the current one.
for (const width of [760, 761, 820, 899, 900, 901]) {
  test(`${width} px: the header is one row, ${width < 900 ? "the theme button and Menu" : "the greeting, theme button and links"}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    // The visible controls depend on hydration, so read the header until it settles.
    const rows = () =>
      header(page).evaluate((element) => {
        const tops = [...element.querySelectorAll<HTMLElement>(".stretch-header__inner p, .stretch-header__inner a, .stretch-header__inner button")]
          .filter((child) => child.checkVisibility() && !child.matches(".stretch-skip"))
          .map((child) => Math.round(child.getBoundingClientRect().top));
        return { tops: new Set(tops).size, height: element.getBoundingClientRect().height };
      });
    await expect.poll(async () => (await rows()).height, { message: "header height" }).toBeLessThanOrEqual(80);
    if (width < 900) {
      await expect.poll(async () => (await rows()).tops, { message: "the theme button and Menu share a row" }).toBe(1);
      await expect(menuButton(page)).toBeVisible();
      await expect(page.locator("[data-greeting]:visible")).toHaveCount(0);
    } else {
      await expect(menuButton(page)).toBeHidden();
      await expect(page.locator("[data-greeting]:visible")).toHaveCount(1);
    }
    expect(await overflows(page)).toBe(false);
    await context.close();
  });
}

test("every width from 761 to 899 px keeps the header on one row with Menu", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 761, height: 900 } });
  const page = await context.newPage();
  await page.goto("/");
  const heights = new Set<number>();
  for (const width of [761, 768, 800, 834, 860, 880, 895, 899]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(menuButton(page), `${width} px`).toBeVisible();
    heights.add(await header(page).evaluate((element) => Math.round(element.getBoundingClientRect().height)));
  }
  expect([...heights], "one height at every width").toHaveLength(1);
  await context.close();
});

test("without script the section links stay on the phone header", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link")).toHaveText(menuLabels);
  await expect(menuButton(page)).toBeHidden();
  expect(await overflows(page)).toBe(false);
  await context.close();
});

test.describe("Desktop", () => {
  test("there is no Menu button, and the greeting and links are in the header", async ({ page }) => {
    test.skip(phone(page), "Desktop layout");
    await page.goto("/");
    await expect(menuButton(page)).toBeHidden();
    await expect(page.locator("[data-greeting]:visible")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link")).toHaveText(menuLabels);
  });
});
