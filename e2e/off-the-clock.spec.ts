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
  test("training, the GitHub year, the book, the film, the history row and Now making are in the list under the note, in that order", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#off-the-clock");
    await expect(section.getByRole("heading", { level: 2, name: offTheClock.heading, exact: true })).toHaveCSS("font-size", "17px");
    await expect(section.locator(".qi-note-line")).toHaveText(offTheClock.note);
    const order = await section.locator(".qi-list [data-otc]").evaluateAll((items) => items.map((item) => item.getAttribute("data-otc")));
    // The GitHub year and Now making come down when GitHub cannot be reached, and the fixtures cover that.
    const full = ["training", "github", "reading", "film", "history", "making"];
    expect(order).toEqual(full.filter((item) => order.includes(item)));
    expect(order.length).toBeGreaterThanOrEqual(4);
    await expect(section.locator("details, summary, .stretch-otc")).toHaveCount(0);
  });

  test("the list is in the server-rendered section, and training names its plan until today is known", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.goto("/");
    const section = page.locator("section#off-the-clock");
    for (const item of ["training", "history", "reading", "film"]) await expect(section.locator(`[data-otc='${item}']`)).toHaveCount(1);
    await expect(title(section.locator("[data-otc='training']"))).toHaveText(offTheClock.training.week);
    await expect(line(section.locator("[data-otc='training']"))).toHaveText("");
    await expect(title(section.locator("[data-otc='history']"))).toHaveText(offTheClock.curiosity.label);
  });
});

test.describe("Off the clock: Fasteners", () => {
  test("nothing in Off the clock is fastened: Fasteners retired with the cards", async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
    await expect(fixture(page, "layout").locator(".stretch-fastener")).toHaveCount(0);
  });

  test("the homepage carries no Fastener", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".stretch-fastener")).toHaveCount(0);
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

  test("on a touch screen tapping the film's row opens the ticket, and the ticket is the link to Letterboxd", async ({ page }) => {
    test.skip(wide(page), "the margin shows the look on hover; a click on the row follows its link");
    await hydrated(page);
    const card = fixture(page, "film");
    const row = card.locator("a[data-look-tap='film']");
    const look = card.locator("[data-look-slot='film'] .qi-look");
    // The tap opens the look and does not leave the page.
    await tap(page, row);
    await expect(look).toBeVisible();
    await expect(page).toHaveURL(/\/fixtures\/off-the-clock$/);
    // The ticket is a link out, in a new tab.
    await expect(card.locator("[data-look-slot='film'] a.qi-look-link")).toHaveAttribute("href", /letterboxd\.com/);
    await expect(card.locator("[data-look-slot='film'] a.qi-look-link")).toHaveAttribute("target", "_blank");
    // Tapping the row again closes it, and Enter on the link still follows it.
    await tap(page, row);
    await expect(look).toHaveCount(0);
    await row.focus();
    await page.context().route("**/letterboxd.com/**", (route) => route.fulfill({ body: "<title>Letterboxd</title>", contentType: "text/html" }));
    const popup = page.waitForEvent("popup");
    await page.keyboard.press("Enter");
    expect((await popup).url()).toMatch(/letterboxd\.com/);
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

test.describe("Off the clock: the history row", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  const rowOf = (page: Page, name: string) => fixture(page, name).locator("[data-otc='history']");
  /** Cycles the row the way the screen does it: a click, or a tap on a touch screen. */
  const cycle = async (page: Page, name: string) => {
    await hydrated(page);
    // On a wide screen a click on the row steps it on; on a phone the row opens and closes, and the clipping steps.
    if (wide(page)) await rowOf(page, name).locator("[data-look='history']").click();
    else await tap(page, rowOf(page, name).locator("[data-look-slot='history'] .qi-look"));
  };

  test("the row is a calendar tile, the title, a line that counts the week's oddities and a live Wikipedia mark", async ({ page }) => {
    const row = rowOf(page, "history-live");
    await expect(title(row)).toHaveText(offTheClock.curiosity.label);
    await expect(line(row)).toContainText(`${offTheClock.curiosity.rowLine(3)} · ${offTheClock.live("Wikipedia")}`);
    await expect(row.locator("[data-now-mark]")).toHaveCount(1);
    await expect(row.locator(".qi-tile__number")).toHaveText("28");
    await expect(row.locator("a")).toHaveCount(0);
    await expect(fixture(page, "history-week").locator("[data-now-mark]")).toHaveCount(0);
  });

  test("the look is the clipping stamped 'This week in history': date, fact, credit and which oddity it is", async ({ page }) => {
    const look = await openLook(page, "history-week", "history");
    await expect(look.locator(".qi-clipping__stamp")).toHaveText(offTheClock.curiosity.stamp);
    await expect(look.locator(".qi-clipping__date")).toHaveText("28 September 1924");
    await expect(look.locator(".qi-clipping__fact")).toHaveText("The first aerial circumnavigation is completed by a team from the US Army.");
    await expect(look.locator(".qi-clipping__figure img")).toBeVisible();
    await expect(look.locator(".qi-clipping__figure figcaption")).toHaveText("Image: The Museum of Flight · Public domain");
    await expect(look.locator(".qi-clipping__count")).toHaveText("1 of 3");
    await expect(look.getByRole("link")).toHaveCount(0);
    await expect(look.locator(".qi-clipping__stamp")).not.toHaveCSS("color", await token(page, "--stretch-cobalt"));
  });

  test("clicking the row (a phone: the clipping) swaps in the next oddity in place and wraps after the last", async ({ page }) => {
    const look = await openLook(page, "history-week", "history");
    const fact = look.locator(".qi-clipping__fact");
    await cycle(page, "history-week");
    await expect(fact).toHaveText(/^A cow wanders into a cathedral/);
    await expect(look.locator(".qi-clipping__count")).toHaveText("2 of 3");
    await expect(look.locator(".qi-clipping__figure")).toHaveCount(0);
    await cycle(page, "history-week");
    await expect(look.locator(".qi-clipping__date")).toHaveText("Born 28 September 1852");
    await expect(look.locator(".qi-clipping__count")).toHaveText("3 of 3");
    await cycle(page, "history-week");
    await expect(look.locator(".qi-clipping__count")).toHaveText("1 of 3");
    await expect(fact).toHaveText(/^The first aerial circumnavigation/);
    // Nothing opened or closed: it is the same look throughout.
    await expect(look).toBeVisible();
  });

  test("the keyboard steps the focused row on (Enter and Space on a wide screen, the arrows on a phone), and the change is announced politely", async ({ page }) => {
    await hydrated(page);
    const card = fixture(page, "history-week");
    const row = card.locator("[data-look='history']");
    await expect(row).toHaveAttribute("role", "button");
    const live = card.locator("[aria-live='polite']");
    await expect(live).toHaveText("");
    await row.focus();
    // On a phone Enter opens the look like any row, and the arrow keys step it on.
    if (!wide(page)) {
      await page.keyboard.press("Enter");
      await expect(card.locator("[data-look-slot='history'] .qi-look")).toBeVisible();
      await page.keyboard.press("ArrowRight");
    } else await page.keyboard.press("Enter");
    await expect(live).toHaveText(/^2 of 3\. 28 September 1781\. A cow wanders into a cathedral/);
    await page.keyboard.press(wide(page) ? "Space" : "ArrowDown");
    await expect(live).toHaveText(/^3 of 3\. Born 28 September 1852\. Henri Moissan/);
  });

  test("on a phone the arrow keys do nothing until the clipping is open", async ({ page }) => {
    test.skip(wide(page), "a wide screen steps with Enter and Space");
    await hydrated(page);
    const card = fixture(page, "history-week");
    await expect(card.locator("[data-look='history']")).toHaveAttribute("aria-keyshortcuts", "ArrowRight ArrowDown");
    await card.locator("[data-look='history']").focus();
    await page.keyboard.press("ArrowRight");
    await expect(card.locator("[aria-live='polite']")).toHaveText("");
    await page.keyboard.press("Enter");
    await expect(card.locator("[data-look-slot='history'] .qi-clipping__count")).toHaveText("1 of 3");
  });

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("the stamp lands again with each oddity", async ({ page }) => {
      const look = await openLook(page, "history-week", "history");
      await expect(look.locator(".qi-clipping__stamp")).toHaveCSS("animation-name", "qi-stamp");
      await cycle(page, "history-week");
      await expect(look.locator(".qi-clipping__count")).toHaveText("2 of 3");
      await expect(look.locator(".qi-clipping__stamp")).toHaveCSS("animation-name", "qi-stamp");
    });
  });

  test("a tall picture is cropped so the whole clipping fits a short window", async ({ page }) => {
    test.skip(!wide(page), "the fixed margin is for wide screens");
    await page.setViewportSize({ width: page.viewportSize()!.width, height: 600 });
    const look = await openLook(page, "history-saved", "history");
    await expect(look.locator(".qi-clipping__count")).toBeVisible();
    await expect
      .poll(async () => {
        const margin = (await page.locator(".qi-margin").boundingBox())!;
        return margin.y >= 0 && margin.y + margin.height <= 600;
      })
      .toBe(true);
  });

  test("with one oddity it is a plain row: the clipping, with nothing to cycle", async ({ page }) => {
    const card = fixture(page, "history-one");
    const row = card.locator("[data-look='history']");
    await expect(row).toHaveAttribute("role", "group");
    await expect(card.locator("[data-cycle]")).toHaveCount(0);
    await expect(card.locator("[aria-live]")).toHaveCount(0);
    const look = await openLook(page, "history-one", "history");
    await expect(look.locator(".qi-clipping__stamp")).toBeVisible();
    await expect(look.locator(".qi-clipping__count")).toHaveCount(0);
  });

  test("a text-only story has no picture, creator or licence and still reads whole", async ({ page }) => {
    const look = await openLook(page, "history-text-only", "history");
    await expect(look.locator(".qi-clipping__figure")).toHaveCount(0);
    await expect(look.locator(".qi-clipping__fact")).toHaveText(/^A cow wanders into a cathedral/);
    await expect(look.locator(".qi-clipping__date")).toHaveText("28 September 1781");
  });

  test("without a live week it is the archive, and says so", async ({ page }) => {
    const card = fixture(page, "history-saved");
    await expect(card.locator("[data-otc='history']")).toHaveAttribute("data-state", "archive");
    await expect(line(card)).toHaveText(offTheClock.curiosity.fallback);
    await expect(card.locator("[data-now-mark]")).toHaveCount(0);
    const look = await openLook(page, "history-saved", "history");
    await expect(look.locator(".qi-clipping__count")).toHaveText(/^1 of 3$/);
    const image = look.locator(".qi-clipping__figure img");
    await expect(image).toBeVisible();
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  });

  test("the hidden description lists every oddity for assistive technology", async ({ page }) => {
    const card = fixture(page, "history-week");
    const id = await card.locator("[data-look='history']").getAttribute("aria-describedby");
    const spoken = await card.locator(`#${id}`).textContent();
    expect(spoken).toContain("1 of 3. 28 September 1924. The first aerial circumnavigation");
    expect(spoken).toContain("3 of 3. Born 28 September 1852. Henri Moissan");
  });

  test("on a touch screen the row opens and closes the clipping, and only a tap on the clipping steps it on", async ({ page }) => {
    test.skip(wide(page), "the margin shows the look on hover; there is no tile button");
    await hydrated(page);
    const card = fixture(page, "history-week");
    const slot = card.locator("[data-look-slot='history'] .qi-look");
    await expect(slot).toHaveCount(0);
    await tap(page, card.locator("[data-look='history']"));
    await expect(slot).toBeVisible();
    await expect(slot.locator(".qi-clipping__count")).toHaveText("1 of 3");
    // The row's own taps never step it on: they close it, and open it again where it was.
    await tap(page, card.locator("[data-look='history']"));
    await expect(slot).toHaveCount(0);
    await tap(page, card.locator("[data-look='history']"));
    await expect(slot.locator(".qi-clipping__count")).toHaveText("1 of 3");
    // The clipping steps it on, wrapping after the last, and stays open.
    await tap(page, slot);
    await expect(slot.locator(".qi-clipping__count")).toHaveText("2 of 3");
    await tap(page, slot);
    await expect(slot.locator(".qi-clipping__count")).toHaveText("3 of 3");
    await expect(slot).toBeVisible();
    // The calendar tile's button closes it too.
    await tap(page, card.locator("button[data-look-tap='history']"));
    await expect(slot).toHaveCount(0);
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
    await expect(line(row)).toHaveText(`${nowMaking.label}\u00a0· ${offTheClock.live("GitHub")}`);
    // The description is said once, in the closer look, and is the row's accessible description.
    await expect(row.locator("[data-look]")).toHaveAccessibleDescription("Personal site for Elias B.");
    await expect(links(row)).toHaveAttribute("href", "https://github.com/3ixas/eliasb.dev");
    await expect(row.locator("[data-now-mark]")).toHaveCSS("background-color", await token(page, "--stretch-cobalt"));
    await expect(row.locator(".qi-brackets__slash")).toHaveCSS("stroke", await token(page, "--stretch-cobalt"));
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
    ["book", "book", ".qi-pluck, .qi-pluck__cover, .qi-book .qi-look__name, .qi-book .qi-look__by"],
    ["film", "film", ".qi-ticket, .qi-stars span, .qi-ticket__stub"],
    ["history-week", "history", ".qi-clipping, .qi-clipping__stamp"],
  ] as const) {
    test(`${id}: its look fades in and nothing in it moves`, async ({ page }) => {
      const look = await openLook(page, name, id);
      await expect(look).toHaveCSS("animation-duration", "0.2s");
      for (const element of await look.locator(moving).all()) await expect(element).toHaveCSS("animation-name", "none");
    });
  }

  test("book: nothing covers the cover, which is there from the first frame", async ({ page }) => {
    const look = await openLook(page, "book", "book");
    await expect(look.locator(".qi-pluck__cover img")).toBeVisible();
    // The cloth that starts it as a spine is cleared only by its animation, so with none it must not be drawn.
    expect(await look.locator(".qi-pluck__cover").evaluate((element) => getComputedStyle(element, "::after").display)).toBe("none");
    await expect(look.locator(".qi-book .qi-look__name, .qi-look__name")).toBeVisible();
  });

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
    // The GitHub year's days are its own focus targets (one tab stop), not rows.
    await expect(layout.locator(".qi-list > li:not(.qi-github) [tabindex]:not([data-look])")).toHaveCount(0);
    await expect(layout.locator(".qi-list a")).toHaveCount(3);
  });
});

test.describe("Off the clock: the GitHub year", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fixtures/off-the-clock");
  });

  const totalOf = async (card: Locator) => /: ([\d,]+)\.$/.exec((await card.locator("[data-github-days]").getAttribute("aria-label"))!)![1];

  test("sits second in the list, between training and the book, and is not a row", async ({ page }) => {
    const items = fixture(page, "layout").locator(".qi-list > li");
    await expect(items.nth(1)).toHaveAttribute("data-otc", "github");
    await expect(items.nth(1).locator(".qi-row")).toHaveCount(0);
    await expect(items.nth(2)).toHaveAttribute("data-otc", "reading");
    const day = (await fixture(page, "layout").locator("[data-github-days] button").first().boundingBox())!;
    expect(day.width).toBeGreaterThanOrEqual(6);
  });

  test("draws the year with a total, a text alternative and a Less / More key", async ({ page }) => {
    const card = fixture(page, "github");
    const days = card.locator("[data-github-days]");
    await expect(days.locator("button")).toHaveCount(365);
    await expect(days).toHaveAttribute("aria-label", /^GitHub contributions over the past year: [\d,]+\.$/);
    await expect(card.locator(".stretch-gh__total")).toContainText(`${await totalOf(card)} contributions in the past year`);
    await expect(card.locator(".stretch-gh__legend")).toContainText(`${offTheClock.github.legend.less}`);
    await expect(card.locator(".stretch-gh__legend")).toContainText(`${offTheClock.github.legend.more}`);
    await expect(card.locator(".stretch-gh__legend")).toContainText(offTheClock.github.legend.today);
    await expect(card.getByText(/busiest|swipe|Quiet|Busy/)).toHaveCount(0);
  });

  test("the five levels take GitHub's greens, and a day with none takes the empty tone", async ({ page }) => {
    const days = fixture(page, "github").locator("[data-github-days] button");
    for (const level of [0, 1, 2, 3, 4]) {
      await expect(days.locator(`xpath=self::*[@data-level='${level}' and not(@data-today)]`).first()).toHaveCSS("background-color", await token(page, `--gh-${level}`));
    }
  });

  test("today is the last day, ringed in cobalt, not filled, and marked once", async ({ page }) => {
    const card = fixture(page, "github");
    const today = card.locator("[data-github-days] button[data-today]");
    const cobalt = await token(page, "--stretch-cobalt");
    await expect(today).toHaveCount(1);
    await expect(today).toHaveAttribute("aria-current", "date");
    await expect(today).toHaveAttribute("aria-label", /2 Oct$/);
    await expect(today).not.toHaveCSS("background-color", cobalt);
    await expect(today).toHaveCSS("background-color", await token(page, `--gh-${await today.getAttribute("data-level")}`));
    await expect(today).toHaveCSS("box-shadow", new RegExp(cobalt.replace(/[()]/g, "\\$&")));
  });

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("the total counts up once, when it first comes into view, and ends on the real number", async ({ page }) => {
      await page.addInitScript(() => {
        const seen: string[] = [];
        Object.assign(window, { __counts: seen });
        new MutationObserver(() => {
          const count = document.querySelector("[data-fixture='github'] .stretch-gh__count");
          if (count?.textContent && seen.at(-1) !== count.textContent) seen.push(count.textContent);
        }).observe(document, { childList: true, subtree: true, characterData: true });
      });
      await page.goto("/fixtures/off-the-clock");
      await hydrated(page);
      const card = fixture(page, "github");
      const total = await totalOf(card);
      const counts = () => page.evaluate(() => (window as unknown as { __counts: string[] }).__counts);
      await card.locator(".stretch-gh__count").scrollIntoViewIfNeeded();
      // The finished total is there before it is seen; the count starts from 0 on arrival and ends back on it.
        await expect.poll(async () => {
          const seen = await counts();
          return seen.includes("0") && seen.at(-1) === total;
        }).toBe(true);
      const played = await counts();
      expect(played, "it started from nothing and passed through other numbers").toContain("0");
      expect(played.length).toBeGreaterThan(3);
      // Scrolling away and back does not play it again.
      await page.evaluate(() => scrollTo(0, 0));
      await card.locator(".stretch-gh__count").scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      expect(await counts()).toEqual(played);
    });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the total is complete at once and never counts", async ({ page }) => {
      const card = fixture(page, "github");
      const total = await totalOf(card);
      await hydrated(page);
      await card.locator(".stretch-gh__count").scrollIntoViewIfNeeded();
      await expect(card.locator(".stretch-gh__count")).toHaveText(total);
      await page.waitForTimeout(300);
      await expect(card.locator(".stretch-gh__count")).toHaveText(total);
    });
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

  test("every day names its count for assistive technology", async ({ page }) => {
    const labels = await fixture(page, "github").locator("[data-github-days] button").evaluateAll((days) => days.map((day) => day.getAttribute("aria-label")));
    expect(labels).toHaveLength(365);
    for (const label of labels) expect(label).toMatch(/^(Nothing on|\d+ contributions? on) \w{3} \d{1,2} \w+$/);
  });

  test("only one day is a tab stop, so the grid costs a keyboard user one Tab", async ({ page }) => {
    const stops = fixture(page, "github").locator("[data-github-days] button:not([tabindex='-1'])");
    await expect(stops).toHaveCount(1);
  });

  test("on phones the left edge fades", async ({ page }) => {
    test.skip(!phone(page), "the grid only scrolls on phones");
    await expect(fixture(page, "github").locator("[data-github-scroll]")).not.toHaveCSS("mask-image", "none");
  });

  test("a live year says so with the dot; a stale one says when its data is from; a missing year is gone", async ({ page }) => {
    await expect(fixture(page, "github-live").locator(".stretch-gh__total")).toContainText(offTheClock.live("GitHub"));
    await expect(fixture(page, "github-live").locator("[data-now-mark]")).toHaveCount(1);
    await expect(fixture(page, "github-stale").locator(".stretch-gh__total")).toContainText(offTheClock.fromAsOf("GitHub", "28 Sept"));
    await expect(fixture(page, "github-stale").locator("[data-now-mark]")).toHaveCount(0);
    await expect(fixture(page, "github").locator(".stretch-gh__total")).not.toContainText("as of");
    await expect(fixture(page, "github-unavailable").locator("[data-otc]")).toHaveCount(0);
  });

  test("on phones only the grid scrolls sideways, inside the column, and it opens on today", async ({ page }) => {
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
    await hydrated(page);
  });

  test("text passes WCAG 2.2 AA", async ({ page }) => {
    // The clipping's look is shown in the margin or the slot only while a row opens it, so open the history row first.
    await openLook(page, "history-week", "history");
    for (const selector of [
      ".qi-row__title",
      ".qi-row__line",
      ".qi-source",
      ".qi-clipping__stamp",
      ".qi-clipping__fact",
      ".qi-clipping__date",
      ".qi-clipping__figure figcaption",
      ".qi-clipping__count",
      ".stretch-gh__total",
      ".stretch-gh__months",
      ".stretch-gh__foot",
    ]) {
      for (const reading of await contrastOnPaper(page, selector)) expect(reading.ratio, `${selector}: ${reading.text}`).toBeGreaterThanOrEqual(4.5);
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
    await openLook(page, "history-week", "history");
    const results = await new AxeBuilder({ page }).include("main").analyze();
    expect(results.violations).toEqual([]);
  });
});
