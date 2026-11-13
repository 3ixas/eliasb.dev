/*
 * The BNP Paribas panel's simulation (DESIGN.md "Figures", R-14): illustrative random walks from today to the
 * horizon, a histogram of where they end, and their mean, which the panel labels "One price". Nothing here is priced;
 * the walks are seeded so every render and every visitor draws the same picture. The logic is the prototype's
 * `simulate()` (docs/review/2026-11-11-direction-e/app.js), except that an endpoint beyond the plot counts in the
 * nearest bin, so the bins always sum to the number of paths.
 */

/** The drawing's own units: `preserveAspectRatio="none"` stretches them to the plot. */
export const SIM = { paths: 70, steps: 100, width: 700, height: 380, bins: 17 } as const;

/** Units of height per unit of value, so the walks fill the plot without leaving it often. */
const SCALE = 215;
const VOLATILITY = 0.34;

/** A linear congruential generator: small, fast and the same in every engine. */
function generator(seed: number) {
  return () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
}

/** The height a value is drawn at: zero is the middle, up is a higher value. */
const heightOf = (value: number) => SIM.height / 2 - value * SCALE;

export type Simulation = {
  /** Each walk as an SVG path in the drawing's units. */
  paths: readonly string[];
  /** Each walk's final height, in the drawing's units. */
  ends: readonly number[];
  /** How many walks end in each band of the right edge, top band first. They sum to `SIM.paths`. */
  bins: readonly number[];
  /** The bin the mean falls in, drawn in white. */
  meanBin: number;
  /** The mean of the endpoints, as a fraction of the plot's height from its top. */
  mean: number;
};

function run(): Simulation {
  const random = generator(9137);
  const gauss = () => Math.sqrt(-2 * Math.log(random() || 1e-9)) * Math.cos(2 * Math.PI * random());
  const step = VOLATILITY * Math.sqrt(1 / SIM.steps);
  const walks = Array.from({ length: SIM.paths }, () => {
    let value = 0;
    return [0, ...Array.from({ length: SIM.steps }, () => (value += step * gauss()))];
  });
  const paths = walks.map((walk) => walk.map((value, index) => `${index ? "L" : "M"}${((index / SIM.steps) * SIM.width).toFixed(1)} ${heightOf(value).toFixed(1)}`).join(""));
  const ends = walks.map((walk) => heightOf(walk[SIM.steps]));
  const binOf = (height: number) => Math.min(SIM.bins - 1, Math.max(0, Math.floor((height / SIM.height) * SIM.bins)));
  const bins = Array<number>(SIM.bins).fill(0);
  for (const end of ends) bins[binOf(end)] += 1;
  const meanHeight = ends.reduce((sum, end) => sum + end, 0) / ends.length;
  return { paths, ends, bins, meanBin: binOf(meanHeight), mean: meanHeight / SIM.height };
}

let memo: Simulation | undefined;

/** The one simulation, worked out once per process or page. */
export const simulation = () => (memo ??= run());
