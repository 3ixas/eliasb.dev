import assert from "node:assert/strict";
import { SIM, binOf, simulate, simulation } from "../src/components/site/simulation-model.ts";

// The simulation's model (#457): for every step a visitor can choose and many seeds, the bins sum to the number of
// walks, the mean is the mean of the endpoints, the same seed draws the same run, and three walks are featured.
const seeds = [SIM.seed, ...Array.from({ length: 40 }, (_, index) => 1 + index * 7919)];
for (const count of SIM.counts) {
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
  }
}
assert.deepEqual(simulate(42, 100), simulate(42, 100), "A seed always draws the same run");
assert.notDeepEqual(simulate(42, 100).ends, simulate(43, 100).ends, "A new seed draws a new run");
assert.equal(simulation().walks.length, SIM.paths, "The default run is the server's");
assert.ok(SIM.counts.includes(SIM.paths), "The default is one of the steps");

console.log(`Simulation checks passed: ${SIM.counts.length} steps × ${seeds.length} seeds.`);
