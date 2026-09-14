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

### Library and About

16. The live Goodreads description must be constrained to a short, readable summary in the open book object. Do not let a full retailer synopsis escape the object bounds; preserve the live title, author, cover, and source link.
17. The film object should have a brief description of the film. Letterboxd's RSS feed provides the diary entry, poster, rating, and the member's review text, but not a reliable synopsis. Keep the current live RSS path and design the description contract so a cached TMDB enrichment can be added if a server-side TMDB key is approved; until then use a short site-owned fallback rather than scraping an untrusted page.
18. The current reading item is live, not permanently hardcoded: Goodreads currently returns `Dark Age` through the public `currently-reading` RSS feed. The authored fallback is only used when the feed fails. Add a documented refresh interval and freshness state so a new shelf item does not appear inexplicably stale.
19. Keep the History object as a live weekly pull from Wikimedia with a seven-day cache and deterministic fallback. The current `WIKIMEDIA · CACHED` label and Monday-of-week date are useful; retain them while verifying the source link and cached behaviour.
20. Remove the empty Science fiction placeholder from the Library index for now. Let the weekly History object use the available space; add a real science-fiction collection only when there is material to show.
21. Rework the About statement layout. The two prose columns currently read as an isolated text box; they should sit in a deliberate editorial composition tied to the statement heading and the portrait/section rhythm.
22. Replace `Different work, one recurring question.` with plain language that names the thread the three journey entries actually share. Recommended direction: `The thread through all of it` followed by `How do you make complicated things easier to understand?`.
23. Give the About statement and journey sections a little colour and visual structure using the existing green, yellow, and blue palette. Keep the typography calm and readable; use colour as a framing device rather than decoration.
24. Extend `Outside the editor` with reading and history. Add authored cards for `Reading` and `History` alongside Lift, Run, Muay Thai, and Football, then verify the grid remains balanced on mobile and desktop.

## Explicit non-goals

- No Apple Health, Apple Workouts, Bevel, or new fitness API integration is part of this pass.
- No fabricated live training totals or inferred workout history.
- No change to the `/library` route or its visible navigation label in this pass.
- No public repository names, private contribution details, opponent identity, or precise training routes are exposed.
- No TMDB credential or HTML scraping integration is added without an explicit source/credential decision.

## Delivery slices

### Slice A — Identity, work metadata, and repeated copy

Owns the short display name, Argus and Flowtime stack labels, GitHub chip spacing, reading-card layout fix, and the duplicate Library taxonomy line. It is independently reviewable on the homepage at desktop and narrow mobile widths.

### Slice B — Homepage signal redesign

Owns the London visual, authored seven-day training schedule, NFL-inspired matchup treatment, and the annual GitHub contribution calendar. It includes the data-shape changes and the no-live-data wording needed to keep the surfaces truthful.

### Slice C — Watching, Letterboxd freshness, and Spotify separation

Owns the watching-only culture card, Letterboxd refresh interval/freshness context, removal of the duplicate playlist link, and the homepage Spotify embed. It verifies the feed picks up a newly logged film within the documented interval, the embed remains responsive, and the Library panel still works as the full-size version.

### Slice D — Lab destinations and imagery

Owns stable Lab anchors, clear open affordances, and the three visual assets. It verifies navigation, keyboard focus, and image alt text on both the homepage cards and `/lab`.

### Slice E — Library source freshness and content bounds

Owns the Goodreads description clamp and freshness state, the film-description contract and optional TMDB enrichment boundary, the confirmed weekly Wikimedia behaviour, and removal of the empty Science fiction placeholder. It verifies that live feed content stays inside the designed objects and that fallbacks are clearly distinguishable.

### Slice F — About composition and personal texture

Owns the About prose composition, the plain-language journey thread, colour/pop for the About sections, and the Reading/History cards. It verifies the hierarchy at narrow and wide widths without turning the page into a dashboard.

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

The implementation can proceed with the recommended defaults above. The only assets that may need Elias's final preference are the London visual and the three Lab illustrations; the fallback is to use restrained site-owned CSS/SVG artwork so delivery does not wait on external image sourcing. Film synopsis enrichment remains an explicit integration choice: keep the no-credential fallback or approve a server-side TMDB key and attribution path.
