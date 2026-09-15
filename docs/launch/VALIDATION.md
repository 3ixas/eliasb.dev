# Launch validation

Validated on 15 September 2026 against the local Next.js production build, the Vercel deployment, and the launched custom domain.

## Final QA update

- The selected Cabinet homepage, work, Lab, Library, and About routes were exercised at desktop and 390px mobile widths in Chromium. The skip link, primary navigation, disclosures, source links, Spotify embeds, and lazy-loaded imagery were checked.
- The homepage and dedicated Lab now use bundled imagery for London, football, Professor Past, and Flowtime. Sources and licences are recorded in [`docs/content/IMAGE-CREDITS.md`](../content/IMAGE-CREDITS.md).
- `SITE_INDEXABLE=true` is pinned in Vercel Production alongside `GITHUB_SIGNAL_TOKEN`. Production is now indexable.
- `eliasb.dev` is attached to the `eliasb-dev` Vercel project and resolves through Cloudflare to Vercel. The apex redirects to `https://www.eliasb.dev`, which serves the production deployment.

## Passed locally

- All eight launch routes render at `320px`, `390px`, and desktop widths without horizontal overflow.
- Every launch route has one `h1`, meaningful image alternatives where images convey content, titled embeds, and a visible keyboard skip link.
- Keyboard focus follows the visual navigation order and remains clear of the fixed mobile navigation. Training data is rendered by the site-owned summary; the Strava profile remains a labelled source link.
- Site-owned text contrast passes the WCAG AA thresholds used by the automated computed-style audit in both themes across the launch routes. The Library audit still reports contrast and ARIA findings inside Spotify's third-party iframe, which the site cannot modify without hiding the player.
- Reduced-motion visitors receive a simple reveal in place of the typed entrance.
- The Library's native disclosure interactions open and close by keyboard and pointer without production console warnings.
- Chrome and the Chromium-based in-app browser render the homepage without overflow or site-origin console errors.
- All internal links resolve. The Ask Professor Past live URL was removed because the public deployment returns `404`; the source link remains in Lab.
- The Goodreads link now resolves to the public profile rather than an account sign-in route.
- The résumé link resolves to the current Google Docs CV, which is shared with anyone who has the link and does not require sign-in.
- Responsive `sizes` hints keep the main About image's initial optimized candidate at `384px` instead of requesting the desktop-width candidate on narrow displays.
- `robots.txt`, `sitemap.xml`, canonical metadata, social metadata, and the generated Open Graph image are present. Production robots allow indexing and continue to disallow the archived `/concepts/` route.
- `pnpm exec tsc --noEmit --incremental false`, `pnpm lint`, `pnpm verify:signals`, `pnpm build`, the sequential route crawl, and `git diff --check` pass.

## Public deployment evidence

- The old site is preserved at `https://eliasb-v1.vercel.app`; the launched site is at `https://www.eliasb.dev`, with `https://eliasb.dev` redirecting to it. The Vercel alias remains available at `https://eliasb-dev.vercel.app`.
- The earlier mobile Lighthouse run against the public review build scored 98 Performance, 100 Accessibility, 96 Best Practices, and 66 SEO. The lab metrics were 1.4s FCP, 1.7s LCP, 110ms Total Blocking Time, and 0.001 CLS.
- The earlier SEO score reflected the intentional `noindex, nofollow` preview state. The launched deployment now permits indexing.

## Remaining follow-up checks

- Confirm Safari and Firefox rendering. Only Chromium and Chrome were available during local automation.
- Recheck the third-party Spotify iframe findings if the embedded player is replaced or its accessibility changes.

## Old-site preservation and cutover

1. Import `3ixas/personal-portfolio-v1` into a separate Vercel project as a static site with no build command and the repository root as its output. **Complete.**
2. Verify the assigned stable `*.vercel.app` project URL before changing `eliasb.dev`. **Complete: `https://eliasb-v1.vercel.app`.**
3. Keep the old GitHub Pages deployment intact during the rollback window.
4. Deploy and approve the new site on its own Vercel review URL. **Complete: production deployment is aliased at `https://www.eliasb.dev`.**
5. **Complete:** `eliasb.dev` is attached to the new Vercel project, redirects to `www`, and serves the Vercel deployment. Keep the old GitHub Pages deployment intact until the rollback window closes.
6. **Complete:** `SITE_INDEXABLE=true` is set for the approved Production deployment; redirects, metadata, sitemap, integrations, and routes were verified after cutover.

The launch decision is **launched**. Vercel Production serves `https://www.eliasb.dev`, the apex redirects correctly, and indexing is enabled.
