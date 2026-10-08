import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  GITHUB_ACTIVITY_DAYS,
  bookFromGoodreads,
  datesForWindow,
  filmFromLetterboxd,
  mapContributionDays,
  latestRepository,
  londonWeekday,
} from "../src/integrations/signal-mappers.ts";
import { integrationConfig } from "../src/content/integration-config.ts";
import { asOfDate, pinStatus, staleAfterDays } from "../src/integrations/pin-rules.ts";
import { filmLine, isoWeek, stars, trainingSpoken, groupedNumber, makingNote, MAKING_CURRENT_DAYS } from "../src/content/board.ts";
import { ARROW_GAP, stringStretches } from "../src/components/board/journey-geometry.ts";
import { getHistorySignal, historyWeekStart, HISTORY_FALLBACK_EVENTS, selectHistoryEvents } from "../src/integrations/history.ts";
import {
  busiestStretch,
  contributionLevel,
  contributionTag,
  createContributionCalendar,
  formatContributionDate,
  moveContributionCalendarIndex,
} from "../src/components/site/contribution-calendar-model.ts";

const now = new Date("2026-09-16T12:00:00.000Z");
const historyNow = new Date("2026-09-24T12:00:00.000Z");
const historyPage = (title, imageName, width = 330, height = 220) => ({
  titles: { canonical: title },
  thumbnail: {
    source: `https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/${imageName}/330px-${imageName}`,
    width,
    height,
  },
});
const historyFixture = {
  selected: [
    {
      year: 2013,
      text: "Militants attack a shopping mall, killing dozens of people.",
      pages: [historyPage("Mall_attack", "Attack.jpg")],
    },
    {
      year: 2004,
      text: "American rock band Green Day released its seventh studio album, American Idiot.",
      pages: [{
        titles: { canonical: "American_Idiot" },
        thumbnail: { source: "https://upload.wikimedia.org/wikipedia/en/e/ed/American_Idiot_cover.png", width: 300, height: 300 },
      }],
    },
    {
      year: 2024,
      text: "An American rock band released a new studio album.",
      pages: [historyPage("New_album", "New_album.jpg")],
    },
  ],
  events: [
    {
      year: 1783,
      text: "The first living creatures to ride in a balloon were a sheep, a duck and a rooster. All three survived the flight at Versailles.",
      pages: [historyPage("Montgolfier_brothers", "Montgolfier_balloon.jpg")],
    },
    {
      year: 1933,
      text: "Salvador Lutteroth establishes Mexican professional wrestling.",
      pages: [historyPage("Salvador_Lutteroth", "Salvador_Lutteroth.jpg")],
    },
    {
      year: 2003,
      text: "The Galileo spacecraft was deliberately sent into Jupiter’s atmosphere, ending a 14-year mission and protecting its moons from possible contamination.",
      pages: [historyPage("Galileo_(spacecraft)", "Galileo_spacecraft.jpg")],
    },
    {
      year: 1937,
      text: "J.R.R. Tolkien’s The Hobbit is published for the first time.",
      pages: [historyPage("The_Hobbit", "The_Hobbit.jpg")],
    },
  ],
  births: [
    { year: 1866, text: "H. G. Wells, English writer (died 1946)", pages: [historyPage("H._G._Wells", "H_G_Wells.jpg", 330, 440)] },
    { year: 1912, text: "Chuck Jones, American animator", pages: [historyPage("Chuck_Jones", "Chuck_Jones.jpg")] },
  ],
  deaths: [{ year: 2024, text: "A popular musician dies", pages: [{ titles: { canonical: "Musician" } }] }],
  holidays: [{ year: null, text: "A seasonal observance", pages: [{ titles: { canonical: "Holiday" } }] }],
};

assert.equal(historyWeekStart(new Date("2026-09-27T23:59:59Z")).toISOString(), "2026-09-21T00:00:00.000Z");
assert.equal(historyWeekStart(new Date("2026-09-28T00:00:00Z")).toISOString(), "2026-09-28T00:00:00.000Z");

const selectedHistory = selectHistoryEvents(historyFixture, historyNow);
assert.deepEqual(selectedHistory.map(({ year }) => year), [1783, 1933, 2003]);
assert.deepEqual(selectedHistory.map(({ kind }) => kind), ["event", "event", "event"]);
assert.equal(new Set(selectedHistory.map(({ year }) => Math.floor((year - 1) / 100))).size, 3);
assert.ok(selectedHistory.some(({ year }) => year < 1900));
assert.equal(selectedHistory.some(({ kind }) => kind === "birth"), false, "A routine birthday should not be used to pad the story selection");
assert.equal(selectedHistory.every(({ sourceUrl }) => sourceUrl.startsWith("https://en.wikipedia.org/wiki/")), true);
assert.equal(selectedHistory.some(({ year, text }) => year === 2013 || /attack|killing/i.test(text)), false);
assert.equal(selectedHistory.some(({ year }) => year === 2024), false, "Recent entries should not crowd out older events");
assert.equal(selectedHistory.some(({ text }) => /Green Day|studio album/i.test(text)), false, "Routine album-release anniversaries should lose out to more distinctive stories");
assert.equal(selectHistoryEvents({ events: historyFixture.events.slice(1, 2) }, historyNow).length, 0, "A narrow feed should fall back rather than present three items from one century");
// Curation: an oddity beats a news headline from the same century, and the
// most surprising fact leads the clipping, with the others in date order.
const oddities = selectHistoryEvents({
  events: [
    { year: 1849, text: "The president signs a treaty with a neighbouring government.", pages: [historyPage("Treaty", "Treaty.jpg")] },
    { year: 1858, text: "A sheep becomes the first animal to cross the Channel by balloon.", pages: [historyPage("Balloon_sheep", "Balloon_sheep.jpg")] },
    { year: 1937, text: "J.R.R. Tolkien’s The Hobbit is published for the first time.", pages: [historyPage("The_Hobbit", "The_Hobbit.jpg")] },
    { year: 2003, text: "The Galileo spacecraft was deliberately sent into Jupiter’s atmosphere.", pages: [historyPage("Galileo_(spacecraft)", "Galileo.jpg")] },
  ],
}, historyNow);
assert.deepEqual(oddities.map(({ year }) => year), [1858, 1937, 2003], "The sheep beats the treaty, and leads");
assert.equal(selectHistoryEvents({
  events: [
    { year: 1810, text: "Parliament votes to declare independence and elect a president.", pages: [historyPage("Independence", "Independence.jpg")] },
    { year: 1937, text: "J.R.R. Tolkien’s The Hobbit is published for the first time.", pages: [historyPage("The_Hobbit", "The_Hobbit.jpg")] },
    { year: 2003, text: "The Galileo spacecraft was deliberately sent into Jupiter’s atmosphere.", pages: [historyPage("Galileo_(spacecraft)", "Galileo.jpg")] },
  ],
}, historyNow).length, 0, "A news headline doesn't make the cut, even to fill the clipping");

// The dateline's volume and number are the ISO week-year and week.
assert.deepEqual(isoWeek(new Date("2026-09-28T12:00:00Z")), { year: 2026, week: 40 });
assert.deepEqual(isoWeek(new Date("2026-01-01T12:00:00Z")), { year: 2026, week: 1 });
assert.deepEqual(isoWeek(new Date("2027-01-01T12:00:00Z")), { year: 2026, week: 53 });
assert.deepEqual(isoWeek(new Date("2024-12-30T12:00:00Z")), { year: 2025, week: 1 });

assert.deepEqual(HISTORY_FALLBACK_EVENTS.map(({ year }) => year), [1783, 1933, 2003]);
assert.equal(new Set(HISTORY_FALLBACK_EVENTS.map(({ year }) => Math.floor((year - 1) / 100))).size, 3);
assert.deepEqual(HISTORY_FALLBACK_EVENTS.map(({ sourceUrl }) => new URL(sourceUrl).hostname), ["airandspace.si.edu", "cmll.com", "www.jpl.nasa.gov"]);

const originalFetch = globalThis.fetch;
const historyRequestUrls = [];
const historyRequestCacheDurations = [];
const historyRequestAgents = [];
const commonsRequestTitles = [];
const commonsImageResponse = (title, { withoutLicense = false, licenseUrl = "https://creativecommons.org/licenses/by-sa/4.0/" } = {}) => new Response(JSON.stringify({
  query: {
    pages: [{
      title: `File:${title}`,
      imageinfo: [{
        thumburl: `https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/${title}/640px-${title}`,
        thumbwidth: 640,
        thumbheight: 426,
        thumbmime: "image/jpeg",
        descriptionurl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title)}`,
        extmetadata: {
          ObjectName: { value: `<i>${title.replaceAll("_", " ")}</i>` },
          Artist: { value: '<a href="https://commons.wikimedia.org/wiki/User:Example">Ada Example</a>' },
          ...(!withoutLicense ? {
            LicenseShortName: { value: "CC BY-SA 4.0" },
            LicenseUrl: { value: licenseUrl },
          } : {}),
        },
      }],
    }],
  },
}), { status: 200 });
try {
  globalThis.fetch = async (input, options) => {
    const url = new URL(String(input));
    historyRequestUrls.push(url.href);
    historyRequestCacheDurations.push(options.next.revalidate);
    historyRequestAgents.push(options.headers["User-Agent"]);
    if (url.hostname === "commons.wikimedia.org") {
      const title = url.searchParams.get("titles").replace(/^File:/, "");
      commonsRequestTitles.push(title);
      return commonsImageResponse(title);
    }
    const feedName = url.pathname.split("/").at(-3);
    return new Response(JSON.stringify({ [feedName]: historyFixture[feedName] }), { status: 200 });
  };
  const liveHistory = await getHistorySignal(historyNow);
  const feedRequests = historyRequestUrls.filter((requestUrl) => new URL(requestUrl).hostname === "en.wikipedia.org");
  const imageRequests = historyRequestUrls.filter((requestUrl) => new URL(requestUrl).hostname === "commons.wikimedia.org");
  assert.deepEqual(feedRequests.map((requestUrl) => new URL(requestUrl).pathname.split("/").at(-3)).sort(), ["births", "events", "selected"]);
  assert.equal(imageRequests.length, 3);
  assert.equal(imageRequests.every((requestUrl) => new URL(requestUrl).searchParams.get("iiextmetadatafilter") === "ObjectName|Artist|LicenseShortName|LicenseUrl"), true);
  assert.equal(historyRequestCacheDurations.every((seconds) => seconds === 604800), true);
  assert.ok(historyRequestAgents.every((agent) => agent === "EliasBHistory/1.0 (https://www.eliasb.dev/)"), "Feed and Commons requests must identify the site to Wikimedia");
  assert.deepEqual(commonsRequestTitles.sort(), ["Galileo_spacecraft.jpg", "Montgolfier_balloon.jpg", "Salvador_Lutteroth.jpg"]);
  // The source is the readable page for the day, never the feed's raw JSON.
  assert.equal(liveHistory.sourceUrl, "https://en.wikipedia.org/wiki/September_21");
  assert.equal(liveHistory.weekOf, "2026-09-21");
  assert.equal(liveHistory.events.every(({ image }) => image?.width === 640 && image?.height === 426), true);
  assert.deepEqual(liveHistory.events.map(({ year }) => year), [1783, 1933, 2003]);
  assert.equal(liveHistory.events.every(({ image }) => image?.creator === "Ada Example"), true);
  assert.equal(liveHistory.events.every(({ image }) => image?.licenseName === "CC BY-SA 4.0"), true);
  assert.equal(liveHistory.events.every(({ image }) => image?.sourceUrl.startsWith("https://commons.wikimedia.org/wiki/File:")), true);
  assert.equal(liveHistory.events.every(({ image }) => image?.src.startsWith("https://upload.wikimedia.org/wikipedia/commons/")), true);
  assert.equal(liveHistory.events.every(({ image }) => image?.licenseUrl === "https://creativecommons.org/licenses/by-sa/4.0/"), true);
  assert.equal(liveHistory.events.every(({ image }) => image?.alt.length > 0 && !image.alt.includes("<")), true);

  for (const failedFeed of ["births", "selected"]) {
    globalThis.fetch = async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "commons.wikimedia.org") return commonsImageResponse(url.searchParams.get("titles").replace(/^File:/, ""));
      const feedName = url.pathname.split("/").at(-3);
      if (feedName === failedFeed) return new Response(null, { status: 503 });
      return new Response(JSON.stringify({ [feedName]: historyFixture[feedName] }), { status: 200 });
    };
    const availableHistory = await getHistorySignal(historyNow);
    assert.equal(availableHistory.state, "live", `A failed ${failedFeed} feed must not discard three valid stories`);
    assert.equal(availableHistory.events.length, 3);
    assert.ok(availableHistory.events.every(({ image }) => image), "Available stories must retain their licensed images");
  }

  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    if (url.hostname === "commons.wikimedia.org") {
      const title = url.searchParams.get("titles").replace(/^File:/, "");
      if (title === "Galileo_spacecraft.jpg") return new Response(JSON.stringify({ query: { pages: [{ missing: true }] } }), { status: 200 });
      if (title === "Montgolfier_balloon.jpg") return commonsImageResponse(title, { withoutLicense: true });
      return commonsImageResponse(title);
    }
    const feedName = url.pathname.split("/").at(-3);
    return new Response(JSON.stringify({ [feedName]: historyFixture[feedName] }), { status: 200 });
  };
  const textOnlyHistory = await getHistorySignal(historyNow);
  assert.equal(textOnlyHistory.state, "live", "A missing image should not hide a valid story or turn the feed into a fallback");
  assert.equal(textOnlyHistory.events.find(({ year }) => year === 2003).image, undefined, "A missing Commons file should leave its story text-only");
  assert.equal(textOnlyHistory.events.find(({ year }) => year === 1783).image, undefined, "Missing license metadata should leave its story text-only");
  assert.equal(textOnlyHistory.events.filter(({ image }) => image).length, 1);
  assert.equal(textOnlyHistory.events[0].year, 1933, "The fact with a picture leads when the most surprising has none");
  assert.deepEqual(textOnlyHistory.events.slice(1).map(({ year }) => year), [1783, 2003], "The rest follow in date order");

  // A fact's picture comes from its own subject's page or not at all: never a
  // flag, map or logo, and never a picture from a page further down the list.
  const unrelatedPictures = structuredClone(historyFixture);
  unrelatedPictures.events[0].pages = [{ titles: { canonical: "Montgolfier_brothers" } }, historyPage("France", "Flag_of_France.svg")];
  unrelatedPictures.events[1].pages = [historyPage("Salvador_Lutteroth", "Locator_map_of_Mexico.png")];
  const unrelatedRequests = [];
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    if (url.hostname === "commons.wikimedia.org") {
      const title = url.searchParams.get("titles").replace(/^File:/, "");
      unrelatedRequests.push(title);
      return commonsImageResponse(title);
    }
    const feedName = url.pathname.split("/").at(-3);
    return new Response(JSON.stringify({ [feedName]: unrelatedPictures[feedName] }), { status: 200 });
  };
  const unrelatedHistory = await getHistorySignal(historyNow);
  assert.deepEqual(unrelatedRequests, ["Galileo_spacecraft.jpg"], "Only the subject's own picture is fetched");
  assert.equal(unrelatedHistory.events.find(({ year }) => year === 1783).image, undefined, "A picture from another page leaves the fact text-only");
  assert.equal(unrelatedHistory.events.find(({ year }) => year === 1783).sourceUrl, "https://en.wikipedia.org/wiki/Montgolfier_brothers");
  assert.equal(unrelatedHistory.events.find(({ year }) => year === 1933).image, undefined, "A locator map leaves the fact text-only");

  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    if (url.hostname === "commons.wikimedia.org") {
      const title = url.searchParams.get("titles").replace(/^File:/, "");
      return commonsImageResponse(title, { licenseUrl: "https://creativecommons.org.attacker.example/license" });
    }
    const feedName = url.pathname.split("/").at(-3);
    return new Response(JSON.stringify({ [feedName]: historyFixture[feedName] }), { status: 200 });
  };
  const untrustedLicenseHistory = await getHistorySignal(historyNow);
  assert.equal(untrustedLicenseHistory.events.every(({ image }) => image?.licenseUrl === null), true, "An untrusted license host should link to the Commons file record instead");

  globalThis.fetch = async (input) => {
    const feedName = new URL(String(input)).pathname.split("/").at(-3);
    if (feedName === "events") return new Response(null, { status: 503 });
    return new Response(JSON.stringify({ [feedName]: historyFixture[feedName] }), { status: 200 });
  };
  const partialHistory = await getHistorySignal(historyNow);
  assert.equal(partialHistory.state, "curated", "Insufficient stories after a feed failure should not be labelled live");
  assert.equal(partialHistory.weekOf, null, "Saved examples belong to no week");

  globalThis.fetch = async (input) => {
    const feedName = new URL(String(input)).pathname.split("/").at(-3);
    const items = feedName === "events" ? [] : historyFixture[feedName];
    return new Response(JSON.stringify({ [feedName]: items }), { status: 200 });
  };
  const emptyHistory = await getHistorySignal(historyNow);
  assert.equal(emptyHistory.state, "curated", "Insufficient stories after an empty feed should not be labelled live");

  globalThis.fetch = async (input) => {
    const feedName = new URL(String(input)).pathname.split("/").at(-3);
    const items = feedName === "events" ? [{}] : historyFixture[feedName];
    return new Response(JSON.stringify({ [feedName]: items }), { status: 200 });
  };
  const malformedHistory = await getHistorySignal(historyNow);
  assert.equal(malformedHistory.state, "curated", "Insufficient source-linked stories should not be labelled live");

  globalThis.fetch = async (input) => {
    const feedName = new URL(String(input)).pathname.split("/").at(-3);
    const narrowHistoryFixture = {
      events: [historyFixture.events[1]],
      selected: [],
      births: [historyFixture.births[1]],
    };
    return new Response(JSON.stringify({ [feedName]: narrowHistoryFixture[feedName] }), { status: 200 });
  };
  const insufficientHistory = await getHistorySignal(historyNow);
  assert.equal(insufficientHistory.state, "curated");

  globalThis.fetch = async () => { throw new Error("simulated Wikimedia outage"); };
  const savedHistory = await getHistorySignal(historyNow);
  assert.equal(savedHistory.state, "curated");
  assert.equal(savedHistory.weekOf, null);
  assert.equal(savedHistory.sourceUrl, "https://en.wikipedia.org/wiki/Portal:History");
  assert.deepEqual(savedHistory.events.map(({ year }) => year), [1783, 1933, 2003]);
} finally {
  globalThis.fetch = originalFetch;
}

// The book and film are live only: there are no saved copies to fall back on.

// Goodreads: the series suffix comes off, and the shelf date is the start date.
assert.deepEqual(
  bookFromGoodreads({
    title: "Dark Age (Red Rising Saga, #5)",
    author: "Pierce Brown",
    dateAdded: "Mon, 14 Sep 2026 03:52:45 -0700",
    coverUrl: "https://i.gr-assets.com/cover.jpg",
  }),
  { title: "Dark Age", author: "Pierce Brown", startedAt: "2026-09-14T10:52:45.000Z", coverUrl: "https://i.gr-assets.com/cover.jpg" },
);
assert.equal(bookFromGoodreads({ title: "Dark Age", author: "Pierce Brown", dateAdded: "not a date" }).startedAt, null);
assert.equal(bookFromGoodreads({ title: "Dark Age", author: "Pierce Brown" }).coverUrl, null);
assert.equal(bookFromGoodreads({ title: "Dark Age" }), null);
assert.equal(bookFromGoodreads({ author: "Pierce Brown" }), null);

// Letterboxd: half-star ratings and the diary date, or nothing where they're missing or malformed.
const letterboxdProfile = "https://letterboxd.com/3lxas/";
assert.deepEqual(
  filmFromLetterboxd(
    { title: "The Invite", year: "2026", rating: "4.0", watchedDate: "2026-09-14", posterUrl: "https://a.ltrbxd.com/p.jpg", href: "https://letterboxd.com/3lxas/film/the-invite/" },
    letterboxdProfile,
  ),
  { title: "The Invite", year: "2026", rating: 4, watchedOn: "2026-09-14", posterUrl: "https://a.ltrbxd.com/p.jpg", href: "https://letterboxd.com/3lxas/film/the-invite/" },
);
const sparseFilm = filmFromLetterboxd({ title: "Unrated", rating: "", watchedDate: "14 Sept" }, letterboxdProfile);
assert.deepEqual(sparseFilm, { title: "Unrated", year: null, rating: null, watchedOn: null, posterUrl: null, href: letterboxdProfile });
assert.equal(filmFromLetterboxd({ title: "Odd", rating: "7" }, letterboxdProfile).rating, null);
assert.equal(filmFromLetterboxd({ title: "Half", rating: "0.5" }, letterboxdProfile).rating, 0.5);
assert.equal(filmFromLetterboxd({ title: " " }, letterboxdProfile), null);

// The ticket's line, shown and spoken.
assert.equal(stars(4), "★★★★");
assert.equal(stars(4.5), "★★★★½");
assert.equal(stars(0.5), "½");
const watched = { short: "14 Sept", long: "14 September" };
assert.deepEqual(filmLine(watched, 4), { shown: "Watched 14 Sept · ★★★★", spoken: "Watched 14 September, rated 4 out of 5" });
assert.deepEqual(filmLine(watched, 4.5), { shown: "Watched 14 Sept · ★★★★½", spoken: "Watched 14 September, rated 4.5 out of 5" });
assert.deepEqual(filmLine(watched, null), { shown: "Watched 14 Sept", spoken: "Watched 14 September" });
assert.deepEqual(filmLine(null, 3), { shown: "★★★", spoken: "Rated 3 out of 5" });
assert.equal(filmLine(null, null), null);

// The fantasy, Sleeper and Spotify sources are gone, so no config for them is left.
assert.deepEqual(Object.keys(integrationConfig).sort(), ["github", "goodreads", "letterboxd"], "Only the live integrations keep configuration");

// Simulate a browser with different locale data. Calendar HTML must not depend
// on Intl at either render, otherwise React can replace the page during hydration.
const originalDateTimeFormat = Intl.DateTimeFormat;
try {
  Intl.DateTimeFormat = function () { throw new Error("Runtime locale formatting must not enter the calendar render"); };
  assert.equal(formatContributionDate("2025-09-28", { month: "short" }), "28 Sept 2025");
  assert.equal(formatContributionDate("2025-09-28", { month: "short", weekday: "short" }), "Sun, 28 Sept 2025");
  assert.equal(formatContributionDate("2025-09-28", { weekday: "long" }), "Sunday, 28 September 2025");
  assert.equal(createContributionCalendar([{ date: "2025-09-28", count: 0 }]).monthLabels[0].label, "Sept");
} finally {
  Intl.DateTimeFormat = originalDateTimeFormat;
}

assert.equal(GITHUB_ACTIVITY_DAYS, 365);
const contributionDays = datesForWindow(GITHUB_ACTIVITY_DAYS, now).map((day, index) => ({
  ...day,
  count: index === 100 ? 4 : day.count,
}));
const contributionCalendar = createContributionCalendar(contributionDays);
assert.ok(contributionCalendar);
assert.equal(contributionCalendar.days.length, 365);
assert.equal(contributionCalendar.weekCount, 53);
assert.equal(contributionCalendar.rows.flat().filter(Boolean).length, 365);
assert.equal(contributionCalendar.days[0].date, "2025-09-17");
assert.equal(contributionCalendar.days.at(-1)?.date, "2026-09-16");
assert.equal(contributionCalendar.rows.flat().find((day) => day?.count === 4)?.date, contributionDays[100].date);
assert.ok(contributionCalendar.monthLabels.length >= 12);
const labelEndByRow = new Map();
for (const { column, row, span } of contributionCalendar.monthLabels) {
  assert.ok(column >= (labelEndByRow.get(row) ?? 0), "Month labels on each row should not overlap");
  assert.ok(column + span <= contributionCalendar.weekCount, "Month labels should fit within the year grid");
  labelEndByRow.set(row, column + span);
}
const monthBoundaryCalendar = createContributionCalendar(
  datesForWindow(GITHUB_ACTIVITY_DAYS, new Date("2026-09-26T12:00:00.000Z")),
);
assert.ok(monthBoundaryCalendar);
const openingSeptember = monthBoundaryCalendar.monthLabels.find(({ column }) => column === 0);
const openingOctober = monthBoundaryCalendar.monthLabels.find(({ label }) => label === "Oct");
assert.ok(openingSeptember && openingOctober, "The calendar should label both opening months");
assert.notEqual(openingSeptember.row, openingOctober.row, "Closely spaced opening month labels should use separate rows");
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "ArrowLeft"), 93);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "ArrowRight"), 107);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "ArrowDown"), 101);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "ArrowUp"), 99);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "Home"), 95);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "End"), 101);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "Escape"), null);
assert.equal(createContributionCalendar([]), null);

// The plan's "today" is the day in London, Monday (0) to Sunday (6), through BST and GMT.
assert.equal(londonWeekday(new Date("2026-10-04T22:59:00Z")), 6, "Sunday 23:59 BST");
assert.equal(londonWeekday(new Date("2026-10-04T23:00:00Z")), 0, "Monday 00:00 BST, while it's still Sunday in UTC");
assert.equal(londonWeekday(new Date("2026-10-03T12:00:00Z")), 5, "Saturday");
assert.equal(londonWeekday(new Date("2026-11-01T23:30:00Z")), 6, "Sunday 23:30 GMT, after the clocks went back");
assert.equal(londonWeekday(new Date("2026-11-02T00:00:00Z")), 0, "Monday 00:00 GMT");

assert.deepEqual(
  mapContributionDays(
    [{ date: "2026-09-15", contributionCount: 4 }],
    3,
    now,
  ),
  [
    { date: "2026-09-14", count: 0 },
    { date: "2026-09-15", count: 4 },
    { date: "2026-09-16", count: 0 },
  ],
);

// GitHub: the busiest four weeks, worked out from the data, with "early", "mid" or "late".
const quietYear = datesForWindow(GITHUB_ACTIVITY_DAYS, new Date("2026-10-02T12:00:00Z")).map(({ date }) => ({ date, count: 0 }));
assert.equal(busiestStretch(createContributionCalendar(quietYear)), null, "A year with nothing in it has no busiest stretch");
const januaryYear = quietYear.map(({ date }) => ({ date, count: date >= "2026-01-04" && date <= "2026-01-31" ? 3 : date === "2026-06-10" ? 9 : 0 }));
const januaryStretch = busiestStretch(createContributionCalendar(januaryYear));
assert.equal(januaryStretch.total, 84, "Four full weeks of 3 a day beat one busy day");
assert.equal(januaryStretch.when, "mid-January");
assert.equal(januaryStretch.span, 4);
const tiedYear = quietYear.map(({ date }) => ({ date, count: date === "2025-11-03" || date === "2026-08-03" ? 5 : 0 }));
assert.equal(busiestStretch(createContributionCalendar(tiedYear)).when.endsWith("August"), true, "A tie goes to the most recent stretch");
const earlyYear = quietYear.map(({ date }) => ({ date, count: date >= "2026-03-01" && date <= "2026-03-07" ? 4 : 0 }));
assert.match(busiestStretch(createContributionCalendar(earlyYear)).when, /^(early|mid|late)-(February|March)$/);
// Day tags and month labels are written by the site, the same in every locale.
assert.equal(contributionTag({ date: "2026-01-15", count: 12 }), "12 contributions on Thu 15 Jan");
assert.equal(contributionTag({ date: "2026-01-15", count: 1 }), "1 contribution on Thu 15 Jan");
assert.equal(contributionTag({ date: "2026-01-15", count: 0 }), "Nothing on Thu 15 Jan");
assert.deepEqual([0, 1, 2, 3, 4, 40].map(contributionLevel), [0, 1, 2, 3, 4, 4]);
assert.deepEqual(createContributionCalendar(quietYear).monthLabels.map(({ label }) => label).filter((label) => /June|July/.test(label)), ["June", "July"]);
assert.equal(groupedNumber(1089), "1,089");
assert.equal(groupedNumber(175), "175");
assert.equal(groupedNumber(1234567), "1,234,567");

// Making: the authored entry for eight weeks, then my latest public repository, then nothing.
const repositories = [
  { name: "3ixas", html_url: "https://github.com/3ixas/3ixas", pushed_at: "2026-10-04T00:00:00Z" },
  { name: "a-fork", html_url: "https://github.com/3ixas/a-fork", pushed_at: "2026-10-03T12:00:00Z", fork: true },
  { name: "old-thing", html_url: "https://github.com/3ixas/old-thing", pushed_at: "2026-10-03T11:00:00Z", archived: true },
  { name: "eliasb.dev", description: "  The site  ", html_url: "https://github.com/3ixas/eliasb.dev", pushed_at: "2026-10-03T05:36:51Z" },
];
assert.deepEqual(latestRepository(repositories, "3ixas"), {
  name: "eliasb.dev", description: "The site", href: "https://github.com/3ixas/eliasb.dev", pushedAt: "2026-10-03T05:36:51Z",
}, "The profile repository, forks and archives are skipped");
assert.equal(latestRepository([{ name: "x", description: "", html_url: "https://github.com/3ixas/x", pushed_at: "2026-01-01T00:00:00Z" }], "3ixas").description, null);
assert.equal(latestRepository([], "3ixas"), null);
assert.equal(MAKING_CURRENT_DAYS, 56);
const written = new Date("2026-10-03T00:00:00Z").getTime();
const repo = latestRepository(repositories, "3ixas");
assert.equal(makingNote(new Date(written + 55 * 86_400_000), repo).kind, "authored");
assert.equal(makingNote(new Date(written + 56 * 86_400_000), repo).kind, "latest", "After eight weeks the entry is no longer now");
assert.equal(makingNote(new Date(written + 56 * 86_400_000), null), null, "With no entry and no repository, there's no pin");

// About's red string: one stretch per pair of pins, each stopping short of the next pin for its arrow.
assert.deepEqual(stringStretches([]), []);
assert.deepEqual(stringStretches([{ x: 10, y: 10 }]), []);
const stretches = stringStretches([{ x: 10, y: 0 }, { x: 200, y: 100 }, { x: 10, y: 200 }]);
assert.equal(stretches.length, 2);
assert.match(stretches[0], /^M 10\.0 0\.0 Q 140\.0 50\.0 /, "The first stretch bows to the right");
assert.match(stretches[1], /^M 200\.0 100\.0 Q 70\.0 150\.0 /, "The next bows to the other side");
const [endX, endY] = stretches[0].split(" ").slice(-2).map(Number);
assert.ok(Math.abs(Math.hypot(200 - endX, 100 - endY) - ARROW_GAP) < 0.2, "Each stretch stops short of its pin by the arrow's gap");

// The running photo carries no embedded metadata: its WebP has image data only, no EXIF or XMP.
const runningPhoto = readFileSync(new URL("../public/signals/running-central-london.webp", import.meta.url));
const webpChunks = [];
for (let offset = 12; offset + 8 <= runningPhoto.length; offset += 8 + runningPhoto.readUInt32LE(offset + 4) + (runningPhoto.readUInt32LE(offset + 4) % 2)) {
  webpChunks.push(runningPhoto.toString("ascii", offset, offset + 4));
}
assert.equal(runningPhoto.toString("ascii", 8, 12), "WEBP");
assert.deepEqual(webpChunks.filter((chunk) => ["EXIF", "XMP ", "ICCP"].includes(chunk)), [], "The running photo must not carry EXIF, XMP, or a colour profile");

// The plan reads once to screen readers, today first; it claims nothing about sessions done.
assert.equal(
  trainingSpoken(5),
  "My training week, the plan. Today, Saturday: zone 2, rower or bike. Monday: full-body gym. Tuesday: zone 2 run. Wednesday: full-body gym. Thursday: interval run. Friday: full-body gym. Sunday: assault bike intervals. Zone 2 means slow on purpose.",
);
assert.match(trainingSpoken(0), /^My training week, the plan\. Today, Monday: full-body gym\. Tuesday:/);

// Pin rules: nothing current is removed; saved data past its pin's limit is stale.
const pinNow = new Date("2026-10-02T12:00:00.000Z");
const daysAgo = (days) => new Date(pinNow.getTime() - days * 86_400_000).toISOString();
assert.deepEqual(pinStatus("reading", { state: "unavailable", updatedAt: null }, pinNow), { kind: "removed" });
assert.deepEqual(pinStatus("github", { state: "live", updatedAt: daysAgo(3) }, pinNow), { kind: "current" });
assert.deepEqual(pinStatus("github", { state: "live", updatedAt: daysAgo(10) }, pinNow), {
  kind: "stale",
  asOf: { iso: daysAgo(10), short: "22 Sept", long: "22 September" },
});
assert.equal(pinStatus("github", { state: "live", updatedAt: daysAgo(4) }, pinNow).kind, "stale");
assert.equal(pinStatus("github", { state: "live", updatedAt: daysAgo(2) }, pinNow).kind, "current");
assert.equal(pinStatus("reading", { state: "live", updatedAt: daysAgo(61) }, pinNow).kind, "stale");
assert.equal(pinStatus("film", { state: "live", updatedAt: daysAgo(59) }, pinNow).kind, "current");
// Authored, curated, and never-stale pins stay current however old they are.
for (const key of ["training", "making", "clipping"]) {
  assert.equal(staleAfterDays[key], null);
  assert.equal(pinStatus(key, { state: "live", updatedAt: daysAgo(400) }, pinNow).kind, "current");
}
assert.equal(pinStatus("github", { state: "curated", updatedAt: daysAgo(400) }, pinNow).kind, "current");
assert.equal(pinStatus("github", { state: "live", updatedAt: null }, pinNow).kind, "current");
assert.equal(pinStatus("github", { state: "live", updatedAt: "not a date" }, pinNow).kind, "current");
// "As of" dates are London days, the same in every locale.
assert.deepEqual(asOfDate(new Date("2026-03-01T00:30:00.000Z")), { iso: "2026-03-01T00:30:00.000Z", short: "1 Mar", long: "1 March" });
assert.equal(asOfDate(new Date("2026-06-30T23:30:00.000Z")).short, "1 July");
assert.equal(asOfDate(new Date("2026-09-12T09:00:00.000Z")).short, "12 Sept");

console.log("Signal contract checks passed.");
