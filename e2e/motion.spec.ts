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

// Panel to page (#472, quietened in #493): only the clicked employer or project title carries across,
// in 240 ms (< 300 ms) on --out; the root never fades, screenshots do not travel, and reduced motion
// or browsers without View Transitions change at once.
test.describe("Panel to page title transitions", () => {
  type GroupFrame = { x: number; y: number; w: number; h: number };
  type RouteTransitionSample = {
    groups: { pseudo: string; duration: number; easing: string; newObjectFit: string }[];
    animatedPseudos: string[];
    rootAnimated: boolean;
    start: GroupFrame | null;
    mid: GroupFrame | null;
    end: GroupFrame | null;
  };

  /** Waits until React has attached its event handlers to an interactive element before triggering a transition. */
  async function waitForHydration(page: Page, selector: string) {
    await expect
      .poll(() =>
        page.locator(selector).first().evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$"))),
      )
      .toBe(true);
  }

  /**
   * Intercepts the next `document.startViewTransition` call, pauses the shared title group once ready,
   * seeks to 0%, 25% and 100%, and skips the transition so the spec proves the morph without waiting it out.
   */
  async function sampleRouteTransition(page: Page, action: () => Promise<unknown>, expectedUrl: RegExp): Promise<RouteTransitionSample> {
    const sample = page.evaluate(
      () =>
        new Promise<RouteTransitionSample>((resolve, reject) => {
          const original = document.startViewTransition.bind(document);
          const timer = window.setTimeout(() => {
            document.startViewTransition = original;
            reject(new Error("document.startViewTransition was not called within 15000ms"));
          }, 15000);
          document.startViewTransition = function (arg: Parameters<Document["startViewTransition"]>[0]) {
            window.clearTimeout(timer);
            document.startViewTransition = original;
            const vt = original(arg);
            vt.ready
              .then(() => {
                const vtAnims = document.getAnimations().filter((animation) => {
                  const pe = (animation.effect as KeyframeEffect | null)?.pseudoElement;
                  return Boolean(pe && pe.startsWith("::view-transition"));
                });
                const animatedPseudos = vtAnims
                  .filter((animation) => (Number(animation.effect!.getComputedTiming().duration) || 0) > 0)
                  .map((animation) => (animation.effect as KeyframeEffect).pseudoElement!);
                const rootAnimated = animatedPseudos.some((pe) => pe.includes("(root)"));
                const groupAnims = vtAnims.filter((animation) => {
                  const pe = (animation.effect as KeyframeEffect).pseudoElement!;
                  return pe.startsWith("::view-transition-group(") && pe !== "::view-transition-group(root)";
                });
                const groups = groupAnims.map((animation) => {
                  const pseudo = (animation.effect as KeyframeEffect).pseudoElement!;
                  const newPseudo = pseudo.replace("::view-transition-group(", "::view-transition-new(");
                  const duration = Number(animation.effect!.getComputedTiming().duration) || 0;
                  const easing = getComputedStyle(document.documentElement, pseudo).animationTimingFunction;
                  const newObjectFit = getComputedStyle(document.documentElement, newPseudo).objectFit;
                  return { pseudo, duration, easing, newObjectFit };
                });

                let start: GroupFrame | null = null;
                let mid: GroupFrame | null = null;
                let end: GroupFrame | null = null;
                if (groupAnims.length === 1 && groups[0].duration > 0) {
                  const group = groupAnims[0];
                  const { pseudo, duration } = groups[0];
                  const readAt = (time: number): GroupFrame => {
                    group.pause();
                    group.currentTime = time;
                    const style = getComputedStyle(document.documentElement, pseudo);
                    const matrix = new DOMMatrix(style.transform);
                    return { x: matrix.m41, y: matrix.m42, w: parseFloat(style.width), h: parseFloat(style.height) };
                  };
                  start = readAt(0);
                  mid = readAt(duration * 0.25);
                  end = readAt(duration);
                  group.finish();
                }

                vt.skipTransition();
                resolve({ groups, animatedPseudos, rootAnimated, start, mid, end });
              })
              .catch((error) => {
                vt.skipTransition();
                reject(error);
              });
            return vt;
          };
        }),
    );

    // Prevent an unhandled rejection if the timeout fires while `action()` is still running.
    sample.catch(() => {});
    await action();
    await expect(page).toHaveURL(expectedUrl, { timeout: 15000 });
    return sample;
  }

  function expectSingleTitleMorph(sample: RouteTransitionSample, expectedName: string, expectedObjectFit: "fill" | "none" = "fill") {
    expect(sample.rootAnimated).toBe(false);
    expect(sample.groups).toHaveLength(1);
    expect(sample.groups[0].pseudo).toBe(`::view-transition-group(${expectedName})`);
    expect(sample.groups[0].duration).toBe(240);
    expect(sample.groups[0].easing).toBe("cubic-bezier(0.22, 1, 0.36, 1)");
    expect(sample.groups[0].newObjectFit).toBe(expectedObjectFit);
    expect(sample.start).not.toBeNull();
    expect(sample.mid).not.toBeNull();
    expect(sample.end).not.toBeNull();
    const distStartEnd = Math.hypot(
      sample.end!.x - sample.start!.x,
      sample.end!.y - sample.start!.y,
      sample.end!.w - sample.start!.w,
    );
    const distStartMid = Math.hypot(
      sample.mid!.x - sample.start!.x,
      sample.mid!.y - sample.start!.y,
      sample.mid!.w - sample.start!.w,
    );
    expect(distStartEnd).toBeGreaterThan(4);
    expect(distStartMid).toBeGreaterThan(0);
    expect(distStartMid).toBeLessThan(distStartEnd);
  }

  test("project panel on the homepage and next-project panel morph only the clicked title", async ({ page }) => {
    await withoutScene(page);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    const thresholdPanel = page.locator('#things-i-make a.project[href="/things-i-make/threshold"]');
    await thresholdPanel.scrollIntoViewIfNeeded();
    await waitForHydration(page, '#things-i-make a.project[href="/things-i-make/threshold"]');

    const forward = await sampleRouteTransition(page, () => thresholdPanel.click(), /\/things-i-make\/threshold$/);
    expectSingleTitleMorph(forward, "route-title-project-threshold");

    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    const nextPanel = page.locator(".next-panel");
    await nextPanel.scrollIntoViewIfNeeded();
    await waitForHydration(page, ".next-panel");
    const toNext = await sampleRouteTransition(page, () => nextPanel.click(), /\/things-i-make\/argus-risk$/);
    expectSingleTitleMorph(toNext, "route-title-project-argus-risk");
  });

  test("archive project panel to case study and back link carry only the project title with no next-panel ghost", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/things-i-make");
    const flowtimePanel = page.locator('a.project[href="/things-i-make/flowtime"]');
    await flowtimePanel.scrollIntoViewIfNeeded();
    await waitForHydration(page, 'a.project[href="/things-i-make/flowtime"]');

    const forward = await sampleRouteTransition(page, () => flowtimePanel.click(), /\/things-i-make\/flowtime$/);
    expectSingleTitleMorph(forward, "route-title-project-flowtime");

    // Threshold sits first on /things-i-make, so its title is in view at every width on the back link.
    await page.goto("/things-i-make/threshold");
    const backLink = page.locator(".story-back").first();
    await expect(backLink).toBeVisible();
    await waitForHydration(page, ".story-back");
    const back = await sampleRouteTransition(page, () => backLink.click(), /\/things-i-make$/);
    expectSingleTitleMorph(back, "route-title-project-threshold");
  });

  test("Work panel, next-role panel (including Optegra) and back link carry only the employer title", async ({ page }) => {
    await withoutScene(page);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    await page.evaluate(() => document.fonts.ready);

    // Center Joveen so both its visible title (.panel__name) and story link stay on-screen,
    // and wait for its OnView arrival to finish before clicking.
    await page.locator("#joveen").evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await waitForHydration(page, "#joveen .work__story");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const titleRect = document.querySelector("#joveen .panel__name")?.getBoundingClientRect();
          const linkRect = document.querySelector("#joveen .work__story")?.getBoundingClientRect();
          const arrival = document.querySelector("#joveen")?.closest(".work-role__arrival");
          const arrivalStyle = arrival ? getComputedStyle(arrival) : null;
          const settled = !arrivalStyle || (parseFloat(arrivalStyle.opacity) > 0.99 && arrivalStyle.transform === "none");
          const inView = (rect?: DOMRect) => Boolean(rect && rect.bottom > 0 && rect.top < window.innerHeight);
          return settled && inView(titleRect) && inView(linkRect);
        }),
      )
      .toBe(true);

    const toJoveen = await sampleRouteTransition(page, () => page.locator("#joveen .work__story").click(), /\/work\/joveen$/);
    expectSingleTitleMorph(toJoveen, "route-title-employer-joveen");

    const nextOptegra = page.locator(".next-panel");
    await nextOptegra.scrollIntoViewIfNeeded();
    await waitForHydration(page, ".next-panel");
    const toOptegra = await sampleRouteTransition(page, () => nextOptegra.click(), /\/work\/optegra$/);
    expectSingleTitleMorph(toOptegra, "route-title-employer-optegra", "none");

    // Navigate from BNP Paribas back to /#work: BNP is the first Work panel, so its title is in view at every width.
    await page.goto("/work/bnp-paribas");
    await waitForHydration(page, ".story-back");
    const backToWork = await sampleRouteTransition(page, () => page.locator(".story-back").first().click(), /\/#work$/);
    expectSingleTitleMorph(backToWork, "route-title-employer-bnp-paribas");
  });

  test("browser Back preserves scroll restoration and keyboard navigation with transitions active", async ({ page }, testInfo) => {
    await withoutScene(page);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    const thresholdPanel = page.locator('#things-i-make a.project[href="/things-i-make/threshold"]');
    await thresholdPanel.scrollIntoViewIfNeeded();
    await waitForHydration(page, '#things-i-make a.project[href="/things-i-make/threshold"]');
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(200);

    // Navigate from the keyboard with real transitions playing and verify focus stays usable on the destination.
    await thresholdPanel.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/things-i-make\/threshold$/);
    await expect(page.getByRole("heading", { level: 1, name: "Threshold" })).toBeVisible();
    await page.keyboard.press(testInfo.project.name.startsWith("webkit") ? "Alt+Tab" : "Tab");
    const focusedOnDestination = await page.evaluate(() => {
      const el = document.activeElement;
      return Boolean(el && el !== document.body && el !== document.documentElement);
    });
    expect(focusedOnDestination).toBe(true);

    // React 19.3 intentionally flushes synchronous popstate restorations without startViewTransition
    // (avoiding double-animation with native swipe-back gestures); verify browser Back still returns cleanly
    // and restores the homepage's scroll position.
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => page.evaluate((before) => Math.abs(window.scrollY - before), scrollBefore)).toBeLessThan(120);

    // Also verify browser Back after a NextPanel hop (Joveen -> Optegra -> Back to Joveen).
    await page.goto("/work/joveen");
    const nextOptegra = page.locator(".next-panel");
    await nextOptegra.scrollIntoViewIfNeeded();
    await waitForHydration(page, ".next-panel");
    await nextOptegra.click();
    await expect(page).toHaveURL(/\/work\/optegra$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/work\/joveen$/);
    await expect(page.getByRole("heading", { level: 1, name: "Joveen" })).toBeVisible();
  });

  test("with reduced motion, no view-transition animation plays", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/things-i-make");
    const flowtimePanel = page.locator('a.project[href="/things-i-make/flowtime"]');
    await flowtimePanel.scrollIntoViewIfNeeded();
    await waitForHydration(page, 'a.project[href="/things-i-make/flowtime"]');

    const sample = await sampleRouteTransition(page, () => flowtimePanel.click(), /\/things-i-make\/flowtime$/);
    expect(sample.animatedPseudos).toEqual([]);
    await expect(page.getByRole("heading", { level: 1, name: "Flowtime" })).toBeVisible();
  });

  test("without startViewTransition support, forward, back link and browser Back still navigate cleanly", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      Object.defineProperty(Document.prototype, "startViewTransition", { value: undefined, configurable: true, writable: true });
    });

    await page.goto("/things-i-make");
    await page.locator('a.project[href="/things-i-make/threshold"]').click();
    await expect(page).toHaveURL(/\/things-i-make\/threshold$/);
    await expect(page.getByRole("heading", { level: 1, name: "Threshold" })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/things-i-make$/);
    await expect(page.getByRole("heading", { level: 1, name: "Things I make" })).toBeVisible();
    expect(errors).toEqual([]);
  });
});
