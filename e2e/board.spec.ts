import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { contrastOnPaper } from "./support/contrast";

const lightsOn = async (page: Page) => {
  if ((await page.evaluate(() => document.documentElement.dataset.lights)) !== "on") await page.locator("[data-light-switch]").click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.lights === "on" && !("themeChanging" in document.documentElement.dataset))).toBe(true);
};

test.describe("The Board", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#outside-work");
  });

  test("is a framed linen pinboard with its heading", async ({ page }) => {
    const section = page.locator("section#outside-work");
    await expect(section.locator("p").first()).toHaveText("02 / Library");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Some of what I’m into lately.");
    const board = section.locator("[data-pinboard]");
    await expect(board).toBeVisible();
    await expect(board.locator("[data-board-surface='linen']")).toBeVisible();
    for (const light of ["festoon", "fairy-lights"]) {
      await expect(board.locator(`[data-light-fixture='${light}']`)).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("London is a labelled photo with a clock", async ({ page }) => {
    const london = page.locator("[data-board-pin='london']");
    await expect(london.getByText("Home, London")).toBeVisible();
    await expect(london.getByRole("img", { name: /London skyline from the Thames/ })).toBeVisible();
    await expect(london.getByRole("img", { name: /^The time in London: \d{2}:\d{2}$/ })).toBeVisible();
  });

  test("at night the board dims and its lights come on", async ({ page }) => {
    await lightsOn(page);
    const board = page.locator("[data-pinboard]");
    await expect(board.locator(".board-night-dim")).toHaveCSS("opacity", "1");
    for (const light of ["festoon", "fairy-lights"]) {
      await expect(board.locator(`[data-light-fixture='${light}'] > div`).first()).toHaveCSS("opacity", "1");
    }
  });

  test("text on the night board keeps AA contrast, measured", async ({ page }) => {
    await lightsOn(page);
    for (const { text, ratio } of await contrastOnPaper(page, "[data-pinboard] [data-pin] p")) {
      expect(ratio, `contrast of "${text}"`).toBeGreaterThanOrEqual(4.5);
    }
    // The dimming sits under the pins, never over them.
    const layers = await page.locator("[data-pinboard]").evaluate((board) => {
      const dim = board.querySelector(".board-night-dim")!;
      const pins = board.querySelector("[data-board-pin]")!.parentElement!;
      return { dimBeforePins: Boolean(dim.compareDocumentPosition(pins) & Node.DOCUMENT_POSITION_FOLLOWING), pinsZ: getComputedStyle(pins).zIndex };
    });
    expect(layers).toEqual({ dimBeforePins: true, pinsZ: "10" });
  });

  for (const scheme of ["day", "night"] as const) {
    test(`passes axe, including contrast, by ${scheme}`, async ({ page }) => {
      if (scheme === "night") await lightsOn(page);
      const results = await new AxeBuilder({ page }).include("section#outside-work").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("nothing scrolls sideways", async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("The London clock", () => {
  // A visitor on the other side of the world still sees London's time.
  test.use({ timezoneId: "Pacific/Auckland" });

  test("shows London time, whatever the visitor's time zone, without a hydration mismatch", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrat|did not match/i.test(message.text())) problems.push(message.text());
    });
    await page.goto("/#outside-work");
    const clock = page.locator("[data-london-clock]");
    await expect(clock).not.toHaveAttribute("data-london-clock", "");
    const shown = (await clock.getAttribute("data-london-clock"))!;
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const london = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
    const browserLocal = await page.evaluate(() => new Date().toTimeString().slice(0, 5));
    expect(Math.abs(toMinutes(shown) - toMinutes(london)) % (24 * 60)).toBeLessThanOrEqual(1);
    expect(shown).not.toBe(browserLocal);
    await expect(clock.locator("[data-hand]")).toHaveCount(2);
    expect(problems).toEqual([]);
  });
});

test.describe("Pin states", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/board");
  });

  test("a pin with nothing current is removed, leaving no gap", async ({ page }) => {
    await expect(page.locator("[data-fixture-pin='playlist']")).toHaveCount(0);
    await expect(page.getByText("On repeat")).toHaveCount(0);
    const cells = await page.locator("[data-pinboard] .grid > *").count();
    expect(cells).toBe(4);
  });

  test("a current pin shows as it is", async ({ page }) => {
    const github = page.locator("[data-fixture-pin='github']");
    await expect(github).toHaveAttribute("data-pin-state", "current");
    await expect(github.getByText("GitHub · the past year")).toBeVisible();
    await expect(github.getByText(/as of/)).toHaveCount(0);
  });

  test("a stale pin is sun-faded with a pencilled date", async ({ page }) => {
    const reading = page.locator("[data-fixture-pin='reading']");
    await expect(reading).toHaveAttribute("data-pin-state", "stale");
    await expect(reading.getByText("as of 2 Aug", { exact: true })).toBeVisible();
    await expect(reading.locator("time")).toHaveAttribute("datetime", "2026-08-02T12:00:00.000Z");
    // Screen readers hear the date in full.
    await expect(reading.locator(".sr-only")).toHaveText("as of 2 August");
    await expect(reading.locator("[data-pin]")).toHaveCSS("filter", /sepia/);
    for (const { ratio } of await contrastOnPaper(page, "[data-fixture-pin='reading'] .board-as-of")) expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test("a missing photo shows a blank polaroid saying photo coming", async ({ page }) => {
    const film = page.locator("[data-fixture-pin='film']");
    await expect(film.locator("[data-photo='missing']")).toHaveText("photo coming");
    await expect(film.locator("img")).toHaveCount(0);
    const box = (await film.locator("[data-photo='missing']").boundingBox())!;
    expect(box.height).toBeGreaterThan(80);
  });

  test("the states pass axe", async ({ page }) => {
    const results = await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Scroll sway", () => {
  test("pins sway with scroll where supported, and never vanish on a fast scroll", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const pin = page.locator("[data-board-pin='london']");
    const supported = await page.evaluate(() => CSS.supports("animation-timeline: view()"));
    await expect(pin).toHaveCSS("animation-name", supported ? "board-sway" : "none");

    // Fling to the bottom and back, then the pin must be there and within the sway limits.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.evaluate(() => document.querySelector("[data-board-pin='london']")!.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect(pin).toBeInViewport();
    await expect(pin).toHaveCSS("opacity", "1");
    const sway = await pin.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return { y: Math.abs(matrix.m42), degrees: Math.abs((Math.atan2(matrix.m12, matrix.m11) * 180) / Math.PI) };
    });
    expect(sway.y).toBeLessThanOrEqual(14);
    expect(sway.degrees).toBeLessThanOrEqual(0.9);
  });

  test("is absent with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#outside-work");
    await expect(page.locator("[data-board-pin='london']")).toHaveCSS("animation-name", "none");
  });
});
