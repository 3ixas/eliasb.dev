import { expect, test, type Locator, type Page } from "@playwright/test";

// Motion that is not the entrance: scroll sway, and hover that only moves things where there is a hover.
const tile = (page: Page) => page.locator("#things-i-make .stretch-tile").first();
const released = (page: Page) => expect.poll(() => page.evaluate(() => !document.documentElement.hasAttribute("data-entering")), { timeout: 8000 }).toBe(true);
const sway = (page: Page) =>
  tile(page).evaluate((element) => {
    const style = getComputedStyle(element);
    const y = style.translate === "none" ? 0 : parseFloat(style.translate.split(" ")[1] ?? "0");
    const angle = style.rotate === "none" ? 0 : parseFloat(style.rotate);
    return { y, angle, translate: style.translate, rotate: style.rotate };
  });
// Scrolls so the tile's middle sits this far down the visible area (0.5 is its middle, 1 its bottom edge). The
// scroll timeline measures from under the fixed header (the page's scroll padding), so the visible area does too.
const scrollTileTo = (page: Page, down: number) =>
  tile(page).evaluate((element, at) => {
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const { top, height } = element.getBoundingClientRect();
    scrollBy(0, top + height / 2 - (padding + (innerHeight - padding) * at));
  }, down);

test.describe("Scroll sway", () => {
  test.use({ reducedMotion: "no-preference" });

  test("tiles drift up to 14 px and tilt at most 0.6 degrees, and sit level in the middle of the screen", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Scroll-driven animation, Chromium");
    await page.goto("/");
    await released(page);
    expect(await page.evaluate(() => CSS.supports("animation-timeline", "view()"))).toBe(true);
    // The site scrolls smoothly; measuring a position needs the scroll to land where it is sent.
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    await tile(page).scrollIntoViewIfNeeded();

    await scrollTileTo(page, 0.5);
    await expect.poll(async () => Math.abs((await sway(page)).y)).toBeLessThanOrEqual(1);
    expect(Math.abs((await sway(page)).angle)).toBeLessThanOrEqual(0.05);

    await scrollTileTo(page, 0.85);
    await expect.poll(async () => Math.abs((await sway(page)).y)).toBeGreaterThan(3);
    const near = await sway(page);
    expect(Math.abs(near.y)).toBeLessThanOrEqual(14.01);
    expect(Math.abs(near.angle)).toBeLessThanOrEqual(0.61);
    expect(Math.abs(near.angle)).toBeGreaterThan(0);
  });

  test("cards sway too, the PRD card keeping its own resting tilt", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Scroll-driven animation, Chromium");
    // How I work's PRD card holds still (see Margin notes below), so the sway is read on the case study's.
    await page.goto("/things-i-make/threshold");
    await released(page);
    const prd = page.locator(".stretch-prd");
    await prd.scrollIntoViewIfNeeded();
    const { rotate, transform } = await prd.evaluate((element) => ({ rotate: getComputedStyle(element).rotate, transform: getComputedStyle(element).transform }));
    expect(rotate).not.toBe("none");
    expect(transform, "the resting 1 degree tilt is still there").not.toBe("none");
    await page.goto("/");
    const card = page.locator("#off-the-clock .stretch-otc__card").first();
    expect(await card.evaluate((element) => getComputedStyle(element).translate)).not.toBe("none");
  });

  test("with reduced motion nothing sways", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await tile(page).scrollIntoViewIfNeeded();
    const { translate, rotate } = await sway(page);
    expect(translate).toBe("none");
    expect(rotate).toBe("none");
    expect(await page.locator(".stretch-prd").evaluate((element) => getComputedStyle(element).rotate)).toBe("none");
  });
});

test.describe("Margin notes", () => {
  const strokes = (page: Page) => page.locator("#how-i-work path[pathLength]");
  // The first habit's circle, a stroke that is on screen at every width.
  const circle = (page: Page) => page.locator("#how-i-work .stretch-ink--circle").first();
  const offset = (page: Page) => circle(page).locator("path").evaluate((path) => parseFloat(getComputedStyle(path).strokeDashoffset));
  // Scrolls so the circle's middle sits this far down the visible area (0 is its top, 1 its bottom edge).
  const scrollCircleTo = (page: Page, down: number) =>
    circle(page).evaluate((element, at) => {
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const { top, height } = element.getBoundingClientRect();
      scrollBy(0, top + height / 2 - (padding + (innerHeight - padding) * at));
    }, down);

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("a stroke draws as it scrolls up the screen and un-draws on the way back", async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Scroll-driven animation, Chromium");
      await page.goto("/");
      await released(page);
      expect(await page.evaluate(() => CSS.supports("animation-timeline", "view()"))).toBe(true);
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
      await circle(page).scrollIntoViewIfNeeded();

      await scrollCircleTo(page, 0.97);
      await expect.poll(() => offset(page)).toBeGreaterThan(0.5);
      await scrollCircleTo(page, 0.3);
      await expect.poll(() => offset(page)).toBe(0);
      await scrollCircleTo(page, 0.97);
      await expect.poll(() => offset(page), "scrolling back up takes the ink out again").toBeGreaterThan(0.5);
    });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("every stroke is simply drawn, wherever the page is scrolled", async ({ page }) => {
      await page.goto("/");
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
      await expect(strokes(page)).toHaveCount(9);
      await circle(page).scrollIntoViewIfNeeded();
      for (const at of [0.97, 0.3]) {
        await scrollCircleTo(page, at);
        const state = await strokes(page).evaluateAll((paths) =>
          paths.map((path) => ({ offset: getComputedStyle(path).strokeDashoffset, animation: getComputedStyle(path.closest("svg")!).animationName })),
        );
        for (const stroke of state) expect(stroke).toEqual({ offset: "0px", animation: "none" });
      }
    });
  });
});

test.describe("Hover that needs a hover", () => {
  test.use({ reducedMotion: "no-preference", hasTouch: true, isMobile: true, viewport: { width: 1200, height: 900 } });

  test("a tile does not take its hover pose on a device with no hover", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Touch emulation, Chromium");
    await page.goto("/");
    await released(page);
    expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(false);
    const shot = tile(page).locator(".stretch-tile__shot");
    await tile(page).scrollIntoViewIfNeeded();
    const resting = await shot.evaluate((element) => getComputedStyle(element).transform);
    await tile(page).hover();
    await page.waitForTimeout(700);
    expect(await shot.evaluate((element) => getComputedStyle(element).transform)).toBe(resting);
  });
});

// The Staff pass (#209): an employer's pass leans away from a fine pointer and settles; on touch it swings as a
// scroll-driven pendulum; the self-issued pass never moves; reduced motion holds the resting tilt.
const passFixture = "/fixtures/staff-pass";
const passAt = (page: Page, name: string) => page.locator(`[data-fixture="${name}"] .stretch-pass`);
/** The pass's `rotate` in degrees (the lean and the pendulum both play on it); 0 when nothing is animating it. */
const rotation = (pass: Locator) => pass.evaluate((element) => Number.parseFloat(getComputedStyle(element).rotate) || 0);
/** The resting tilt, in degrees, from the pass's transform. */
const resting = (pass: Locator) =>
  pass.evaluate((element) => {
    const { a, b } = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return Math.atan2(b, a) * (180 / Math.PI);
  });

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

  test("on a fine pointer it kicks away, overshoots slightly and settles within about 0.7 s", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Pointer sampling, Chromium");
    await page.goto(passFixture);
    expect(await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)).toBe(true);
    const samples = await leanSamples(page, passAt(page, "current"), 2600);
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
    // The lean is additive: the resting tilt underneath never moved.
    expect(await resting(passAt(page, "current"))).toBeCloseTo(-1, 1);
  });

  test("the pass that opens a Role story leans as it does on Work", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Pointer sampling, Chromium");
    await page.goto("/work/bnp-paribas");
    const pass = page.locator(".stretch-cs-open .stretch-pass");
    await expect(pass).toHaveAttribute("data-lean", "");
    const samples = await leanSamples(page, pass, 1500);
    const at = (from: number, to: number) => samples.filter(([time]) => time >= from && time <= to).map(([, angle]) => angle);
    const kick = Math.max(...at(0, 250));
    expect(kick, "it leans").toBeGreaterThan(2);
    expect(kick, "by no more than the kick").toBeLessThanOrEqual(4.01);
    expect(Math.min(...at(250, 1200)), "and swings back past rest").toBeLessThan(-0.05);
    expect(Math.abs(samples.at(-1)![1]), "and settles").toBeLessThanOrEqual(0.2 * kick);
    // The same resting tilt as on Work.
    expect(await resting(pass)).toBeCloseTo(-1, 1);
  });

  test("the self-issued pass never leans, and an opening pass that does not lean stays put", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Pointer sampling, Chromium");
    await page.goto(passFixture);
    for (const name of ["self-issued", "opening"]) {
      const samples = await leanSamples(page, passAt(page, name), 1200);
      expect(samples.length, `${name} was sampled`).toBeGreaterThan(20);
      expect(Math.max(...samples.map(([, angle]) => Math.abs(angle))), `${name} never rotates`).toBe(0);
    }
  });
});

test.describe("Where I'm headed on the homepage", () => {
  test.use({ reducedMotion: "no-preference" });

  test("its self-issued pass never leans, while Work's employer passes still do", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Pointer sampling, Chromium");
    await page.goto("/");
    const headed = page.locator('#work .stretch-pass[data-pass="self-issued"]');
    const samples = await leanSamples(page, headed, 1200);
    expect(samples.length, "it was sampled").toBeGreaterThan(20);
    expect(Math.max(...samples.map(([, angle]) => Math.abs(angle))), "it never rotates").toBe(0);
    expect(await resting(headed), "and rests level").toBe(0);
    const lean = await leanSamples(page, page.locator('#work [data-slug="bnp-paribas"] .stretch-pass'), 600);
    expect(Math.max(...lean.map(([, angle]) => Math.abs(angle))), "while BNP's pass does").toBeGreaterThan(2);
  });
});

test.describe("Staff pass pendulum on touch", () => {
  test.use({ reducedMotion: "no-preference", hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  /** Scrolls a pass from below the screen to above it, and reads its rotation at every step. */
  const pendulum = (page: Page, name: string) =>
    page.evaluate(async (fixtureName) => {
      document.documentElement.style.scrollBehavior = "auto";
      const pass = document.querySelector<HTMLElement>(`[data-fixture="${fixtureName}"] .stretch-pass`)!;
      const top = pass.getBoundingClientRect().top + scrollY;
      const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const angles: number[] = [];
      for (let y = top - innerHeight; y <= top + pass.offsetHeight; y += 20) {
        scrollTo(0, y);
        await frame();
        angles.push(Number.parseFloat(getComputedStyle(pass).rotate) || 0);
      }
      return angles;
    }, name);

  test("an employer pass swings within 2.5 degrees either way", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Scroll-driven animation, Chromium");
    await page.goto(passFixture);
    expect(await page.evaluate(() => matchMedia("(hover: none)").matches)).toBe(true);
    expect(await page.evaluate(() => CSS.supports("animation-timeline", "view()"))).toBe(true);
    // Optegra's pass sits far enough down the fixture that its whole pass across the screen can be scrolled through.
    for (const name of ["returned-optegra", "returned-joveen", "current"]) {
      const angles = await pendulum(page, name);
      expect(Math.max(...angles.map(Math.abs)), `${name} never goes past 2.5 degrees`).toBeLessThanOrEqual(2.5001);
      expect(Math.max(...angles.map(Math.abs)), `${name} swings`).toBeGreaterThan(2);
    }
    const angles = await pendulum(page, "returned-optegra");
    expect(Math.max(...angles), "it swings one way").toBeGreaterThan(2.4);
    expect(Math.min(...angles), "and the other").toBeLessThan(-2.4);
  });

  test("the self-issued pass, and a pass that does not lean, do not swing", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Scroll-driven animation, Chromium");
    await page.goto(passFixture);
    expect(Math.max(...(await pendulum(page, "self-issued")).map(Math.abs))).toBe(0);
    expect(Math.max(...(await pendulum(page, "opening")).map(Math.abs)), "a pass that does not lean does not swing").toBe(0);
  });
});

test.describe("Staff pass with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("a fine pointer moves nothing and the resting tilt holds", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Pointer sampling, Chromium");
    await page.goto(passFixture);
    const samples = await leanSamples(page, passAt(page, "current"), 1200);
    expect(samples.length).toBeGreaterThan(20);
    expect(Math.max(...samples.map(([, angle]) => Math.abs(angle)))).toBe(0);
    expect(await resting(passAt(page, "current"))).toBeCloseTo(-1, 1);
    expect(await resting(passAt(page, "returned-joveen"))).toBeCloseTo(1.5, 1);
  });

  test.describe("on touch", () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

    test("scrolling swings nothing and the resting tilt holds", async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Touch emulation, Chromium");
      await page.goto(passFixture);
      const pass = passAt(page, "current");
      await pass.scrollIntoViewIfNeeded();
      await page.mouse.wheel(0, 120);
      expect(await rotation(pass)).toBe(0);
      expect(await resting(pass)).toBeCloseTo(-1, 1);
    });
  });
});
