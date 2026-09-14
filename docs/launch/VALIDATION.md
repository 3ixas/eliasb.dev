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

## Production-preview checks

- Create private-review Vercel deployments for the new site and the old-site archive.
- Run Lighthouse or PageSpeed against the public preview URL. Local response timings are useful as a server baseline but do not prove field Core Web Vitals.
- Confirm Safari and Firefox rendering. Only Chromium and Chrome were available during local automation.
- Confirm the public Google Drive résumé link in a browser session that is not relying on owner access.
- Choose the public contact email and replace the temporary LinkedIn-first contact treatment.

## Old-site preservation and cutover

1. Import `3ixas/personal-portfolio-v1` into a separate Vercel project as a static site with no build command and the repository root as its output.
2. Verify the assigned stable `*.vercel.app` project URL before changing `eliasb.dev`. The exact hostname depends on project-name availability.
3. Keep the old GitHub Pages deployment intact during the rollback window.
4. Deploy and approve the new site on its own Vercel preview URL.
5. Move `eliasb.dev` and `www.eliasb.dev` to the new Vercel project only after the preview checks pass.
6. Set `SITE_INDEXABLE=true` for the approved production deployment and verify redirects, metadata, integrations, and analytics after cutover.

No DNS, deployment, or indexing change is part of this local validation commit.
