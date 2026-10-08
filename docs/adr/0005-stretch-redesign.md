---
status: accepted
date: 2026-10-08
supersedes: 0003-one-page-personal-surface.md (section list, navigation, Library label, About section)
amends: 0004-motion-library-and-token-styling.md (first-paint constraint)
---

# Rebuild the front end in the Stretch direction

The site's front end is rebuilt from scratch in the **Stretch direction**: a clean neutral page, a **Cobalt accent** used large, Bricolage Grotesque condensed at display size with JetBrains Mono for metadata, each project in its own **Project colour**, and one **Fastener** per physical-looking object. It replaces the **Board**. The reasons, the options weighed and the approved scope are in map [#100](https://github.com/3ixas/eliasb.dev/issues/100) and spec [#114](https://github.com/3ixas/eliasb.dev/issues/114); this record holds only the decisions that change earlier ones.

## What this supersedes in ADR 0003

- **Section list.** The four anchors (Home, Work, Outside work, About) become six homepage sections: Hero, Work, How I work, Where I've been, Off the clock and Say hello. Their anchors are `#work`, `#how-i-work`, `#where-ive-been`, `#off-the-clock` and `#say-hello`.
- **Navigation and the Library label.** The "Library" label (and ADR 0002 behind it) goes. The header links to the sections above.
- **The About section.** It is replaced by **Where I've been**, a vertical **Career ruler** with one-line notes. There is no long biography.
- **Compatibility routes.** `/about` redirects permanently to `/#where-ive-been`; `/lab` and `/library` redirect permanently to `/#off-the-clock`.
- **Removed content.** Fantasy football, the Spotify playlist and the London photo leave the page. Their integration modules are deleted, so no unused secret or refresh remains.

## What stays from ADR 0003

One scroll-first homepage as the primary personal surface; `/work` as the full archive; `/work/[slug]` URLs stay stable; authored data stays in the repository; the signal fallbacks and accessibility behaviour stay.

## What this amends in ADR 0004

Motion, design tokens and Tailwind v4 remain the presentation architecture. Its first-paint constraint ("all content is present in the HTML and visible from first paint") is replaced by:

> Content is in the server HTML from first paint. Visually, only the homepage's signature entrance may hold the page, for about 5 seconds; nothing else ever gates content.

The entrance is allowed to hold the page visually because it is the designed opening, not a loader. Three guards make that safe. The hold begins only when reduced motion is off and the page was not restored from the back-forward cache. Held content stays in the accessibility tree, and the real `h1` is complete throughout. A 7 second safety timeout, or any script error, releases the hold. Case studies, the archive and the 404 have no entrance, and returning to `/` client-side never replays it.

## What does not change

ADR 0001: Next.js on Vercel, integrations, snapshots and fallbacks stay as they are, apart from the removals above.

## Consequences

- The Board-era design document becomes history; `docs/design/STRETCH.md` is the live reference.
- Every Board component, its stylesheet and its specs are retired once the new surfaces replace them. Their behavioural intent carries into the new specs.
- The Stretch tokens are `--stretch-*` variables beside the Board's until the Board is retired, so the two do not collide.
- The cost is a second full rebuild of the presentation layer. It is accepted because the data layer is untouched and the Board no longer tells the story the site needs to tell.
