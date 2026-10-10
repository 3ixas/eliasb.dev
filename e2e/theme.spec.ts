import { expect, test, type Page } from "@playwright/test";

const pill = (page: Page) => page.locator("[data-lights-pill]");
const scheme = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
const stored = (page: Page) => page.evaluate(() => localStorage.getItem("elias-theme"));
const token = (page: Page, name: string) =>
  page.evaluate((property) => getComputedStyle(document.documentElement).getPropertyValue(property).trim().toLowerCase()
    .replace(/^rgb\((\d+), (\d+), (\d+)\)$/, (_, r, g, b) => `#${[r, g, b].map((channel) => Number(channel).toString(16).padStart(2, "0")).join("")}`)
    .replace("rgba(0, 0, 0, 0)", "transparent"), name);
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
      expect([paint.background, chosen === "dark" ? "#0d0d12" : "#fbfbf8"]).toContain(paint.page);
      for (const colour of paint.toolbar) expect(colour).toBe(chosen === "dark" ? "#0d0d12" : "#fbfbf8");
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
    const follows = async (label: string, theme: "light" | "dark") => {
      await expect(page.locator("html")).not.toHaveAttribute("data-theme-changing", "");
      const background = theme === "dark" ? "#0d0d12" : "#fbfbf8";
      // WebKit may resolve a registered colour on the next rendering frame
      // after the timer clears. Wait for the palette's actual target as well.
      await expect.poll(() => token(page, "--stretch-page"), { message: label }).toBe(background);
      await expect(page.locator("body")).toHaveCSS("background-color", theme === "dark" ? "rgb(13, 13, 18)" : "rgb(251, 251, 248)");
      const colours = await toolbar(page);
      expect(colours.length, label).toBeGreaterThan(0);
      for (const colour of colours) expect(colour, label).toBe(background);
    };
    await follows("light device", "light");
    await pill(page).click();
    await expect.poll(() => scheme(page)).toBe("dark");
    await follows("chose dark on a light device", "dark");
    await pill(page).click();
    await expect.poll(() => scheme(page)).toBe("light");
    await follows("back on the device", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(() => scheme(page)).toBe("dark");
    await follows("the device went dark", "dark");
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
    // The crossfade lasts only 300 ms, so read animations in the task
    // that flips the theme rather than after a round trip under load.
    await page.evaluate(() => {
      const root = document.documentElement;
      (window as unknown as { fading: Promise<number> }).fading = new Promise((resolve) => {
        new MutationObserver((_, observer) => {
          if (root.dataset.lights !== "on") return;
          observer.disconnect();
          resolve(root.getAnimations().length);
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

  test("the page fades over 300 ms with a prompt start, and settles afterwards", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const palette = page.locator("html");
    await expect(palette).toHaveCSS("transition-duration", "0s");
    const during = await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>("[data-lights-pill]")!.click();
      const read = (selector: string) => getComputedStyle(document.querySelector(selector)!);
      return {
        palette: read("html").transitionDuration,
        heading: read("#work h2").transitionDuration,
        timing: read("html").transitionTimingFunction,
      };
    });
    expect(during.palette).toBe("0.3s");
    expect(during.heading).toBe("0s");
    expect(during.timing).toBe("cubic-bezier(0, 0, 0.38, 0.9)");
    await expect(palette).toHaveCSS("transition-duration", "0s", { timeout: 3000 });
  });

  test("with reduced motion both theme changes are instant", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/");
    for (const target of ["rgb(13, 13, 18)", "rgb(251, 251, 248)"]) {
      const during = await page.evaluate(() => {
        document.querySelector<HTMLButtonElement>("[data-lights-pill]")!.click();
        return {
          duration: getComputedStyle(document.documentElement).transitionDuration,
          background: getComputedStyle(document.body).backgroundColor,
          animations: document.documentElement.getAnimations().length,
        };
      });
      expect(during.duration).toBe("0s");
      expect(during.background).toBe(target);
      expect(during.animations).toBe(0);
      await expect(page.locator("html")).not.toHaveAttribute("data-theme-changing", "");
    }
  });

  test("inherited text follows the palette on every frame in both directions", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const target of ["rgb(241, 241, 244)", "rgb(17, 17, 20)"]) {
      const samples = await page.evaluate(async () => {
        document.querySelector<HTMLButtonElement>("[data-lights-pill]")!.click();
        // Sample fixed animation times so a busy runner cannot miss the
        // entire 300 ms fade between timer callbacks.
        const animations = document.documentElement.getAnimations();
        for (const animation of animations) animation.pause();
        const frames = [];
        for (const time of [0, 75, 150, 225, 300]) {
          for (const animation of animations) animation.currentTime = time;
          frames.push({
            ink: getComputedStyle(document.documentElement).getPropertyValue("--stretch-ink").trim(),
            colours: ["[data-stretch-shell]", "#work h2", ".stretch-beat__proof", ".stretch-prd__quote"].map(
              (selector) => getComputedStyle(document.querySelector(selector)!).color,
            ),
          });
        }
        for (const animation of animations) animation.play();
        return frames;
      });
      expect(new Set(samples.map((sample) => sample.ink)).size).toBeGreaterThan(1);
      for (const sample of samples) for (const colour of sample.colours) expect(colour).toBe(sample.ink);
      await expect(page.locator(".stretch-beat__proof").first()).toHaveCSS("color", target);
      await expect(page.locator("html")).not.toHaveAttribute("data-theme-changing", "");
    }
  });
});
