import { expect, test, type Page } from "@playwright/test";
import { withoutScene } from "./support/scene";

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
  // The 3D passes are not a self-running motion (they swing once and sleep), and where the browser draws in software, as
  // CI's does, the scene times one frame and keeps the printed passes, a pause that would shift the others' timing.
  test.beforeEach(({ page }) => withoutScene(page));

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

// Threshold's working link (#462): a choice rewrites the link at once, the changed part arriving in 200 ms on a wash of
// Threshold's colour; with reduced motion it simply changes.
test.describe("Threshold's link rewrites itself", () => {
  const changedPart = (page: Page) => page.locator("section#how-its-built .tlink__part[data-new]");
  const animations = (page: Page) =>
    changedPart(page).evaluate((part) =>
      part
        .getAnimations()
        .map((animation) => `${(animation as CSSAnimation).animationName} ${animation.effect?.getComputedTiming().duration}`)
        .sort(),
    );
  const choosePlace = async (page: Page) => {
    await page.goto("/things-i-make/threshold");
    const figure = page.locator("section#how-its-built .working-fig");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".tlink[data-live]")).toHaveCount(1);
    await figure.getByLabel("Place", { exact: true }).selectOption("studio");
    await expect(changedPart(page)).toHaveText("studio");
  };

  test("with motion, the changed part arrives in 200 ms and its wash fades over 1.2 s", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await choosePlace(page);
    await expect.poll(() => animations(page)).toEqual(["working-arrive 200", "working-wash 1200"]);
  });

  test("with reduced motion, the link changes and nothing moves", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await choosePlace(page);
    expect(await animations(page)).toEqual([]);
  });
});
