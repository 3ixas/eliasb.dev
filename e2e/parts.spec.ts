import { expect, test, type Locator, type Page } from "@playwright/test";
import { roleStories, roleStorySlugs } from "../src/content/stretch/role-stories";
import { featuredSlugs, projects } from "../src/content/projects";
import { luminance } from "../src/content/stretch/story";
import { renderedContrast } from "./support/rendered-contrast";
import { shown } from "./support/roll";

// The shared parts (src/app/parts.css; docs/design/DESIGN.md "The panel", "Controls" and "Motion"), on
// /fixtures/parts. The successor of feedback.spec.ts, craft-precision.spec.ts's press and interruption checks and
// classic-scrollbars.spec.ts for the passes and panels parts; those keep checking the quiet index until #420.
// Computed styles are read through web-first assertions, and motion is sought, never waited out.

const fixture = "/fixtures/parts";
const scaled = "matrix(0.97, 0, 0, 0.97, 0, 0)";
const phone = (page: Page) => page.viewportSize()!.width < 720;

/** Opens the fixture and waits for both faces, so a layout read measures the real fonts, not their fallbacks. */
async function openWithFonts(page: Page) {
  await page.goto(fixture);
  for (const family of ["Newsreader", "Instrument Sans"]) {
    await expect
      .poll(() => page.evaluate((name) => [...document.fonts].some((face) => face.family.replaceAll('"', "") === name && face.status === "loaded"), family), { message: `${family} loaded` })
      .toBe(true);
  }
}

/** Every panel field on the fixture, as the browser computes its ink, keyed by the panel's slug. */
const fields = [
  ...roleStorySlugs.map((slug) => [slug, roleStories[slug].panel] as const),
  ...featuredSlugs.map((slug) => [slug, projects.find((project) => project.slug === slug)!.panel!] as const),
];
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16)).join(", ")})`;

const style = (target: Locator, ...properties: string[]) =>
  target.evaluate((element, names) => {
    const computed = getComputedStyle(element);
    return Object.fromEntries(names.map((name) => [name, computed.getPropertyValue(name)]));
  }, properties);

test.describe("The panel", () => {
  test("has its radius and padding at this width, in its field and ink", async ({ page }) => {
    await page.goto(fixture);
    for (const [slug, { field, ink }] of fields) {
      const panel = page.locator(`[data-panel="${slug}"]`);
      expect(await style(panel, "border-top-left-radius", "padding-top", "padding-left", "background-color", "color"), slug).toEqual({
        "border-top-left-radius": phone(page) ? "22px" : "28px",
        "padding-top": phone(page) ? "26px" : "44px",
        "padding-left": phone(page) ? "22px" : "44px",
        "background-color": rgb(field),
        color: rgb(ink),
      });
    }
    // Joveen's panel lifts to #1a1a1f so it clearly separates from the #0d0d0f dark page (R-41).
    await expect(page.locator('[data-panel="joveen"]')).toHaveCSS("background-color", "rgb(26, 26, 31)");
  });

  // Depth (#458, #476): every panel is lit from above, with a rim, and casts a shadow tinted by its own field.
  test("every panel is lit from above: a top highlight, a foot shade and a rim over a tinted shadow", async ({ page }, testInfo) => {
    await page.goto(fixture);
    const dark = testInfo.project.name.endsWith("-dark");
    for (const [slug, { field, ink }] of fields) {
      const panel = page.locator(`[data-panel="${slug}"]`);
      const edges = await panel.evaluate((element) => getComputedStyle(element, "::after").boxShadow);
      expect(edges, `${slug}'s top highlight`).toContain(dark ? "rgba(255, 255, 255, 0.3) 0px 1px 0px 0px inset" : "rgba(255, 255, 255, 0.36) 0px 1px 0px 0px inset");
      expect(edges, `${slug}'s foot shade`).toContain("rgba(0, 0, 0, 0.14) 0px -1px 0px 0px inset");
      // In dark, a bright field (its ink darker than it) takes the stronger rim; in light, the rim is its own ink.
      const bright = luminance(ink) < luminance(field);
      if (dark) expect(edges, `${slug}'s rim`).toContain(`rgba(255, 255, 255, ${bright ? "0.42" : "0.16"}) 0px 0px 0px 1px inset`);
      else expect(edges, `${slug}'s rim`).toMatch(/0px 0px 0px 1px inset$/);
      const cast = (await style(panel, "box-shadow"))["box-shadow"];
      expect(cast, `${slug}'s shadows`).toMatch(/0px 6px 14px -6px.*0px 28px 56px -28px/);
      if (dark) expect(cast, `${slug}'s shadow in dark`).toContain("rgba(0, 0, 0, 0.55) 0px 6px 14px -6px");
      else expect(cast, `${slug}'s shadow in its own colour`).not.toContain("rgba(0, 0, 0, 0.55)");
      // Lighter at the top; deeper at the foot only where its ink is light, so its text keeps AA there.
      const image = (await style(panel, "background-image"))["background-image"];
      expect(image, `${slug}'s field`).toMatch(/^linear-gradient/);
      expect(image.endsWith(`${rgb(field)} 100%)`), `${slug}'s foot is its field`).toBe(bright);
    }
  });

  test("its header is the name at the left in Newsreader and role and dates at the right", async ({ page }) => {
    await page.goto(fixture);
    const head = page.locator('[data-panel="bnp-paribas"] .panel__head');
    const name = await style(head.locator(".panel__name"), "font-family", "font-size");
    expect(name["font-family"]).toMatch(/^Newsreader/);
    const width = page.viewportSize()!.width;
    expect(Number.parseFloat(name["font-size"])).toBeCloseTo(Math.min(28, Math.max(22, width * 0.02)), 1);
    await expect(head.locator(".panel__meta span")).toHaveText([roleStories["bnp-paribas"].role, roleStories["bnp-paribas"].dates]);
    expect((await style(head.locator(".panel__meta"), "text-align"))["text-align"]).toBe("right");
  });

  test("a paper panel follows the theme with a hairline, and a project's casts its colour in light and nothing glows in dark", async ({ page }, testInfo) => {
    await page.goto(fixture);
    const paper = await style(page.locator('[data-panel="paper"]'), "background-color", "box-shadow");
    const dark = testInfo.project.name.endsWith("-dark");
    expect(paper["background-color"]).toBe(dark ? "rgb(25, 25, 28)" : "rgb(251, 251, 249)");
    const hair = dark ? "rgba(240, 239, 235, 0.16)" : "rgba(20, 20, 22, 0.14)";
    expect(await page.locator('[data-panel="paper"]').evaluate((element) => getComputedStyle(element, "::after").boxShadow)).toContain(`${hair} 0px 0px 0px 1px inset`);
    const cast = (await style(page.locator('[data-panel="threshold"]'), "box-shadow"))["box-shadow"];
    // In light the wide shadow is Threshold's field at 42%, which the browser writes as a color() in sRGB; in dark it is
    // black, and no layer glows in the field's colour (#493).
    expect(cast).toMatch(dark ? /rgba\(0, 0, 0, 0\.55\) 0px 28px 56px -28px$/ : /color\(srgb 0\.77\d* 0\.56\d* 0\.36\d* \/ 0\.42\) 0px 28px 56px -28px$/);
    expect(cast).not.toContain("90px");
  });
});

test.describe("Controls", () => {
  test("every pill and button is a 44 px round control in Instrument Sans 15 px / 500, on the page and on every field", async ({ page }) => {
    await openWithFonts(page);
    const controls = page.locator(".pill, .button");
    expect(await controls.count()).toBeGreaterThanOrEqual(16);
    const readings = await controls.evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return { text: element.textContent, height: element.getBoundingClientRect().height, radius: style.borderTopLeftRadius, family: style.fontFamily, size: style.fontSize, weight: style.fontWeight };
      }),
    );
    for (const reading of readings) {
      expect(reading.height, reading.text!).toBeGreaterThanOrEqual(44);
      expect(reading.radius, reading.text!).toBe("999px");
      expect(reading.family, reading.text!).toMatch(/^"?Instrument Sans/);
      expect([reading.size, reading.weight], reading.text!).toEqual(["15px", "500"]);
    }
  });

  test("a solid pill fills with its panel's ink and writes in its field; an outline pill is ink on the field", async ({ page }) => {
    await page.goto(fixture);
    for (const [slug, { field, ink }] of fields) {
      const solid = await style(page.locator(`[data-panel="${slug}"] .pill:not(.pill--outline)`).first(), "background-color", "color");
      expect(solid, slug).toEqual({ "background-color": rgb(ink), color: rgb(field) });
      const outline = await style(page.locator(`[data-panel="${slug}"] .pill--outline`).first(), "background-color", "color");
      expect(outline, slug).toEqual({ "background-color": "rgba(0, 0, 0, 0)", color: rgb(ink) });
    }
  });

  test("a long name wraps inside its pill and never leaves its panel", async ({ page }) => {
    await openWithFonts(page);
    await expect
      .poll(() =>
        page.locator("[data-panel]").evaluateAll((panels) =>
          panels.flatMap((panel) => {
            const box = panel.getBoundingClientRect();
            return [...panel.querySelectorAll(".pill")].filter((pill) => pill.getBoundingClientRect().right > box.right + 0.5).map((pill) => pill.textContent);
          }),
        ),
      )
      .toEqual([]);
  });

  test("the text link is Newsreader 18 px, a 44 px target, with its words underlined and its arrow not", async ({ page }) => {
    await openWithFonts(page);
    const link = page.locator(".text-link").first();
    const read = await style(link, "font-family", "font-size", "text-decoration-line");
    expect(read["font-family"]).toMatch(/^Newsreader/);
    expect(read["font-size"]).toBe("18px");
    expect(read["text-decoration-line"]).toBe("underline");
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect((await style(link.locator(".arrow"), "display"))["display"]).toBe("inline-block");
  });

  test("a row is a 44 px target and a chip is 13 px", async ({ page }) => {
    await openWithFonts(page);
    for (const box of await page.locator(".row").evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))) expect(box).toBeGreaterThanOrEqual(44);
    expect((await style(page.locator(".chip").first(), "font-size"))["font-size"]).toBe("13px");
  });
});

test.describe("Feedback", () => {
  // Styles and timings are the same at every width, so they are read once per engine.
  test.beforeEach(({}, testInfo) => {
    test.skip(!/-1440-light$/.test(testInfo.project.name), "Read once per engine");
  });

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("hovering moves the arrow 4 px, fills an outline pill with 10% ink, fills the button and tints a row", async ({ page }) => {
      await page.goto(fixture);
      const outline = page.locator('[data-panel="joveen"] .pill--outline');
      await outline.hover();
      // color-mix() computes to color(srgb …) in Chromium and rgba() in WebKit: Joveen's ink at 10% either way.
      await expect(outline).toHaveCSS("background-color", /^(rgba\(244, 244, 242, 0\.1\)|color\(srgb 0\.956863 0\.956863 0\.94902 \/ 0\.1\))$/);
      await expect(outline.locator(".arrow")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 3, -3)");
      const pill = page.locator('[data-panel="joveen"] .pill:not(.pill--outline)');
      await pill.hover();
      await expect(pill.locator(".arrow")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
      const button = page.locator(".button", { hasText: "Copy" });
      await button.hover();
      await expect(button).toHaveCSS("background-color", "rgb(20, 20, 22)");
      const row = page.locator(".row").first();
      await row.hover();
      await expect(row).toHaveCSS("background-color", "rgba(20, 20, 22, 0.05)");
    });

    test("pressing a pill or button scales it to .97, and letting go returns it", async ({ page }) => {
      await page.goto(fixture);
      for (const target of [page.locator('[data-panel="bnp-paribas"] .pill').first(), page.locator(".button", { hasText: "Copy" })]) {
        await target.hover();
        await page.mouse.down();
        await expect(target).toHaveCSS("transform", scaled);
        await page.mouse.move(2, 2);
        await page.mouse.up();
        await expect(target).toHaveCSS("transform", "none");
      }
    });

    test("every control answers within 100 to 250 ms on the settling curve", async ({ page }) => {
      await page.goto(fixture);
      for (const selector of [".pill", ".button", ".row", ".text-link", ".arrow"]) {
        const { durations, curve } = await page.locator(selector).first().evaluate((element) => {
          const style = getComputedStyle(element);
          return { durations: style.transitionDuration.split(", ").map((value) => Number.parseFloat(value) * 1000), curve: style.transitionTimingFunction.split(/(?<=\)),\s*/)[0] };
        });
        for (const ms of durations) {
          expect(ms, selector).toBeGreaterThanOrEqual(100);
          expect(ms, selector).toBeLessThanOrEqual(250);
        }
        expect(curve, selector).toBe("cubic-bezier(0.22, 1, 0.36, 1)");
      }
    });
  });

  test("with reduced motion a press keeps its place", async ({ page }) => {
    await page.goto(fixture);
    const button = page.locator(".button", { hasText: "Copy" });
    await button.hover();
    await page.mouse.down();
    await expect(button).toHaveCSS("transform", "none");
    await page.mouse.up();
  });

  test("hover never sticks on a touch screen", async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(fixture);
    expect(await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)).toBe(false);
    const pill = page.locator('[data-panel="joveen"] .pill--outline');
    await pill.tap();
    await expect(pill).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(pill.locator(".arrow")).toHaveCSS("transform", "none");
    await context.close();
  });
});

test.describe("Focus", () => {
  test("one ring: 2 px cobalt at 3 px offset on the page, and the panel's ink on a panel", async ({ page }, testInfo) => {
    test.skip(!/^chromium-1440-/.test(testInfo.project.name), "Read once per scheme");
    await page.goto(fixture);
    const cobalt = testInfo.project.name.endsWith("-dark") ? "rgb(140, 158, 255)" : "rgb(36, 67, 214)";
    await page.keyboard.press("Tab");
    const button = page.locator(".button", { hasText: "Copy" });
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS("outline", `${cobalt} solid 2px`);
    await expect(button).toHaveCSS("outline-offset", "3px");
    for (const [slug, { ink }] of fields) {
      const pill = page.locator(`[data-panel="${slug}"] .pill`).first();
      await pill.focus();
      await expect(pill, slug).toHaveCSS("outline", `${rgb(ink)} solid 2px`);
    }
  });

  test("the keyboard reaches every control in reading order", async ({ page }, testInfo) => {
    test.skip(!/-1440-light$/.test(testInfo.project.name), "Once per engine");
    await page.goto(fixture);
    const expected = await page.locator("main").locator("a, button").evaluateAll((elements) => elements.map((element) => element.textContent?.trim()));
    const reached: (string | undefined)[] = [];
    for (let step = 0; step < expected.length; step++) {
      await page.keyboard.press(testInfo.project.name.startsWith("webkit") ? "Alt+Tab" : "Tab");
      reached.push(await page.evaluate(() => document.activeElement?.textContent?.trim()));
    }
    expect(reached).toEqual(expected);
  });
});

test.describe("Arrival", () => {
  test.use({ reducedMotion: "no-preference" });

  test("below the fold, a panel rises, its figure rolls and its bars grow, once, ending where the server drew them", async ({ page }) => {
    await page.clock.install();
    await page.goto(fixture);
    const rise = page.locator("[data-rise]");
    const count = page.locator("[data-count]");
    const grow = page.locator("[data-grow]");
    await expect(rise).toHaveAttribute("data-armed", "");
    await expect(grow).toHaveAttribute("data-armed", "");
    await expect.poll(() => shown(count)).toBe("−0%");
    await expect(count.locator(".sr-only")).toHaveText("−40%");
    // Catch the tens digit's roll the moment it starts and pause it, so it cannot finish before it is read, however slow
    // the runner. It starts when the last armed element around it (the figure, the panel rising with it) is let go; a
    // mutation observer's callback runs before the next frame, where CI's WebKit does not reliably fire transitionrun
    // (as in work.spec's fills).
    await count.locator(".roll__strip").first().evaluate((strip) => {
      const watcher = new MutationObserver(() => {
        const animation = strip.getAnimations().find((each) => (each as CSSTransition).transitionProperty === "transform");
        if (!animation) return;
        watcher.disconnect();
        animation.pause();
        (window as unknown as { roll: Animation }).roll = animation;
      });
      watcher.observe(document.body, { attributes: true, attributeFilter: ["data-armed"], subtree: true });
    });

    await page.locator("#arrivals").evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
    await expect(rise).not.toHaveAttribute("data-armed");
    await expect(grow).not.toHaveAttribute("data-armed");
    await expect(count.locator(".roll")).not.toHaveAttribute("data-armed");
    // Seeked halfway, the tens digit stands between its start and its value: it rolls rather than jumps.
    await expect.poll(() => page.evaluate(() => "roll" in window)).toBe(true);
    const between = await count.locator(".roll__strip").first().evaluate((strip) => {
      const { roll } = window as unknown as { roll: Animation };
      roll.currentTime = 600;
      const digit = getComputedStyle(strip.children[0]);
      return -new DOMMatrix(getComputedStyle(strip).transform).f / (parseFloat(digit.height) + parseFloat(digit.marginBottom));
    });
    expect(between).toBeGreaterThan(0.5);
    expect(between).toBeLessThan(4);
    // Seek every transition to its end rather than wait it out.
    await page.evaluate(() => document.getAnimations().forEach((animation) => animation.finish()));
    await expect(rise).toHaveCSS("opacity", "1");
    await expect(rise).toHaveCSS("transform", "none");
    await expect(grow.locator(".bar--after")).toHaveCSS("transform", "none");
    await expect.poll(() => shown(count)).toBe("−40%");

    // Once: scrolling away and back does not arm it again.
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.locator("#arrivals").evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
    await expect(rise).not.toHaveAttribute("data-armed");
    await expect.poll(() => shown(count)).toBe("−40%");
  });

  test("printing before scrolling there prints the figure's finished value, not the one it starts from", async ({ page }) => {
    await page.goto(fixture);
    const count = page.locator("[data-count]");
    await expect.poll(() => shown(count)).toBe("−0%");
    await page.emulateMedia({ media: "print" });
    await expect.poll(() => shown(count)).toBe("−40%");
  });

  test("it is let go when its top passes 85% of the viewport's height, the line that armed it", async ({ page }) => {
    await page.goto(fixture);
    const rise = page.locator("[data-rise]");
    await expect(rise).toHaveAttribute("data-armed", "");
    const placeTop = (share: number) =>
      rise.evaluate((element, at) => scrollBy({ top: element.getBoundingClientRect().top - innerHeight * at, behavior: "instant" }), share);
    await placeTop(0.9);
    // Two frames for the observer to report; it must not have let go above the line.
    await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
    await expect(rise).toHaveAttribute("data-armed", "");
    await placeTop(0.8);
    await expect(rise).not.toHaveAttribute("data-armed");
  });

  test("the bars' after bar starts 300 ms behind the before", async ({ page }) => {
    await page.goto(fixture);
    const delays = await page.locator("[data-grow] .bar").evaluateAll((bars) => bars.map((bar) => getComputedStyle(bar).transitionDelay));
    expect(delays).toEqual(["0.15s", "0.45s"]);
  });
});

test.describe("Arrival, held back from no one", () => {
  test("with reduced motion everything is in its end state at once", async ({ page }) => {
    await page.goto(fixture);
    await expect.poll(() => shown(page.locator("[data-count]"))).toBe("−40%");
    await expect(page.locator("[data-armed]")).toHaveCount(0);
  });

  test("without script the server's finished state shows", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto(fixture);
    await expect.poll(() => shown(page.locator("[data-count]"))).toBe("−40%");
    await expect(page.locator("[data-armed]")).toHaveCount(0);
    await expect(page.locator("[data-rise]")).toHaveCSS("opacity", "1");
    await context.close();
  });
});

test.describe("Text", () => {
  test("every text run meets WCAG 2.2 AA on the rendered page, and nothing is under 13 px", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Measured in Chromium");
    await page.goto(fixture);
    const readings = await renderedContrast(page);
    expect(readings.length).toBeGreaterThanOrEqual(40);
    expect(readings.filter((reading) => reading.blended)).toEqual([]);
    expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    const smallest = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.querySelector("main")!, NodeFilter.SHOW_TEXT);
      let least = Infinity;
      for (let node = walker.nextNode(); node; node = walker.nextNode()) if (node.textContent?.trim()) least = Math.min(least, Number.parseFloat(getComputedStyle(node.parentElement!).fontSize));
      return least;
    });
    expect(smallest).toBeGreaterThanOrEqual(13);
  });

  test("the fixture does not scroll sideways", async ({ page }) => {
    await openWithFonts(page);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
});
