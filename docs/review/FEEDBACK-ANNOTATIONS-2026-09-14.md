# Personal site annotated review — 14 September 2026

## Purpose

This review turns the second hands-on pass of the Cabinet of Curiosities build into an executable change set. It is based on fifteen browser annotations on the no-index review deployment at `https://eliasb-dev.vercel.app/`, plus source inspection of the current homepage, integrations, Lab, and Library surfaces.

The annotations are treated as product requirements. The screenshots are evidence of the visible defects and spacing, not a source of additional copy or behaviour.

## Agreed changes

### Identity and selected work

1. The homepage kicker should say `Elias · Software engineer · London`. Use `Elias` for the short display name in the hero and footer while retaining the full name where a legal or metadata name is appropriate.
2. Argus Risk should list its real implementation stack, including C# and .NET: `C# · .NET · Kafka · PostgreSQL · SignalR · Next.js`.
3. Flowtime should list its implementation stack in the same place as the other projects. Use the case-study source of truth: `Next.js · TypeScript · localStorage · Service Worker`.
4. The GitHub status chip needs more breathing room before the contribution headline.
5. The reading signal needs a stable vertical layout so its status, cover, title, and description never overlap at narrow widths.
6. Remove the repeated `Books · Cinema · History · Science fiction · Music` line from the homepage Library preview; the destination page already introduces those categories.

### Homepage signals

7. Keep the local-time/status signal, but use its open space for a small site-owned London visual. The first implementation should be a restrained duotone illustration or line treatment rather than an external stock image. Keep the current status text readable and separate from the visual.
8. Replace the empty training metrics with an authored typical week, clearly labelled as a typical schedule rather than live data:

   - Monday — Full body
   - Tuesday — Zone 2 run
   - Wednesday — Full body
   - Thursday — Interval run
   - Friday — Full body
   - Saturday — Zone 2 rowing machine
   - Sunday — Interval assault bike

   Do not imply Apple Health, Apple Workouts, Bevel, or Strava synchronisation. The public Strava profile may remain a separate source link, but the schedule itself is curated.
9. Give the Fantasy Football signal a more visual NFL-inspired treatment: a compact scoreboard/field motif, week context, and the existing anonymous opponent boundary. Do not add a borrowed league logo or expose another manager's identity.
10. Change the GitHub contribution signal from a 28-day strip to a year view comparable to GitHub's contribution calendar. The headline and accessible label must say that the total covers the year, and private repository names/details must remain hidden.
11. The culture signal should be a watching card only. Remove its duplicate Playlist link and change the heading from `Listening / watching` to `Watching`.
12. The homepage Spotify panel should contain the actual Spotify playlist embed, surrounded by the site's own heading and short description. The dedicated Library playlist panel remains the canonical full-size embed.
13. The Letterboxd card must refresh often enough to reflect a newly logged film. The current public RSS feed contains `The Invite` (logged 14 September 2026), while the review deployment still shows the previous cached item, `Avengers: Infinity War`. Reduce the feed and homepage revalidation window to a short, documented interval (recommended: 15–30 minutes), keep the authored film only as a failure fallback, and expose enough freshness context to make a stale integration diagnosable.

### Lab

14. Every Lab card must have a real destination. Ask Professor Past should point to `/lab#lab-01`; Fantasy models and Interface studies should keep their stable anchors. The card should show a clear open action and remain keyboard reachable.
15. Add one visual asset to each Lab card. These should be site-owned editorial illustrations or real project imagery where available, not fabricated product screenshots. The initial direction is a small typographic/diagrammatic illustration for Professor Past, an NFL/data visual for Fantasy models, and a component/state study for Interface studies.

## Explicit non-goals

- No Apple Health, Apple Workouts, Bevel, or new fitness API integration is part of this pass.
- No fabricated live training totals or inferred workout history.
- No change to the `/library` route or its visible navigation label in this pass.
- No public repository names, private contribution details, opponent identity, or precise training routes are exposed.

## Delivery slices

### Slice A — Identity, work metadata, and repeated copy

Owns the short display name, Argus and Flowtime stack labels, GitHub chip spacing, reading-card layout fix, and the duplicate Library taxonomy line. It is independently reviewable on the homepage at desktop and narrow mobile widths.

### Slice B — Homepage signal redesign

Owns the London visual, authored seven-day training schedule, NFL-inspired matchup treatment, and the annual GitHub contribution calendar. It includes the data-shape changes and the no-live-data wording needed to keep the surfaces truthful.

### Slice C — Watching, Letterboxd freshness, and Spotify separation

Owns the watching-only culture card, Letterboxd refresh interval/freshness context, removal of the duplicate playlist link, and the homepage Spotify embed. It verifies the feed picks up a newly logged film within the documented interval, the embed remains responsive, and the Library panel still works as the full-size version.

### Slice D — Lab destinations and imagery

Owns stable Lab anchors, clear open affordances, and the three visual assets. It verifies navigation, keyboard focus, and image alt text on both the homepage cards and `/lab`.

## Verification contract

- `pnpm lint`
- `pnpm exec tsc --noEmit --incremental false`
- `pnpm verify:signals`
- `pnpm build --webpack`
- `git diff --check`
- Review the homepage at a narrow mobile viewport and a desktop viewport.
- Verify light/dark themes, keyboard focus, reduced motion, and no-overlap reading/training cards.
- Verify `/lab`, `/library`, and all Lab anchors after navigation from the homepage.
- Confirm the review deployment remains `noindex, nofollow`.

## Open design inputs

The implementation can proceed with the recommended defaults above. The only assets that may need Elias's final preference are the London visual and the three Lab illustrations; the fallback is to use restrained site-owned CSS/SVG artwork so delivery does not wait on external image sourcing.
