# Site signal contracts

The homepage and Library render small server-owned snapshots. External services are queried from server components only; no token, route, location, or private repository detail is sent to the browser.

## GitHub contributions

- `GITHUB_SIGNAL_TOKEN` is optional and server-only.
- With the token, the GraphQL `ContributionsCollection` supplies the last 28 days of calendar counts, the aggregate total, and the restricted/private aggregate count. The page may show those numbers, but never a private repository name, branch, event, or message.
- Without the token, the REST public-events endpoint supplies a clearly labelled public-only trace. If either endpoint is unavailable, the authored fallback stays visible.
- Responses are cached for six hours and requests time out after 3.5 seconds.

## Strava training

- `STRAVA_ACCESS_TOKEN` or the OAuth client and refresh-token trio (`STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`) are optional server-only credentials.
- The activities endpoint is queried from the Monday of the current week and reduced to counts for Lift, Run, Muay Thai, and Other. Routes, exact locations, heart rate, body measurements, and activity names never enter the render model.
- The site-owned training card shows the window, grouped counts, update context, and a link to the public athlete profile. Without credentials or when the API fails, it shows the authored Lift · Run · Muay Thai rhythm and says that it is a curated public-log fallback.
- Activity responses are cached for 30 minutes. OAuth and activity requests time out after 4–5 seconds.

## History

- The Library requests Wikimedia/English Wikipedia `onthisday` `events`, `selected`, and `births` feeds for the Monday of the current week.
- The selection favours specific curiosities over routine album-release milestones and ordinary birthday entries. It uses three source-linked historical moments from three centuries, including one before 1900 and at least two on-this-day events. Each feed is cached for seven days and has a 3.5-second request timeout.
- When a selected record has a Commons lead image with creator and license metadata, the Library shows a thumbnail with links to its Commons file and license. Image lookups use the same seven-day cache and timeout; missing or incomplete reuse metadata leaves that story text-only.
- If the feed cannot provide a varied selection, the card shows three source-checked examples spanning three centuries. It labels them “Saved examples” and does not present them as this Monday’s events or a live lookup.
- The live card calls itself a weekly note; it does not promise daily maintenance.

## Verification boundary

All three adapters validate response shape before mapping. Empty, partial, timeout, non-2xx, and malformed responses resolve to a truthful fallback instead of an empty dashboard or a client-side error.
