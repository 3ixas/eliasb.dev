# Annotated site review ticket graph — 14 September 2026

Parent contract: [`FEEDBACK-SPEC-2026-09-14.md`](./FEEDBACK-SPEC-2026-09-14.md)

This graph is reviewed before publication as GitHub Issues. Each issue owns an observable vertical outcome and can be reverted without leaving a half-built layer behind.

## Dependency graph

```text
A ──> B ──> C ──> E
\          
 \──> D
 \──> F
```

- **A** establishes content labels and shared homepage card guardrails.
- **B** changes the homepage signal data shape and presentation; **C** consumes its signal markup conventions.
- **E** consumes the source-state/freshness conventions established in **C**.
- **D** and **F** are independent of external data and can be implemented when the integration owner has a clean revision, but commits remain serial on the integration branch.

## Issue A — Identity, work metadata, and repeated copy

**Outcome:** Visitors see the intended short identity and complete project stack labels; the homepage cards have enough spacing to remain legible on narrow screens.

**Scope:** `src/content/site.ts`, homepage project rail markup, signal/card CSS, and the duplicate homepage Library taxonomy line.

**Exclusions:** No live integration changes, no new artwork, and no copy changes outside the annotated surfaces.

**Dependencies:** None.

**Acceptance:**

- Hero and footer short display contexts use `Elias`; full metadata name remains `Elias Bennett`.
- Argus reads `C# · .NET · Kafka · PostgreSQL · SignalR · Next.js`.
- Flowtime exposes `Next.js · TypeScript · localStorage · Service Worker` in the same project-rail position as Argus.
- GitHub status chip has a visible gap before its headline at desktop and mobile widths.
- Reading cover, title, description, and source link do not overlap at narrow widths.
- Homepage Library preview does not repeat the destination taxonomy line.

**Verification:** lint, typecheck, focused homepage render at 390px and desktop width, `git diff --check`.

## Issue B — Homepage signal redesign

**Outcome:** The signal grid communicates authored training, annual building activity, local London presence, and a more visual but anonymous NFL matchup.

**Scope:** GitHub contribution calendar/data mapping, homepage signal types and markup, authored seven-day training schedule, CSS/SVG London treatment, and fantasy field/scoreboard styling.

**Exclusions:** No Apple Health, Apple Workouts, Bevel, new fitness API, private repository names, opponent identity, or fabricated live totals.

**Dependencies:** A for stable signal/card spacing and shared content conventions.

**Acceptance:**

- Token-backed GitHub totals and label cover the trailing year; the no-token path says public-only and never exposes private repository details.
- The year view is keyboard/readers accessible through a meaningful `aria-label` and has a calendar-like grid.
- The default training card says it is a typical/curated week and lists Monday through Sunday with the agreed sessions.
- Local signal includes a small site-owned London visual without obscuring the time or status copy.
- Fantasy card gains an NFL-inspired scoreboard/field motif while the opponent remains `OPP`/anonymous.

**Verification:** `pnpm verify:signals`, typecheck, focused data-shape assertions, homepage render at 390px and desktop, private-data grep over rendered signal output.

## Issue C — Watching, Letterboxd freshness, and Spotify separation

**Outcome:** Watching and listening are distinct, the homepage embeds the configured playlist, and a newly logged Letterboxd film becomes visible within the documented cache window.

**Scope:** Culture signal copy/markup, Letterboxd `revalidate` and freshness state, removal of the duplicate Playlist link, responsive Spotify embed, and associated fallback wording.

**Exclusions:** No TMDB credential, HTML scraping, or unrelated music service integration.

**Dependencies:** B's signal markup conventions; may be developed after A without changing B's data contract.

**Acceptance:**

- Culture card heading is `Watching`, contains the poster/rating/source, and contains no Playlist link.
- Homepage Spotify panel renders the official embed for the configured playlist ID with site-owned heading/description.
- Letterboxd fetch uses a 15-minute or shorter revalidation window and returns a visible updated/fallback state.
- Authored film content appears only on fetch/parse failure.
- Library playlist remains the canonical full-size embed.

**Verification:** inspect feed integration options, typecheck, responsive homepage/Library render, and a deterministic fallback test.

## Issue D — Lab destinations and imagery

**Outcome:** Every Lab card opens a stable location and carries a deliberate accessible visual treatment.

**Scope:** `labNotes` destinations, card open affordances, CSS/SVG visual treatments for Professor Past, Fantasy models, and Interface studies, and corresponding `/lab` anchors/alt semantics.

**Exclusions:** No fabricated product screenshots and no new external image source.

**Dependencies:** None; integrate on the current clean branch.

**Acceptance:**

- Cards navigate to `/lab#lab-01`, `/lab#lab-02`, and `/lab#lab-03`.
- Each card has visible open text, keyboard focus, and either meaningful alt text or explicit decorative semantics.
- Visuals use site-owned CSS/SVG or existing project imagery and remain legible in light/dark themes.

**Verification:** keyboard tab/enter navigation, narrow/desktop render of homepage and `/lab`, typecheck, `git diff --check`.

## Issue E — Library source freshness and content bounds

**Outcome:** Library objects remain readable as live feeds change, and the weekly History contract is explicit and bounded.

**Scope:** Goodreads summary clamp and 30-minute freshness state, short site-owned film description contract, seven-day Wikimedia behaviour/source links, and removal of the empty Science fiction placeholder.

**Exclusions:** No route rename, TMDB key, synopsis scraping, or new collection content.

**Dependencies:** C's source-state/freshness presentation conventions.

**Acceptance:**

- Long Goodreads `book_description` values are reduced to a short readable summary inside the object; title, author, cover, and Goodreads link remain live.
- Reading shows a documented live/fallback freshness state; fallback is visibly distinct.
- Film object has a brief bounded description and preserves Letterboxd rating/source.
- History requests Monday-of-week Wikimedia data with a seven-day cache, displays `Wikimedia · cached`, and uses a deterministic labelled fallback on failure.
- Empty Science fiction placeholder is removed from the Library index.

**Verification:** feed parser fixtures for long Goodreads descriptions, history cache/source assertions, Library open-object render at narrow width, typecheck and build.

## Issue F — About composition and personal texture

**Outcome:** About explains the shared thread plainly, has deliberate editorial composition and restrained colour, and includes Reading and History in the personal texture.

**Scope:** About statement markup/CSS, journey heading/copy, palette framing, and the Outside the editor card grid.

**Exclusions:** No new personal claims, unrelated navigation changes, or live fitness data.

**Dependencies:** None; integrate serially after the current branch is clean.

**Acceptance:**

- Statement columns sit in a deliberate composition tied to the heading and portrait rhythm.
- Journey heading reads `The thread through all of it` and names `How do you make complicated things easier to understand?`.
- Statement and journey use restrained existing green/yellow/blue framing with readable contrast in both themes.
- Outside the editor includes Reading and History alongside Lift, Run, Muay Thai, and Football; the grid remains balanced on mobile and desktop.

**Verification:** `/about` render at narrow and desktop widths, keyboard focus, reduced-motion check, lint/typecheck, `git diff --check`.

## Shared final proof

After all six slices are integrated, run the parent specification's complete verification contract and map every acceptance claim to the final exact revision before any merge/deployment action.

