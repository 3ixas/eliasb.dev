# Final pass: scope

Grilled with Elias on 25 November 2026, after the Passes and panels refinement (#512, #513–#521) and the full-site copy review (#528) landed on `main` at `53bfac0`. Status: **confirmed by Elias on 25 November 2026**.

## Outcome

This is the last design pass before eliasb.dev goes out to hiring managers. Afterwards the design is frozen: content changes continue, and a design change needs a new decision.

The bar is that a careful reader finds nothing to flag. This is the third full-site sweep. The Lens pass ([LENS-PASS-SCOPE.md](../LENS-PASS-SCOPE.md)) and #528 came before it, so the pass has to find what they missed (mostly in the refinement work from #513 to #520) and must not repeat their findings.

## Method

`app-audit` is the umbrella. It runs these lenses:

| Lens | Covers here |
|---|---|
| `craft-review` | why a working surface still feels unfinished, focused on the refinement work |
| `ui-polish` | hierarchy, type, colour, surfaces, states, resilience with worst-case data |
| `motion` | the custom spring (`components/site/spring.ts`), entrance timing, interruptibility, reduced motion. Not a library change |
| `writing` | prose and interface copy, checked against the voice profile and #528's decisions |
| `accessibility` | the hand-built controls (lightbox, How I work switch, Threshold city switcher, chapter rail), axe on every route |
| `performance` | lab Core Web Vitals, the JS budget, Three.js cost on phones |
| `typescript` | type boundaries, casts, dead exports, content-model shapes |
| `vercel` | headers, caching, image config, security headers, the build budget |
| `dogfood` | an agent using the site as a visitor would, as a diagnosis lens |

`shadcn` is excluded. The site doesn't use it (no `components.json`, ADR 0004 tokens), and bringing it in would add a second styling system. Its useful part, checking accessible control behaviour, belongs to `accessibility`.

## Shape

1. **One diagnosis sweep.** The lenses run one after another as read-only Engineer children (Gemini 4 Neon, `medium`) against production. There's no local `next build`, and Playwright runs one worker on relevant specs only. Findings use craft-review's format and go into a single ranked `FINDINGS.md` in this folder, tagged by lens and surface. A finding the Lens pass or #528 already declined is not raised again.
2. **Elias picks.** Findings he doesn't pick stay in the doc as declined.
3. **Fixes are grouped by surface, not by lens**, so each file is edited once: shell, homepage, Role stories, case studies, Off the clock, `/things-i-make` archive, platform and types. They become a GitHub parent issue with surface tickets (as #512 did), delivered through `implement-series` with one PR per surface. Approving a ticket's preview is the go-ahead to merge it.
4. **A Speed Insights ticket** adds Vercel Speed Insights on the free tier, making room in the JS budget, so real-visitor data starts building once links go out. It doesn't gate this pass.

## Coverage

Every public surface gets the same depth: the homepage, all four Role stories, every case study and the `/things-i-make` archive, each at 390 and 1440 px in both themes. `/lab`, `/library` and `/about` are redirects and only need checking as redirects.

## Rules (carried over from the Lens pass)

- No redesign, no new sections, no new claims.
- The Résumé sheet and the 404 are untouched.
- Copy edits are approved as exact before-and-after strings, in positive framing.
- A `DESIGN.md` rule that blocks a wanted improvement is rewritten. Accessibility and performance gates still hold.
- Visual baselines change only for a picked item, and the PR says which.
- Vercel work is audit and configuration fixes only: no `vercel.ts` migration for its own sake, nothing paid.

## Proof of done

- **Lab Core Web Vitals:** median of 5 mobile Lighthouse runs per route against production, with LCP ≤ 2.0 s, TBT as the lab stand-in for INP and kept low, and CLS ≤ 0.05. These targets are hypotheses until the first baseline run. A target the baseline shows to be unrealistic is renegotiated with Elias, not dropped silently.
- **Accessibility:** 0 axe violations on every public route, and VoiceOver completes each hand-built control.
- **CI:** the full production Playwright matrix and `pnpm check` / `check:built` green on `main`.
- **Closing dogfood:** once the fixes merge, a fresh-context agent from a different provider than the fixers (Codex, rendered browser, `gpt-6.2-sol` at `medium`) uses production as a visitor would and answers one question: "What here feels unfinished, or like it wasn't made by Elias?" The pass is done when nothing new worth fixing comes back. Elias dropped the human cold read on 25 November 2026. The agent read is the gate, with the limitation that it shares model blind spots a person wouldn't.
- **Lasting record:** `docs/review/APP-AUDIT.md` records the run. Checks that are cheap and deterministic become CI gates. Noisy ones, like Lighthouse, are recorded there with their numbers rather than gated.

## Excluded

- shadcn adoption, a motion library change, a `vercel.ts` migration, paid Observability.
- The Résumé sheet, the 404, new content or claims.
- Field Core Web Vitals as a gate. There's no field data yet, and CrUX almost certainly has no data for a site this size.

## Evidence

- The real-device sign-off from #532 (iPhone, desktop Safari, VoiceOver) was finished by Elias.
- No `docs/review/APP-AUDIT.md` exists, so `app-audit` has never run.
- No `@vercel/analytics` or `@vercel/speed-insights` dependency. There's no `vercel.json` either.
- `motion` is a dev dependency only (ADR 0004 amendment).

## Open assumptions

- Ticket boundaries follow the findings. A surface with no picked findings gets no ticket.
