# Local testing runbook

Read this before running Playwright, the verify scripts or a build on a laptop. CI runs the whole suite against a production build; locally, run the least that proves the change.

## Playwright

1. Run only the specs the change can affect, and one project at a time: `pnpm exec playwright test e2e/<spec>.ts --workers=1 --project=chromium-1440-light`. Project names are `<chromium|webkit>-<320|390|820|1440>-<light|dark>`.
2. Run WebKit in its own invocation, never alongside Chromium. Parallel runs froze an 8 GB laptop, which is why `playwright.config.ts` sets one worker locally.
3. Do not run the full suite or a full `pnpm build` without Elias's approval. A full build crashed this laptop before; if one is approved, cap its memory.

## The server the specs run against

The config starts `pnpm start` (a production build) on port 3100 if nothing is listening, and reuses whatever is already there. For a quick loop, start `next dev` on 3100 with `BOARD_FIXTURES=1` instead: the `/fixtures` pages exist only with that variable, and the specs for Off the clock and the tokens need them.

- The dev server is stopped when a turn ends. Check with `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3100/` and start it again if that is not `200`; the first request after a start compiles the page, so allow a minute.
- Restart it after changing `next.config.ts`.
- `pnpm verify:routes` can run against it with `CANONICAL_ROUTE_BASE_URL=http://127.0.0.1:3100`.
- `pnpm verify:release` needs a production build, so CI is where it first runs. It has caught real issues that no other check did (attribute entities, the sitemap list), so read its failures rather than re-running.

## When a spec fails only in dev

`next.config.ts` hides the dev badge and allows `eval()` in development only, so the contrast, focus-ring and entrance specs no longer fail under `next dev` because of Next's own overlay. A failure now is real until shown otherwise: reproduce it against a production build or in CI before dismissing it.

## Node

Use Node 22 at `/usr/local/bin`; the Hermes symlinks on the default path are older.
