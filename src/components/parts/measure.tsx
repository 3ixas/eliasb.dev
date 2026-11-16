import type { CSSProperties } from "react";
import { scaleOf, type Measure } from "@/content/stretch/measure";

type Side = "before" | "after";

const vars = (values: Record<string, number>) => Object.fromEntries(Object.entries(values).map(([name, value]) => [`--${name}`, value])) as CSSProperties;

/**
 * One side of a comparison, drawn in its unit (DESIGN.md "Figures", #456; styles in parts.css): a latency as a bar on a
 * 100 ms scale, working days as same-size squares in working weeks, minutes as ticks on the pair's one scale (a range's
 * and an upper bound's uncertain minutes drawn short), and a rate or a change as a bar to scale. Before is soft, after
 * solid. It is a picture of words written beside it, so it is hidden from assistive technology.
 */
export function MeasureSide({ measure, side }: { measure: Measure; side: Side }) {
  const scale = scaleOf(measure);
  const { amount, least, under } = measure[side];
  const bar = side === "after" ? "bar bar--after" : "bar";
  switch (measure.unit) {
    case "ms":
      return (
        <span className="measure measure--ms" data-side={side} style={vars({ steps: scale / 100 })} aria-hidden="true">
          <i className={bar} style={vars({ share: amount / scale })} />
        </span>
      );
    case "working-days":
      return (
        <span className="measure measure--days" data-side={side} aria-hidden="true">
          {Array.from({ length: amount }, (_, index) => (
            <i key={index} />
          ))}
        </span>
      );
    case "minutes": {
      // Minutes it certainly took are drawn full height; the uncertain ones of "30–40" or "under 5" short; the rest of the scale faint.
      const certain = under ? 0 : (least ?? amount);
      return (
        <span className="measure measure--minutes" data-side={side} aria-hidden="true">
          {Array.from({ length: scale }, (_, index) => {
            const minute = index + 1;
            const state = minute <= certain ? "on" : minute <= amount ? "range" : "off";
            return <i key={minute} data-at={state} data-fifth={minute % 5 === 0 ? "" : undefined} />;
          })}
        </span>
      );
    }
    case "rate":
    case "change":
      return <i className={`measure ${bar}`} data-side={side} style={vars({ share: amount / scale })} aria-hidden="true" />;
  }
}

/**
 * Both sides of a comparison, before over after; a rate is one 0 to 100 axis instead, with before marked, the gain to
 * after filled solid between the two marks.
 */
export function MeasurePair({ measure }: { measure: Measure }) {
  if (measure.unit === "rate") {
    return (
      <span className="measure-pair measure measure--rate" style={vars({ from: measure.before.amount / 100, to: measure.after.amount / 100 })} aria-hidden="true">
        <i className="bar" />
        <i className="bar bar--after" />
      </span>
    );
  }
  return (
    <span className="measure-pair" aria-hidden="true">
      <MeasureSide measure={measure} side="before" />
      <MeasureSide measure={measure} side="after" />
    </span>
  );
}
