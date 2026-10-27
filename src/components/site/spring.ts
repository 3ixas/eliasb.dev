/**
 * The site's one spring: every Signature motion is specified as
 * `spring(bounce, duration)` and played from the CSS `linear()` curve it
 * returns, so no motion library runs in the browser (ADR 0004, amended by ADR
 * 0005). `scripts/verify-springs.mjs` checks it against Motion's `spring`.
 *
 * This module has no imports so `scripts/verify-springs.mjs` can load it.
 */

/**
 * A spring as CSS: the easing curve, how long the curve runs, and when Motion
 * would consider the spring at rest (the moment its `await animate()` resolves).
 */
export type SpringCurve = { easing: string; duration: number; settled: number };

/**
 * Motion's spring({ bounce, visualDuration }) sampled as a CSS linear()
 * easing, for bounce ≥ 0. It mirrors framer-motion's resolution: damping
 * ratio 1 − bounce, natural frequency 2π / (1.2 × visualDuration).
 *
 * Forty samples keep the curve within 0.02 of Motion's, between samples as
 * well as at them, for a bounce up to 0.45 (the most any motion here uses). A
 * bouncier spring needs more samples. A bounce of 0 is critically damped: the
 * curve rises to 1 and never passes it.
 */
export function spring(bounce: number, visualDuration: number): SpringCurve {
  const zeta = Math.max(1 - bounce, 0.05);
  const omega = (2 * Math.PI) / (visualDuration * 1.2);
  // Long enough for Motion's rest test to pass even for the most lightly damped spring here.
  const settle = Math.min(2, Math.log(5000) / (zeta * omega));
  const steps = 40;
  const points: number[] = [];
  for (let step = 0; step <= steps; step += 1) {
    const t = (settle * step) / steps;
    let x: number;
    if (zeta < 1) {
      const damped = omega * Math.sqrt(1 - zeta * zeta);
      x = 1 - Math.exp(-zeta * omega * t) * (Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t));
    } else {
      x = 1 - Math.exp(-omega * t) * (1 + omega * t);
    }
    points.push(step === steps ? 1 : Math.round(x * 1000) / 1000);
  }
  // Motion's rest test: within 0.005 of the target and slower than 0.01 per second. A critically damped
  // spring (bounce 0) can pass it after its curve has ended, so this looks as far as Motion does (3 s).
  let settled = 0;
  for (let ms = 0; ms <= 3000; ms += 1) {
    const t = ms / 1000;
    const decay = Math.exp(-zeta * omega * t);
    let offset: number;
    let velocity: number;
    if (zeta < 1) {
      const damped = omega * Math.sqrt(1 - zeta * zeta);
      offset = decay * (Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t));
      velocity = decay * ((omega * omega) / damped) * Math.sin(damped * t);
    } else {
      offset = decay * (1 + omega * t);
      velocity = decay * omega * omega * t;
    }
    if (Math.abs(offset) <= 0.005 && Math.abs(velocity) <= 0.01) {
      settled = ms;
      break;
    }
  }
  return { easing: `linear(${points.join(", ")})`, duration: Math.round(settle * 1000), settled: settled || Math.round(settle * 1000) };
}
