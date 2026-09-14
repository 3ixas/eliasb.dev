# Personal site feedback review — 14 September 2026

## Purpose

This document turns the first hands-on review of the Cabinet of Curiosities build into evidence-backed requirements, implementation slices, and GitHub issue boundaries. It is based on:

- Elias's seven annotated mobile screenshots, covering the homepage, Lab, and Library.
- A live accessibility and visual audit of `https://eliasb-dev.vercel.app/` and `/library` on 14 September 2026.
- Source inspection of the current branch, including the homepage, Library, integrations, and shared motion/theme styles.
- The existing launch validation in `docs/launch/VALIDATION.md`.

The review site remains a no-index preview. The production domain is unchanged.

## Findings

### P0 — The entrance needs a calmer sequence

The current `SignatureLine` starts a client-side interval immediately and renders the finished statement as an invisible layout ghost. On the live page the result feels sudden and jittery, which is the opposite of the requested Commissioner-style arrival.

**Requirement:** on a fresh visit, show a quiet opening state, type the first part of the statement at a measured pace, settle the line into its final position, then reveal the rest of the page with short, opacity/transform-only transitions. The sequence must be quick, interruptible, and disabled for reduced-motion users. Avoid layout shifts and avoid a looping or attention-seeking animation.

### P1 — Work needs one visual language

Threshold has a prominent image while Argus Risk has no image and Flowtime's image is hidden by the base rail rule. The three selected projects therefore receive different visual weight.

**Requirement:** give Argus Risk and Flowtime a distinct image treatment above their card copy, using the existing work assets where possible. Keep card links and case-study hierarchy intact. Do not manufacture project screenshots.

### P1 — Homepage navigation and link affordances

The homepage and collection headers expose Work, Lab, Library, and About. Home is only reachable through the E/B mark. The mobile bottom bar itself is intentional and should remain because Elias finds it reachable and accessible.

**Requirement:** add an explicit Home item to the primary navigation, preserve the mobile bottom placement, and make its active state clear. Replace emoji-like arrow glyphs with one shared arrow token that renders consistently across platforms. Add subtle link/page transitions without delaying navigation.

### P1 — Personal signals should be designed, not embedded dashboards

The current homepage exposes a Strava iframe that only shows the weekly running summary. It is visually foreign to the site and does not represent lifting, running, and Muay Thai together. The Fantasy Football card is mostly text, and the homepage film card has no poster even though the Library has one. Spotify only appears as a link on the homepage.

**Requirements:**

- Keep private GitHub repository names and details private while using the contribution calendar when a server token is configured. The no-token fallback must say that it is public-only rather than implying all contributions are present.
- Replace the Strava iframe with a site-owned activity summary. A first version may use Strava's authenticated activity API and show weekly counts by sport, with a static authored fallback when credentials are unavailable. Never imply that a Bevel API exists: Bevel's own help currently documents Strava as a one-way push integration, and its public API/webhook request remains planned.
- Make Fantasy Football a small visual matchup object: score, week, form/record, and a simple chart or badge, while keeping opponent identity anonymous.
- Add the Letterboxd poster and a short film description to the homepage culture card.
- Add a designed Spotify playlist panel to the homepage, with Elias's own heading, description, artwork treatment, and last-updated context around the official embed.

### P1 — Lab cards must communicate their state

Only Ask Professor Past currently has a destination. Fantasy models and Interface studies look like links but do nothing, and Explore the Lab uses the same inconsistent arrow treatment.

**Requirement:** either make each card a real destination or clearly label it as a coming-soon object. The first implementation should link Fantasy models and Interface studies to stable Lab anchors/routes where useful, preserve keyboard focus, and use the shared transition/arrow treatment.

### P1 — Library has functional and content defects

The live `/library` audit confirms that the theme toggle changes the root theme but leaves the Library colours unchanged because the page uses hard-coded light palette values. The open-object details also remain open when the reader clicks the inside page; only the summary/click target toggles the native `details` element. The Library contains a redundant “current rotation” object above the Spotify panel, and the copy is more theatrical than Elias wants.

**Requirements:**

- Define Library palette variables for both themes and use them for the room, objects, playlist panel, and index. Preserve the Cabinet character in both modes.
- Make the open object intuitive to close: the visible inside page and an explicit Close object control must both close it, with keyboard support.
- Add a short plain-English description to every opened book, film, and music object. Keep source links separate from the description.
- Remove the duplicate current-rotation record. Keep one Spotify playlist panel and give it a direct, personable heading.
- Fix the overlapping field-note text by separating the prose and placeholder/status regions and by checking narrow viewports.
- Keep `/library` as the route for now. The visible navigation label remains an open information-architecture decision; candidate labels include Shelf, Notes, Culture, or Archive. Do not rename it silently.

### P1 — Voice and spelling need a single pass

Several phrases read as deliberately cinematic rather than personal, including “built as a shelf of objects rather than a feed”, “A playlist with the aux cable”, and “Kept by hand, played through Spotify…”. The site also contains American spellings such as “visualization”.

**Requirement:** rewrite public-facing copy in natural British English, keeping the warmth and specificity while removing inflated metaphors. Use “visualisation”, “behaviour”, and similar British forms consistently. The copy must describe what a visitor can actually see or do.

### P2 — History should become a useful, small interaction

The current History and Science Fiction cards describe future interests but do not yet give a visitor anything to explore. Wikimedia documents an API surface for “events from this day in history”.

**Requirement:** prototype a weekly “This week in history” object using a source-backed, cached feed with a visible source link and a deterministic fallback. Keep the first version small: one or a few facts, no daily maintenance promise, no unsourced trivia. Science fiction can remain an authored index until there is a real collection to show.

### P2 — Identity polish

The site already has `src/app/icon.svg`, but the current feedback calls out the “dev icon thing” as something to review.

**Requirement:** inspect the favicon/app icon, metadata, and social preview together. Make the icon legible at small sizes and consistent with the E/B mark, then verify it on the review deployment.

## Research notes and boundaries

- GitHub's GraphQL `ContributionsCollection` exposes the contribution calendar and restricted/private contribution counts when the account has enabled private contribution counts. The implementation must use aggregate counts only; repository names and event descriptions remain public-only.
- Strava's official API can list an authenticated athlete's activities with `activity:read`/`activity:read_all` scopes. The public embed is not a suitable visual surface for this design. Credentials, refresh tokens, and detailed routes remain server-only.
- Bevel's current help documents Strava as a one-way integration that pushes workouts to Strava; Bevel's public API/webhook request is still marked planned. Treat Bevel as unavailable for live site data until an official API exists.
- Wikimedia's API catalogue documents “events from this day in history”. Any history card must link to the source and use caching/fallback behaviour.

## Delivery slices

1. **Motion, navigation, and arrow system:** hero entrance choreography, reduced-motion path, page/link transitions, Home item, shared arrow token.
2. **Work and signal visual hierarchy:** Argus/Flowtime images, poster and Spotify homepage panels, Fantasy object treatment, copy/spacing needed to support them.
3. **Library functional pass:** theme tokens, close interactions, descriptions, remove current rotation, fix field-note overlap, plain-language copy.
4. **Data sources:** GitHub contribution token/fallback wording, Strava all-activity summary with authored fallback, weekly history object.
5. **Editorial and identity pass:** British English sweep, homepage/Library voice, favicon and social metadata review.

Each slice should be independently reviewable and deployable. The first PR will cover slices 1–3 where no new third-party credentials are required; data-source work remains behind explicit environment variables and documented fallback behaviour.

## Open decision

The only information-architecture decision still needed is the visible replacement for “Library” beside “Lab”. The route can remain `/library` regardless. Recommended candidates to test in the next design review are **Shelf** (most personal), **Notes** (clearest), and **Culture** (most literal).

