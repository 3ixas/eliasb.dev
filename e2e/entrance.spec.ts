import { expect, test, type Page } from "@playwright/test";
import { entranceTimings } from "../src/components/site/entrance";
import { hero } from "../src/content/stretch/site-copy";

const headline = `${hero.headline.lead} ${hero.headline.emphasis}`;
const isEntering = (page: Page) => page.evaluate(() => document.documentElement.hasAttribute("data-entering"));
const typedText = (page: Page) => page.evaluate(() => document.querySelector("[data-entrance-typed]")?.textContent ?? "");
const opacityOf = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((element) => Number(getComputedStyle(element).opacity));
const finished = (page: Page) => expect.poll(() => isEntering(page), { timeout: 8000 }).toBe(false);

// The entrance only plays with motion on; every other spec reads the finished page
// (playwright.config.ts turns reduced motion on for them).
test.use({ reducedMotion: "no-preference" });

test.describe("Signature entrance", () => {
  test("holds the page, types the headline, then shows the whole page", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForSelector("[data-entrance-layer]");

    // Held: every part but the typed layer is invisible, yet still in the accessibility tree.
    expect(await isEntering(page)).toBe(true);
    for (const part of ["header", "name", "role", "headline", "support", "portrait", "rest"]) {
      expect(await opacityOf(page, `[data-entrance="${part}"]`), `${part} is held`).toBe(0);
    }
    await expect(heading).toHaveAccessibleName(headline);
    await expect(page.locator("[data-entrance-layer]")).toHaveAttribute("aria-hidden", "true");

    // The headline is typed on the layer, and its accessible name is complete the whole time.
    await expect.poll(() => typedText(page)).toMatch(/^I build/);
    await expect(heading).toHaveAccessibleName(headline);
    await expect.poll(() => typedText(page), { timeout: 6000 }).toBe(`${hero.headline.lead} `);
    await expect(heading).toHaveAccessibleName(headline);

    await finished(page);
    // The hold clears as the last fade ends; a slow runner can read the tail of it (0.9999).
    for (const part of ["header", "name", "role", "headline", "support", "portrait", "rest"]) {
      await expect.poll(() => opacityOf(page, `[data-entrance="${part}"]`), { message: `${part} is released` }).toBe(1);
    }
    await expect(page.locator("[data-entrance-layer]")).toHaveCount(0);
    // Nothing is left running on the hero.
    expect(await page.locator(".stretch-portrait").evaluate((element) => element.getAnimations().length)).toBe(0);
  });

  test("shows the whole page within 6 s of holding it", async ({ page }) => {
    // Timed on the page's own clock, which stops once the entrance has begun, so only its schedule
    // counts. Wall-clock time cannot be held to it: a CI runner that freezes the browser for a second
    // (seen in WebKit) delays every timer, the safety release's too. A stalled page is covered by its
    // own spec below. The clock runs until the layer exists, so a slow font request still reaches
    // the page's font fallback instead of freezing it.
    await page.clock.install({ time: 0 });
    await page.addInitScript(() => {
      const marks = window as unknown as { heldFrom?: number; heldUntil?: number };
      const watch = new MutationObserver(() => {
        if (document.documentElement.hasAttribute("data-entering")) marks.heldFrom ??= performance.now();
        else if (marks.heldFrom !== undefined) {
          marks.heldUntil = performance.now();
          watch.disconnect();
        }
      });
      watch.observe(document, { subtree: true, attributes: true, attributeFilter: ["data-entering"] });
    });
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForSelector("[data-entrance-layer]");
    expect(await isEntering(page)).toBe(true);
    // The pause lands well ahead of the read (a round trip), then the run ends past the sequence's
    // 4.6 s and short of the safety release, so only the entrance itself can let go in time.
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 600);
    await page.clock.runFor(5400);
    expect(await isEntering(page), "the whole page is there within 6 s of being held").toBe(false);
    const { heldFrom, heldUntil } = await page.evaluate(() => {
      const marks = window as unknown as { heldFrom: number; heldUntil: number };
      return { heldFrom: marks.heldFrom, heldUntil: marks.heldUntil };
    });
    const held = heldUntil - heldFrom;
    // The safety release sits above the promise, so only the sequence can pass the bound below.
    expect(entranceTimings.safetyMs, "the safety release is later than 6 s").toBeGreaterThan(6000);
    // About 4.6 seconds: a give-up or a script error would have released the page at once.
    expect(held, "released as the sequence ends").toBeGreaterThan(4000);
    expect(held, "released within 6 s of being held").toBeLessThan(6000);
  });

  test("lands its beats at fixed times: BNP Paribas at 1 s, the First glance by 3.9 s, settled at 4.6 s", async ({ page }) => {
    // Sampled on the page's own clock, which a busy runner cannot stretch. Timers set the typed text and
    // the released parts, so those are read: CSS transitions run on real time and would not be steady.
    await page.clock.install({ time: 0 });
    await page.addInitScript(() => {
      const marks = window as unknown as { began?: number };
      new MutationObserver((_, watch) => {
        if (!document.querySelector("[data-entrance-layer]")) return;
        marks.began = performance.now();
        watch.disconnect();
      }).observe(document, { subtree: true, childList: true });
    });
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForSelector("[data-entrance-layer]");
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 300);
    const sample = async (atMs: number) => {
      const sinceBegin = await page.evaluate(() => performance.now() - (window as unknown as { began: number }).began);
      await page.clock.runFor(Math.max(0, Math.round(atMs - sinceBegin)));
      return page.evaluate(() => ({
        typed: document.querySelector("[data-entrance-typed]")?.textContent ?? "",
        released: (document.documentElement.getAttribute("data-released") ?? "").split(/\s+/).filter(Boolean),
        entering: document.documentElement.hasAttribute("data-entering"),
        nameLayerHidden: getComputedStyle(document.querySelector(".stretch-entrance__name") ?? document.body).visibility === "hidden",
      }));
    };

    // Act 1: the full phrase "BNP Paribas" is typed by about a second.
    let beat = await sample(1100);
    expect(beat.typed, "BNP Paribas is readable at about 1 s").toContain("I build pricing and risk engines at BNP Paribas");
    expect(beat.released, "nothing else has arrived").toEqual([]);

    // The comma is a beat, then the sentence finishes and holds alone.
    beat = await sample(1300);
    expect(beat.typed, "the comma holds the caret").toBe(`${hero.headline.lead.slice(0, hero.headline.lead.indexOf(",") + 1)}`);
    beat = await sample(2400);
    expect(beat.typed, "the sentence is typed").toBe(`${hero.headline.lead} `);
    expect(beat.released, "the finished sentence holds alone for a beat").toEqual([]);
    expect(beat.nameLayerHidden, "the name has not started").toBe(true);

    // Act 2: the name settles, the role line follows it, and the hero arrives around the line.
    beat = await sample(2700);
    expect(beat.nameLayerHidden, "the name is settling").toBe(false);
    expect(beat.released, "the role line is not out yet").not.toContain("role");
    beat = await sample(3000);
    expect(beat.released, "the role line comes out with the name").toContain("role");
    expect(beat.released, "the headline has not been handed over").not.toContain("headline");
    beat = await sample(3900);
    for (const part of ["name", "role", "headline", "support", "header"]) {
      expect(beat.released, `${part} is out by 3.9 s: the whole First glance`).toContain(part);
    }
    expect(beat.entering, "the rest of the page is still arriving").toBe(true);

    // Settled.
    beat = await sample(4300);
    expect(beat.entering, "still settling at 4.3 s").toBe(true);
    beat = await sample(4800);
    expect(beat.entering, "settled by 4.8 s").toBe(false);
  });

  test("the first Tab shows the page, so focus never lands on a held control", async ({ page, browserName }) => {
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForSelector("[data-entrance-layer]");
    expect(await isEntering(page)).toBe(true);
    await page.keyboard.press("Tab");
    await expect.poll(() => isEntering(page)).toBe(false);
    await expect(page.locator("[data-entrance-layer]")).toHaveCount(0);
    expect(await opacityOf(page, '[data-entrance="header"]')).toBe(1);
    // Safari does not tab to links by default, so there it is enough that the page was released.
    if (browserName === "chromium") {
      const focused = await page.evaluate(() => {
        let opacity = 1;
        for (let node: Element | null = document.activeElement; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
        return { tag: document.activeElement?.tagName, opacity };
      });
      expect(focused.tag).not.toBe("BODY");
      expect(focused.opacity, "the focused control is visible").toBe(1);
    }
  });

  test("ends on exactly the finished hero", async ({ page }) => {
    const rest = async () =>
      page.evaluate(() =>
        [".stretch-name", ".stretch-hero h1", ".stretch-portrait", ".stretch-portrait__label"].map((selector) => {
          const element = document.querySelector(selector)!;
          const box = element.getBoundingClientRect();
          return [getComputedStyle(element).transform, Math.round(box.left), Math.round(box.top + scrollY), Math.round(box.width)];
        }),
      );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const expected = await rest();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.reload();
    await finished(page);
    expect(await rest()).toEqual(expected);
  });

  test("the content is in the server HTML, and the document starts unheld", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain(hero.headline.lead);
    expect(html).toContain(hero.headline.emphasis);
    expect(html).toContain(hero.support);
    expect(html).toContain(">Say hello</a>");
    expect(html.match(/<html[^>]*>/)![0]).not.toContain("data-entering");
  });

  test("plays again on reload", async ({ page }) => {
    await page.goto("/");
    await finished(page);
    await page.reload();
    expect(await isEntering(page)).toBe(true);
  });

  test("does not play when coming back with the browser's Back button", async ({ page }) => {
    await page.goto("/");
    await finished(page);
    await page.goto("/things-i-make");
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(headline);
    expect(await isEntering(page)).toBe(false);
    await expect(page.locator("[data-entrance-layer]")).toHaveCount(0);
  });

  test("does not play when arriving at a section", async ({ page }) => {
    await page.goto("/#things-i-make");
    expect(await isEntering(page)).toBe(false);
    expect(await opacityOf(page, "#things-i-make")).toBe(1);
  });

  test("does not play on a client-side return to the homepage", async ({ page }) => {
    await page.goto("/no-such-page");
    await page.getByRole("link", { name: /^Back to the homepage/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(headline);
    expect(await isEntering(page)).toBe(false);
    await expect(page.locator("[data-entrance-layer]")).toHaveCount(0);
    expect(await opacityOf(page, "#things-i-make")).toBe(1);
  });

  test("a quick round trip mid-entrance never leaves the page held", async ({ page }) => {
    await page.goto("/");
    expect(await isEntering(page)).toBe(true);
    await page.goto("/things-i-make", { waitUntil: "commit" });
    await page.getByRole("link", { name: /Elias Bennett, home/ }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await finished(page);
    await expect(page.locator("[data-entrance-layer]")).toHaveCount(0);
    expect(await opacityOf(page, "#things-i-make")).toBe(1);
  });

  test("shows the finished page at once with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    expect(await isEntering(page)).toBe(false);
    for (const part of ["header", "name", "role", "headline", "support", "portrait", "rest"]) {
      expect(await opacityOf(page, `[data-entrance="${part}"]`), `${part} is shown`).toBe(1);
    }
    await expect(page.locator("[data-entrance-layer]")).toHaveCount(0);
  });

  test("finishes at once if reduced motion is switched on midway", async ({ page }) => {
    await page.goto("/");
    expect(await isEntering(page)).toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => isEntering(page)).toBe(false);
    await expect(page.locator("[data-entrance-layer]")).toHaveCount(0);
    // Reduced motion shortens transitions to a frame, so opacity lands on 1 a frame after the hold lifts.
    await expect.poll(() => opacityOf(page, "#things-i-make")).toBe(1);
  });

  test("gives up and shows the finished page if the page stalls", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => typedText(page)).toMatch(/^I build/);
    // Hold the main thread, as a long task during loading would.
    await page.evaluate(() => {
      const until = performance.now() + 2500;
      while (performance.now() < until) {
        // busy
      }
    });
    await expect.poll(() => isEntering(page), { timeout: 1500 }).toBe(false);
    expect(await opacityOf(page, "#things-i-make")).toBe(1);
  });

  test("a script error releases the hold at once", async ({ page }) => {
    await page.addInitScript(() => {
      Element.prototype.animate = () => {
        throw new Error("animate is broken");
      };
    });
    await page.goto("/");
    await expect.poll(() => isEntering(page), { timeout: 4000 }).toBe(false);
    expect(await opacityOf(page, "#things-i-make")).toBe(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("the safety timeout releases the hold if the entrance never plays", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-1440-light", "A seven second wait: once is enough");
    // The page is held, but the script that would play (and release) it never runs.
    await page.route("**/", async (route) => {
      const response = await route.fetch();
      const html = (await response.text()).replace('<script id="entrance-player"', '<script type="text/plain" id="entrance-player"');
      await route.fulfill({ response, body: html });
    });
    await page.goto("/");
    expect(await isEntering(page)).toBe(true);
    await page.waitForTimeout(3000);
    expect(await isEntering(page), "still held before the limit").toBe(true);
    await expect.poll(() => isEntering(page), { timeout: 6000 }).toBe(false);
    expect(await opacityOf(page, "#things-i-make")).toBe(1);
  });

  test("a late-arriving bundle does not disturb the entrance", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/_next/static/**/*.js", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });
    await page.goto("/");
    await expect.poll(() => typedText(page)).toMatch(/^I build/);
    await finished(page);
    expect(errors, "no hydration or script errors").toEqual([]);
    expect(await opacityOf(page, "#things-i-make")).toBe(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(headline);
  });
});

test.describe("Signature entrance with JavaScript blocked", () => {
  test.use({ javaScriptEnabled: false });

  test("shows the complete page", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(headline);
    for (const part of ["header", "name", "role", "headline", "support", "portrait", "rest"]) {
      expect(await opacityOf(page, `[data-entrance="${part}"]`), `${part} is shown`).toBe(1);
    }
    await expect(page.locator("[data-entrance-layer]")).toHaveCount(0);
  });
});
