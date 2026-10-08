import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";

// The fixtures page has no header or light switch, so night is set as the switch would set it.
const lightsOn = (page: Page) => page.evaluate(() => (document.documentElement.dataset.lights = "on"));

test.describe("The culture corner", () => {
  test("hangs the book and the film under its heading", async ({ page }) => {
    await page.goto("/#outside-work");
    const board = page.locator("[data-pinboard]");
    await expect(board.getByRole("heading", { level: 3, name: "The culture corner" })).toBeVisible();
    await expect(board.locator("[data-board-pin='reading']").getByText("Now reading")).toBeVisible();
    await expect(board.locator("[data-board-pin='film']").getByText("Admit one · Last watched")).toBeVisible();
    // The legacy book and film are gone from below the Board.
    await expect(page.locator(".library-objects")).toHaveCount(0);
  });

  test("every cover and poster says what it shows", async ({ page }) => {
    await page.goto("/#outside-work");
    for (const img of await page.locator("[data-board-pin='reading'] img, [data-board-pin='film'] img").all()) {
      await expect(img).toHaveAttribute("alt", /^(Cover of .+ by .+|Poster for .+)$/);
    }
  });

  test("stacks without overlap or sideways scroll on narrow screens", async ({ page }) => {
    const width = page.viewportSize()!.width;
    test.skip(width >= 900, "The corner sits in a row on wide screens");
    await page.goto("/#outside-work");
    // Measured together in page coordinates, so the smooth scroll to the Board can't skew them.
    const boxes = await page.evaluate(() =>
      ["reading", "film"].map((pin) => {
        const box = document.querySelector(`[data-board-pin='${pin}']`)!.getBoundingClientRect();
        return { x: box.x, y: box.y + window.scrollY, width: box.width, height: box.height };
      }),
    );
    for (let i = 1; i < boxes.length; i += 1) expect(boxes[i].y).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height);
    for (const box of boxes) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });

  test("text keeps AA contrast by day and at night, measured", async ({ page }) => {
    await page.goto("/fixtures/culture");
    const selector = "[data-pinboard] :is(p, time, a, h3)";
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    await lightsOn(page);
    for (const { text, ratio } of await contrastOnPaper(page, selector)) expect(ratio, `contrast of "${text}" at night`).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe("Culture corner states", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/culture");
  });

  test("the library card is stamped with the day the book went on the shelf", async ({ page }) => {
    const pin = page.locator("[data-fixture='book']");
    await expect(pin.getByText("Dark Age", { exact: true })).toBeVisible();
    await expect(pin.getByText("Pierce Brown · Goodreads")).toBeVisible();
    await expect(pin.getByRole("img", { name: "Cover of Dark Age by Pierce Brown" })).toBeVisible();
    const stamp = pin.locator("time");
    await expect(stamp).toHaveAttribute("datetime", "2026-09-14T10:52:45.000Z");
    await expect(stamp.locator("[aria-hidden='true']")).toHaveText("14 Sept");
    await expect(stamp.locator(".sr-only")).toHaveText("Started 14 September");
    await expect(pin.getByRole("link", { name: "View on Goodreads" })).toHaveAttribute("target", "_blank");
  });

  test("the ticket shows the day watched and the rating, and says them in full", async ({ page }) => {
    const pin = page.locator("[data-fixture='film']");
    await expect(pin.getByRole("img", { name: "Poster for The Invite (2026)" })).toBeVisible();
    await expect(pin.getByText("Watched 14 Sept · ★★★★½")).toBeVisible();
    await expect(pin.getByText("Watched 14 September, rated 4.5 out of 5")).toBeAttached();
    await expect(pin.getByRole("link", { name: "Logged on Letterboxd" })).toHaveAttribute("href", "https://letterboxd.com/3lxas/film/the-invite/");
  });

  test("an empty shelf and an empty diary stay up, saying so", async ({ page }) => {
    for (const name of ["book-empty", "book-unfetched"]) {
      const pin = page.locator(`[data-fixture='${name}']`);
      await expect(pin.getByText("Between books")).toBeVisible();
      await expect(pin.locator("[data-print='blank']")).toBeVisible();
      await expect(pin.locator("time, img, a")).toHaveCount(0);
    }
    const film = page.locator("[data-fixture='film-empty']");
    await expect(film.getByText("Nothing logged yet")).toBeVisible();
    await expect(film.locator("[data-print='blank']")).toBeVisible();
    await expect(film.locator("img, a")).toHaveCount(0);
  });

  test("a stale film is sun-faded with its date", async ({ page }) => {
    const pin = page.locator("[data-fixture='film-stale'] [data-board-pin='film']");
    await expect(pin).toHaveAttribute("data-pin-state", "stale");
    await expect(pin.getByText("as of 2 Aug", { exact: true })).toBeVisible();
  });

  test("a film with no rating or poster drops them without leaving gaps", async ({ page }) => {
    const pin = page.locator("[data-fixture='film-unrated']");
    await expect(pin.getByText("Watched 14 Sept", { exact: true })).toBeVisible();
    await expect(pin.getByText(/★/)).toHaveCount(0);
    await expect(pin.locator("[data-photo='missing']")).toHaveText("photo coming");
  });

  test("the states pass axe", async ({ page }) => {
    const results = await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
