import { execFileSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

// The codex-review check (.github/workflows/codex-review.yml) waits here for
// Codex to finish reviewing the pull request's head commit, so its comments
// exist before anything merges. docs/runbooks/merging.md explains how to drive
// it; scripts/verify-codex-gate.mjs holds the cases it must get right.

const codex = 'chatgpt-codex-connector[bot]';

/**
 * Decides what the check does with the pull request's comments as they stand.
 * Each comment is { login, created_at, updated_at, body }, oldest first.
 * Returns { outcome: 'pass' | 'wait' | 'fail', message }.
 */
export function decide({ comments, headSha, triggeredAt }) {
  const fromCodex = comments.filter((comment) => comment.login === codex);
  // Codex keeps one summary comment, edited in place, whose Code Review row
  // names the reviewed commit by its short SHA.
  const row = fromCodex
    .flatMap((comment) => comment.body.split('\n'))
    .filter((line) => line.includes('**Code Review**'))
    .at(-1);
  const head = `\`${headSha.slice(0, 7)}\``;

  // Instead of reviewing, Codex can reply that it has no environment for the
  // repo. Its latest word is the comment it touched last, and that reply counts
  // only if it answers this attempt: the event that started this check (a
  // re-run keeps it), or a later "@codex review" request.
  const attempt = [
    triggeredAt,
    ...comments
      .filter((comment) => comment.login !== codex && comment.body.includes('@codex review'))
      .map((comment) => comment.created_at),
  ].reduce((latest, time) => (time > latest ? time : latest));
  const latest = fromCodex.reduce(
    (last, comment) => (!last || comment.updated_at >= last.updated_at ? comment : last),
    undefined,
  );
  if (latest && latest.body.includes('create an environment') && latest.created_at > attempt) {
    return {
      outcome: 'fail',
      message:
        'Codex replied that it needs an environment for this repo instead of reviewing. Check the Codex cloud settings, comment "@codex review", then re-run this check.',
    };
  }

  // A review of an earlier push never stands in for the code being merged.
  if (!row?.includes(head)) {
    return {
      outcome: 'wait',
      message: `Waiting for Codex to review ${head}; comment "@codex review" if it does not start (${row ?? 'no summary yet'})`,
    };
  }
  if (row.includes('Completed')) return { outcome: 'pass', message: `Codex has finished reviewing: ${row}` };
  if (/Failed|Error|Cancelled/.test(row)) {
    return {
      outcome: 'fail',
      message: `Codex's review did not complete: ${row}. Comment "@codex review", then re-run this check.`,
    };
  }
  return { outcome: 'wait', message: `Waiting for Codex (${row})` };
}

function readComments(repo, pr) {
  const lines = execFileSync(
    'gh',
    [
      'api',
      `repos/${repo}/issues/${pr}/comments`,
      '--paginate',
      '--jq',
      '.[] | {login: .user.login, created_at, updated_at, body}',
    ],
    // The default 1 MiB buffer would throw on a long discussion with verbose bot summaries.
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  );
  return lines
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function main() {
  const missing = ['REPO', 'PR', 'HEAD_SHA', 'TRIGGERED_AT'].filter((name) => !process.env[name]);
  if (missing.length) {
    console.log(`::error::The workflow did not set ${missing.join(', ')}.`);
    process.exit(1);
  }
  const { REPO: repo, PR: pr, HEAD_SHA: headSha, TRIGGERED_AT: triggeredAt } = process.env;
  // Every 20 seconds for up to 25 minutes; a review usually takes about three.
  for (let attempt = 0; attempt < 75; attempt += 1) {
    const { outcome, message } = decide({ comments: readComments(repo, pr), headSha, triggeredAt });
    if (outcome === 'pass') return console.log(message);
    if (outcome === 'fail') {
      console.log(`::error::${message}`);
      process.exit(1);
    }
    console.log(message);
    await sleep(20_000);
  }
  console.log(
    '::error::Codex has not finished a review after 25 minutes. Comment "@codex review", then re-run this check.',
  );
  process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
