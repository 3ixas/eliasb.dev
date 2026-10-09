# Site signal contracts

The homepage's Off the clock section renders small server-owned snapshots. External services are queried from server components only; no token, route, location, or private repository detail is sent to the browser.

## GitHub contributions

- `GITHUB_SIGNAL_TOKEN` is optional and server-only. It needs the `read:user` scope so GitHub can include private and internal contributions Elias has chosen to show on his profile.
- With the token, the GraphQL `ContributionsCollection` supplies the trailing year’s contribution calendar. The page uses its total and daily counts as one aggregate and never adds a separate restricted count or shows a private repository name, branch, event, or message.
- Without the token, the REST public-events endpoint supplies a clearly labelled public-only trace. If either endpoint is unavailable, the authored fallback stays visible.
- Responses are cached for six hours and requests time out after 3.5 seconds.

## History

- The Weekly Curiosity requests Wikimedia/English Wikipedia `onthisday` `events`, `selected`, and `births` feeds for the Monday of the current week.
- The selection favours specific curiosities over routine album-release milestones and ordinary birthday entries. It uses three source-linked historical moments from three centuries, including one before 1900 and at least two on-this-day events. Each feed is cached for seven days and has a 3.5-second request timeout.
- When a selected record has a Commons lead image with creator and license metadata, the card shows a thumbnail with links to its Commons file and license. Image lookups use the same seven-day cache and timeout; missing or incomplete reuse metadata leaves that story text-only.
- If the feed cannot provide a varied selection, the card shows three source-checked examples spanning three centuries. It labels them “Saved examples” and does not present them as this Monday’s events or a live lookup.
- The live card calls itself a weekly note; it does not promise daily maintenance.

## Verification boundary

Every adapter validates response shape before mapping. Empty, partial, timeout, non-2xx, and malformed responses resolve to a truthful fallback instead of an empty dashboard or a client-side error.
