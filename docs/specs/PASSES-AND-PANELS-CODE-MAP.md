# Passes and panels: where the redesign meets the code

A map from each ticket under [#409](https://github.com/3ixas/eliasb.dev/issues/409) to the code, tests and gates it replaces. It was written from the tree at `cd08075` (12 November 2026) by reading file names, header comments and the files named below, not every line. Treat a row as where to start looking; if the code disagrees, the code is right, and fix this file in the same pull request.

Read with `PASSES-AND-PANELS-SPEC.md` (what to build) and `docs/design/DESIGN.md` (the contract).

## The shape of the code today

- **Routes** (`src/app/`): `/` (`page.tsx` → `components/site/homepage.tsx`), `/work/[slug]`, `/things-i-make`, `/things-i-make/[slug]`, `/resume`, `not-found.tsx`, redirects at `/about`, `/library`, `/lab`, the Markdown mirrors `/index.md` and `/llms.txt`, `opengraph-image.tsx` at three levels through `share-card.tsx`, and dev-only `/fixtures/*`.
- **Components**: `src/components/quiet/` is the quiet index's own parts (rows, closer looks, the pass, the pen, Off the clock's objects). `src/components/site/` is shared across pages (header, greeting, theme, long-form template, Role story, case study, archive, Résumé, GitHub year).
- **Styles** (`src/app/*.css`, 4,588 lines): `stretch-tokens.css` (tokens), `stretch-type.css` (faces and fallbacks), `stretch-shell.css`, `quiet-index.css` (2,120 lines: rows, objects, closer looks), `quiet-opening.css`, `quiet-header.css`, `quiet-long-form.css`, `quiet-forced-colors.css`, `stretch-resume.css` (the sheet: do not touch), `base.css`.
- **Content** (`src/content/`): every string and fact, with its own problem checks. `stretch/` holds the homepage, Role stories, case studies, the pass, the greeting, Off the clock and site copy. The redesign reads this; it does not rewrite it, except where a ticket names a field.
- **Integrations** (`src/integrations/`): GitHub, Goodreads, Letterboxd, history, with mappers, caches and fallbacks. Unchanged by the redesign.
- **Tests** (`e2e/`): 38 spec files, about 460 tests, run in CI across Chromium and WebKit at 320, 390, 820 and 1440 px in light and dark. 35 of the 38 name quiet-index parts. `e2e/support/` has the contrast and tap helpers to reuse.
- **Gates** (`scripts/`, run by `pnpm check` in the required `quality` job): see the table at the end.

## What stays as it is

Carry these over; restyle only where a ticket says so.

| Thing | Where | Note |
|---|---|---|
| Theme controller | `components/site/theme.ts`, `eclipse-toggle.tsx` | Keep the logic, storage and crossfade. The Eclipse keeps its name and its icon may be redrawn to the prototype's half disc |
| Greeting | `site/site-greeting.tsx`, `greeting-scene.tsx`, `content/stretch/greeting.ts` | Keep whole: lines, scenes, London's time, phone behaviour, reserved width |
| Section links | `site/sections.ts`, `section-links.tsx` | Same five labels and targets; `verify:release` checks them |
| GitHub year's model | `site/contribution-calendar-model.ts`, `github-year.tsx` | Keep the data model, keyboard and text alternative; restyle the cells |
| Count-up | `quiet/count-up.tsx` | Reuse for display figures |
| Shrink on view | `site/shrink-on-view.tsx` | Reuse for bars growing once |
| Arrival image, zoomable image | `site/arrival-image.tsx`, `zoomable-image.tsx` | Reuse for screenshots and the large view |
| Copy email | `quiet/copy-email.tsx` | Keep the clipboard fallback; restyle as the Button |
| Spring | `site/spring.ts`, `signature-springs.ts`, `verify:springs` | Keep; the pass's swing can use it |
| Role story figures | `site/role-story-figures.tsx` | The flag, the scale and the screens: restyle onto panels |
| Résumé sheet | `site/resume.tsx`, `stretch-resume.css`, `scripts/render-resume-pdf.mjs` | Untouched. **Its Awards section reads `passRecords[...].pins`**, so keep that data even though the pass stops drawing pins |
| Markdown mirrors | `src/content/markdown.ts`, `e2e/markdown.spec.ts` | Unchanged unless a ticket changes copy |
| Content checks | `passProblems` and its peers in `src/content/` | Extend, never loosen |

## Ticket by ticket

"Specs" lists the spec files that mostly cover the part. Rewrite each against the new part in the same pull request; do not delete one without a successor that checks the new behaviour. Counts are tests in the file today.

### #410 Integration branch, tokens and type

- **Builds on:** `stretch-tokens.css`, `stretch-type.css`, `src/app/fonts/`, `og-font.ts`, `layout.tsx`.
- **Decide first:** new token names. Recommended: role names without a design's name (`--page`, `--paper`, `--ink`, `--muted`, `--hair`, `--tint`, `--cobalt`, `--green`), added beside the `--stretch-*` set so old parts keep rendering until their ticket; the old set is deleted in #420.
- **Specs:** `stretch-tokens` (7), `contrast` (3), `stretch-type` (9), `font-swap` (1), `theme` (15).
- **Gates:** `verify:type-scale` must accept the new scale beside the old until #420.
- **Also:** ADR 0006 for the direction, after `docs/adr/0005-stretch-redesign.md`. `GLOSSARY.md` gains Panel. The branch and its ruleset (see `docs/runbooks/merging.md`, "The redesign's integration branch").
- **As built:** the tokens are in `src/app/tokens.css` (imported after `stretch-tokens.css` in `layout.tsx`): the colours, `--year-0` to `--year-4`, `--serif` and `--sans`, and ten `--type-*` sizes. The faces are `next/font/google` with its automatic fallback faces, exposed as `--font-newsreader` and `--font-instrument-sans`. The theme controller's logic is unchanged; its palette list (`registerPalette` in `theme.ts`) and the crossfade's `transition-property` (`stretch-shell.css`) gained the new colours so they fade with the rest. The fixture is `/fixtures/tokens`. `tokens.spec.ts` and `type.spec.ts` are the successors of `stretch-tokens`, `contrast` (for the new pairs), `stretch-type` and `font-swap`; the old specs keep checking the quiet index's set and retire with it in #420. `theme.spec.ts` gained a crossfade check for the new palette. `verify:type-scale` reads the `--type-*` tokens from `tokens.css` and holds each at 13 px or more.
- **Left for later:** `--out` and `--spring` already exist with the quiet index's curves, so the new curves (`DESIGN.md`, "Motion") arrive with motion in #423. Employer and project fields arrive as data with the panels. `TOOLBAR_COLOUR` still names the old page colours until the shell (#411) moves the page onto `--page`.

### The panel and the control set (split from #410)

- **Builds on:** nothing existing; closest are `.stretch-pill` and the row's hover and press in `quiet-index.css`.
- **Specs:** `feedback` (7), `craft-precision` (21, the parts about press and interruption), `classic-scrollbars` (2).
- **Fixture:** a `/fixtures/` page showing every control on the page and on each panel field, as `parts.html` does in the prototype. `e2e/materials.spec.ts` and its 14 baselines picture the old objects; replace them with pictures of this fixture.
- **Gates:** `verify:craft` learns the new feedback, press and focus values.
- **As built (#423):** the styles are `src/app/parts.css` (`.frame`, `.section`, `.panels`, `.panel`, `.pill`, `.button`, `.text-link`, `.row`, `.chip`, `[data-rise]`, `[data-grow]`). `components/parts/panel.tsx` has `Panel`, `PanelHead` and `Arrow`; `components/parts/on-view.tsx` has `OnView` (rise and grow) and `Count`, which arm only what starts below the fold and finish at once when unmounted. They replace `count-up.tsx` and `shrink-on-view.tsx` for the new parts; those stay for the quiet index until #420. Panel fields are content: `panel: { field, ink }` on each Role story and featured project, checked for 4.5:1 by `panelColourProblems` (`stretch/story.ts`) through `roleStoryProblems` and `catalogueProblems`. `--out` and `--spring` moved to `tokens.css` with DESIGN.md's curves; the quiet index reads them too. `--type-row` (22 px) and `--type-link` (19 px) joined the scale. `verify:craft` holds the new ring (3 px offset, the panel's ink on a panel) beside the old one, and names the arrival motions. The fixture is `/fixtures/parts`; `parts.spec.ts` is the successor of `feedback`, `craft-precision` (press and interruption) and `classic-scrollbars` for the new parts, and `materials.spec.ts` now pictures this fixture (its old baselines are gone). `/fixtures/materials` stays until #420 retires its objects.
- **Left for later:** a pill wraps inside its panel when a name is long (Optegra's full name); #413 decides whether panels and passes use the full or the short name. In dark, Joveen's near-black field is close to the page; judge it on the real Work panel in #413.

### #411 The shell

- **Replaces:** `site/site-header.tsx`, `quiet-header.css`, `stretch-shell.css`, `quiet/say-hello.tsx`, and the header portrait's closer look (`quiet/opening-looks.tsx`, in part).
- **Keeps:** the greeting, the Eclipse, section links (above).
- **Specs:** `homepage-shell` (30), `shell-details` (7), `header-portrait` (9, retires), `say-hello` (12), `inner-pages` (4), `first-frame` (6).
- **New behaviour to test:** Menu (`aria-expanded`, Escape, links without script), the header is not sticky, Say hello on every route.
- **As built:** the styles are `src/app/shell.css`: the page on `--page` and `--ink`, the skip link, the theme crossfade (moved from `stretch-shell.css`, same property list), the header, the greeting and its scene (classes renamed from `qi-greeting`/`qi-scene` to `greeting`/`scene`), the links and Menu, the theme control and Say hello. `site/site-header.tsx` is rewritten: `<SiteHeader home />` on the homepage, `<SiteHeader />` everywhere else, the same five links on every page (`#id` at home, where the one in view is marked `aria-current`; `/#id` elsewhere). Long-form pages no longer put their own sections in the header. `site/section-links.tsx` holds the links and Menu; the boot script in `layout.tsx` marks the page `data-script`, and only then do the links wait behind Menu under 900 px (the full row needs about 880 px; DESIGN.md and the spec said 720, which overflowed between 720 and 900). Menu comes before the links and the theme control is last, so Tab follows the eye: on a phone Menu sits left of the theme control (the prototype has them the other way). `site/say-hello.tsx` and `site/copy-email.tsx` (moved from `quiet/`) are Say hello and its Copy, the parts.css Button; Copy lays both words in one cell so it never changes width, and fills with ink while it says "Copied". The email's cobalt underline is a text decoration, so it underlines every line it wraps to. Every page ends with Say hello, inside `main` (after it on the Résumé, whose desk is `main`); the header and Say hello do not print. `TOOLBAR_COLOUR` and the boot script are `#eeede9`/`#0d0d0f`. New type tokens: `--type-hello` (21 px) and `--type-name` (20 px). `verify:craft` holds the new ring in `shell.css` and names the greeting's, links' and Eclipse's motions. Removed: `quiet-header.css`, `quiet/say-hello.tsx`, the header portrait and its closer look (its caption, "Based in London", and `header-portrait.spec.ts`), and Say hello's rows, objects and Copy styles in `quiet-index.css`. Specs rewritten: `homepage-shell`, `say-hello`, `inner-pages`, `first-frame`; adjusted where they named the old header: `case-study`, `role-story`, `not-found`, `resume`, `feedback`, `theme`, `craft-precision`, `share-cards`, `stretch-type`, `stretch-tokens`, `work`, `opening`, and `phone-motion` (its sticky-header tests go; `homepage-shell` checks the header scrolls away). No screenshot baseline changed: none pictured the shell.
- **Left for later:** `stretch-shell.css` keeps what the quiet index's parts still use (their face, ring, press, column, section rhythm, the pill and the live dot) and goes in #420. The Eclipse's icon still reads `--stretch-dark` and the scene's amber `--sun`, both from `stretch-tokens.css`; #420 moves them to `tokens.css`. The Résumé's Download PDF is still the old pill (#419).

### #412 The opening and the passes

- **Replaces:** `quiet/opening.tsx`, `quiet-opening.css`, `quiet/reveal-word.tsx`, `quiet/opening-looks.tsx`, `quiet/finished-pass.tsx`, `site/staff-pass-hang.tsx`.
- **Content:** `content/stretch/staff-pass.ts` gains each pass's three points (keep `pins` for the Résumé); `passProblems` checks all three. `content/stretch/opening.ts` keeps the line and support.
- **Specs:** `opening` (17), `reveal-words` (21, retires).
- **Asset:** `public/profile/elias-evening.webp` (the white-tux portrait), cropped by CSS in the prototype; ship a real crop through `next/image`.
- **As built:** the pass is a shared part, `components/parts/staff-pass.tsx` with `pass.css`; `components/parts/pass-light.tsx` holds a rail of passes and lets each catch the light under a fine pointer. The opening is `components/site/opening.tsx` with `opening.css`, rendered by `homepage.tsx` in place of `quiet/opening.tsx` (removed). The portrait is a real crop, `public/profile/elias-evening-pass.webp` (352 × 426, from x 240, y 77, 533 × 645 of the original, the prototype's CSS crop). `passRecords` gains `points` (three, each naming its source: an evidence index or quotes from the story's text or figures) and `lanyard`; the band is the Role story's `panel` field and ink, not the prototype's white on BNP Paribas, which measured under 3:1 under the sheen. `passProblems` now also checks that every number on a point is in its source; `verify:copy` holds failing cases and walks the points against the copy deck, which gained a "Staff passes" section from R-12's table. `passName` (`content/stretch/pass-name.ts`) joins the print into the link's accessible name. Each pass links to its employer's row in Work (`#bnp-paribas`, `#joveen`, `#optegra`, ids on the quiet rows; #413 moves them to the panels). New tokens: `--stock`, `--stock-end` (card stock, darker in dark) and `--shadow`, registered for the crossfade. `verify:type-scale` lets `pass.css` alone size text in the card's em, `verify:craft` holds the pass's ring and names its lean and sheen. Specs: `opening` rewritten; `reveal-words` retired with the homepage's reveal words; `font-swap` retires: its subject, the opening line in the quiet index's display face, is gone, and `type.spec` now measures the opening line's Newsreader swap; `classic-scrollbars` holds the header's name steady instead of the h1; `inline-close` opens its look above from Work's first row; `desktop-motion` and `stretch-type` lose the opening's reactions; `homepage-signoff` takes DESIGN.md's length budget (8 screens at 1440 × 900, 11 at 390 × 844). No screenshot baseline changed.
- **Left for later:** the Role stories still hang the old full pass (`quiet/finished-pass.tsx`, `site/staff-pass-hang.tsx`) and keep their reveal words, closer looks and `quiet-opening.css`'s display line, which long-form titles wear: all of it goes in #417. Work's rows (#413) and the 404 (#419) still use the mini pass. `quiet-opening.css` lost the homepage opening's own rules only.

### #413 Work

- **Replaces:** `quiet/work.tsx`, the simulation and cores in `quiet/opening-looks.tsx`.
- **Content:** `content/stretch/work.ts`; amounts for bars from `role-stories.ts` (`figures["what-changed"].rows`, each story's `evidence`).
- **Specs:** `work` (26), `work-inline` (11, retires), `inline-close` (7, retires), `desktop-motion` (10, retires), `phone-motion` (7, retires).
- **Reference:** the simulation's logic is `simulate()` in the prototype's `app.js` (seeded walk, histogram, mean).
- **As built:** Work is `components/site/work.tsx` with `src/app/work.css`, rendered by `homepage.tsx` as its own `section#work` on the parts frame (`.frame.section`, `h2.section__title`, `.work__subheading`). The panels' words and numbers are `content/stretch/work-panels.ts`: BNP Paribas's figure (its evidence item "Six · months from zero C# …"), the simulation's labels, caption and accessible description, two comparisons that each name a row of the Role story's scale figure for their amounts, and Joveen's and Optegra's display figure (an evidence index, counting from 0 and 62) and three pairs. `workPanelProblems` fails when a figure is not its story's evidence, a comparison's value is not in its scale row, a pair's number is not in its story, or a bar's amounts are not what its value states (a change in per cent is drawn from 100); `verify:copy` checks every string against the deck's new "Passes and panels · Work" section and holds failing cases. Panel headers use the short name, as the passes do (Optegra, not Optegra Eye Healthcare & Kensington Medical), so the pill never wraps. Each panel carries its slug as its id, so the opening's passes land on it. The simulation is `site/simulation-model.ts` (the prototype's walk, seeded, except that an endpoint beyond the plot counts in the nearest bin so the bins always sum to 70) and `site/simulation-plot.tsx`: the server draws the axes, histogram and price line; the paths are worked out and drawn in the client when the plot comes into view, so they are not in the HTML. Arriving below the fold, the paths draw by a `clip-path` over 1.1 s, the bins grow from 1.1 s and the price line appears at 1.8 s; `verify:craft` names the three. Bars are `.bar`/`.bar--after` with `--share` in `[data-grow]`. In dark every Work panel has a hairline of its own ink, so Joveen's near-black field keeps its edge on the page. Where I'm headed's strand rows moved to `quiet/headed-rows.tsx` and follow the panels inside `#work` until #414. Removed: `quiet/work.tsx`. Kept: `opening-looks.tsx`, which the Role stories' reveal words still open (#417). Specs: `work` rewritten for the panels (with Where I'm headed's rows at its end); `work-inline`, `desktop-motion`, `phone-motion` and `craft-precision`'s interruption tests now run on the strand rows, the homepage's last rows with closer looks, and retire with them in #414; `inline-close` lost its two employer tests and keeps Off the clock's training row; the tests of the mini pass's swing, the employer looks' pins and passes, and the object buttons beside employer links retire with the rows. `homepage-shell` checks Work's new title and subheading; `first-frame` skips an arrival armed below the fold. No screenshot baseline changed.
- **Left for later:** `work.employers` (pins, proofs, `countFrom`) stays for the Role stories, the Markdown mirror and the Résumé until #417. The 404 still uses `MiniPass` (#419).

### #414 Where I'm headed and How I work

- **Replaces:** the strands in `quiet/work.tsx`, `quiet/how-i-work.tsx`, `quiet/typed-quote.tsx`, `quiet/sheet.tsx`.
- **Content:** `content/stretch/work.ts` (line 144 holds the lead, which changes to the line in the spec's Decisions), `content/stretch/how-i-work.ts`.
- **Specs:** `how-i-work` (12), `motion` (11, the pen's strokes retire).

### #415 Things I make and the archive

- **Replaces:** `quiet/things-i-make.tsx`, `quiet/project-rows.tsx`, `quiet/project-object.tsx`, `site/work-archive.tsx`, `site/work-archive-page.tsx`.
- **Content:** `content/projects.ts`. Panel fields are the project's `swatch` for Threshold and Argus Risk and a lifted field for Flowtime (see `DESIGN.md`, Tokens); add them as data and extend the colour check.
- **Specs:** `things-i-make` (11), `work-archive` (17).

### #416 Off the clock

- **Replaces:** `quiet/off-the-clock.tsx` (330 lines), `quiet/training.tsx`, `quiet/calendar-tile.tsx`, `quiet/today-tile.tsx`, `quiet/clipping.tsx`, `quiet/cycle.tsx`, `site/now-mark.tsx`, `site/off-the-clock.tsx`.
- **Keeps:** every integration and fallback; `site/github-year.tsx`'s model.
- **Content:** `content/stretch/off-the-clock.ts` (labels, fallbacks, `asOf`, `fromAsOf`, `count`).
- **Specs:** `off-the-clock` (55, the largest file: 725 lines). Split the rewrite by cell.
- **Reference:** `parts.html` shows the stale and fallback states.

### #417 Role stories

- **Replaces:** `site/role-story.tsx`, the long-form parts of `site/long-form.tsx`, `quiet-long-form.css`.
- **Specs:** `role-story` (28), `figure-expand` (6).
- **Reference:** `bnp.html` and `joveen.html` (a story with screenshots and four evidence figures).

### #418 Case studies

- **Replaces:** `site/case-study.tsx`, the rest of `site/long-form.tsx`.
- **Specs:** `case-study` (17), `figure-expand` (6, shared with #417; whichever lands second extends it).

### #419 The Résumé page, the 404 and share cards

- **Replaces:** the desk around the sheet in `site/resume.tsx` (the sheet itself stays), `not-found.tsx`, `site/missing-address.tsx`, `share-card.tsx`, `og-font.ts`, the three `opengraph-image.tsx`.
- **Specs:** `resume` (12), `not-found` (12), `share-cards` (3).
- **Watch:** Satori cannot read custom properties or `light-dark()`; share cards take plain values.

### #420 Remove what is left of the quiet index

- **Deletes:** whatever remains in `src/components/quiet/`, `quiet-*.css`, the `--stretch-*` tokens and `[data-stretch-*]` hooks no longer used, Bricolage and DM Mono files, `/fixtures/` pages for retired parts.
- **Gates:** `verify:retired` names each retired part.

### Gates and standing checks (split from #420)

- **Specs:** `standing-checks` (2, but they loop over every page), `forced-colors` (2) with `quiet-forced-colors.css`, `layout-shift` (1), `homepage-signoff` (2: the length budget), `markdown` (4), `craft-precision` (the rest).
- **Gates:** `verify:craft`, `verify:type-scale` drop the old values; `scripts/js-budget.json` is re-baselined once.

### The contract, the glossary and the runbooks (split from #420)

- `docs/design/DESIGN.md` loses "Being built". `GLOSSARY.md`: rewrite Staff pass, Craft bar, Featured work, Work archive, Off the clock, Now making; move Row, Closer look, Margin, Reveal word, Missing row, Pass pin, Award pin, Quiet index to History. `docs/runbooks/interruption-walk.md` and `visual-baselines.md` describe the new parts. `README.md` if it names the design.

### #421 and its two splits, and #422

No code to replace. They check the finished build; see the tickets.

## The gates

| Script | What it holds | The redesign's effect |
|---|---|---|
| `verify:copy` | Approved strings against `docs/content/redesign-copy.md` | Changed strings (open decisions) update the deck first |
| `verify:signals` | Integration contracts and fallbacks | None |
| `verify:catalogue` | Project data | Panel fields added as data (#415) |
| `verify:type-scale` | Every `font-size` in `src/app/*.css` | Rewritten for the new scale (#410, then the gates ticket) |
| `verify:craft` | Focus ring, curves, shadow tokens, feedback timings, read from CSS | Rewritten for R-05 and R-07 |
| `verify:retired` | Retired names never reappear in source | Gains the quiet index's parts (#420) |
| `verify:springs` | `spring.ts` matches Motion | None |
| `verify:resume` | The sheet's text matches the committed PDF, two pages | Must stay green untouched |
| `verify:routes`, `verify:release` | Routes, redirects, nav targets, share cards, sitemap | Must stay green; `verify:release` needs a production build, so CI is where it runs |
| `verify:ci-coverage` | Every `verify:*` is run by CI | A new gate must be wired into `check` |
| `check:built` | Script size per route against `scripts/js-budget.json` | Re-baselined once |

## Running things locally

`docs/runbooks/local-testing.md` is the rule: one Playwright project at a time, one worker, relevant specs only, never a full build or the full suite without Elias's approval, Node 22 at `/usr/local/bin`. For each ticket run its specs on `chromium-1440-light`, `chromium-390-dark` and, in its own invocation, `webkit-390-light`; CI runs the rest.
