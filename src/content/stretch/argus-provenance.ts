/*
 * Argus Risk's numbers with their history (#463): the case study's working figure under "Show the number with its
 * history." The data is illustrative, in Argus's own shapes, read from `3ixas/argus-risk` on its `main`: positions
 * from its seeded instruments (`InstrumentRepository.cs`), a price as a `PriceTick` on `market-data.prices`
 * (`PriceTick.cs`), a conversion as an `FxRate` (`FxRate.cs`), unrealised P&L in USD as `RiskCalculator` works it out,
 * and its rule that a price older than 5 seconds is stale (`RiskCalculator.StalenessThreshold`, `PositionRisk.IsStale`).
 */

/** The figure's words (docs/content/redesign-copy.md, "Argus Risk"). */
export const argusProvenanceCopy = {
  label: "Unrealised P&L (USD)",
  from: "From",
  age: "Age",
  stale: "Stale",
  newEvent: "New event",
  topic: "A price tick on market-data.prices",
  caption: "Press a number to see the price it came from and how old it is. New event brings a new price for the oldest one.",
  description: "Illustrative positions in Argus’s own shapes. Argus counts a price older than 5 seconds as stale.",
  /** Said politely when a new event lands: "TTE.PA: a new price of 62.10 EUR, unrealised P&L −$324". */
  announce: (symbol: string, price: string, value: string) => `${symbol}: a new price of ${price}, unrealised P&L ${value}`,
} as const;

/** Argus's staleness threshold: a price older than this many seconds is stale. */
export const STALE_AFTER_S = 5;

export type ArgusCurrency = "USD" | "GBP" | "EUR";

export type ArgusPosition = {
  symbol: string;
  currency: ArgusCurrency;
  quantity: number;
  /** FIFO average cost per share, in the position's currency. */
  cost: number;
  /** The latest price tick's price. */
  price: number;
  /** How old that tick is when the figure is drawn, in seconds. */
  age: number;
};

/** Three of Argus's seeded instruments, one per currency, the third already past the threshold so "Stale" is there to find. */
export const argusPositions: readonly ArgusPosition[] = [
  { symbol: "AAPL", currency: "USD", quantity: 120, cost: 171.2, price: 182.4, age: 1 },
  { symbol: "HSBA.L", currency: "GBP", quantity: 2000, cost: 6.31, price: 6.52, age: 3 },
  { symbol: "TTE.PA", currency: "EUR", quantity: 150, cost: 64.1, price: 61.85, age: 7 },
];

/** USD per unit of each currency (an `FxRate` with USD as the quote), held still: the figure moves prices, not rates. */
export const usdPer: Record<ArgusCurrency, number> = { USD: 1, GBP: 1.27, EUR: 1.08 };

/** Unrealised P&L in USD, as Argus works it out: quantity × (price − average cost), converted at the FX rate. */
export const unrealisedUsd = ({ quantity, cost, price, currency }: Pick<ArgusPosition, "quantity" | "cost" | "price" | "currency">) =>
  quantity * (price - cost) * usdPer[currency];

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, signDisplay: "always" });

/** "+$1,344" or "−$365", with a true minus sign. */
export const formatUsd = (value: number) => usd.format(Math.round(value)).replace("-", "−");

/** "182.40 USD". */
export const priceText = ({ price, currency }: Pick<ArgusPosition, "price" | "currency">) => `${price.toFixed(2)} ${currency}`;

/** "AAPL at 182.40 USD". */
export const pricedAt = (position: Pick<ArgusPosition, "symbol" | "price" | "currency">) => `${position.symbol} at ${priceText(position)}`;

/** "Converted at GBP/USD 1.27", or nothing for a USD position. */
export const convertedAt = (currency: ArgusCurrency) => (currency === "USD" ? "" : `Converted at ${currency}/USD ${usdPer[currency].toFixed(2)}`);

/** "3 s": whole seconds, as the figure shows them. */
export const ageText = (seconds: number) => `${Math.floor(seconds)} s`;

/** Argus's rule on the age shown: past 5 whole seconds, the price is stale. */
export const isStale = (seconds: number) => Math.floor(seconds) > STALE_AFTER_S;

/**
 * The next prices a new event brings, as fractions of the last: small, both ways, fixed so a visit and a test see the
 * same sequence. A price tick moves one position at a time, as Argus's simulator publishes them.
 */
export const priceSteps = [0.004, -0.006, 0.009, -0.003, 0.005, -0.008] as const;
