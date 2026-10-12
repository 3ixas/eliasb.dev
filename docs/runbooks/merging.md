# Merging runbook

A pull request merges into `main` only when the main ruleset is satisfied: `quality`, `e2e (1)` to `e2e (8)` and `codex-review` pass, and every review thread is resolved. The Codex gate has rules the code does not show, so read this before pushing to, re-running checks on, or merging a pull request.

## Getting a Codex review

1. Codex reviews on its own only when a pull request opens or a draft is marked ready. After every push, comment `@codex review` on the pull request; `codex-review` waits for a finished review of the head commit and does not accept one of an earlier push.
2. `codex-review` runs on pull request events, not comments. If it has already failed or timed out, comment `@codex review`, wait for the summary's Code Review row to read Completed for the head commit, then re-run it with `gh run rerun <run-id> --failed`.
3. If Codex replies "create an environment for this repo" instead of reviewing, `codex-review` fails at once. Check the environments at chatgpt.com/codex/cloud/settings/environments, then request a review again.

`scripts/codex-review-gate.mjs` makes the decision and `scripts/verify-codex-gate.mjs` holds the cases it must get right; change both together.

## Answering Codex's comments

1. Fix each finding that holds, push, and reply in its thread with the commit that fixed it before resolving the thread. For a finding you decline, reply with the reason, then resolve.
2. Never write `@codex` in a thread reply, even in quotes or backticks. Codex treats it as a request and answers in the thread, usually "create an environment".
3. Each round of fixes is a push, so it needs another `@codex review`. When later rounds only narrow edge cases that do not change what merges, decline them with a reason rather than adding logic.

## Failing end-to-end shards

Playwright runs with no retries, so a timing flake fails its shard.

1. Read the failing test names. `gh run view <run-id> --log-failed` returns nothing until the whole run has finished; until then, check-run annotations show only the exit code.
2. If the pull request cannot affect the failing tests (for example, it changes only workflows or docs) or the same test has failed on other branches, re-run the failed shards once with `gh run rerun <run-id> --failed`.
3. If it fails again, or the pull request touches what the test covers, treat it as a real failure.

## Requiring a new check

The ruleset can require only a check that `main` already reports. Merge the workflow that adds the check first, then add it to the ruleset's `required_status_checks` with integration_id `15368` (GitHub Actions). Read the ruleset with `gh api repos/3ixas/eliasb.dev/rulesets/<id>` and PUT it back whole, so the other rules are kept.
