import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  GITHUB_ACTIVITY_DAYS,
  datesForWindow,
  groupTrainingActivities,
  mapContributionDays,
  mapPublicActivity,
  startOfUtcWeek,
} from "../src/integrations/signal-mappers.ts";
import { integrationConfig } from "../src/content/integration-config.ts";
import { getHistorySignal, HISTORY_FALLBACK_EVENTS, selectHistoryEvents } from "../src/integrations/history.ts";
import { fantasySourceUnavailable, fantasyWeekUnavailable, signalFallbacks } from "../src/content/signal-fallbacks.ts";
import { FantasyMatchup } from "../src/components/site/fantasy-matchup.ts";
import { SignalPresentation } from "../src/components/site/signal-presentation.ts";
import {
  createContributionCalendar,
  moveContributionCalendarIndex,
} from "../src/components/site/contribution-calendar-model.ts";

const now = new Date("2026-09-16T12:00:00.000Z");
const signalStates = new Set(["live", "curated", "pending", "unavailable"]);
const sleeperHref = `https://sleeper.com/leagues/${integrationConfig.sleeper.leagueId}`;
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
assert.deepEqual(HISTORY_FALLBACK_EVENTS.map(({ year }) => year), [1783, 1933, 2003]);
assert.equal(new Set(HISTORY_FALLBACK_EVENTS.map(({ year }) => Math.floor((year - 1) / 100))).size, 3);
assert.deepEqual(HISTORY_FALLBACK_EVENTS.map(({ sourceUrl }) => new URL(sourceUrl).hostname), ["airandspace.si.edu", "cmll.com", "www.jpl.nasa.gov"]);

const originalFetch = globalThis.fetch;
const historyRequestUrls = [];
const historyRequestCacheDurations = [];
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
  assert.deepEqual(commonsRequestTitles.sort(), ["Galileo_spacecraft.jpg", "Montgolfier_balloon.jpg", "Salvador_Lutteroth.jpg"]);
  assert.match(liveHistory.sourceUrl, /\/feed\/onthisday\/all\/09\/21$/);
  assert.deepEqual(liveHistory.events.map(({ year }) => year), [1783, 1933, 2003]);
  assert.equal(liveHistory.events.every(({ image }) => image?.creator === "Ada Example"), true);
  assert.equal(liveHistory.events.every(({ image }) => image?.licenseName === "CC BY-SA 4.0"), true);
  assert.equal(liveHistory.events.every(({ image }) => image?.sourceUrl.startsWith("https://commons.wikimedia.org/wiki/File:")), true);
  assert.equal(liveHistory.events.every(({ image }) => image?.src.startsWith("https://upload.wikimedia.org/wikipedia/commons/")), true);
  assert.equal(liveHistory.events.every(({ image }) => image?.licenseUrl === "https://creativecommons.org/licenses/by-sa/4.0/"), true);
  assert.equal(liveHistory.events.every(({ image }) => image?.alt.length > 0 && !image.alt.includes("<")), true);

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
  assert.equal(partialHistory.state, "curated", "A failed required category should not be labelled as a live result");
  assert.equal(partialHistory.dateLabel, "Saved examples");

  globalThis.fetch = async (input) => {
    const feedName = new URL(String(input)).pathname.split("/").at(-3);
    const items = feedName === "events" ? [] : historyFixture[feedName];
    return new Response(JSON.stringify({ [feedName]: items }), { status: 200 });
  };
  const emptyHistory = await getHistorySignal(historyNow);
  assert.equal(emptyHistory.state, "curated", "An empty required category should not be labelled as a live result");

  globalThis.fetch = async (input) => {
    const feedName = new URL(String(input)).pathname.split("/").at(-3);
    const items = feedName === "events" ? [{}] : historyFixture[feedName];
    return new Response(JSON.stringify({ [feedName]: items }), { status: 200 });
  };
  const malformedHistory = await getHistorySignal(historyNow);
  assert.equal(malformedHistory.state, "curated", "A category without a source-linked item should not be labelled as live");

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
  assert.equal(insufficientHistory.description, "");

  globalThis.fetch = async () => { throw new Error("simulated Wikimedia outage"); };
  const savedHistory = await getHistorySignal(historyNow);
  assert.equal(savedHistory.state, "curated");
  assert.equal(savedHistory.headline, "A few curious turns");
  assert.equal(savedHistory.dateLabel, "Saved examples");
  assert.deepEqual(savedHistory.events.map(({ year }) => year), [1783, 1933, 2003]);
  assert.equal(savedHistory.description, "");
} finally {
  globalThis.fetch = originalFetch;
}

assert.equal(signalFallbacks.fantasy.href ?? null, null);
assert.equal(signalFallbacks.reading.statusLabel, "Last on Goodreads");
assert.equal(signalFallbacks.reading.bookDescription, "");
assert.equal(signalFallbacks.culture.statusLabel, "Last logged");
assert.equal(signalFallbacks.culture.description, "");

/** @type {import("../src/integrations/types.ts").FantasySignal} */
const fantasyLiveSignal = {
  ...signalFallbacks.fantasy,
  state: "live",
  statusLabel: "Live",
  headline: "1–0 this season",
  description: "",
  matchupLabel: "Week 1",
  teamScore: 112.4,
  opponentScore: 98.7,
  updatedAt: "2026-09-22T12:00:00.000Z",
  href: sleeperHref,
};

/** @type {import("../src/integrations/types.ts").FantasySignal} */
const fantasyPendingSignal = signalFallbacks.fantasy;
const fantasyWeekUnavailableSignal = fantasyWeekUnavailable(sleeperHref);
const fantasySourceUnavailableSignal = fantasySourceUnavailable(sleeperHref, 3);

const signalPresentationFixtures = [
  {
    name: "fantasy-live",
    signal: fantasyLiveSignal,
    source: { label: "Sleeper", href: sleeperHref },
    expected: { status: "Live", freshness: "Updated 22 Sep", source: "Sleeper" },
  },
  {
    name: "cached",
    signal: { state: "live", statusLabel: "Wikimedia · cached", updatedAt: null },
    source: { label: "Wikimedia", href: "https://en.wikipedia.org/wiki/Portal:History" },
    expected: { status: "Wikimedia · cached", source: "Wikimedia" },
  },
  {
    name: "authored",
    signal: { state: "curated", statusLabel: "Typical week", updatedAt: null },
    source: { label: "My weekly plan", href: null },
    expected: { status: "Typical week", source: "My weekly plan" },
  },
  {
    name: "fantasy-pending",
    signal: fantasyPendingSignal,
    source: { label: "Sleeper", href: null },
    expected: { status: "No matchup just yet", source: "Sleeper" },
  },
  {
    name: "fantasy-source-unavailable",
    signal: fantasySourceUnavailableSignal,
    source: { label: "Sleeper", href: sleeperHref },
    expected: { status: "No live update from Sleeper", source: "Sleeper" },
  },
  {
    name: "unavailable",
    signal: { state: "unavailable", statusLabel: "Public only", updatedAt: null },
    source: { label: "GitHub activity", href: signalFallbacks.github.href },
    expected: { status: "Public only", source: "GitHub activity" },
  },
];

assert.deepEqual(signalPresentationFixtures.map(({ name }) => name), ["fantasy-live", "cached", "authored", "fantasy-pending", "fantasy-source-unavailable", "unavailable"]);
for (const fixture of signalPresentationFixtures) {
  assert.ok(signalStates.has(fixture.signal.state), `${fixture.name} fixture should use a shared signal state`);
  const markup = renderToStaticMarkup(createElement(SignalPresentation, {
    signal: fixture.signal,
    source: fixture.source,
  }));
  const visibleText = markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  assert.match(markup, new RegExp(`data-state="${fixture.signal.state}"`), `${fixture.name} fixture should expose its state`);
  assert.ok(visibleText.includes(fixture.expected.status), `${fixture.name} fixture should expose its visible status`);
  if (fixture.expected.freshness) {
    assert.ok(visibleText.includes(fixture.expected.freshness), `${fixture.name} fixture should expose a useful update date`);
  } else {
    assert.equal(markup.includes("signal-freshness"), false, `${fixture.name} fixture should not add generic freshness copy`);
  }
  assert.ok(visibleText.includes(fixture.expected.source), `${fixture.name} fixture should expose truthful source wording`);
  if (fixture.source.href) {
    assert.ok(markup.includes(`href="${fixture.source.href}"`), `${fixture.name} fixture should expose its source link`);
  } else {
    assert.equal(markup.includes("href="), false, `${fixture.name} fixture should not invent a source link`);
  }
}

const fantasyPendingMarkup = renderToStaticMarkup(createElement(SignalPresentation, {
  signal: fantasyPendingSignal,
  source: { label: "Sleeper", href: null },
}));
assert.equal(fantasyPendingMarkup.includes("href="), false, "Pending fantasy presenter should not expose a source href");
assert.equal(fantasyPendingMarkup.includes("<a "), false, "Pending fantasy presenter should not expose a Sleeper link");

const unavailableWeekMarkup = renderToStaticMarkup(createElement(SignalPresentation, {
  signal: fantasyWeekUnavailableSignal,
  source: { label: "Sleeper", href: fantasyWeekUnavailableSignal.href },
}));
assert.match(unavailableWeekMarkup, /No current week yet/);
assert.match(unavailableWeekMarkup, new RegExp(`href="${sleeperHref}"`));
assert.equal(unavailableWeekMarkup.includes("No matchup just yet"), false, "A missing week should not imply the league is disconnected");


const liveMatchupMarkup = renderToStaticMarkup(createElement(FantasyMatchup, { signal: fantasyLiveSignal }));
assert.match(liveMatchupMarkup, /Weekly matchup[\s\S]*Week 1/);
assert.match(liveMatchupMarkup, /My team[\s\S]*112\.4[\s\S]*Opponent[\s\S]*98\.7/);
assert.match(liveMatchupMarkup, /class="matchup-bars"/, "Known scores should have a visual score comparison");

const pendingMatchupMarkup = renderToStaticMarkup(createElement(FantasyMatchup, { signal: fantasyPendingSignal }));
assert.match(pendingMatchupMarkup, /My team[\s\S]*—[\s\S]*Opponent[\s\S]*—/);
assert.equal(pendingMatchupMarkup.includes('class="matchup-bars"'), false, "Unknown scores should not imply an equal matchup");

assert.equal(GITHUB_ACTIVITY_DAYS, 365);
assert.equal(signalFallbacks.github.activity.length, GITHUB_ACTIVITY_DAYS);
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
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "ArrowLeft"), 93);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "ArrowRight"), 107);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "ArrowDown"), 101);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "ArrowUp"), 99);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "Home"), 95);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "End"), 101);
assert.equal(moveContributionCalendarIndex(contributionCalendar, 100, "Escape"), null);
assert.equal(createContributionCalendar([]), null);
assert.deepEqual(signalFallbacks.training.schedule?.map(({ day, activity }) => ({ day, activity })), [
  { day: "Mon", activity: "Full body" },
  { day: "Tue", activity: "Zone 2 run" },
  { day: "Wed", activity: "Full body" },
  { day: "Thu", activity: "Interval run" },
  { day: "Fri", activity: "Full body" },
  { day: "Sat", activity: "Zone 2 rowing machine" },
  { day: "Sun", activity: "Interval assault bike" },
]);

assert.equal(startOfUtcWeek(now).toISOString(), "2026-09-14T00:00:00.000Z");

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

assert.deepEqual(
  mapPublicActivity(
    [
      { type: "PushEvent", repo: { name: "3ixas/public" }, created_at: "2026-09-15T08:00:00Z" },
      { type: "PushEvent", repo: { name: "3ixas/public" }, created_at: "2026-09-15T09:00:00Z" },
    ],
    3,
    now,
  )[1],
  { date: "2026-09-15", count: 2 },
);

const training = groupTrainingActivities([
  { sport_type: "WeightTraining", name: "private gym" },
  { sport_type: "Run", start_date: "private" },
  { type: "MartialArts", map: { summary_polyline: "private" } },
  { type: "Yoga" },
]);

assert.deepEqual(training.map(({ label, count }) => ({ label, count })), [
  { label: "Lift", count: 1 },
  { label: "Run", count: 1 },
  { label: "Muay Thai", count: 1 },
  { label: "Other", count: 1 },
]);
assert.equal(JSON.stringify(training).includes("private"), false);
assert.deepEqual(groupTrainingActivities([]).map((category) => category.count), [0, 0, 0, 0]);

console.log("Signal contract checks passed.");
