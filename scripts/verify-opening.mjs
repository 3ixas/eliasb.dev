import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

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
    document: { documentElement: root, readyState: 'complete', addEventListener() {}, querySelectorAll: () => [] },
    location: { pathname: '/', hash },
    localStorage: { getItem: () => null },
    Event,
  });
  assert.equal(root.dataset.homeOpening, undefined, 'A fresh load must not start hidden');
}

console.log('Opening boot checks passed: content is never hidden before paint.');
