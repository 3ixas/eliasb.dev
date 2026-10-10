import { expect, test, type Page } from "@playwright/test";

const pill = (page: Page) => page.locator("[data-lights-pill]");
const scheme = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
const stored = (page: Page) => page.evaluate(() => localStorage.getItem("elias-theme"));
const token = (page: Page, name: string) =>
  page.evaluate((property) => getComputedStyle(document.documentElement).getPropertyValue(property).trim().toLowerCase(), name);
/** The colours of every theme-color meta, which must all be the page background. */
const toolbar = (page: Page) =>
  page.evaluate(() => [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((meta) => meta.content.toLowerCase()));

test.describe("Lights and theme", () => {
  test("starts in the device appearance and follows it live", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    expect(await scheme(page)).toBe("light");
    await expect(pill(page)).toHaveAccessibleName("Lights on");
    await expect(pill(page)).toHaveAttribute("aria-pressed", "true");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(() => scheme(page)).toBe("dark");
    await expect(pill(page)).toHaveAccessibleName("Lights off");
    await expect(pill(page)).toHaveAttribute("aria-pressed", "false");
  });

  test("the pill is a button: pressed means the lights are on, and it flips them", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Lights on", pressed: true })).toBeVisible();
    await pill(page).click();
    await expect.poll(() => scheme(page)).toBe("dark");
    await expect(page.getByRole("button", { name: "Lights off", pressed: false })).toBeVisible();
    await pill(page).click();
    await expect.poll(() => scheme(page)).toBe("light");
    await expect(page.getByRole("button", { name: "Lights on", pressed: true })).toBeVisible();
  });

  test("a choice persists until the visitor is back on their device setting", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await pill(page).click();
    expect(await stored(page)).toBe("dark");
    await page.reload();
    expect(await scheme(page)).toBe("dark");
    await expect(pill(page)).toHaveAccessibleName("Lights off");

    // Choosing what the device already shows returns to following the device.
    await pill(page).click();
    await expect.poll(() => scheme(page)).toBe("light");
    expect(await stored(page)).toBeNull();
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(() => scheme(page)).toBe("dark");
  });

  for (const [device, chosen] of [["light", "dark"], ["dark", "light"]] as const) {
    test(`the page never paints in the wrong theme (${chosen} chosen on a ${device} device)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: device });
      await page.addInitScript((theme) => {
        localStorage.setItem("elias-theme", theme);
        requestAnimationFrame(() => {
          const root = document.documentElement;
          (window as unknown as { firstPaint: object }).firstPaint = {
            scheme: getComputedStyle(root).colorScheme,
            page: getComputedStyle(root).getPropertyValue("--stretch-page").trim().toLowerCase(),
            background: getComputedStyle(document.body).backgroundColor,
            toolbar: [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((meta) => meta.content.toLowerCase()),
          };
        });
      }, chosen);
      await page.goto("/");
      const paint = await page.evaluate(() => (window as unknown as { firstPaint: { scheme: string; page: string; background: string; toolbar: string[] } }).firstPaint);
      expect(paint.scheme).toBe(chosen);
      expect(paint.background).toBe(chosen === "dark" ? "rgb(13, 13, 18)" : "rgb(251, 251, 248)");
      // The toolbar colour is the page's, before the first paint.
      expect(paint.toolbar.length).toBeGreaterThan(0);
      for (const colour of paint.toolbar) expect(colour).toBe(paint.page);
    });
  }

  for (const [device, label, background] of [["dark", "Lights off", "rgb(13, 13, 18)"], ["light", "Lights on", "rgb(251, 251, 248)"]] as const) {
    test(`with script off, a ${device} device still gets the ${device} page and its label`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: device });
      const page = await context.newPage();
      await page.goto("/");
      // innerText, so the label hidden by CSS is not counted.
      await expect(pill(page)).toHaveText(label, { useInnerText: true });
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(background);
      await context.close();
    });
  }

  test("the toolbar colour follows the page background through every change", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const follows = async (label: string) => {
      const background = await token(page, "--stretch-page");
      const colours = await toolbar(page);
      expect(colours.length, label).toBeGreaterThan(0);
      for (const colour of colours) expect(colour, label).toBe(background);
    };
    await follows("light device");
    await pill(page).click();
    await expect.poll(() => scheme(page)).toBe("dark");
    await follows("chose dark on a light device");
    await pill(page).click();
    await expect.poll(() => scheme(page)).toBe("light");
    await follows("back on the device");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(() => scheme(page)).toBe("dark");
    await follows("the device went dark");
  });

  test("dark mode shows the tile-edge hairline", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    expect(await token(page, "--stretch-tile-edge")).toBe("#2a2a33");
    await page.emulateMedia({ colorScheme: "light" });
    await expect.poll(() => token(page, "--stretch-tile-edge")).toBe("transparent");
  });

  test("a change of device setting crossfades the page too", async ({ page }) => {
    // Motion goes on after the page has loaded, so the signature entrance does not hold this one.
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    // The crossfade lasts 1.2 s, and under load a round trip to the page can
    // take as long, so read the page in the task that flips the theme.
    await page.evaluate(() => {
      const root = document.documentElement;
      (window as unknown as { fading: Promise<number> }).fading = new Promise((resolve) => {
        new MutationObserver((_, observer) => {
          if (root.dataset.lights !== "on") return;
          observer.disconnect();
          resolve(document.querySelector("[data-stretch-header]")!.getAnimations().length);
        }).observe(root, { attributes: true, attributeFilter: ["data-lights"] });
      });
    });
    await page.emulateMedia({ colorScheme: "dark" });
    expect(await page.evaluate(() => (window as unknown as { fading: Promise<number> }).fading)).toBeGreaterThan(0);
  });

  test("the pill is a 44 px target with a solid focus outline", async ({ page }) => {
    await page.goto("/");
    const box = await pill(page).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await pill(page).focus();
    await expect(pill(page)).toHaveCSS("outline-style", "solid");
  });

  test("the page fades over 1.2 s, and settles afterwards", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const header = page.locator("[data-stretch-header]");
    await expect(header).toHaveCSS("transition-duration", "0s");
    const during = await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>("[data-lights-pill]")!.click();
      const read = (selector: string) => getComputedStyle(document.querySelector(selector)!);
      return {
        header: read("[data-stretch-header]").transitionDuration,
        heading: read("#work h2").transitionDuration,
        timing: read("[data-stretch-header]").transitionTimingFunction,
      };
    });
    expect(during.header).toBe("1.2s");
    expect(during.heading).toMatch(/^1\.2s/);
    expect(during.timing).toBe("cubic-bezier(0.42, 0, 0.58, 1)");
    await expect(header).toHaveCSS("transition-duration", "0s", { timeout: 3000 });
  });

  test("with reduced motion the page crossfades in 200 ms", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/");
    // The window is short, so click and read in the same task.
    const during = await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>("[data-lights-pill]")!.click();
      return getComputedStyle(document.querySelector("[data-stretch-header]")!).transitionDuration;
    });
    expect(during).toBe("0.2s");
  });
});
