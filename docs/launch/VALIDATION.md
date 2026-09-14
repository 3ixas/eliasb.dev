# Launch validation

Validated on 14 September 2026 against an optimized local production build.

## Passed locally

- All eight launch routes render at `320px`, `390px`, and desktop widths without horizontal overflow.
- Every launch route has one `h1`, meaningful image alternatives where images convey content, titled embeds, and a visible keyboard skip link.
- Keyboard focus follows the visual navigation order and remains clear of the fixed mobile navigation. Embedded Strava content is removed from the page tab sequence because the same data has a labelled direct link.
- Text contrast passes the WCAG AA thresholds used by the automated computed-style audit in both themes across every launch route.
- Reduced-motion visitors receive a simple reveal in place of the typed entrance.
- The Library's native disclosure interactions open and close by keyboard and pointer without production console warnings.
- Chrome and the Chromium-based in-app browser render the homepage without overflow or site-origin console errors.
- All internal links resolve. The Ask Professor Past live URL was removed because the public deployment returns `404`; the source link remains in Lab.
- The Goodreads link now resolves to the public profile rather than an account sign-in route.
- Responsive `sizes` hints keep the main About image's initial optimized candidate at `384px` instead of requesting the desktop-width candidate on narrow displays.
- `robots.txt`, `sitemap.xml`, canonical metadata, social metadata, and the generated Open Graph image are present. Preview builds remain `noindex, nofollow` until `SITE_INDEXABLE=true` is deliberately set for the public launch.
- `pnpm lint`, `pnpm build --webpack`, the route crawl, and `git diff --check` pass.

## Public preview evidence

- The old site is preserved at `https://eliasb-v1.vercel.app` and the unindexed new-site review build is at `https://eliasb-dev.vercel.app`.
- A mobile Lighthouse run against the public review build scored 98 Performance, 100 Accessibility, 96 Best Practices, and 66 SEO. The lab metrics were 1.4s FCP, 1.7s LCP, 110ms Total Blocking Time, and 0.001 CLS.
- The SEO score is intentionally reduced by `noindex, nofollow`. The remaining Best Practices findings come from third-party cookie and back-forward-cache behaviour inside the official Strava iframe.

## Remaining production checks

- Confirm Safari and Firefox rendering. Only Chromium and Chrome were available during local automation.
- Add the current résumé once its replacement public URL is available. The previous Google Drive file returns “Page Not Found,” so its link is hidden rather than shipped broken.

## Old-site preservation and cutover

1. Import `3ixas/personal-portfolio-v1` into a separate Vercel project as a static site with no build command and the repository root as its output. **Complete.**
2. Verify the assigned stable `*.vercel.app` project URL before changing `eliasb.dev`. **Complete: `https://eliasb-v1.vercel.app`.**
3. Keep the old GitHub Pages deployment intact during the rollback window.
4. Deploy and approve the new site on its own Vercel review URL. **Deployed unindexed at `https://eliasb-dev.vercel.app`; final approval pending.**
5. Move `eliasb.dev` and `www.eliasb.dev` to the new Vercel project only after the preview checks pass.
6. Set `SITE_INDEXABLE=true` for the approved production deployment and verify redirects, metadata, integrations, and analytics after cutover.

No DNS, deployment, or indexing change is part of this local validation commit.
