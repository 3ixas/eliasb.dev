# Live integration research

Checked against official sources on 2026-09-13. These are feasibility findings, not final architecture decisions.

## Implementation status

- **GitHub:** connected through a server-only adapter with six-hour revalidation. It uses public events without credentials and can add aggregate private contribution counts when `GITHUB_SIGNAL_TOKEN` is configured. Private repository names never reach the page.
- **Sleeper:** connected to Elias's 2026 showcase league through the public, read-only API. The opponent remains anonymised as `OPP`.
- **Manual status:** stored as public site content with an expiry, preventing an old note from appearing current indefinitely.
- **Spotify:** the selected public playlist is presented through Spotify's official embed inside a site-designed Library section.
- **Books:** the public Goodreads `currently-reading` RSS feed supplies the current title, author, cover, and source link. The site retains a last-known fallback and keeps personal notes site-owned.
- **Films:** the public Letterboxd RSS feed supplies the latest diary entry, year, rating, poster, and source link, with a last-known fallback.
- **Training:** the homepage links to Elias's public Strava profile while keeping the cross-sport summary authored. The selected launch treatment is Strava's official last-week running summary inside a site-designed frame; activation awaits the embed code from Elias's profile.

The connected sources use Next.js’s persistent Data Cache and bundled last-known fallbacks. Public account identifiers live in typed site content; only the optional GitHub token is an environment secret. The accepted durable Blob snapshot remains the deployment-hardening architecture once the Vercel project is configured.

## Shared approach

Fetch external data away from the visitor's browser, normalize it into small site-owned snapshots, retain the last successful result, and show when it was updated. Each experience needs a designed loading, stale, unavailable, and empty state. Secrets must never reach the browser.

## GitHub

**Feasible.** GitHub's authenticated GraphQL API exposes the contribution calendar. Its REST API exposes recent public events, although those events can be delayed and cover only a recent window.

Recommended approach:

- Refresh a curated snapshot on a schedule rather than querying GitHub for every visitor.
- Allowlist repositories and meaningful event types.
- Show a contribution visualization and a small recent-building narrative.
- Include aggregate private contribution counts where GitHub makes them available, without revealing private repository details or branch names. Elias accepts that daily counts disclose some work cadence.
- Label recent activity accurately and show the update time.

Sources: [contribution calendar](https://docs.github.com/en/graphql/reference/users#contributioncalendar), [public events](https://docs.github.com/en/rest/activity/events#list-public-events-for-a-user), [contribution visibility](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference).

## Books

**Feasible with site-owned reading data.** Goodreads no longer offers a viable new public API, and StoryGraph does not currently offer a public API. Open Library provides supported book metadata and cover APIs.

Recommended approach:

- Keep the canonical reading status, personal note, and chosen books in the site content.
- Use an ISBN or Open Library identifier to enrich covers and metadata during a scheduled refresh.
- Cache the result and provide a designed text-cover fallback.
- Build the interactive book or shelf as an original site experience rather than embedding a tracker.

Sources: [Goodreads Developers group](https://www.goodreads.com/group/show/8095-goodreads-developers), [StoryGraph API roadmap](https://roadmap.thestorygraph.com/features/posts/an-api), [Open Library APIs](https://openlibrary.org/developers/api), [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers).

## Films

**Feasible.** Letterboxd's general API is request-only and is not intended for a private personal data-visualization project. Letterboxd provides an official RSS feed for each public profile. TMDB can supply poster and film metadata subject to its attribution rules.

Recommended approach:

- Read recent diary entries or reviews from the official Letterboxd RSS feed on a modest schedule.
- Enrich selected entries with cached TMDB posters and metadata.
- Link each film back to Letterboxd.
- Use a manual or last-known fallback when either source is unavailable.
- Treat viewing dates, ratings, and reviews as public information only when Elias intentionally publishes them.

Sources: [Letterboxd API access](https://letterboxd.com/api-beta/access/), [Letterboxd FAQ and RSS](https://letterboxd.com/faq/), [TMDB developer FAQ](https://developer.themoviedb.org/docs/faq).

## Training

**Conditional.** Strava's API Agreement effective 1 June 2026 restricts API-derived athlete data to display for the authenticated athlete. It does not support a custom public training-summary widget.

Viable approaches:

1. Use an official Strava embed for a public activity, route, recent uploads, or last-week running or cycling summary.
2. Maintain an independent, manually authored training summary that does not derive from the Strava API.
3. Use original activity files or measurements obtained directly from the recording device or another independently controlled source, before they enter Strava.

Webhooks remain part of the Strava API and do not avoid the public-display restriction. Manual account exports do not clearly provide a supported automatic-publication route. Automated custom public display of Strava-derived activity would require written approval from Strava.

The confirmed launch approach is Strava's official last-week running summary inside a designed frame, surrounded by the broader authored `Lift · Run · Muay Thai` context and a link to Elias's profile. A separately maintained combined activity visualization is deferred because its weekly upkeep is not justified for launch. Keep exact routes, gym location, body measurements, heart-rate data, and detailed schedules private. The official embed offers low maintenance but limited visual control and sport coverage.

Sources: [Strava API Agreement](https://www.strava.com/legal/api_policy), [Strava embeds](https://support.strava.com/en-us/articles/15402053-sharing-your-activities-and-routes-with-a-strava-embed), [Strava data exports](https://support.strava.com/en-us/articles/15401919-exporting-your-data-and-bulk-export).

## Fantasy football

**Feasible with Sleeper.** Sleeper's official read-only API is free for noncommercial use and requires no token. It supports users, leagues, rosters, matchups, drafts, transactions, brackets, and trending players. It does not document an official projections or prediction endpoint.

Recommended approach:

- Resolve and retain Elias's stable Sleeper user identifier, then select the league intended for public display.
- Use Elias's main redraft league as the selected public showcase.
- Display only Elias's relevant team data and anonymize other league members unless they consent.
- Change the experience with the NFL season: current matchup or record in-season; draft state before the season; recap or selected history after the season.
- Attribute Sleeper where required and show the update time.
- Treat a bespoke prediction model as a later experiment with its own licensed data source and clear methodology.

Source: [Sleeper API](https://docs.sleeper.com/).

## Music

**Feasible with Spotify.** Elias mainly listens through Apple Music but is willing to maintain a public Spotify playlist specifically for the site.

Recommended launch approach:

1. Create one public Spotify “currently listening” playlist with a stable URL.
2. Use Spotify's official playlist embed inside a site-designed frame.
3. Add Elias's own typography, description, last-updated date, and a static fallback link around the embed.
4. Update the playlist directly in Spotify so the site does not need account authorization, listening-history access, or token maintenance.

Spotify artwork and metadata must remain within Spotify's permitted playback context and follow its attribution and linking requirements. Treat a fully custom Spotify API presentation as a later enhancement only if the official embed prevents the intended visual direction.

Apple Music remains a viable alternative using the same official-playlist-embed approach, but maintaining a dedicated Spotify playlist is the confirmed choice.

Sources: [Spotify embeds](https://developer.spotify.com/documentation/embeds), [Spotify design requirements](https://developer.spotify.com/documentation/design).

## Local time and status

**Feasible without an external service.** Calculate local time from a configured timezone. Store the short status as manually controlled site content, with an optional expiry so old status text does not linger indefinitely.
