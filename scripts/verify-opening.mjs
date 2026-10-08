import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { spring } from 'motion';
import { entranceGuardScript, entranceScript, entranceTimings as timings, springCurve } from '../src/components/site/entrance.ts';

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

// The entrance's CSS springs must match Motion's springs at the approved settings.
for (const { bounce, visualDuration } of [timings.land, timings.move, timings.name, timings.portrait, timings.label]) {
  const curve = springCurve(bounce, visualDuration);
  const points = curve.easing.slice('linear('.length, -1).split(',').map(Number);
  const motion = spring({ keyframes: [0, 1], bounce, visualDuration });
  points.forEach((value, index) => {
    const at = (curve.duration * index) / (points.length - 1);
    const expected = motion.next(at).value;
    assert.ok(Math.abs(value - expected) < 0.01, `spring(${bounce}, ${visualDuration}) at ${Math.round(at)} ms: ${value} vs Motion ${expected}`);
  });
  assert.ok(Math.abs(motion.next(curve.duration).value - 1) < 0.002, `spring(${bounce}, ${visualDuration}) should be at rest when the curve ends`);
  let restsAt = 0;
  while (!motion.next(restsAt).done && restsAt < 3000) restsAt += 1;
  assert.ok(Math.abs(curve.settled - restsAt) <= 2, `spring(${bounce}, ${visualDuration}) should settle when Motion does: ${curve.settled} vs ${restsAt} ms`);
}

console.log('Entrance checks passed: the page is held only when motion is welcome, every failure releases it, and the springs match Motion.');
