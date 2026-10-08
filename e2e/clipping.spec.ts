import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";
import { scrollSettled } from "./support/scroll";

const week = (page: Page) => page.locator("[data-fixture='week']");
const toggleIn = (clipping: Locator) => clipping.getByRole("button", { name: /more oddities this week|Fold them away/ });

/** Where each extra clipping is, in page coordinates, measured together. */
const extraBoxes = (clipping: Locator) =>
  clipping.locator("[data-clipping-extra]").evaluateAll((extras) =>
    extras.map((extra) => {
      const box = extra.getBoundingClientRect();
      return { x: Math.round(box.x), y: Math.round(box.y + window.scrollY), width: Math.round(box.width), height: Math.round(box.height) };
    }),
  );

/**
 * Waits until the fan-out has finished: every oddity in place and opaque, and
 * their space sprung open to "auto". Motion advances a spring by at most 40 ms
 * a frame, so its length is counted in frames (about 60 at 60 fps, never fewer
 * than 25), and a slow, software-rendered frame stretches it in real time.
 */
const fannedOut = (clipping: Locator) =>
  expect
    .poll(
      () =>
        clipping.locator("[data-clipping-extra]").first().evaluate((first) => {
          const space = first.closest("[id]") as HTMLElement;
          const extras = [...space.querySelectorAll<HTMLElement>("[data-clipping-extra]")];
          return space.style.height === "auto" && extras.every((extra) => getComputedStyle(extra).transform === "none" && getComputedStyle(extra).opacity === "1");
        }),
      { message: "the oddities finish fanning out", timeout: 20_000 },
    )
    .toBe(true);

test.describe("The Weekly Curiosity on the Board", () => {
  test("is a clipping with its masthead, and its source is the readable page for the day", async ({ page }) => {
    await page.goto("/#outside-work");
    const clipping = page.locator("[data-board-pin='clipping']");
    await expect(clipping.getByRole("heading", { level: 3, name: "The Weekly Curiosity" })).toBeVisible();
    await expect(clipping.getByText("Strange but true")).toBeVisible();
    const source = clipping.getByRole("link", { name: /^(More from \d{1,2} [A-Z][a-z]+ on Wikipedia|Browse history on Wikipedia)$/ });
    await expect(source).toHaveAttribute("href", /^https:\/\/en\.wikipedia\.org\/wiki\/([A-Z][a-z]+_\d{1,2}|Portal:History)$/);
    // The legacy history section is gone from below the Board.
    await expect(page.locator(".outside-work-history")).toHaveCount(0);
  });
});

test.describe("Weekly Curiosity states", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/clipping");
  });

  test("prints the week's dateline, the lead oddity, and its credit", async ({ page }) => {
    const clipping = week(page);
    await expect(clipping.getByText("Vol. 2026 · No. 40")).toBeVisible();
    await expect(clipping.getByText("Week of 28 Sept")).toBeVisible();
    await expect(clipping.getByText("Price: one click")).toBeVisible();
    await expect(clipping.getByText("Odd but true, from this week in history")).toBeVisible();
    await expect(clipping.getByText("28 September 1924", { exact: true })).toBeVisible();
    await expect(clipping.getByRole("img", { name: "Douglas World Cruisers on a beach" })).toBeVisible();
    const credit = clipping.locator("figcaption").first();
    await expect(credit).toHaveText("Image: The Museum of Flight · Public domain");
    await expect(credit.getByRole("link", { name: "The Museum of Flight" })).toHaveAttribute("href", "https://commons.wikimedia.org/wiki/File:Douglas_World_Cruisers.jpg");
    // With no licence page, the licence links to the image's Commons record.
    await expect(credit.getByRole("link", { name: "Public domain" })).toHaveAttribute("href", "https://commons.wikimedia.org/wiki/File:Douglas_World_Cruisers.jpg");
    await expect(clipping.getByRole("link", { name: "More from 28 September on Wikipedia" })).toHaveAttribute("href", "https://en.wikipedia.org/wiki/September_28");
  });

  test("fans out by pointer and folds away again", async ({ page }) => {
    const clipping = week(page);
    const toggle = toggleIn(clipping);
    await expect(toggle).toHaveText("2 more oddities this week ↓");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(`[id="${await toggle.getAttribute("aria-controls")}"]`)).toHaveAttribute("inert", "");
    await expect(clipping.getByRole("link", { name: "Read on Wikipedia" })).toHaveCount(1);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toHaveText("Fold them away ↑");
    await expect(clipping.getByRole("link", { name: "Read on Wikipedia" })).toHaveCount(3);
    await expect(clipping.getByText("Born 28 September 1852")).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    // Folded clippings are inert: out of the tab order and the accessibility tree.
    await expect(clipping.getByRole("link", { name: "Read on Wikipedia" })).toHaveCount(1);
  });

  test("opens with the keyboard, and Escape folds it back to the button", async ({ page }) => {
    const toggle = toggleIn(week(page));
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  test("a fact without a suitable picture is printed text-only", async ({ page }) => {
    const clipping = week(page);
    await toggleIn(clipping).click();
    const story = clipping.locator("article").filter({ hasText: "A cow wanders into a cathedral" });
    await expect(story).toBeVisible();
    await expect(story.locator("img, figure, figcaption")).toHaveCount(0);
  });

  test("on every screen the oddities open below the clipping, in their measured space", async ({ page }) => {
    const clipping = week(page);
    const main = clipping.locator("[data-pin='clipping']").first();
    await toggleIn(clipping).click();
    await fannedOut(clipping);
    // The space has grown to fit them, so the next pin moves down rather than being covered.
    const boxes = await extraBoxes(clipping);
    const mainBottom = await main.evaluate((element) => element.getBoundingClientRect().bottom + window.scrollY);
    const saved = await page.locator("[data-fixture='saved']").evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
    expect(boxes.every(({ height }) => height > 0)).toBe(true);
    expect(boxes[0].y).toBeGreaterThanOrEqual(mainBottom);
    expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height);
    expect(saved).toBeGreaterThanOrEqual(boxes.at(-1)!.y + boxes.at(-1)!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test("on the Board, the open oddities cover none of the pins beside the clipping", async ({ page }) => {
    await page.goto("/#outside-work");
    // Hydrated, so the click reaches React, and done scrolling to the section, so it lands on the button.
    await page.waitForLoadState("networkidle");
    await scrollSettled(page);
    const clipping = page.locator("[data-board-pin='clipping']");
    await toggleIn(clipping).click();
    await fannedOut(clipping);
    const extras = await extraBoxes(clipping);
    const others = await page.locator("[data-board-pin]:not([data-board-pin='clipping'])").evaluateAll((pins) =>
      pins.map((pin) => {
        const box = pin.getBoundingClientRect();
        return { name: pin.getAttribute("data-board-pin"), x: box.x, y: box.y + window.scrollY, width: box.width, height: box.height };
      }),
    );
    for (const extra of extras) {
      for (const pin of others) {
        const overlaps = extra.x < pin.x + pin.width && pin.x < extra.x + extra.width && extra.y < pin.y + pin.height && pin.y < extra.y + extra.height;
        expect(overlaps, `an open oddity covers the ${pin.name} pin`).toBe(false);
      }
    }
  });

  test("with reduced motion the fan-out is instant", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    // Hydrated first, so the click reaches React rather than landing on the server's HTML.
    await page.waitForLoadState("networkidle");
    const clipping = week(page);
    // Every frame from the click until the oddities are open shows each one, and
    // their space, either as it started or as it ends: nothing in between. A
    // spring passes through dozens of in-between frames (about 25 at the least),
    // however slow the machine; how many frames the jump takes depends only on
    // when the browser schedules React and Motion, so it isn't counted.
    const seen = await clipping.locator("[data-clipping-extra]").first().evaluate(
      (first) =>
        new Promise<{ opened: boolean; heights: string[]; between: string[] }>((resolve) => {
          const space = first.closest("[id]") as HTMLElement;
          const extras = [...space.querySelectorAll<HTMLElement>("[data-clipping-extra]")];
          const look = (extra: HTMLElement) => `${getComputedStyle(extra).opacity} ${getComputedStyle(extra).transform}`;
          // Each oddity's look before the click, and the look of one fully open.
          const closed = extras.map(look);
          const open = "1 none";
          const heights = new Set<string>();
          const between = new Set<string>();
          let frames = 0;
          const check = () => {
            frames += 1;
            heights.add(space.style.height);
            extras.forEach((extra, index) => {
              const now = look(extra);
              if (now !== closed[index] && now !== open) between.add(now);
            });
            const opened = space.style.height === "auto" && extras.every((extra) => getComputedStyle(extra).transform === "none" && getComputedStyle(extra).opacity === "1");
            if (opened || frames === 120) resolve({ opened, heights: [...heights], between: [...between] });
            else requestAnimationFrame(check);
          };
          first.closest("[data-fixture]")!.querySelector<HTMLButtonElement>("button[aria-controls]")!.click();
          requestAnimationFrame(check);
        }),
    );
    expect(seen.opened, "the oddities open").toBe(true);
    expect(seen.heights.filter((height) => height !== "0px" && height !== "auto"), "in-between heights of their space").toEqual([]);
    expect(seen.between, "in-between looks of the oddities").toEqual([]);
  });

  test("the saved examples print from the archive, by year, with their own sources", async ({ page }) => {
    const saved = page.locator("[data-fixture='saved']");
    await expect(saved.getByText("From the archive")).toBeVisible();
    await expect(saved.getByText(/Vol\./)).toHaveCount(0);
    await expect(saved.getByText("1783", { exact: true })).toBeVisible();
    await expect(saved.getByRole("link", { name: "Read more" }).first()).toHaveAttribute("href", /airandspace\.si\.edu/);
    await expect(saved.getByRole("link", { name: "Browse history on Wikipedia" })).toHaveAttribute("href", "https://en.wikipedia.org/wiki/Portal:History");
  });

  test("text keeps AA contrast by day and at night, and passes axe open and closed", async ({ page }) => {
    const selector = "[data-fixture] :is(p, a, h3, figcaption, button)";
    const axe = () => new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    expect((await axe()).violations).toEqual([]);
    await toggleIn(week(page)).click();
    await page.waitForTimeout(800);
    expect((await axe()).violations).toEqual([]);
    await page.evaluate(() => (document.documentElement.dataset.lights = "on"));
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}" at night`).toBeGreaterThanOrEqual(4.5);
  });
});
