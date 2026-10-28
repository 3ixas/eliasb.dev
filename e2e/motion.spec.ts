import { expect, test, type Locator, type Page } from "@playwright/test";
import { nameFill, tagSwing } from "../src/components/site/signature-springs";

// Motion on the finished page: scroll sway, and hover that only moves things where there is a hover.
test.describe("Scroll sway", () => {
  test.use({ reducedMotion: "no-preference" });

  test("cards sway too, the PRD card keeping its own resting tilt", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Scroll-driven animation, Chromium");
    await page.goto("/things-i-make/threshold");
    const prd = page.locator(".stretch-prd");
    await prd.scrollIntoViewIfNeeded();
    await expect.poll(() => prd.evaluate((element) => getComputedStyle(element).rotate)).not.toBe("none");
    await expect.poll(() => prd.evaluate((element) => getComputedStyle(element).transform), { message: "the resting 1 degree tilt is still there" }).not.toBe("none");
    await page.goto("/");
    const card = page.locator("#off-the-clock .stretch-otc__card").first();
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => card.evaluate((element) => getComputedStyle(element).translate)).not.toBe("none");
  });

  test("with reduced motion nothing sways", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const card = page.locator("#off-the-clock .stretch-otc__card").first();
    await card.scrollIntoViewIfNeeded();
    expect(await card.evaluate((element) => ({ translate: getComputedStyle(element).translate, rotate: getComputedStyle(element).rotate }))).toEqual({ translate: "none", rotate: "none" });
    await page.goto("/things-i-make/threshold");
    expect(await page.locator(".stretch-prd").evaluate((element) => getComputedStyle(element).rotate)).toBe("none");
  });
});

test.describe("Margin notes", () => {
  const strokes = (page: Page) => page.locator("#how-i-work path[pathLength]");
  // The first habit's circle, a stroke that is on screen at every width.
  const circle = (page: Page) => page.locator("#how-i-work .qi-ink--circle").first();
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
      await expect(strokes(page)).toHaveCount(11);
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

  test("a project's object does not take its hover pose on a device with no hover", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Touch emulation, Chromium");
    await page.goto("/");
    expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(false);
    const row = page.locator("#things-i-make .qi-row").first();
    const shot = row.locator(".qi-crop");
    await row.scrollIntoViewIfNeeded();
    const resting = await shot.evaluate((element) => getComputedStyle(element).transform);
    await row.hover();
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

// The 404's lost-property tag (#217): it swings in on spring(0.4, 0.6), from 14° to a resting -4°, from the first
// paint; reduced motion shows it at rest. The swing is CSS, so none of this waits for hydration.
type TagSample = [time: number, angle: number];

/** Samples the tag's CSS animation clock and `rotate` (degrees) every frame from the start of the page, for `ms`. */
async function tagSamples(page: Page, ms: number) {
  await page.addInitScript((duration) => {
    const store = window as unknown as { __tag: TagSample[]; __tagDone?: boolean };
    store.__tag = [];
    const start = performance.now();
    const tick = () => {
      const tag = document.querySelector("[data-lost-property]");
      const swing = tag?.getAnimations()[0];
      if (tag && swing) store.__tag.push([Number(swing.currentTime), Number.parseFloat(getComputedStyle(tag).rotate)]);
      if (performance.now() - start < duration) requestAnimationFrame(tick);
      else store.__tagDone = true;
    };
    requestAnimationFrame(tick);
  }, ms);
  await page.goto("/nothing-here");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __tagDone?: boolean }).__tagDone === true), { timeout: ms + 8000 }).toBe(true);
  return page.evaluate(() => (window as unknown as { __tag: TagSample[] }).__tag);
}

/** The tag's spring at `time` ms: its `linear()` easing, read back as the angle it should show between 14° and -4°. */
function swingAngle(time: number) {
  const points = tagSwing.easing.slice("linear(".length, -1).split(",").map(Number);
  const at = Math.min(Math.max(time / tagSwing.duration, 0), 1) * (points.length - 1);
  const low = Math.floor(at);
  const progress = points[low] + ((points[Math.min(low + 1, points.length - 1)] - points[low]) * (at - low));
  return 14 + (-4 - 14) * progress;
}

test.describe("404 lost-property tag", () => {
  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("swings in from 14 degrees on its spring, overshoots and settles at -4 degrees", async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Frame sampling, Chromium");
      const samples = await tagSamples(page, 1600);
      expect(samples.length).toBeGreaterThan(20);
      // It starts swung out, every frame follows the spring's own curve, it passes -4 to the far side, and it rests at -4.
      expect(samples[0][1]).toBeGreaterThan(10);
      for (const [time, angle] of samples) expect(Math.abs(angle - swingAngle(time)), `at ${Math.round(time)} ms`).toBeLessThan(1);
      expect(Math.min(...samples.map(([, angle]) => angle)), "the spring overshoots -4°").toBeLessThan(-5);
      expect(samples.at(-1)![1]).toBeCloseTo(-4, 1);
      const timing = await page.locator("[data-lost-property]").evaluate((element) => element.getAnimations()[0]?.effect?.getComputedTiming().duration);
      // After the swing ends nothing animates, so the animation is gone; before then its length is the spring's.
      expect([undefined, tagSwing.duration]).toContain(timing);
      await expect(page.locator("[data-lost-property]")).toHaveCSS("rotate", "-4deg");
    });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows the tag at rest at -4 degrees and never swings", async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Frame sampling, Chromium");
      await page.addInitScript(() => {
        const store = window as unknown as { __rest: string[]; __restDone?: boolean };
        store.__rest = [];
        const start = performance.now();
        const tick = () => {
          const tag = document.querySelector("[data-lost-property]");
          if (tag) store.__rest.push(`${getComputedStyle(tag).rotate}/${tag.getAnimations().length}`);
          if (performance.now() - start < 1200) requestAnimationFrame(tick);
          else store.__restDone = true;
        };
        requestAnimationFrame(tick);
      });
      await page.goto("/nothing-here");
      await expect.poll(() => page.evaluate(() => (window as unknown as { __restDone?: boolean }).__restDone === true), { timeout: 9000 }).toBe(true);
      const rest = await page.evaluate(() => (window as unknown as { __rest: string[] }).__rest);
      expect(rest.length).toBeGreaterThan(10);
      // Every frame: rotated -4deg, with nothing animating it.
      expect(new Set(rest)).toEqual(new Set(["-4deg/0"]));
    });
  });
});

test.describe("Footer name fill", () => {
  const fill = (page: Page) => page.locator(".stretch-footer__name").evaluate((el) => getComputedStyle(el, "::after").clipPath);
  const filled = (page: Page) => expect.poll(() => fill(page), { timeout: 5000 });

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("Elias fills on footer hover and drains when the pointer leaves", async ({ page }) => {
      await page.goto("/");
      await page.locator(".stretch-footer").scrollIntoViewIfNeeded();
      await expect.poll(() => fill(page)).toContain("100%");
      await page.locator(".stretch-footer p").hover();
      await filled(page).not.toContain("100%");
      await page.mouse.move(2, 2);
      await filled(page).toContain("100%");
    });

    test("it runs on the nameFill spring", async ({ page }) => {
      await page.goto("/");
      const timing = () =>
        page.locator(".stretch-footer__name").evaluate((el) => {
          const style = getComputedStyle(el, "::after");
          return { duration: parseFloat(style.transitionDuration) * 1000, easing: style.transitionTimingFunction };
        });
      // The transition lasts the spring's whole settle time (the spring's 0.7 s is its visual duration, which spring.ts stretches to settle), so it is the spring's own value, not a loose lower bound.
      await expect.poll(async () => (await timing()).duration, { timeout: 5000 }).toBeCloseTo(nameFill.duration, 0);
      await expect.poll(async () => (await timing()).easing).toContain("linear(");
    });

    test("it fills while a Say hello link has keyboard focus, and not for the footer text itself", async ({ page, browserName }) => {
      test.skip(browserName === "webkit", "Safari does not Tab to links by default");
      await page.goto("/");
      await page.locator("#say-hello .stretch-hello__big").focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await filled(page).not.toContain("100%");
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await filled(page).toContain("100%");
      expect(await page.locator(".stretch-footer, .stretch-footer *").evaluateAll((els) => els.filter((el) => el.hasAttribute("tabindex")).length)).toBe(0);
    });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the fill is a cut: no transition", async ({ page }) => {
      await page.goto("/");
      await expect.poll(() => page.locator(".stretch-footer__name").evaluate((el) => getComputedStyle(el, "::after").transitionDuration)).toBe("0s");
      await page.locator(".stretch-footer p").hover();
      await filled(page).not.toContain("100%");
    });
  });
});

test.describe("Now making pulse", () => {
  const mark = (page: Page) => page.locator("[data-fixture='making'] [data-now-mark]");
  // The ring is the mark's ::after, so its animations come from the subtree.
  const ring = (page: Page) =>
    mark(page).evaluate((element) =>
      element.getAnimations({ subtree: true }).map((animation) => {
        const effect = animation.effect as KeyframeEffect;
        return {
          name: (animation as CSSAnimation).animationName,
          iterations: effect.getComputedTiming().iterations,
          properties: [...new Set(effect.getKeyframes().flatMap((frame) => Object.keys(frame)))].filter((key) => !["offset", "easing", "composite", "computedOffset"].includes(key)).sort(),
          playState: animation.playState,
        };
      }),
    );

  const ringStyle = (page: Page) => mark(page).evaluate((element) => getComputedStyle(element, "::after").animationName);
  // Counts the ring's real playback: the animation events fire on the mark for its ::after.
  const countPlayback = (page: Page) =>
    mark(page).evaluate((element) => {
      const counts = { starts: 0, iterations: 0, ends: 0 };
      element.addEventListener("animationstart", () => counts.starts++);
      element.addEventListener("animationiteration", () => counts.iterations++);
      element.addEventListener("animationend", () => counts.ends++);
      (window as unknown as { __pulse: typeof counts }).__pulse = counts;
    });
  const playback = (page: Page) => page.evaluate(() => ({ ...(window as unknown as { __pulse: object }).__pulse }));

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("rings three times as its card enters view, on transform and opacity only, then rests", async ({ page }) => {
      await page.goto("/fixtures/off-the-clock");
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
      const card = page.locator("[data-fixture='making']");
      await expect.poll(() => card.evaluate((element) => element.getBoundingClientRect().top > innerHeight), { message: "the card starts below the fold" }).toBe(true);
      expect(await ring(page), "nothing plays before the card is in view").toEqual([]);
      await countPlayback(page);
      await card.scrollIntoViewIfNeeded();
      await expect.poll(async () => (await ring(page))[0]?.name).toBe("stretch-now-pulse");
      const [pulse] = await ring(page);
      expect(pulse.iterations).toBe(3);
      expect(pulse.properties).toEqual(["opacity", "transform"]);
      await expect.poll(async () => await ring(page), { timeout: 10_000, message: "the animation ends after its three plays" }).toEqual([]);
      // One start, a new play at each of the two boundaries after it, one end: three plays, observed.
      await expect.poll(() => playback(page)).toEqual({ starts: 1, iterations: 2, ends: 1 });
      await page.waitForTimeout(2_000);
      expect(await playback(page), "and it stays at rest").toEqual({ starts: 1, iterations: 2, ends: 1 });
    });

    test("scrolling away and back does not start it again", async ({ page }) => {
      await page.goto("/fixtures/off-the-clock");
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
      const card = page.locator("[data-fixture='making']");
      await card.scrollIntoViewIfNeeded();
      await expect.poll(async () => (await ring(page)).length).toBe(1);
      await expect.poll(async () => (await ring(page)).length, { timeout: 10_000 }).toBe(0);
      await page.evaluate(() => scrollTo(0, 0));
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      expect(await ring(page)).toEqual([]);
    });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the mark is the still dot: nothing plays even once the card has been seen", async ({ page }) => {
      await page.goto("/fixtures/off-the-clock");
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
      await countPlayback(page);
      await page.locator("[data-fixture='making']").scrollIntoViewIfNeeded();
      // The card has been seen: the observer fired and set the state that starts the ring.
      await expect(mark(page)).toHaveAttribute("data-rung", "");
      await page.waitForTimeout(500);
      expect(await ring(page)).toEqual([]);
      expect(await ringStyle(page)).toBe("none");
      expect(await playback(page)).toEqual({ starts: 0, iterations: 0, ends: 0 });
      // So it is the media query that holds it back: allow motion and the same state plays.
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await expect.poll(() => ringStyle(page)).toBe("stretch-now-pulse");
    });
  });
});

// One signature per surface, and nothing else that runs on its own beside it (#227). A motion "runs on its own" when
// it plays on the document's clock: scroll- and view-driven motion follows the reader's hand, and a transition is
// feedback. The only such motion on the page is the Now making ring.
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

  test("the sampler sees a running ring on the Off the clock fixture", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    await page.locator("[data-fixture='making']").scrollIntoViewIfNeeded();
    // The fixture shows the ring on more than one card, so it is the name that is compared here.
    await expect.poll(async () => [...new Set(await selfRunning(page))]).toEqual(["stretch-now-pulse"]);
  });

  test("live dots that are on screen together take turns: one ring at a time, and each rings in the end", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/fixtures/off-the-clock");
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    const layout = page.locator("[data-fixture='layout']");
    await layout.locator("[data-off-the-clock]").scrollIntoViewIfNeeded();
    await expect(layout.locator("[data-now-mark]")).toHaveCount(3);
    // Each ring is three plays of 1.8 s, so the three take about sixteen seconds between them.
    let most = 0;
    await expect
      .poll(
        async () => {
          most = Math.max(most, (await selfRunning(page)).length);
          return layout.locator("[data-now-mark][data-rung]").count();
        },
        { timeout: 40_000, intervals: [100] },
      )
      .toBe(3);
    expect(most, "rings running on screen at once").toBe(1);
    await expect.poll(async () => (await selfRunning(page)).length, { timeout: 10_000 }).toBe(0);
  });

  test("a scroll pass down the homepage never has two on screen together", async ({ page }) => {
    await page.goto("/");
    // The arrival reactions (the underline drawing, the greeting's scene) play once on every load and finish by themselves; what the pass looks for is what keeps running.
    await expect.poll(async () => (await selfRunning(page)).filter((name) => name !== "stretch-now-pulse")).toEqual([]);
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
    expect([...seen].every((name) => name === "stretch-now-pulse")).toBe(true);
  });
});
