# Portfolio site skill-pass plan

Date opened: 21 September 2026
Repository: `3ixas/eliasb.dev`
Checkout: `/Users/elias/_LifeOS/03_Engineering/repos/personal/eliasb.dev`

## Purpose

This document records a bounded quality pass over the launched portfolio site after the dedicated launch, accessibility, cross-browser, imagery, and production-configuration work. The passes are ordered by user impact: observe the site as a visitor, measure load cost, review the public attack surface, refine visible craft, then make operational and merge checks repeatable.

No pass authorises deployment, publishing, pushing, merging, deletion, paid services, new credentials, or new external integrations. Local edits must remain justified by observed evidence and must preserve unrelated user changes.

## Sequence and status

| Order | Pass | Owner skill | Status | Rationale |
| --- | --- | --- | --- | --- |
| 1 | Real-user journey and product quality | `dogfood` | Blocked — `agent-browser` unavailable | Finds friction and coherence problems that route checks and axe cannot see. |
| 2 | Measured web performance | `performance` | Complete — finding deferred | Establishes a baseline before changing image, font, bundle, or third-party loading. |
| 3 | Public-site security review | `security` | Complete — hardening applied | Checks the token, server integration, headers, dependency, and deployment trust boundaries. |
| 4 | Visual and responsive craft | `ui-polish` | Complete — one local polish fix | Refines only problems visible in rendered states while preserving the selected Cabinet direction. |
| 5 | Production visibility and CI | `observability`, `ci` | Complete — runbook and workflow added | Makes future integration failures and regressions diagnosable and repeatable before merge. |

Supporting skills (`react`, `nextjs`, `typescript`, `motion`, `vercel`, or `verify`) are invoked only if a pass produces evidence that their narrower guidance is needed. The earlier accessibility, browser verification, release, Vercel configuration, and launch passes are treated as completed and are not repeated without a new finding.

## Scope and constraints

In scope:

- `/`, `/work`, the three case studies, `/lab`, `/library`, and `/about`;
- keyboard, pointer, responsive, empty/fallback, and long-content states;
- server-side GitHub, Letterboxd, Goodreads, Strava, Sleeper, Spotify, Wikimedia, and local-time boundaries;
- image/font/embed loading, cache behaviour, dependency and header configuration, build/lint/typecheck commands, and practical production diagnostics;
- local documentation and low-risk code/config fixes that are directly supported by evidence.

Out of scope without a separate decision:

- new personal claims, new third-party credentials, new paid services, TMDB or other synopsis enrichment, Apple Health/Workouts, Bevel, or new fitness APIs;
- changing the visual direction or information architecture;
- native Safari remote automation setup, which requires a macOS security-setting change;
- production deployment, domain/DNS changes, GitHub pushes, PRs, merges, or external comments.

Dependencies:

- a clean checkout before each pass;
- local production build and, where a browser pass needs it, a local dev or production server;
- existing launch evidence in [`docs/launch/VALIDATION.md`](../launch/VALIDATION.md) and integration contracts in [`docs/integrations/SIGNALS.md`](../integrations/SIGNALS.md);
- no secrets copied into logs, screenshots, reports, or browser output.

Approval boundaries:

- Routine local inspection, documentation, tests, and reversible low-risk fixes are authorised by this plan.
- Any new credential, external write, deployment, merge, destructive action, product-direction change, or fix with competing UX/architecture options must be reported as a decision rather than implemented.

## Pass contracts

### 1. Dogfood — real-user journey

Objective: exercise the primary visitor journeys and representative live/fallback states as a person, recording friction, surprise, trust, recovery, accessibility, and polish beyond functional route checks.

Acceptance criteria:

- primary navigation from the homepage reaches every public section;
- the homepage signals, work links, Lab cards, Library objects, Spotify fallback, theme toggle, skip link, and About journey behave coherently;
- narrow mobile and desktop states do not hide copy, controls, or source/fallback status;
- each finding is classified as a defect, limitation, preference, or decision;
- any applied fix has focused regression evidence; no large redesign is made autonomously.

Evidence to capture: browser/CLI command, route and viewport, observed state, expected behaviour, severity, screenshot or DOM evidence when useful, and verification after any fix. Durable output: `docs/review/SKILL-PASS-PLAN.md` plus a dogfood report if the runner is available.

### 2. Performance — measured web performance

Objective: baseline user-perceived load and identify only causal, measurable opportunities.

Acceptance criteria:

- capture comparable desktop and mobile baselines for at least the homepage, `/library`, and `/about`;
- inspect image/font/iframe requests, route payloads, cache headers, and long tasks;
- distinguish site-owned cost from cross-origin Spotify cost;
- make a change only when a trace supports the hypothesis and capture before/after evidence;
- do not trade correctness or visual intent for an unmeasured gain.

Evidence to capture: tool/version, URL/build, viewport/network conditions, FCP/LCP/CLS/INP or available proxies, request and bundle evidence, artifact paths, and before/after delta.

### 3. Security — public-site boundary review

Objective: review assets, actors, entry points, external systems, credentials, headers, dependencies, and failure defaults.

Acceptance criteria:

- server-only credentials cannot enter the rendered model or client bundle;
- integration responses are bounded and validated before rendering;
- headers, external links, iframe policy, redirects, and image sources have an intentional posture;
- dependency and static checks run and findings are triaged against reachable code;
- every actionable finding includes asset, prerequisite, path, impact, location, and smallest remediation;
- verify legitimate behaviour still works after any protection change.

Evidence to capture: inspected files, command outputs, dependency audit, rendered/network checks, exact findings, and residual limitations. No invasive production testing.

### 4. UI polish — responsive editorial craft

Objective: refine the existing Cabinet direction across hierarchy, typography, colour, layout, surfaces, states, native feel, and resilience.

Acceptance criteria:

- inspect representative light/dark, narrow/wide, short/tall, long-content, empty/fallback, focus, and reduced-motion states;
- fix foundation issues before local decoration;
- preserve semantic headings, source/fallback truthfulness, and existing route behaviour;
- re-render the same states after each coherent fix batch;
- stop when remaining differences are preference-level or require a product-direction decision.

Evidence to capture: viewport/theme/state, screenshots or computed-style evidence, files changed, and regression checks.

### 5. Observability and CI — operational readiness

Objective: make user-visible integration failures diagnosable and local/merge checks repeatable without adding unnecessary telemetry.

Acceptance criteria:

- define the small set of production questions for external integrations;
- inspect Vercel/runtime logs and current failure visibility;
- avoid collecting secrets, tokens, full request bodies, or unnecessary personal data;
- inspect CI/workflow presence, local parity, permissions, action pinning, caches, and artifacts;
- add only the smallest useful runbook, check, or workflow improvement;
- distinguish work that requires deployment or external approval.

Evidence to capture: current scripts/workflows, command results, Vercel/runtime evidence where available, proposed signals, and any remaining operational decision.

## Completed before this plan

- annotated feedback was converted into a parent specification and dependency-aware GitHub slices;
- the accessibility follow-up PR was merged; site-owned axe checks pass, with only Spotify cross-origin iframe findings remaining;
- Chromium, Firefox, and WebKit route/interaction verification passed; native Safari WebDriver remains a manual limitation because remote automation is disabled;
- production domain, Vercel configuration, indexability, imagery, redirects, metadata, and launch validation were checked;
- `pnpm lint`, TypeScript checking, signal contract verification, production build, route crawl, and `git diff --check` were recorded as passing in the launch validation.

## Change log

This section is appended as each pass completes. Each entry records findings, files changed, verification, and any decision still needed.

- 2026-09-21: Plan created. Dogfood pass opened; no code changes made yet.
- 2026-09-21: Dogfood blocked before browser execution because `agent-browser` is not installed. Existing launch-validation evidence remains separate and is not counted as a new dogfood pass. No files changed. The user-facing prerequisite is to install `agent-browser` before rerunning this pass.
- 2026-09-21: Performance pass completed with no code changes. Five repeated read-only requests to the production routes measured compressed HTML of 17,020 B (`/`), 6,025 B (`/library`), and 5,352 B (`/about`). Median total times were approximately 133 ms, 255 ms, and 379 ms respectively, with outliers up to 223 ms, 5.86 s, and 12.88 s. The outliers occur during cache regeneration/edge variability; all samples returned HTTP 200 and `x-vercel-cache: HIT` on the captured baseline.
- 2026-09-21: Representative optimized site-owned image responses were 313 KB (football), 178 KB (London), 176 KB (profile), 109 KB (Threshold), 75 KB (Argus), and 69 KB (Professor Past). Immutable CSS/JS assets returned long-lived immutable cache headers; the CSS was 15 KB and the largest JS chunk 72 KB compressed. Responsive `sizes`/`srcset` hints are present. Direct feed timings were Letterboxd 249 ms, Goodreads 346 ms, Wikimedia 62 ms, and GitHub public events 583 ms.
- 2026-09-21: `pnpm build --webpack` passed (Next.js 16.3.5; 18 static/SSG routes). The measurable follow-up is to decide whether live-feed regeneration should fail faster or render a stale shell while a provider is slow; this changes freshness semantics and is deferred to a separate architecture decision.
- 2026-09-21: Security pass completed with hardening changes in `next.config.ts`, `src/integrations/safe-url.ts`, `src/integrations/goodreads.ts`, and `src/integrations/letterboxd.ts`. Added CSP, frame-denial, nosniff, referrer, and permissions headers; allowlisted RSS-derived HTTPS hosts for Letterboxd links/posters and Goodreads covers. `pnpm audit --prod --json` reported 0 vulnerabilities across 93 production dependencies. No credential-like files are tracked, no secret names appeared in `.next/static`, and the only `dangerouslySetInnerHTML` is the fixed local theme bootstrap. `pnpm lint`, `pnpm exec tsc --noEmit --incremental false`, `pnpm verify:signals`, `pnpm build --webpack`, local production header/page checks, safe-URL abuse cases, and `git diff --check` passed. Residual limitation: `script-src`/`style-src` retain `unsafe-inline` because the current Next theme/hydration path uses inline content; tightening that requires a nonce design and is deferred.
- 2026-09-21: UI-polish pass completed with one justified stylesheet change in `src/app/globals.css`: the desktop homepage Spotify signal now spans eight of the twelve signal columns instead of one third of the row, reducing the observed stranded-card gap while retaining the existing mobile `span 12` rule. Production homepage, Library, and local production renderings were inspected after settling; the existing Cabinet hierarchy, theme treatment, live/fallback labels, embed fallback, and responsive rules remained intact. `pnpm lint`, `pnpm verify:signals`, the production build, and `git diff --check` passed.
- 2026-09-21: Observability and CI pass completed with a small operational runbook at `docs/runbooks/integration-fallbacks.md` and a read-only GitHub Actions quality workflow at `.github/workflows/quality.yml`. The runbook records the production questions, cache/fallback windows, safe diagnostic fields, current lack of structured provider-failure telemetry, and the boundary for a future metrics decision. The workflow runs on `main` pushes and pull requests with `contents: read`, frozen pnpm installation, lint, TypeScript checking, signal-contract verification, the webpack production build, and whitespace checks; it does not deploy or use secrets. Local verification after all changes passed: `pnpm lint`, `pnpm exec tsc --noEmit --incremental false`, `pnpm verify:signals`, `pnpm build --webpack`, and `git diff --check`. No production or external writes were made. The only remaining pass blocker is the dogfood prerequisite: install `agent-browser` before a new run; native Safari automation remains the previously documented macOS limitation.

## Interface, motion, and UI-polish follow-up

- 2026-09-21: Interface-design pass completed against the existing Cabinet of Curiosities direction. Added the project-level [`docs/design/DESIGN.md`](../design/DESIGN.md) with the approved journey, hierarchy, references, real states, responsive rules, accessibility requirements, and motion contract. Stitch exploration was not needed because the visual direction was already selected and the change was a bounded refinement. Local homepage, Work, Library, and About surfaces were inspected after content and imagery settled.
- 2026-09-21: Motion pass completed without adding decorative animation. Existing hero entrance, page entry, Library object opening, hover feedback, and global `prefers-reduced-motion` handling were inspected. The existing system already gives each transition a clear job and preserves access to content; adding route view transitions would increase complexity without a demonstrated continuity need. The installed launcher and craft-floor reference were unavailable, so the repository design brief and rendered implementation were used directly.
- 2026-09-21: UI-polish pass completed with one local CSS refinement in `src/app/globals.css`: the homepage now keeps the active Home navigation item visibly underlined, matching the inner-page header treatment. The updated homepage was re-rendered in the local browser and the active state was visible while the existing spacing, responsive rules, focus treatment, and Cabinet styling remained intact.
