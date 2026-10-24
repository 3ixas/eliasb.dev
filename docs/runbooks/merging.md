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

## Blocked with every check green

`mergeStateStatus` can read `BLOCKED` when the required checks all show as passing. Two `codex-review` runs can start for the same head commit, and the workflow's `cancel-in-progress` cancels one. GitHub still counts the cancelled run as a failed required check, so the commit's rollup reads `FAILURE`.

1. Confirm: `gh api graphql` on the pull request's last commit, reading `statusCheckRollup.contexts` with `isRequired(pullRequestNumber: N)`, shows a required `codex-review` that is `CANCELLED` beside a `SUCCESS`.
2. Find the cancelled run with `gh run list --branch <branch> --json databaseId,name,conclusion,headSha` and re-run it with `gh run rerun <run-id> --failed`. Its gate passes at once because Codex's review of the head commit has already finished.
3. Wait for `mergeStateStatus` to read `CLEAN`. Do not use `--admin`.

## Failing end-to-end shards

Playwright runs with no retries, so a timing flake fails its shard.

1. Read the failing test names. `gh run view <run-id> --log-failed` returns nothing until the whole run has finished; until then, check-run annotations show only the exit code.
2. If the pull request cannot affect the failing tests (for example, it changes only workflows or docs) or the same test has failed on other branches, re-run the failed shards once with `gh run rerun <run-id> --failed`.
3. If it fails again, or the pull request touches what the test covers, treat it as a real failure.

## Requiring a new check

The ruleset can require only a check that `main` already reports. Merge the workflow that adds the check first, then add it to the ruleset's `required_status_checks` with integration_id `15368` (GitHub Actions). Read the ruleset with `gh api repos/3ixas/eliasb.dev/rulesets/<id>` and PUT it back whole, so the other rules are kept.

## Before merging

1. Check that CI ran against today's `main`: `git fetch` and `git merge-base --is-ancestor origin/main origin/<branch>`. `CLEAN` does not show this, and `baseRefOid` is the current tip of `main`, not where the branch started. If `main` has moved since the branch's last push and the new commits touch what its specs cover, run `gh pr update-branch <number>`; that is a push, so it needs CI and another `@codex review`.
2. Pin the merge to the head you checked: `gh pr merge <number> --squash --match-head-commit <sha>`. It needs the full 40-character SHA; a short one fails with a GraphQL coercion error.
3. Auto-merge pinned with `--match-head-commit` is checked again when it fires. After any later push the pull request stays armed and `CLEAN` but never merges, and GitHub reports nothing. Turn auto-merge off, then on again pinned to the new head, and only once Elias has approved that commit.
4. The app's `set_auto_merge` works only on a pull request bound to the calling session. For one another session opened, use `gh pr merge <number> --squash --auto --match-head-commit <sha>`.

## After merging

1. Squash-merge as above, then delete the branch on the remote and locally. A branch checked out in a worktree cannot be deleted, so remove the worktree first, once `git status --porcelain` there is empty.
2. Check out `main` and pull with `--ff-only`. If local `main` has the same work as an unpushed commit (committed before branching), `git diff` it against the merged head first; only when the trees match, `git reset --hard origin/main`. Start from a feature branch next time so this does not arise.
