import { expect, test, type Locator, type Page } from "@playwright/test";

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

// The Staff pass on a Role story (#209): it leans away from a fine pointer and settles; reduced motion holds still.
// (Its arrival swing is the closer look's qi-drop, tested with the pass itself.)
const rolePass = (page: Page) => page.locator(".qi-long__pass");

/** Moves the pointer onto a pass's left side and samples its rotation every frame for `ms`, timed from the entry. */
async function leanSamples(page: Page, pass: Locator, ms: number) {
  await pass.scrollIntoViewIfNeeded();
  const box = (await pass.boundingBox())!;
  await page.mouse.move(2, 2);
  // Samples left by an earlier call on this page would end the wait at once and be read as this pass's.
  await page.evaluate(() => delete (window as unknown as { __lean?: unknown }).__lean);
  await pass.evaluate(
    (element, duration) => {
      const samples: [number, number][] = [];
      let entered = 0;
      element.addEventListener("pointerenter", () => (entered = performance.now()), { once: true });
      const tick = () => {
        if (entered) samples.push([performance.now() - entered, Number.parseFloat(getComputedStyle(element).rotate) || 0]);
        if (!entered || performance.now() - entered < duration) requestAnimationFrame(tick);
        else (window as unknown as { __lean: [number, number][] }).__lean = samples;
      };
      requestAnimationFrame(tick);
    },
    ms,
  );
  await page.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.75);
  await page.waitForFunction(() => Boolean((window as unknown as { __lean?: unknown }).__lean), undefined, { timeout: ms + 3000 });
  return page.evaluate(() => (window as unknown as { __lean: [number, number][] }).__lean);
}

test.describe("Staff pass lean", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the pass that opens a Role story kicks away from a fine pointer, overshoots slightly and settles within about 0.7 s", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Pointer sampling, Chromium");
    await page.goto("/work/bnp-paribas");
    expect(await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)).toBe(true);
    await expect(rolePass(page)).toHaveAttribute("data-lean", "");
    // The drop on arrival (1 s) is over before the lean is sampled.
    await expect.poll(() => rolePass(page).evaluate((pass) => pass.querySelector(".qi-pass")!.getAnimations().filter((animation) => animation.playState === "running").length)).toBe(0);
    const samples = await leanSamples(page, rolePass(page), 2600);
    const at = (from: number, to: number) => samples.filter(([time]) => time >= from && time <= to).map(([, angle]) => angle);

    // The kick: a pointer on the left pushes the pass round by up to 4 degrees within a tenth of a second or so.
    const kick = Math.max(...at(0, 250));
    expect(kick, "it leans").toBeGreaterThan(2);
    expect(kick, "by no more than the kick").toBeLessThanOrEqual(4.01);
    // The overshoot: swinging back it passes rest and goes a little the other way (bounce 0.4 is about 10%).
    const overshoot = Math.min(...at(250, 1500));
    expect(overshoot, "it overshoots rest").toBeLessThan(-0.05);
    expect(overshoot, "slightly").toBeGreaterThan(-0.2 * kick);
    // The settle: near rest by about 0.7 s after the kick (the spring's 0.7 s, then its tail), and at rest after.
    expect(Math.abs(at(820, 880).at(-1) ?? 99), "near rest about 0.7 s after the kick").toBeLessThanOrEqual(0.2 * kick);
    expect(Math.abs(at(2400, 2600).at(-1) ?? 99), "and at rest").toBeLessThanOrEqual(0.02);
  });
});

test.describe("Staff pass with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("a fine pointer moves nothing", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Pointer sampling, Chromium");
    await page.goto("/work/bnp-paribas");
    const samples = await leanSamples(page, rolePass(page), 1200);
    expect(samples.length).toBeGreaterThan(20);
    expect(Math.max(...samples.map(([, angle]) => Math.abs(angle)))).toBe(0);
  });
});

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
