import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { spring } from 'motion';
import { openingScript, openingTimings as opening, springCurve } from '../src/components/board/opening.ts';

// The pre-paint boot script may only restore the theme and prepare optional
// motion. It must never hide content while it waits for the opening: the
// headline is server-rendered and the opening (#78) only decorates it.
const layout = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
const boot = layout.match(/const siteBootScript = `([\s\S]*?)`;/)?.[1];
assert.ok(boot, 'The pre-paint boot script must exist');
assert.doesNotMatch(boot, /homeOpening|home-opening/, 'The boot script must not gate content on the opening');

for (const [hash, reduced] of [['', false], ['#top', false], ['', true]]) {
  const motion = new EventTarget();
  motion.matches = reduced;
  const root = { dataset: {}, hasAttribute: () => false, removeAttribute() {} };
  const window = new EventTarget();
  window.matchMedia = () => motion;
  window.setTimeout = () => 0;
  window.clearTimeout = () => {};
  runInNewContext(boot, {
    window,
    document: { documentElement: root, readyState: 'complete', addEventListener() {}, querySelectorAll: () => [], createElement: () => ({}), head: { appendChild() {} } },
    location: { pathname: '/', hash },
    localStorage: { getItem: () => null },
    Event,
  });
  assert.equal(root.dataset.homeOpening, undefined, 'A fresh load must not start hidden');
}

// The opening's CSS springs must match Motion's springs at the approved settings.
for (const { bounce, visualDuration } of [opening.land, opening.settle, opening.press]) {
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

// Without its hero, the inline opening does nothing and leaves nothing hidden.
const emptyRoot = { removeAttribute() {}, setAttribute() { throw new Error('should not start'); } };
runInNewContext(openingScript, {
  document: { documentElement: emptyRoot, querySelector: () => null },
  window: {}, performance: { getEntriesByType: () => [] }, location: { hash: '' }, CSS: { supports: () => true },
});

console.log('Opening checks passed: content is never hidden before paint, and the springs match Motion.');
