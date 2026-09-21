# Integration fallback runbook

The homepage and Library use small server-owned snapshots from external services. Each adapter has a bounded timeout, a revalidation window, response-shape checks, and an authored fallback. A visitor should see a truthful state label or fallback rather than an empty card or a client-side error.

## Production questions

When a signal looks stale or incomplete, answer these questions in order:

1. Is the card showing a live, cached, curated, or authored-fallback state?
2. Is the value outside its expected revalidation window, or is the provider currently slow/unavailable?
3. Did the current deployment regenerate the route successfully, or is there a deployment/runtime error?
4. Is an optional credential absent or expired, or did a public endpoint return a malformed/non-success response?
5. Is the issue site-owned, provider-owned, or an intentional fallback boundary?

## Safe checks

1. Record the public route, card label, visible update context, current time, and deployment shown in Vercel. Do not copy secrets, request headers, tokens, full provider responses, private repository names, activity names, or precise personal activity data into a report.
2. Check the Vercel deployment and Runtime Logs for framework or route errors. The current adapters intentionally resolve provider failures to fallbacks without emitting a structured event, so an empty Vercel log does not prove that every provider request succeeded.
3. If needed, check the provider's public status or public endpoint outside the site. Use the provider's own account and privacy rules; do not create a new credential or broaden access as part of diagnosis.
4. Compare the visible state with the cache windows and fallback contract below. A cached or authored state can be correct even when a provider has changed since the last refresh.
5. Reproduce locally with the same route and a sanitized environment. Run the existing validation commands before proposing a code change.

## Cache and fallback contract

| Signal | Source and window | Expected fallback or limitation |
| --- | --- | --- |
| GitHub activity | GitHub GraphQL/public events; 6 hours; 3.5-second request timeout | Public-only or authored activity when the private token is absent or the endpoint fails |
| Letterboxd culture | Letterboxd RSS; 15 minutes; 3.5-second request timeout | Authored culture card when the feed is missing, malformed, or unavailable |
| Goodreads reading | Goodreads RSS; 30 minutes; 3.5-second request timeout | Authored reading card when the feed is missing, malformed, or unavailable |
| Strava training | Strava OAuth/activity API; 30 minutes; 4–5-second timeouts | Curated Lift · Run · Muay Thai rhythm when credentials are unavailable or the API fails |
| Sleeper fantasy | Sleeper public API; 1 hour; 3.5-second request timeout | Authored fantasy matchup when the league or endpoint cannot be read |
| Wikimedia history | Wikimedia/English Wikipedia On This Day; 7 days; 3.5-second request timeout | Deterministic authored events for the current Monday week |
| Spotify playlist | Cross-origin Spotify iframe | A keyboard-accessible titled iframe or Open in Spotify fallback; provider loading is outside site-owned runtime control |

The authoritative signal details live in [`docs/integrations/SIGNALS.md`](../integrations/SIGNALS.md). The card's state label and source link are part of the user-facing contract.

## Current visibility boundary

The site does not currently collect structured integration metrics or alert on provider failures. That is intentional for this small personal site: adding telemetry without a defined operational question would create extra data and maintenance without a clear benefit. If freshness becomes important enough to alert on, define the event fields, retention, owner, and threshold first. A safe event would be limited to an integration key, route, failure class (`timeout`, `non-2xx`, `invalid-shape`, or `missing-config`), coarse duration, and deployment identifier; it would exclude tokens, response bodies, headers, and unnecessary personal data.

## Recovery boundary

A provider outage should first leave the authored fallback visible while its cache window and timeout do their work. Fix malformed mapping, missing configuration, or an expired credential locally, then run the repository quality checks. Deployment, cache invalidation, rollback, credential rotation, and changes to a provider account remain separate approved operations.
