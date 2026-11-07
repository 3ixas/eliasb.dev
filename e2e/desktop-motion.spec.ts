import { expect, test, type Locator, type Page } from "@playwright/test";

/*
 * Desktop motion (docs/design/DESIGN.md, "Moving between rows"; the craft bar's interruption walk, steps 6 and 8).
 * Each test pauses and seeks the animation it judges, in the same task that starts it, so a slow runner cannot
 * miss a window of 120 ms and nothing waits on a clock.
 */

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1180;
const margin = (page: Page) => page.locator(".qi-margin");
const rowFor = (page: Page, id: string) => page.locator(`section#work [data-look="${id}"]`);

const hydrated = (page: Page) =>
  page.waitForFunction(() => {
    const columns = [...document.querySelectorAll("[data-quiet-column]")];
    return columns.length > 0 && columns.every((column) => Object.keys(column).some((key) => key.startsWith("__reactProps$")));
  });

/** The names of the finite CSS animations still to play inside a look, which are its arrival. */
const arrivals = (look: Locator) =>
  look.evaluate((element) =>
    element
      .getAnimations({ subtree: true })
      .filter((animation) => animation.playState !== "finished" && (animation.effect as KeyframeEffect | null)?.target !== element && Number.isFinite(animation.effect?.getComputedTiming().iterations))
      .map((animation) => (animation as CSSAnimation).animationName),
  );

/**
 * Armed before the pointer arrives: waits in the page for the reaction on `host` to start and pauses it in the task that
 * finds it, at `at` ms, so a slow runner cannot let a 900 ms swing finish between a hover and a read. Returns the names paused.
 */
const pauseReaction = (host: Locator, at: number) =>
  host.evaluate(async (element, time) => {
    let playing: Animation[] = [];
    // Only once the element is reacting: its own arrival animations are not the reaction.
    while (!playing.length) {
      await new Promise(requestAnimationFrame);
      if (!element.hasAttribute("data-reacting")) continue;
      playing = element.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running" && Number.isFinite(animation.effect?.getComputedTiming().iterations));
    }
    for (const animation of playing) {
      animation.pause();
      animation.currentTime = time;
    }
    return playing.map((animation) => (animation as CSSAnimation).animationName);
  }, at);

test.describe("Desktop motion: the margin", () => {
  test.skip(({ page }) => !wide(page), "The margin is for wide screens with a hovering pointer");
  test.use({ reducedMotion: "no-preference" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    const bnp = rowFor(page, "bnp-paribas");
    await bnp.scrollIntoViewIfNeeded();
    // Near the top of the window, so neither row's margin is lifted by the bottom edge.
    await bnp.evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().top - 140));
    // The scroll event arrives a frame later, and a scroll during a glide ends it; let it land before any pointer moves.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  });

  test("the first look arrives in full; the next crossfades over 120 ms with its arrival already played", async ({ page }) => {
    await rowFor(page, "bnp-paribas").hover();
    const first = margin(page).locator(".qi-look");
    await expect(first.locator(".qi-pass")).toBeVisible();
    expect(await arrivals(first)).toContain("qi-drop");
    await expect(margin(page)).not.toHaveAttribute("data-settled", "");

    await rowFor(page, "joveen").hover();
    const next = margin(page).locator(".qi-look");
    await expect(margin(page).locator('.qi-pass[data-pass-slug="joveen"]')).toBeVisible();
    await expect(margin(page)).toHaveAttribute("data-settled", "");
    expect(await arrivals(next)).toEqual([]);
    const fade = await next.evaluate((element) => {
      const own = element.getAnimations().find((animation) => (animation.effect as KeyframeEffect | null)?.target === element);
      return { name: (own as CSSAnimation).animationName, duration: own!.effect!.getComputedTiming().duration };
    });
    expect(fade).toEqual({ name: "qi-fade", duration: 120 });
  });

  test("the glide is 240 ms on transform, and seeked through it the margin never leaves the span between the two places", async ({ page }) => {
    await rowFor(page, "bnp-paribas").hover();
    await expect(margin(page).locator(".qi-pass")).toBeVisible();
    // The glide is what `data-glide` plus a new transform does; making both in one task judges the CSS itself, whatever a runner's pointer or scroll timing.
    const glide = await margin(page).evaluate((element) => {
      const from = element.getBoundingClientRect().y;
      const [, x, y] = element.style.transform.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/)!.map(Number);
      element.dataset.glide = "";
      element.style.transform = `translate(${x}px, ${y + 80}px)`;
      const transitions = element.getAnimations().filter((animation) => animation instanceof CSSTransition);
      const transform = transitions.find((animation) => (animation as CSSTransition).transitionProperty === "transform");
      if (!transform) return null;
      transform.pause();
      const timing = transform.effect!.getComputedTiming();
      const ys: number[] = [];
      for (const time of [0, 60, 120, 180, 239]) {
        transform.currentTime = time;
        ys.push(element.getBoundingClientRect().y);
      }
      return { duration: timing.duration, ys, from, properties: transitions.map((animation) => (animation as CSSTransition).transitionProperty) };
    });
    expect(glide).not.toBeNull();
    expect(glide!.duration).toBe(240);
    expect(glide!.properties).not.toContain("top");
    expect(glide!.properties).not.toContain("left");
    // No overshoot: every sampled place lies between where it started and where it was going.
    for (const y of glide!.ys) {
      expect(y).toBeGreaterThanOrEqual(glide!.from - 1);
      expect(y).toBeLessThanOrEqual(glide!.from + 80 + 1);
    }
    expect(glide!.ys[0]).toBeCloseTo(glide!.from, 0);
  });

  test("moving to another row sets the glide", async ({ page }) => {
    await rowFor(page, "bnp-paribas").hover();
    await expect(margin(page).locator(".qi-pass")).toBeVisible();
    const target = (await rowFor(page, "joveen").boundingBox())!;
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2);
    await expect(margin(page).locator('.qi-pass[data-pass-slug="joveen"]')).toBeVisible();
    // A scroll ends the glide on purpose, so the attribute is read the moment the look changes, not afterwards.
    await expect(margin(page)).toHaveAttribute("data-settled", "");
  });

  test("the margin fades over 120 ms without moving, and returning inside the fade is the same sweep", async ({ page }) => {
    await rowFor(page, "bnp-paribas").hover();
    await expect(margin(page).locator(".qi-pass")).toBeVisible();
    // Armed before the pointer leaves: at the commit that starts the fade, the pointer comes back to the same row, in the same task.
    const returned = page.evaluate(
      () =>
        new Promise<{ sameNode: boolean; leaving: boolean; settled: boolean; fadeMs: number }>((resolve) => {
          const node = document.querySelector<HTMLElement>(".qi-margin")!;
          const observer = new MutationObserver(() => {
            if (!node.hasAttribute("data-leaving")) return;
            observer.disconnect();
            const before = node.getBoundingClientRect().y;
            const fade = node.getAnimations().find((animation) => (animation as CSSTransition).transitionProperty === "opacity");
            const fadeMs = Number(fade?.effect?.getComputedTiming().duration);
            document.querySelector('section#work [data-look="bnp-paribas"]')!.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
            requestAnimationFrame(() =>
              resolve({
                sameNode: document.querySelector(".qi-margin") === node && node.getBoundingClientRect().y === before,
                leaving: node.hasAttribute("data-leaving"),
                settled: node.hasAttribute("data-settled"),
                fadeMs,
              }),
            );
          });
          observer.observe(node, { attributes: true, attributeFilter: ["data-leaving"] });
        }),
    );
    await page.mouse.move(5, 5);
    const result = await returned;
    expect(result.fadeMs).toBe(120);
    expect(result.sameNode).toBe(true);
    expect(result.leaving).toBe(false);
    expect(result.settled).toBe(true);
  });

  test("a margin that is left goes after its fade, and does not move while it fades", async ({ page }) => {
    await rowFor(page, "joveen").hover();
    await expect(margin(page).locator(".qi-pass")).toBeVisible();
    const watching = page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const node = document.querySelector<HTMLElement>(".qi-margin")!;
          const observer = new MutationObserver(() => {
            if (!node.hasAttribute("data-leaving")) return;
            observer.disconnect();
            // From the commit that starts the fade, not from the look's first placement: its images may still be settling its height.
            const start = node.getBoundingClientRect().y;
            requestAnimationFrame(() => requestAnimationFrame(() => resolve(node.getBoundingClientRect().y - start)));
          });
          observer.observe(node, { attributes: true, attributeFilter: ["data-leaving"] });
        }),
    );
    await page.mouse.move(5, 5);
    expect(await watching).toBe(0);
    await expect(margin(page)).toHaveCount(0);
  });
});

test.describe("Desktop motion: reactions finish", () => {
  test.skip(({ page }) => !wide(page), "Reactions start from a hovering pointer");
  test.use({ reducedMotion: "no-preference" });

  test("a row's pass keeps swinging after the pointer has left, then rests", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    const row = rowFor(page, "bnp-paribas");
    await row.scrollIntoViewIfNeeded();
    const mini = row.locator(".qi-mini");
    const paused = pauseReaction(row, 300);
    await row.hover();
    expect(await paused).toContain("qi-swing");
    await page.mouse.move(5, 5);
    // Gone from the row, the reaction is still there, where it was.
    await expect(row).toHaveAttribute("data-reacting", "");
    expect(await mini.evaluate((element) => element.getAnimations().find((animation) => (animation as CSSAnimation).animationName === "qi-swing")?.currentTime)).toBe(300);
    await mini.evaluate((element) => element.getAnimations().find((animation) => (animation as CSSAnimation).animationName === "qi-swing")!.finish());
    await expect(row).not.toHaveAttribute("data-reacting", "");
    await expect(mini).toHaveCSS("animation-name", "none");
  });

  test("the employer's pass and the opening line's letters finish too", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    for (const [host, name] of [
      [".qi-bnp", "qi-hang"],
      [".qi-opening__tail", "qi-lift"],
    ] as const) {
      const element = page.locator(host).first();
      const paused = pauseReaction(element, 100);
      await element.hover({ position: { x: 3, y: 3 } });
      expect(await paused).toContain(name);
      await page.mouse.move(5, 5);
      await expect(element).toHaveAttribute("data-reacting", "");
      await element.evaluate((node) => node.getAnimations({ subtree: true }).forEach((animation) => animation.finish()));
      await expect(element).not.toHaveAttribute("data-reacting", "");
    }
  });
});

test.describe("Desktop motion: closer look words", () => {
  test.skip(({ page }) => !wide(page), "The margin is for wide screens with a hovering pointer");
  test.use({ reducedMotion: "no-preference" });

  test("the book's title and author arrive with the cover, readable by 300 ms", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    await hydrated(page);
    await page.locator("[data-fixture='book'] [data-look='book']").hover();
    const look = margin(page).locator(".qi-look");
    await expect(look.locator(".qi-look__name")).toBeVisible();
    const opacities = await look.evaluate((element) => {
      for (const animation of element.getAnimations({ subtree: true })) {
        animation.pause();
        animation.currentTime = 300;
      }
      return ["name", "by"].map((part) => Number(getComputedStyle(element.querySelector(`.qi-look__${part}`)!).opacity));
    });
    expect(opacities).toEqual([1, 1]);
  });
});

test.describe("Desktop motion: reduced motion", () => {
  test.skip(({ page }) => !wide(page), "The margin is for wide screens with a hovering pointer");
  test.use({ reducedMotion: "reduce" });

  test("each look still shows with a 0.2 s fade and no arrival, and a sweep has no glide or fade-out", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    await rowFor(page, "bnp-paribas").hover();
    const look = margin(page).locator(".qi-look");
    await expect(look.locator(".qi-pass")).toBeVisible();
    expect(await arrivals(look)).toEqual([]);
    expect(await look.evaluate((element) => element.getAnimations().map((animation) => animation.effect!.getComputedTiming().duration))).toEqual([200]);
    await rowFor(page, "joveen").hover();
    await expect(margin(page).locator('.qi-pass[data-pass-slug="joveen"]')).toBeVisible();
    expect(await margin(page).evaluate((element) => element.getAnimations().map((animation) => (animation as CSSTransition).transitionProperty))).toEqual([]);
    await page.mouse.move(5, 5);
    await expect(margin(page)).toHaveCount(0);
  });
});
