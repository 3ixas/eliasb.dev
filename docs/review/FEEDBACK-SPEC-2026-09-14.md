# Annotated site review implementation specification — 14 September 2026

## Contract status

This is the implementation contract for the annotated review recorded in [`FEEDBACK-ANNOTATIONS-2026-09-14.md`](./FEEDBACK-ANNOTATIONS-2026-09-14.md). It is written against the current `codex/annotated-feedback-2` revision and is the source of truth for the GitHub parent issue and its child slices.

The approved product direction is a personal, editorial site that exposes small authored signals around live sources without presenting private activity as a dashboard. The implementation may use restrained site-owned CSS/SVG artwork for the London and Lab visuals. Film synopsis enrichment is deferred: this pass keeps a short site-owned description and does not add a TMDB credential or scrape third-party HTML.

## Outcome

The annotated homepage, Lab, Library, and About surfaces should read as one coherent personal site at desktop and narrow mobile widths. Live integrations must be recognisably live, cached, and bounded; authored content must be labelled as curated or fallback. Every requested change must be observable through the rendered UI, keyboard navigation, source links, or the signal verification checks.

## Current behaviour and desired behaviour

| Surface | Current behaviour | Desired behaviour |
| --- | --- | --- |
| Identity and work | Hero says `Elias B.`; Argus and Flowtime have incomplete/missing stack labels. | Use `Elias` in short display contexts, show the agreed stacks, and keep project metadata consistent. |
| Homepage signals | GitHub shows a 28-day strip; training shows zero live-style metrics when no Strava token; fantasy and local cards leave visual space unused; reading can overlap. | Show a year contribution calendar, an authored typical training week, compact London and NFL motifs, and stable non-overlapping card layouts. |
| Watching and music | Culture card combines watching with playlist links; homepage playlist is only a link; Letterboxd/GitHub/Goodreads state can look stale. | Separate watching and Spotify, embed the playlist, use short documented revalidation windows, and expose source/fallback state. |
| Lab | Cards have anchors inconsistently and have no dedicated imagery. | All cards navigate to stable destinations and contain accessible site-owned visual treatments. |
| Library | Goodreads synopsis can overflow; film copy is generic; reading is live but freshness is implicit; Science fiction is an empty placeholder; history is weekly cached. | Bound live descriptions, retain live source data with visible freshness/fallback state, keep the weekly history contract, and remove the empty placeholder. |
| About | Statement prose is an isolated two-column box; journey heading does not name its thread; sections are visually flat; personal texture omits reading/history. | Deliberately compose the statement, explain the shared thread in plain language, add restrained palette framing, and include Reading and History cards. |

## Affected contracts and implementation decisions

### Source and cache contracts

- `getGitHubSignal()` continues to use the GitHub GraphQL contribution calendar when `GITHUB_SIGNAL_TOKEN` is present. The query must cover the trailing year, map all returned days into a stable year calendar, and report the total as `contributions this year`. Without a token, the public-events fallback must say `public only` and must never imply private totals.
- `getCultureSignal()` continues to use the public Letterboxd RSS feed. Its `revalidate` window is 15 minutes, and the returned signal includes a human-readable freshness label derived from `updatedAt`. The authored film is used only if the fetch or parse fails. The feed does not provide a reliable synopsis, so this pass uses a short site-owned description contract; adding TMDB remains deferred.
- `getReadingSignal()` continues to use the public Goodreads currently-reading RSS feed. Its `revalidate` window is 30 minutes. The raw `book_description` is reduced to a bounded summary before it reaches the UI, while title, author, cover, and source remain live. A visible state/freshness label distinguishes live data from the authored fallback.
- `getHistorySignal()` remains a Monday-of-week Wikimedia “On this day” request with `revalidate: 604800`. The URL contains the Monday date, so a new week creates a new cache key. The live card keeps `Wikimedia · cached`, the week label, event source links, and a deterministic authored fallback when Wikimedia is unavailable.
- `getTrainingSignal()` may continue to use Strava when credentials exist for a future live mode, but this review's default public presentation is a curated typical week. It must not claim Apple Health, Apple Workouts, Bevel, or Strava synchronisation for the authored schedule. The Strava profile link may remain separate.

### UI and data-shape contracts

- The homepage `PersonalSignal` types remain serialisable server-to-client values. New fields should express state explicitly rather than use sentinel strings.
- The annual GitHub activity model is an ordered list of day cells with ISO dates and counts. It must render with an accessible label and retain aggregate private counts only; repository names and event details remain absent from the private path.
- The authored training schedule is seven day entries (`Monday` through `Sunday`) with a session label. The UI presents a readable list/grid, not zero-filled live metrics.
- The Spotify embed uses the configured playlist ID and the same official embed on the homepage and Library. Surrounding heading/description copy remains site-owned.
- Lab cards have stable `/lab#lab-01`, `/lab#lab-02`, and `/lab#lab-03` destinations, visible open actions, keyboard focus, and meaningful alt text or `aria-hidden` treatment for decorative CSS art.
- `ClosableDetails` keeps the explicit close button and also closes when the visible object page is clicked outside a link or button. This behaviour must continue to work with the bounded Library content.

## Slice graph

The slices are vertical and ordered by shared contracts:

1. **A — Identity, work metadata, and repeated copy.** Owns the short name, Argus/Flowtime stack labels, GitHub chip spacing, reading-card layout guardrails, and removal of the duplicated homepage Library taxonomy. It is independent after the current content/types are inspected.
2. **B — Homepage signal redesign.** Depends on A's card markup conventions. Owns the London visual, authored seven-day schedule, NFL matchup treatment, and annual GitHub calendar/data shape. It includes the copy needed to keep authored values truthful.
3. **C — Watching, Letterboxd freshness, and Spotify separation.** Depends on the signal markup from B. Owns watching-only copy, duplicate Playlist removal, 15-minute Letterboxd revalidation/freshness, and the homepage Spotify embed.
4. **D — Lab destinations and imagery.** Independent of the external data integrations; may run alongside C but is integrated serially. Owns stable links, open affordances, and three site-owned visual treatments.
5. **E — Library source freshness and content bounds.** Depends on the source-state conventions from C. Owns Goodreads summary bounds and 30-minute freshness, the short film description contract, the verified weekly History behaviour, and removal of the empty Science fiction object.
6. **F — About composition and personal texture.** Independent of live integrations. Owns About layout/copy/colour and Reading/History cards, with responsive evidence on `/about`.

The integration owner materialises each slice on one branch, inspects the exact diff, runs focused checks, invokes code review immediately before its commit, and then proceeds in dependency order. No slice may silently add a new credential, external image source, or product decision.

## Acceptance evidence

At the exact final revision:

- `pnpm lint`
- `pnpm exec tsc --noEmit --incremental false`
- `pnpm verify:signals`
- `pnpm build --webpack`
- `git diff --check`
- Render and inspect the homepage and `/about`, `/lab`, and `/library` at narrow mobile and desktop widths.
- Confirm the hero reads `Elias`, Argus includes `C# · .NET`, Flowtime exposes its stack, and no reading text overlaps its cover/title/description.
- Confirm the GitHub card says the total covers the year, shows a year-shaped calendar, and labels the fallback public-only path when no token is available.
- Confirm the training card shows the seven authored sessions with no live-data claim; the fantasy card keeps the opponent anonymous and gains the NFL treatment; the London visual does not obscure the local time/status.
- Confirm the culture card is labelled `Watching`, has no Playlist link, and the homepage Spotify panel renders the official responsive embed.
- Confirm a Letterboxd feed response is cached for no more than 15 minutes, Goodreads for no more than 30 minutes, and the Library shows labelled fallback states when a source fails. Confirm History retains the Monday week label, `Wikimedia · cached`, source links, and seven-day cache contract.
- Confirm each Lab card opens `/lab#lab-01`, `/lab#lab-02`, or `/lab#lab-03`, is keyboard reachable, and has an accessible decorative/image treatment.
- Confirm Library live descriptions remain inside their objects, the Science fiction placeholder is gone, and the close button/object-page click still closes opened objects.
- Confirm About clearly states `The thread through all of it` and `How do you make complicated things easier to understand?`, has restrained palette framing, and includes Reading and History in the personal grid.
- Confirm review deployment metadata remains `noindex, nofollow`.

## Explicit exclusions and limits

- No Apple Health, Apple Workouts, Bevel, or new fitness API integration.
- No fabricated workout totals, private repository names/details, opponent identity, or precise routes.
- No TMDB key, HTML scraping, or other synopsis enrichment without a separate approved decision.
- No external stock images; London and Lab visuals are CSS/SVG or existing project imagery.
- No rename of the `/library` route or its navigation label.
- No production deployment or merge is implied by this document; those remain separate authorised actions after verification.

