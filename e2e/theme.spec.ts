import { expect, test, type Page } from "@playwright/test";

const switchButton = (page: Page) => page.locator("[data-light-switch]");
const scheme = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
const stored = (page: Page) => page.evaluate(() => localStorage.getItem("elias-theme"));

test.describe("Light switch and theme", () => {
  test("starts in the device appearance and follows it live", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    expect(await scheme(page)).toBe("light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(() => scheme(page)).toBe("dark");
    await expect(switchButton(page)).toHaveAccessibleName("Turn the lights off");
  });

  test("the switch names its action and flips the lights", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const light = switchButton(page);
    await expect(light).toHaveAccessibleName("Turn the lights on");
    await light.click();
    await expect.poll(() => scheme(page)).toBe("dark");
    await expect(light).toHaveAccessibleName("Turn the lights off");
  });

  test("a choice persists until the visitor is back on their device setting", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await switchButton(page).click();
    expect(await stored(page)).toBe("dark");
    await page.reload();
    expect(await scheme(page)).toBe("dark");

    // Flipping back to match the device returns to following it.
    await switchButton(page).click();
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
          (window as unknown as { firstPaintScheme: string }).firstPaintScheme = getComputedStyle(document.documentElement).colorScheme;
        });
      }, chosen);
      await page.goto("/");
      expect(await page.evaluate(() => (window as unknown as { firstPaintScheme: string }).firstPaintScheme)).toBe(chosen);
    });
  }

  test("a change of device setting crossfades the room too", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
    await page.goto("/");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.lights)).toBe("on");
    const fading = await page.evaluate(() => document.querySelector("[data-board-header]")!.getAnimations().length);
    expect(fading).toBeGreaterThan(0);
  });

  test("the switch is a 44 px target with a solid focus outline", async ({ page }) => {
    await page.goto("/");
    const light = switchButton(page);
    const box = await light.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await light.focus();
    await expect(light).toHaveCSS("outline-style", "solid");
  });

  test("the room fades over 1.2 s, and hover shadows stay quick otherwise", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
    await page.goto("/");
    const pin = page.locator("[data-pin]").first();
    await expect(pin).toHaveCSS("transition-duration", "0.22s");
    const during = await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>("[data-light-switch]")!.click();
      const header = getComputedStyle(document.querySelector("[data-board-header]")!);
      const pin = getComputedStyle(document.querySelector("[data-pin]")!);
      const nightWall = getComputedStyle(document.querySelector(".board-surface-wall")!, "::before");
      return {
        header: header.transitionDuration,
        wall: nightWall.transitionDuration,
        pin: pin.transitionProperty,
        pinDuration: pin.transitionDuration,
      };
    });
    expect(during.header).toBe("1.2s");
    expect(during.wall).toMatch(/^1\.2s/);
    expect(during.pin).toMatch(/box-shadow/);
    expect(during.pinDuration).toMatch(/^1\.2s/);
    await expect(pin).toHaveCSS("transition-duration", "0.22s", { timeout: 3000 });
  });

  test("shadows fall away from the hero lamp at night", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const shadow = await page.locator("#main-content [data-pin]").first().evaluate((pin) => getComputedStyle(pin).boxShadow);
    const offsets = [...shadow.matchAll(/\) (-?\d+(?:\.\d+)?)px/g)].map(([, x]) => Number(x)).filter((x) => x !== 0);
    expect(offsets.length).toBeGreaterThan(0);
    for (const x of offsets) expect(x).toBeLessThan(0);
  });

  test("with reduced motion the room crossfades in 200 ms without swinging shadows", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/");
    // The reduced window is short, so click and read in the same task.
    const during = await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>("[data-light-switch]")!.click();
      const style = getComputedStyle(document.querySelector("[data-board-header]")!);
      return { duration: style.transitionDuration, properties: style.transitionProperty };
    });
    expect(during.duration).toBe("0.2s");
    expect(during.properties).not.toMatch(/box-shadow/);
  });

  test("lights are scenery, not controls", async ({ page }) => {
    await page.goto("/");
    const lights = page.locator("[data-light-fixture]");
    await expect(lights).not.toHaveCount(0);
    for (const light of await lights.all()) {
      await expect(light).toHaveAttribute("aria-hidden", "true");
      await expect(light).toHaveCSS("pointer-events", "none");
      expect(await light.locator("a, button, input, [tabindex]").count()).toBe(0);
    }
  });
});
