import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { spring as motionSpring } from 'motion';
import { entranceGuardScript, entranceSchedule, entranceScript, entranceTimings as timings } from '../src/components/site/entrance.ts';
import { spring } from '../src/components/site/spring.ts';
import { hero } from '../src/content/stretch/site-copy.ts';

/** The entrance's own schedule for the real headline and name, with the headline's place on the screen. */
const leadText = `${hero.headline.lead} `;
const schedule = () => entranceSchedule(spring, timings, leadText, `${hero.name.first}${hero.name.last}`.length, true);

// The signature entrance (#130) holds the homepage by opacity only after its
// guard script has marked the document, and only when motion is welcome. The
// site-wide boot script must never gate content on it.
const layout = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
const boot = layout.match(/const siteBootScript = `([\s\S]*?)`;/)?.[1];
assert.ok(boot, 'The pre-paint boot script must exist');
assert.doesNotMatch(boot, /entering|entrance|opening/i, 'The boot script must not gate content on the entrance');

/** Runs the guard in a fake page and reports what it did. */
function runGuard({ reduced = false, navigation = 'navigate', hash = '', hidden = false, animate = true } = {}) {
  const attributes = new Map();
  const timers = [];
  const listeners = [];
  const root = {
    hasAttribute: (name) => attributes.has(name),
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
  };
  const window = {
    matchMedia: () => ({ matches: reduced }),
    setTimeout: (callback, delay) => timers.push({ callback, delay }),
    addEventListener: (type, callback) => listeners.push({ type, callback }),
  };
  runInNewContext(entranceGuardScript, {
    window,
    document: { documentElement: root, hidden },
    performance: { getEntriesByType: () => [{ type: navigation }] },
    location: { hash },
    Element: { prototype: animate ? { animate() {} } : {} },
  });
  return { root, timers, listeners };
}

// A fresh load, or #top, is held, with a seven second safety timeout.
for (const hash of ['', '#top']) {
  const { root, timers } = runGuard({ hash });
  assert.ok(root.hasAttribute('data-entering'), `A fresh load at "${hash}" should be held`);
  assert.equal(timers.length, 1, 'The hold needs exactly one safety timeout');
  assert.equal(timers[0].delay, 7000, 'The safety timeout is seven seconds');
  timers[0].callback();
  assert.ok(!root.hasAttribute('data-entering'), 'The safety timeout releases the hold');
}

// A restored page is released, not replayed.
{
  const { root, listeners } = runGuard();
  const pageshow = listeners.find((listener) => listener.type === 'pageshow');
  assert.ok(pageshow, 'The guard must listen for a page restored from the back-forward cache');
  pageshow.callback({ persisted: false });
  assert.ok(root.hasAttribute('data-entering'), 'A normal pageshow does not release the hold');
  pageshow.callback({ persisted: true });
  assert.ok(!root.hasAttribute('data-entering'), 'A restored page is released');
}

// None of these may be held.
for (const [what, options] of [
  ['reduced motion', { reduced: true }],
  ['a back-forward load', { navigation: 'back_forward' }],
  ['a section link', { hash: '#work' }],
  ['a hidden tab', { hidden: true }],
  ['a browser without Web Animations', { animate: false }],
]) {
  assert.ok(!runGuard(options).root.hasAttribute('data-entering'), `${what} must never be held`);
}

// If the guard itself fails, nothing is left held.
{
  const attributes = new Map([['data-entering', '']]);
  runInNewContext(entranceGuardScript, {
    window: {},
    document: { documentElement: { removeAttribute: (name) => attributes.delete(name) } },
  });
  assert.equal(attributes.size, 0, 'A guard error must release the hold');
}

// The player does nothing, and touches nothing, when the page was not held.
runInNewContext(entranceScript, {
  document: {
    documentElement: { hasAttribute: () => false, removeAttribute() { throw new Error('should not touch an unheld page'); } },
    querySelector() { throw new Error('should not read an unheld page'); },
  },
  window: {},
});

// A held page missing its hero is released rather than left blank.
{
  const attributes = new Map([['data-entering', '']]);
  runInNewContext(entranceScript, {
    document: {
      documentElement: { hasAttribute: (name) => attributes.has(name), removeAttribute: (name) => attributes.delete(name) },
      querySelector: () => null,
    },
    window: {},
  });
  assert.equal(attributes.size, 0, 'A held page without its hero must be released');
}

// While the page's fonts are loading the entrance waits for them, so it measures the real typeface: it
// starts when they arrive, or after the cap, whichever is first, and only once.
for (const [what, settle] of [['the fonts arriving', 'fonts'], ['the cap running out', 'timer']]) {
  const attributes = new Map([['data-entering', '']]);
  let resolveFonts;
  const timers = [];
  runInNewContext(entranceScript, {
    document: {
      documentElement: { offsetHeight: 0, hasAttribute: (name) => attributes.has(name), removeAttribute: (name) => attributes.delete(name) },
      querySelector: () => null,
      fonts: { status: 'loading', ready: new Promise((resolve) => { resolveFonts = resolve; }) },
    },
    window: { setTimeout: (callback, delay) => timers.push({ callback, delay }) },
  });
  assert.ok(attributes.has('data-entering'), 'The entrance must not start while fonts are loading');
  assert.equal(timers.length, 1, 'The font wait must be capped by one timer');
  assert.equal(timers[0].delay, timings.fontWaitMs, 'The font wait must use the approved cap');
  assert.ok(timings.fontWaitMs + schedule().finishAt < timings.safetyMs, 'The font wait plus the sequence must fit inside the safety timeout');
  if (settle === 'fonts') {
    resolveFonts();
    await Promise.resolve();
    await Promise.resolve();
  } else {
    timers[0].callback();
  }
  assert.ok(!attributes.has('data-entering'), `The entrance must start after ${what}`);
  timers[0].callback();
}

// The site's spring (spring.ts) must match Motion's: at the entrance's approved settings, and across the bounces
// and durations the Signature motions may use (bounce 0 to 0.45). A `linear()` curve is straight between its
// samples, so it is compared between them as well as at them. Every failure names the parameters.
const springCurveTolerance = 0.02;
// At a sample the two agree to Motion's own rest threshold (0.005: it snaps to 1 once at rest, while the model
// keeps its tail) plus the 0.001 the samples are rounded to.
const springSampleTolerance = 0.006;
const samples = (curve) => curve.easing.slice('linear('.length, -1).split(',').map(Number);
const entranceSprings = [timings.land, timings.move, timings.name, timings.portrait, timings.label];
const springGrid = [0, 0.15, 0.3, 0.45].flatMap((bounce) => [0.3, 0.6, 1].map((visualDuration) => ({ bounce, visualDuration })));
for (const { bounce, visualDuration } of [...entranceSprings, ...springGrid]) {
  const label = `spring(${bounce}, ${visualDuration})`;
  const curve = spring(bounce, visualDuration);
  const points = samples(curve);
  const motion = motionSpring({ keyframes: [0, 1], bounce, visualDuration });
  points.forEach((value, index) => {
    const at = (curve.duration * index) / (points.length - 1);
    const expected = motion.next(at).value;
    assert.ok(Math.abs(value - expected) < springSampleTolerance, `${label} at ${Math.round(at)} ms: ${value} vs Motion ${expected}`);
  });
  for (let ms = 0; ms <= curve.duration; ms += 5) {
    const position = (ms / curve.duration) * (points.length - 1);
    const index = Math.min(Math.floor(position), points.length - 2);
    const value = points[index] + (points[index + 1] - points[index]) * (position - index);
    const expected = motion.next(ms).value;
    assert.ok(Math.abs(value - expected) < springCurveTolerance, `${label} between samples at ${ms} ms: ${value.toFixed(4)} vs Motion ${expected.toFixed(4)} (more than ${springCurveTolerance} apart)`);
  }
  assert.equal(points[0], 0, `${label} should start at 0`);
  assert.equal(points.at(-1), 1, `${label} should end at 1`);
  assert.ok(Math.abs(motion.next(curve.duration).value - 1) < 0.002, `${label} should be at rest when the curve ends`);
  let restsAt = 0;
  while (!motion.next(restsAt).done && restsAt < 3000) restsAt += 1;
  assert.ok(Math.abs(curve.settled - restsAt) <= 2, `${label} should settle when Motion does: ${curve.settled} vs ${restsAt} ms`);
  if (bounce > 0) {
    // It overshoots past rest, then settles back onto it.
    const peak = Math.max(...points);
    assert.ok(peak > 1, `${label} should overshoot past rest, but peaks at ${peak}`);
    let motionPeak = 0;
    for (let ms = 0; ms <= curve.duration; ms += 1) motionPeak = Math.max(motionPeak, motion.next(ms).value);
    assert.ok(Math.abs(peak - motionPeak) < springSampleTolerance, `${label} should overshoot as far as Motion's ${motionPeak.toFixed(4)}, but peaks at ${peak}`);
    const tail = points.slice(points.indexOf(peak));
    assert.ok(Math.abs(tail.at(-1) - 1) < 0.001 && Math.abs(tail.at(-2) - 1) < 0.01, `${label} should settle on 1 after its overshoot`);
  } else {
    // A spring with no bounce rises to rest and never passes it.
    assert.ok(Math.max(...points) <= 1, `${label} must not overshoot, but peaks at ${Math.max(...points)}`);
    assert.ok(points.every((value, index) => index === 0 || value >= points[index - 1]), `${label} must rise without ever turning back`);
  }
}

// The two-act sequence (variant A3, #160): the timings are the approved ones, and they put the beats where
// the ticket says: BNP Paribas readable at about 1.0 s, the whole First glance at about 3.9 s, settled at about 4.6 s.
for (const [name, expected] of [
  ['startMs', 120],
  ['characterMs', 20],
  ['spaceMs', 14],
  ['commaPauseMs', 400],
  ['holdMs', 250],
  ['nameDelayMs', 100],
  ['roleDelayMs', 250],
  ['portraitDelayMs', 200],
]) {
  assert.equal(timings[name], expected, `${name} is the A3 value`);
}
{
  const beats = schedule();
  const employer = 'BNP Paribas';
  assert.ok(leadText.includes(employer), 'The typed line names the employer');
  const employerTyped = beats.typeAt[leadText.indexOf(employer) + employer.length - 1] + timings.characterMs;
  assert.ok(employerTyped >= 900 && employerTyped <= 1100, `BNP Paribas is typed at about 1.0 s, not ${employerTyped} ms`);
  // The supporting line is readable once it is 60% of the way through its fade.
  const glance = beats.moveEnd + timings.fadeMs * 0.6;
  assert.ok(glance >= 3800 && glance <= 4000, `The whole First glance is readable at about 3.9 s, not ${Math.round(glance)} ms`);
  assert.ok(beats.finishAt >= 4500 && beats.finishAt <= 4700, `The entrance settles at about 4.6 s, not ${beats.finishAt} ms`);
  assert.ok(beats.roleAt < beats.moveEnd, 'The role line arrives while the line is still moving');
  assert.ok(entranceScript.includes(entranceSchedule.toString()), 'The inline script must play the same schedule that is checked here');
  assert.ok(beats.moveStart - (beats.landAt + beats.landing.settled) >= timings.holdMs, 'The finished sentence holds alone before it moves');
}

console.log('Entrance checks passed: the page is held only when motion is welcome, every failure releases it, the springs match Motion, and the two-act sequence lands its beats at about 1.0, 3.9 and 4.6 s.');
