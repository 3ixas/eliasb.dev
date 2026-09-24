import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  GITHUB_ACTIVITY_DAYS,
  groupTrainingActivities,
  mapContributionDays,
  mapPublicActivity,
  startOfUtcWeek,
} from "../src/integrations/signal-mappers.ts";
import { integrationConfig } from "../src/content/integration-config.ts";
import { fantasySourceUnavailable, fantasyWeekUnavailable, signalFallbacks } from "../src/content/signal-fallbacks.ts";
import { FantasyMatchup } from "../src/components/site/fantasy-matchup.ts";
import { SignalPresentation } from "../src/components/site/signal-presentation.ts";

const now = new Date("2026-09-16T12:00:00.000Z");
const signalStates = new Set(["live", "curated", "pending", "unavailable"]);
const sleeperHref = `https://sleeper.com/leagues/${integrationConfig.sleeper.leagueId}`;

assert.equal(signalFallbacks.fantasy.href ?? null, null);
assert.equal(signalFallbacks.reading.statusLabel, "Last known book");
assert.match(signalFallbacks.reading.bookDescription ?? "", /last book I had marked as reading on Goodreads/i);
assert.equal(signalFallbacks.culture.statusLabel, "Last known film");
assert.match(signalFallbacks.culture.description, /when the feed last updated/i);

/** @type {import("../src/integrations/types.ts").FantasySignal} */
const fantasyLiveSignal = {
  ...signalFallbacks.fantasy,
  state: "live",
  statusLabel: "Live",
  headline: "1–0 this season",
  description: "I share my score here; the other managers’ names stay private.",
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
    expected: { status: "Wikimedia · cached", freshness: "Cached for up to seven days", source: "Wikimedia" },
  },
  {
    name: "authored",
    signal: { state: "curated", statusLabel: "Typical week", updatedAt: null },
    source: { label: "My weekly plan", href: null },
    authoredLabel: "Maintained by hand",
    expected: { status: "Typical week", freshness: "Maintained by hand", source: "My weekly plan" },
  },
  {
    name: "fantasy-pending",
    signal: fantasyPendingSignal,
    source: { label: "Sleeper", href: null },
    expected: { status: "My league isn’t connected yet", freshness: "Waiting to connect", source: "Sleeper" },
  },
  {
    name: "fantasy-source-unavailable",
    signal: fantasySourceUnavailableSignal,
    source: { label: "Sleeper", href: sleeperHref },
    expected: { status: "Sleeper unavailable", freshness: "I couldn’t fetch a live update", source: "Sleeper" },
  },
  {
    name: "unavailable",
    signal: { state: "unavailable", statusLabel: "Public only", updatedAt: null },
    source: { label: "GitHub activity", href: signalFallbacks.github.href },
    expected: { status: "Public only", freshness: "I couldn’t fetch a live update", source: "GitHub activity" },
  },
];

assert.deepEqual(signalPresentationFixtures.map(({ name }) => name), ["fantasy-live", "cached", "authored", "fantasy-pending", "fantasy-source-unavailable", "unavailable"]);
for (const fixture of signalPresentationFixtures) {
  assert.ok(signalStates.has(fixture.signal.state), `${fixture.name} fixture should use a shared signal state`);
  const markup = renderToStaticMarkup(createElement(SignalPresentation, {
    signal: fixture.signal,
    source: fixture.source,
    authoredLabel: fixture.authoredLabel,
  }));
  const visibleText = markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  assert.match(markup, new RegExp(`data-state="${fixture.signal.state}"`), `${fixture.name} fixture should expose its state`);
  assert.ok(visibleText.includes(fixture.expected.status), `${fixture.name} fixture should expose its visible status`);
  assert.ok(visibleText.includes(fixture.expected.freshness), `${fixture.name} fixture should expose truthful freshness`);
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
assert.match(unavailableWeekMarkup, /Week data unavailable/);
assert.match(unavailableWeekMarkup, new RegExp(`href="${sleeperHref}"`));
assert.equal(unavailableWeekMarkup.includes("My league isn’t connected yet"), false, "A missing week should not imply the league is disconnected");


const liveMatchupMarkup = renderToStaticMarkup(createElement(FantasyMatchup, { signal: fantasyLiveSignal }));
assert.match(liveMatchupMarkup, /Weekly matchup[\s\S]*Week 1/);
assert.match(liveMatchupMarkup, /My team[\s\S]*112\.4[\s\S]*Opponent[\s\S]*98\.7/);
assert.match(liveMatchupMarkup, /class="matchup-bars"/, "Known scores should have a visual score comparison");

const pendingMatchupMarkup = renderToStaticMarkup(createElement(FantasyMatchup, { signal: fantasyPendingSignal }));
assert.match(pendingMatchupMarkup, /My team[\s\S]*—[\s\S]*Opponent[\s\S]*—/);
assert.equal(pendingMatchupMarkup.includes('class="matchup-bars"'), false, "Unknown scores should not imply an equal matchup");

assert.equal(GITHUB_ACTIVITY_DAYS, 371);
assert.equal(signalFallbacks.github.activity.length, GITHUB_ACTIVITY_DAYS);
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
