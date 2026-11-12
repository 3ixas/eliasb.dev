# Passes and panels: the redesign of eliasb.dev

Status: **direction approved by Elias on 11 November 2026**; six decisions are still his (see Open decisions). This is the build spec. The contract it produces is `docs/design/DESIGN.md`; the visual reference is the prototype in `docs/review/2026-11-11-direction-e/` (`index.html`, `bnp.html`, `threshold.html`, `things.html`). How the direction was reached, and the three rounds of concepts it came from, are in `CRAFT-ELEVATION-SPEC.md`, which is now a record and no longer a list of work.

"Passes and panels" is a working name for the direction, after its two parts. It can change without changing anything below.

## Problem Statement

The quiet index is accurate and careful, and it undersells me. Everything is a 44 px row in one 600 px column, so the job I most want to be known for looks the same as a coursework prototype, and the proof for each claim sits behind a hover. On a phone, where hover does not exist, most of it is a tap away that few people make. The page reads as a well-kept list. It does not read as the work of someone who builds pricing engines and ships products of his own.

## Solution

A site built from two things.

- **Staff passes.** The first screen is the opening line and my three employers' passes, drawn as real ID cards on lanyards, each carrying its three strongest points in print.
- **Panels.** After that, each subject gets a panel sized by how much it matters, in its own colour, with its proof drawn on it: a figure, a chart, bars to scale, a screenshot. BNP Paribas gets the largest.

Four rules decide the rest:

1. **Rank by importance, never by duration.** BNP Paribas leads everywhere it appears.
2. **Proof is visible without a click.** Nothing a visitor needs is behind a hover or a tap.
3. **Text earns its place.** No eyebrows, kickers, series letters, figure numbers or helper text. A heading, and a subheading only where it says something the heading does not.
4. **Motion has a job.** It shows a value arriving, a thing settling or a control answering. Reduced motion shows the end state.

## User Stories

1. As a hiring manager with a minute, I want the first screen to say what Elias does and where, so that I know whether to keep reading.
2. As a hiring manager, I want his current role to be the first and largest thing after the opening, so that I weigh it most.
3. As an engineer, I want each claim beside its number and its comparison, so that I can judge it without opening anything.
4. As a visitor on a phone, I want everything a desktop visitor sees, in the same order, so that nothing depends on hover.
5. As a visitor, I want to open a role or a project and find the same design, so that the site reads as one thing.
6. As a visitor who prefers dark, I want every panel that sits on the page surface to follow my theme, so that nothing glares.
7. As a visitor using a keyboard or a screen reader, I want every pass, chart and comparison to have its content as text, so that I get the facts and not a description of a drawing.
8. As a visitor with reduced motion, I want every figure in its finished state on arrival, so that nothing is withheld.
9. As a returning visitor, I want the greeting, the theme control and the live signals I know, so that the site still feels like Elias's.
10. As someone following an old link, I want every route and anchor to still work, so that nothing I saved is broken.
11. As Elias, I want the contract, the glossary and the gates to describe the site as built, so that a later change is checked against the right rules.
12. As Elias, I want the facts on the site unchanged unless I approve a new string, so that a redesign never invents a claim.

## Implementation Decisions

Requirement ids are `R-nn`. Values are from the prototype's `style.css` unless a requirement says otherwise; where the prototype and this file disagree, this file wins.

### Foundations

#### R-01 Tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| page | `#eeede9` | `#0d0d0f` | Page background |
| paper | `#fbfbf9` | `#19191c` | Panels and cards that follow the theme |
| ink | `#141416` | `#f0efeb` | Text |
| muted | `#5f5e5a` | `#a3a29c` | Secondary text |
| hair | ink at 14% | ink at 16% | Hairlines and outlines |
| tint | ink at 5% | ink at 7% | Hover fills |
| cobalt | `#2443d6` | `#8c9eff` | The accent |
| green | `#00965e` | `#3ecf8e` | BNP Paribas's green as a mark on the page |

Employer and project colours stay data on each Role story and project. Panel fields: BNP Paribas `#00965e` with ink `#04140d`; Joveen `#0b0b0c` with `#f4f4f2`; Optegra `#006765` with `#f0fbf9`; Threshold `#c58f5e` with `#1a1714`; Argus Risk `#4f86f7` with `#060a14`; Flowtime `#2a211b` with `#ece4d8`. A coloured panel keeps its field in both themes.

**Acceptance:** every text pair passes WCAG 2.2 AA, measured on the rendered page in both themes, on the page and on every panel field.

#### R-02 Type

Newsreader (variable, optical size on) for headings, figures and reading prose; Instrument Sans for interface text, labels and small text. Both self-hosted through `next/font` with measured fallback faces. Bricolage Grotesque and DM Mono retire. The Résumé sheet keeps JetBrains Mono.

| Use | Size | Notes |
|---|---|---|
| Opening line | `clamp(36px, 3.7vw, 54px)` | Newsreader 400, line height 1.05, −0.028 em |
| Page title (inner pages) | `clamp(52px, 7vw, 104px)` | line height 0.95, −0.04 em |
| Section title | `clamp(36px, 3.6vw, 52px)` | line height 1 |
| Panel title | `clamp(30px, 3vw, 42px)` | |
| Display figure | `clamp(88px, 9.6vw, 140px)` | weight 500, lining tabular figures |
| Lede and prose | 20 px (19 px on phones) | Newsreader, line height 1.5 |
| Body and interface | 15 to 16 px | Instrument Sans |
| Small | 13 to 14.5 px | Instrument Sans |

**Acceptance:** nothing a visitor reads is under 13 px, on the page or printed on a pass, at any width from 320 px. The layout-shift gate (R-36) holds with the real fonts and with them blocked.

#### R-03 Layout and spacing

The page is `max-width: 1344px` with 32 px gutters (16 px under 720 px). Sections are 144 px apart (96 px under 720 px). Panels in one section are 16 px apart. A long-form page's sections are 64 px apart with a hairline between.

#### R-04 The panel

A panel is a block with a 28 px radius (22 px under 720 px), a field and an ink, and a 1 px lighter top edge. Things inside a panel, and cards, take 16 px; images 12 px; pills are fully round. A panel has no shadow in the light theme. In the dark theme a project panel has a soft glow in its own colour (`0 50px 90px -56px`, the field at 70%).

A panel's header is always the name at the left and, where there is one, role and dates at the right. Pass furniture ("Valid · present", "Returned", barcodes) appears only on a pass.

#### R-05 Controls

One set, used everywhere:

- **Solid pill** (on a panel): 44 px tall, the panel's ink as its fill and its field as its text.
- **Outline pill** (on a panel): the same, with a 1 px outline and a 10% fill on hover.
- **Button** (on the page): the same shape with a 1 px ink outline, filling with ink on hover. Copy keeps one width when it says "Copied".
- **Text link**: Newsreader 19 px, the words underlined in hair, the arrow not underlined.
- **Row** (the other projects, the 404's suggestions): the whole row takes the tint on hover.

Arrows move 4 px on hover for a fine pointer. Press is a 0.97 scale over 150 ms. Every control answers in 100 to 250 ms and reverses from where it has reached. The focus ring is 2 px cobalt at 3 px offset; on a coloured panel it takes the panel's ink.

**Acceptance:** each control has the same height, radius, type, hover, press and focus on every route; hover styles apply only to a hovering fine pointer; every target is at least 44 px except links inside running text.

#### R-06 Theme

Light and dark follow the device until the visitor chooses. The existing theme controller, its storage and its crossfade carry over; only the control's place and the tokens change. Everything on the paper surface follows the theme, including Off the clock and Where I'm headed. Staff passes are objects and keep their printed colours, with the card stock a step darker in dark.

#### R-07 Motion

| What | Motion |
|---|---|
| Passes | Swing to rest once on arrival (1.8 s, staggered 80 ms). On hover, lean the other way and catch the light where the pointer is; the hologram turns with it |
| Panels and cards | Rise 16 px and fade in once, when 15% in view |
| Display figures | Count to their value once (1.2 s) |
| Bars | Grow from the left once; the "after" bar 300 ms behind the "before" |
| The simulation | Paths draw (about 1.1 s), the histogram grows, the price line appears last |
| Project screenshots | Lift 10 px on hover |

Reduced motion shows every end state at once with no movement. Nothing loops. Content is complete in the server HTML and never waits for motion.

### The shell

#### R-08 The header

One header on every page: the name (a link to the homepage), the greeting, the five section links, and the theme control, over a 1 px ink rule. It is not sticky. On inner pages the links go to the homepage's sections. Under 720 px the links move behind a Menu button that opens them as a list under the header; Escape or choosing a link closes it.

**Acceptance:** the five link labels and targets are the release check's existing ones; the Menu button reports its state with `aria-expanded`; with script off the links show.

#### R-09 The greeting

The current site's greeting carries over whole: the line by the visitor's own clock ("Hello" before script, then "Kettle’s on.", "Nearly five?" or "Nowhere to be?", "Home yet?", "Still up?"), its small scene, London's time on hover or focus, and its phone behaviour. Its copy and hour boundaries stay in `src/content/stretch/greeting.ts`. Width is reserved for the longest line so no line moves the header. It hides under 400 px.

#### R-10 Say hello

Every page ends with Say hello under a 1 px ink rule: the heading, the email in Newsreader 300 at `clamp(28px, 5vw, 72px)` with a cobalt underline, Copy, then Résumé, GitHub and LinkedIn. The clipboard fallback (select the address when the browser refuses) carries over. No page has any other footer.

### The homepage, in order

#### R-11 The opening

The opening line and its supporting line at the left, the three passes at the right, hanging from the header's rule. The section is `min(100svh − header, 900px)` tall, so nothing of Work shows before a scroll. Under 1260 px the text stacks above the passes, which hang from a hairline; under 900 px the passes scroll sideways with the BNP Paribas pass first.

"BNP Paribas" has a green underline and "products of my own." is cobalt. The opening line stays the page's one `h1`.

**Acceptance:** at 1440 × 900 and 1280 × 720 the Work heading is below the fold on load.

#### R-12 The staff pass

A printed card in CR80 proportion (14.5 : 23) hanging from a two-ply woven lanyard in the employer's colour. A metal clip's two legs cross the strip above the punched slot, enter the slot and end at its lower edge, so the loop passes behind the card.

The card, top to bottom: a header band in the employer's colour with the employer's name; the portrait, with the name, role and dates beside it; three points, each a serif lead over a sans detail; a status and a barcode. The current pass has a colour portrait and a hologram beside "Valid · present". A returned pass has a greyscale portrait and "Returned".

| Pass | Points |
|---|---|
| BNP Paribas | Winner · Digitisation competition, 2025. Take Ownership · Award, Q1 2026. AI workflow · Used by several teams |
| Joveen | −40% · Page load. 520 → 230 ms · Key API p95. +30% · Mobile retention |
| Optegra | 62 → 88% · Core Web Vitals pass rate. −30% · p95 page load. +15% · Consultation conversion |

BNP Paribas's pass is first, 264 px wide and hangs lowest; the others are 248 px. Each pass links to its panel in Work. The gold lanyard pins and the enamel Pass pins retire.

**Acceptance:** every point is one of its Role story's evidence items or stated facts (the existing `passProblems` check extends to all three points); the pass's accessible name carries the same content as its print; every text on a pass is at least 13 px.

#### R-13 Work

The section title "Work" with the subheading "History, then marketing, then code. Each move was towards the work I liked most.", then the BNP Paribas panel full width, then Joveen and Optegra side by side (stacked under 720 px). Employer names are one heading level below "Work".

#### R-14 The BNP Paribas panel

Green, with a soft lift from the top left. In reading order:

1. **The figure:** "Six months", "from zero C# to production code".
2. **The simulation:** illustrative simulated paths from "Today" to "Horizon", a histogram of where they end on the right edge, and a dashed line at their average with a white label, "One price". Caption: "The engines run large simulation-based calculations across several asset classes. Thousands of possible market paths go in; a price and its risk come out."
3. **Two comparisons** under a rule, bars to scale with both sides named: "Integrating a pricer": "An experienced engineer · about two weeks" against "Me, new to it · a couple of days"; "The competition dashboard’s data load": "Before · 30–40 min" against "After · under 5 min".
4. **The link:** "The BNP Paribas story →".

**Acceptance:** the panel has one display figure, one chart and two comparisons; the histogram's bins sum to the number of paths and the price line sits at the mean of the endpoints; the chart says it is illustrative in its accessible description; bar lengths use the Role story's own amounts (10 and 2 working days; 40 and 5 minutes).

#### R-15 Joveen and Optegra

Each panel: header, a display figure with its label (Joveen "−40%", "page load"; Optegra "88%", "Core Web Vitals pass rate, up from 62%"), three before and after pairs as bars with the values at the right, and the link to its story.

- Joveen: Key API p95, 520 ms → 230 ms. Time to deploy, 10 min → under 2. Mobile retention, +30%.
- Optegra: Pass rate, 62% → 88%. p95 page load, −30%. Consultation conversion, +15%.

**Acceptance:** each pair's bars are in proportion to its two values.

#### R-16 Where I'm headed

Its own section: one paper panel with the title and lead at the left and three parts at the right. Each part starts from a chip naming where its evidence comes from (Optegra, BNP Paribas, Threshold) in that source's colour, then its heading and its one line. No destination label and no job title.

#### R-17 Things I make

Threshold as a wide panel (title, line, three figures, screenshot bleeding off the right), Argus Risk and Flowtime side by side, then the other projects as rows newest first (at most ten), then "Everything I’ve built (06) →" with the true count. Each featured panel links to its case study.

#### R-18 How I work

Four upright cards on paper, each in three steps: the habit in Newsreader above a 2 px cobalt rule; the story in muted text with its proof phrase highlighted (a cobalt tint behind the words, never an underline); the proof drawn in a tinted foot: the two projects as coloured dots, "57" with 57 ticks, a switch that is off, "+15%" with its bar. One-line and two-line headings share one rule height. Then "Threshold’s PRD, 16 April 2026 →", to the PRD card on Threshold's case study.

#### R-19 Off the clock

One paper panel: the training week with today marked and today's session; the book; the film; this week in history; then the GitHub year with its total. The live data, its caching and its fallbacks are the existing integrations, unchanged (R-30). The book and the film link out and are marked as external.

#### R-20 Length

The homepage stays within 7.5 screens at 1440 × 900 and 10.5 at 390 × 844 (measured: 7.3 and 10.2). Something new takes the place of something else.

### The other pages

#### R-21 Role stories

The employer as the title; role, dates and setting on one line; the summary as the lede; the story's evidence figures; and that employer's pass hanging at the right (below the text under 1260 px). The back link is "← Work". Sections are the heading at the left (4 of 12 columns) and the text at the right, at most 760 px wide: paragraphs in Newsreader 20 px, points as a serif lead over a muted line with hairlines between. Figures sit in the text column: the flag as two lanes with a switch and the comparisons to scale, each on a panel in the employer's colour, and screenshots and the certificate with a 16 px radius. The page ends with the next role as a panel in that employer's colour, then Say hello. Section numbers and "Summary" as a heading are not used.

#### R-22 Case studies

A panel in the project's colour holding the back link ("← Things I make"), the title, the description, the stack as chips, Live site and Code, the evidence figures and the landing screenshot. Then the same section layout as a Role story, with each section's own heading. The PRD line is a paper card with the cobalt rule on top, the quote in Newsreader and "Threshold’s PRD, 16 April 2026" beneath. The page ends with the next project as a panel in its colour.

#### R-23 The Work archive

`/things-i-make`: the title and its note, then every project as a panel, three across (two under 1260 px, one under 720 px). The three with case studies take their colours; the others are on paper and link out. Filters appear once there are more than ten projects, as outline pills.

#### R-24 The Résumé

The sheet, its print styles and `public/Elias-Bennett-Resume.pdf` are untouched, so `verify:resume` stays valid. The page around it takes the new header, page colour and Say hello; Download PDF is the Button (R-05).

#### R-25 The 404

The title "This page doesn’t exist." and its line; the address asked for, struck through, with "Not on file" and "404"; then "Try one of these" and the five homepage sections as rows (R-05), with the copy deck's lines.

#### R-26 Share cards

One template still: the page's own words at the top and "ELIAS BENNETT" at the foot on 1200 × 630, in Newsreader. The homepage's card is the opening line on the page colour; a Role story's and a case study's take their employer's or project's field and ink.

### What carries over unchanged

#### R-27 Content

Every fact, figure and sentence comes from the approved copy (`docs/content/redesign-copy.md`, `src/content/`). A redesign ticket does not add a claim. New or changed strings need Elias's approval and are listed under Open decisions.

#### R-28 Routes and anchors

Every route, redirect and anchor stays: `/`, `/work/[slug]`, `/things-i-make`, `/things-i-make/[slug]`, `/resume`, the 404, the redirects from `/about`, `/library` and `/lab`, and `#work`, `#things-i-make`, `#how-i-work`, `#off-the-clock`, `#say-hello`. `verify:routes` and `verify:release` keep passing.

#### R-29 Accessibility

The standing checks hold: one `h1` per page, the skip link, content complete in the server HTML and without script, axe, AA contrast, 3:1 focus rings, external links marked and opening in a new tab, no sideways scroll from 320 to 1440 px, and 200% zoom. Every drawn figure has its values as text. Forced colours keep the bars (text colour for before, highlight for after), the GitHub year's five levels and the passes as drawn. Colour never carries meaning alone.

#### R-30 Integrations

Training, Goodreads, Letterboxd, this week in history and GitHub keep their data contracts, caching and fallbacks (`docs/runbooks/integration-fallbacks.md`, `verify:signals`). Only their presentation changes.

#### R-31 From the craft audit

These findings from Part 1 of the record apply to the new design as written there: F-03 (a page that fits does not scroll), F-04 (every screenshot frame has an edge), H-02 (the GitHub year reads as a finished chart), P-01 (on a phone the large view of a screenshot is larger), P-02 (every long page ends with the next page and a way to reply) and P-03 (Download PDF sits on the sheet's edge). A screenshot on a long-form page still opens large in a dialog. The rest of Part 1 described the quiet index and retires with it.

### What retires

#### R-32 Retired

- The row, the 44 px objects and the mini pass.
- Closer looks, the margin, the inline fold and the dotted reveal words. What they held is now on the page (the simulation, the comparisons) or on the inner page (the certificate, the screenshots).
- The header portrait and its closer look; the portrait is on the passes.
- The pen, the calendar tiles, the shelf, the ticket and the clipping.
- Enamel Pass pins and their glyphs.
- The phone carousel of featured projects.
- The two-width rule and the four-screen length budget.
- Bricolage Grotesque, DM Mono and the Fine cut.

Each retirement removes its code, tokens, specs and visual baselines in the ticket that replaces it, and is added to `verify:retired`.

### Carried over from the lens passes

The lens map ([#385](https://github.com/3ixas/eliasb.dev/issues/385)) and its open tickets were written to finish the quiet index. Lenses 1 to 7 are merged. What lenses 8 to 14 asked for still matters and moves here as requirements on the new build, checked once on the finished design instead of as separate passes on the old one.

| Lens | Ticket | Becomes |
|---|---|---|
| 8 Components and coherence | [#393](https://github.com/3ixas/eliasb.dev/issues/393) | R-05, and R-33 |
| 9 Interaction | [#394](https://github.com/3ixas/eliasb.dev/issues/394) | R-05 and R-07, and R-33 |
| 10 States | [#395](https://github.com/3ixas/eliasb.dev/issues/395) | R-34 |
| 11 Resilience | [#396](https://github.com/3ixas/eliasb.dev/issues/396) | R-35 |
| 12 Phone | [#397](https://github.com/3ixas/eliasb.dev/issues/397) | R-37 |
| 13 Technical smoothness | [#398](https://github.com/3ixas/eliasb.dev/issues/398) | R-36 |
| 14 Copy gate | [#399](https://github.com/3ixas/eliasb.dev/issues/399) | R-38 |

The map's rules that still hold: copy changes are Elias's pick of exact before and after strings; no new claims; positive framing; the Résumé sheet is untouched; diagnosis runs on previews, with no unbounded local build; merging to `main` deploys, so his approval of a pull request is his approval to ship it. The lens-by-lens chain, the removal rule and the craft bar's quiet-index values do not carry over.

[#407](https://github.com/3ixas/eliasb.dev/pull/407) (lens 8: Download PDF answers like Copy; Copy keeps one width) is correct for the new design too and is covered by R-05. It can merge as it is or be closed in favour of the redesign's control ticket.

#### R-33 The component checkpoint

Each shared part (panel, pass, pill, button, text link, row, card, chip, bar pair, the header, Say hello) is checked on every route where it appears, in both themes, at 390 and 1440 px, for its variants, hover, press, focus, keyboard use, dismissal and repeated input. One icon family. A difference between two uses is fixed in the shared part.

#### R-34 States

Every reachable state is complete: each integration's fallback, slow and fast loading with no flash of an indicator, the 404, and the clipboard refusal. An empty or failed state says what happened and offers a next step. Off the clock's panel keeps its shape when a feed is down.

#### R-35 Resilience

Each rendered value is mapped to its real limit. One worst-case dataset, plus empty, one and huge, goes through the same boundary as real data behind a development-only toggle that never ships, and is kept as a regression fixture. Checked at 320 px, the widest layout, 200% zoom and in dark. Named risks in this design: a long book or film title in Off the clock's four columns; a long employer or project name on a pass band and in a panel header; a display figure longer than "−40%"; a project with no screenshot; more than three evidence figures.

#### R-36 Technical smoothness

Layout shift stays at most 0.01 over a first visit, scrolled to the bottom and back, on the homepage, BNP Paribas and Threshold at 390 and 1440 px. A route's gzipped scripts stay within 10% of `scripts/js-budget.json`, re-baselined once when the redesign lands and reported in that pull request. The opening's passes and the simulation do not delay first paint: the simulation is drawn when it comes into view.

#### R-37 Phone

Verified on a real iPhone, or in the iOS Simulator recorded as a limit: hover does not stick, taps answer on press, `svh` heights and safe areas behave, the pass rail scrolls without trapping the page, the Menu opens and closes, and Safari's top and bottom edges match the page in both themes, mid-scroll, in landscape and after back navigation.

#### R-38 The copy gate

`verify:copy` stays in the required job with the word list settled from lenses 3 and 4, and is shown failing once on a deliberate break. `DESIGN.md`'s anti-goals name the visual tells found in lenses 1 and 2 and in this exploration (see `DESIGN.md`, "What this design avoids").

### Contract and gates

#### R-39 The contract

`docs/design/DESIGN.md` describes this design; the quiet index's contract is `docs/design/history/QUIET-INDEX.md`. Until the redesign's tickets land, `main` still runs the quiet index, and `DESIGN.md` says so at the top. `GLOSSARY.md` gains Panel, and its Staff pass, Pass pins, Row, Closer look, Margin and Craft bar entries are rewritten or marked retired in the first build ticket.

#### R-40 Gates

`verify:type-scale`, `verify:craft`, `verify:retired` and the e2e specs that name quiet-index parts are rewritten against this file in the ticket that replaces each part; none is deleted without a successor that checks the new part. Visual baselines are regenerated per ticket, and each pull request says which changed. Motion specs pause and seek and never wait out a transition. A spec that reads hydrated, animated or lazily laid-out state uses `expect.poll` or a web-first assertion.

### Sequence

Each step is a vertical slice that leaves `main` shippable. The first decision the tickets must settle is whether the redesign ships route by route behind the current design or lands on a long-lived branch; this spec assumes route by route, newest shell first.

1. **Foundations:** tokens, fonts, the panel, the controls, the header with greeting, theme and Menu, Say hello (R-01 to R-10), on every route, with the old sections restyled only as far as needed to stay legible.
2. **The opening and the passes** (R-11, R-12).
3. **Work** (R-13 to R-15), then **Where I'm headed** (R-16).
4. **Things I make** (R-17) and **the archive** (R-23).
5. **How I work** (R-18) and **Off the clock** (R-19).
6. **Role stories** (R-21), then **case studies** (R-22).
7. **The Résumé page, the 404 and share cards** (R-24 to R-26).
8. **Retirements and gates** left over (R-32, R-40), the glossary (R-39).
9. **The finishing checks** (R-33 to R-38) on the whole site, then sign-off.

Steps 3 to 5 can run in any order after 2; 6 and 7 need only 1.

## Testing Decisions

- Test what a visitor gets: the text of each pass, panel and comparison; link targets; heading order; contrast; no overflow; the theme; reduced motion's end states. Do not test class names or pixel positions beyond the token values.
- The seams are the existing ones: content modules (`src/content/`) with their own problem checks (`passProblems` and its peers), the verify scripts, and Playwright against the dev server with one worker, relevant specs only.
- Bars and the simulation are tested on their numbers: widths in proportion to the content's amounts, bins summing to the path count, the price line at the mean.
- Prior art: `e2e/standing-checks.spec.ts`, `e2e/stretch-tokens.spec.ts` (contrast on the rendered page), `e2e/layout-shift.spec.ts`, `e2e/forced-colors.spec.ts`.
- The full Playwright suite and a full `pnpm build` run in CI, not locally (`docs/runbooks/local-testing.md`).

## Out of Scope

- New content, sections, integrations or claims.
- The Résumé sheet and its PDF.
- Analytics, a CMS, or a change of framework or host.
- The earlier concepts (C1 to C3, D1 to D3); they stay in the record as explored and not taken.

## Further Notes

### Open decisions for Elias

1. **Your portrait on the passes** (R-12). The prototype uses `public/profile/elias.webp`. It is the main reason the passes read as real.
2. **"Where I'm headed"'s lead** (R-16). The prototype reads "I’m working towards turning new ideas into software people use every day. Three things that takes, and how far I’ve got on each." The approved copy names "a product engineer"; you said that is not the aim. Confirm this line or give your own.
3. **The simulation's second caption sentence** (R-14): "Thousands of possible market paths go in; a price and its risk come out." Confirm it is accurate for the engines.
4. **The BNP Paribas pass's points** (R-12): "Take Ownership · Award, Q1 2026" and "AI workflow · Used by several teams", in place of "AI Champion".
5. **This week in history and Now making** (R-19). The prototype shows history as one cell and has no Now making. Recommended: history keeps its three oddities, stepping in place on a click with "1 of 3"; Now making becomes one line beside the GitHub total ("Now making" and the repository, linking to it).
6. **The lens 8 pull request**, [#407](https://github.com/3ixas/eliasb.dev/pull/407): merge it now or close it.

### Evidence and its limits

The prototype is static HTML, CSS and script on real content, checked in headless Chromium: no sideways overflow and no script errors on its four pages at 1024, 768, 390 and 320 px, and on the homepage at 1440 and 1280 px; no text under 13 px; light and dark captured for the opening and Off the clock. Not checked: a real iPhone or Safari, motion at real speed, keyboard and screen reader, forced colours, dark below the first screen on inner pages. Not built: the Joveen and Optegra stories, the Argus Risk and Flowtime case studies, the Résumé page, the 404, share cards, and the greeting's scene (the prototype shows its words only). Those follow the templates above.
