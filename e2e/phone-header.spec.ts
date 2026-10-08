import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { siteCopy } from "../src/content/stretch/site-copy";

const header = (page: Page) => page.locator("[data-stretch-header]");
const menuButton = (page: Page) => page.getByRole("button", { name: "Menu" });
const dialog = (page: Page) => page.getByRole("dialog", { name: "Menu" });
const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 761;
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

  test("the header shows Lights and Menu only, with no clock", async ({ page }) => {
    const visible = await header(page).locator("a, button, p, nav").evaluateAll((elements) =>
      elements.filter((element) => element.checkVisibility() && !element.matches(".stretch-skip")).map((element) => (element as HTMLElement).innerText.trim()),
    );
    expect(visible).toEqual([expect.stringMatching(/^Lights o(n|ff)$/), "Menu"]);
    await expect(page.locator("[data-london-clock]:visible")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
  });

  test("Menu opens a full-screen dialog with the clock and the section names", async ({ page }) => {
    await menuButton(page).click();
    const menu = dialog(page);
    await expect(menu).toBeVisible();
    const box = (await menu.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.width).toBe(viewport.width);
    expect(box.height).toBe(viewport.height);
    await expect(menu.locator("[data-london-clock]")).toHaveAttribute("data-london-clock", /^\d\d:\d\d$/);
    await expect(menu.locator("[data-london-clock]")).toContainText("London");
    await expect(menu.getByRole("navigation", { name: "Primary navigation" }).getByRole("link")).toHaveText(siteCopy.menu);
    await expect(menu.getByRole("link", { name: "Work", exact: true })).toHaveCSS("text-transform", "uppercase");
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

  test("a section name closes the menu and jumps to its section", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await menuButton(page).click();
    await dialog(page).getByRole("link", { name: "Where I’ve been" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(page).toHaveURL(/#where-ive-been$/);
    const headerBottom = await header(page).evaluate((element) => element.getBoundingClientRect().bottom);
    const top = await page.locator("#where-ive-been h2").evaluate((element) => element.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(headerBottom - 1);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
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

  test("Lights works from the phone header, and the open menu follows the theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.reload();
    await page.getByRole("button", { name: "Lights on" }).click();
    await expect(page.getByRole("button", { name: "Lights off" })).toBeVisible();
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

test("without script the section links stay on the phone header", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link")).toHaveText(siteCopy.menu);
  await expect(menuButton(page)).toBeHidden();
  expect(await overflows(page)).toBe(false);
  await context.close();
});

test.describe("Desktop", () => {
  test("there is no Menu button, and the clock and links are in the header", async ({ page }) => {
    test.skip(phone(page), "Desktop layout");
    await page.goto("/");
    await expect(menuButton(page)).toBeHidden();
    await expect(page.locator("[data-london-clock]:visible")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link")).toHaveText(siteCopy.menu);
  });
});
