import { expect, test, type Page } from "@playwright/test";

/*
 * Phone motion (docs/design/DESIGN.md, "Inline"; the craft bar's interruption walk, new step).
 * A fold is judged by seeking its transition in the task that starts it, so a slow runner cannot miss it and nothing
 * waits on a clock.
 */

const inlineOnly = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1180;
/* Where I'm headed's first strand: the homepage's first row with an inline look now that Work's employers are panels (#413). */
const SLOT = '[data-look-slot="strand-judgement"]';
const TRIGGER = '#work .qi-row[data-look-tap="strand-judgement"]';

/**
 * Hydrated, with the opening's passes at rest: their arrival swing is finished at once, as a motion spec seeks rather
 * than waits, so a slow engine is not painting it while the fold under test runs.
 */
const hydrated = async (page: Page) => {
  await page.waitForFunction(() => {
    const columns = [...document.querySelectorAll("[data-quiet-column]")];
    return columns.length > 0 && columns.every((column) => Object.keys(column).some((key) => key.startsWith("__reactProps$")));
  });
  await page.evaluate(() => document.querySelectorAll(".pass").forEach((pass) => pass.getAnimations().forEach((animation) => animation.finish())));
};

/**
 * Puts the trigger mid-screen and lets the scroll land. WebKit's scrollIntoViewIfNeeded leaves it at the bottom edge, where
 * a look opens low and the page glides to show it: that is the next block's subject, not the fold's.
 */
const centre = async (page: Page) => {
  await page.locator(TRIGGER).evaluate((row) => row.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
};

test.describe("The fold", () => {
  test.use({ reducedMotion: "no-preference" });

  test("lasts 180 ms + height × 0.35, between 220 and 420 ms, on the soft curve, opening and closing", async ({ page }) => {
    test.skip(inlineOnly(page), "Inline looks are for phones and touch");
    await page.goto("/");
    await hydrated(page);
    await centre(page);
    const read = await page.locator(SLOT).evaluate(async (slot) => {
      const fold = () => slot.getAnimations().find((animation) => (animation as CSSTransition).transitionProperty === "grid-template-rows");
      const timing = async () => {
        for (let frame = 0; !fold(); frame++) {
          if (frame > 120) throw new Error("no fold started within 120 frames of the tap");
          await new Promise(requestAnimationFrame);
        }
        const animation = fold()!;
        animation.pause();
        const { duration } = animation.effect!.getComputedTiming();
        const { easing } = animation.effect!.getTiming();
        animation.finish();
        await new Promise(requestAnimationFrame);
        return { duration: Number(duration), easing: String(easing) };
      };
      const trigger = document.querySelector<HTMLElement>('#work .qi-row[data-look-tap="strand-judgement"]')!;
      trigger.click();
      const opening = await timing();
      const height = slot.querySelector<HTMLElement>(".qi-inline__in")!.scrollHeight;
      trigger.click();
      const closing = await timing();
      return { opening, closing, height };
    });
    const expected = Math.min(420, Math.max(220, Math.round(180 + read.height * 0.35)));
    expect(read.opening.duration).toBe(expected);
    expect(read.closing.duration).toBe(expected);
    for (const { easing } of [read.opening, read.closing]) expect(easing).toBe("cubic-bezier(0.25, 0.46, 0.3, 1)");
  });

  test("a look unmounts only once it has folded", async ({ page }) => {
    test.skip(inlineOnly(page), "Inline looks are for phones and touch");
    await page.goto("/");
    await hydrated(page);
    await centre(page);
    const stayed = await page.locator(SLOT).evaluate(async (slot) => {
      const fold = () => slot.getAnimations().find((animation) => (animation as CSSTransition).transitionProperty === "grid-template-rows");
      const started = async () => {
        for (let frame = 0; !fold(); frame++) {
          if (frame > 120) throw new Error("no fold started within 120 frames of the tap");
          await new Promise(requestAnimationFrame);
        }
      };
      const trigger = document.querySelector<HTMLElement>('#work .qi-row[data-look-tap="strand-judgement"]')!;
      trigger.click();
      await started();
      fold()!.finish();
      await new Promise(requestAnimationFrame);
      trigger.click();
      await started();
      // Held part way through its fold, the look is still there.
      fold()!.pause();
      fold()!.currentTime = 100;
      await new Promise(requestAnimationFrame);
      return slot.querySelector(".qi-inline__in") !== null;
    });
    expect(stayed).toBe(true);
    await page.locator(SLOT).evaluate((slot) => {
      const animation = slot.getAnimations().find((one) => (one as CSSTransition).transitionProperty === "grid-template-rows");
      animation?.play();
    });
    await expect(page.locator(`${SLOT} .qi-inline__in`)).toHaveCount(0);
  });
});

test.describe("A look that opens low", () => {
  test.use({ reducedMotion: "no-preference" });

  /** Scrolls so the trigger sits `gap` px above the screen's bottom edge, and returns the scroll position. The screen is short, so a look opened there is mostly below it at any width. */
  const placeLow = (page: Page, gap: number) =>
    page.evaluate(
      ([trigger, space]) => {
        const button = document.querySelector<HTMLElement>(trigger as string)!;
        window.scrollBy({ top: button.getBoundingClientRect().bottom - window.innerHeight + (space as number), behavior: "instant" });
        return window.scrollY;
      },
      [TRIGGER, gap],
    );

  test("comes into view over 320 ms, ending 16 px above the bottom edge", async ({ page }) => {
    test.skip(inlineOnly(page), "Inline looks are for phones and touch");
    await page.setViewportSize({ width: page.viewportSize()!.width, height: 700 });
    await page.goto("/");
    await hydrated(page);
    const before = await placeLow(page, 8);
    await page.locator(TRIGGER).click();
    const look = page.locator(`${SLOT} .qi-look`);
    await expect.poll(async () => (await look.boundingBox())!.y + (await look.boundingBox())!.height, { timeout: 3000 }).toBeLessThanOrEqual((page.viewportSize()!.height ?? 0) - 14.5);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
    // The row is still on screen, and clear of the top.
    expect((await page.locator(TRIGGER).boundingBox())!.y).toBeGreaterThanOrEqual(0);
  });

  test("leaves a look that is mostly on screen where it is", async ({ page }) => {
    test.skip(inlineOnly(page), "Inline looks are for phones and touch");
    await page.goto("/");
    await hydrated(page);
    await page.locator(TRIGGER).evaluate((button) => button.scrollIntoView({ block: "start", behavior: "instant" }));
    const before = await page.evaluate(() => window.scrollY);
    await page.locator(TRIGGER).click();
    await expect(page.locator(`${SLOT} .qi-inline__in`)).toHaveCount(1);
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 600)));
    // Within a pixel or two: WebKit rounds a scroll to its own grid. A glide would move it by hundreds.
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(2);
  });

  test("stops where it is when the visitor touches the screen", async ({ page }) => {
    test.skip(inlineOnly(page), "Inline looks are for phones and touch");
    await page.setViewportSize({ width: page.viewportSize()!.width, height: 700 });
    await page.goto("/");
    await hydrated(page);
    await placeLow(page, 8);
    const stopped = await page.locator(TRIGGER).evaluate(async (button) => {
      const start = window.scrollY;
      (button as HTMLElement).click();
      // Wait for the scroll to begin, then take over.
      while (window.scrollY === start) await new Promise(requestAnimationFrame);
      window.dispatchEvent(new Event("touchstart"));
      await new Promise(requestAnimationFrame);
      const held = window.scrollY;
      for (let frame = 0; frame < 30; frame++) await new Promise(requestAnimationFrame);
      return { held, after: window.scrollY, start };
    });
    expect(stopped.held).toBeGreaterThan(stopped.start);
    // The glide does not carry on: it would move the page on by tens of px. Under load WebKit settles a scroll back by a few px
    // once it is let go (seen at 320 and 390 in CI, never with the machine idle), which is the engine, not the hold.
    expect(stopped.after - stopped.held).toBeLessThanOrEqual(1);
    expect(stopped.after - stopped.held).toBeGreaterThanOrEqual(-4);
  });
});
