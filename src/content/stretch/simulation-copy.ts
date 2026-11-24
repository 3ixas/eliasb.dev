/*
 * The BNP Paribas simulation's words (DESIGN.md "Figures", #457), on their own so the plot's client code can carry them
 * without the Role stories. They are approved copy: docs/content/redesign-copy.md ("Passes and panels · Work") lists
 * them and verify:copy checks them through `workPanels`.
 */
const formatSpread = (spread: number) => `${(spread * 100).toFixed(1)}%`;

export const simulationCopy = {
  title: "How the pricing engines work",
  start: "Today",
  end: "Horizon",
  price: "One price",
  caption:
    "The engines run large simulation-based calculations across several asset classes. Thousands of possible market paths go in; a price and its risk come out.",
  description:
    "Illustrative simulated paths from today to the horizon, a histogram of where they end on the right edge, and a dashed line at their average, labelled one price.",
  again: "Run again",
  paths: "Paths",
  spread: "10th–90th spread",
  formatSpread,
  settled: (paths, change, spread) => {
    const size = Math.abs(change * 100).toFixed(1);
    const price = size === "0.0" ? "level with today" : `${size}% ${change > 0 ? "above" : "below"} today`;
    return `${paths} paths: one price, ${price}; 10th–90th spread ${formatSpread(spread)}.`;
  },
} as const satisfies {
  title: string;
  start: string;
  end: string;
  price: string;
  caption: string;
  description: string;
  again: string;
  paths: string;
  spread: string;
  formatSpread: (spread: number) => string;
  settled: (paths: string, change: number, spread: number) => string;
};
