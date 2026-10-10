import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { offTheClock } from "../src/content/stretch/off-the-clock";
import { contrastOnPaper } from "./support/contrast";

const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 761;
const fixture = (page: Page, name: string) => page.locator(`[data-fixture='${name}']`);
const { days } = offTheClock.training;

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

const links = (card: Locator) => card.getByRole("link");

test.describe("Off the clock: on the homepage", () => {
  test("reading follows training without waiting for the history card", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#off-the-clock");
    const training = section.locator("[data-otc='training']");
    const reading = section.locator("[data-otc='reading']");
    const clipping = section.locator("[data-otc='clipping']");
    const trainingBox = (await training.boundingBox())!;
    const readingBox = (await reading.boundingBox())!;
    expect(readingBox.y - trainingBox.y - trainingBox.height).toBeCloseTo(phone(page) ? 32 : 40, 0);
    if (phone(page)) {
      const filmBox = (await section.locator("[data-otc='film']").boundingBox())!;
      expect((await clipping.boundingBox())!.y).toBeGreaterThan(filmBox.y + filmBox.height);
    } else {
      expect((await clipping.boundingBox())!.x).toBeGreaterThan(trainingBox.x + trainingBox.width);
      const readingTop = await reading.evaluate((element) => element.getBoundingClientRect().top + scrollY);
      await clipping.locator("summary").click();
      expect(await reading.evaluate((element) => element.getBoundingClientRect().top + scrollY)).toBeCloseTo(readingTop, 0);
    }
  });

  test("the four items are in the server-rendered section", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.goto("/");
    const section = page.locator("section#off-the-clock");
    for (const item of ["training", "clipping", "reading", "film"]) await expect(section.locator(`[data-otc='${item}']`)).toHaveCount(1);
  });
});

test.describe("Off the clock: the training poster", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  test("lists the approved week with its photo, caption and Zone 2 note", async ({ page }) => {
    const poster = fixture(page, "training-saturday");
    await expect(poster.getByRole("heading", { level: 3 })).toHaveText(offTheClock.training.week);
    const rows = poster.locator(".stretch-week__day");
    await expect(rows).toHaveCount(7);
    for (const [index, day] of days.entries()) {
      await expect(rows.nth(index)).toContainText(day.session);
      await expect(rows.nth(index)).toContainText(day.long);
    }
    await expect(poster.getByRole("img", { name: offTheClock.training.photo.alt })).toBeVisible();
    await expect(poster.getByText(offTheClock.training.photoCaption)).toBeVisible();
    await expect(poster.getByText(offTheClock.training.zone2)).toBeVisible();
  });

  for (const [name, index] of [["monday", 0], ["saturday", 5], ["sunday", 6]] as const) {
    test(`today is ${days[index].long} in London (${name} fixture), marked once and in cobalt`, async ({ page }) => {
      const rows = fixture(page, `training-${name}`).locator(".stretch-week__day");
      await expect(rows.locator("xpath=self::*[@data-today]")).toHaveCount(1);
      const today = rows.nth(index);
      await expect(today).toHaveAttribute("data-today", "");
      await expect(today).toHaveAttribute("aria-current", "date");
      await expect(today).toContainText(offTheClock.training.today);
      await expect(today).toHaveCSS("background-color", await token(page, "--stretch-cobalt"));
      await expect(today).toHaveCSS("color", await token(page, "--stretch-on-cobalt"));
    });
  }

  test("on phones today is also a large card over the week; on wide screens it is not", async ({ page }) => {
    const poster = fixture(page, "training-saturday");
    const card = poster.locator(".stretch-week__today");
    if (phone(page)) {
      await expect(card).toBeVisible();
      await expect(card).toContainText("Saturday");
      await expect(card).toContainText("Zone 2, rower or bike");
      const [cardBox, listBox] = [await card.boundingBox(), await poster.locator(".stretch-week__days").boundingBox()];
      expect(cardBox!.y + cardBox!.height).toBeLessThanOrEqual(listBox!.y);
    } else {
      await expect(card).toBeHidden();
    }
  });

  test("the pill and card are decorative to assistive technology: the list carries the week", async ({ page }) => {
    await expect(fixture(page, "training-saturday").locator(".stretch-week__today")).toHaveAttribute("aria-hidden", "true");
  });
});

test.describe("Off the clock: the book and the film", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  test("the book shows its cover, title, author and Goodreads link", async ({ page }) => {
    const card = fixture(page, "book");
    await expect(card.getByText(offTheClock.reading.label, { exact: true })).toBeVisible();
    await expect(card.getByRole("img", { name: offTheClock.reading.coverAlt("Dark Age", "Pierce Brown") })).toBeVisible();
    await expect(card.getByText("Dark Age", { exact: true })).toBeVisible();
    await expect(card.getByText("Pierce Brown", { exact: true })).toBeVisible();
    await expect(links(card)).toHaveText("Goodreads ↗");
    await expect(links(card)).toHaveAttribute("href", /goodreads\.com/);
  });

  for (const name of ["book-empty", "book-unfetched"]) {
    test(`${name}: written fallback in the book's shape`, async ({ page }) => {
      const card = fixture(page, name);
      await expect(card.getByText(offTheClock.reading.fallback)).toBeVisible();
      await expect(card.locator("[data-print='blank']")).toBeVisible();
      await expect(links(card)).toHaveCount(0);
    });
  }

  test("a stale book says when its data is from", async ({ page }) => {
    await expect(fixture(page, "book-stale")).toContainText("as of 2 Aug");
    await expect(fixture(page, "book")).not.toContainText("as of");
  });

  test("the film shows its poster, title, year, watched date, stars and Letterboxd link", async ({ page }) => {
    const card = fixture(page, "film");
    await expect(card.getByText(offTheClock.watched.kicker)).toBeVisible();
    await expect(card.getByText(offTheClock.watched.label, { exact: true })).toBeVisible();
    await expect(card.getByRole("img", { name: offTheClock.watched.posterAlt("The Invite", "2026") })).toBeVisible();
    await expect(card.locator(".stretch-otc__name")).toHaveText("The Invite 2026");
    await expect(card.getByText("Watched 14 Sept · ★★★★½")).toBeVisible();
    await expect(card.getByText("Watched 14 September, rated 4.5 out of 5")).toBeAttached();
    await expect(links(card)).toHaveText("Letterboxd ↗");
  });

  test("an empty diary shows the written fallback in the poster's shape", async ({ page }) => {
    const card = fixture(page, "film-empty");
    await expect(card.getByText(offTheClock.watched.fallback)).toBeVisible();
    await expect(card.locator("[data-print='blank']")).toBeVisible();
    await expect(links(card)).toHaveCount(0);
  });

  test("a film without a poster or rating keeps its card and shows only what it has", async ({ page }) => {
    const card = fixture(page, "film-unrated");
    await expect(card.locator("[data-print='blank']")).toBeVisible();
    await expect(card.getByText("The Invite")).toBeVisible();
    await expect(card.getByText(/★/)).toHaveCount(0);
    await expect(card.getByText("Watched 14 Sept", { exact: true })).toBeVisible();
  });

  test("a stale film says when its data is from", async ({ page }) => {
    await expect(fixture(page, "film-stale")).toContainText("as of 2 Aug");
  });
});

test.describe("Off the clock: the clipping", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  test("a live week leads with its pictured oddity, its date, credit and Wikipedia link", async ({ page }) => {
    const card = fixture(page, "clipping-week");
    await expect(card.getByText(offTheClock.curiosity.label, { exact: true })).toBeVisible();
    const lead = card.locator(".stretch-story--lead");
    await expect(lead.getByText("The first aerial circumnavigation is completed by a team from the US Army.")).toBeVisible();
    await expect(lead.getByText("28 September 1924")).toBeVisible();
    await expect(lead.getByRole("img", { name: "Douglas World Cruisers on a beach" })).toBeVisible();
    await expect(lead.getByRole("link", { name: "The Museum of Flight" })).toHaveAttribute("href", /commons\.wikimedia\.org/);
    await expect(lead.getByRole("link", { name: "Public domain" })).toBeVisible();
    await expect(lead.getByRole("link", { name: /Read on Wikipedia/ })).toHaveAttribute("href", "https://en.wikipedia.org/wiki/First_aerial_circumnavigation");
  });

  test("the other oddities are behind a disclosure that counts them", async ({ page }) => {
    const card = fixture(page, "clipping-week");
    const summary = card.locator("summary");
    await expect(summary).toContainText("2 more oddities this week");
    await expect(card.getByText("A cow wanders into a cathedral")).toBeHidden();
    // Click only while it is still closed, so a retry never toggles it shut again.
    await expect(async () => {
      if (!(await card.locator("details").evaluate((element: HTMLDetailsElement) => element.open))) await summary.click();
      await expect(card.getByText("A cow wanders into a cathedral")).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 8000 });
    await expect(card.getByText("Born 28 September 1852")).toBeVisible();
    await expect(card.getByRole("link", { name: "Ada Example" })).toBeVisible();
  });

  test("without a live week it is the archive, and says so", async ({ page }) => {
    const card = fixture(page, "clipping-saved");
    await expect(card.locator(".stretch-otc__kicker")).toHaveText(offTheClock.curiosity.fallback);
    await expect(card.locator("[data-otc='clipping']")).toHaveAttribute("data-state", "archive");
    await expect(card.locator(".stretch-story--lead")).toBeVisible();
    const leadImage = card.locator(".stretch-story--lead img");
    await expect(leadImage).toBeVisible();
    await leadImage.scrollIntoViewIfNeeded();
    await expect.poll(() => leadImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await card.locator("summary").click();
    for (const image of await card.locator(".stretch-story img").all()) {
      await expect(image).toBeVisible();
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    }
    await expect(card.locator(".stretch-story img")).toHaveCount(3);
  });
});

test.describe("Off the clock: Now making", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  const { nowMaking } = offTheClock;

  test("shows the written entry with a cobalt mark and a Code link", async ({ page }) => {
    const card = fixture(page, "making");
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(nowMaking.label);
    await expect(card.getByText(nowMaking.line)).toBeVisible();
    await expect(card.getByText(nowMaking.note)).toBeVisible();
    await expect(links(card)).toHaveText(nowMaking.code);
    await expect(links(card)).toHaveAttribute("href", nowMaking.href);
    await expect(card.locator("[data-now-mark]")).toHaveCSS("background-color", await token(page, "--stretch-cobalt"));
  });

  test("the mark pulses, and stops for reduced motion", async ({ page }) => {
    const mark = fixture(page, "making").locator("[data-now-mark]");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(mark).toHaveCSS("animation-name", "stretch-now-pulse");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(mark).toHaveCSS("animation-name", "none");
  });

  test("after eight weeks it falls back to the latest repository, without the mark", async ({ page }) => {
    const card = fixture(page, "making-fallback");
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(nowMaking.fallback.label);
    await expect(card.getByText(nowMaking.fallback.latest("ask-professor-past", "20 Sept"), { exact: true })).toBeVisible();
    await expect(links(card)).toHaveText(nowMaking.fallback.link);
    await expect(links(card)).toHaveAttribute("href", /github\.com\/3ixas\/ask-professor-past/);
    await expect(card.locator("[data-now-mark]")).toHaveCount(0);
  });

  test("with no entry and no repository the card is gone", async ({ page }) => {
    await expect(fixture(page, "making-none").locator("[data-otc]")).toHaveCount(0);
  });
});

test.describe("Off the clock: the GitHub year", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  test("draws the year with a total, a text alternative, a busiest stretch and a legend", async ({ page }) => {
    const card = fixture(page, "github");
    const days = card.locator("[data-github-days]");
    await expect(days.locator("button")).toHaveCount(365);
    await expect(days).toHaveAttribute("aria-label", /^GitHub contributions over the past year: [\d,]+, busiest in (early|mid|late)-July\.$/);
    await expect(card.locator(".stretch-gh__count")).toHaveText(/^[\d,]+$/);
    await expect(card.locator("[data-busiest]")).toBeVisible();
    await expect(card.locator(".stretch-gh__legend")).toContainText(offTheClock.github.legend.today);
  });

  test("today is the last day, in cobalt, and marked once", async ({ page }) => {
    const card = fixture(page, "github");
    const today = card.locator("[data-github-days] button[data-today]");
    await expect(today).toHaveCount(1);
    await expect(today).toHaveAttribute("aria-current", "date");
    await expect(today).toHaveAttribute("aria-label", /2 Oct$/);
    await expect(today).toHaveCSS("background-color", await token(page, "--stretch-cobalt"));
  });

  test("hovering or focusing a day reads out its count; arrow keys move between days", async ({ page }) => {
    const card = fixture(page, "github");
    const today = card.locator("[data-github-days] button[data-today]");
    await today.focus();
    await expect(card.locator("[data-readout]")).toHaveText(/2 Oct/);
    await page.keyboard.press("ArrowUp");
    await expect(card.locator("[data-github-days] button:focus")).toHaveAttribute("aria-label", /1 Oct/);
    await expect(card.locator("[data-readout]")).toHaveText(/1 Oct/);
  });

  test("only one day is a tab stop, so the grid costs a keyboard user one Tab", async ({ page }) => {
    const stops = fixture(page, "github").locator("[data-github-days] button:not([tabindex='-1'])");
    await expect(stops).toHaveCount(1);
  });

  test("a stale year says when its data is from; a missing year is gone", async ({ page }) => {
    await expect(fixture(page, "github-stale")).toContainText("as of 28 Sept");
    await expect(fixture(page, "github")).not.toContainText("as of");
    await expect(fixture(page, "github-unavailable").locator("[data-otc]")).toHaveCount(0);
  });

  test("on phones only the grid scrolls sideways, inside its card, and it opens on today", async ({ page }) => {
    const card = fixture(page, "github");
    const scroller = card.locator("[data-github-scroll]");
    // The grid moves to today when the page hydrates, which a slow runner can do after load.
    if (phone(page)) {
      await expect
        .poll(() => scroller.evaluate((el) => el.scrollLeft + el.clientWidth >= el.scrollWidth - 1), { message: "the grid opens on today" })
        .toBe(true);
    }
    const { scrollWidth, clientWidth, scrollLeft } = await scroller.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollLeft: el.scrollLeft,
    }));
    if (phone(page)) {
      expect(scrollWidth).toBeGreaterThan(clientWidth);
      expect(scrollLeft + clientWidth).toBeGreaterThanOrEqual(scrollWidth - 1);
      const [todayBox, scrollerBox] = [await card.locator("button[data-today]").boundingBox(), await scroller.boundingBox()];
      expect(todayBox!.x + todayBox!.width).toBeLessThanOrEqual(scrollerBox!.x + scrollerBox!.width + 1);
      await card.locator("button[data-today]").focus();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } else {
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    }
  });
});

test.describe("Off the clock: contrast, targets and layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    for (const summary of await page.locator("summary").all()) await summary.click();
  });

  test("text passes WCAG 2.2 AA", async ({ page }) => {
    for (const selector of [
      ".stretch-otc__title",
      ".stretch-otc__label",
      ".stretch-otc__kicker",
      ".stretch-otc__name",
      ".stretch-otc__by",
      ".stretch-otc__note",
      ".stretch-otc__asof",
      ".stretch-otc__photo figcaption",
      ".stretch-week__session",
      ".stretch-week__tag",
      ".stretch-week__today-day",
      ".stretch-story__fact",
      ".stretch-story__date",
      ".stretch-story__figure figcaption",
      ".stretch-link",
      ".stretch-more summary",
      ".stretch-gh__beside",
      ".stretch-gh__note",
      ".stretch-gh__foot",
    ]) {
      for (const reading of await contrastOnPaper(page, selector)) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("links and the disclosure have 44 px targets", async ({ page }) => {
    for (const target of await page.locator(".stretch-link, .stretch-more summary").all()) {
      const box = (await target.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("every item fits the screen and the page does not scroll sideways", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    for (const card of await page.locator("[data-otc]").all()) {
      const box = (await card.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("axe finds no violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).include("main").analyze();
    expect(results.violations).toEqual([]);
  });
});
