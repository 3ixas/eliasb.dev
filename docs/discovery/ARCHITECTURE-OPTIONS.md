# Accepted architecture

Research checked against official documentation on 2026-09-14. Elias accepted this direction on 2026-09-14. The durable rationale is recorded in `docs/adr/0001-nextjs-vercel-and-snapshot-architecture.md`.

## Launch architecture

- Next.js App Router with TypeScript.
- Deploy on Vercel.
- Pre-render the main pages and case studies.
- Use small Client Component islands for the signature entrance, tactile objects, data visualizations, and other interactions.
- Store authored content in repository-owned MDX and typed TypeScript data.
- Use `generateStaticParams` for project and content detail pages.
- Keep core portraits, screenshots, and illustrations in the repository.
- Use narrowly configured remote image sources for Open Library, TMDB, and GitHub content.
- Keep Spotify and Strava as official embeds.

Do not use Next.js static export. Static export cannot provide the runtime route handlers needed for scheduled signal refreshes. Pre-rendered pages remain possible without static export, and adding a Client Component does not by itself make an entire page dynamic.

Sources: [Next.js route configuration](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config), [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params), [MDX](https://nextjs.org/docs/app/guides/mdx), [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image).

## Live-signal snapshots

Use one protected scheduled route to refresh GitHub, Letterboxd, Sleeper, and Open Library data. Fetch sources independently, validate each result, and merge only successful source updates into the last known good snapshot.

Recommended snapshot contract:

- Store a small normalized JSON snapshot in Vercel Blob.
- Preserve the previous value when a source fails.
- Record source-specific update times, last-attempt status, and stale thresholds.
- Never store tokens, raw errors, private repository identities, routes, or other fantasy-league members' identifying information in the public snapshot.
- Serve the browser through one same-origin signals endpoint.
- Include a bundled local fallback for the first deployment or unavailable storage.
- Make refreshes idempotent and protect the scheduled route with `CRON_SECRET`.

Sources: [Vercel Cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing), [managing Vercel Cron jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [Vercel Blob](https://vercel.com/docs/vercel-blob).

## Freshness and cost

### Vercel Hobby

- Suitable for a personal, noncommercial site.
- A scheduled job can run once per day and may execute at any point within its scheduled hour.
- Enough Blob capacity for the proposed small snapshot.
- Lowest-maintenance free option if day-level freshness is acceptable.

### Vercel Pro

- Supports frequent and precise scheduled jobs.
- A two-to-three-hour refresh would make GitHub activity and in-season fantasy data feel more current.
- Adds recurring hosting cost.

### Cloudflare alternative

Cloudflare Workers and KV can schedule more frequent refreshes on a free tier, but combining them with a Vercel-hosted Next.js site creates a second platform. Hosting the whole Next.js application on Cloudflare currently introduces a different compatibility path. This saves scheduler cost at the expense of operational simplicity.

Decision: use Vercel as the single platform. Start with Hobby and daily snapshots. Reconsider Pro only if same-day fantasy or building activity later proves valuable enough to justify a recurring cost.

## Content maintenance

Use repository-owned MDX and typed data at launch. This supports version control, typed fields, code review, static rendering, and the custom interactive structures required by the Work archive, Experiments, and Outside work. A CMS or private editing interface would introduce authentication, schema, and hosting work before there is evidence that editing files is a problem.

The Spotify playlist remains editable in Spotify. The site status, book choices, personal notes, and independent training summary remain small authored data files.

## Domain cutover

The public repository will be `3ixas/eliasb.dev`, with its local checkout at `/Users/elias/_LifeOS/03_ENGINEERING/repos/personal/eliasb.dev`. The apex `eliasb.dev` hostname is canonical and `www.eliasb.dev` redirects to it.

1. Validate the production deployment on its Vercel URL.
2. Add both `eliasb.dev` and `www.eliasb.dev` to Vercel.
3. Keep `eliasb.dev` canonical and redirect `www`.
4. Use the exact DNS records Vercel provides and change only the relevant web records at the current DNS provider.
5. Preserve unrelated MX and TXT records.
6. Verify DNS, SSL, and both hostnames after propagation.
7. Keep the old GitHub Pages deployment available at its `github.io` URL during a rollback window.
8. Remove the old custom-domain assignment from GitHub Pages only after the new deployment is verified.

Sources: [Vercel custom domains](https://vercel.com/docs/domains/set-up-custom-domain), [GitHub Pages custom-domain management](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
