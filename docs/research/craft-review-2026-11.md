# Where does the live site fall short of the precision bar?

Craft review of https://www.eliasb.dev for the ticket of that name on [Map: an expensive, crafted finish](https://github.com/3ixas/eliasb.dev/issues/358). Reviewed 3 November 2026 against `main` at `2ceca91`, in Chromium 152 inside the desktop app's browser pane, at 1440 × 900 and 390 × 844. Source read from the same commit. `docs/design/DESIGN.md` is the reference: a contract decision is only ever marked as a taste question here.

## Short answer

The design holds up. Geometry, the row grid, closer-look placement, overflow and the type floor on desktop are tighter than most portfolios ever get. Where it falls short is what the judge will do first: **interrupt things on a phone**. Inline closer looks jump when reversed, the margin wobbles after one glide, and reactions vanish when the pointer leaves. Second, **things appear blank before they appear**: portrait, objects, expanded screenshots. Third, **phone text wrapping is unfinished**: separators hang at line ends, dates break in half, and two closer looks scale below the 13 px floor.

That gives **20 plain defects** and **16 matters of taste**.

## Top three priorities

1. **Make every animation safe to interrupt.** Reversing an inline look jumps by 70 px (P1). One glide leaves the margin lagging its row by a 500 ms spring (P2). Then decide the rule for what happens when the pointer leaves mid-reaction (T1, T2). This is the bar's literal test, and most of it is a small change at one shared owner, `closer-look-root.tsx` and `quiet-index.css`.
2. **Nothing visible is ever blank.** Portrait and first-screen objects are `loading="lazy"` (P3, P4), and an expanded screenshot opens as an empty card (P5). Eager-load what is on the first screen and preload on intent. T9 then decides how an image arrives.
3. **Finish phone typography.** Dangling separators (P8), broken dates (P9), widows (P10), the floor (P7) and the 6 px disagreement between the header's edge and the text's (P11). These are all visible on the first scroll at 390 px, and none needs a decision.

## Method and how to read the evidence

Each route was loaded and measured with element geometry, computed styles, `PerformanceObserver` for layout shift and the Web Animations API. Hover used a real pointer where it mattered, and programmatic events where sweeping all 23 closer looks. Each finding is one of:

- **Observed**: measured or seen on the live site.
- **Code**: read in the source on the same commit and consistent with what was seen, but not caught in the act.
- **Hypothesis**: plausible and needs the named check.

**The pane was hidden and shared with other sessions for most of the review**, so `requestAnimationFrame` ran at about 2 frames a second (measured: 2 to 4 in 2 s). That has two consequences:

- Smoothness could not be judged at all. Interruption was measured by pausing and seeking animations through the Web Animations API, which gives exact geometry at a chosen time but not how it feels.
- Lazy images started far later here than on a foreground phone. **The blank-state screenshots prove that the state exists and has no placeholder, not how long it lasts.**

## Plain defects (fix without a decision)

Sorted by how soon the judge meets them. Owner is `ui-polish` unless marked `motion`.

### Interruption

**P1. An inline closer look jumps when reversed.** Every route with inline looks · open and close, interrupted · phone (below 1180 px, or no hover) · both themes. *Observed.*
- Evidence, Joveen row at 390 px: opening is 423 px tall at 100 ms. Tapping again starts `qi-close` from the full 492.7 px, a 70 px jump outward before it folds. Reopening during a fold at 100 ms (69.9 px) restarts `qi-open` at 0 px, a 70 px jump the other way.
- Cause: `qi-open` and `qi-close` are keyframes with an implicit start, so neither knows where the other stopped.
- Correction: drive `grid-template-rows` with a transition on the open state, as `.qi-greeting__more` already does, so a reversal starts from the current height. Owner `motion`.
- Check: tap twice within 100 ms and record that height never increases on close.

**P2. After one glide, the margin lags its row while scrolling.** Homepage, every look · hover, row to row, then scroll · 1180 px and up · both themes. *Observed.*
- Evidence: a first look tracks scroll exactly (0 running transitions). After moving to a second row, `data-glide` stays set, so a 60 px scroll starts a 500 ms `top` transition on `--spring`: computed `top` 528 px against a target of 468 px, with overshoot to come.
- Correction: clear `data-glide` when the glide ends or on the first scroll, in `closer-look-root.tsx`. Owner `motion`.
- Check: hover two rows, wheel-scroll, and `getAnimations()` on the margin stays empty.

### Blank before it appears

**P3. The header portrait is lazy on every page.** All ten routes (the sitemap's nine and the 404) · first load · both viewports and themes. *Observed.* Known defect, confirmed.
- Evidence: `loading="lazy"` in the server HTML of all routes, with no `fetchPriority`. `naturalWidth` 0 with the circle empty ([screenshot](craft-review-2026-11/portrait-blank-desktop.jpg)). It was requested 3,620 ms after navigation in the throttled pane, in the same batch as images far down the page, and took 73 ms once asked for. The transparent background gives a hollow ring while waiting.
- Correction: `preload` on `portraitImage` in `site-header.tsx`, plus a resting fill behind it.
- Check: the image's fetch starts with the document, and a throttled reload never shows the empty ring.

**P4. First-screen objects are lazy on the Work archive.** `/things-i-make` · first load · desktop · light. *Observed.* Project crops showed as plain tiles with no detail, seconds after navigation in the throttled pane ([screenshot](craft-review-2026-11/archive-objects-blank.jpg)). The object is the row's character, so this is the page's first impression. The 404's Threshold object is lazy in the same way, though it had loaded when I captured it. Correction: eager-load crops for the rows on the first screen, in `project-object.tsx`. On the homepage the first-screen objects are CSS, so it is unaffected until Things I make.

**P5. An expanded screenshot opens as an empty card.** Threshold, every screenshot figure on case studies and Role stories · first tap or click · both viewports. *Observed.*
- Evidence: the large image is `loading="lazy"` inside the dialog. On opening, `complete` is false 30 ms in, and its request only then begins (255 ms for 77 KB on a fast connection, longer than the 200 ms fade). The Close button sits on a grey card until it arrives.
- Correction: preload on pointer enter, focus or touch start, and `decode()` before `showModal()`, in `zoomable-image.tsx`. Remove the `lazy`. Owner `performance` if it needs measuring.

**P6. Optegra's figures are declared narrower than they render.** `/work/optegra`, and any `ScreensFigure` without a phone image · retina · desktop. *Observed.* `sizes` says 430 px and the image renders at 598 px, so a 2× display gets the 1080 w file where it needs 1196: 1.8×, about 10% soft. Every other image measured was 2.1× or better. Correction: compute `sizes` from whether the row has a phone image (`role-story-figures.tsx:82`). The source is 1440 wide, so the pipeline is fine.

### Phone type

**P7. Two closer looks fall below the 13 px floor.** Homepage · portrait and project looks open · 390 px · both themes. *Observed.* `.qi-look` is 316 px wide and scaled with `zoom` to fit its slot: portrait 0.943 (13 px becomes 12.3 px), projects 0.968 (12.6 px). Pass, training, book, film and clipping stay at zoom 1. This breaks "One floor … closer looks included". Correction: let these two looks fill their slot rather than scaling, keeping `zoom` as the 320 px safety net only.

**P8. Separators hang at line ends.** Homepage Off the clock (GitHub total, book, film, history) · 390 px · dark captured. `/work/bnp-paribas` metadata in its 276 px column · 1440 px · light. *Observed.* "1,839 contributions in the past year ·" with the source on the next line ([screenshot](craft-review-2026-11/phone-dangling-separators.jpg)); "Risk division · London ·" then "Jul 2025 – now" at 1440. Correction: put the separator inside the following unit, or hide it where the unit wraps. No copy changes.

**P9. Dates break in half.** Homepage Work, and each Next role row · 390 px · both themes. *Observed.* "Aug 2024 / – Jun 2025" and "Sep 2021 – Aug / 2024" ([screenshot](craft-review-2026-11/phone-dates-broken.jpg)). These rows grow from 68 to 86 px. Correction: no line break inside a date range, so the line breaks at the `·`.

**P10. Single words sit alone on last lines.** All long-form pages and rows · 390 px mostly · both themes. *Observed.* Only the opening line has a `text-wrap` value. Last lines of 34 to 50 px across eleven measured elements: "cost." on Threshold's row; two paragraphs on the BNP Paribas Role story; two on Argus Risk; one on Flowtime; three on Joveen; two 404 rows. Also one at desktop on the Role story (64 px of 600). Correction: `text-wrap: pretty` on prose and row lines, which is progressive enhancement where unsupported.

**P11. The header and the text disagree about the left edge.** Every page · 390 px, and 2 px at desktop · both themes. *Observed.* At 390 px the header's column is 20 px in and the page's text 16 px, and the 40 px circle sits centred in its 44 px button: portrait at 22 px, heading at 16 px, a 6 px step. At 1440 px: 414.5 against 412.5. On the Résumé the contract says the portrait starts at the paper's left edge: 317.6 against 315.6. Correction: one gutter for both (the contract's column is 40 px of gutter in total, but the text uses 32), and −2 px on the button. Choosing which gutter is a one-line call: keep 16 px, because every row and card is built on it.

**P12. The greeting's tap target is 28 px tall.** Every page · 390 px. *Observed.* 155 × 28 against "Touch targets are at least 44 px". Correction: extend with padding or a pseudo-element, which has room under the name.

### Alignment and consistency

**P13. Years jump 3.13 px between rows, and the cause is not the digits.** Homepage and Work archive, Things I make · at rest · hover-capable widths · both themes. *Observed.* Known defect, confirmed with a corrected cause.
- Evidence: year left edge 956.25 against 959.38 on the homepage, 963.75 against 966.88 on the archive. The break falls exactly where `→` becomes `↗`, not where 2026 becomes 2025 (2026 appears on both sides). The invisible arrow keeps its width in the flex row: 15.05 px against 11.91 px.
- `font-variant-numeric` is `normal` as reported, but JetBrains Mono's digits are all 7.8 px wide, so **`tabular-nums` would change nothing**.
- Correction: give `.qi-row__arrow` a fixed-width box. Its inherited 16 px is also off the five-step scale; set it from a token. Adding `tabular-nums` is harmless but not the fix.

**P14. Pass pins sit 5 px inside the text edge.** All Role stories · both viewports. *Observed.* `.qi-pins` has `padding-left: 5px`, so the pin is at 417.5 under a title at 412.5. Nothing in the contract asks for it. Correction: remove it, and keep any room the pop needs by overflow. If it was optical for the gilt rim, 1 px is the most that reads as alignment.

**P15. External links that open in the same tab.** `/work/joveen` ("joveen.com ↗"), `/work/optegra` (both Wayback captions) · all. *Observed.* 3 of 19 external links across the eight pages that have them lack `target="_blank"`, against the contract's "external links marked ↗ that open in a new tab". Correction: `target`, `rel`, and the hidden "opens … in a new tab" text the Row already has.

**P16. The page moves when a dialog opens.** Case studies and Role stories · screenshot opened · desktop with classic scrollbars · both themes. *Observed.* `body { overflow: hidden }` removes the scrollbar: client width 1425 to 1440, column 412.5 to 420, a 7.5 px jump behind the backdrop. Overlay scrollbars (macOS default, phones) don't show it. This was left unverified in the Rauno thread review and is now confirmed. Correction: `scrollbar-gutter: stable` on `html`.

**P17. Following a row moves the page, with classic scrollbars.** `/things-i-make` (900 px tall, so no scrollbar at 1440 × 900) against the homepage · desktop. *Observed.* Column 420 against 412.5, breaking "following a row never moves it". Same correction as P16, and it should be one line.

### Colour and depth

**P18. A theme change doesn't crossfade everything.** Homepage especially · Eclipse pressed · both viewports and directions. *Observed.* The page takes 300 ms, but GitHub cells (`--gh-*`) and calendar tiles (`light-dark()`, 9 rules) reach their final colour immediately, along with `--sun`. Read straight after the press: page still `rgb(251 251 248)`, tile already `rgb(38 38 47)`, cell already `rgb(31 36 44)`. Correction: register `--gh-*` and `--sun` with the palette in `theme.ts`, and move the `light-dark()` surfaces onto registered tokens. Owner `motion`. The page's own crossfade reverses cleanly mid-way; see What held up.

**P19. The "before" bars are nearly invisible.** Role stories' to-scale figures · both themes. *Observed.* The bar is `--stretch-rule`, a token the contract reserves for hairlines, on the card: 1.25:1 in dark, 1.20:1 in light ([screenshot](craft-review-2026-11/scale-bars-dark.jpg)). The long bar is the comparison's whole argument and the cobalt one is about 7:1. Correction: a muted mix at 3:1 or more, which is also the WCAG level for graphics that carry meaning.

**P20. No touch icon.** Site-wide. *Observed.* `/apple-touch-icon.png` and `/favicon.ico` are 404, and only `icon.svg` is declared, so an iPhone's "Add to Home Screen" uses a page thumbnail instead of the mark. Correction: export the existing tile at 180 px, in the light theme's colours.

## Matters of taste (feeds the craft bar)

Each is a question for the bar, with a recommendation. Those marked **contract** mean `DESIGN.md` decided the current behaviour, so changing it is a decision and not a defect.

| # | Where and state | What is there now | Question and recommendation |
|---|---|---|---|
| T1 | Rows (mini pass, calendar tile), "products of my own.", BNP Paribas, on leave mid-reaction, desktop. *Code* | Hover reactions are `:hover`-scoped keyframes, so leaving removes them and the object snaps to rest. Project crops use a transition and ease back correctly | What must a reaction do when interrupted? **Finish, once started.** Start from `pointerenter` with Web Animations, as the pass's lean does |
| T2 | Margin, on leave, desktop. *Code, and contract* | 140 ms, then the look unmounts in one frame, even mid-drop. Inline looks fold; the margin has no exit | Should the margin leave as it arrives? **Add a fade of about 120 ms**, without movement |
| T3 | Margin, row to row, desktop. *Observed* | Each row replays its full arrival (fade, 1 s drop, pins popping at 0.45 to 0.65 s) while the box glides 0.5 s on a spring that overshoots, moving `top` and `left` | Is sweeping down a list a series of arrivals? **Arrival motion only on the first look; after that, a quick crossfade and the glide on `transform`.** This is the most consequential motion decision here |
| T4 | Inline fold, phone. *Observed* | `--out` over 0.3 s on height: 60% at 50 ms, 86% at 100 ms, 100% at 300 ms. On a 493 px pass it reads as a snap with a long tail. Closing uses the same curve rather than mirroring it (contract says "folds back the way it opened") | Curves should be chosen by distance. **A softer ease for size changes**, tried in slow motion on a real phone |
| T5 | Inline look near the bottom of the screen, phone. *Observed, and contract* | The row holds still, so a look from a low row opens below the fold and its arrival plays unseen. Pass 493 px, clipping 673 px, against 763 px of room under the header | **Allow a gentle scroll, only when most of the look would be off screen.** The hold rule was written for closing, and this is about opening |
| T6 | Header, all pages. *Observed, and contract* | Sticky, solid. 81 px on phones (9.6% of the screen), 109 px on long-form desktop (12%). A greeting tap grows it to 96.6 px and moves the page 15.6 px | Does a quiet page need this much fixed furniture? **Leave desktop; on phones, drop the greeting from the sticky state or let the header scroll away.** London's time could overlay rather than push |
| T7 | Header between page types, desktop. *Observed, and contract* | Eclipse at x 1318.5 (home), 1326 (archive), 978.5 (long-form). The contract says following a row never moves the header, and also sets two widths | Which wins? **On pages with no links, use the column's width** so the Eclipse isn't stranded 300 px from the text. Home-to-story movement stays, and is worth recording as an accepted exception |
| T8 | Reveal words, opening line, all sizes. *Observed* | The dotted underline at 1.5 px is broken by skip-ink at descenders, so "pricing" reads as fragments at 50 px. On phones the words are 20.5 px tall against the 44 px rule | **`text-decoration-skip-ink: none`, and a heavier dot on the `h1`,** in the type prototype. The bar should record that inline words are exempt from 44 px, as WCAG's inline exception does, since the contract has no such line |
| T9 | Every lazily loaded image and figure. *Observed* | A grey card, then the image in one frame ([screenshot](craft-review-2026-11/optegra-figure-blank.jpg)) | How does an image arrive? **Decode, then a 150 ms fade over the Project colour.** Contract: "photographs stay as they are", which this respects |
| T10 | Row fill, desktop. *Observed* | The hover fill is instant both ways (0 s), while the arrow beside it takes 0.2 s | **Instant in, about 120 ms out**, so a pointer's trail reads as motion and not flicker |
| T11 | Focus rings, all pages. *Code* | Four treatments: 2 px inset (rows), 3 px with 3 px offset (global), 2 px flush (object button), 2 px white (dialog close) | **One ring, one offset, one exception for the inset row.** The bar should fix these numbers |
| T12 | Spacing, all pages. *Observed* | Layout says sections are 80 px apart on desktop and 64 on phones. `.stretch-section` is 64 px at every width (last row ends at 1012, next title at 1076). Long-form sections and Where I'm headed are 56 px | Which is right, the file or the page? **Try 80 on desktop as written**: it adds about 80 px in total, staying near 3.9 screens against the budget of 4, and more room suits the brief. Then name 56 as a long-form step, so the bar has a short spacing scale |
| T13 | JetBrains Mono metadata, all pages. *Observed* | No tracking; zero has an inner mark, so "2026" is busy at 13 px and read as "2826" in a downscaled capture. The greeting's mono line competes with the name | For the type prototype already planned: **try a plain zero and +0.01 em.** Bricolage's `opsz` is on auto and font smoothing is unset (T14) |
| T14 | All text, macOS. *Hypothesis* | `-webkit-font-smoothing` is unset, so macOS renders dark-theme text heavier than light | **Test `antialiased` in dark only**, in the same prototype, by eye on a real laptop. No effect on iPhone |
| T15 | Staff pass photo, full size. *Observed* | The "small hologram" is a pale disc about 20 px wide over the shoulder, and reads as a smudge rather than foil | **Smaller, or a conic sheen that reads as foil.** This is material richness, which the map allows on objects |
| T16 | Identity across surfaces. *Observed* | Résumé has `twitter:card=summary` and no image. Case studies share a raw `.webp` screenshot where Role stories have a designed card. `E` favicon, as the Rauno thread review noted | The map lists this as not yet specified. **One card template for every page**, tested in a real share preview |

## What held up

Worth protecting with CI, since each is measurable:

- **Overflow:** no sideways scroll on any route at 390 or 1440 (document width equals the viewport).
- **Length budget:** 3.83 screens at 1440 × 900 and 4.81 at 390 × 844, matching the contract.
- **Layout shift:** 0 on the homepage and BNP Paribas Role story, confirming the baseline. See below for one Threshold reading.
- **Row grid:** 68 px minimum, 2 px apart, every row's text at exactly 472.5 px down the whole homepage. The contract's central alignment claim is true.
- **Margin placement:** all 23 looks on the homepage at x 1052.5 and 300 px wide, exactly 6 px above their row where they fit, and 15.6 to 16.5 px from the bottom where they don't.
- **Scroll hold:** 0 px drift on every phone trigger that opened a look. The tapped row genuinely stays put.
- **Theme crossfade:** pressing the Eclipse mid-way reverses from the current colour with no jump; `theme-color` follows the page.
- **Pass lean:** reads the current `rotate` before pushing, so it is interruptible. It is the model for T1.
- **Foundations:** no `transition: all`. Tap highlights off and `touch-action: manipulation` on tap targets. Hover gated in 22 of 30 rules, with the other 8 all in the greeting. Selection is themed. Fallback font metrics are tuned.
- **Sharpness:** every look and figure measured at 2.1× or better apart from P6.
- **Type floor on desktop:** every closer look at 13 px or more.
- **Résumé's surroundings:** header aligned to the paper, with the Eclipse's icon optically flush at 1109.3.

## What could not be verified

- **A real iPhone.** All phone results are Chromium with an Android user agent at 2× pixel density, not WebKit at 3×. Unproven on an iPhone: `zoom` and `:has()` behaviour, animating `grid-template-rows`, safe areas, rubber-band overscroll, toolbar tint, tap timing, and sticky `:hover`. The greeting's `:hover` rules are the only ungated ones, so **a tap may leave its scene running** (hypothesis; check on a device).
- **How anything feels.** At about 2 frames a second, I did not watch the underline, greeting scenes, count-up, typing, cores, pen, ticket tear or book pull in motion. Their durations and rules were read; their smoothness is untested. Slow-motion recordings on real devices remain necessary.
- **Keyboard.** Real Tab presses did not reach the page in the pane, so T11 comes from the stylesheet. Focus-shows-look was exercised only by code path.
- **Reduced motion.** The pane has no emulation for it. Read from CSS only.
- **The Copy button's success state.** The clipboard refused in the pane and the button stayed "Copy", as the code says it will on refusal. So "Copied" is unobserved, and a refusal gives no feedback at all, which the bar may want to reconsider.
- **Tapping a GitHub day on a phone.** The readout stayed blank in one programmatic tap, but the state may not have rendered in time. Inconclusive. The cells are 10.3 px, with one tab stop.
- **Cold loads.** One layout shift of 0.0051 on Threshold at 778 ms, on the first load at desktop (source `stretch-wrap qi-long`), did not recur on reload. A 0.0005 on the 404 at 390 px. Both need a fresh profile and network throttling, which also covers font swap.
- **Coverage is uneven.** The homepage, BNP Paribas and Threshold were deepest, but not every state in every theme:
  - Desktop closer looks were swept in light. Dark was sampled at phone size and on the first screen.
  - Argus Risk, Flowtime, Joveen and Optegra had automated checks at 390 px in dark, and Optegra and the archive a look at desktop in light.
  - So "how light and depth hold up in dark" stays open on the map.
- **1× displays, print and real share previews.** Not checked. On a 1× screen with a classic scrollbar the column sits on a half pixel (412.5), which may soften text.

This ran directly in one session rather than through a separate research worker, because it was already delegated.
