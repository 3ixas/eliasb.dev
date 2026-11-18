import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { offTheClock } from "../src/content/stretch/off-the-clock";
import { renderedContrast } from "./support/rendered-contrast";
import { spoken } from "./support/roll";

/*
 * Off the clock (docs/design/DESIGN.md "The homepage, in order" 7, R-19, R-30, R-34; #465): one paper panel composed as
 * one spread. Today's workout as one strong line over the week; the book and the film as objects on one shelf line;
 * this week's oddity picture first; the GitHub year, with what I'm building now, as the base. On a phone the sections
 * stack under rules; from 960 px they are three tiers. Each state is a whole panel on /fixtures/off-the-clock, with one
 * cell swapped, so every test also shows the panel keeping its shape.
 */

const { days } = offTheClock.training;
const fixture = (page: Page, name: string) => page.locator(`[data-fixture='${name}']`);
const cell = (panel: Locator, item: string) => panel.locator(`[data-otc='${item}']`);
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const phone = (page: Page) => width(page) < 720;
/** From 960 px the panel is three tiers: the workout beside the shelf, the oddity across, the year as the base. */
const tiers = (page: Page) => width(page) >= 960;
const boxOf = async (locator: Locator) => (await locator.boundingBox())!;

/** The colour the page paints for a token, read the way the browser resolves it. */
const token = (page: Page, name: string) =>
  page.evaluate((variable) => {
    const probe = document.createElement("span");
    probe.style.backgroundColor = `var(${variable})`;
    document.body.append(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return colour;
  }, name);

const hydrated = (page: Page) => page.waitForFunction(() => Object.keys(document.querySelector(".otc__week")!).some((key) => key.startsWith("__reactProps$")));

/** The panel's sections in order. */
const bands = (panel: Locator) =>
  panel.evaluate((element) => [...element.children].map((child) => (child as HTMLElement).dataset.otc ?? child.className));
const sections = ["training", "shelf", "history", "github"];

test.describe("Off the clock: on the homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("its title, then one paper panel: the workout, the shelf and screen, this week in history, the GitHub year with what I'm building", async ({ page }) => {
    const section = page.locator("section#off-the-clock");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(offTheClock.heading);
    const panel = section.locator(".otc");
    await expect(panel).toHaveClass(/surface--paper/);
    expect(await bands(panel)).toEqual(sections);
    await expect(cell(panel, "training").getByRole("heading", { level: 3 })).toHaveText(offTheClock.training.title);
    await expect(cell(panel, "shelf").getByRole("heading", { level: 3 })).toHaveText(offTheClock.shelf.title);
    await expect(cell(panel, "history").getByRole("heading", { level: 3 })).toHaveText(offTheClock.curiosity.label);
  });

  test("a rule separates each section: above it when they stack, and between the workout and the shelf when they sit side by side", async ({ page }) => {
    const panel = page.locator("section#off-the-clock .otc");
    const rules = await panel.evaluate((element) => [...element.children].map((child) => [getComputedStyle(child).borderTopWidth, getComputedStyle(child).borderLeftWidth]));
    expect(rules[0][0]).toBe("0px");
    expect(rules[1]).toEqual(tiers(page) ? ["0px", "1px"] : ["1px", "0px"]);
    for (const [top] of rules.slice(2)) expect(top).toBe("1px");
  });

  test("the panel is paper in light and the dark surface in dark", async ({ page }) => {
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.reload();
      await expect(page.locator("#off-the-clock .otc")).toHaveCSS("background-color", await token(page, "--paper"));
    }
  });

  test("without script the panel is whole: the week, the cells, the first oddity and the year", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    const panel = page.locator("#off-the-clock .otc");
    await expect(cell(panel, "training").getByRole("list", { name: offTheClock.training.week })).toBeVisible();
    await expect(cell(panel, "history").locator("p[aria-live]")).not.toBeEmpty();
    expect(await bands(panel)).toEqual(sections);
  });
});

test.describe("Off the clock: training", () => {
  for (const [name, index] of [["monday", 0], ["saturday", 5], ["sunday", 6]] as const) {
    test(`${name}: the week marks today once and its session is shown large`, async ({ page }) => {
      await page.goto("/fixtures/off-the-clock");
      const training = cell(fixture(page, `training-${name}`), "training");
      await expect(training.getByRole("heading", { level: 3 })).toHaveText(offTheClock.training.title);
      await expect(training.locator(".otc__today > span:last-child")).toHaveText(days[index].session);
      const marked = training.locator(".otc__week li[data-today]");
      await expect(marked).toHaveCount(1);
      await expect(marked).toHaveAttribute("aria-current", "date");
      await expect(training.locator(".otc__week li").nth(index)).toHaveAttribute("data-today", "");
      await expect(training.getByRole("list", { name: offTheClock.training.week })).toBeVisible();
      for (const day of days) await expect(training).toContainText(`${day.long}: ${day.session}`);
    });
  }
});

test.describe("Off the clock: the book and the film", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  test("the book links out to Goodreads, marked ↗: its cover, title, Now reading and author", async ({ page }) => {
    const book = cell(fixture(page, "book"), "reading");
    const link = book.getByRole("link");
    await expect(link).toHaveAttribute("href", /goodreads\.com/);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAccessibleName(/^Cover of Dark Age by Pierce Brown Dark Age Now reading · Pierce Brown opens .+ in a new tab$/);
    await expect(book.locator(".arrow--out")).toHaveText("\u2197\uFE0E");
    await expect(book.getByRole("heading", { level: 4 })).toHaveText("Dark Age");
  });

  test("the film links out to Letterboxd, marked ↗: its poster, title, Last watched with its date and stars", async ({ page }) => {
    const film = cell(fixture(page, "film"), "film");
    await expect(film.getByRole("link")).toHaveAttribute("href", /letterboxd\.com/);
    await expect(film.getByRole("link")).toHaveAttribute("target", "_blank");
    await expect(film.getByRole("heading", { level: 4 })).toHaveText("The Invite");
    await expect(film.locator("p").first()).toContainText("Last watched 14 Sept");
    await expect(film.locator("p").first()).toContainText("★★★★½");
    await expect(film).toContainText("rated 4.5 out of 5");
  });

  for (const [name, item, fallback, label] of [
    ["book-empty", "reading", offTheClock.reading.fallback, offTheClock.reading.label],
    ["book-unfetched", "reading", offTheClock.reading.fallback, offTheClock.reading.label],
    ["film-empty", "film", offTheClock.watched.fallback, offTheClock.watched.label],
  ] as const) {
    test(`${name}: the written fallback, with no cover, no placeholder and nothing to open`, async ({ page }) => {
      const target = cell(fixture(page, name), item);
      await expect(target.getByRole("heading", { level: 4 })).toHaveText(fallback);
      await expect(target.locator("p").first()).toHaveText(label);
      await expect(target.getByRole("link")).toHaveCount(0);
      await expect(target.locator("img, .otc__object")).toHaveCount(0);
    });
  }

  test("a cell with no cover has none, and no placeholder box", async ({ page }) => {
    for (const [name, item] of [["book-uncovered", "reading"], ["film-unrated", "film"]] as const) {
      const target = cell(fixture(page, name), item);
      await expect(target.locator("img")).toHaveCount(0);
      const [media, text] = await Promise.all([boxOf(target.locator(".otc__media")), boxOf(target.locator(".otc__media-text"))]);
      expect(Math.abs(media.x - text.x)).toBeLessThan(1);
    }
  });

  test("stale saved data says when it is from; current data says nothing of its source", async ({ page }) => {
    await expect(cell(fixture(page, "book-stale"), "reading").locator(".otc__source")).toContainText(offTheClock.fromAsOf("Goodreads", "2 Aug"));
    await expect(cell(fixture(page, "film-stale"), "film").locator(".otc__source")).toContainText("From Letterboxd, as of");
    for (const name of ["book", "film"]) await expect(fixture(page, name).locator(".otc__media .otc__source")).toHaveCount(0);
    await expect(page.locator(".otc__media").getByText(/^Live from/)).toHaveCount(0);
  });

  test("the book is an object: its cover straight on, its page edges stepping out behind it", async ({ page }) => {
    const book = cell(fixture(page, "book"), "reading");
    await expect(book.locator(".otc__book img")).toHaveAttribute("alt", "Cover of Dark Age by Pierce Brown");
    // The page edges are the cover's stepped shadows, standing out past its right and bottom edges.
    await expect(book.locator(".otc__book img")).toHaveCSS("box-shadow", / 2px 2px 0px 0px/);
  });

  test("the film is on a screen in its poster's format, its colours glowing round the frame; the glow is not read", async ({ page }) => {
    const film = cell(fixture(page, "film"), "film");
    await expect(film.locator(".otc__screen-poster")).toHaveAttribute("alt", "Poster for The Invite (2026)");
    await expect(film.locator(".otc__screen-glow")).toHaveAttribute("aria-hidden", "true");
    await expect(film.locator(".otc__screen-glow")).toHaveAttribute("alt", "");
    await expect(film.locator(".otc__screen-glow")).toHaveCSS("filter", /blur/);
    const [screen, poster] = await Promise.all([boxOf(film.locator(".otc__screen")), boxOf(film.locator(".otc__screen-poster"))]);
    expect(poster.height / poster.width).toBeCloseTo(1.5, 1);
    expect(screen.width).toBeGreaterThan(poster.width);
  });

  test("the book and the film stand on one line, and their words start on one line beneath", async ({ page }) => {
    const panel = fixture(page, "github");
    const [book, film] = await Promise.all(["reading", "film"].map((item) => boxOf(cell(panel, item).locator(".otc__object"))));
    expect(Math.abs(book.y + book.height - (film.y + film.height))).toBeLessThan(2);
    const [bookWords, filmWords] = await Promise.all(["reading", "film"].map((item) => boxOf(cell(panel, item).locator(".otc__media-text"))));
    expect(Math.abs(bookWords.y - filmWords.y)).toBeLessThan(1);
    expect(film.x).toBeGreaterThan(book.x + book.width);
  });

  test("a long title wraps inside its column, and the link carries it whole", async ({ page }) => {
    const panel = fixture(page, "long");
    for (const item of ["reading", "film"]) {
      const target = cell(panel, item);
      const [box, heading] = await Promise.all([boxOf(target), boxOf(target.getByRole("heading", { level: 4 }))]);
      expect(heading.x + heading.width).toBeLessThanOrEqual(box.x + box.width + 1);
    }
    await expect(cell(panel, "film").getByRole("link")).toHaveAccessibleName(/The Assassination of Jesse James by the Coward Robert Ford/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

test.describe("Off the clock: this week in history", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  test("picture first, across the panel: the picture, the title, the date and fact as its caption, its credit, and an outline pill that counts", async ({ page }) => {
    const history = cell(fixture(page, "history-live"), "history");
    await expect(history.getByRole("heading", { level: 3 })).toHaveText(offTheClock.curiosity.label);
    await expect(history.locator("p[aria-live='polite']")).toHaveText("28 September 1924 The first aerial circumnavigation is completed by a team from the US Army.");
    await expect(history.locator(".otc__history-now .otc__credit")).toHaveText("Image: The Museum of Flight · Public domain");
    await expect(history.locator("img")).toHaveAttribute("alt", "Douglas World Cruisers on a beach");
    const step = history.getByRole("button");
    await expect(step).toHaveClass(/pill--outline/);
    await expect(step).toHaveAccessibleName(offTheClock.curiosity.count(1, 3));
    const [band, panel] = await Promise.all([boxOf(history), boxOf(fixture(page, "history-live").locator(".otc"))]);
    expect(band.width).toBeGreaterThan(panel.width - 100);
  });

  test("the pill steps to the next oddity in place, politely announced, and wraps after the last; nothing else moves", async ({ page }) => {
    const panel = fixture(page, "history-live");
    const history = cell(panel, "history");
    await hydrated(page);
    const step = history.getByRole("button");
    // Where the pill and the band below sit: stepping through oddities of every length, with and without a picture, moves neither.
    // Measured against the document, not the window: a click scrolls its target into view.
    const place = (locator: Locator) => locator.evaluate((element) => {
      const { left, top, width } = element.getBoundingClientRect();
      return [Math.round(left + scrollX), Math.round(top + scrollY), Math.round(width)];
    });
    const places = () => Promise.all([place(step), place(cell(panel, "github"))]);
    const before = await places();
    await step.click();
    await expect(step).toHaveAccessibleName(offTheClock.curiosity.count(2, 3));
    await expect(history.locator("p[aria-live='polite']")).toContainText("A cow wanders into a cathedral");
    await expect(history.locator("img")).toHaveCount(0);
    await expect(history.locator(".otc__history-year")).toHaveText("1781");
    expect(await places()).toEqual(before);
    await step.click();
    await expect(history.locator("p[aria-live='polite']")).toContainText("Born 28 September 1852");
    expect(await places()).toEqual(before);
    await step.click();
    await expect(step).toHaveAccessibleName(offTheClock.curiosity.count(1, 3));
    await expect(history.locator("p[aria-live='polite']")).toContainText("1924");
  });

  test("with one oddity there is nothing to step", async ({ page }) => {
    await expect(cell(fixture(page, "history-one"), "history").getByRole("button")).toHaveCount(0);
  });

  test("a text-only story has no picture, creator or licence and still reads whole", async ({ page }) => {
    const history = cell(fixture(page, "history-text-only"), "history");
    await expect(history.locator("img, .otc__history-now .otc__credit")).toHaveCount(0);
    await expect(history.locator("p[aria-live]")).toContainText("A cow wanders into a cathedral");
    // The frame is never empty: its year stands in for the picture, at the picture's size, and is not read twice.
    const year = history.locator(".otc__history-year");
    await expect(year).toHaveText("1781");
    await expect(year).toHaveAttribute("aria-hidden", "true");
    const frame = await boxOf(history.locator(".otc__history-image"));
    expect(frame.width / frame.height).toBeCloseTo(tiers(page) ? 1.5 : 4 / 3, 1);
  });

  test("without a live week it is the archive, and says so", async ({ page }) => {
    const history = cell(fixture(page, "history-saved"), "history");
    await expect(history).toHaveAttribute("data-state", "archive");
    await expect(history.locator(".otc__source")).toHaveText(offTheClock.curiosity.fallback);
  });
});

test.describe("Off the clock: Now making", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  test("a repository that is not a project shows under the year's total: its heading, the live mark, its name linked to GitHub, marked ↗, and its description", async ({ page }) => {
    const section = fixture(page, "making").locator("[data-otc='making']");
    await expect(section.getByRole("heading", { level: 3 })).toHaveText(offTheClock.nowMaking.label);
    await expect(section.locator(".otc__live")).toHaveText(offTheClock.live(offTheClock.nowMaking.sourceName));
    await expect(section.locator(".otc__making-line")).toHaveText("Personal site for Elias B.");
    const making = section.locator("a");
    await expect(making).toContainText("eliasb.dev");
    await expect(making).toHaveAttribute("href", "https://github.com/3ixas/eliasb.dev");
    await expect(making).toHaveAttribute("target", "_blank");
    expect((await boxOf(making)).height).toBeGreaterThanOrEqual(44);
  });

  test("a project with a case study shows the project's name, linked to its case study; one without, linked to GitHub", async ({ page }) => {
    await expect(fixture(page, "making-project").locator("[data-otc='making'] a")).toHaveAttribute("href", "/things-i-make/threshold");
    await expect(fixture(page, "making-project").locator("[data-otc='making'] a")).toContainText("Threshold");
    await expect(fixture(page, "making-project").locator("[data-otc='making'] .otc__making-line")).toHaveText("A clearer view of what moving could cost.");
    await expect(fixture(page, "making-project-code").locator("[data-otc='making'] a")).toHaveAttribute("href", "https://github.com/3ixas/risk-event-tracker");
  });

  test("with no repository there is no Now making, and the year keeps its band", async ({ page }) => {
    await expect(fixture(page, "making-none").locator("[data-otc='making']")).toHaveCount(0);
    await expect(cell(fixture(page, "making-none"), "github").locator("[data-github-days]")).toBeVisible();
  });
});

test.describe("Off the clock: the GitHub year", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  const totalOf = async (card: Locator) => /: ([\d,]+)\.$/.exec((await card.locator("[data-github-days]").getAttribute("aria-label"))!)![1];

  test("draws the year with a total, a text alternative and a Less / More key", async ({ page }) => {
    const card = cell(fixture(page, "github"), "github");
    const days = card.locator("[data-github-days]");
    await expect(days.locator("button")).toHaveCount(365);
    await expect(days).toHaveAttribute("aria-label", /^GitHub contributions over the past year: [\d,]+\.$/);
    expect((await spoken(card.locator(".stretch-gh__total")))[0]).toContain(`${await totalOf(card)} contributions in the past year`);
    await expect(card.locator(".stretch-gh__legend")).toContainText(offTheClock.github.legend.less);
    await expect(card.locator(".stretch-gh__legend")).toContainText(offTheClock.github.legend.more);
  });

  test("the five levels take the year ramps, light and dark", async ({ page }) => {
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.reload();
      const days = cell(fixture(page, "github"), "github").locator("[data-github-days] button");
      for (const level of [0, 1, 2, 3, 4]) {
        await expect(days.locator(`xpath=self::*[@data-level='${level}' and not(@data-today)]`).first()).toHaveCSS("background-color", await token(page, `--year-${level}`));
      }
    }
  });

  test("today is the last day, ringed in cobalt, not filled, and marked once", async ({ page }) => {
    const today = cell(fixture(page, "github"), "github").locator("[data-github-days] button[data-today]");
    const cobalt = await token(page, "--cobalt");
    await expect(today).toHaveCount(1);
    await expect(today).toHaveAttribute("aria-current", "date");
    await expect(today).toHaveAttribute("aria-label", /2 Oct$/);
    await expect(today).toHaveCSS("background-color", await token(page, `--year-${await today.getAttribute("data-level")}`));
    await expect(today).toHaveCSS("box-shadow", new RegExp(cobalt.replace(/[()]/g, "\\$&")));
  });

  test("focusing a day reads out its count; arrow keys move between days; one day is the tab stop", async ({ page }) => {
    const card = cell(fixture(page, "github"), "github");
    await expect(card.locator("[data-github-days] button:not([tabindex='-1'])")).toHaveCount(1);
    await card.locator("[data-github-days] button[data-today]").focus();
    await expect(card.locator("[data-readout]")).toHaveText(/2 Oct/);
    await page.keyboard.press("ArrowUp");
    await expect(card.locator("[data-github-days] button:focus")).toHaveAttribute("aria-label", /1 Oct/);
  });

  test("a stale year says when its data is from; a missing year still keeps the band", async ({ page }) => {
    await expect(cell(fixture(page, "github-stale"), "github").locator(".otc__source")).toContainText(offTheClock.fromAsOf("GitHub", "28 Sept"));
    await expect(cell(fixture(page, "github"), "github").locator(".otc__source")).toHaveCount(0);
    const missing = cell(fixture(page, "github-unavailable"), "github");
    await expect(missing.locator("[data-github-days]")).toHaveCount(0);
    await expect(fixture(page, "github-unavailable").locator("[data-otc='making'] a")).toBeVisible();
  });

  test("on phones only the grid scrolls sideways, and it opens on today", async ({ page }) => {
    const scroller = cell(fixture(page, "github"), "github").locator("[data-github-scroll]");
    if (phone(page)) {
      await expect.poll(() => scroller.evaluate((el) => el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } else {
      expect(await scroller.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
  });
});

test.describe("Off the clock: every feed down", () => {
  test("the panel keeps its three bands: the fallbacks, the archive's oddity, and GitHub's link", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    const panel = fixture(page, "fallback").locator(".otc");
    expect(await bands(panel)).toEqual(sections);
    await expect(cell(panel, "reading")).toContainText(offTheClock.reading.fallback);
    await expect(cell(panel, "film")).toContainText(offTheClock.watched.fallback);
    await expect(cell(panel, "history").locator(".otc__source")).toHaveText(offTheClock.curiosity.fallback);
    const github = cell(panel, "github").getByRole("link");
    await expect(github).toHaveAttribute("href", "https://github.com/3ixas");
    const height = (await boxOf(cell(panel, "github"))).height;
    expect(height).toBeGreaterThan(44);
    await expect(page.locator("[role='progressbar'], [aria-busy='true']")).toHaveCount(0);
  });
});

test.describe("Off the clock: contrast, sizes and layout", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`every text passes AA, measured on the rendered page (${scheme})`, async ({ page, browserName }) => {
      test.skip(browserName !== "chromium", "Measured in Chromium");
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto("/fixtures/off-the-clock");
      await page.evaluate(() => document.fonts.ready);
      // Measure the states that carry every kind of text: the cells, history's credit, a stale line and the year.
      await page.evaluate(() => document.querySelectorAll("[data-fixture]").forEach((element) => {
        if (!["history-live", "book-stale", "github", "fallback"].includes((element as HTMLElement).dataset.fixture!)) element.remove();
      }));
      // A stale line's visible words are hidden from assistive technology (it hears the full date), which the measure skips.
      await page.evaluate(() => document.querySelectorAll(".otc__source [aria-hidden='true']").forEach((element) => element.removeAttribute("aria-hidden")));
      const texts = await page.locator("main").innerText();
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of ["Skipping rope intervals", "Dark Age", "Odd but true", "Image: The Museum of Flight", "From Goodreads", "contributions in the past year", "Between books."]) {
        expect(readings.some((reading) => reading.text.includes(expected)), expected).toBe(true);
      }
      expect(readings.filter((reading) => reading.median < reading.needs || reading.worst < reading.needs)).toEqual([]);
    });
  }

  test("nothing is under 13 px, nothing scrolls sideways, and axe finds no violations", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    await page.evaluate(() => document.fonts.ready);
    const sizes = await page.locator(".otc").evaluateAll((panels) =>
      panels.flatMap((panel) => [...panel.querySelectorAll("*")].filter((node) => node.childElementCount === 0 && node.textContent?.trim() && !node.closest(".sr-only")).map((node) => parseFloat(getComputedStyle(node).fontSize))),
    );
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(13);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).include("[data-fixture='history-live']").include("[data-fixture='fallback']").analyze();
    expect(results.violations).toEqual([]);
  });

  test("the composition: stacked on a phone; from 960 px the workout beside the shelf, the oddity across, the year beneath", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    const panel = fixture(page, "github").locator(".otc");
    const [training, shelf, history, year] = await Promise.all(["training", "shelf", "history", "github"].map((item) => boxOf(cell(panel, item))));
    if (tiers(page)) {
      expect(Math.abs(training.y - shelf.y)).toBeLessThan(1);
      expect(shelf.x).toBeGreaterThan(training.x + training.width);
    } else {
      expect(shelf.y).toBeGreaterThan(training.y + training.height - 1);
    }
    expect(history.y).toBeGreaterThan(Math.max(training.y + training.height, shelf.y + shelf.height) - 1);
    expect(year.y).toBeGreaterThan(history.y + history.height - 1);
    // The book and the film sit side by side at every width.
    const [book, film] = await Promise.all(["reading", "film"].map((item) => boxOf(cell(panel, item))));
    expect(Math.round(book.y)).toBe(Math.round(film.y));
  });

  test("the week: a strip of seven letters on a phone, seven rows of day and session from 960 px; read the same at both", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    const training = cell(fixture(page, "training-saturday"), "training");
    const [today, week] = await Promise.all([boxOf(training.locator(".otc__today")), boxOf(training.locator(".otc__week"))]);
    expect(week.y).toBeGreaterThan(today.y + today.height - 1);
    const rows = await training.locator(".otc__week li").evaluateAll((items) => new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size);
    expect(rows).toBe(tiers(page) ? 7 : 1);
    await expect(training.locator(".otc__week-letter").first()).toBeVisible({ visible: !tiers(page) });
    // On a phone the session is read but clipped to a pixel, as .sr-only is.
    expect((await boxOf(training.locator(".otc__week-session").first())).width > 2).toBe(tiers(page));
    await expect(training.getByRole("listitem").nth(5)).toContainText(`${days[5].long}: ${days[5].session}`);
  });
});

// Today's session is filled in after the page loads (it knows the day only then), so its line must already be as tall as the
// longest session at this width, or a phone sees everything below it jump.
test("filling in today's session moves nothing: its line is as tall with script as without", async ({ browser, page, baseURL }) => {
  const heightOf = (target: Page) => target.locator("#off-the-clock .otc__today").evaluate((element) => Math.round(element.getBoundingClientRect().height));
  await page.goto("/");
  await hydrated(page);
  const hydratedHeight = await heightOf(page);
  const bare = await browser.newContext({ javaScriptEnabled: false, viewport: page.viewportSize()!, baseURL });
  const plain = await bare.newPage();
  await plain.goto("/");
  expect(await heightOf(plain)).toBe(hydratedHeight);
  await bare.close();
});
