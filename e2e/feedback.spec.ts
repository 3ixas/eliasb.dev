import { expect, test, type Locator } from "@playwright/test";

// Feedback (docs/design/DESIGN.md, "Craft bar"): rows fill instantly and let go over 120 ms, a press darkens a row and
// scales small controls and objects to .97, one focus ring everywhere, and a screenshot fades in once decoded.
// Computed styles are read through web-first assertions, so nothing here waits out a transition's length.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-1440-light", "Styles read once, in Chromium");
});

const card = "rgb(240, 240, 234)";
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

  test.beforeEach(async ({ page }) => {
    // The 404's suggestions are the last quiet rows since the homepage became panels (#416).
    await page.goto("/nothing-here");
    await expect(page.locator(".qi-list a.qi-row").first()).toBeVisible();
  });

  test("a row's fill is instant in and lets go over 120 ms", async ({ page }) => {
    const row = page.locator(".qi-list a.qi-row").first();
    await expect(row).toHaveCSS("transition-duration", "0.12s");
    await expect(row).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await row.hover();
    await expect(row).toHaveCSS("background-color", card);
    await expect(row).toHaveCSS("transition-duration", "0s");
  });

  test("pressing a row darkens its fill and scales its object to .97, and letting go returns both", async ({ page }) => {
    const row = page.locator(".qi-list a.qi-row").first();
    const object = row.locator(".qi-row__object");
    await expect(object).toHaveCSS("transform", "none");
    await hold(page, row);
    await expect(object).toHaveCSS("transform", scaled);
    const pressed = await row.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(pressed).not.toBe(card);
    expect(pressed).not.toBe("rgba(0, 0, 0, 0)");
    await letGo(page);
    await expect(object).toHaveCSS("transform", "none");
  });

  test("pressing the Eclipse scales it to .97", async ({ page }) => {
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

  test("a press keeps the fill and drops the scale", async ({ page }) => {
    await page.goto("/nothing-here");
    const row = page.locator(".qi-list a.qi-row").first();
    await hold(page, row);
    await expect(row.locator(".qi-row__object")).toHaveCSS("transform", "none");
    await expect(row).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(row).not.toHaveCSS("background-color", card);
    await letGo(page);
    const eclipse = page.locator("[data-site-header] [data-eclipse]");
    await hold(page, eclipse);
    await expect(eclipse).toHaveCSS("transform", "none");
    await letGo(page);
  });
});

test.describe("the focus ring", () => {
  test("is 2 px cobalt at 3 px offset on the header's controls, and inside a quiet-index row at −2 px", async ({ page }) => {
    await page.goto("/nothing-here");
    await page.keyboard.press("Tab");
    const eclipse = page.locator("[data-site-header] [data-eclipse]");
    await eclipse.focus();
    await expect(eclipse).toBeFocused();
    const ring = (element: Locator) => element.evaluate((node) => {
      const style = getComputedStyle(node);
      return { width: style.outlineWidth, offset: style.outlineOffset, style: style.outlineStyle };
    });
    expect(await ring(eclipse)).toEqual({ width: "2px", offset: "3px", style: "solid" });
    const row = page.locator(".qi-list a.qi-row").first();
    await row.focus();
    await expect(row).toBeFocused();
    expect(await ring(row)).toEqual({ width: "2px", offset: "-2px", style: "solid" });
  });
});

test.describe("a screenshot arriving", () => {
  const route = "/things-i-make/threshold";
  const shot = ".qi-case__below .qi-zoom img";
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
