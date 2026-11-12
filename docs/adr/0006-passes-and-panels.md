---
status: accepted
date: 2026-11-12
supersedes: the quiet index as the design direction (docs/design/history/QUIET-INDEX.md); ADR 0005's type choices (Bricolage Grotesque and DM Mono)
---

# Rebuild the front end as passes and panels

Elias approved the **passes and panels** direction on 11 November 2026 and answered its open decisions on 12 November. The first screen is the opening line and three **Staff passes**, drawn as real ID cards; after it, each subject gets a **Panel** sized by how much it matters, in its own colour, with its proof drawn on it. The contract is `docs/design/DESIGN.md`, the build spec `docs/specs/PASSES-AND-PANELS-SPEC.md` (R-01 to R-40), and the work eighteen tickets under [#409](https://github.com/3ixas/eliasb.dev/issues/409). How the direction was reached is in `docs/specs/CRAFT-ELEVATION-SPEC.md`. This record holds only the decisions that change earlier ones.

## Decisions

- **Four rules decide the design.** Rank by importance, never by duration; proof is visible without a click; text earns its place; motion has a job. A change that breaks one is Elias's decision, not a reviewer's.
- **The quiet index retires.** The row, closer looks, the margin, the objects at 44 px and the four-screen length budget go (R-32). Its contract is kept as history in `docs/design/history/QUIET-INDEX.md`.
- **Type.** Newsreader (variable, optical size on) for headings, figures and prose; Instrument Sans for interface text. Both self-hosted through `next/font` with fallback faces sized from each font's metrics. Bricolage Grotesque and DM Mono retire in #420; the Résumé sheet keeps JetBrains Mono.
- **Tokens take role names.** `--page`, `--paper`, `--ink`, `--muted`, `--hair`, `--tint`, `--cobalt`, `--green`, the GitHub year's `--year-0` to `--year-4`, and the `--type-*` scale, in `src/app/tokens.css`. They carry no design's name, so they outlive this direction. They sit beside the `--stretch-*` set until #420.
- **One integration branch.** Every ticket merges into `integration/passes-and-panels`, which has `main`'s required checks and blocks force-pushes and deletion. `main`, and so production, keeps the quiet index until #422 merges the branch with Elias's approval, so production never shows half a redesign.

## What stays

The routes, redirects and anchors (R-28); every fact and sentence (R-27; a new or changed string needs Elias's exact before and after); the integrations and their fallbacks (R-30); the theme controller, its storage and its crossfade (R-06); the greeting (R-09); the Résumé sheet and its PDF (R-24); and ADR 0005's rule that content is complete in the server HTML and never waits for motion.
