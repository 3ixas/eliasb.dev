import { expect, test, type Locator } from "@playwright/test";

// Feedback (docs/design/DESIGN.md, "Craft bar"): the Eclipse scales to .97 while pressed, its focus ring, and a screenshot
// fades in once decoded. The quiet index's rows retired with the 404's in #419; a row's fill, press and ring are
// parts.spec's now. Computed styles are read through web-first assertions, so nothing here waits out a transition's length.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440-light", "Styles read once, in Chromium");
});

const scaled = "matrix(0.97, 0, 0, 0.97, 0, 0)";

/** Holds the pointer down on a control and moves off it before releasing, so the press never becomes a click. */
async function hold(page: import("@playwright/test").Page, target: Locator) {
  await target.hover();
  await page.mouse.down();
}
async function letGo(page: import("@playwright/test").Page) {
  await page.mouse.move(2, 2);
  await page.mouse.up();
}

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("pressing the Eclipse scales it to .97", async ({ page }) => {
    await page.goto("/nothing-here");
    const eclipse = page.locator("[data-site-header] [data-eclipse]");
    await expect(eclipse).toHaveCSS("transition-duration", "0.15s, 0.15s");
    await hold(page, eclipse);
    await expect(eclipse).toHaveCSS("transform", scaled);
    await letGo(page);
    await expect(eclipse).toHaveCSS("transform", "none");
  });
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("a press of the Eclipse drops the scale", async ({ page }) => {
    await page.goto("/nothing-here");
    const eclipse = page.locator("[data-site-header] [data-eclipse]");
    await hold(page, eclipse);
    await expect(eclipse).toHaveCSS("transform", "none");
    await letGo(page);
  });
});

test.describe("the focus ring", () => {
  test("is 2 px cobalt at 3 px offset on the header's controls", async ({ page }) => {
    await page.goto("/nothing-here");
    await page.keyboard.press("Tab");
    const eclipse = page.locator("[data-site-header] [data-eclipse]");
    await eclipse.focus();
    await expect(eclipse).toBeFocused();
    const ring = await eclipse.evaluate((node) => {
      const style = getComputedStyle(node);
      return { width: style.outlineWidth, offset: style.outlineOffset, style: style.outlineStyle };
    });
    expect(ring).toEqual({ width: "2px", offset: "3px", style: "solid" });
  });
});

test.describe("a screenshot arriving", () => {
  const route = "/things-i-make/threshold";
  const shot = ".case-open .zoom img";
  // The suite runs with reduced motion, which takes the fade away; the fade is what is measured here.
  test.use({ reducedMotion: "no-preference" });

  test("waits clear until it has decoded, then fades in over 150 ms", async ({ page }) => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route("**/_next/image**", async (request) => {
      await held;
      await request.continue();
    });
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const image = page.locator(shot).first();
    await expect(image).toHaveAttribute("data-arriving", "");
    await expect(image).toHaveCSS("opacity", "0");
    release();
    await expect(image).not.toHaveAttribute("data-arriving");
    await expect(image).toHaveCSS("opacity", "1");
    await expect(image).toHaveCSS("transition-duration", "0.15s");
  });

  test.describe("without script", () => {
    test.use({ javaScriptEnabled: false });

    test("shows as it loads, never held back", async ({ page }) => {
      await page.goto(route);
      const image = page.locator(shot).first();
      await expect(image).not.toHaveAttribute("data-arriving");
      await expect(image).toHaveCSS("opacity", "1");
    });
  });
});
