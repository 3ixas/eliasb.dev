import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { offTheClock } from "../src/content/stretch/off-the-clock";
import { renderedContrast } from "./support/rendered-contrast";
import { spoken } from "./support/roll";

/*
 * Off the clock (docs/design/DESIGN.md "The homepage, in order" 6, R-19, R-30, R-34, R-50): one bordered paper panel
 * holding four nested stone rows, each with its heading in a margin column from 960 px: Today's workout (with static
 * 7-day cue tiles and tap-to-enlarge Central London running photo), On my shelf and screen, Odd but true from this week
 * in history (with tap-to-enlarge 3:2 illustration), and GitHub, the past year (with What I'm building now as a
 * full-width strip above the contribution grid). Each state is a whole panel on /fixtures/off-the-clock, with one cell
 * swapped, so every test also shows the panel keeping its shape.
 */

const { days } = offTheClock.training;
const fixture = (page: Page, name: string) => page.locator(`[data-fixture='${name}']`);
const cell = (panel: Locator, item: string) => panel.locator(`[data-otc='${item}']`);
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const phone = (page: Page) => width(page) < 720;
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

  test("its title, then one paper panel with four nested stone rows and margin headings", async ({ page }) => {
    const section = page.locator("section#off-the-clock");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(offTheClock.heading);
    const panel = section.locator(".otc");
    await expect(panel).toHaveClass(/surface--paper/);
    expect(await bands(panel)).toEqual(sections);
    await expect(cell(panel, "training").getByRole("heading", { level: 3 })).toHaveText(offTheClock.training.title);
    await expect(cell(panel, "shelf").getByRole("heading", { level: 3 })).toHaveText(offTheClock.shelf.title);
    await expect(cell(panel, "history").getByRole("heading", { level: 3 })).toHaveText(offTheClock.curiosity.label);
    const githubHeading = cell(panel, "github").getByRole("heading", { level: 3 });
    await expect(githubHeading).toHaveText(offTheClock.github.heading);
    await expect(githubHeading).toBeVisible();
  });

  test("each section sits as a nested stone row with a 1 px hairline border inside the paper panel", async ({ page }) => {
    const panel = page.locator("section#off-the-clock .otc");
    const pageColour = await token(page, "--page");
    const rows = await panel.evaluate((element) =>
      [...element.children].map((child) => {
        const style = getComputedStyle(child);
        return {
          background: style.backgroundColor,
          borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
          radius: style.borderRadius,
        };
      }),
    );
    expect(rows).toHaveLength(4);
    for (const row of rows) {
      expect(row.background).toBe(pageColour);
      expect(row.borders).toEqual(["1px", "1px", "1px", "1px"]);
      expect(row.radius).toBe("16px");
    }
  });

  test("the panel is paper in light and the dark surface in dark, with stone rows on --page", async ({ page }) => {
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.reload();
      await expect(page.locator("#off-the-clock .otc")).toHaveCSS("background-color", await token(page, "--paper"));
      await expect(page.locator("#off-the-clock .otc__section").first()).toHaveCSS("background-color", await token(page, "--page"));
    }
  });

  test("without script the panel is whole: the static 7-day week, running photo, shelf, first oddity and GitHub row", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    const panel = page.locator("#off-the-clock .otc");
    await expect(cell(panel, "training").getByRole("list", { name: offTheClock.training.week })).toBeVisible();
    await expect(cell(panel, "training").locator(".otc__run-photo img")).toBeVisible();
    await expect(cell(panel, "history").locator("p[aria-live]")).not.toBeEmpty();
    expect(await bands(panel)).toEqual(sections);
  });

  test("no visible Enlarge instruction text appears anywhere in Off the clock", async ({ page }) => {
    const text = await page.locator("section#off-the-clock").innerText();
    expect(text).not.toMatch(/\bEnlarge\b/i);
  });
});

test.describe("Off the clock: training", () => {
  for (const [name, index] of [["monday", 0], ["saturday", 5], ["sunday", 6]] as const) {
    test(`${name}: today's session is shown large above a calm, non-interactive 7-day cue schedule with today clear without colour alone`, async ({ page }) => {
      await page.goto("/fixtures/off-the-clock");
      const training = cell(fixture(page, `training-${name}`), "training");
      await expect(training.getByRole("heading", { level: 3 })).toHaveText(offTheClock.training.title);
      await expect(training.locator(".otc__today > span:last-child")).toHaveText(days[index].session);
      const list = training.getByRole("list", { name: offTheClock.training.week });
      await expect(list).toBeVisible();
      // Static display: zero interactive day-preview buttons or links inside the week list, and no redundant 4× summary line.
      await expect(list.locator("button, a")).toHaveCount(0);
      expect(await training.innerText()).not.toMatch(/4×|gym strength/i);

      const marked = training.locator(".otc__week li[data-today]");
      await expect(marked).toHaveCount(1);
      await expect(marked).toHaveAttribute("aria-current", "date");
      await expect(training.locator(".otc__week li").nth(index)).toHaveAttribute("data-today", "");

      // Today is distinguished by inverted fill + dot mark (not colour alone).
      const other = training.locator(".otc__week li:not([data-today])").first();
      const [todayStyle, otherStyle] = await Promise.all([
        marked.evaluate((el) => ({
          bg: getComputedStyle(el).backgroundColor,
          dotContent: getComputedStyle(el, "::after").content,
          dotWidth: parseFloat(getComputedStyle(el, "::after").width),
        })),
        other.evaluate((el) => ({
          bg: getComputedStyle(el).backgroundColor,
          dotContent: getComputedStyle(el, "::after").content,
        })),
      ]);
      expect(todayStyle.bg).not.toBe(otherStyle.bg);
      expect(todayStyle.dotContent).not.toBe("none");
      expect(todayStyle.dotWidth).toBeGreaterThan(0);
      expect(otherStyle.dotContent).toBe("none");

      for (let i = 0; i < days.length; i += 1) {
        const tile = training.locator(".otc__week li").nth(i);
        await expect(tile.locator(".otc__week-day")).toHaveText(days[i].short);
        await expect(tile.locator(".otc__week-cue")).toHaveText(days[i].cue);
        await expect(tile).toContainText(`${days[i].long}: ${days[i].session}`);
      }
    });
  }
});

test.describe("Off the clock: tap-to-enlarge imagery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    await hydrated(page);
  });

  test("the running photo opens full-size in the lightbox by pointer and keyboard, returns focus on close, and has an unclipped focus ring", async ({ page }) => {
    const training = cell(fixture(page, "training-saturday"), "training");
    const button = training.locator(".otc__run-photo .zoom");
    await expect(button).toHaveCSS("cursor", "zoom-in");
    await expect(button).toHaveAttribute("aria-haspopup", "dialog");
    await expect(button).toHaveAccessibleName(`${offTheClock.training.photo.alt} (view larger)`);
    await expect(training.locator(".otc__run-caption")).toHaveText(offTheClock.training.photoCaption);

    const dialog = page.getByRole("dialog", { name: offTheClock.training.photo.alt }).first();
    await button.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("the history illustration opens in the lightbox by pointer and keyboard, returns focus, and tracks stepped oddities", async ({ page }) => {
    const history = cell(fixture(page, "history-live"), "history");
    const button = history.locator(".otc__history-image .zoom");
    const step = history.locator(".otc__step");

    await expect(button).toHaveCSS("cursor", "zoom-in");
    await expect(button).toHaveAttribute("aria-haspopup", "dialog");
    await expect(button).toHaveAccessibleName("Douglas World Cruisers on a beach (view larger)");

    // No ancestor clips the 2 px focus ring at 3 px offset.
    const clipped = await button.evaluate((element) => {
      const ring = element.getBoundingClientRect();
      for (let parent = element.parentElement; parent && parent !== document.documentElement; parent = parent.parentElement) {
        if (getComputedStyle(parent).overflow === "visible") continue;
        const box = parent.getBoundingClientRect();
        if (box.left > ring.left - 4 || box.right < ring.right + 4 || box.top > ring.top - 4 || box.bottom < ring.bottom + 4) return parent.className;
      }
      return null;
    });
    expect(clipped).toBeNull();

    const firstDialog = page.getByRole("dialog", { name: "Douglas World Cruisers on a beach" });
    await button.click();
    await expect(firstDialog).toBeVisible();
    await expect.poll(() => firstDialog.locator("img").evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(firstDialog).toBeHidden();
    await expect(button).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(firstDialog).toBeVisible();
    await firstDialog.getByRole("button", { name: "Close" }).click();
    await expect(firstDialog).toBeHidden();
    await expect(button).toBeFocused();

    // Stepping to an unpictured oddity shows its year with no zoom button; stepping to the third opens the third image.
    await step.click();
    await expect(history.locator(".otc__history-image .zoom")).toHaveCount(0);
    await expect(history.locator(".otc__history-year")).toHaveText("1781");

    await step.click();
    const thirdButton = history.locator(".otc__history-image .zoom");
    await expect(thirdButton).toHaveAccessibleName("Henri Moissan in his laboratory (view larger)");
    await thirdButton.click();
    const thirdDialog = page.getByRole("dialog", { name: "Henri Moissan in his laboratory" });
    await expect(thirdDialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(thirdDialog).toBeHidden();
    await expect(thirdButton).toBeFocused();
  });
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
    await expect(film.locator("p").first()).toContainText("Last watched 14 Sep");
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
      await expect(target.locator("img, .otc__cover")).toHaveCount(0);
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

  test("full width: the zoomable picture, the title, the date and fact, its credit, and an outline pill that counts", async ({ page }) => {
    const history = cell(fixture(page, "history-live"), "history");
    await expect(history.getByRole("heading", { level: 3 })).toHaveText(offTheClock.curiosity.label);
    await expect(history.locator("p[aria-live='polite']")).toHaveText("28 September 1924 The first aerial circumnavigation is completed by a team from the US Army.");
    await expect(history.locator(".otc__history-now .otc__credit")).toHaveText("Image: The Museum of Flight · Public domain");
    await expect(history.locator(".otc__history-image img")).toHaveAttribute("alt", "Douglas World Cruisers on a beach");
    const step = history.locator(".otc__step");
    await expect(step).toHaveClass(/pill--outline/);
    await expect(step).toHaveAccessibleName(`${offTheClock.curiosity.count(1, 3)}, ${offTheClock.curiosity.nextFact}`);
    const [band, panel] = await Promise.all([boxOf(history), boxOf(fixture(page, "history-live").locator(".otc"))]);
    expect(band.width).toBeGreaterThan(panel.width - 100);
  });

  test("the pill steps to the next oddity in place, politely announced, and wraps after the last; nothing else moves", async ({ page }) => {
    const panel = fixture(page, "history-live");
    const history = cell(panel, "history");
    await hydrated(page);
    const step = history.locator(".otc__step");
    // Where the pill and the row below sit: stepping through oddities of every length, with and without a picture, moves neither.
    // Measured against the document, not the window: a click scrolls its target into view.
    const place = (locator: Locator) => locator.evaluate((element) => {
      const { left, top, width } = element.getBoundingClientRect();
      return [Math.round(left + scrollX), Math.round(top + scrollY), Math.round(width)];
    });
    const places = () => Promise.all([place(step), place(cell(panel, "github"))]);
    const before = await places();
    await step.click();
    await expect(step).toHaveAccessibleName(`${offTheClock.curiosity.count(2, 3)}, ${offTheClock.curiosity.nextFact}`);
    await expect(history.locator("p[aria-live='polite']")).toContainText("A cow wanders into a cathedral");
    await expect(history.locator(".otc__history-image img")).toHaveCount(0);
    expect(await places()).toEqual(before);
    await step.click();
    await expect(history.locator("p[aria-live='polite']")).toContainText("Born 28 September 1852");
    expect(await places()).toEqual(before);
    await step.click();
    await expect(step).toHaveAccessibleName(`${offTheClock.curiosity.count(1, 3)}, ${offTheClock.curiosity.nextFact}`);
    await expect(history.locator("p[aria-live='polite']")).toContainText("1924");
  });

  test("with one oddity there is nothing to step", async ({ page }) => {
    const history = cell(fixture(page, "history-one"), "history");
    await expect(history.locator(".otc__step")).toHaveCount(0);
    await expect(history.locator(".otc__history-image .zoom")).toHaveCount(1);
  });

  test("a text-only story has no picture, creator or licence and still reads whole", async ({ page }) => {
    const history = cell(fixture(page, "history-text-only"), "history");
    await expect(history.locator("img, .otc__history-now .otc__credit")).toHaveCount(0);
    await expect(history.locator("p[aria-live]")).toContainText("A cow wanders into a cathedral");
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

  test("a repository that is not a project runs as a full-width strip above the contribution grid: heading, live mark, link marked ↗, and description", async ({ page }) => {
    const github = cell(fixture(page, "making"), "github");
    const section = github.locator("[data-otc='making']");
    await expect(section.getByRole("heading", { level: 4 })).toHaveText(offTheClock.nowMaking.label);
    await expect(section.locator(".otc__live")).toHaveText(offTheClock.live(offTheClock.nowMaking.sourceName));
    await expect(section.locator(".otc__making-line")).toHaveText("Personal site for Elias B.");
    const making = section.locator("a");
    await expect(making).toContainText("eliasb.dev");
    await expect(making).toHaveAttribute("href", "https://github.com/3ixas/eliasb.dev");
    await expect(making).toHaveAttribute("target", "_blank");
    expect((await boxOf(making)).height).toBeGreaterThanOrEqual(44);

    // Strip sits above the contribution grid and spans the full content column.
    const [stripBox, totalBox, bodyBox] = await Promise.all([
      boxOf(section),
      boxOf(github.locator(".stretch-gh__total")),
      boxOf(github.locator(".otc__github-body")),
    ]);
    expect(totalBox.y).toBeGreaterThanOrEqual(stripBox.y + stripBox.height - 1);
    expect(Math.abs(stripBox.width - bodyBox.width)).toBeLessThanOrEqual(2);
  });

  test("a project with a case study shows the project's name, linked to its case study; one without, linked to GitHub", async ({ page }) => {
    await expect(fixture(page, "making-project").locator("[data-otc='making'] a")).toHaveAttribute("href", "/things-i-make/threshold");
    await expect(fixture(page, "making-project").locator("[data-otc='making'] a")).toContainText("Threshold");
    await expect(fixture(page, "making-project").locator("[data-otc='making'] .otc__making-line")).toHaveText("A clearer view of what moving could cost.");
    await expect(fixture(page, "making-project-code").locator("[data-otc='making'] a")).toHaveAttribute("href", "https://github.com/3ixas/risk-event-tracker");
  });

  test("with no repository there is no Now making, and the year keeps its row", async ({ page }) => {
    await expect(fixture(page, "making-none").locator("[data-otc='making']")).toHaveCount(0);
    await expect(cell(fixture(page, "making-none"), "github").locator("[data-github-days]")).toBeVisible();
  });
});

test.describe("Off the clock: the GitHub year", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  const totalOf = async (card: Locator) => /: ([\d,]+)\.$/.exec((await card.locator("[data-github-days]").getAttribute("aria-label"))!)![1];

  test("draws the year with a visible heading, a total, a text alternative and a Less / More key", async ({ page }) => {
    const card = cell(fixture(page, "github"), "github");
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(offTheClock.github.heading);
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
    await expect(today).toHaveAttribute("aria-label", /2 October$/);
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

  test("a stale year says when its data is from; a missing year still keeps the row", async ({ page }) => {
    await expect(cell(fixture(page, "github-stale"), "github").locator(".otc__source")).toContainText(offTheClock.fromAsOf("GitHub", "28 Sep"));
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
  test("the panel keeps its four rows: the fallbacks, the archive's oddity, and GitHub's link", async ({ page }) => {
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
      // Hydration must finish in every panel before panels are removed: the page hydrates in pieces, and removing a panel
      // first makes React rebuild the tree when it gets there, so every position measured before that is stale.
      await page.waitForFunction(() => [...document.querySelectorAll(".otc__week, .otc__history")].every((element) => Object.keys(element).some((key) => key.startsWith("__react"))));
      // Measure the states that carry every kind of text: the cells, history's credit, a stale line, the tiles and the year.
      await page.evaluate(() => document.querySelectorAll("[data-fixture]").forEach((element) => {
        if (!["history-live", "book-stale", "github", "fallback"].includes((element as HTMLElement).dataset.fixture!)) element.remove();
      }));
      // Visible tile abbreviations and stale short dates are aria-hidden for screen readers, which the measure skips.
      await page.evaluate(() =>
        document.querySelectorAll(".otc__source [aria-hidden='true'], .otc__week [aria-hidden='true']").forEach((element) => element.removeAttribute("aria-hidden")),
      );
      const texts = await page.locator("main").innerText();
      const readings = (await renderedContrast(page)).filter((reading) => texts.includes(reading.text));
      for (const expected of [
        "Skipping rope intervals",
        "Rope",
        "Out on a run, central London.",
        "Dark Age",
        "Odd but true",
        "Image: The Museum of Flight",
        "From Goodreads",
        "GitHub, the past year",
        "contributions in the past year",
        "Between books.",
      ]) {
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

  test("all four rows stack; from 960 px every heading sits in the left margin column; the book and film sit side by side from 720 px", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    const panel = fixture(page, "github").locator(".otc");
    const [training, shelf, history, github] = await Promise.all(sections.map((item) => boxOf(cell(panel, item))));
    expect(shelf.y).toBeGreaterThan(training.y + training.height - 1);
    expect(history.y).toBeGreaterThan(shelf.y + shelf.height - 1);
    expect(github.y).toBeGreaterThan(history.y + history.height - 1);
    const [book, film] = await Promise.all(["reading", "film"].map((item) => boxOf(cell(panel, item))));
    if (phone(page)) expect(film.y).toBeGreaterThan(book.y);
    else expect(Math.round(book.y)).toBe(Math.round(film.y));
    for (const item of sections) {
      const [heading, content] = await Promise.all([boxOf(cell(panel, item).getByRole("heading", { level: 3 })), boxOf(cell(panel, item).locator(":scope > :not(h3)").first())]);
      if (width(page) >= 960) expect(content.x).toBeGreaterThan(heading.x + heading.width);
      else expect(content.y).toBeGreaterThan(heading.y + heading.height - 1);
    }
  });

  test("the static 7-day schedule shows all seven cue tiles with or without script and never overflows", async ({ browser, page, baseURL }) => {
    await page.goto("/fixtures/off-the-clock");
    await hydrated(page);
    const training = cell(fixture(page, "training-saturday"), "training");
    const [today, week] = await Promise.all([boxOf(training.locator(".otc__today")), boxOf(training.locator(".otc__week"))]);
    expect(week.y).toBeGreaterThan(today.y + today.height - 1);
    const rows = await training.locator(".otc__week li").evaluateAll((items) => new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size);
    if (width(page) >= 720) expect(rows).toBe(1);
    else if (width(page) >= 380) expect(rows).toBe(2);
    else expect(rows).toBe(3);
    await expect(training.getByRole("listitem").nth(5)).toContainText(`${days[5].long}: ${days[5].session}`);

    const bare = await browser.newContext({ javaScriptEnabled: false, viewport: page.viewportSize()!, baseURL });
    const plain = await bare.newPage();
    await plain.goto("/fixtures/off-the-clock");
    const plainTraining = cell(fixture(plain, "training-saturday"), "training");
    await expect(plainTraining.locator(".otc__week-cue")).toHaveCount(7);
    await expect(plainTraining.locator(".otc__week-cue").nth(5)).toHaveText("Rope");
    expect(await plain.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await bare.close();
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
