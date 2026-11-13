import { expect, test, type Page } from "@playwright/test";

// Motion on the finished page: hover that only moves things where there is a hover. (How I work's pen, which drew with the scroll, retired in #414.)
test.describe("Hover that needs a hover", () => {
  test.use({ reducedMotion: "no-preference", hasTouch: true, isMobile: true, viewport: { width: 1200, height: 900 } });

  test("a project's screenshot does not lift on a device with no hover", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Touch emulation, Chromium");
    await page.goto("/");
    expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(false);
    const row = page.locator("#things-i-make .project").nth(1);
    const shot = row.locator(".project__shot");
    await row.scrollIntoViewIfNeeded();
    const resting = await shot.evaluate((element) => getComputedStyle(element).transform);
    await row.hover();
    await page.waitForTimeout(700);
    expect(await shot.evaluate((element) => getComputedStyle(element).transform)).toBe(resting);
  });
});

// A Role story's pass is the shared staff pass since #417: its hover lean is opening.spec's, on the same part.

test.describe("One self-running motion on screen at a time", () => {
  test.use({ reducedMotion: "no-preference" });

  /** The name of every animation playing on its own, on an element that is on screen right now: one entry per running animation. */
  const selfRunning = (page: Page) =>
    page.evaluate(() => {
      const onScreen = (animation: Animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        if (!target) return false;
        const { top, bottom } = target.getBoundingClientRect();
        return bottom > 0 && top < innerHeight;
      };
      return document
        .getAnimations()
        .filter((animation) => !(animation instanceof CSSTransition) && animation.timeline instanceof DocumentTimeline && animation.playState === "running")
        .filter(onScreen)
        .map((animation) => (animation as CSSAnimation).animationName ?? "script");
    });

  test("a scroll pass down the homepage never has two on screen together", async ({ page }) => {
    await page.goto("/");
    // The arrival reactions (the underline drawing, the greeting's scene) play once on every load and finish by themselves; what the pass looks for is what keeps running.
    await expect.poll(async () => selfRunning(page)).toEqual([]);
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    const seen = new Set<string>();
    for (let y = 0; ; y += 240) {
      await page.evaluate((to) => scrollTo(0, to), y);
      for (let sample = 0; sample < 4; sample++) {
        await page.waitForTimeout(60);
        const running = await selfRunning(page);
        running.forEach((name) => seen.add(name));
        expect(running.length, `at scroll ${y}px: ${running.join(", ")}`).toBeLessThanOrEqual(1);
      }
      if (await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 1)) break;
    }
    // Off the clock's live dots, the last thing that rang on its own, are a still dot since #416: nothing on the page loops.
    expect([...seen]).toEqual([]);
  });
});
