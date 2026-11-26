import assert from "node:assert/strict";
import { breakMinutes, breakSeconds, flowtimeBreakCopy, focusRange, pomodoro } from "../src/content/stretch/flowtime-break.ts";

// Flowtime's break rule (#464), pinned to its repository's own cases (`3ixas/flowtime-focus-timer`,
// src/lib/breakCalculation.test.ts on main): focus seconds in, break seconds out, at the default ratio of 5.
const repositoryCases = [
  [60, 60],
  [300, 60],
  [360, 120],
  [600, 120],
  [1500, 300],
  [3600, 720],
  [7200, 1440],
  [301, 120],
  [61, 60],
  [30, 60],
  [1, 60],
  [0, 0],
  [900, 180],
  [1200, 240],
  [1800, 360],
  [2700, 540],
];
for (const [focus, rest] of repositoryCases) assert.equal(breakSeconds(focus), rest, `${focus} s of focus gives a ${rest} s break`);

// The ratios Flowtime's settings offer (BREAK_RATIO_OPTIONS) use the same rule: an hour at 3 is 20 minutes, at 8 is 8.
assert.equal(breakSeconds(3600, 3), 1200);
assert.equal(breakSeconds(3600, 8), 480);

// Every value the slider can take: the break drawn is the product's, whole minutes of focus ÷ 5 rounded up.
let values = 0;
for (let focus = focusRange.min; focus <= focusRange.max; focus += 1, values += 1) {
  assert.equal(breakMinutes(focus), Math.ceil(focus / 5), `${focus} min of focus`);
  assert.ok(Number.isInteger(breakMinutes(focus)), `${focus} min: a break is whole minutes, so it draws as whole ticks`);
}
assert.ok(focusRange.start >= focusRange.min && focusRange.start <= focusRange.max, "The start is on the slider");
assert.equal(breakMinutes(pomodoro.focus), pomodoro.rest, "At 25 minutes Flowtime and a Pomodoro agree");

// The slider's spoken value takes "an" before a break that starts with a vowel sound.
for (const [focus, rest, said] of [
  [40, 8, "40 minutes of focus, an 8-minute break"],
  [55, 11, "55 minutes of focus, an 11-minute break"],
  [90, 18, "90 minutes of focus, an 18-minute break"],
  [45, 9, "45 minutes of focus, a 9-minute break"],
  [60, 12, "60 minutes of focus, a 12-minute break"],
]) {
  assert.equal(breakMinutes(focus), rest, `${focus} min of focus`);
  assert.equal(flowtimeBreakCopy.valueText(focus, rest), said);
}

console.log(`Flowtime break checks passed: ${repositoryCases.length} repository cases, ${values} slider values.`);
