import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const layout = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
const boot = layout.match(/const siteBootScript = `([\s\S]*?)`;/)?.[1];
assert.ok(boot, 'The pre-paint boot script must exist');

function bootPage({ hash = '', reduced = false, pathname = '/' } = {}) {
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  const motion = new EventTarget();
  motion.matches = reduced;
  const root = {
    dataset: {},
    hasAttribute(name) { return name === 'data-home-opening' && 'homeOpening' in this.dataset; },
    removeAttribute(name) { if (name === 'data-home-opening') delete this.dataset.homeOpening; },
  };
  const window = new EventTarget();
  window.matchMedia = () => motion;
  window.setTimeout = (fn, delay) => { const id = ++nextId; timers.set(id, { fn, at: now + delay }); return id; };
  window.clearTimeout = (id) => timers.delete(id);
  runInNewContext(boot, {
    window, document: { documentElement: root }, location: { pathname, hash },
    localStorage: { getItem: () => null }, Event,
  });
  return {
    root, window, motion, timers,
    advance(ms) {
      const end = now + ms;
      while (true) {
        const due = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        const [id, timer] = due;
        timers.delete(id); now = timer.at; timer.fn();
      }
      now = end;
    },
    start(durationMs = 4500) { window.dispatchEvent(new CustomEvent('home-opening-started', { detail: { durationMs } })); },
    complete() { root.dataset.homeOpening = 'complete'; window.dispatchEvent(new Event('home-opening-completed')); },
  };
}

// A delayed download must leave a complete playback budget once hydration starts.
for (const delay of [0, 4000, 8000, 11000]) {
  const page = bootPage();
  page.advance(delay);
  assert.equal(page.root.dataset.homeOpening, 'running', `Startup should survive a ${delay}ms download`);
  page.start();
  page.advance(4500);
  assert.equal(page.root.dataset.homeOpening, 'running', 'Playback must not be cut off by the startup deadline');
  page.complete();
  page.advance(20000);
  assert.equal(page.root.dataset.homeOpening, 'complete');
  assert.equal(page.timers.size, 0, 'Completion must clear the watchdog');
}

const failed = bootPage();
let finishes = 0;
failed.window.addEventListener('home-opening-finish', () => finishes++);
failed.advance(12000);
assert.equal(failed.root.dataset.homeOpening, undefined, 'Missing hydration must expose static content');
failed.start();
assert.equal(failed.timers.size, 0, 'Late hydration must not restart a completed fallback');
assert.equal(finishes, 1);

const stalled = bootPage();
stalled.start();
stalled.advance(6500);
assert.equal(stalled.root.dataset.homeOpening, undefined, 'Stalled playback must also fail open');

for (const options of [{ reduced: true }, { hash: '#about' }, { pathname: '/work' }]) {
  assert.equal(bootPage(options).root.dataset.homeOpening, undefined);
}
assert.equal(bootPage({ hash: '#top' }).root.dataset.homeOpening, 'running');

const interactive = bootPage();
for (const name of ['touchstart', 'pointerdown', 'keydown', 'scroll', 'wheel']) interactive.window.dispatchEvent(new Event(name));
assert.equal(interactive.root.dataset.homeOpening, 'running', 'Input must not skip the entrance');
interactive.motion.dispatchEvent(Object.assign(new Event('change'), { matches: true }));
assert.equal(interactive.root.dataset.homeOpening, undefined, 'A new reduced-motion preference must finish immediately');
assert.equal(interactive.timers.size, 0);
console.log('Opening startup, playback, fallback, input, and preference checks passed.');
