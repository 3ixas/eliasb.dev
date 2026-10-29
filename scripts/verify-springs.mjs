import assert from 'node:assert/strict';
import { spring as motionSpring } from 'motion';
import { spring } from '../src/components/site/spring.ts';
import { signatureSpringPairs } from '../src/components/site/signature-springs.ts';

// The site's spring (spring.ts) must match Motion's: at the settings the Signature motions play, and across the bounces
// and durations the Signature motions may use (bounce 0 to 0.45). A `linear()` curve is straight between its
// samples, so it is compared between them as well as at them. Every failure names the parameters.
const springCurveTolerance = 0.02;
// At a sample the two agree to Motion's own rest threshold (0.005: it snaps to 1 once at rest, while the model
// keeps its tail) plus the 0.001 the samples are rounded to.
const springSampleTolerance = 0.006;
const samples = (curve) => curve.easing.slice('linear('.length, -1).split(',').map(Number);
// The pairs behind passLean, read from signature-springs.ts.
const signatureSprings = Object.values(signatureSpringPairs).map(([bounce, visualDuration]) => ({ bounce, visualDuration }));
const springGrid = [0, 0.15, 0.3, 0.45].flatMap((bounce) => [0.3, 0.6, 1].map((visualDuration) => ({ bounce, visualDuration })));
for (const { bounce, visualDuration } of [...signatureSprings, ...springGrid]) {
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

console.log('Spring checks passed: the site spring matches Motion across the bounces and durations the Signature motions use.');
