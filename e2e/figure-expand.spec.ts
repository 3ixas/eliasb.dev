import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

// A screenshot on a long-form page opens large in the same window: a case study's opening one (its section screenshots are now
// the stills behind working figures, #462 and #463), and a Role story's (and its certificate).
const pages = [
  { route: "/things-i-make/threshold", trigger: ".case-open .zoom" },
  { route: "/things-i-make/argus-risk", trigger: ".case-open .zoom" },
  { route: "/work/joveen", trigger: ".story-fig .zoom" },
  { route: "/work/optegra", trigger: ".story-fig .zoom" },
  { route: "/work/bnp-paribas", trigger: "#take-ownership-certificate .zoom" },
];

type GroupFrame = { x: number; y: number; w: number; h: number };
type TransitionSample = { duration: number; start: GroupFrame; mid: GroupFrame; end: GroupFrame };

async function waitForHydration(locator: Locator) {
  await expect.poll(() => locator.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
}

/**
 * Intercepts the next `document.startViewTransition` call, pauses `::view-transition-group(zoom-shot)` once ready,
 * seeks to 0%, 25% and 100%, and skips the transition so the spec proves the morph without waiting out its length.
 */
async function sampleZoomTransition(page: Page, action: () => Promise<void>): Promise<TransitionSample> {
  const sample = page.evaluate(
    () =>
      new Promise<TransitionSample>((resolve, reject) => {
        const original = document.startViewTransition.bind(document);
        document.startViewTransition = function (updateCallback) {
          document.startViewTransition = original;
          const vt = original(updateCallback);
          vt.ready
            .then(() => {
              const group = document.getAnimations().find((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement === "::view-transition-group(zoom-shot)");
              if (!group) {
                vt.skipTransition();
                reject(new Error("No ::view-transition-group(zoom-shot) animation found"));
                return;
              }
              const duration = Number(group.effect!.getComputedTiming().duration);
              const readAt = (time: number): GroupFrame => {
                group.pause();
                group.currentTime = time;
                const style = getComputedStyle(document.documentElement, "::view-transition-group(zoom-shot)");
                const matrix = new DOMMatrix(style.transform);
                return { x: matrix.m41, y: matrix.m42, w: parseFloat(style.width), h: parseFloat(style.height) };
              };
              const result = { duration, start: readAt(0), mid: readAt(duration * 0.25), end: readAt(duration) };
              group.finish();
              vt.skipTransition();
              resolve(result);
            })
            .catch(reject);
          return vt;
        };
      }),
  );
  await action();
  return sample;
}

for (const { route, trigger } of pages) {
  test.describe(`Expanding a screenshot: ${route}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(route);
      await expect(page.locator(trigger).first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
    });

    test("a click opens the same image large, in a dialog in this window, and Esc closes it and returns focus", async ({ page }) => {
      const button = page.locator(trigger).first();
      await waitForHydration(button);
      const alt = (await button.locator("img").getAttribute("alt"))!;
      const inline = (await button.locator("img").boundingBox())!;
      await expect(button).toHaveAttribute("aria-haspopup", "dialog");
      await expect(button).toHaveCSS("cursor", "zoom-in");
      const dialog = page.getByRole("dialog", { name: alt });
      await expect(dialog).toBeHidden();
      const url = page.url();
      await button.click();
      await expect(dialog).toBeVisible();
      expect(page.url()).toBe(url);
      const image = dialog.locator("img");
      await expect.poll(() => image.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
      // The image may still be settling (the browser picks its source and lays it out), so wait for the large size.
      await expect.poll(async () => (await image.boundingBox())!.width).toBeGreaterThan(inline.width);
      const large = (await image.boundingBox())!;
      const viewport = page.viewportSize()!;
      expect(large.x).toBeGreaterThanOrEqual(0);
      expect(large.x + large.width).toBeLessThanOrEqual(viewport.width);
      expect(large.y + large.height).toBeLessThanOrEqual(viewport.height);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(button).toBeFocused();
    });

    test("its keyboard focus ring is not clipped by any frame around it", async ({ page }) => {
      const button = page.locator(trigger).first();
      // The ring is a 2 px outline offset by 2 px (the page-wide focus ring); no frame around the button may clip that.
      const ringExtent = 4;
      const clipped = await button.evaluate((element, extent) => {
        const ring = element.getBoundingClientRect();
        for (let parent = element.parentElement; parent && parent !== document.documentElement; parent = parent.parentElement) {
          if (getComputedStyle(parent).overflow === "visible") continue;
          const box = parent.getBoundingClientRect();
          if (box.left > ring.left - extent || box.right < ring.right + extent || box.top > ring.top - extent || box.bottom < ring.bottom + extent) return parent.className;
        }
        return null;
      }, ringExtent);
      expect(clipped).toBeNull();
    });

    test("the Close button's focus ring is white, so it shows on any screenshot", async ({ page }) => {
      const button = page.locator(trigger).first();
      await waitForHydration(button);
      await button.focus();
      await page.keyboard.press("Enter");
      const close = page.getByRole("dialog").getByRole("button", { name: "Close" });
      await expect(close).toBeVisible();
      await close.focus();
      await expect(close).toHaveCSS("outline-color", "rgb(255, 255, 255)");
    });

    test("Enter opens it from the keyboard; a click on it and its Close button close it", async ({ page }) => {
      const button = page.locator(trigger).first();
      await waitForHydration(button);
      const dialog = page.getByRole("dialog");
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Close" }).click();
      await expect(dialog).toBeHidden();
      await expect(button).toBeFocused();
      await button.click();
      await expect(dialog).toBeVisible();
      await dialog.locator("img").click();
      await expect(dialog).toBeHidden();
    });

    test("the page behind does not scroll, nothing scrolls sideways, and it has no axe violations while open", async ({ page }) => {
      const button = page.locator(trigger).first();
      await waitForHydration(button);
      await button.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    test("the screenshot is in the server-rendered page without script", async ({ page }) => {
      await page.route("**/*.js", (route) => route.abort());
      await page.reload();
      await expect(page.locator(`${trigger} img`).first()).toBeVisible();
    });
  });
}

// Same-document view transition (#471): open grows from the thumbnail's live rect and close returns to it, including
// after the page scrolled while open; reduced motion and browsers without View Transitions open and close at once.
test.describe("Screenshot view-transition morph (pause and seek)", () => {
  test.use({ reducedMotion: "no-preference" });

  test("open grows from the thumbnail and close returns to it", async ({ page }) => {
    await page.goto("/things-i-make/threshold");
    const button = page.locator(".case-open .zoom").first();
    await expect(button).toBeVisible();
    await button.scrollIntoViewIfNeeded();
    await waitForHydration(button);
    const thumb = (await button.locator("img").boundingBox())!;

    const openSample = await sampleZoomTransition(page, () => button.click());
    const dialog = page.locator("dialog.zoom__dialog[open]");
    await expect(dialog).toBeVisible();
    const large = (await dialog.locator("img").boundingBox())!;

    expect(openSample.duration).toBe(280);
    expect(Math.abs(openSample.start.w - thumb.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(openSample.start.x - thumb.x)).toBeLessThanOrEqual(2);
    expect(openSample.mid.w).toBeGreaterThan(openSample.start.w);
    expect(openSample.mid.w).toBeLessThan(openSample.end.w);
    expect(Math.abs(openSample.end.w - large.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(openSample.end.x - large.x)).toBeLessThanOrEqual(2);

    const closeSample = await sampleZoomTransition(page, () => page.keyboard.press("Escape"));
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();

    expect(closeSample.duration).toBe(220);
    expect(Math.abs(closeSample.start.w - large.width)).toBeLessThanOrEqual(2);
    expect(closeSample.mid.w).toBeLessThan(closeSample.start.w);
    expect(closeSample.mid.w).toBeGreaterThan(closeSample.end.w);
    expect(Math.abs(closeSample.end.w - thumb.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(closeSample.end.x - thumb.x)).toBeLessThanOrEqual(2);
  });

  test("closing after the page scrolled while the dialog was open returns to the thumbnail's new position", async ({ page }) => {
    await page.goto("/things-i-make/threshold");
    const button = page.locator(".case-open .zoom").first();
    await expect(button).toBeVisible();
    await button.scrollIntoViewIfNeeded();
    await waitForHydration(button);
    const beforeOpen = (await button.locator("img").boundingBox())!;

    await button.click();
    const dialog = page.locator("dialog.zoom__dialog[open]");
    await expect(dialog).toBeVisible();

    // Simulate the viewport scrolling while the dialog is open (e.g. Safari toolbar resize or programmatic scroll).
    const shifted = await page.evaluate(() => {
      document.body.style.overflow = "auto";
      window.scrollBy({ top: 120, behavior: "instant" });
      const rect = document.querySelector(".case-open .zoom img")!.getBoundingClientRect();
      document.body.style.overflow = "";
      return { x: rect.left, y: rect.top, width: rect.width, scrollY: window.scrollY };
    });
    expect(Math.abs(shifted.y - beforeOpen.y)).toBeGreaterThan(40);

    const closeSample = await sampleZoomTransition(page, () => page.keyboard.press("Escape"));
    await expect(dialog).toHaveCount(0);
    expect(Math.abs(closeSample.end.y - shifted.y)).toBeLessThanOrEqual(3);
    expect(Math.abs(closeSample.end.w - shifted.width)).toBeLessThanOrEqual(2);
    await expect(button).toBeFocused();
  });

  test("closing after the thumbnail moved off screen brings it back into view before returning to it", async ({ page }) => {
    await page.goto("/things-i-make/threshold");
    const button = page.locator(".case-open .zoom").first();
    await expect(button).toBeVisible();
    await button.scrollIntoViewIfNeeded();
    await waitForHydration(button);

    await button.click();
    const dialog = page.locator("dialog.zoom__dialog[open]");
    await expect(dialog).toBeVisible();

    // Push the thumbnail completely above the viewport while the dialog is open.
    const offscreen = await page.evaluate(() => {
      document.body.style.overflow = "auto";
      window.scrollBy({ top: 1600, behavior: "instant" });
      const rect = document.querySelector(".case-open .zoom img")!.getBoundingClientRect();
      document.body.style.overflow = "";
      return { bottom: rect.bottom };
    });
    expect(offscreen.bottom).toBeLessThanOrEqual(0);

    const closeSample = await sampleZoomTransition(page, () => page.keyboard.press("Escape"));
    await expect(dialog).toHaveCount(0);
    const returned = (await button.locator("img").boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(returned.y + returned.height).toBeGreaterThan(0);
    expect(returned.y).toBeLessThan(viewport.height);
    expect(Math.abs(closeSample.end.y - returned.y)).toBeLessThanOrEqual(3);
    expect(Math.abs(closeSample.end.w - returned.width)).toBeLessThanOrEqual(2);
    await expect(button).toBeFocused();
  });

  test("with reduced motion, open and close happen at once with no view-transition animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/things-i-make/threshold");
    const button = page.locator(".case-open .zoom").first();
    await expect(button).toBeVisible();
    await waitForHydration(button);
    await button.evaluate(() => {
      let called = false;
      (window as unknown as { vtCalled: () => boolean }).vtCalled = () => called;
      const original = document.startViewTransition?.bind(document);
      if (original) {
        document.startViewTransition = function (cb) {
          called = true;
          return original(cb);
        };
      }
    });
    await button.click();
    const dialog = page.locator("dialog.zoom__dialog[open]");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { vtCalled: () => boolean }).vtCalled())).toBe(false);
  });

  test("without View Transitions support, open and close still work at once", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(document, "startViewTransition", { value: undefined, configurable: true });
    });
    await page.goto("/things-i-make/threshold");
    const button = page.locator(".case-open .zoom").first();
    await expect(button).toBeVisible();
    await waitForHydration(button);
    await button.click();
    const dialog = page.locator("dialog.zoom__dialog[open]");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
  });
});

// Touch on a phone (#471): native pinch-zoom and pan via touch-action and a scrollable stage, double tap zooms to the
// point tapped (with the 220 ms FLIP easing on --out), single tap on the image stays open, dragging does not count as
// a double tap, tap outside or Close dismisses, and the page behind never scrolls.
test.describe("Touch pinch, pan and double tap on a phone", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });

  test("touch open morphs, single tap stays open, double tap zooms to the tapped point and pans without scrolling the page behind", async ({ page }) => {
    await page.goto("/things-i-make/threshold");
    const button = page.locator(".case-open .zoom").first();
    await expect(button).toBeVisible();
    await button.scrollIntoViewIfNeeded();
    await waitForHydration(button);
    const pageScrollBefore = await page.evaluate(() => window.scrollY);

    const openSample = await sampleZoomTransition(page, () => button.tap());
    expect(openSample.duration).toBe(280);
    const dialog = page.locator("dialog.zoom__dialog[open]");
    await expect(dialog).toBeVisible();
    const stage = dialog.locator(".zoom__stage");
    const image = dialog.locator(".zoom__img");

    await expect(stage).toHaveCSS("overscroll-behavior-y", "contain");
    // Chromium serializes `pan-x pan-y pinch-zoom` to its CSS Pointer Events equivalent `manipulation`.
    await expect(stage).toHaveCSS("touch-action", /^(manipulation|pan-x pan-y pinch-zoom)$/);

    const fitted = (await image.boundingBox())!;
    expect(fitted.width).toBeLessThanOrEqual(390);

    // Single tap on the image does not close the dialog on touch.
    await image.tap();
    await expect(dialog).toBeVisible();

    // A touch drag moves past TAP_DRAG_PX mid-gesture then returns within DOUBLE_TAP_PX (40 px) of the first tap:
    // only onStageTouchMove's drag detection can keep this from triggering double-tap zoom.
    await image.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width * 0.5;
      const y = rect.top + rect.height * 0.5;
      const send = (type: string, touches: Array<{ clientX: number; clientY: number }>, changed: Array<{ clientX: number; clientY: number }>) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperties(event, {
          touches: { value: touches },
          changedTouches: { value: changed },
        });
        el.dispatchEvent(event);
      };
      send("touchstart", [{ clientX: x, clientY: y }], [{ clientX: x, clientY: y }]);
      send("touchmove", [{ clientX: x + 30, clientY: y }], [{ clientX: x + 30, clientY: y }]);
      send("touchmove", [{ clientX: x + 4, clientY: y + 4 }], [{ clientX: x + 4, clientY: y + 4 }]);
      send("touchend", [], [{ clientX: x + 4, clientY: y + 4 }]);
    });
    await expect(stage).not.toHaveAttribute("data-zoomed");

    // Double tap near the right edge zooms to that point with a 220 ms FLIP animation.
    const rightSpot = { x: Math.round(fitted.width * 0.85), y: Math.round(fitted.height * 0.5) };
    await image.tap({ position: rightSpot });
    await image.tap({ position: rightSpot });

    await expect(stage).toHaveAttribute("data-zoomed", "");
    await expect.poll(async () => (await image.boundingBox())!.width).toBeGreaterThanOrEqual(fitted.width * 2 - 1);

    // The stage scrolled right to keep the tapped right side under the finger, while the page behind never moved.
    const rightScroll = await stage.evaluate((el) => ({ left: el.scrollLeft, max: el.scrollWidth - el.clientWidth }));
    expect(rightScroll.max).toBeGreaterThan(200);
    expect(rightScroll.left).toBeGreaterThan(rightScroll.max * 0.35);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollBefore);

    // The zoomed stage scrolls cleanly across its full horizontal range while the page behind stays still.
    await stage.evaluate((el, max) => {
      el.scrollLeft = 0;
      el.scrollLeft = max;
    }, rightScroll.max);
    expect(await stage.evaluate((el) => el.scrollLeft)).toBeGreaterThanOrEqual(rightScroll.max - 1);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollBefore);

    // Double tap again zooms back out to the fitted view without closing the dialog.
    await image.tap({ position: { x: 100, y: 100 } });
    await image.tap({ position: { x: 100, y: 100 } });
    await expect(stage).not.toHaveAttribute("data-zoomed");
    await expect.poll(async () => Math.abs((await image.boundingBox())!.width - fitted.width)).toBeLessThanOrEqual(2);

    // Tap on the dimmed area outside the image closes the dialog with the return morph.
    const closeSample = await sampleZoomTransition(page, () => stage.tap({ position: { x: 20, y: 20 } }));
    expect(closeSample.duration).toBe(220);
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS("outline-style", "none");
  });
});

// A finger or mouse that closes the dialog gets focus back on the button without its ring (iOS drew a blue rectangle round
// the screenshot until the next tap); a key that closes it still gets the ring, even after a previous pointer close.
test.describe("Closing the dialog returns focus without a ring for a pointer", () => {
  const route = "/things-i-make/threshold";
  const trigger = ".case-open .zoom";

  test("a click on the dialog closes it, the button is focused and shows no outline, then Esc still shows the ring", async ({ page }) => {
    await page.goto(route);
    const button = page.locator(trigger).first();
    await expect(button).toBeVisible();
    await waitForHydration(button);
    await button.click();
    const dialog = page.locator("dialog.zoom__dialog[open]");
    await expect(dialog).toBeVisible();
    await dialog.locator("img").click();
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS("outline-style", "none");

    // Reopen from keyboard and close with Esc: stale pointer state must not hide the keyboard ring.
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS("outline-style", "solid");
  });

  test("clicking the dimmed area outside the image closes the dialog", async ({ page }) => {
    await page.goto(route);
    const button = page.locator(trigger).first();
    await expect(button).toBeVisible();
    await waitForHydration(button);
    await button.click();
    const dialog = page.locator("dialog.zoom__dialog[open]");
    await expect(dialog).toBeVisible();
    await dialog.locator(".zoom__stage").click({ position: { x: 4, y: 4 } });
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
  });

  test("Esc during a slow image decode cancels the pending open", async ({ page }) => {
    await page.goto(route);
    const button = page.locator(trigger).first();
    await expect(button).toBeVisible();
    await waitForHydration(button);

    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route("**/_next/image**", async (routeReq) => {
      await held;
      await routeReq.continue();
    });

    await button.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    // Wait past DECODE_WAIT_MS (400 ms) so an uncancelled open would have shown the dialog.
    await page.waitForTimeout(500);
    await expect(page.locator("dialog.zoom__dialog[open]")).toHaveCount(0);
    release();
    await expect(page.locator("dialog.zoom__dialog[open]")).toHaveCount(0);
    await expect(button).toBeFocused();

    // Positive control: pressing Enter without Esc opens the dialog.
    await page.keyboard.press("Enter");
    await expect(page.locator("dialog.zoom__dialog[open]")).toBeVisible();
  });
});
