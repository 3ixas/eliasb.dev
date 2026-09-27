# History refresh follow-up

## Request and scope

The user reported illustrated current history on desktop but saved examples without images on phone. Restore consistent weekly history across devices without changing layout or the approved entrance/copy work.

Base: 20a079b4d4608796712dfbdf5a2da9a9043125f2, branch codex/mobile-entrance-positioning.

## Evidence and changes

Read-only requests with desktop and iPhone user agents returned live illustrated stories from localhost and saved examples from production. The data selection is server-side, with no mobile branch. Production's exact upstream failure was not captured by its previous silent fallback.

A fresh local production build reproduced three feed timeouts at the existing 3.5-second limit. A subsequent timed probe returned events and selected in under a second while births took 11 seconds. A later actual-provider run recovered all three stories and licensed images in 428ms.

Requests now identify the application to Wikimedia. A failed category no longer discards three suitable source-linked stories from available feeds. Weekly selected stories and image metadata are cached together using Next's server cache. An unsuccessful refresh throws inside the cache boundary, preserving an existing successful snapshot. Cold failures remain honestly labelled saved examples and can retry. Monday UTC is part of the key, preventing previous-week stories from being relabelled. Sanitized provider status/error diagnostics make future production failures inspectable. Individual unavailable or unlicensed images still degrade to text as before.

## Verification

- Lint, TypeScript, signal contracts, opening checks, route checks, release checks (315), production webpack build, and diff whitespace checks passed.
- Added partial-feed and request-identification contracts, UTC week boundaries, plus tests using Next's real unstable_cache implementation for snapshot reuse, failed revalidation retention, rollover, and cold-failure recovery.
- WebKit 26.5 production-build walkthrough at 1440, 390 (iPhone 13 profile), and 320px: identical three stories, three successfully loaded images, no horizontal overflow. Desktop and iPhone screenshots visually inspected.
- Local evidence: /tmp/history-followup-qa.cjs and /tmp/history-{desktop,iphone,small}.png.
- No deployment performed. Production refresh behaviour remains to be checked after release. Physical iPhone entrance confirmation remains pending from the preceding slice.

## Review

Current-run Standards and Spec review of the staged slice against the base above. No actionable findings. Repository Next guidance was checked against bundled docs and the pinned cache implementation. No issue-tracker configuration is present; the user's history follow-up is the spec. Unrelated annotation/spec documents were excluded.
