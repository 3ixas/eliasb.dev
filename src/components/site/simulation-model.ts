/*
 * The BNP Paribas panel's simulation (DESIGN.md "Figures", R-14, #457): illustrative random walks from today to the
 * horizon, where they end, and their mean, which the panel labels "One price". Nothing here is priced; a run is
 * seeded, so a seed and a path count always draw the same picture, on the server and in every browser. An endpoint
 * beyond the plot counts in the nearest bin, so the bins always sum to the number of paths. `verify:simulation`
 * holds the sums and the mean for every step and many seeds.
 *
 * It has no imports, so Node can load it directly as well as Next.
 */

/** The drawing's own units, stretched to the plot; the steps a visitor can choose; the default run; how long a run takes to arrive. */
export const SIM = { steps: 100, width: 700, height: 380, bins: 17, counts: [10, 100, 1000], paths: 100, seed: 9137, arrival: 1600 } as const;

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
  seed: number;
  /** Each walk as its heights at every step, `SIM.steps + 1` of them, in the drawing's units. */
  walks: readonly (readonly number[])[];
  /** Each walk's final height, in the drawing's units. */
  ends: readonly number[];
  /** How many walks end in each band of the right edge, top band first. They sum to the number of walks. */
  bins: readonly number[];
  /** The walks that end in each band, in the order they arrive, so each endpoint's dot knows its walk. */
  members: readonly (readonly number[])[];
  /** The bin the mean falls in. */
  meanBin: number;
  /** The mean of the endpoints, as a fraction of the plot's height from its top. */
  mean: number;
  /** The walks drawn to stand out: those ending at the 10th, 50th and 90th percentiles, so they show the spread. */
  featured: readonly number[];
};

/** The bin an endpoint height falls in, clamped to the edge bins. */
export const binOf = (height: number) => Math.min(SIM.bins - 1, Math.max(0, Math.floor((height / SIM.height) * SIM.bins)));

/** One run of `paths` walks from `seed`. */
export function simulate(seed: number = SIM.seed, paths: number = SIM.paths): Simulation {
  const random = generator(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(random() || 1e-9)) * Math.cos(2 * Math.PI * random());
  const step = VOLATILITY * Math.sqrt(1 / SIM.steps);
  const walks = Array.from({ length: paths }, () => {
    let value = 0;
    return [heightOf(0), ...Array.from({ length: SIM.steps }, () => heightOf((value += step * gauss())))];
  });
  const ends = walks.map((walk) => walk[SIM.steps]);
  const members = Array.from({ length: SIM.bins }, (): number[] => []);
  ends.forEach((end, index) => members[binOf(end)].push(index));
  const bins = members.map((walks) => walks.length);
  const meanHeight = ends.reduce((sum, end) => sum + end, 0) / ends.length;
  const order = ends.map((end, index) => [end, index] as const).sort((a, b) => a[0] - b[0]);
  const featured = [0.1, 0.5, 0.9].map((share) => order[Math.min(order.length - 1, Math.floor(share * order.length))][1]);
  return { seed, walks, ends, bins, members, meanBin: binOf(meanHeight), mean: meanHeight / SIM.height, featured };
}

let memo: Simulation | undefined;

/** The default run, worked out once per process or page: the one the server draws. */
export const simulation = () => (memo ??= simulate());
