import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { offTheClock } from "../src/content/stretch/off-the-clock";
import { contrastOnPaper } from "./support/contrast";
import { tap } from "./support/tap";

const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 761;
const fixture = (page: Page, name: string) => page.locator(`[data-fixture='${name}']`);
const { days } = offTheClock.training;
/** The margin is for wide screens with a hovering pointer; below that a closer look opens inline, when tapped. */
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1180;

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
const title = (card: Locator) => card.locator(".qi-row__title");
const line = (card: Locator) => card.locator(".qi-row__line");

/** The controller listens through React's props on the column, which exist only once it has hydrated; a tap before that does nothing. */
const hydrated = (page: Page) =>
  page.waitForFunction(() => {
    const columns = [...document.querySelectorAll("[data-quiet-column]")];
    return columns.length > 0 && columns.every((column) => Object.keys(column).some((key) => key.startsWith("__reactProps$")));
  });

/** Opens a row's closer look the way the screen does it (hover for the margin, a tap for the inline look) and returns the look. */
async function openLook(page: Page, name: string, id: string) {
  await hydrated(page);
  const card = fixture(page, name);
  if (wide(page)) {
    await card.locator(`[data-look="${id}"]`).hover();
    const look = page.locator(".qi-margin .qi-look");
    await expect(look).toBeVisible();
    return look;
  }
  await tap(page, card.locator(`[data-look-tap="${id}"]`).first());
  const look = card.locator(`[data-look-slot="${id}"] .qi-look`);
  await expect(look).toBeVisible();
  return look;
}

test.describe("Off the clock: on the homepage", () => {
  test("training, the book, the film and Now making are rows under the note, in that order", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#off-the-clock");
    await expect(section.getByRole("heading", { level: 2, name: offTheClock.heading, exact: true })).toHaveCSS("font-size", "17px");
    await expect(section.locator(".qi-note-line")).toHaveText(offTheClock.note);
    const order = await section.locator(".qi-list [data-otc]").evaluateAll((items) => items.map((item) => item.getAttribute("data-otc")));
    // Now making comes down when GitHub cannot be reached, and the fixtures cover that.
    expect(order).toEqual(["training", "reading", "film", "making"].slice(0, order.length));
    expect(order.length).toBeGreaterThanOrEqual(3);
    // This week's oddity and the GitHub year are still cards until their own ticket turns them into rows.
    await expect(section.locator(".stretch-otc [data-otc='clipping']")).toHaveCount(1);
  });

  test("the rows are in the server-rendered section, and training names its plan until today is known", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.goto("/");
    const section = page.locator("section#off-the-clock");
    for (const item of ["training", "clipping", "reading", "film"]) await expect(section.locator(`[data-otc='${item}']`)).toHaveCount(1);
    await expect(title(section.locator("[data-otc='training']"))).toHaveText(offTheClock.training.week);
    await expect(line(section.locator("[data-otc='training']"))).toHaveText("");
  });
});

test.describe("Off the clock: Fasteners", () => {
  test("only the history clipping is fastened, with the GitHub card present", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    const layout = fixture(page, "layout");
    await expect(layout.locator("[data-otc='github']")).toHaveCount(1);
    await expect(layout.locator(".stretch-fastener")).toHaveCount(1);
    await expect(layout.locator("[data-otc='clipping'] .stretch-fastener--push-pin")).toHaveCount(1);
    for (const item of ["training", "reading", "film", "making", "github"]) await expect(layout.locator(`[data-otc='${item}'] .stretch-fastener`)).toHaveCount(0);
  });

  test("the homepage carries one Fastener: the clipping (the project tiles left with Things I make, the PRD card with How I work, the poster with this ticket)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".stretch-fastener")).toHaveCount(1);
    await expect(page.locator("#off-the-clock .stretch-fastener")).toHaveCount(1);
  });
});

test.describe("Off the clock: training", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  for (const [name, index, date] of [["monday", 0, "5"], ["saturday", 5, "3"], ["sunday", 6, "1"]] as const) {
    test(`today is ${days[index].long} in London (${name} fixture): its session is the row, on a tile with today's date`, async ({ page }) => {
      const row = fixture(page, `training-${name}`).locator("[data-otc='training']");
      await expect(title(row)).toHaveText(days[index].session);
      await expect(line(row)).toHaveText(offTheClock.training.rowLine);
      const tile = row.locator(".qi-tile");
      await expect(tile.locator(".qi-tile__number")).toHaveText(date);
      await expect(tile.locator(".qi-tile__band")).toHaveCSS("background-color", await token(page, "--stretch-cobalt"));
    });

    test(`${name}: the week fills in with today marked once and in cobalt, and the list carries the week for assistive technology`, async ({ page }) => {
      const look = await openLook(page, `training-${name}`, "training");
      const rows = look.locator(".qi-week__days li");
      await expect(rows).toHaveCount(7);
      for (const [position, day] of days.entries()) await expect(rows.nth(position)).toContainText(day.session);
      await expect(look.locator(".qi-week__days li[data-today]")).toHaveCount(1);
      await expect(rows.nth(index)).toHaveAttribute("data-today", "");
      await expect(rows.nth(index)).toHaveAttribute("aria-current", "date");
      await expect(rows.nth(index)).toHaveCSS("color", await token(page, "--stretch-cobalt"));
      // The fixtures page holds several training rows, each with the id the live page has once, so the description is read inside its own fixture.
      const row = fixture(page, `training-${name}`);
      const description = await row.locator("[data-look='training']").getAttribute("aria-describedby");
      const spoken = await row.locator(`#${description}`).textContent();
      for (const day of days) expect(spoken).toContain(`${day.long}: ${day.session}.`);
    });
  }

  test("the look carries the run's photo and its caption", async ({ page }) => {
    const look = await openLook(page, "training-saturday", "training");
    await expect(look.locator(".qi-week__photo img")).toBeVisible();
    await expect(look.getByText(offTheClock.training.photoCaption)).toBeVisible();
  });

  test("today fills in last", async ({ page }) => {
    const look = await openLook(page, "training-saturday", "training");
    const delays = await look.locator(".qi-week__days li").evaluateAll((items) => items.map((item) => parseFloat(getComputedStyle(item).animationDelay)));
    expect(delays.at(5)).toBeGreaterThan(Math.max(...delays.filter((_, position) => position !== 5)));
  });
});

test.describe("Off the clock: the book and the film", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  test("the book is a row: cover, title, Now reading, author and a live mark, linking to Goodreads", async ({ page }) => {
    const row = fixture(page, "book").locator("[data-otc='reading']");
    await expect(row.locator(".qi-cover img")).toBeVisible();
    await expect(title(row)).toHaveText("Dark Age");
    await expect(line(row)).toContainText(`${offTheClock.reading.label} · Pierce Brown · ${offTheClock.live("Goodreads")}`);
    await expect(row.locator("[data-now-mark]")).toHaveCount(1);
    await expect(links(row)).toHaveAttribute("href", /goodreads\.com/);
    await expect(links(row)).toHaveAttribute("target", "_blank");
  });

  test("the cover lifts off a row of spines, then the title and author", async ({ page }) => {
    const look = await openLook(page, "book", "book");
    await expect(look.locator(".qi-spine")).toHaveCount(6);
    await expect(look.locator(".qi-pluck img")).toBeVisible();
    await expect(look.getByText("Dark Age", { exact: true })).toBeVisible();
    await expect(look.getByText("Pierce Brown", { exact: true })).toBeVisible();
  });

  for (const name of ["book-empty", "book-unfetched"]) {
    test(`${name}: written fallback in the book's shape, with nothing to open`, async ({ page }) => {
      const row = fixture(page, name).locator("[data-otc='reading']");
      await expect(title(row)).toHaveText(offTheClock.reading.fallback);
      await expect(row.locator(".qi-cover[data-blank]")).toBeVisible();
      await expect(links(row)).toHaveCount(0);
      await expect(row.locator("[data-look]")).toHaveCount(0);
      await expect(row.locator("[data-now-mark]")).toHaveCount(0);
    });
  }

  test("a stale book says when its data is from, and has no live dot; a live one does not say it", async ({ page }) => {
    const stale = fixture(page, "book-stale");
    await expect(line(stale)).toContainText(offTheClock.fromAsOf("Goodreads", "2 Aug"));
    await expect(stale.locator("[data-now-mark]")).toHaveCount(0);
    await expect(fixture(page, "book")).not.toContainText("as of");
  });

  test("the film is a row: poster, title, Last watched with its date and stars, a live mark, linking to Letterboxd", async ({ page }) => {
    const row = fixture(page, "film").locator("[data-otc='film']");
    await expect(row.locator(".qi-cover img")).toBeVisible();
    await expect(title(row)).toHaveText("The Invite");
    await expect(row.getByText("Last watched 14 Sept · ★★★★½")).toBeVisible();
    await expect(row.getByText("Last watched 14 September, rated 4.5 out of 5")).toBeAttached();
    await expect(line(row)).toContainText(offTheClock.live("Letterboxd"));
    await expect(links(row)).toHaveAttribute("href", /letterboxd\.com/);
  });

  test("the ticket: Admit one, the poster, title, year and date, the stars, and a stub that tears off", async ({ page }) => {
    const look = await openLook(page, "film", "film");
    await expect(look.locator(".qi-ticket__poster")).toBeVisible();
    await expect(look.locator(".qi-ticket__stub")).toHaveText(offTheClock.watched.kicker);
    await expect(look.getByText("The Invite", { exact: true })).toBeVisible();
    await expect(look.getByText("2026 · Watched 14 Sept")).toBeVisible();
    await expect(look.locator(".qi-stars span")).toHaveCount(5);
    await expect(look.locator(".qi-stars span").last()).toHaveText("½");
  });

  test("a long film title wraps in its row, the date and rating stay together, and the link carries the whole title", async ({ page }) => {
    const row = fixture(page, "film-long").locator("[data-otc='film']");
    const name = "The Assassination of Jesse James by the Coward Robert Ford";
    await expect(title(row)).toHaveText(name);
    await expect(row.locator(".qi-row__line [aria-hidden='true']:not([data-now-mark])")).toHaveText(/\u00a0·\u00a0★★★½$/);
    await expect(links(row)).toHaveAccessibleName(new RegExp(name));
  });

  test("an empty diary shows the written fallback in the poster's shape, with nothing to open", async ({ page }) => {
    const row = fixture(page, "film-empty").locator("[data-otc='film']");
    await expect(title(row)).toHaveText(offTheClock.watched.fallback);
    await expect(row.locator(".qi-cover[data-blank]")).toBeVisible();
    await expect(links(row)).toHaveCount(0);
    await expect(row.locator("[data-look]")).toHaveCount(0);
  });

  test("a film without a poster or rating keeps its row and shows only what it has", async ({ page }) => {
    const row = fixture(page, "film-unrated").locator("[data-otc='film']");
    await expect(row.locator(".qi-cover[data-blank]")).toBeVisible();
    await expect(title(row)).toHaveText("The Invite");
    await expect(row.getByText(/★/)).toHaveCount(0);
    await expect(row.getByText("Last watched 14 Sept", { exact: true })).toBeVisible();
    const look = await openLook(page, "film-unrated", "film");
    await expect(look.locator(".qi-ticket__poster")).toHaveCount(0);
    await expect(look.locator(".qi-stars")).toHaveCount(0);
  });

  test("a stale film says when its data is from", async ({ page }) => {
    await expect(line(fixture(page, "film-stale"))).toContainText(offTheClock.fromAsOf("Letterboxd", "2 Aug"));
    await expect(fixture(page, "film-stale").locator("[data-now-mark]")).toHaveCount(0);
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

  test("a repository that is not a project is a row: its name, Now making, GitHub's description and a live mark, linked to GitHub", async ({ page }) => {
    const row = fixture(page, "making").locator("[data-otc='making']");
    await expect(title(row)).toHaveText("eliasb.dev");
    await expect(line(row)).toContainText(`${nowMaking.label} · Personal site for Elias B. · ${offTheClock.live("GitHub")}`);
    await expect(links(row)).toHaveAttribute("href", "https://github.com/3ixas/eliasb.dev");
    await expect(row.locator("[data-now-mark]")).toHaveCSS("background-color", await token(page, "--stretch-cobalt"));
    await expect(row.locator(".qi-dot")).toHaveCSS("background-color", await token(page, "--stretch-cobalt"));
  });

  test("its closer look types the description itself", async ({ page }) => {
    const look = await openLook(page, "making", "making");
    await expect(look.getByText("eliasb.dev", { exact: true })).toBeVisible();
    await expect.poll(() => look.locator(".qi-look__by").innerText()).toBe("Personal site for Elias B.");
  });

  test("with no description it is a row with no closer look", async ({ page }) => {
    const row = fixture(page, "making-no-description").locator("[data-otc='making']");
    await expect(title(row)).toHaveText("eliasb.dev");
    await expect(line(row)).not.toContainText("Personal site");
    await expect(row.locator("[data-look]")).toHaveCount(0);
    await expect(links(row)).toHaveAttribute("href", "https://github.com/3ixas/eliasb.dev");
  });

  test("a project with a case study shows the project's name, linked to the case study", async ({ page }) => {
    const row = fixture(page, "making-project").locator("[data-otc='making']");
    await expect(links(row)).toHaveCount(1);
    await expect(title(row)).toHaveText("Threshold");
    await expect(links(row)).toHaveAttribute("href", "/things-i-make/threshold");
    await expect(links(row)).not.toHaveAttribute("target", /.+/);
    await expect(row.getByText("A repository description")).toHaveCount(0);
  });

  test("a project without a case study shows the project's name, linked to GitHub", async ({ page }) => {
    const row = fixture(page, "making-project-code").locator("[data-otc='making']");
    await expect(title(row)).toHaveText("Risk Event Tracker");
    await expect(links(row)).toHaveAttribute("href", "https://github.com/3ixas/risk-event-tracker");
  });

  test("with no repository the row is gone", async ({ page }) => {
    await expect(fixture(page, "making-none").locator("[data-otc]")).toHaveCount(0);
  });
});

test.describe("Off the clock: reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  // Every closer look fades in over 0.2 s and nothing arrives with motion (docs/design/DESIGN.md, "Reduced motion").
  for (const [name, id, moving] of [
    ["training-saturday", "training", ".qi-week__days li"],
    ["book", "book", ".qi-pluck"],
    ["film", "film", ".qi-ticket, .qi-stars span, .qi-ticket__stub"],
  ] as const) {
    test(`${id}: its look fades in and nothing in it moves`, async ({ page }) => {
      const look = await openLook(page, name, id);
      await expect(look).toHaveCSS("animation-duration", "0.2s");
      for (const element of await look.locator(moving).all()) await expect(element).toHaveCSS("animation-name", "none");
    });
  }

  test("making: its description is there whole, with no typing", async ({ page }) => {
    const look = await openLook(page, "making", "making");
    await expect(look.locator(".qi-look__by")).toHaveText("Personal site for Elias B.");
    await expect(look.locator(".qi-caret")).toBeHidden();
  });
});

test.describe("Off the clock: the list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  test("a row is 68 px or more with a 44 px object, and the text starts at one edge down the list", async ({ page }) => {
    const edges = new Set<number>();
    for (const row of await fixture(page, "layout").locator(".qi-row").all()) {
      const box = (await row.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(68);
      const object = (await row.locator(".qi-row__object").boundingBox())!;
      expect([object.width, object.height]).toEqual([44, 44]);
      edges.add(Math.round((await row.locator(".qi-row__text").boundingBox())!.x));
    }
    expect(edges.size, "every row's text starts at the same edge").toBe(1);
  });

  test("only the rows that are links, or have a closer look, take focus", async ({ page }) => {
    const layout = fixture(page, "layout");
    await expect(layout.locator(".qi-list [tabindex]:not([data-look])")).toHaveCount(0);
    await expect(layout.locator(".qi-list a")).toHaveCount(3);
  });
});

test.describe("Off the clock: the GitHub year", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  test("the composed calendar stays readable below both independent columns", async ({ page }) => {
    const layout = fixture(page, "layout");
    const grid = (await layout.locator(".stretch-otc").boundingBox())!;
    const calendar = (await layout.locator("[data-otc='github']").boundingBox())!;
    expect(calendar.x).toBeCloseTo(grid.x, 0);
    expect(calendar.width).toBeCloseTo(grid.width, 0);
    for (const column of await layout.locator(".stretch-otc__column").all()) {
      const box = (await column.boundingBox())!;
      expect(calendar.y).toBeGreaterThan(box.y + box.height);
    }
    const day = (await layout.locator("[data-github-days] button").first().boundingBox())!;
    expect(day.width).toBeGreaterThanOrEqual(6);
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

  test("on phones the busiest-stretch caption is pinned outside the scroller and the left edge fades", async ({ page }) => {
    test.skip(!phone(page), "the grid only scrolls on phones");
    const card = fixture(page, "github");
    const scroller = card.locator("[data-github-scroll]");
    const caption = card.locator(".stretch-gh__note");
    await expect(caption).toBeVisible();
    await expect(scroller.locator(".stretch-gh__note")).toHaveCount(0);
    const inView = async () => {
      const box = (await caption.boundingBox())!;
      const cardBox = (await card.boundingBox())!;
      return box.x >= cardBox.x - 1 && box.x + box.width <= cardBox.x + cardBox.width + 1;
    };
    await expect.poll(inView, { message: "caption is fully visible on open" }).toBe(true);
    await scroller.evaluate((el) => (el.scrollLeft = 0));
    await expect.poll(inView, { message: "caption is fully visible after scrolling" }).toBe(true);
    await expect(scroller).not.toHaveCSS("mask-image", "none");
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
      ".qi-row__title",
      ".qi-row__line",
      ".qi-source",
      ".stretch-otc__label",
      ".stretch-otc__kicker",
      ".stretch-otc__asof",
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
