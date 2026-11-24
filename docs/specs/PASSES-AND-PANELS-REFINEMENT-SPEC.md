# Passes and panels refinement: Hybrid A + B

Status: **approved by Elias on 23 November 2026** following two live T3 Preview annotation passes on the merged prototype. This is the build spec for updating the shipped Passes and panels site (`main` at `72875a0`) to match the updated design contract in `docs/design/DESIGN.md`.

- **Design contract:** `docs/design/DESIGN.md` (updated in place on 23 November 2026 — where anything disagrees, `DESIGN.md` wins).
- **Visual reference:** `docs/review/2026-11-23-gemini-explorations/prototype-final/` (`index.html`, `bnp.html`, `threshold.html`, `things.html`, `style.css`, `app.js`, `README.md`, `shots/`).
- **Prior build spec:** `docs/specs/PASSES-AND-PANELS-SPEC.md` (`R-01` to `R-40`). Requirements below continue cleanly from `R-41` to `R-55` and supersede only the specific rules they name.

---

## Problem Statement

Passes and panels shipped to `main` with strong foundations — real Three.js 3D passes, full-colour employer and project panels, working interactive figures, and crisp Newsreader / Instrument Sans typography — but live review surfaced recurring friction across surfaces:

1. **Opening & mobile clutter:** three hanging passes in the opening (and three separate passes mounted inside mobile Work panels) compete with the headline, and stark `1 px` full-ink rules on the header and footer feel harsher than the panels between them.
2. **Dark-theme separation & screenshot framing:** dark signature panels (`#0b0b0c` Joveen, `#2a211b` Flowtime) and dark product UIs risk melting into the `#0d0d0f` dark page or their own panel fields; bleeding cropped screenshots lose product context, and Threshold's homepage panel leaves an empty ochre void on the left.
3. **Mid-page rhythm & repetition:** How I work's four identical-structure cards read like a repetitive wall and duplicate Where I'm headed's 57-tick motif; Off the clock's workout row feels sparse while its history illustration is small; long-form Case studies open with a tall coloured slab instead of matching Role stories' crisp reading architecture and sticky chapter rail.

## Solution

Apply the approved **Hybrid A + B** refinement across the shell, homepage, Role stories, Case studies, and archive without rebuilding working primitives or breaking standing quality gates:

- Keep the shipped **Three.js 3D Staff pass**, **GreetingScene SVG glyphs**, **Eclipse SVG theme toggle**, **`where-im-headed.tsx` drawn proofs**, **ZoomableImage lightbox**, and **working figures** (`threshold-link`, `argus-provenance`, `flowtime-break`, `simulation`, `flag-lanes`), elevating their framing, hierarchy, and cohesion.
- Use **Direction A's subtle `1 px` grey hairlines (`--hair`)** consistently across the header, panels, cards, bezels, and closing band in both themes.
- Adopt **Direction B's structural upgrades**: full-bleed `--band` warm-linen tonal band for Where I'm headed + How I work and Say hello, compact 3-metric Work trays on Joveen and Optegra, concentric optical bezels around whole uncropped screenshots, nested stone rows in Off the clock, and Role/Case study sticky chapter rails with structured bordered Problem & Decision cards.

---

## Implementation Decisions

Requirement IDs continue from `PASSES-AND-PANELS-SPEC.md` (`R-41` to `R-55`). Values come from `docs/design/DESIGN.md` and `docs/review/2026-11-23-gemini-explorations/prototype-final/style.css`.

### Tokens, Shell & Layout

#### R-41 Tonal band token and subtle `1 px` grey borders
Add `--band` to `src/app/tokens.css` (in light, `@media (prefers-color-scheme: dark)`, `:root[data-lights="on"]:not([data-theme="light"])`, and `:root[data-theme="dark"]`, plus theme crossfade registration in `src/components/site/theme.ts`):
- Light: `--band: #e4e1da`
- Dark: `--band: #14151a`

Replace stark `1 px solid var(--ink)` dividers on the header and Say hello with subtle `1 px solid var(--hair)`. Edge every panel, card, nested row, and optical bezel with a subtle `1 px` grey hairline in both themes (`--hair` on paper/band; subtle ink/white hairline on coloured fields). Lift Joveen's panel field to `#1a1a1f` (with `#f4f4f2` / `#f3f2ee` ink and subtle `1 px` border) so it cleanly separates from `#0d0d0f` dark ground; keep Optegra (`#07535b` / `#006765`, `#ffffff` / `#f0fbf9` ink) and all other signature fields AA-compliant in both themes. Zero dark-theme coloured glows.

**Affected files:** `src/app/tokens.css`, `src/app/parts.css`, `src/components/site/theme.ts`, `src/content/roles.ts` (or employer palette source).  
**Acceptance:** all four theme selectors stay identical; every text pair passes WCAG 2.2 AA in light and dark; Joveen panel clearly separates from `#0d0d0f` dark page; `verify:craft` and `verify:type-scale` pass.

#### R-42 Header: subtle rule, live GreetingScene glyphs, borderless EclipseToggle
Keep `src/components/site/site-header.tsx`, `src/components/site/greeting-scene.tsx`, and `src/components/site/eclipse-toggle.tsx` intact:
- Header bottom border becomes `1 px solid var(--hair)`.
- `EclipseToggle` renders **borderless** on the header ground (44 × 44 px hit target, subtle `--tint` hover fill on fine pointers, 2 px cobalt focus ring on `:focus-visible`, zero border ring at rest).
- Keep the live `GreetingScene` SVG glyphs and time-of-day copy untouched.

**Affected files:** `src/app/shell.css`, `src/components/site/eclipse-toggle.tsx`.  
**Acceptance:** 44 px target holds; no outer ring on the theme toggle at rest; focus ring ≥ 3:1; header height stays 64 px; mobile Menu behaviour (`< 900 px`, `aria-expanded`, Escape close, no-JS fallback) unchanged.

#### R-43 Stacked section subheadings site-wide
Every section subheading (`.section__note` or equivalent under `#work`, `#things-i-make`, `#how-i-work`, `#off-the-clock`, and archive) stacks **directly underneath** its section `<h2>`, left-aligned with readable measure (`≤ 640 px`), never floated to the right side of the heading.

**Affected files:** `src/app/homepage.css` (or section header stylesheet), `src/app/work.css`, `src/components/site/homepage.tsx` / section headers.  
**Acceptance:** at 1440, 1024, 390 and 320 px, every section subheading's top edge is below its `<h2>`'s bottom edge and left-aligned with it.

### Homepage Opening & Work

#### R-44 Single current 3D Staff pass in the opening
Simplify the homepage opening (`src/components/site/opening.tsx`, `src/components/parts/staff-pass.tsx`, `src/components/parts/lanyard/`) to display **one Staff pass only — the current role (BNP Paribas)** — preserving the real Three.js 3D pass with generated webbing (`public/lanyard/webbing.webp`), hologram foil (`public/lanyard/foil.webp`), procedural stock, and drag/throw/spring physics:
- **Desktop (`≥ 960 px`):** hangs directly from the header's `1 px` grey hairline at the right (`top: 0`, clipped cleanly at top anchor so the strap never pokes above the header).
- **Mobile (`< 960 px`):** text + actions stack above a quiet rail hairline from which the single BNP Paribas pass hangs cleanly without overlapping the actions above it.
- **No mobile Work-panel passes:** remove the per-panel passes mounted inside mobile homepage Work panels (reversing `#510`'s mobile Work-panel pass mount, which the single opening pass supersedes).
- **No bottom metadata baseline:** do not render location pills, stack tags, or a `Work ↓` jump below the opening.
- **Share card alignment:** update the homepage share card (`pnpm share:assets` / `verify:share-assets`) so it carries the single current BNP Paribas pass rather than the retired three-pass cluster.

**Affected files:** `src/components/site/opening.tsx`, `src/components/site/work.tsx`, `src/components/parts/lanyard/*`, `src/app/pass.css`, `src/app/homepage.css`, `src/app/opengraph-image.tsx` (and share asset generator).  
**Acceptance:** Work heading stays below the fold at 1440 × 900 and 1280 × 720; only BNP Paribas pass renders in the opening on desktop and mobile; zero passes inside mobile Work panels; Three.js scene loads with real textures and falls back cleanly with reduced motion / no WebGL / no JS; `verify:share-assets` passes.

#### R-45 Work panels: full-colour BNP Paribas, Joveen & Optegra with compact metric trays
- **BNP Paribas:** full-width emerald `#00965e` panel with full-strength `#04140d` / `#03110a` ink, subtle `1 px` border, light translucent stat well (`6 months · from zero C# to production code`), and the two drawn scale comparisons (`Integrating a pricer`, `The competition dashboard's data load`). Monte Carlo simulation stays exclusively on the BNP Paribas Role story.
- **Joveen (`#1a1a1f`) & Optegra (`#07535b` / `#006765`):** side-by-side full-colour panels edged with subtle `1 px` grey hairlines in both themes, each pairing its employer heading, role/dates, and headline metric with a **compact 3-metric tray** (`520 ms → 230 ms`, `10 min → under 2`, `+30%`; `62% → 88%`, `−30%`, `+15%`) and story link, with shared row alignment so trays and links line up horizontally.

**Affected files:** `src/components/site/work.tsx`, `src/app/work.css`.  
**Acceptance:** all numbers come from `src/content/` with zero invented claims; both cards' metric trays and links align at `≥ 720 px` and stack cleanly under `720 px`; AA contrast holds on every text pair in light and dark.

### Things I Make & Archive

#### R-46 Featured project panels: full signature colours, concentric optical bezels & Threshold city switcher
Retain full signature panel fields on **Threshold** (`#c58f5e`), **Argus Risk** (`#4f86f7`), and **Flowtime** (`#2a211b`), edged with subtle `1 px` grey hairlines:
- **Concentric optical bezels:** display each featured screenshot **whole and uncropped** (`object-fit: contain` or full aspect container, no edge bleed cropping) inside a tuned concentric bezel (`24–28 px` outer panel → `16 px` bezel with field-tuned inset mat & `1 px` hairline → `10–12 px` image radius) so dark UIs (especially Flowtime on `#2a211b` and Argus on `#4f86f7`) stay crisply separated.
- **Threshold inline city switcher:** place a compact interactive `London / Basel / Zurich` city switcher and live URL preview inside Threshold's wide left column to close the empty ochre space and demonstrate URL-as-state directly on the homepage (progressive enhancement: defaults cleanly to London without JS).

**Affected files:** `src/components/parts/project-panel.tsx`, `src/components/site/things-i-make.tsx`, `src/app/things.css` / `src/app/parts.css`.  
**Acceptance:** zero screenshot clipping; clicking London / Basel / Zurich updates the live Threshold URL preview with polite `aria-live` announcement and 44 px targets; dark screenshots remain clearly framed on Flowtime and Argus in both themes.

#### R-47 Secondary project rows & Work archive (`/things-i-make`)
Style secondary homepage project rows (`Home Secretary`, `Risk Event Tracker`, `Ask Professor Past`) as calm bordered paper strips (`--paper` with `1 px solid var(--hair)`) carrying **visible-at-rest `60 × 40 px` micro-thumbnails** (or subtle framed preview thumbnails) alongside title, summary, and metadata. Apply matching subtle `1 px` grey borders and concentric optical bezels to the three featured project cards on `/things-i-make`.

**Affected files:** `src/components/site/things-i-make.tsx`, `src/components/site/work-archive.tsx`, `src/components/site/work-archive-page.tsx`, `src/app/work-archive.css`.  
**Acceptance:** thumbnails are visible at rest without hover; rows keep full-row hover tint, ≥ 44 px height, and zero overflow at 320 px.

### Where I'm Headed & How I Work

#### R-48 Full-bleed warm-linen tonal band (`--band`) for Where I'm headed & How I work
Wrap **Where I'm headed** and **How I work** inside one full-bleed `--band` section (`#e4e1da` light / `#14151a` dark) edged top and bottom by `1 px solid var(--hair)`:
- **Where I'm headed:** asymmetric `4 / 7` bordered paper panel (`--paper` on `--band`) preserving the live source-coloured chips (`Optegra`, `BNP Paribas`, `Threshold`) and the three bespoke drawn SVG proofs in `src/components/site/where-im-headed.tsx` (split test, six-month climb into code, 57 ticks → live mark).

**Affected files:** `src/components/site/homepage.tsx`, `src/components/site/where-im-headed.tsx`, `src/app/headed-how.css`.  
**Acceptance:** band spans full viewport width with zero horizontal overflow (`overflow-x` clean from 320 to 1440 px); `where-im-headed.tsx` SVG proofs and forced-colour styling remain intact.

#### R-49 How I work: 2 × 2 bordered cards with four distinct inset proof trays
Replace the four-across identical cards with a **2 × 2 grid** (stacking to 1 column under `720 px`) of bordered paper cards (`--paper`, `1 px solid var(--hair)`, `16 px` radius), each pairing its habit heading and highlighted story with its own **distinct bordered inset proof tray**:
1. **Start from a real problem:** `Threshold` and `Flowtime` micro-screenshot pills with their signature colour swatches linking straight to `/things-i-make/threshold` and `/things-i-make/flowtime`.
2. **Write it down first:** `57` serif numeral, a 13-slice stepped progress bar, and a direct `Threshold’s PRD, 16 Apr 2026 →` link inside the tray (removing the duplicate 57-tick drawing and separate bottom PRD link).
3. **Ship it so it’s safe to undo:** an interactive accessible `Off / On` `role="switch"` (`44 px` target) wired to live `Today’s path` and `New cached path` routing chips whose active highlight switches immediately on toggle (and renders cleanly off without JS).
4. **Measure whether it works:** bold `+15%` serif figure over proportional Before / After bars.

**Affected files:** `src/components/site/how-i-work.tsx`, `src/app/headed-how.css`.  
**Acceptance:** every card has a visually distinct tray; the interactive switch passes keyboard (`Space`/`Enter`) and axe checks and announces `aria-checked`; no duplicate 57-tick motif; `verify:copy` updated if any approved micro-label changes.

### Off the Clock & Say Hello

#### R-50 Off the clock: nested stone rows, calm 7-day schedule, tap-to-enlarge imagery & full-width Now making
Keep one bordered paper panel (`--paper`, `1 px solid var(--hair)`), setting its four sections as **nested stone rows** (`--page` fill with `1 px solid var(--hair)`) with left margin headings (`184–232 px` at `≥ 960 px`, stacked under `960 px`):
- **Today’s workout (`src/components/site/training-today.tsx`):** render today's full session above a calm, scannable **7-day weekly schedule** of static tiles (`Mon · Upper`, `Tue · Lower`, `Wed · Zone 2`, `Thu · Upper`, `Fri · Lower`, `Sat · Rope`, `Sun · Bike`) with today highlighted. Remove interactive day-preview buttons and remove any redundant summary/instruction line (`4× gym strength...`).
- **Tap-to-enlarge imagery (`src/components/site/off-the-clock-cells.tsx`, `src/components/site/history-band.tsx`):** wire both the Central London running photo and the enlarged Montgolfier / history 3:2 illustration (`~216–280 px` desktop, full width mobile) into the existing `ZoomableImage` lightbox (`cursor: zoom-in`, clear `aria-label`, **zero visible `Enlarge ↗` instruction copy**). Keep `1 of 3` outline pill stepping on click/tap.
- **GitHub & Now making (`src/components/site/github-year.tsx`):** place `GitHub, the past year` in the left margin column consistent with the rows above, giving **What I’m building now** (`ekit`) a full-width horizontal strip above the contribution grid.

**Affected files:** `src/components/site/off-the-clock.tsx`, `src/components/site/off-the-clock-cells.tsx`, `src/components/site/training-today.tsx`, `src/components/site/history-band.tsx`, `src/components/site/github-year.tsx`, `src/app/off-the-clock.css`.  
**Acceptance:** workout schedule is calm and non-interactive with today clearly marked; clicking/tapping either the running photo or history image opens the lightbox and returns focus on close; zero `Enlarge ↗` visible text; stale/down feed fallbacks hold their shape.

#### R-51 Say hello: full-bleed closing band & synchronous morphing Copy button
Set `Say hello` (`src/components/site/say-hello.tsx`, `src/components/site/copy-button.tsx`) inside a full-bleed `--band` closing band under a subtle `1 px solid var(--hair)` top rule. Update `CopyButton` so pressing `Copy` morphs synchronously in place (`Copy` → `✓ Copied`) at a fixed width (zero layout shift, immediate visual confirmation before async clipboard resolution, keeping clipboard-refusal text selection fallback and polite screen-reader announcement).

**Affected files:** `src/components/site/say-hello.tsx`, `src/components/site/copy-button.tsx`, `src/app/shell.css`.  
**Acceptance:** 0 px width shift between `Copy` and `✓ Copied`; immediate state change on click/Enter; works identically on Say hello and Threshold's Copy link.

### Long-Form Stories

#### R-52 Role stories: coloured hero banner with hanging Staff pass, sticky chapter rail & structured cards
Update `src/components/site/role-story.tsx`, `src/components/site/story-parts.tsx`, `src/components/site/long-form.tsx`, and `src/app/story.css`:
- **Hero banner & Staff pass:** bordered panel in the employer's colour holding `← Work`, employer `h1`, role/dates/setting, lede, and bordered evidence strip, paired with that employer's real hanging **Staff pass** (`PassLight` + `StaffPass`, hanging from the header hairline at the right from `960 px`, and from a quiet rail hairline beneath the coloured hero banner under `960 px` — replacing the flat embedded pass card per Elias's 24 Nov 2026 sign-off review).
- **Sticky chapter rail:** from `960 px`, sticky left navigation rail listing the story's plain section titles (zero numbers); active section highlighted via IntersectionObserver on a lifted bordered paper pill with a cobalt dot (progressive enhancement: plain jump links without JS).
- **Structured Problem & Decision cards:** render key narrative decisions/problems in tonal bordered paper cards (`--paper`, `1 px solid var(--hair)`) inside the right reading column (`≤ 640 px` prose measure, figures up to `760 px`).
- **Archival mat:** frame BNP Paribas's `_nology` Take Ownership certificate on a neutral archival mat with a subtle `1 px` border so the printed document separates cleanly in both themes.

**Affected files:** `src/components/site/role-story.tsx`, `src/components/site/story-parts.tsx`, `src/components/site/long-form.tsx`, `src/app/story.css`.  
**Acceptance:** applies cleanly to BNP Paribas, Joveen, and Optegra (including Optegra's long title at 320 px); zero chapter numbers; active pill updates on scroll without layout shift; sticky rail never overlaps figures.

#### R-53 Monte Carlo simulation legibility & live spread readout
Enhance `src/components/site/simulation-plot.tsx` and `src/components/site/simulation.tsx` on the BNP Paribas Role story:
- Raise at-rest stroke contrast/legibility of background simulated paths and axes on `#00965e` so the distribution reads crisply at rest without waiting for interaction.
- Add a live tabular **`10th–90th spread`** readout beside the `10 / 100 / 1,000` path selector and `Run again` control: the gap between the run's 10th and 90th percentile endpoints, recomputed on every run and included in the polite screen-reader announcement. More paths steady the estimate between runs; they do not narrow the spread, which the model's fixed volatility sets, so the readout never fakes a narrowing.

**Affected files:** `src/components/site/simulation-plot.tsx`, `src/components/site/simulation-model.ts`, `src/components/site/simulation.tsx`, `src/app/story.css`.  
**Acceptance:** the `10th–90th spread` equals the sampled endpoints' percentile gap on every run, and at `1,000` paths it varies less between runs than at `10`; simulation remains exclusively on the BNP Paribas Role story; reduced motion shows the finished plot at once.

#### R-54 Case studies: lifted open-ground header, exhibition stage & Threshold `Open this scenario ↗`
Update `src/components/site/case-study.tsx`, `src/components/site/threshold-link.tsx`, and `src/app/story.css`:
- **Lifted open-ground header:** replace the tall full-colour `.case-open` opening slab with an open-ground header on `--page` matching Role stories (`← Things I make`, project `h1`, outcome lede, stack chips, Live site and Code actions, and four bordered evidence cards).
- **Project-colour exhibition stage:** immediately below the header, place a full-width bordered panel in the project's signature colour (`#c58f5e` Threshold, `#4f86f7` Argus Risk, `#2a211b` Flowtime) holding the complete uncropped screenshot in a concentric optical bezel, clickable/tappable into `ZoomableImage`.
- **Sticky chapter rail & structured Decision cards:** share the exact same sticky left chapter rail (no numbers) and bordered tonal Decision cards as Role stories (`R-52`), while keeping all three working figures (`ThresholdLink`, `ArgusProvenance`, `FlowtimeBreak`) and the paper PRD card intact.
- **Threshold working figure action:** add an **`Open this scenario ↗`** external link beside `Copy link` that opens Threshold directly at the currently built URL.
- **Final case study ending:** the final case study (`Flowtime`) ends on a bordered paper **`All projects`** panel (`Things I make →`) linking to `/things-i-make` instead of looping back to `Threshold` (per Elias's 24 Nov 2026 sign-off review).

**Affected files:** `src/components/site/case-study.tsx`, `src/components/site/threshold-link.tsx`, `src/components/site/threshold-link-live.tsx`, `src/app/story.css`.  
**Acceptance:** applies cleanly to Threshold, Argus Risk, and Flowtime; first fold reaches the product exhibition stage immediately; `Open this scenario ↗` href tracks every `City / District / Place` selection and opens in a new tab with `rel="noopener noreferrer"`.

### Copy, Contract & Verification Gates

#### R-55 Approved micro-copy updates, baselines & standing gates
- **Approved new UI strings** (add to `docs/content/redesign-copy.md` and `verify:copy` allowlist as needed):
  - `10th–90th spread` (BNP Paribas Monte Carlo readout)
  - `Open this scenario ↗` (Threshold live URL figure)
  - `Threshold’s PRD, 16 Apr 2026 →` (How I work card 2 inset link)
  - `Today’s path` / `New cached path` (How I work card 3 live routing chips)
  - Compact 7-day cue labels (`Mon · Upper`, `Tue · Lower`, `Wed · Zone 2`, `Thu · Upper`, `Fri · Lower`, `Sat · Rope`, `Sun · Bike`) sourced from existing training data.
- **Preserved invariants:**
  - All existing routes and anchors (`#work`, `#things-i-make`, `#how-i-work`, `#off-the-clock`, `#say-hello`, `/work/*`, `/things-i-make/*`, `/resume`, `/404`).
  - Homepage length stays within **9 screens at 1440 × 900** (prototype measured `7.97`) and **12 screens at 390 × 844** (prototype measured `11.96`).
  - Zero horizontal overflow from `320` to `1440 px`, WCAG 2.2 AA contrast in light & dark, `≥ 13 px` type floor, `≥ 16 px` body, `≥ 44 px` touch targets, CLS `≤ 0.01`, JS gzipped budget within `scripts/js-budget.json`, reduced motion, no-JS completeness, and forced-colours fidelity.
  - All standing checks (`verify:copy`, `verify:craft`, `verify:type-scale`, `verify:retired`, `verify:share-assets`, `verify:resume`, `check:built`, Playwright visual/e2e specs) updated in the ticket that changes each surface and green before merge.

---

## Suggested Tracer-Bullet Ticket Breakdown

For the Lead's `to-tickets` pass (all targeting `main`, since Passes and panels is live on `main` at `72875a0`):

1. **T1 — Tokens, subtle `1 px` hairlines, header & Say hello (`R-41`, `R-42`, `R-43`, `R-51`):** add `--band`, subtle `--hair` borders, Joveen `#1a1a1f` lift, borderless `EclipseToggle`, stacked section subheadings, full-bleed Say hello band, synchronous morphing `CopyButton`. *(Unblocks all surface tickets.)*
2. **T2 — Single 3D BNP Paribas opening pass & homepage share card (`R-44`):** single BNP Paribas pass in opening (desktop + mobile rail), remove mobile Work-panel passes, remove any bottom baseline, regenerate homepage share card & `verify:share-assets`. *(Blocked by T1.)*
3. **T3 — Homepage Work panels (`R-45`):** BNP Paribas translucent stat well + crisp Joveen & Optegra full-colour panels with shared-row compact 3-metric trays and subtle `1 px` hairlines. *(Blocked by T1.)*
4. **T4 — Things I make & Work archive (`R-46`, `R-47`):** full-colour Threshold/Argus/Flowtime panels with concentric optical bezels around uncropped screenshots, Threshold inline city switcher, secondary rows on bordered paper strips with `60 × 40 px` visible thumbnails, `/things-i-make` archive alignment. *(Blocked by T1.)*
5. **T5 — Full-bleed `--band` for Where I'm headed & 2 × 2 How I work (`R-48`, `R-49`):** warm-linen tonal band, asymmetric `4 / 7` Where I'm headed panel, 2 × 2 How I work cards with four distinct inset proof trays + live accessible feature-flag switch. *(Blocked by T1.)*
6. **T6 — Off the clock nested rows, calm 7-day schedule & tap-to-enlarge imagery (`R-50`):** nested stone rows, static 7-day workout schedule, tap-to-enlarge running photo & enlarged history illustration (no `Enlarge ↗` copy), full-width `What I’m building now` (`ekit`) strip. *(Blocked by T1.)*
7. **T7 — Long-form Role stories & Monte Carlo legibility (`R-52`, `R-53`):** coloured employer hero banner with compact embedded pass, shared sticky left chapter rail (no numbers), structured tonal Problem & Decision cards, archival mat for `_nology` certificate, crisp Monte Carlo + `10th–90th spread`. *(Blocked by T1.)*
8. **T8 — Long-form Case studies (`R-54`):** lifted open-ground header, full-width project-colour exhibition stage with zoomable uncropped screenshot in optical bezel, shared sticky chapter rail + Decision cards, Threshold `Open this scenario ↗`. *(Blocked by T1, T7 for shared chapter rail/card primitives.)*
9. **T9 — Gates, copy deck, visual baselines & real-device sign-off (`R-55`):** reconcile `docs/content/redesign-copy.md`, `verify:craft` / `verify:type-scale` / `verify:copy` / Playwright baselines, CLS & JS budget checks, and Safari/iOS/VoiceOver/forced-colours pass. *(Blocked by T2–T8.)*

*(Note for Lead: T2–T7 are cleanly parallelizable once T1 lands; T8 shares the sticky chapter rail and tonal card CSS with T7.)*

---

## Out of Scope

- New career stories, projects, claims, or external integrations.
- Changes to the Résumé A4 sheet or PDF (`resume.css`, `Elias-Bennett-Resume.pdf`).
- Changes to the 404 visitor pass page.
- Replacing Three.js 3D lanyard physics, `GreetingScene` SVG art, or `where-im-headed.tsx` drawn proofs.
- Moving the Monte Carlo simulation onto the homepage (explicitly stays inside the BNP Paribas Role story).

## Evidence & Known Limits

`docs/review/2026-11-23-gemini-explorations/prototype-final/` passed **24 headless Chromium verification runs with 0 failures** (`index.html`, `bnp.html`, `threshold.html`, `things.html` × `1440 × 900`, `1024 × 900`, `390 × 844`, `320 × 720` × light & dark):
- Homepage height: `7.97` screens at `1440 × 900` (budget `≤ 9`); `11.96` screens at `390 × 844` (budget `≤ 12`).
- 0 horizontal overflow, 0 console/page errors, 0 broken images, WCAG 2.2 AA contrast on every pair, body `≥ 16 px`, floor `≥ 13 px`, touch targets `≥ 44 px`.
- **Not verified in static prototype (must verify during implementation/T9):** real iPhone / iOS Safari, desktop Safari (WebKit CI covers engines per PR), VoiceOver / screen-reader announcements, Windows forced-colours mode, and live Three.js WebGL pass clipping at the mobile opening rail anchor.
