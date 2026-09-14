import assert from "node:assert/strict";
import {
  groupTrainingActivities,
  mapContributionDays,
  mapPublicActivity,
  startOfUtcWeek,
} from "../src/integrations/signal-mappers.ts";

const now = new Date("2026-09-16T12:00:00.000Z");

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
