import assert from 'node:assert/strict';
import { decide } from './codex-review-gate.mjs';

// The codex-review check must pass only on a finished Codex review of the
// head commit, and fail at once only when Codex answers this attempt with
// "create an environment". Each case below is one #164 found the hard way.

const head = '0820bc337e8bb1dc7f069dc94b8d8f18fef0b387';
const earlier = '1a80442447ee46d1f919cb7fa9d50c869c09c2d5';
const at = (minute) => `2026-10-11T18:${String(minute).padStart(2, '0')}:00Z`;

const codex = (created, body, updated = created) => ({
  login: 'chatgpt-codex-connector[bot]',
  created_at: at(created),
  updated_at: at(updated),
  body,
});
const person = (created, body) => ({ login: '3ixas', created_at: at(created), updated_at: at(created), body });

const environment =
  'To use Codex here, [create an environment for this repo](https://chatgpt.com/codex/cloud/settings/environments).';
// Codex's summary, including the boilerplate that itself mentions "@codex review".
const summary = (sha, status) =>
  [
    '<!-- codex-pull-request-review-summary -->',
    '| Review | Status | Commit | Review trigger |',
    '| --- | --- | --- | --- |',
    `| 📝 **Code Review** | ${status} | \`${sha.slice(0, 7)}\` | Manual request |`,
    '- Comment "@codex review" or "@codex security review".',
  ].join('\n');

const outcome = (comments, triggeredAt = at(0)) => decide({ comments, headSha: head, triggeredAt }).outcome;

// Before Codex says anything, the check waits.
assert.equal(outcome([]), 'wait', 'No comments yet waits');

// A finished review of the head commit passes; one still running waits.
assert.equal(outcome([codex(1, summary(head, '✅ **Completed**'), 3)]), 'pass', 'A completed head review passes');
assert.equal(outcome([codex(1, summary(head, '🔄 **Running**'))]), 'wait', 'A running head review waits');
assert.equal(outcome([codex(1, summary(head, '❌ **Failed**'), 3)]), 'fail', 'A failed head review fails');

// A completed review of an earlier push never stands in for the head commit.
assert.equal(
  outcome([codex(1, summary(earlier, '✅ **Completed**'), 3)], at(5)),
  'wait',
  'A completed review of an earlier commit waits for the head review',
);

// Codex's environment reply to this attempt fails at once.
assert.equal(outcome([codex(1, environment)]), 'fail', 'An environment reply to the opening fails');
assert.equal(
  outcome([codex(1, summary(earlier, '✅ **Completed**'), 2), person(4, '@codex review'), codex(5, environment)], at(3)),
  'fail',
  'An environment reply fails even after an earlier completed review',
);

// An environment reply to an earlier attempt does not fail this one.
assert.equal(
  outcome([codex(1, environment), person(2, '@codex review')]),
  'wait',
  'A fresh request outdates an earlier environment reply',
);
assert.equal(
  outcome([codex(1, environment)], at(3)),
  'wait',
  'A push or ready-for-review after an environment reply waits for Codex to answer it',
);
assert.equal(
  outcome([codex(1, environment), person(2, '@codex review'), codex(3, summary(head, '✅ **Completed**'), 4)]),
  'pass',
  'A completed head review after an environment reply passes',
);

// Only people request reviews: Codex's own boilerplate does not move the attempt.
assert.equal(
  outcome([codex(1, environment, 5), codex(2, summary(earlier, '✅ **Completed**'))]),
  'fail',
  "Codex's summary boilerplate does not count as a review request",
);

console.log('Codex review gate: all cases hold');
