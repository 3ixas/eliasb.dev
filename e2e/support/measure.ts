import { expect, type Locator } from "@playwright/test";
import type { Measure } from "../../src/content/stretch/measure";

/** What one comparison draws on the page: its bars' widths in order, its day squares per side, and its minute ticks per side. */
type Drawn = {
  bars: number[];
  /** A rate's whole 0 to 100 axis, when it has one. */
  axis?: number;
  days: number[];
  minutes: { on: number; range: number; scale: number }[];
};

/** What each item in `scope` matching `item` draws, in reading order. */
export const drawn = (scope: Locator, item: string) =>
  scope.locator(item).evaluateAll((items) =>
    items.map(
      (element): Drawn => ({
        bars: [...element.querySelectorAll(".bar")].map((bar) => bar.getBoundingClientRect().width),
        axis: element.querySelector(".measure--rate")?.getBoundingClientRect().width,
        days: [...element.querySelectorAll(".measure--days")].map((days) => days.children.length),
        minutes: [...element.querySelectorAll(".measure--minutes")].map((ticks) => ({
          on: ticks.querySelectorAll('[data-at="on"]').length,
          range: ticks.querySelectorAll('[data-at="range"]').length,
          scale: ticks.children.length,
        })),
      }),
    ),
  );

/**
 * Holds that a drawing is its measure in its unit (#456): ten squares for ten working days, a tick a minute on one
 * scale with the uncertain minutes of a range or a bound drawn short, a rate marked on its 0 to 100 axis, and bars in
 * proportion for a latency or a change.
 */
export function expectDrawn(drawing: Drawn, measure: Measure, name: string) {
  const { unit, before, after } = measure;
  switch (unit) {
    case "working-days":
      expect(drawing.days, `${name}: a square a working day`).toEqual([before.amount, after.amount]);
      return;
    case "minutes": {
      const scale = Math.max(before.amount, after.amount);
      const ticks = (side: Measure["before"]) => {
        const on = side.under ? 0 : (side.least ?? side.amount);
        return { on, range: side.amount - on, scale };
      };
      expect(drawing.minutes, `${name}: a tick a minute on one scale`).toEqual([ticks(before), ticks(after)]);
      return;
    }
    case "rate": {
      const [reached, gain] = drawing.bars;
      expect(reached / drawing.axis!, `${name}: before marked on the 0 to 100 axis`).toBeCloseTo(before.amount / 100, 2);
      expect(gain / drawing.axis!, `${name}: the gain filled between the marks`).toBeCloseTo((after.amount - before.amount) / 100, 2);
      return;
    }
    case "ms":
    case "change": {
      const [drawnBefore, drawnAfter] = drawing.bars;
      expect(drawnAfter / drawnBefore, `${name}: bars in proportion`).toBeCloseTo(after.amount / before.amount, 2);
    }
  }
}
