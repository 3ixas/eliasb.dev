import assert from "node:assert/strict";
import { SIM, SIM_SCALE, binOf, simulate, simulation } from "../src/components/site/simulation-model.ts";

// The simulation's model (#457, R-53): for every step a visitor can choose and many seeds, the bins sum to the number
// of walks, the mean is the mean of the endpoints, the 10th–90th spread equals the sampled percentile gap and steadies
// between runs as paths grow without faking a narrowing, the same seed draws the same run, and three walks are featured.
const seeds = [SIM.seed, ...Array.from({ length: 40 }, (_, index) => 1 + index * 7919)];
const spreadsByCount = new Map();
for (const count of SIM.counts) {
  const spreads = [];
  for (const seed of seeds) {
    const run = simulate(seed, count);
    const where = `seed ${seed}, ${count} walks`;
    assert.equal(run.walks.length, count, where);
    assert.ok(run.walks.every((walk) => walk.length === SIM.steps + 1), `${where}: every walk has a height at every step`);
    assert.equal(run.bins.length, SIM.bins, where);
    assert.equal(run.bins.reduce((sum, bin) => sum + bin, 0), count, `${where}: the bins sum to the walks`);
    const mean = run.ends.reduce((sum, end) => sum + end, 0) / count / SIM.height;
    assert.ok(Math.abs(run.mean - mean) < 1e-12, `${where}: the price is the mean of the endpoints`);
    assert.equal(run.meanBin, binOf(mean * SIM.height), `${where}: the mean's bin`);
    assert.deepEqual(run.members.flat().sort((a, b) => a - b), Array.from({ length: count }, (_, index) => index), `${where}: every walk has one dot`);
    assert.ok(run.members.every((walks, bin) => walks.every((index) => binOf(run.ends[index]) === bin)), `${where}: each dot is in its walk's band`);
    assert.equal(run.featured.length, 3, `${where}: three walks stand out`);
    assert.ok(run.featured.every((index) => index >= 0 && index < count), `${where}: featured walks exist`);
    // The 10th–90th spread is the exact gap between the sampled 10th and 90th percentile endpoints (in change units).
    // Smaller SVG y is a higher price (90th percentile); larger y is a lower price (10th percentile).
    const sorted = [...run.ends].sort((a, b) => a - b);
    const p90Height = sorted[Math.floor(0.1 * count)];
    const p10Height = sorted[Math.min(count - 1, Math.floor(0.9 * count))];
    assert.ok(run.spread >= 0, `${where}: spread is non-negative`);
    assert.ok(Math.abs(run.spread - (p10Height - p90Height) / SIM_SCALE) < 1e-12, `${where}: spread equals the sampled 10th–90th percentile gap`);
    spreads.push(run.spread);
  }
  spreadsByCount.set(count, spreads);
}

const stats = (values) => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return { mean, stdev: Math.sqrt(variance) };
};
const s10 = stats(spreadsByCount.get(10));
const s100 = stats(spreadsByCount.get(100));
const s1000 = stats(spreadsByCount.get(1000));
assert.ok(s1000.stdev < s100.stdev && s100.stdev < s10.stdev, `Spread steadies between runs as paths increase: stdev(10)=${s10.stdev.toFixed(4)}, stdev(100)=${s100.stdev.toFixed(4)}, stdev(1000)=${s1000.stdev.toFixed(4)}`);
assert.ok(s1000.mean / s10.mean > 0.75 && s1000.mean / s10.mean < 1.35, `Spread does not artificially narrow as paths increase: mean(10)=${s10.mean.toFixed(4)}, mean(1000)=${s1000.mean.toFixed(4)}`);

assert.deepEqual(simulate(42, 100), simulate(42, 100), "A seed always draws the same run");
assert.notDeepEqual(simulate(42, 100).ends, simulate(43, 100).ends, "A new seed draws a new run");
assert.equal(simulation().walks.length, SIM.paths, "The default run is the server's");
assert.ok(SIM.counts.includes(SIM.paths), "The default is one of the steps");

console.log(`Simulation checks passed: ${SIM.counts.length} steps × ${seeds.length} seeds (spread stdev 10→100→1,000: ${s10.stdev.toFixed(3)} → ${s100.stdev.toFixed(3)} → ${s1000.stdev.toFixed(3)}).`);
