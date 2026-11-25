# Final pass: readiness sweep before release

Scope: [`docs/review/2026-11-25-final-pass/SCOPE.md`](SCOPE.md), confirmed by Elias on 25 November 2026. Targets `main`.

## Problem Statement

Elias is about to send eliasb.dev to hiring managers. The site has had a Lens pass, the Passes and panels refinement (#512) and a full copy review (#528). But the refinement work (#513–#520) has never had a whole-site craft, motion, accessibility, performance, type-safety or platform review. `app-audit` has never run, and there's no measured performance baseline. Elias wants one last pass so that a careful reader finds nothing to flag, and then the design can freeze.

## Solution

One read-only diagnosis sweep runs every relevant lens against production and produces a single ranked findings document. Elias picks which findings to fix. The picks are fixed one surface at a time, one PR each. A small separate change adds Speed Insights, so real-visitor data starts building. The pass closes when:

- the lab performance and accessibility targets hold;
- CI is green on `main`;
- a fresh agent's dogfood of production turns up nothing new worth fixing;
- `APP-AUDIT.md` records the run, and cheap, reliable checks are now CI gates.

## User Stories

1. As a hiring manager opening the homepage on a phone, I want the first screen to load fast and stay still, so that my first impression is of care, not lag.
2. As a hiring manager, I want every page to feel finished and consistent, so that nothing makes me doubt the craft claims on the page.
3. As a hiring manager reading a Role story, I want the chapter rail, Decision cards and Monte Carlo spread to read clearly at 390 and 1440 px, so that I can follow the argument on any device.
4. As a reader of a case study, I want the exhibition stage and its zoomable screenshot to open, close and keep focus predictably, so that inspecting the work never traps or loses me.
5. As a visitor on `/things-i-make`, I want the archive's thumbnail rows and optical bezels to line up exactly, so that the archive looks curated.
6. As a visitor in dark mode, I want every surface, band and hairline to hold its contrast and depth, so that the dark theme isn't an afterthought.
7. As a visitor who prefers reduced motion, I want the opening, the 3D pass and every transition to respect that preference, so that the site is comfortable to use.
8. As a visitor interrupting an animation (scrolling or clicking mid-spring), I want motion to retarget smoothly, so that the site never feels stuck or janky.
9. As a keyboard user, I want to reach and operate the How I work switch, the Threshold city switcher, the chapter rail and the lightbox, with a visible focus ring, so that I can use everything without a mouse.
10. As a VoiceOver user, I want each hand-built control to announce its name, role and state, so that I understand what it does.
11. As a Windows high-contrast user, I want bands, bezels and the header to keep visible edges, so that the layout stays legible in forced colours.
12. As a visitor on a slow phone, I want the Three.js pass to cost little and fall back gracefully, so that the page stays responsive.
13. As a reader, I want every string to sound like Elias and stay positively framed, so that the site reads as his own.
14. As a reader, I want no copy that repeats what the interface already shows, so that the pages feel calm.
15. As a visitor following an old `/lab`, `/library` or `/about` link, I want a permanent redirect to the right homepage section, so that shared links never break.
16. As a visitor sharing a page, I want correct share cards and metadata, so that links look intentional in messages and social posts.
17. As Elias, I want one ranked findings document tagged by lens and surface, so that I can pick fixes in one sitting.
18. As Elias, I want findings that the Lens pass or #528 already declined left out, so that I'm not asked the same thing twice.
19. As Elias, I want each fix PR to cover one surface, with before-and-after captures on its preview, so that I can approve it at a glance and approval means merge.
20. As Elias, I want measured Lighthouse numbers per route, so that "fast" is a fact and not a claim.
21. As Elias, I want Speed Insights collecting real-visitor data once links go out, so that I can see field performance later.
22. As Elias, I want the checks this pass proves to stay as CI gates, so that the frozen design can't regress quietly.
23. As Elias, I want a closing dogfood by an agent independent of the fixers, so that the "done" verdict isn't the fixers marking their own work.
24. As a maintainer, I want type boundaries in the content model and components free of needless casts and dead exports, so that later content changes are safe.
25. As a maintainer, I want production headers, caching and image settings checked, so that the site is secure and cache-efficient without new platform machinery.

## Implementation Decisions

### Phase 1: Diagnosis (read-only)

- `app-audit` owns the sweep. The lenses run one after another as read-only Engineer children (Gemini 4 Neon, `medium`), each with a fresh context. A child changes nothing and returns its findings with evidence. Order:
  1. dogfood;
  2. craft-review;
  3. ui-polish;
  4. writing;
  5. motion;
  6. accessibility;
  7. performance;
  8. typescript;
  9. vercel.
- Each child reads `DESIGN.md`, `GLOSSARY.md`, `SCOPE.md`, the Lens pass scope and #528's copy decisions first, so nothing is raised twice.
- Diagnosis runs against production at `53bfac0` or later. There's no local `next build`. Any local Playwright run uses one worker on relevant specs only (`docs/runbooks/local-testing.md`).
- Coverage, all at equal depth:
  - the homepage;
  - all four Role stories;
  - every case study;
  - the `/things-i-make` archive;
  - 390 and 1440 px, light and dark.

  The `/lab`, `/library` and `/about` redirects are checked as redirects only.
- Findings use craft-review's format: location and evidence; class (observed defect, causal hypothesis, or preference); consequence and reach; proposed correction; how to verify. The Lead merges them into `FINDINGS.md` next to `SCOPE.md`, ranked, with lens and surface tags and duplicates merged.
- The performance lens writes the baseline: the median of 5 mobile Lighthouse runs per public route against production, recording LCP, TBT and CLS. If a target is unrealistic against that baseline, it goes to Elias in `FINDINGS.md` to renegotiate.

### Phase 2: Pick

- Elias marks each finding picked or declined in `FINDINGS.md`. Declined findings stay as a record and aren't re-ticketed. A picked copy finding carries its exact before-and-after strings.

### Phase 3: Fix, one PR per surface

- The surfaces, each a ticket only if it has picked findings:
  - Shell (header, Say hello, tokens, theme);
  - Homepage;
  - Role stories;
  - Case studies;
  - Off the clock;
  - `/things-i-make` archive;
  - Platform and types (headers, caching, image config, TypeScript boundaries).

  A cross-surface finding belongs to the surface that owns the shared code.
- Tickets run through `implement-series`, one at a time, on the Engineer. Each PR posts before-and-after captures at 390 and 1440 px in both themes on its Vercel preview. Approving the preview is the go-ahead to merge, under guarded auto-merge.
- Visual baselines change only for picked items, and the PR names them.
- A `DESIGN.md` rule that blocks a picked improvement is rewritten in the same PR. Accessibility and performance gates still hold.
- The custom spring stays. A motion fix tunes its parameters or how it's used, and `verify:springs` still passes.

### Separate change: Speed Insights

- Adds Vercel Speed Insights on the free tier and raises `js-budget.json` only by the script's measured size. It doesn't gate the pass and blocks no other ticket.

### Phase 4: Close

- **Closing dogfood:** after the last fix merges, Codex (rendered browser, `gpt-6.2-sol`, `medium`) runs with a fresh context. It uses production as a visitor would and answers: "What here feels unfinished, or like it wasn't made by Elias?" Anything new worth fixing becomes a follow-up in the owning surface. The pass closes when a run turns up nothing new worth fixing.
- **App audit record:** `docs/review/APP-AUDIT.md` records the date, commit, Lighthouse medians, axe results and the gates added.
- **Gates:** axe on every public route and any other cheap, reliable check become CI gates in the existing quality workflow. Lighthouse stays out of CI because it's noisy, and its numbers are recorded in `APP-AUDIT.md` instead.

## Testing Decisions

- **A good test checks what a visitor sees and can do on the rendered page, not how the page is built.** It uses web-first assertions or `expect.poll` for hydrated, animated or lazily laid-out state, never a single `evaluate` right after `goto`.
- **Seam 1: the existing Playwright suite against production builds in CI.** This includes `standing-checks` (axe), `layout-shift`, `forced-colors`, `motion`, `role-story`, `case-study`, `things-i-make`, `off-the-clock` and `homepage-signoff`. Every fix extends the nearest existing spec, and no new harness is added.
- **Seam 2: lab performance, which is a measurement, not a test.** Lighthouse mobile runs against production, median of 5 per route. The performance lens records them, and they're re-measured after the last fix.
- **Seam 3: the existing `pnpm check` scripts.** These are `verify:copy`, `verify:craft`, `verify:type-scale`, `verify:springs` and the JS budget in `check:built`. They guard copy, spacing, type, the spring and the bundle.
- **Axe gate:** every public route gets an axe assertion, extending `standing-checks` rather than adding per-page duplicates.
- **Acceptance:**
  - Lighthouse medians meet LCP ≤ 2.0 s and CLS ≤ 0.05, with TBT not worse than baseline, or meet renegotiated targets Elias approved.
  - axe reports 0 violations on every public route.
  - The full 8-shard production matrix, `pnpm check` and `check:built` are green on `main`.
  - The closing dogfood comes back with nothing new worth fixing.
  - `APP-AUDIT.md` exists.

## Out of Scope

- Adopting shadcn, changing the motion library, migrating to `vercel.ts`, any paid Vercel feature.
- The Résumé sheet and PDF, and the 404 visitor pass.
- A redesign, new sections, new claims or new integrations.
- Field Core Web Vitals as a gate.
- Replacing the Three.js lanyard, the `GreetingScene` art or the drawn proofs in Where I'm headed.

## Further Notes

- The human cold read was dropped by Elias. The closing dogfood is the gate, with the known limit that an agent shares model blind spots a person wouldn't. Using a different provider with a fresh context is the mitigation.
- The real-device sign-off from #532 (iPhone, desktop Safari, VoiceOver) is done. VoiceOver is re-checked only for controls a fix touches.
- The machine limits from Elias's notes still hold: one implementer at a time, no unbounded local build.
- Ticket boundaries are set after the pick, by `to-tickets`. Phase 1 and the Speed Insights change can be ticketed now.
