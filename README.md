# eliasb.dev

The next version of Elias B.'s personal site: professional work, experiments, cultural interests, and live personal signals in one authored experience.

## Current phase

Cabinet of Curiosities is the selected homepage direction, with Living Editorial providing the compositional foundation. The original comparison remains at `/concepts`:

1. Living Editorial
2. Cabinet of Curiosities
3. Signals and Systems

The root route is now a maintainable production homepage, separate from the archived concept renderer. The homepage is the canonical one-page personal experience, with Work, Library (the unified personal-signals section), Experiments, About, and contact sections. `/work` and the Threshold, Argus Risk, and Flowtime detail routes provide layered case studies grounded in their source repositories; `/about`, `/library`, and `/lab` remain compatibility paths to their homepage sections. GitHub, Goodreads, Letterboxd, Sleeper, Spotify, optional server-side Strava counts, Wikimedia history, local time, and the expiring status are connected with designed fallback states. Final QA is complete and the site is live on Vercel at `https://www.eliasb.dev`; the apex `https://eliasb.dev` redirects there. Production indexing is enabled, while the old GitHub Pages deployment remains available during the rollback window.

## Development

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project documents

The complete product and design brief is in `docs/discovery/DESIGN-BRIEF.md`. The selected visual rules are in `docs/design/SELECTED-DIRECTION.md`. Remaining personal inputs are tracked in `docs/content/OPEN-INPUTS.md`. Supporting research, integration constraints, the site map, and accepted architecture decisions live under `docs/`.
