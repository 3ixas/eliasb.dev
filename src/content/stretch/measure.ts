/*
 * A comparison drawn in its own unit (docs/design/DESIGN.md "Figures", #456): a latency as two bars on a 100 ms scale,
 * working days as squares, minutes as ticks on one scale, a rate on a 0 to 100 axis, and a change in per cent as
 * before at 100 against after to scale. The words say each amount; `measureProblems` fails when a drawing would show
 * an amount its words do not state, so no drawing can say more than the fact it draws.
 *
 * Its runtime imports carry a .ts extension, so Node can load it directly as well as Next.
 */

/** What a comparison's amounts count. */
export type Unit = "ms" | "working-days" | "minutes" | "rate" | "change";

/**
 * One side's amount in its unit: a value, a range ("30–40 min" is `least` 30 to `amount` 40), or an upper bound
 * ("under 5" is `amount` 5, `under`). A change in per cent is drawn from 100: "+30%" is 100 against 130.
 */
export type Amount = { amount: number; least?: number; under?: true };

export type Measure = { unit: Unit; before: Amount; after: Amount };

/** The length both sides are drawn against: the larger amount, or the whole 0 to 100 axis for a rate. */
export const scaleOf = ({ unit, before, after }: Measure) => (unit === "rate" ? 100 : Math.max(before.amount, after.amount));

const counted: Record<string, number> = { a: 1, one: 1, two: 2, couple: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
const WORKING_WEEK = 5;

/**
 * The amount one side's words state in its unit, or undefined when they state none. "about two weeks" is ten working
 * days and "a couple of days" two; "30–40 min" is a range; "under 2" an upper bound. A change's before side has no
 * words of its own: it is the 100 the change is measured from.
 */
export function statedAmount(unit: Unit, words: string): Amount | undefined {
  switch (unit) {
    case "ms": {
      const match = words.match(/^(\d+) ms$/);
      return match ? { amount: Number(match[1]) } : undefined;
    }
    case "working-days": {
      const match = words.match(/\b(a|one|two|three|four|five|six|seven|eight|nine|ten|couple)(?: of)? (week|day)s?\b/);
      if (!match) return undefined;
      return { amount: counted[match[1]] * (match[2] === "week" ? WORKING_WEEK : 1) };
    }
    case "minutes": {
      const match = words.match(/^(under )?(\d+)(?:–(\d+))?(?: min)?$/);
      if (!match) return undefined;
      const [, under, first, second] = match;
      if (second) return under ? undefined : { amount: Number(second), least: Number(first) };
      return under ? { amount: Number(first), under: true } : { amount: Number(first) };
    }
    case "rate": {
      const match = words.match(/^(\d+)%$/);
      return match && Number(match[1]) <= 100 ? { amount: Number(match[1]) } : undefined;
    }
    case "change": {
      if (words === "") return { amount: 100 };
      const match = words.match(/^([−+])(\d+)%$/);
      return match ? { amount: 100 + Number(match[2]) * (match[1] === "−" ? -1 : 1) } : undefined;
    }
  }
}

/** A pair's value split into its two sides' words: "520 ms → 230 ms" at the arrow, and a change ("+30%") as no words against the change. */
export function sidesOf(value: string): [string, string] {
  const [before, after] = value.split(" → ");
  return after === undefined ? ["", before] : [before, after];
}

const written = ({ amount, least, under }: Amount) => (least !== undefined ? `${least}–${amount}` : under ? `under ${amount}` : `${amount}`);

/** What is wrong with drawing a comparison, as messages naming `where`; empty when each side draws the amount its words state. */
export function measureProblems(where: string, measure: Measure, words: readonly [string, string]): string[] {
  const problems: string[] = [];
  for (const [index, side] of (["before", "after"] as const).entries()) {
    const drawn = measure[side];
    const stated = statedAmount(measure.unit, words[index].trim());
    if (!stated) problems.push(`${where}: the ${side} side's words "${words[index]}" state no amount in ${measure.unit}.`);
    else if (written(stated) !== written(drawn)) problems.push(`${where}: the ${side} side draws ${written(drawn)} ${measure.unit}, but its words state ${written(stated)}.`);
    if (measure.unit === "working-days" && !Number.isInteger(drawn.amount)) problems.push(`${where}: ${drawn.amount} working days cannot be drawn as whole squares.`);
  }
  return problems;
}
