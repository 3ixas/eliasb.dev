# Final pass: findings

Diagnosis sweep for #534 against production (`https://www.eliasb.dev`, `main` at `53bfac0`), run on 25 November 2026. Nine read-only lenses ran one after another: dogfood, craft-review, ui-polish, writing, motion, accessibility, performance, typescript, vercel. Scope is in [SCOPE.md](SCOPE.md); the lens reports are the sources for each entry.

**To use this:** set each finding's **Pick** to `picked` or `declined`. Findings left `open` stay in the document as declined. After the picks, the picked findings are grouped by surface into the fix tickets of #533.

43 findings after merging duplicates: **2 High, 11 Medium, 30 Low or preference**. Axe reports 0 violations on all 32 route, viewport and theme combinations. CLS is 0.000 on every route. Reduced motion is clean on all of them.

## Decisions for Elias

| # | Decision | Recommendation |
|---|---|---|
| D1 | **LCP target.** No route reaches 2.0 s in the lab (2.58–2.86 s). Real Chrome at 4x CPU measures 0.28–0.96 s. See [Lighthouse baseline](#lighthouse-baseline). | Keep ≤ 2.0 s for the three Role stories (reachable at 1.96 s with F-13). Renegotiate the homepage and case studies to about 2.5 s lab LCP. |
| D2 | **Heading font axis.** F-13's largest lever is dropping Newsreader's optical-size axis, which `DESIGN.md` Type specifies. | Pick the subset option in F-13 first. It keeps the design rule. |
| D3 | **Greeting tab stop** (F-22): keep the focusable greeting or drop it. | Keep it, give it a role and a 44 px hit area. |
| D4 | **GitHub year cells** (F-23): exempt the 10 px grid in `DESIGN.md` or enlarge it. | Exempt it. The grid is information-only, keyboard works, and baselines stay. |
| D5 | **Node version** (F-40): Vercel runs 24.x, CI runs 22. | Align both to 24. |
| D6 | **Dashboard setting** (F-39): redirect `eliasb-dev.vercel.app` to `www.eliasb.dev`. Only you can change it. | Do it. No code and no cost. |
| D7 | **Scope correction.** SCOPE.md and #534 say "four Role stories"; the code has three (`bnp-paribas`, `joveen`, `optegra`). All three were covered at the same depth as every other route. | Fix the wording when the series reaches the close ticket. |

## Lighthouse baseline

Lighthouse 12, mobile, simulated throttling (150 ms RTT, 1.6 Mbps, 4x CPU), median of 5 sequential runs per route, against production, on one M1 laptop. Medians are stable; single runs move 1–3 points.

| Route | Perf | LCP s | TBT ms | CLS | FCP s | Speed Index s | Transfer KB | JS KB |
|---|---|---|---|---|---|---|---|---|
| `/` | 90 [89–92] | 2.86 [2.85–2.86] | 258 [198–292] | 0.000 | 1.21 | 2.03 | 604 | 323 |
| `/work/bnp-paribas` | 90 [88–92] | 2.70 [2.41–2.73] | 293 [268–359] | 0.000 | 0.91 | 1.85 | 592 | 344 |
| `/work/joveen` | 93 [92–94] | 2.58 [2.56–2.63] | 214 [196–255] | 0.000 | 0.91 | 1.76 | 613 | 344 |
| `/work/optegra` | 94 [93–94] | 2.71 [2.57–2.73] | 182 [178–203] | 0.000 | 1.06 | 1.64 | 635 | 344 |
| `/things-i-make` | 97 [96–97] | 2.64 [2.63–2.71] | 18 [14–26] | 0.000 | 1.06 | 1.06 | 509 | 202 |
| `/things-i-make/threshold` | 97 [96–100] | 2.63 [1.84–2.70] | 20 [14–45] | 0.000 | 0.91 | 0.91 | 436 | 202 |
| `/things-i-make/argus-risk` | 97 [97–98] | 2.63 [2.43–2.64] | 19 [15–25] | 0.000 | 0.91 | 0.91 | 428 | 202 |
| `/things-i-make/flowtime` | 97 [97–98] | 2.63 [2.41–2.65] | 23 [14–46] | 0.000 | 0.91 | 0.91 | 424 | 202 |

- **CLS ≤ 0.05:** met on every route.
- **TBT:** 14–46 ms on case studies and the archive; 182–293 ms on the routes with the 3D lanyard (F-12 proves the cause).
- **LCP ≤ 2.0 s:** the floor is structural (modelled 0.6 s TTFB, CSS-blocked first paint, the LCP element's own path). Blocking the heading font alone gives `/` 2.26 s and BNP 1.96 s.
- **JS budget** (`scripts/js-budget.json`, baseline + 10%): `/` 205,555 B against 211,858 (room 6.3 KB), BNP 204,313 against 208,143 (room 3.8 KB), Threshold 201,118 against 207,261 (room 6.1 KB). #535's Speed Insights loads from `/_vercel/`, outside the counted `/_next/static/` total, and fits in the room.

## Findings

Ranked by priority, then by reach. Each fix names the surface that owns it.

### High

#### F-01. Lightbox opens after Escape when Escape is pressed during decode
- **Lens:** dogfood · **Surface:** shell (`ZoomableImage`)
- **Location and evidence:** `/work/bnp-paribas` at 1440 dark (reproduced twice), and every route with a zoomable image (7 images). `src/components/site/zoomable-image.tsx:147-202`. Click the Take Ownership certificate, wait 400 ms, press Escape: `dialog.zoom__dialog[open]` count goes 0 → 1 after Escape, and `<img class="zoom__img">` covers the chapter rail and takes all pointer events. `open()` removes the `window` keydown listener (`cancelPending`) in `finally` (line 160) as soon as decode resolves. `startViewTransition` then runs `showModal()` asynchronously, so an Escape in that gap is lost.
- **Evidence class:** observed defect, source-confirmed
- **Consequence and reach:** a quick keyboard or mouse visitor dismisses the lightbox and it opens anyway, locking the page until a second Escape or Close. Affects all 7 zoomable images. **Priority: High**
- **Correction:** keep `cancelPending` active until `showModal()` has run inside the transition callback, or abort the pending transition and skip `showModal()` when cancelled.
- **Verification:** Playwright spec on `/work/bnp-paribas` and `/` that delays the image decode, presses Escape before the transition commits, and asserts `dialog[open]` count 0, focus on the trigger, and the chapter-rail link clickable.
- **Pick:** open

#### F-02. GitHub year month labels wrap onto a second row in the last ~10 days of a month
- **Lens:** craft-review, dogfood · **Surface:** Off the clock
- **Location and evidence:** `/#off-the-clock` at 1440 and 390, both themes, 25 Nov 2026. `Nov` is placed `grid-column: 1 / span 2` and `Dec` (column 1) collides with it, so `Dec` drops to `grid-row: 2`, 19 px below every other month (`y` 6449 vs 6468 at 1440), pushing the whole grid down a line. `contribution-calendar-model.ts:48-59`, `github-year.tsx:79-85`.
- **Evidence class:** observed defect
- **Consequence and reach:** about 30–40% of the year, every visitor sees a misaligned axis on the page's most data-dense figure. **Priority: High**
- **Correction:** keep every label on one row. When the leading partial month has fewer than `span` columns before the next month, omit its label (as GitHub's own graph does).
- **Verification:** unit test on `createContributionCalendar` with windows starting on the 26th–31st asserting every label has `row === 0`; check `/#off-the-clock` at 1440 and 390.
- **Pick:** open

### Medium

#### F-03. "What I'm building now" shows eliasb.dev itself
- **Lens:** dogfood · **Surface:** Off the clock
- **Location and evidence:** `/#off-the-clock`. `signal-mappers.ts:118-133`; line 119 excludes only `personal-portfolio-v1`, so production renders `eliasb.dev ↗`, "Personal site for Elias Bennett…".
- **Evidence class:** observed defect
- **Consequence and reach:** every push to this repo makes the "now" slot point back at the site being read, displacing real work. **Priority: Medium**
- **Correction:** add `"eliasb.dev"` to `EXCLUDED_REPOSITORIES`; update the GLOSSARY "Now making" entry to name both.
- **Verification:** unit test on `latestRepository()`; live check that the next most recent public repo renders.
- **Pick:** open

#### F-04. Joveen hero figure "Under 2" wraps onto two lines
- **Lens:** craft-review, dogfood · **Surface:** Role stories
- **Location and evidence:** `/work/joveen` at 1440. The four cards are 157 px wide (125 px inner); at 37 px `Under 2` wraps (75 px tall against 37 px), pushing its label 38 px below its neighbours. `story.css:114-145`, `role-stories.ts:227`.
- **Evidence class:** observed defect
- **Consequence and reach:** every desktop visitor, above the fold, on one Role story. **Priority: Medium**
- **Correction:** either `white-space: nowrap` with a slightly smaller `--type-figure` clamp in `.story-open__card .story-figures b`, or the compact figure `<2 min` (already noted as an option in #528 R14). A copy change needs your exact string.
- **Verification:** `/work/joveen` at 1440 and 1024: all four `b` elements one line high and top-aligned.
- **Pick:** open

#### F-05. Optegra source links strand their ↗ at the right edge on phones
- **Lens:** craft-review · **Surface:** Role stories
- **Location and evidence:** `/work/optegra` at 390, both Wayback Machine captions. `.story-fig__source` is `display: inline-flex`, so a wrapped link puts the arrow flex child at `x: 363` (347 px from its text). `story.css:701-709`, `role-story-figures.tsx:102-104`.
- **Evidence class:** observed defect
- **Consequence and reach:** every phone visitor on this story, two figures. **Priority: Medium**
- **Correction:** `display: inline-block; padding-block: 10px` (as `.text-link` in `parts.css:254-257`), keeping the 44 px target.
- **Verification:** `/work/optegra` at 390: both links at least 44 px tall, the arrow directly after "Wayback Machine".
- **Pick:** open

#### F-06. Project screenshots sit at ragged heights across the archive and the homepage pair
- **Lens:** craft-review · **Surface:** archive, homepage (`ProjectPanel`)
- **Location and evidence:** `/things-i-make` and `/#things-i-make` at 1440. Bezel top offsets differ by up to 44 px in a row (Threshold +156, Argus +200, Flowtime +168); the homepage Argus bezel starts 51 px below Flowtime's. `.project__shot { align-self: end }` (`projects.css:10-17`) with aspect ratios from 1.38:1 to 1.78:1 (`projects.ts:75-172`).
- **Evidence class:** observed defect
- **Consequence and reach:** all 6 archive panels and the homepage pair; a 56 px empty band above Argus. **Priority: Medium**
- **Correction:** align rows with `subgrid` as `.panels--aligned` does (`work.css:212-229`) and give `.project__shot` one aspect ratio with `object-fit: contain`, so no screenshot is cropped.
- **Verification:** `/things-i-make` and `/` at 1440: bezel tops and bottoms equal across a row. Visual baselines for both change, so this needs your pick.
- **Pick:** open

#### F-07. BNP hero meta line has two different dot spacings
- **Lens:** craft-review, dogfood · **Surface:** Role stories
- **Location and evidence:** `/work/bnp-paribas` at 1440 and 390. `role-stories.ts:17` stores `setting: "Risk division · London"` as one string, so its dot is tight while the other two use the 1em CSS separators (`story.css:78-100`, `role-story.tsx:24,40-46`).
- **Evidence class:** observed defect
- **Consequence and reach:** the flagship story's first line under the heading. **Priority: Medium**
- **Correction:** split `setting` on `" · "` into sibling `.story-open__part` spans.
- **Verification:** `/work/bnp-paribas` shows four parts with equal gaps at both widths.
- **Pick:** open

#### F-08. Argus announcement calls P&L "a new price"
- **Lens:** writing · **Surface:** case studies (Argus Risk)
- **Location and evidence:** `argus-provenance.ts:20`, called at `argus-provenance-live.tsx:57` with `formatUsd(unrealisedUsd(next))`; repeated at `docs/content/redesign-copy.md:197`. New event on TTE.PA announces "TTE.PA: a new price, −$324".
- **Evidence class:** observed defect
- **Consequence and reach:** screen-reader users hear a wrong fact on each New event press. **Priority: Medium**
- **Correction (exact):** before `TTE.PA: a new price, −$324` → after `TTE.PA: a new price of 62.10 EUR, unrealised P&L −$324`. Update the deck line.
- **Verification:** press New event and read `.argus__foot .sr-only`; `pnpm verify:copy` covers the deck line.
- **Pick:** open

#### F-09. The history image's alt text is a filename
- **Lens:** accessibility · **Surface:** Off the clock
- **Location and evidence:** `/`, this week's lead event. `alt="MS Explorer 2005 1"`, lightbox `aria-label` the same. `history.ts:362-375` (`historyImageAlt`) builds alt from the Commons title; used at line 434. The curated fallbacks (lines 93, 109, 125) have real descriptions.
- **Evidence class:** observed defect (WCAG 1.1.1)
- **Consequence and reach:** the one informative image in the band, every week the feed returns a pictured event. **Priority: Medium**
- **Correction:** derive alt from the event's own text, for example `Picture for: ${event.text}`; keep the curated alts. No new claim.
- **Verification:** unit test with `MS_Explorer_2005_1.jpg`; an `off-the-clock.spec` assertion that no history alt ends in a digit or extension.
- **Pick:** open

#### F-10. Pills and outline buttons lose their edge in forced colours
- **Lens:** accessibility · **Surface:** shell and shared parts
- **Location and evidence:** `/` at 1440 with `forcedColors: active`. Computed border and outline are 0 on the hero Work and Say hello pills, `.button` (Copy, New event), the history stepper, `.sim__step` and Run again; they render as bare words. `parts.css:205-246` (`border: 0`); the forced-colours block at `parts.css:748+` covers surfaces and bezels only. `e2e/forced-colors.spec.ts` has no check for these.
- **Evidence class:** observed defect (WCAG 1.4.11), emulated
- **Consequence and reach:** Windows high-contrast visitors on every route. **Priority: Medium**
- **Correction:** `.pill, .button { border: 1px solid ButtonText }` inside the forced-colours block; same for `.sim__step` and `.lane__flip`. Normal rendering is unchanged, so baselines hold.
- **Verification:** extend `forced-colors.spec.ts` to assert a non-zero border on the hero CTA, Copy and the simulation controls; confirm on a Windows device.
- **Pick:** open

#### F-11. Flowtime break numbers flicker to invisible while the slider moves
- **Lens:** motion · **Surface:** case studies (Flowtime)
- **Location and evidence:** `/things-i-make/flowtime` at 1440. `flowtime-break.tsx:16` renders `<b key={minutes} data-new>`, so the node remounts each step and `working-arrive` (`story.css:1110-1119`) replays a fade from `opacity: 0`. 12 ArrowRight presses at 50 ms: 24 of 65 frames below 0.5 opacity, minimum 0.00.
- **Evidence class:** observed defect
- **Consequence and reach:** both proof numbers pulse out during the figure's only continuous input; breaks DESIGN.md's "reverses from where it has reached". **Priority: Medium**
- **Correction:** keep the node stable and retrigger only the wash on slider steps; Threshold's discrete choice keeps the fade.
- **Verification:** repeat the arrow-key run sampling opacity per frame: none below ~0.9; a Threshold choice still arrives.
- **Pick:** open

#### F-12. The 3D lanyard downloads and runs at page open on the homepage and Role stories
- **Lens:** performance · **Surface:** homepage, Role stories (`lanyard.ts`)
- **Location and evidence:** `lanyard.ts:60,86`. The 153 KB gzip chunk loads right after hydration, because the pass is in the first viewport. Blocking it in a controlled run: `/` TBT 258 → 42 ms (score 90 → 95), BNP 293 → 97 ms (90 → 96); LCP unchanged. Real Chrome at 4x CPU: long tasks of 182 and 216 ms at ~3.9 s.
- **Evidence class:** observed defect, with a causal experiment
- **Consequence and reach:** the only TBT cost on the routes a hiring manager opens first; phones freeze 150–200 ms as the scene mounts. **Priority: Medium**
- **Correction:** start the import on `requestIdleCallback` (about 2 s timeout) or first pointer or scroll, keeping the IntersectionObserver gate and the printed pass as the interim state. The hang appears 1–2 s later. One file.
- **Verification:** re-run the `/` and BNP Lighthouse sets (TBT median under 100 ms); `e2e/lanyard.spec.ts` and `/fixtures/lanyard`.
- **Pick:** open

#### F-13. The 132 KB Newsreader heading font sits on the LCP path
- **Lens:** performance · **Surface:** shell (homepage, Role stories)
- **Location and evidence:** `layout.tsx:30-35` (`axes: ["opsz"]`, `swap`). The LCP element is the heading (`h1.opening__line`, `p.story-open__lede`); render delay 2.25 s and 2.1 s. Blocking only that file: `/` 2.86 → 2.26 s, BNP 2.71 → 1.96 s (3 runs each).
- **Evidence class:** observed defect, one causal experiment
- **Consequence and reach:** about 0.6–0.75 s of simulated LCP on the routes that most miss the target; smaller in real Chrome, with the metric-matched fallback shown meanwhile and no layout shift. **Priority: Medium**
- **Correction:** (a) serve an instanced, subsetted woff2 (likely under 60 KB) through `next/font/local`, headings unchanged; or (b) drop the optical-size axis, which rewrites `DESIGN.md` Type (D2).
- **Verification:** Lighthouse LCP median 2.0–2.3 s on `/`, at most 2.0 s on Role stories; heading baselines unchanged for (a).
- **Pick:** open

### Medium-low

#### F-14. The Eclipse icon snaps to −120° on a repeat press
- **Lens:** motion · **Surface:** shell
- **Location and evidence:** header toggle on `/` at 1440. `eclipse-toggle.tsx:22-23,35` starts a fresh `icon.animate(TURN_OVER)` every click with no cancel or retarget. Click, wait 450 ms (about 7° from rest), click again: the next frame reads `rotate(-120deg) scale(0.6)`, a 127° jump and 40% shrink; it also fights the 420 ms CSS transitions (`shell.css:244-256`).
- **Evidence class:** observed defect
- **Consequence and reach:** a quick double press on any page; the theme state stays correct. Breaks "reverses from where it has reached". **Priority: Medium-low**
- **Correction:** keep the animation handle in a ref and restart from the current rotation and scale, or drive the turn with a retargeting CSS transition.
- **Verification:** click, wait 300 ms, click: the next-frame transform stays within a few degrees of its pre-click value.
- **Pick:** open

#### F-15. The worst-case fixture misses most of the refinement-era components
- **Lens:** ui-polish · **Surface:** platform and types
- **Location and evidence:** `src/app/fixtures/worst-case/page.tsx` covers Pass, PanelHead, ProjectPanel, EvidenceFigures and NextPanel. It lacks the Joveen/Optegra trays, Where I'm headed, How I work cards and trays, the Threshold link and city switcher, Argus rows, Problem/Decision cards and archive rows. DESIGN.md's Craft bar keeps worst-case data as a fixture.
- **Evidence class:** observed gap
- **Consequence and reach:** content edits continue after the freeze, so this is where overflow can slip in unseen. **Priority: Medium-low**
- **Correction:** add those components with long values and a `worst-case.spec.ts` overflow check at 320 and 390 px.
- **Verification:** `BOARD_FIXTURES=1`, one worker, `e2e/worst-case.spec.ts` on `chromium-320-light`: no overflow, no clipped text.
- **Pick:** open

### Low and preference

#### F-16. The custom spring is not played by any surface
- **Lens:** motion · **Surface:** platform and types (consumers: homepage, Role-story passes)
- **Location and evidence:** `spring()` and `passLean` appear only in `spring.ts`, `signature-springs.ts:13` and `scripts/verify-springs.mjs`. Production CSS has zero `linear(` curves; `pass.css:25,37` use `var(--spring)` and a Bézier. The `spring.ts` header says every signature motion plays from `linear()`.
- **Evidence class:** observed defect (documentation and gate drift)
- **Consequence and reach:** tuning `spring.ts` changes nothing on screen; `verify:springs` guards unused code. **Priority: Low-medium**
- **Correction:** wire `passLean.easing`/`duration` into `.pass` through CSS custom properties (tune `spring(0.4, 0.7)` from its ~1.9 s settle toward today's 0.8 s), or update the header, `DESIGN.md` and `GLOSSARY.md` to say the pass uses `--spring`.
- **Verification:** production CSS emits a `linear(` curve for `.pass` and `pnpm verify:springs` passes; or the docs match the code.
- **Pick:** open

#### F-17. The Off the clock film line breaks inside a date
- **Lens:** dogfood · **Surface:** Off the clock
- **Location and evidence:** `/#off-the-clock`, 1440 and 390. `film-line.ts:12-17` glues `Oct · ★★★½` with non-breaking spaces but `watched.short` ("9 Oct") uses a normal space, so the line breaks as `Last watched 9` / `Oct · ★★★½`.
- **Evidence class:** observed defect · **Priority: Low**
- **Correction:** non-breaking space inside the date (`9 Oct`).
- **Verification:** `9 Oct` stays on one line at 1440 and 390.
- **Pick:** open

#### F-18. The Flowtime slider announces "a 18-minute break"
- **Lens:** dogfood · **Surface:** case studies (Flowtime)
- **Location and evidence:** `flowtime-break.ts:20` hardcodes `a ${rest}-minute break`; for 8, 11 and 18 screen readers hear "a 8-minute", "a 11-minute", "a 18-minute".
- **Evidence class:** observed defect · **Priority: Low**
- **Correction (exact):** before `90 minutes of focus, a 18-minute break` → after `90 minutes of focus, an 18-minute break`; use "an" when `rest` is 8, 11 or 18.
- **Verification:** unit test for 8, 11, 18, 9, 12.
- **Pick:** open

#### F-19. How I work card 3 splits its two route chips across lines on phones
- **Lens:** craft-review · **Surface:** homepage
- **Location and evidence:** `/#how-i-work` at 390. `Off` and `Today's path` share a row while `New cached path` wraps alone below. `how-flag-switch.tsx:42-64`, `headed-how.css:372-377`.
- **Evidence class:** observed defect · **Priority: Low**
- **Correction:** wrap the two chips in a `.flag-route__chips` flex-wrap container so they wrap as a pair.
- **Verification:** at 390 both chips share a `y`; at 1440 all three stay on one line.
- **Pick:** open

#### F-20. Optegra's three-card figure strip leaves an empty cell on phones
- **Lens:** craft-review · **Surface:** Role stories
- **Location and evidence:** `/work/optegra` at 390. `story.css:827-830` sets two columns, so the third card sits at half width beside an empty cell.
- **Evidence class:** preference · **Priority: Low**
- **Correction:** `.story-figures li:last-child:nth-child(odd) { grid-column: 1 / -1 }` under 720 px.
- **Verification:** Optegra's third card spans full width; BNP (2) and Joveen (4) unchanged.
- **Pick:** open

#### F-21. The skip link is 42 px tall
- **Lens:** ui-polish · **Surface:** shell
- **Location and evidence:** every route; `a.skip-link` is 137.5 × 42 px against DESIGN.md's 44 px. `shell.css`.
- **Evidence class:** observed defect · **Priority: Low** (keyboard and switch users, while focused)
- **Correction:** `min-height: 44px` on `.skip-link`.
- **Verification:** Tab once on any route; focused height at least 44 px.
- **Pick:** open

#### F-22. The header greeting is a focusable paragraph with a 28 px target
- **Lens:** ui-polish, accessibility · **Surface:** shell
- **Location and evidence:** 1440, every route. `p.greeting` has `tabindex=0`, no role, 142 × 28 px; Enter and Space do nothing; announced as "paragraph". At 820 px with touch it is `role=button` with `aria-expanded` and its name changes with no live announcement. `site-greeting.tsx:76-95`, `shell.css:291,382`.
- **Evidence class:** observed defect (WCAG 4.1.2), mild · **Priority: Low**
- **Correction:** give the stop a role (`role="group"` with `aria-label`, or `button` consistently), pad a 44 px hit area as the theme control does, and put the tablet-width time in a `role=status` node. Dropping the stop is the alternative (D3).
- **Verification:** `shell-details.spec` checks tab order and role at 1440 and 820; hit box at least 44 px.
- **Pick:** open

#### F-23. GitHub year day cells are 10 px targets
- **Lens:** accessibility · **Surface:** Off the clock
- **Location and evidence:** `/` at 1440 and 390. 365 `button.stretch-gh__day` cells, 10.3 px wide on a 13.4 px pitch; axe `target-size` is "incomplete" on all of them. `github-year.tsx:96-116`. Keyboard works (roving tabindex, arrows, Home, End, PageUp).
- **Evidence class:** observed (WCAG 2.5.8; a deliberate GitHub-faithful drawing) · **Priority: Low**
- **Correction:** exempt it in `DESIGN.md` Accessibility as an information-only grid (D4), or enlarge cells to a 24 px pitch.
- **Verification:** the `DESIGN.md` rationale; or axe `target-size` and the `off-the-clock` spec.
- **Pick:** open

#### F-24. Three figure-source links open a new tab without saying so
- **Lens:** accessibility · **Surface:** Role stories
- **Location and evidence:** `/work/joveen` (`joveen.com ↗︎`) and `/work/optegra` (two Wayback Machine captions). `role-story-figures.tsx:102` is a bare `SiteLink`; every other external link carries an sr-only "opens X in a new tab".
- **Evidence class:** observed defect · **Priority: Low**
- **Correction:** append `<span className="sr-only"> opens {hostLabel(href)} in a new tab</span>`, as `OutLink` does.
- **Verification:** include `figure.source` links in the external-link assertion in `standing-checks` or `role-story.spec`.
- **Pick:** open

#### F-25. Small keyboard and announcement oddities
- **Lens:** accessibility · **Surface:** Off the clock, shell, case studies
- **Location and evidence:** (a) GitHub year: Escape clears `selected`, so the next Tab lands on today's cell instead of leaving the grid (`github-year.tsx:45-52`). (b) Copy button: name changes to "Copied" while `role=status` also says "Copied" (`copy-button.tsx:84-107`). (c) Lightbox: `dialog[aria-label]` and the inner image carry the same alt, so a 200+ character alt is read twice. (d) Lightbox zoom is touch-only.
- **Evidence class:** observed (a, b), preference (c, d) · **Priority: Low**
- **Correction:** (a) blur instead of clearing the roving stop; (b) stable name, let the status carry "Copied"; (c) short dialog name ("Larger view"), alt stays on the image; (d) no change proposed.
- **Verification:** extend `off-the-clock.spec`, `say-hello.spec`, `figure-expand.spec`.
- **Pick:** open

#### F-26. The axe gate runs only at 1440 and no open states
- **Lens:** accessibility · **Surface:** platform and types
- **Location and evidence:** `e2e/standing-checks.spec.ts:111-130` runs axe on the sitemap pages plus the 404 in Chromium 1440 only, `reducedMotion: reduce`, with no named tags. It misses 390 px, the open Menu, lightbox, Argus disclosures and switches, and forced colours. By hand all of those states had 0 violations, so a regression would pass the gate.
- **Evidence class:** observed (coverage gap) · **Priority: Low** (feeds the close ticket's axe gate)
- **Correction:** also run at `chromium-390-light` and `-dark`; name `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`; add one state-sweep test that opens the Menu, lightbox, Argus and switches before one axe run.
- **Verification:** break a state on purpose (an unlabelled switch) and the gate fails.
- **Pick:** open

#### F-27. Live Wikipedia history facts keep straight apostrophes
- **Lens:** writing · **Surface:** Off the clock
- **Location and evidence:** live `/` renders `Doctor Who, the world's longest-running…` with `'`; the offline fallbacks (`history.ts:105,121`) use `’`; the live path (`history.ts:211`) only collapses whitespace.
- **Evidence class:** observed defect · **Priority: Low**
- **Correction (exact):** before `world's longest-running` → after `world’s longest-running`; normalise with `.replace(/(\w)'(\w)/g, "$1’$2")` after the whitespace collapse.
- **Verification:** a fixture event containing `'` renders `’` and passes `verify:signals`.
- **Pick:** open

#### F-28. The copy deck and `verify:copy` skip the machine surfaces
- **Lens:** writing · **Surface:** platform and types
- **Location and evidence:** `docs/content/redesign-copy.md` has nothing for `llms.txt`, `/index.md` or the `host-label.ts` sr-only strings; `scripts/verify-copy.mjs` does not read `src/content/markdown.ts` or `host-label.ts`.
- **Evidence class:** observed defect · **Priority: Low**
- **Correction:** add a "Machine surfaces" table (`llms.txt` intro and link lines, `/index.md` Off the clock lines, host labels) and have `verify:copy` enforce it.
- **Verification:** `pnpm verify:copy` fails when one of those strings drifts.
- **Pick:** open

#### F-29. Optegra's meta description is 216 characters
- **Lens:** writing · **Surface:** Role stories
- **Location and evidence:** `role-stories.ts:249`; BNP is 180 and Joveen 124. Link previews cut at about 155–160, losing the engineers sentence.
- **Evidence class:** preference · **Priority: Low**
- **Correction (exact):** before `I was a marketing executive across two healthcare providers: private, at Kensington Medical, and NHS work through Optegra Eye Healthcare. The best part of the job was working with the engineers who built our website.` → after `I was a marketing executive at Kensington Medical and Optegra Eye Healthcare, and the best part was working with the engineers who built our website.` (149 characters).
- **Verification:** curl `/work/optegra` and check the meta length and deck parity.
- **Pick:** open

#### F-30. Project screenshots take 700 ms to lift on hover
- **Lens:** motion · **Surface:** homepage, archive
- **Location and evidence:** `projects.css:54-57,158` (`transition: transform 700ms var(--out)`); DESIGN.md says controls answer in 100–250 ms. `--out` is mostly done by about 300 ms.
- **Evidence class:** preference · **Priority: Low**
- **Correction:** 250–300 ms on `--out`.
- **Verification:** the lift completes in about 250 ms and reverses smoothly.
- **Pick:** open

#### F-31. The JS budget does not count the 153 KB lanyard chunk
- **Lens:** performance · **Surface:** platform and types
- **Location and evidence:** `scripts/verify-release.mjs:62,296-303` sums only `<script src>` tags under `/_next/static/`; the lanyard is a dynamic import. `js-budget.json` lists three routes, and production is already 6.7–8.0% over baseline on them.
- **Evidence class:** code-only · **Priority: Low**
- **Correction:** add a second figure for the chunk containing `WebGLRenderer` (about 153 KB baseline) and re-baseline once when #535 lands.
- **Verification:** `pnpm check:built` fails on a +10% change to the scene chunk.
- **Pick:** open

#### F-32. Case-study and archive LCP images wait to load and render
- **Lens:** performance · **Surface:** case studies, archive
- **Location and evidence:** LCP load delay 0.4–0.9 s and render delay 0.6–0.9 s. The hero is preloaded (`case-study.tsx:155`) but held at `opacity: 0` until decoded (`shell.css:50-56`). The archive loads three `eager` images (`work-archive-page.tsx:31`, `FIRST_SCREEN`) that compete at 390 px.
- **Evidence class:** preference (the arrival hold is deliberate), observed for the archive contention · **Priority: Low**
- **Correction:** leave the arrival hold; set `FIRST_SCREEN` to 1 on phones or `fetchPriority="low"` on the 2nd and 3rd.
- **Verification:** archive LCP load delay under 500 ms; archive baselines unchanged.
- **Pick:** open

#### F-33. Unhashed static files revalidate on every visit
- **Lens:** performance · **Surface:** platform and types
- **Location and evidence:** `/lanyard/webbing.webp`, `/lanyard/foil.webp` and `/work/*` images return `public, max-age=0, must-revalidate`. `next.config.ts:46-48` sets only security headers. `/_next/image` shows the same value, which is Vercel's own response; the edge keeps variants for days, so nothing to configure there.
- **Evidence class:** observed defect · **Priority: Low** (31 KB of textures)
- **Correction:** a `headers()` rule for `/lanyard/(.*)` with `public, max-age=86400, stale-while-revalidate=604800`. Not for `/work/*`, whose filenames are unhashed.
- **Verification:** `curl -I` after deploy; `verify:release` still passes.
- **Pick:** open

#### F-34. `londonDayOfMonth` has no callers
- **Lens:** typescript · **Surface:** platform and types
- **Location and evidence:** `signal-mappers.ts:48-51`; `grep -rn londonDayOfMonth src scripts e2e` finds only the definition.
- **Evidence class:** observed defect · **Priority: Low**
- **Correction:** delete it.
- **Verification:** `pnpm check` stays green; the grep finds nothing.
- **Pick:** open

#### F-35. A client component imports the server mapper module, and the 365-day window is defined twice
- **Lens:** typescript · **Surface:** platform and types
- **Location and evidence:** `training-today.tsx:6` (`"use client"`) imports `londonWeekday` from `@/integrations/signal-mappers`, which also holds the server mappers; no file in `src` imports `server-only`. `CONTRIBUTION_WINDOW_DAYS = 365` (`contribution-calendar-model.ts:4`) repeats `GITHUB_ACTIVITY_DAYS = 365` (`signal-mappers.ts:8`).
- **Evidence class:** code-only · **Priority: Low**
- **Correction:** move the London time helpers to their own module and export one `ACTIVITY_DAYS`.
- **Verification:** `pnpm check`; `grep -rn "365" src/integrations src/components/site` shows one definition.
- **Pick:** open

#### F-36. A misspelt project slug in `rowOutcomes` is silently ignored
- **Lens:** typescript · **Surface:** homepage
- **Location and evidence:** `site-copy.ts:76-79` casts to `Readonly<Record<string, string>>`; read at `things-i-make.tsx:14` with `?? project.outcome`. Both keys are valid today; `ProjectSlug` exists (`projects.ts:178`).
- **Evidence class:** code-only · **Priority: Low**
- **Correction:** `satisfies Partial<Record<ProjectSlug, string>>` in place of the cast.
- **Verification:** `pnpm typecheck` passes; a bogus slug fails to compile.
- **Pick:** open

#### F-37. `Project.links` is all-optional, forcing `!` at three call sites
- **Lens:** typescript · **Surface:** archive
- **Location and evidence:** `projects.ts:41-46`; `project-panel.tsx:10` and `markdown.ts:35,102` assert with `!`. A project with no link would pass the types and `catalogueProblems`.
- **Evidence class:** preference · **Priority: Low**
- **Correction:** add the one-link rule to `catalogueProblems`; `flatMap` in `markdown.ts` removes its `!`.
- **Verification:** `pnpm verify:catalogue` fails on a link-less entry.
- **Pick:** open

#### F-38. Neither `tsc` nor `lint` catches unused code
- **Lens:** typescript · **Surface:** platform and types
- **Location and evidence:** `tsconfig.json` sets `strict` only; `lint` has no `--max-warnings 0`; so F-34 passes every gate. `noUncheckedIndexedAccess` is not recommended (many `!` for little gain on static content).
- **Evidence class:** code-only · **Priority: Low**, optional
- **Correction:** add `noUnusedLocals`, `noUnusedParameters` and `--max-warnings 0` after one clean CI run confirms no existing hits.
- **Verification:** `pnpm lint` and `tsc --noEmit` pass in CI with the flags on.
- **Pick:** open

#### F-39. `eliasb-dev.vercel.app` serves the full indexable site
- **Lens:** vercel · **Surface:** platform and types (dashboard)
- **Location and evidence:** `curl -I` returns 200 with no `x-robots-tag`; `robots.txt` is `Allow: /`; the page is `index, follow`. SSO protection is `all_except_custom_domains` and `SITE_INDEXABLE` is production-only. Canonical points to `www`.
- **Evidence class:** observed defect · **Priority: Low**
- **Correction:** Vercel dashboard, Settings, Domains: redirect 308 to `www.eliasb.dev` (D6). No code, no cost.
- **Verification:** `curl -sI https://eliasb-dev.vercel.app/` shows 308 and `location: https://www.eliasb.dev/`.
- **Pick:** open

#### F-40. Node is 24.x on Vercel and 22 in CI
- **Lens:** vercel · **Surface:** platform and types
- **Location and evidence:** project `nodeVersion: "24.x"`; `.github/workflows/quality.yml:42,100` use 22; no `engines`, no `.nvmrc`. Both are supported; the build is clean (19 s).
- **Evidence class:** observed (config drift) · **Priority: Low**
- **Correction:** `"engines": {"node": "24.x"}` and CI on 24 (D5).
- **Verification:** the build log and CI log name the same Node; `pnpm check` and `check:built` stay green.
- **Pick:** open

#### F-41. `/favicon.ico` returns a full 404 page
- **Lens:** vercel · **Surface:** platform and types
- **Location and evidence:** `curl -I https://www.eliasb.dev/favicon.ico` is 404 `text/html`. Browsers use the `<link rel="icon">` tags; blind requesters (some previewers and bots) get the 404.
- **Evidence class:** observed defect · **Priority: Low**
- **Correction:** one permanent redirect in `next.config.ts` `redirects()` from `/favicon.ico` to `/icon1.png`.
- **Verification:** `curl -I` returns 308 or an `image/*` 200.
- **Pick:** open

#### F-42. Open Graph image URLs have no cache-busting hash on `/things-i-make` and `/resume`
- **Lens:** vercel · **Surface:** platform and types
- **Location and evidence:** `/`, BNP and Threshold use `…/opengraph-image?<hash>`; `/things-i-make` and `/resume` use the bare `https://www.eliasb.dev/opengraph-image`. All resolve as 1200×630 PNG.
- **Evidence class:** code-only · **Priority: Low** (a stale card in unfurlers if the shared card changes; the Résumé sheet itself stays untouched)
- **Correction:** let both routes inherit the root `openGraph.images` so Next appends its hash.
- **Verification:** `curl -s https://www.eliasb.dev/resume | grep -o 'og:image" content="[^"]*'` shows `?<hash>`.
- **Pick:** open

#### F-43. Cross-origin and HSTS header extras are absent
- **Lens:** vercel · **Surface:** platform and types
- **Location and evidence:** every route has CSP, nosniff, `X-Frame-Options: DENY`, referrer policy, permissions policy and HSTS (`max-age=63072000`). No COOP or CORP; HSTS has no `includeSubDomains` or `preload`.
- **Evidence class:** preference · **Priority: Low** (a scanner score; no exposure on a static site with no cookies or forms)
- **Correction:** optionally add `Cross-Origin-Opener-Policy: same-origin` to `securityHeaders` in `next.config.ts`; leave HSTS and the CSP alone.
- **Verification:** the header appears on `/`, `/_next/static/…` and `/resume`; `verify:release` passes.
- **Pick:** open

## What held up

- **Accessibility:** 32 axe runs (8 routes × 390 and 1440 × light and dark) with 0 violations; 10 open-state sweeps clean; 16 full Tab walks with no hidden or unringed stop; no sideways scroll at 320 or 720 px; all 13 hand-built controls work by keyboard and expose name, role and state.
- **Motion:** reduced motion across 32 loads leaves 0 running animations and nothing stuck at `opacity: 0`; no `transition: all`, no infinite keyframes, hover gated by `(hover: hover)`; Monte Carlo, the switches, the lightbox and view transitions survive rapid input.
- **Craft:** nothing under 13 px, no contrast failures on coloured panels, zero overflow at six awkward widths, concentric bezel geometry, subgrid trays aligned to the pixel.
- **Writing:** #528's fixes are live; no em dashes, no American spellings, figures agree across surfaces.
- **TypeScript:** 0 `any`, 0 `@ts-ignore`, 0 `as unknown as`; every external response is parsed as `unknown`; no source file over 1,000 lines.
- **Platform:** static prerender with edge hits, correct 308s, security headers on every route type, immutable hashed assets, brotli, 0 third-party requests, the sitemap matching the real routes, and each data band falling back to its last good value.

## Limits of this sweep

- Chromium only, on one laptop with a real GPU. No iPhone, WebKit, Windows high contrast, VoiceOver or NVDA. The 3D lanyard was measured but its software-WebGL fallback was not exercised; the #532 real-device sign-off covers the pass.
- Lab Core Web Vitals only; TBT stands in for INP and there is no field data.
- The Speed Insights byte cost is unmeasured (#535 measures it).
- The history image (F-09), the "now making" repo (F-03) and the GitHub window (F-02) depend on live feeds and today's date.
