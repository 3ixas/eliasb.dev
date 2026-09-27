import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { historyWeekStart, savedHistorySignal } from "../src/integrations/history.ts";

// Supply Next's request context and an in-memory storage adapter, while using
// its real unstable_cache implementation and the application's actual wrapper.
globalThis.AsyncLocalStorage ??= AsyncLocalStorage;
const require = createRequire(import.meta.url);
const { workAsyncStorage } = require("next/dist/server/app-render/work-async-storage.external.js");
const entries = new Map();
let fetchCount = 0;
let unavailable = false;
const requestedWeeks = [];
const live = {
  ...savedHistorySignal(), state: "live", dateLabel: "Week of 21 September 2026",
  events: [{ year: 1783, text: "A test story", image: { src: "https://example.test/balloon.jpg" } }],
};
const incrementalCache = {
  async generateSimpleCacheKey(key) { return key; },
  async get(key) { return entries.get(key) ?? null; },
  async set(key, value) { entries.set(key, { value, isStale: false }); },
};
const loadedModule = { exports: {} };
const source = readFileSync(new URL("../src/integrations/history-cache.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
runInNewContext(code, {
  module: loadedModule, exports: loadedModule.exports, Date, Error,
  require(name) {
    if (name === "@/integrations/history") return {
      historyWeekStart, savedHistorySignal,
      async getHistorySignal(now) {
        fetchCount++;
        requestedWeeks.push(now.toISOString());
        return unavailable ? savedHistorySignal() : structuredClone(live);
      },
    };
    return require(name);
  },
});
const getHistory = (date) => workAsyncStorage.run(
  { incrementalCache, isStaticGeneration: true, route: "/" },
  () => loadedModule.exports.getCachedHistorySignal(new Date(date)),
);

const first = await getHistory("2026-09-21T10:00:00Z");
assert.equal(first.state, "live");
assert.equal(entries.size, 1);
assert.equal([...entries.values()][0].value.revalidate, 604800);
const sameWeek = await getHistory("2026-09-27T23:59:59Z");
assert.deepEqual(sameWeek, first, "Visitors share the same stories and image metadata for the week");
assert.equal(fetchCount, 1);

unavailable = true;
for (const entry of entries.values()) entry.isStale = true;
const originalError = console.error;
const errors = [];
console.error = (...args) => errors.push(args);
try {
  const stale = await getHistory("2026-09-27T12:00:00Z");
  assert.deepEqual(stale, first, "A failed revalidation must retain the illustrated snapshot");
  assert.equal(JSON.parse([...entries.values()][0].value.data.body).state, "live");
  assert.equal(errors.length, 1, "Next should report the failed revalidation");
} finally {
  console.error = originalError;
}

const nextWeekFailure = await getHistory("2026-09-28T00:00:00Z");
assert.equal(nextWeekFailure.state, "curated", "An outage must not relabel last week's stories as current");
assert.equal(entries.size, 1, "A cold failure must not be cached as a successful weekly snapshot");
unavailable = false;
const recovered = await getHistory("2026-09-28T00:05:00Z");
assert.equal(recovered.state, "live", "Retry after a cold failure must recover");
assert.equal(entries.size, 2);
assert.equal(requestedWeeks.at(-1), "2026-09-28T00:00:00.000Z");
console.log("Weekly history snapshot, failed refresh, rollover, and recovery checks passed.");
