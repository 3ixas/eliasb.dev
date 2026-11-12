# Craft elevation: the quiet index, finished to the pixel

> **Record, not a work list.** This file is the exploration behind the passes and panels direction: the craft audit of the quiet index (Part 1), three concepts (Part 2), three more (Part 3) and direction E in three passes. The build spec is `PASSES-AND-PANELS-SPEC.md` and the contract is `docs/design/DESIGN.md`. Part 1's findings that still apply are listed there as R-31; the rest described the quiet index. The earlier rounds' prototypes and captures (`docs/review/2026-11-09-*`, `2026-11-10-*`, `2026-11-11-creative-directions-round-2/`) are not committed; direction E's prototype is.

Status: **draft, not yet published to the tracker.** Written 9 November 2026 from an audit of production (`www.eliasb.dev`, commit `e25f630`). Terms follow `GLOSSARY.md`; the design contract is `docs/design/DESIGN.md`. Evidence captures are in `docs/review/2026-11-09-design-audit-evidence/`.

Requirement identifiers (`F-01`, `H-02`, …) are stable. Tickets should cite them.

**Three parts.** Part 1 (below) finishes the current design. [Part 2](#part-2-three-proposed-directions), added 10 November 2026, proposes three alternative directions with prototypes; none is approved, and Part 1 stands until one is. [Part 3](#part-3-round-two-after-eliass-review-of-part-2), added 11 November 2026, records Elias's review of those and proposes three further directions.

## Problem Statement

The quiet index is a decided design, and it holds up. Seven lens passes ([#385](https://github.com/3ixas/eliasb.dev/issues/385), lenses 1 to 7) confirmed its type scale, section rhythm, text contrast, colour roles and copy, and nothing in this audit contradicts them. A visitor who looks closely still meets a small number of places where the finish drops below the standard the rest of the site sets. Those places share three causes.

1. **The states the earlier passes did not cover.** Lenses 1 to 7 captured pages at rest at 390 and 1440 px. Closer looks, intermediate widths (900 to 1179 px), 320 px, and the large view on phones were listed as "not covered" each time. Most findings here are in those states.
2. **Geometry that is right at one size and wrong at another.** An underline that is stretched to its box, an arrow that is scaled with its row, a header that is 940 px wide before the margin exists, a fold that clips a shadow it was never tested against.
3. **A first screen that gives its loudest element the least room.** The opening line sits 20 px under the header's rule, while every section after it gets 80 px.

### Current-state assessment

**What is strong and must be preserved.** The removal rule and the row as the only repeating shape. The two widths (600 px column, 300 px margin). One text edge down the page. The Fine cut of Bricolage Grotesque and the five-step text scale. Objects drawn in their real material at 44 px, with depth only on objects. Closer looks that arrive the way the real thing would. Cobalt pointing at a short named list of things. A page that is complete in its first frame (measured here: layout shift 0.00 on the homepage, BNP Paribas and Threshold; largest contentful paint 0.5 s on the homepage on a desktop connection). The keyboard order is logical, every stop shows the 2 px cobalt ring, Escape dismisses the margin, and the Copy button's "Copied" state works.

**What falls short.** Each line is a measured observation; the requirement that fixes it is named.

| # | Observation (route, viewport, state) | Requirement |
|---|---|---|
| 1 | The homepage `h1` starts 20 px under the header; the Work archive's and the 404's start 28 px under it; the Résumé's button 24 px; sections are 80 px apart. | F-01 |
| 2 | At 900 to 1179 px the homepage, Work archive and 404 header is up to 940 px wide while the column is 600 px: the portrait sits 123 px (at 900) to 170 px (at 1024 and 1179) left of the text edge. | F-02 |
| 3 | The 404 at 1440 × 900 is 912 px tall, so a page with nothing below the fold scrolls 12 px. | F-03 |
| 4 | Argus Risk in dark: a screenshot's frame is `rgb(10 10 10)` on a `rgb(13 13 18)` page with no ring, so the frame's edge is invisible. | F-04 |
| 5 | At 320 px "products of my own." wraps, and its cobalt underline is drawn 288 px wide under a last line that is about 155 px wide. | H-01 |
| 6 | GitHub year: month labels mix lengths ("Nov, Dec, Jan … June, July, Aug, Sept"); a 29 px empty line is held between the total and the grid for a readout that shows only on hover; the legend's "today" touches its swatch and is the only lowercase label; on phones the grid's left edge shows slivers of cut cells. | H-02 |
| 7 | How I work: the arrow between habits 02 and 03 is drawn smaller and thinner than the other two, because the arrow scales with the row's height. | H-03 |
| 8 | On phones a row's text column ends 16 px before the column's right edge (358 of 374 px at 390), reserved for metadata that is hidden. | H-04 |
| 9 | On phones a "Live from …" dot that starts a wrapped line has the left of its pulse ring cut flat. | H-05 |
| 10 | Say hello's three rows have a title and no line; every other row on the site has both. `DESIGN.md` also lists "the line" for the section, and none renders. | H-06 |
| 11 | On phones an inline closer look's shadow is cut along a straight vertical edge 8 px left of the look (the film ticket shows it most). | L-01 |
| 12 | The portrait's closer-look caption is 13 px Bricolage where every other caption (the training photo's, every figure's) is 13 px DM Mono. | L-02 |
| 13 | The ticket's text column is 126 px wide: "Kiss Kiss Bang / Bang" leaves one word alone, and "2005 · Watched / 9 Oct" breaks inside a part. | L-03 |
| 14 | The book's closer look sets the author 14 px under the title (rows set a line directly under its title), and the "Live from Goodreads" line `DESIGN.md` specifies is absent. | L-04 |
| 15 | A Staff pass's strap ends in a flat cut edge in mid-air, in the margin, inline and on each Role story. | L-05 |
| 16 | On a 390 px phone a screenshot's large view is about 374 px wide against a 358 px inline figure, so it reveals nothing more. | P-01 |
| 17 | A Role story or case study ends on one "Next" row. Reaching Say hello from there takes the header's name, then a scroll to the foot of the homepage. | P-02 |
| 18 | The Résumé's Download PDF button is the only centred element on the site. | P-03 |
| 19 | `DESIGN.md` records the homepage at 3.7 and 4.4 screens; it measures 3.93 (3534 px at 1440 × 900) and 4.77 (4022 px at 390 × 844) today. | V-01 |

Evidence class: rows 1 to 9, 11 to 13, 16 and 19 are observed defects or measured facts. Rows 10, 14, 15, 17 and 18 are judgements against the approved direction, and say so in their requirement.

## Solution

No new direction. The quiet index stays exactly what `DESIGN.md` says it is; this work makes every state of it as exact as the states already checked. A visitor should not be able to find a width, a theme or an open closer look where something is stretched, clipped, crowded or misaligned.

### Design direction

The qualities the site should communicate are the ones it already names: quiet first, character on a closer look, and nothing that moves or appears unasked. Five principles govern every requirement below.

1. **One edge.** The column's left edge is the page's edge for everything that is text or carries text: the header, a title, a row, a caption, a pin. Anything off it is off it for a stated reason (a hover fill's 12 px bleed, a pass hanging centred on its strap).
2. **Drawn at size, never stretched.** A pen stroke, an underline or an arrow has one weight wherever it appears. When its length must vary, only its length varies.
3. **Room in proportion to rank.** The opening line and each page title get more air than a section title, not less.
4. **A material has no seams.** A shadow, a strap or a paper edge never ends on a straight line that the object itself does not have.
5. **Space is only reserved where it reads as space.** A slot held for something that shows on hover goes where emptiness looks intended (a foot, a margin), never between a heading and its content.

Relationships that must stay fixed: the two widths; the five text steps; the 80 / 64 px section step and the 56 px long-form step; `--spring` and `--out`; one focus ring; cobalt's named uses; depth on objects only. No requirement adds a typeface, a colour, a section, a card, a gradient, blur or a looping animation.

### What a visitor gets

- A first screen where the opening line has room and the header's rule appears only once the page has scrolled under it.
- A header that shares the text's edge at every width.
- Closer looks whose contents line up, wrap well and cast whole shadows, in the margin and inline.
- A GitHub year that reads as a finished chart.
- On a phone, a large view that is larger.
- A way to say hello from the end of every long page.

## User Stories

1. As a hiring manager on a laptop, I want the opening line to sit with room around it, so that the first thing I read is clearly the most important thing on the page. (F-01)
2. As a visitor, I want the page title on every page to start the same distance under the header, so that moving between pages feels like one site. (F-01)
3. As a visitor at the top of a page, I want the header to be free of a dividing rule until content scrolls beneath it, so that the first screen reads as one composition. (F-05)
4. As a visitor on a small laptop or a tablet in landscape, I want the portrait and name to start on the same edge as the text, so that the header belongs to the page beneath it. (F-02)
5. As a visitor on a small laptop, I want the Eclipse to end where the column ends, so that the header has the page's width. (F-02)
6. As a visitor on the 404 at a common laptop size, I want a page that fits to stay still, so that a short page doesn't scroll a few pixels. (F-03)
7. As a reader of a case study in dark mode, I want each screenshot's frame to have a visible edge, so that a dark interface does not dissolve into a dark page. (F-04)
8. As a visitor on a small phone, I want the cobalt underline to sit under the words it underlines, so that the page's one flourish looks drawn on purpose. (H-01)
9. As a visitor reading the GitHub year, I want month labels of one length, so that the axis reads as a scale and not as text. (H-02)
10. As a visitor, I want the GitHub total to sit directly above its chart, so that the two read as one figure. (H-02)
11. As a visitor hovering or focusing a day, I want its count to appear without the chart moving, so that reading a day costs nothing. (H-02)
12. As a visitor, I want the legend's "Today" to be set like "Less" and "More" and clear of its swatch, so that the legend is one line of equal parts. (H-02)
13. As a visitor on a phone, I want the GitHub year to start on a whole week, so that its edge is clean. (H-02)
14. As a visitor scrolling How I work, I want the three arrows between habits to be the same pen, so that the drawing looks made by one hand. (H-03)
15. As a visitor on a phone, I want a row's line to use the whole column, so that lines wrap as late as they can. (H-04)
16. As a visitor on a phone, I want a live dot's pulse to be a whole ring wherever it falls on a line, so that it reads as a signal and not as a rendering fault. (H-05)
17. As a visitor deciding how to get in touch, I want each Say hello row to say where it leads, so that I know which profile I am opening before I leave the site. (H-06)
18. As a visitor on a phone, I want an open closer look's shadow to fall away softly on every side, so that the object looks like it is resting on the page. (L-01)
19. As a visitor opening the portrait, I want its caption set like every other caption, so that captions are one voice. (L-02)
20. As a visitor comparing closer looks, I want a photograph's caption to look the same under the portrait and under the training photo, so that the looks read as one family. (L-02)
21. As a visitor looking at the film ticket, I want the title and its details to break where the sense breaks, so that the ticket reads like a printed ticket. (L-03)
22. As a visitor looking at the book, I want the author directly under the title and the source named, so that the look matches its row and its contract. (L-04)
23. As a visitor, I want a Staff pass's strap to run out of view at its top, so that the pass hangs from something. (L-05)
24. As a reader of a case study on a phone, I want a tapped screenshot to open large enough to read its text, so that the large view is worth opening. (P-01)
25. As a reader on a phone in the large view, I want to pan and pinch the screenshot, so that I can read any part of it. (P-01)
26. As a keyboard or screen-reader user, I want the large view to open, trap focus, close on Escape and return focus as it does today, so that the change for touch costs me nothing. (P-01)
27. As a hiring manager who has just finished a Role story, I want a row that takes me to Say hello, so that getting in touch is one step from the proof. (P-02)
28. As a reader who has finished a case study, I want the same row, so that every long page ends with the next page and a way to reply. (P-02)
29. As a visitor on the Résumé, I want Download PDF on the sheet's edge, so that it lines up with the header and the paper. (P-03)
30. As a visitor using Windows High Contrast, I want every change here to leave the forced-colours drawings and data as they are, so that nothing recently fixed regresses. (all)
31. As a visitor who prefers reduced motion, I want every change here to add no movement, so that the reduced-motion rules still hold. (all)
32. As Elias, I want `DESIGN.md` to state every value this work settles and the homepage's true length, so that the contract and the site agree. (V-01)
33. As a future implementer, I want each of these rules held by a check, so that the finish can't drift. (V-01)

## Implementation Decisions

Each requirement gives: **Where**, **Now** (measured on production), **Why it matters**, **Change**, **Requirements**, **Accept when**, **Depends on and constraints**, and **Priority**. Priorities: **P1** foundational or a visible defect, **P2** a significant refinement, **P3** a finishing detail. A value marked *proposed* is a target to validate on a preview, with its acceptable range; every other value is taken from the existing contract or from measurement.

Standing constraints on all of them: the Résumé sheet is untouched; no copy changes except the strings listed under H-02, H-06 and P-02, which need Elias's approval before they ship; the standing checks, the layout-shift gate (≤ 0.01), the JavaScript budget, forced-colours behaviour and reduced-motion behaviour all keep passing; hover-only styling stays behind `(hover: hover)`.

### Workstream F: foundations

#### F-01 One page-top step, in proportion to rank

- **Where:** the first content under the header on every page: the opening line (homepage), the page title (Work archive, 404), the back link (Role stories, case studies), Download PDF (Résumé).
- **Now:** header bottom to first content is 20 px on the homepage and on long-form pages, 28 px on the Work archive and the 404, and 24 px on the Résumé, at both 1440 and 390 px. The opening section pads 20 px above and 8 px below.
- **Why it matters:** the opening line is "the loudest thing on the page" and has a quarter of the room a 17 px section title gets (80 px). The two values (20 and 28) also mean a title moves 8 px between pages, against the header's "same place on every page" rule.
- **Change:** one token, `--space-page-top`, used by every page for the gap between the header's bottom edge and the first content.
- **Requirements:**
  - `--space-page-top` is **48 px** from 820 px wide and **32 px** below (*proposed*; acceptable 40 to 56 and 28 to 36). It joins the spacing tokens beside `--space-long-step`.
  - Every page listed under Where uses it and nothing else for that gap. The Résumé's Download PDF row uses it too.
  - The homepage's supporting line to the Work title stays as it is (the section step).
  - The homepage stays inside its length budget: at most 3600 px at 1440 × 900 and 4220 px at 390 × 844 with nothing open. If the validated value would exceed it, the value comes down; the section step does not change.
- **Accept when:** at 1440 and 390 px, on `/`, `/things-i-make`, a 404, `/work/bnp-paribas`, `/things-i-make/threshold` and `/resume`, the first content's top minus the header's bottom equals the token to within 1 px; the homepage's document height is within budget; layout shift stays ≤ 0.01.
- **Depends on and constraints:** costs the homepage about 28 px at 1440 and 12 px at 390; H-02 returns about 29 px, so ship H-02 first or together. Anchors' scroll offsets (`scroll-padding-top`, the long-form `scroll-margin-top`) are unchanged.
- **Priority:** P1. First-screen composition, every page, one token.

#### F-02 The header shares the column's edge at every width

- **Where:** the shared header on the homepage, the Work archive and the 404, between 900 and 1179 px wide. Long-form pages and the Résumé (whose header is the sheet's width) already comply.
- **Now:** from 1180 px the header's left edge is the column's. From 900 to 1179 px the header's inner row is `min(100% − 40px, 940px)` and centred, while the column is 600 px and centred: left edges differ by 123 px at 900, 153 px at 960 and 170 px at 1024 to 1179; the Eclipse sits the same distance right of the column. Measured on `/` and `/things-i-make`.
- **Why it matters:** this range covers iPad landscape and small laptop windows. The portrait and name float over empty space with no relation to the text, the one place where "one column" visibly isn't.
- **Change:** between 900 and 1179 px these pages' header is the column wide, as a long-form page's already is.
- **Requirements:**
  - 900 to 1179 px: the header's inner row is `min(100% − 40px, 600px)`, centred, on the homepage, the Work archive and the 404.
  - On the homepage in that range the five section links move to a row of their own beneath the name, greeting and Eclipse, spread from the column's left edge to its right, exactly as a long-form page's links are (same type, same 40 px link height, no inline padding). The greeting keeps its words and London's time shows without the links stepping aside.
  - The Work archive and the 404 have no links, so they keep a one-row header, at column width. The Résumé's header stays as wide as the sheet, as now.
  - From 1180 px nothing changes. Below 900 px nothing changes.
  - The sticky rule is unchanged (sticky from 900 px wide and 700 px tall). The homepage's two-row header in this range is 109 px tall, the same as a long-form page's.
- **Accept when:** at 900, 1024 and 1179 px on `/`, `/things-i-make` and a 404, the header's inner left edge equals the column's left edge within 1 px and its inner right edge equals the column's right edge within 1 px; at 1180 and 1440 px the header measures as it does today (940 px, left edge on the column); no page scrolls sideways at 900 to 1179 px; the five navigation targets and labels in the release check still resolve.
- **Depends on and constraints:** `DESIGN.md`'s header section changes ("the homepage's five links fit beside the greeting on one row" becomes true from 1180 px only). The precision spec's "the header and the text share one left edge" case is the prior art; it gains these widths. Alternative considered and rejected: hiding the links in this range, which removes navigation from the sizes most likely to be used with a keyboard.
- **Priority:** P1. A shared component, three routes, a range no earlier pass measured.

#### F-03 A page that fits does not scroll

- **Where:** any page whose content is shorter than the screen: the 404 and the Work archive today.
- **Now:** the 404 at 1440 × 900 is 912 px tall (784 px of header and content plus 128 px of end room), so it scrolls 12 px. The Work archive is exactly 900 px.
- **Why it matters:** a short page that moves a few pixels on a trackpad reads as a layout mistake.
- **Change:** end room is part of the page's minimum height, not added to it.
- **Requirements:** the main area's minimum height is the small viewport height minus the header, with the 80 to 128 px end room counted inside that minimum. A page taller than the screen keeps its end room as now.
- **Accept when:** a 404 at 1440 × 900 and at 1280 × 800 has a document height no greater than the viewport's; the same page at 390 × 844 still ends with at least 80 px below its last row; the homepage's end room is unchanged.
- **Depends on and constraints:** F-01 adds 20 px to the 404's content; check after it lands.
- **Priority:** P3.

#### F-04 Every screenshot frame has an edge

- **Where:** screenshot figures on case studies (the frame on its Project colour), the project closer look, and the phone cards.
- **Now:** a case study's frame has a 14 px radius, no border and no shadow. Argus Risk's frame is `rgb(10 10 10)` on the dark page `rgb(13 13 18)`: about 1.02 : 1. The finish rules give objects and closer looks a 1 px ring (black at 8 % in light, white at 10 % in dark); inline figures were left out.
- **Why it matters:** in dark mode two of three case studies open on a screenshot whose frame cannot be seen, so the figure has no shape and its caption hangs under nothing.
- **Change:** a screenshot frame takes the same 1 px ring an object takes.
- **Requirements:** every screenshot frame (inline figure, project closer look, phone card) carries a 1 px ring, where it does not already have one, in the ring colour already defined for its theme, drawn inside the frame's box so the figure's width and the layout do not change. No shadow is added to inline figures: depth stays on objects. The to-scale bars and the flag figure, which sit on the card surface, are unchanged.
- **Accept when:** on Argus Risk in dark at 1440 and 390 px the frame's edge pixels differ from the page colour on all four sides; figure width and page height are unchanged from before; in light mode Threshold's dark frame looks as it does now apart from the ring; forced-colours captures are unchanged.
- **Depends on and constraints:** the materials visual baselines for project looks will move by a 1 px ring; the pull request says so.
- **Priority:** P2.

#### F-05 The header's rule appears when the page scrolls under it

- **Where:** the shared header where it is sticky (from 900 px wide and 700 px tall).
- **Now:** a 1 px rule is always drawn under the header. At the top of a page it cuts across the first screen directly above the title.
- **Why it matters:** a judgement, not a defect. At rest nothing is beneath the header to separate it from; the rule's job starts when content scrolls under it. Without it the portrait, name and opening line read as one composition.
- **Change:** where the header is sticky, the rule is transparent at scroll position 0 and reaches its colour over the first 24 px of scroll.
- **Requirements:** driven by a CSS scroll-driven animation (the pen in How I work is the prior art), with no script. Where scroll-driven animations are unsupported, and where the header is not sticky (phones, short screens), the rule is drawn as now. With reduced motion the rule is simply present once the page is scrolled (a colour change is allowed; nothing moves).
- **Accept when:** at 1440 × 900 at scroll 0 the header's bottom border computes to a fully transparent colour, and at scroll 24 px or more to the rule colour; in a browser without scroll-driven animations the rule is always the rule colour; layout shift is unchanged.
- **Depends on and constraints:** land with or after F-01, since the extra room is what lets the rule go. This is a preference; Elias can decline it without affecting anything else.
- **Priority:** P3, optional.

### Workstream H: the homepage

#### H-01 The opening's underline follows its words when they wrap

- **Where:** "products of my own." in the opening line, at widths where it wraps (observed at 320 px; it is on one line from 390 px).
- **Now:** the underline is one drawing stretched to the phrase's box. When the phrase wraps to "products / of my own." the box is the full column (288 px at 320), so the stroke runs 288 px under a last line about 155 px wide.
- **Why it matters:** it is the page's one drawn flourish and its one cobalt statement, and on the narrowest phones it underlines empty space.
- **Change:** the underline is as wide as the last line of the phrase.
- **Requirements:** at every width the stroke's left end is within 6 px of the last line's first letter and its right end within 6 px of its final full stop. Its stroke weight in px is the same at every width (principle 2). The arrival draw, the hover reaction and the reduced-motion drawn state behave as now. No change at widths where the phrase is on one line.
- **Accept when:** at 320 and 360 px the stroke's rendered width is within 12 px of the last line's text width; at 390, 820 and 1440 px the stroke measures as it does today; the opening and reveal-word specs pass.
- **Depends on and constraints:** none.
- **Priority:** P1. A visible defect on the element that leads the page.

#### H-02 The GitHub year reads as a finished chart

- **Where:** Off the clock's GitHub year: the total line, the readout, the month labels, the grid, the legend.
- **Now:** (a) labels are "Nov Dec Jan Feb Mar Apr May June July Aug Sept Oct Nov": three, four and four letters, in boxes sized for three. (b) An empty 19.5 px line with 10 px above it sits between the total and the grid, held for a day's count that shows only on hover or focus; at rest the total floats 43 px above its chart. (c) The legend's "today" swatch is 16 px against 12 px levels, touches its label, and "today" is lowercase beside "Less" and "More". (d) On phones the grid scrolls sideways from its right end and its left edge shows cut cells behind the fade.
- **Why it matters:** it is the largest block in Off the clock and the only data graphic on the homepage. Each fault is small; together they make it the least finished thing on the page.
- **Change:** a fixed label set, the readout moved to the foot, a legend of equal parts, and a whole first column on phones.
- **Requirements:**
  - **Labels:** always three letters: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec. They come from a fixed list, not from the locale formatter. Two labels are never closer than 8 px; when they would be, the earlier one is not drawn.
  - **Readout:** it leaves the line above the grid. It sits at the left end of the foot, on the legend's baseline, in the same style as now (13 px DM Mono, cobalt). The foot keeps a fixed height whether or not a count is showing, so nothing moves on hover or focus. Under 480 px wide, where the legend fills the foot, the readout takes a second foot line beneath the legend, also at fixed height.
  - **Total to grid:** with the readout gone, the total sits 18 px above the month labels (the note-to-list step).
  - **Legend:** the today swatch is a 12 px square like the levels, with its 2 px cobalt ring outside it; 6 px between the swatch and its label; the label reads "Today" (*copy change, needs approval*).
  - **Phones:** at its starting scroll position the grid's left visible edge is the left edge of a whole week column. The fade stays.
  - Unchanged: the five levels, the cobalt ring on today, the single tab stop with arrow keys, each cell's accessible name, the count-up, forced-colours hairlines.
- **Accept when:** the rendered labels are exactly the twelve three-letter forms at 320, 390 and 1440 px; the total's bottom to the labels' top is 18 px ± 2 at 1440; hovering and focusing a day changes no element's position (bounding boxes before and after are equal); at 320 and 390 px no cell is partly clipped at the grid's left edge at rest; the homepage at 1440 × 900 is at least 25 px shorter than before this requirement; the forced-colours spec passes.
- **Depends on and constraints:** the Off the clock spec reads the readout and labels. Frees the height F-01 spends.
- **Priority:** P2.

#### H-03 The pen's arrows are one pen

- **Where:** How I work, the three arrows between the habit numbers.
- **Now:** each arrow is one drawing scaled to the gap beneath its number. Habit 02's row is 86 px tall where the others are 108 px, so the 02 to 03 arrow is visibly smaller, with a thinner stroke and a smaller head.
- **Why it matters:** the pen is the section's signature. Three arrows at two weights look generated, the opposite of hand-drawn.
- **Change:** only the shaft's length varies.
- **Requirements:** all three arrows have the same stroke weight in px (the rings' weight) and the same arrowhead size in px; the shaft lengthens or shortens to fit the row. The scroll-driven draw and un-draw, and the drawn state where it is unsupported or motion is reduced, are unchanged. The same rule holds for the underlines under each proof's strongest phrase: one stroke weight whatever their length.
- **Accept when:** at 1440 and 390 px the three arrows' rendered stroke widths are equal within 0.25 px and their heads' bounding boxes equal within 1 px; the How I work spec passes; at 320 px no underline runs into the line below (the existing wrap rule holds).
- **Depends on and constraints:** none.
- **Priority:** P3.

#### H-04 On phones a row's text uses the whole column

- **Where:** every row below the width where metadata and the hover arrow show (phones and touch).
- **Now:** at 390 px the row's text column is 282 px (76 to 358) and the column's right edge is 374: the 16 px grid gap before an empty, hidden end column is still spent.
- **Why it matters:** every row line on a phone wraps 16 px early. On a 358 px column that is 4.5 % of the measure, on every row of every page.
- **Change:** a row with nothing showing at its end has no end column.
- **Requirements:** where a row's metadata and arrow are both hidden, the text column runs to the row's right padding edge. Where either shows (desktop; the 404's missing row, whose "404" shows on phones), the row is as now. Row height, padding and the object slot are unchanged.
- **Accept when:** at 390 and 320 px the text column's right edge on a Work row, a Things I make row and an Off the clock row equals the column's right edge within 1 px; the 404's missing row still shows "404" at its right; at 1440 px rows measure as today; nothing scrolls sideways at 320 px; the homepage at 390 × 844 is no taller than before.
- **Depends on and constraints:** lines will re-wrap on phones, so the phone visual captures change.
- **Priority:** P2.

#### H-05 A live dot's pulse is never clipped

- **Where:** "Live from Goodreads / Letterboxd / Wikipedia / GitHub" on phones, where the source wraps to the start of a line.
- **Now:** the pulse ring grows to 2.6 times the 8 px dot. The line of parts it sits in clips horizontally (so a separator dot can hang in the gutter), which cuts the ring flat on its left when the dot starts a line. Seen on Goodreads in light and Letterboxd in dark at 390 px.
- **Why it matters:** a three-pulse signal with a flat side reads as a glitch on the first screen of Off the clock.
- **Change:** the ring is drawn whole.
- **Requirements:** the pulse ring is fully visible at any position in a line, in both themes. The hanging separator behaviour is unchanged (no line starts or ends on a dot). Three pulses, then rest; no pulse with reduced motion.
- **Accept when:** at 390 px, with the animation paused at its largest frame, the ring's rendered box is a circle (width equals height within 0.5 px) for every source that starts a line; the dangling-separator checks in the craft-precision spec pass.
- **Depends on and constraints:** none.
- **Priority:** P3.

#### H-06 Say hello's rows say where they lead

- **Where:** Say hello: Résumé, GitHub, LinkedIn.
- **Now:** each row is an object and a title, 68 px tall, with no line. `DESIGN.md` defines a row as "a title, one line" and lists "the line" before the email; no line renders for the section either.
- **Why it matters:** a judgement against the contract. These are the page's exits, and the two external ones name a platform but not a profile. They are also the only rows that look half-filled.
- **Change:** each row gains its line.
- **Requirements:**
  - Proposed lines (*copy, needs approval; each restates a fact already on the Résumé sheet*): Résumé, "One page, with a PDF"; GitHub, "github.com/3ixas"; LinkedIn, "linkedin.com/in/elias-t-bennett".
  - Lines are set as every row line (15 px, muted). Rows stay 68 px tall.
  - The visually hidden "opens … in a new tab" text and the `↗` stay.
  - The section itself keeps no note: `DESIGN.md`'s "the line" is removed from the homepage order.
- **Accept when:** each of the three rows renders a title and one line at 390 and 1440 px; row height is 68 px; the Say hello spec and `verify:copy` pass; the copy deck holds the approved strings.
- **Depends on and constraints:** blocked on Elias approving the three strings (or supplying others). If declined, close as "kept" and make only the `DESIGN.md` correction.
- **Priority:** P3.

### Workstream L: closer looks

#### L-01 An inline closer look casts a whole shadow

- **Where:** closer looks opened inline (below 1180 px, or without hover), all kinds.
- **Now:** the fold's inner wrapper hides overflow on both axes and the look has 8 px of inline padding. Any shadow that reaches further is cut on a straight vertical line. The film ticket's (two drop shadows, the larger 10 px down with a 14 px blur) shows a tinted rectangle with a hard left edge; a project's and a clipping's shadows are cut the same way, less visibly.
- **Why it matters:** this is how every closer look is seen on a phone, and a shadow with a straight edge breaks the finish rule that an object is lit from above and rests on the page (principle 4).
- **Change:** the fold clips its height and nothing else.
- **Requirements:** while a look is open and at rest, its shadow is unclipped on the left, right and bottom. During the fold the look may be clipped on the block axis only. The fold's timing, the "only one open" rule, the low-look scroll and scroll-anchoring are unchanged. No state widens the page.
- **Accept when:** at 390 px in both themes, with the film, a project, the history clipping and the PRD each open, a capture shows no straight edge in the shadow (visual baseline added for the film ticket); the document's scroll width equals the viewport's at 320 and 390 px with each look open; the phone-motion and work-inline specs pass, including the 16 px low-look landing.
- **Depends on and constraints:** changing the look's box can move the low-look landing by a pixel or two. Lens 3's declined item C1 failed on exactly that tolerance, so re-run the WebKit 820 px project.
- **Priority:** P1. A visible defect in the phone's signature interaction.

#### L-02 One caption style in every closer look

- **Where:** the portrait's closer look (the header's portrait on the homepage), in the margin and inline.
- **Now:** its caption "Based in London" is 13 px Bricolage. The training photo's caption, a project look's line and every figure caption are 13 px DM Mono.
- **Why it matters:** `DESIGN.md` gives captions to DM Mono. This is the one caption that isn't, and it sits under the largest photograph on the site.
- **Change:** the portrait's caption is set as every caption is.
- **Requirements:** 13 px DM Mono, muted, the same line height and top gap as the training photo's caption. The words are unchanged.
- **Accept when:** the portrait caption's computed font family, size and colour equal the training photo caption's, at 1440 px in the margin and at 390 px inline, in both themes.
- **Depends on and constraints:** the stylesheet says this caption is set "as a certificate's is"; the Take Ownership certificate's caption was not captured in this audit, and if it shares the style it changes with it. Checked and left alone: a Pass pin's box already starts on the text edge (the precision spec holds it); the 1.5 px that shows outside is its gilt rim, which is material.
- **Priority:** P3.

#### L-03 The ticket's words break where the sense breaks

- **Where:** the film's closer look (the ticket).
- **Now:** after the stub tears away the ticket's text column is 126 px. "Kiss Kiss Bang Bang" breaks as three words and one; "2005 · Watched 9 Oct" breaks after "Watched".
- **Why it matters:** the film changes every week or two, so the worst case is the normal case. `DESIGN.md`'s "lines of parts" rule (each part whole, no dot at a line's end) is not applied here.
- **Change:** balanced title, parts kept whole.
- **Requirements:** the title wraps balanced, to at most three lines, never leaving one short word alone where a more even break exists. The year and "Watched 9 Oct" are two parts under the lines-of-parts rule: each stays whole, and when they don't fit one line the separator is not drawn and each takes its own line. Stars stay on one line. Every text stays at or above 13 px. The ticket's width, stub, perforation and tear are unchanged.
- **Accept when:** with the fixture titles "Kiss Kiss Bang Bang", "Up" and "The Assassination of Jesse James by the Coward Robert Ford", in the margin at 1440 px and inline at 390 and 320 px: no title line holds a single word of five letters or fewer when the title has four or more words; "Watched 9 Oct" is never split; nothing overflows the ticket; no line starts or ends with a separator.
- **Depends on and constraints:** the Off the clock fixture page is the seam; add the three titles there.
- **Priority:** P2.

#### L-04 The book's closer look matches its row and its contract

- **Where:** the book's closer look.
- **Now:** the author is 14 px under the title, where a row sets its line directly under its title. `DESIGN.md` specifies "the title, author and a 'Live from Goodreads' line"; only the title and author render (checked 2.2 s after arrival, in both themes).
- **Why it matters:** a judgement on spacing and a contract mismatch on content.
- **Change:** row rhythm inside the look; contract and site brought into agreement.
- **Requirements:** the author sits directly under the title with the row's title-to-line relationship (no extra gap). For the source line, **recommended:** amend `DESIGN.md` to drop it from the look, since the row beside or above it already says "Live from Goodreads" and rule 6 puts detail behind, not twice. The alternative is to render it.
- **Accept when:** title bottom to author top is 2 px or less at 1440 px and inline at 390 px; `DESIGN.md`'s closer-look table and the rendered look list the same contents.
- **Depends on and constraints:** the cover-pull arrival (about 1.4 s, title then author in turn) is unchanged.
- **Priority:** P3.

#### L-05 A strap runs out of view

- **Where:** the full Staff pass's strap: in the margin, inline, and on each Role story's opening.
- **Now:** the strap is an 18 × 56 px woven strip that starts on a flat, square top edge in open space.
- **Why it matters:** a judgement under "each object in its real material". A lanyard that begins at a clean cut 56 px above the card is the one place the pass stops looking like an object.
- **Change:** the strap's top fades out.
- **Requirements:** the top 16 px of the strap fades from fully transparent to opaque (*proposed*; acceptable 12 to 20 px), so the weave and stitching appear to continue upward. The mini pass at 44 px is unchanged. The drop-and-swing arrival and the lean are unchanged. In forced colours the strap stays as drawn.
- **Accept when:** in captures of the BNP Paribas closer look and each Role story opening in both themes, the strap's top row of pixels matches the page colour; the materials visual baselines are updated for the full passes only.
- **Depends on and constraints:** full-pass baselines move.
- **Priority:** P3.

### Workstream P: long-form pages and the Résumé

#### P-01 On a phone the large view is larger

- **Where:** a screenshot's large view on Role stories and case studies, on screens narrower than the screenshot's declared width.
- **Now:** the dialog sizes the image to fit the window. At 390 px that is about 374 px wide, 16 px more than the inline figure it was opened from. Argus Risk's positions table and Threshold's totals are unreadable at that size, which is why someone taps them. A tap anywhere closes the dialog.
- **Why it matters:** on phones the feature does nothing, on the pages whose argument rests on screenshots.
- **Change:** on narrow screens the large view opens zoomed and pans.
- **Requirements:**
  - Where the window is narrower than the image's declared width, the image is shown at **twice the window's width**, capped at its declared width (*proposed*; acceptable 1.75 to 2.5 times), inside the dialog, which scrolls on both axes and contains its overscroll. It opens at the image's top-left.
  - Pinch zoom works inside the dialog.
  - Close stays fixed at the dialog's top right, at least 44 px, above the image.
  - With a touch pointer, a tap on the image no longer closes the dialog (it would fight panning). Close, a tap on the dimmed area outside the image, and Escape close it. With a mouse, a click anywhere still closes it, as now.
  - Unchanged: the dialog is modal, named by the image's alt text, opens on the decoded image, returns focus to the screenshot, fades in over 0.2 s and not at all with reduced motion. On wide screens it is as now.
- **Accept when:** at 390 × 844 with touch, the opened image's rendered width is at least 1.75 times the viewport's; the dialog can be scrolled to the image's right and bottom edges; a tap on the image leaves the dialog open and Close shuts it; focus returns to the trigger; at 1440 px the figure-expand spec passes unchanged; nothing behind the dialog scrolls while it is open.
- **Depends on and constraints:** `DESIGN.md` says "a click anywhere on it … closes it", so this is a contract change and needs Elias's decision. Pan and pinch must be checked on a real iPhone; emulation proves geometry only.
- **Priority:** P2.

#### P-02 Every long page ends with the next page and a way to reply

- **Where:** the ending of each Role story and case study.
- **Now:** one row under "Next role" or "Next project". From there, Say hello is the header's name link, then the foot of the homepage.
- **Why it matters:** the site's primary audience reads a Role story to decide whether to get in touch. The page stops at the moment that decision is made.
- **Change:** the ending is two rows in one list.
- **Requirements:** beneath the Next row, in the same list, a second row: the Sheet as its object, the title "Say hello", and the line the 404 already uses for it ("The email, the résumé, GitHub and LinkedIn"), linking to `/#say-hello` (*placement and reuse of the string need approval*). It is an ordinary link row with no closer look. No heading is added above it. This is not a footer: it appears only on long-form pages, as page content, and "no page has a footer" stands.
- **Accept when:** all six long-form pages end with two rows, the second of which navigates to the homepage with Say hello in view; each page still has one `h1` and an unbroken `h2` outline; the 404's own Say hello row is unchanged; the role-story and case-study specs pass with the ending updated.
- **Depends on and constraints:** `DESIGN.md`'s "Ending: one row" changes, so this needs Elias's decision. If declined, nothing else depends on it.
- **Priority:** P2.

#### P-03 Download PDF sits on the sheet's edge

- **Where:** the Résumé page, above the sheet.
- **Now:** the button is centred over the sheet; the header and the sheet's text are left-aligned.
- **Why it matters:** a judgement under principle 1. It is the only centred element on the site.
- **Change:** left edge on the sheet's left edge.
- **Requirements:** the button's left edge equals the sheet's left edge (which is the portrait's edge) at every width. Its style, label and target are unchanged. The sheet is untouched.
- **Accept when:** at 390 and 1440 px the button's left equals the sheet's left within 1 px; `verify:resume` and the committed PDF are unchanged.
- **Depends on and constraints:** uses F-01's token for the gap above it.
- **Priority:** P3.

### Workstream V: contract and gates

#### V-01 The contract says what the site does

- **Where:** `DESIGN.md`, the craft gate, and the precision spec.
- **Requirements:**
  - `DESIGN.md` records: `--space-page-top` and its two values; the header's column-width range; the screenshot-frame ring; the GitHub year's label set, foot readout and legend; the strap's fade; the large view on phones; the long-form ending; the portrait's caption. It corrects the homepage's measured length to the values measured after this work, and removes Say hello's "the line".
  - `DESIGN.md` gains the five principles under Design direction as short craft-bar rules, each naming its check.
  - The gates named under Testing Decisions exist and run in the required job.
- **Accept when:** every value in this spec that ships appears in `DESIGN.md` in the same pull request as its change; `pnpm check` and the end-to-end job are green.
- **Priority:** P1 for the gates that hold F-01, F-02, H-01 and L-01; P3 for the rest.

### Sequence and dependencies

| Order | Requirements | Why this order |
|---|---|---|
| 1 | H-02 | Frees about 29 px of homepage height before anything spends it |
| 2 | F-01, then F-03, F-05, P-03 | F-01 sets the token the others use |
| 3 | F-02 | Independent; touches the header only |
| 4 | H-01, L-01 | Independent defects; no decisions needed |
| 5 | H-04, H-05, H-03, F-04 | Independent refinements |
| 6 | L-02, L-03, L-04, L-05 | Closer-look internals; baselines move together |
| 7 | P-01, P-02, H-06 | Each waits on a decision or copy approval from Elias |
| With each | V-01 | Contract and gate land with the change they describe |

Nothing in rows 3 to 6 blocks anything else. Baseline-moving requirements (F-04, L-05) are best grouped so the materials snapshots are regenerated once, in the Playwright image the baselines runbook names.

## Testing Decisions

**What a good test is here.** It reads the rendered page the way a visitor's browser lays it out: positions, sizes, computed styles and visible text, at named widths and themes. It does not assert class names, DOM shape or the CSS that produced the result. Because the specs run on a shared runner, anything hydrated, animated or lazily laid out is read with `expect.poll` or a web-first assertion, never a single `evaluate` straight after `goto`; motion is paused and seeked, never waited out.

**Seams, highest first. No new seam is proposed.**

1. **The rendered site under Playwright**, the existing end-to-end suite against a production build at 320, 390, 820 and 1440 px in both themes, Chromium and WebKit. Every geometric acceptance criterion above is proved here. Prior art: `craft-precision.spec.ts` (edges, separators, wrapping), `header-portrait.spec.ts` and `shell-details.spec.ts` (the header), `layout-shift.spec.ts`, `phone-motion.spec.ts` and `work-inline.spec.ts` (inline looks and the low-look landing), `figure-expand.spec.ts` (the large view), `off-the-clock.spec.ts` with its fixture page (the GitHub year, the ticket, the book), `forced-colors.spec.ts`, `stretch-type.spec.ts`.
   - New cases go into those files: page-top step per route (F-01); header and column edges at 900, 1024, 1179 and 1180 (F-02); document height on a 404 (F-03); underline width at 320 and 360 (H-01); label set, readout stillness and total-to-grid gap (H-02); arrow stroke equality (H-03); row text edge at 390 (H-04); pulse ring roundness (H-05); look shadow and scroll width (L-01); caption style (L-02); ticket wrapping on fixture titles (L-03); large-view size and tap behaviour with touch (P-01); ending rows (P-02).
   - The suite adds a 1024 px width for the header cases only, as viewport overrides inside the spec rather than a new project, so the matrix does not grow.
2. **Visual baselines** (`materials.spec.ts` snapshots, Linux Chromium at 1440 light). They move for F-04 and L-05, and one is added for the inline film ticket at 390 px (L-01). Each pull request names the baselines it changed, per the lens rules.
3. **The CSS gates** in `pnpm check`: `verify:craft` (one focus ring, feedback timings, named motion) and `verify:type-scale`. `verify:craft` learns F-05's rule fade as named motion. Neither gate needs a new concept.
4. **`verify:copy`** for H-02's "Today", H-06's lines and P-02's reused string, once approved.
5. **By hand, recorded in the pull request:** the interruption walk for L-01 and P-01 (they touch the inline fold and a dialog); a real iPhone for P-01's pan and pinch and for H-05; both themes.

**Check with Elias before work starts:** that extending the existing spec files, rather than adding a file per requirement, matches his expectation. This spec was written without an interview, so that question is still open.

**Limits on local runs.** Per `docs/runbooks/local-testing.md`: one worker, one project at a time, only the affected specs, WebKit on its own, and no full suite or full build without Elias's approval. Diagnosis and before-and-after captures run against production and Vercel previews.

## Out of Scope

- A new direction, section, integration, typeface or colour. Nothing here reopens a decision recorded in `DESIGN.md`'s "Decided in review" or "Exploration record".
- The Résumé sheet and its PDF.
- Prose and interface copy beyond the three approval-gated sets of strings (H-02, H-06, P-02).
- Items Elias already declined in lenses 1 to 7, which are not re-proposed: the archive link's "(06)"; the pass's headline figure repeating its first pin; splitting the fallback font face; dropping Optegra's "What changed"; Joveen's pin wording (still blocked on the low-look tolerance).
- Where I'm headed's thread objects, the section skeleton, and the 404's three "not found" signals: considered again here and kept, for the reasons recorded on lenses 1 and 2.
- Large desktop layouts. At 1920 and 2560 px the page is the same 940 px block, centred. That is the two-widths rule working as intended, and the measure and type scale are right for reading; no change is proposed.
- Motion feel. No requirement changes a duration, curve or arrival, because none could be judged (see evidence limits).
- Ticket breakdown. The sequence table is a dependency order, not a ticket list.

## Further Notes

### Open decisions for Elias

| # | Decision | Recommendation |
|---|---|---|
| D1 | **How this spec relates to lenses 8 to 13** ([#393](https://github.com/3ixas/eliasb.dev/issues/393) to [#398](https://github.com/3ixas/eliasb.dev/issues/398)). Most requirements here fall inside them: F-02, F-04 and L-02 in lens 8; L-01 and P-01 in lenses 9 and 12; H-04, H-05 in lens 12; L-03 in lens 11. | Treat this spec as pre-diagnosed findings for those lenses, so nothing is found twice, and let the remaining lenses spend their time on what this audit could not see (see limits). The alternative is to ticket this spec on its own and close the overlapping lens criteria against it. |
| D2 | P-01: on touch, a tap on the image stops closing the large view. | Accept; panning needs it. |
| D3 | P-02: a second ending row to Say hello on long-form pages. | Accept; it is a row, not a footer. |
| D4 | F-05: the header's rule only once scrolled. | Accept with F-01; decline freely. |
| D5 | Copy: "Today" (H-02); the three Say hello lines (H-06); reusing the 404's Say hello line (P-02). | Approve or replace. |
| D6 | L-04: drop "Live from Goodreads" from the book's look in `DESIGN.md`, or render it. | Drop it from the contract. |

### Assumptions

- Production at `e25f630` is what `main` holds; the deployment record agrees.
- The proposed values (48 / 32 px page-top, 16 px strap fade, 2 × large view, 24 px rule fade) are starting targets with stated ranges. Each is validated on a Vercel preview at 390 and 1440 px in both themes before it is written into `DESIGN.md`.
- The Off the clock fixture page can take extra film titles without changing what production fetches.

### Evidence and its limits

Captured with the project's own Playwright against production: every route at 1440 px, the homepage at 320, 390, 768, 900, 1024, 1180, 1440, 1920 and 2560 px, BNP Paribas and Threshold at 390 and 1440 px, both themes sampled, twenty closer looks at 1440 px (six also in dark), inline looks at 390 px, the large view at 390 and 1440 px, keyboard order through every stop on the homepage, Escape, and the Copy button with clipboard permission granted. Geometry was read from the rendered DOM.

Not verified, and not claimed:

- **A real iPhone and Safari.** Everything at phone width is Chromium emulation. Safari's edge tinting, tap behaviour and pinch are unchecked.
- **How motion feels.** Captures were taken headless after arrivals had finished. The margin's glide, the fold, the Eclipse's crossfade and interruption were not experienced; the interruption walk was not run.
- **Firefox**, a real **Windows High Contrast** session, a **screen reader** pass, print, and a throttled first load.
- **Dark closer looks** beyond the six sampled, and closer looks on Role stories and case studies (the dotted words there).
- **Tablet with touch** was captured at rest at 768 px only.

A missing check is a limit, not a clean result. Lenses 9, 12 and 13 are the natural owners of the first two.

### Where to look today

A snapshot at `e25f630`, to save the implementer a search. It will go stale; the requirements above do not depend on it.

| Requirement | Current home |
|---|---|
| F-01 | spacing tokens in `stretch-tokens.css`; the opening's padding in `quiet-opening.css`; page shells in `stretch-shell.css` and `quiet-long-form.css` |
| F-02, F-05 | `quiet-header.css` (the 900 px block and the 1180 px rule); `site-header.tsx` |
| F-03 | the main area's end room in `stretch-shell.css` |
| F-04 | `.qi-case__shot` in `quiet-long-form.css`; the project look and phone card in `quiet-index.css` |
| H-01 | the tail's stretched drawing in `opening.tsx` and `quiet-opening.css` |
| H-02 | `github-year.tsx`, `contribution-calendar-model.ts`; `.stretch-gh__*` in `quiet-index.css` |
| H-03 | the `Ink` strokes in `how-i-work.tsx`; `.qi-ink` rules |
| H-04, H-05 | the row grid and `.qi-dots` in `quiet-index.css`; the pulse in `stretch-shell.css` |
| H-06, P-02 | `site-copy.ts`, `say-hello.tsx`, `long-form.tsx`; `docs/content/redesign-copy.md` |
| L-01 | `.qi-inline` and `.qi-inline__in` in `quiet-index.css`; `closer-look-root.tsx`, `scroll-hold.ts` |
| L-02 | `.qi-face-look figcaption` in `quiet-header.css` |
| L-03, L-04 | `.qi-ticket`, `.qi-shelf`, `.qi-look__name`, `.qi-look__by`; `off-the-clock.tsx` |
| L-05 | `.qi-pass__strap`; `finished-pass.tsx` |
| P-01 | `zoomable-image.tsx`; `.qi-zoom__dialog` in `quiet-long-form.css` |
| P-03 | `stretch-resume.css` (page chrome only, not the sheet) |

---

# Part 2: three proposed directions

Status: **three proposals awaiting Elias's choice. None is approved.** Written 10 November 2026. Part 1 above is unchanged and stays valid for the current design until a direction is chosen. `docs/design/DESIGN.md` has not been edited.

Prototypes (static HTML, real content, outside the app) and captures are in `docs/review/2026-11-10-creative-directions/`:

| | Homepage | Role story | Captures (`shots/`) |
|---|---|---|---|
| Baseline (production, `e25f630`) | `www.eliasb.dev` | `/work/bnp-paribas` | `00-current-*` |
| **C1 To scale** | `c1-to-scale/index.html` | `c1-to-scale/bnp.html` | `c1-*` |
| **C2 On file** | `c2-on-file/index.html` | `c2-on-file/bnp.html` | `c2-*` |
| **C3 Life-size** | `c3-life-size/index.html` | `c3-life-size/bnp.html` | `c3-*` |

Each prototype's `style.css` is the source of measured values quoted below. Where this text and a prototype disagree, this text governs. Requirement identifiers are stable: `X-` applies to whichever direction is chosen, `TS-` to C1, `OF-` to C2, `LS-` to C3.

## Problem Statement

Part 1 asks how to finish the quiet index. This part asks whether the quiet index is the right design, judged as a whole and from nothing.

What the current site does well is in Part 1 and is not repeated. Judged as a piece of art direction, it has five limits that polish cannot fix.

1. **The first screen says the least.** At 1440×900 a visitor sees a header, a two-line sentence at 22 px in a 600 px column, and the top of a list. Roughly 70% of the screen is empty and nothing on it could only be Elias's (`shots/00-current-desktop-top.jpg`).
2. **The best material is hidden.** Staff passes, the simulated paths, bars drawn to scale, the certificate, the ticket and the clipping are the site's memorable things, and every one of them is behind a hover or a tap. A visitor who scrolls without hovering never sees them. On a phone each is one tap deep.
3. **Type formats; it does not compose.** Five sizes between 13 and 22 px in one weight family give a calm page and no moment of scale. Nothing is large enough to remember.
4. **The story is told in one sentence.** "History, then marketing, then code" is the most unusual fact about Elias and it is a 15 px note. The page is five lists in a fixed order; it has an order but no arc.
5. **The form is shared.** A narrow column of rows with a margin that reveals things is a known and admired idiom. The craft is Elias's; the silhouette is not.

The site's evidence is unusually good: almost every claim has a number and a source. The opportunity is a design in which that evidence is the first thing seen and the thing remembered.

## Solution

Three directions, each built from a different fact about Elias, each a different composition. They are alternatives, not stages.

| | C1 To scale | C2 On file | C3 Life-size |
|---|---|---|---|
| Built from | He measures things | He keeps the evidence, and trained as a historian | Each employer issued him a pass with one headline figure |
| Composition | A drawing: one axis, shared units | A wall: objects at their own size | A stage: one thing per screen |
| Leads with | Charts made from his numbers | Staff passes, plates, ephemera | Monumental type on the employer's colour |
| Type | Archivo (variable width) + DM Mono | Newsreader (optical size) + DM Mono | Bricolage Grotesque at width 75, weight 800 + DM Mono |
| Ground | Near-white sheet, hairlines | Grey board, white plates, shadow on objects only | Full-bleed colour fields |
| Navigation | Sticky header, five anchors | Sticky header with lettered series; a reading room for records | Fixed spine of coloured segments |
| Homepage length, 1440×900 / 390×844 (current 3.93 / 4.77 screens) | 6.62 / 10.29 | 6.26 / 9.97 | 11.54 / 12.94 |

### Comparative review

Scores are my judgement of the rendered prototypes, 1 to 5, with the current site as the reference. They support the ranking; they do not replace looking at the captures.

| Criterion | Current | C1 | C2 | C3 | Deciding observation |
|---|---|---|---|---|---|
| Visual sophistication | 4 | 4 | 4.5 | 4 | C2's materials and serif carry the most finish; C1 is plain between its figures |
| Originality | 3 | 4.5 | 4 | 3.5 | C3's colour fields with giant numerals are a familiar studio idiom |
| Coherence | 5 | 4.5 | 4 | 4.5 | C2 mixes plates, cards, a ticket and a clipping; each needs its own rules |
| First impression | 2.5 | 4.5 | 4.5 | 5 | C3's opening sentence fills the screen |
| Memorability | 3 | 4.5 | 4.5 | 4 | "The site where the jobs are drawn to scale"; "the one with the passes" |
| Content communication | 3.5 | 5 | 4 | 3.5 | C1 shows eight before-and-after results without a click; C3 shows one figure per screen |
| UX quality | 4.5 | 4 | 4 | 3 | C3 is 11.5 screens and relies on a spine to orient |
| Interaction quality | 4.5 | 3.5 | 4 | 3.5 | All three give up the current closer looks; C2's reading room replaces them best |
| Responsive quality | 4 | 3.5 | 3.5 | 4 | C3 is the most natural phone composition; C1's axis turn works but the page is long |
| Accessibility and performance | 5 | 4.5 | 3.5 | 4 | C2 loads the most imagery and has the most decorative transforms |
| Implementation effort | — | Medium | Large | Medium | |
| Durability | 4.5 | 4.5 | 3.5 | 3 | Skeuomorphic objects and colour-field posters both date |

**Ranking: C1, then C2, then C3.**

**Recommendation: C1 To scale.** It is the only direction whose idea cannot be moved to another person's site, because the drawing is made of Elias's own durations and results. It says the most per screen, it is the lightest to load, and it carries the "every number shows its source" claim from Argus Risk into the site's own form. Its weakness is that it is plain between figures; TS-08 and the type decisions address that.

**Where each falls short of what I expected.** C1: "Where I'm headed" has no quantity to draw, so it is the weakest figure, and the homepage on a phone is ten screens. C2: the hero is strong but the page under it is a well-made gallery; the idea thins after the passes. C3: striking for three fields, then the device repeats eleven times; it trades information for impact.

**What combines, and what does not.** C2's reading room is compatible with C1 as the record behind a bar on the axis (it restores a closer look, which C1 otherwise drops); this is offered as optional requirement TS-11. C3's fitted numerals can serve C1's role-story openings. C3's colour fields do not combine with C1 or C2: a full-bleed field breaks C1's shared sheet and C2's single board. The three typefaces should not be mixed.

## User Stories

Applying to any direction:

1. As a hiring manager with thirty seconds, I want the first screen to tell me what Elias does and show one piece of proof, so that I know whether to keep reading.
2. As an engineer evaluating him, I want his results shown with their before and after, so that I can judge the size of each without opening a page.
3. As a visitor on a phone, I want the composition designed for my screen, so that nothing is a desktop layout squeezed.
4. As a visitor who never hovers, I want the site's best material visible by scrolling alone.
5. As a keyboard user, I want every link and control reachable in reading order with a visible focus ring.
6. As a screen-reader user, I want every figure to have a text equivalent that states its values.
7. As a visitor who prefers reduced motion, I want every figure complete and still on arrival.
8. As a visitor in dark mode, I want the same hierarchy and passing contrast.
9. As a returning visitor, I want the live rows (reading, watched, history, GitHub, now making) to keep working with their stale and fallback states.
10. As Elias, I want every string on the page to remain a string from the approved copy deck or to be listed as new copy for my approval.
11. As Elias, I want existing URLs and section anchors to keep working.
12. As a recruiter, I want the Résumé and its PDF one click from anywhere.
13. As a visitor finishing a Role story or case study, I want the next one and a way to say hello.

C1 To scale:

14. As a visitor, I want to see all three jobs on one time axis, so that I see how long each lasted and that the move into code is recent.
15. As a visitor, I want each result drawn as a before bar and an after bar on one scale, so that "cut by 40%" has a size.
16. As a visitor, I want to run the illustrative simulation again, so that I understand what "simulation-based" means.
17. As a visitor, I want each project's tests drawn one square per test, so that I can compare the three at a glance.
18. As a phone visitor, I want the time axis to run down the page.

C2 On file:

19. As a visitor, I want to see the three staff passes immediately, so that I know the three employers and each one's headline figure.
20. As a visitor, I want to open a pass and read its record without leaving the page.
21. As a visitor, I want each project shown as a plate with a caption, so that I see the thing before I read about it.
22. As a phone visitor, I want the passes on a shelf I can swipe.

C3 Life-size:

23. As a visitor, I want each employer to take the whole screen in its own colour with one figure, so that I remember one thing about each.
24. As a visitor, I want a spine that shows where I am and lets me jump.
25. As a phone visitor, I want each field to fit my screen.

## Implementation Decisions

### Cross-cutting requirements (whichever direction is chosen)

#### X-01 Content integrity
All copy comes from the existing content modules and the approved copy deck. Each direction's "New copy" list below is the complete set of strings the prototype adds; none ships without Elias's approval and an entry in the copy deck.
**Acceptance:** the copy contract check passes; a diff of rendered homepage text against the content modules shows only strings on the approved list.

#### X-02 Routes, anchors and behaviour are preserved
Every current route resolves. The five homepage anchors keep their ids. Kept behaviours: the theme toggle with its stored choice (the prototypes follow the system setting only), the greeting by time of day, Copy with its two-second "Copied", the live integrations with live, stale and fallback states, the GitHub year's arrow-key navigation and readout, the Markdown and `llms.txt` renderings, the Résumé and PDF, the 404's missing-address row, social images.
**Acceptance:** the existing end-to-end specs for these behaviours pass, updated only where a selector changed.

#### X-03 Accessibility
Text contrast at least 4.5:1 (3:1 for text 24 px and larger and for graphic marks that carry meaning) in both themes and on every coloured field. One h1 per page; headings in order. Every figure has a text alternative that states its values. Focus is visible on every field colour. Reduced motion shows every figure in its final state with no transition. Forced colours keeps bars, passes and fields distinguishable by border.
**Acceptance:** axe passes on the homepage, one Role story and one case study in both themes; a reduced-motion capture equals the settled capture; a forced-colours capture shows every bar and pass outlined.

#### X-04 Performance
Layout shift stays at 0.00 on the homepage, a Role story and a case study. Largest contentful paint on the homepage stays within 0.3 s of today's on the same connection. Web fonts are self-hosted and subset as today, with a metric-matched fallback. Images below the first screen load lazily at sizes matched to their slot.
**Acceptance:** the existing measurement scripts report these on a production build.

#### X-05 Secondary pages follow the homepage
Role stories, case studies, the archive, the Résumé chrome and the 404 take the chosen direction's type, colour and header. The Role story prototype in each direction is the reference for long-form layout. The Résumé sheet itself (its print layout) is unchanged.

#### X-06 The design contract is rewritten once, after approval
On approval, `DESIGN.md` is rewritten for the chosen direction, with the removed rules listed and this exploration recorded in its history. Part 1 requirements are then carried, changed or dropped per the table in "Relationship to Part 1".

---

### C1 · To scale

**Thesis.** Elias measures things, so the site is one drawing in which every quantity he claims is drawn at its true proportion.

**Principles.** A unit means the same length everywhere inside a figure. A figure never implies a quantity that is not in the content. Colour marks whose result it is; hatching marks "before". Text is plain; the figures carry the personality.

**Tokens (from the prototype).** Sheet `#f7f7f4` / `#0e0f12`; ink `#111318` / `#ecedf0`; muted `#5d616b` / `#9a9fab`; cobalt `#2443d6` / `#8c9eff`; employer marks BNP `#008353` / `#3ecf8e`, Joveen `#0a0a0a` / `#ececec`, Optegra `#006765` / `#00aa90`; project marks Threshold `#9a6a3f`, Argus `#2f66dc`, Flowtime `#9a6348` (light). Sans: Archivo variable (width 62 to 125). Mono: DM Mono 12 px for axis labels, figure numbers and values. Content width 1248 px inside 40 px gutters (20 px on phones). Section head: a 1 px ink rule, heading in 3 of 12 columns, note in 9.

#### TS-01 Opening: the sentence and Figure 1
The h1 is the existing headline at `clamp(34px, 4.1vw, 58px)`, weight 560, width 94%, two lines at 1440. "pricing and risk engines" is underlined in BNP green by text decoration (it wraps with the words, which retires H-01); "products of my own." is cobalt. The support line follows at 19 px. Figure 1 sits under it: a plot `min(46vh, 400px)` tall with left and bottom axes, 80 paths of 120 steps drawn as 1 px ink lines at 20% opacity, a dashed start level, and one path highlighted in BNP green at 2.25 px. The highlighted path is the one ending nearest the upper quartile. The existing caption is the figure caption; the existing alt text is its accessible name.
**Acceptance:** at 1440×900 the headline, support line, whole plot and caption are in the first screen; paths never draw outside the plot; with scripting off a static plot is shown.

#### TS-02 Run it again
A button in the caption re-seeds and redraws Figure 1 and shows the run number and path count. Paths draw left to right in 0.9 to 1.5 s. Seeded, so a run is reproducible in tests.
**Acceptance:** activating it changes the highlighted path and increments the run label; under reduced motion the new paths appear with no drawing; the button is a keyboard stop with a visible ring.
*Open:* whether the simulation should use any parameter that reads as real (it must stay labelled illustrative).

#### TS-03 Figure 2: three jobs on one axis
One horizontal axis from September 2021, 64 months long, with a gridline at each January. Each employer is a bar whose left edge and length are its true start and duration (Optegra months 0 to 36, Joveen 35 to 46, BNP Paribas 46 to today), 28 px tall, in its employer mark colour, on its own lane (newest on top, 112 px pitch). Under each bar: employer, role, dates and duration in months; then the pass headline figure at 34 px, width 78%, weight 700. BNP Paribas's text is right-aligned to its bar and its bar ends in a live dot. Optegra's bar has a tick at October 2022. A strand under the axis labels "marketing" and "code" from their true starts, with "History" on a dotted lead-in before month 0 (no dates are claimed for it). Each bar links to its Role story. The header shows a key: a bar exactly twelve months long at the figure's current scale.
On phones the axis runs down the page, newest at the top, 12 px per month, bars 10 px wide on 16 px lanes, text to the right of each bar's top.
**Acceptance:** bar lengths divided by durations are equal within 1 px at 1440, 1024 and 390; the key bar equals twelve months of the axis at any width; no text is clipped at 320; the figure's text alternative lists each employer with role, dates and headline.
*New data:* durations in months and the October 2022 tick are derived from dates already in the content.

#### TS-04 Figure 3: what changed, drawn to scale
One group per employer: employer name and story link in 3 columns, pairs in 9. Each pair is a label and two bars from a shared left edge on one scale: "before" 9 px tall, hatched at 45°, and "after" 17 px tall in the employer colour, each with its value in mono at its end. Pairs (all from Role story evidence and Résumé lines): BNP Paribas pricer integration 10 → 2 working days, competition data load 40 → 5 minutes; Joveen key API p95 520 → 230 ms, page load 100 → 60, deploy 10 → 2 minutes; Optegra pass rate 62 → 88 on a 0 to 100 scale, p95 page load 100 → 70, conversion 100 → 115. BNP Paribas's three pins follow its pairs as text. Bars grow from zero when the group is a quarter in view, the after bar 0.25 s behind the before bar.
**Acceptance:** each after/before length ratio equals the stated values within 1%; percentage-only results are labelled with the percentage and "before", never with invented absolutes; the caption states the shared-scale rule and the ten-working-days assumption.
*Open:* whether indexed bars (results known only as a percentage) are acceptable beside absolute ones.

#### TS-05 Where I'm headed
Three columns under a sub-head. Each has a 3 px top line whose first third is solid in the source's colour and whose rest is dashed, the label in mono, the title at 19 px weight 560, and the "So far" fact with its source. The solid length is fixed and identical in all three; it is not a measure.
**Acceptance:** the three solid segments are equal; each "So far" matches its source text under the existing restatement check.
*Open:* this is the direction's weakest figure. An alternative with no bar at all should be tried before build.

#### TS-06 Things I make: counted, not described
Each featured project is a row: screenshot in 5 of 12 columns (16:10 frame, 6 px radius, 1 px ring, cropped from top left), then type and year in mono, name at 30 px, outcome at 19 px, two counts and links. A count is a run of marks and a mono line: one 7 px square per test (182, 126, 189), one 2×16 px tick per user story (57), one 34×16 px block per service or timer state (4, 6). Squares are the same size in all three projects. The other three projects are single-line rows; the archive link follows.
**Acceptance:** the number of marks equals the number stated, checked by counting DOM marks; squares are identical across projects; counts have a text alternative.

#### TS-07 How I work, Off the clock, Say hello
How I work: four columns (two on tablets, one on phones), each a number in mono, the habit at 23 px weight 620, the proof at 15.5 px with its underline phrase marked by a 2 px cobalt underline. Habit 03 carries the flag figure. Off the clock: the GitHub year at full content width (maximum 1060 px) with the total at 44 px and three-letter months, then four columns: the training week as seven ticks with today in cobalt, reading and watched with their covers at 72 px wide, and history. Say hello: the address at `clamp(26px, 4.6vw, 64px)` with a cobalt underline, Copy, and the three links.
**Acceptance:** today's tick matches the visitor's weekday; live marks, stale and fallback states render as today.

#### TS-08 Role stories and case studies
Opening: employer at `clamp(40px, 6vw, 84px)`, a mono line of role, dates, duration and setting, the summary at up to 27 px, and a small copy of the Work axis with this job in colour and the others hatched. Body: sections as rows of heading (3 columns), text (6, 18 px, maximum 38 em) and figure (3). "What changed" is followed by its pairs at full text width. Ends with the next story and Say hello (P-02).
**Acceptance:** `c1-to-scale/bnp.html` at 1440 and 390 is the visual reference; the existing Role story content renders without loss.

#### TS-09 Motion
Bars grow once on first view (0.9 s, `cubic-bezier(0.2, 0.8, 0.2, 1)`). Paths draw on load and on run. Screenshots scale 2.5% on hover. Nothing else moves. Reduced motion removes all three.

#### TS-10 What is removed
The 600 px column and margin, rows with 44 px objects, closer looks (margin and inline), the pen, staff pass objects, the ticket, the clipping and the calendar tile. The header portrait and its closer look are not in the prototype.
*Open:* whether the portrait returns in the header.

#### TS-11 Optional: a record behind each bar
Activating a bar in Figure 2 opens the employer's record (pins, Résumé lines, story link) in a side sheet, as OF-03 specifies, instead of navigating. Adopt only if the loss of closer looks is felt in review.

**New copy for approval.** "Run it again"; "run {n} · {count} paths"; "start level"; "t = 0"; "horizon"; "Illustrative paths, drawn in your browser."; the four figure captions; "What changed, drawn to scale"; "1 year, as drawn in Work"; "{n} months"; "History", "marketing", "code" as strand labels; "before"; "So far · {source}".
**Conflicts with DESIGN.md.** Replaces the column, margin, row, object, closer-look and type-scale rules. Keeps cobalt's role, employer colours, depth only on images, and the length budget's intent while exceeding its figures (6.62 and 10.29 screens against 4 and 5).
**Risks.** Reads as a report if the figures are not finished to a high standard. Long on phones. A chart invites scrutiny of its numbers, so every figure must be exactly right.
**Effort.** Medium. New figure components (paths, axis, pairs, counts), a new page shell and header, long-form restyle. No new data sources. Removes the closer-look system and its tests.

---

### C2 · On file

**Thesis.** Elias keeps the evidence. The site is his file, laid out on a board: the passes, the certificate, the screens, the cards, the ticket, each at its own size with a caption, and nothing behind a hover.

**Principles.** An object looks like what it is and is large enough to read. Depth belongs to objects only; the board is flat. Every object has a caption with a series number, and the series are the navigation. Tilt is small and comes from the content's own values.

**Tokens.** Board `#e7e6e2` / `#141416`; plate `#fbfbf9` / `#202023`; ink `#151517` / `#ecebe7`; dim `#5c5b58` / `#a09f9a`; cobalt as C1. Pass fields, inks and straps are the Role stories' existing colours. Serif: Newsreader with optical sizing, body 17 px. Mono: DM Mono 11.5 px for series numbers, dates and sources. Object shadow: `0 26px 44px -30px` plus `0 6px 12px -8px`. Content width 1248 px; a 12-column wall with 28 px column and 44 px row gaps.

#### OF-01 Header and series
A 56 px sticky header on the board colour with a 1 px ink bottom rule. Name at 20 px; five links, each a cobalt letter (A to E) and the section name in mono. On phones the links show letters only, each with an accessible name. The rule is the rail the passes hang from.
**Acceptance:** each letter link reaches its section; at 390 the five letters fit with 44 px targets.

#### OF-02 Opening: the statement and three passes
Two columns, 5 and 7. Left: a mono line with role and location, the h1 at `clamp(34px, 3.5vw, 50px)` weight 400 with "BNP Paribas" underlined in BNP green and "products of my own." in cobalt (upright), the support line at 19 px, and a five-row list of the series with item counts. Right: three passes hanging from the header rule by 18 px straps in each employer's swatch, Optegra, Joveen, BNP Paribas left to right, with strap lengths 170, 236 and 132 px and tilts −1.2°, 1.5° and −1° (the content's existing tilt values) about the strap's top. A pass is 240×344 px, 14 px radius, in the employer's field colour: series number, employer at 21 px, headline figure at 84 px weight 500, its label, a rule, role and dates, then "Valid · present" with a pulsing dot (current) or a "Returned" stamp at the top right (past). BNP Paribas's strap carries three enamel pins. On load each pass swings in from five times its tilt over 1.6 s; on hover or focus it swings to −0.6 of its tilt.
On phones the text comes first, the series list is omitted, and the passes sit on a horizontal snap shelf under a full-width rule, BNP Paribas first, with 56 and 84 px straps.
**Acceptance:** at 1440×900 all three passes are fully in the first screen; the "Returned" stamp never overlaps the figure; each pass is a button named for its employer and headline; under reduced motion passes rest at their tilt.

#### OF-03 The reading room
Activating a pass opens a sheet 560 px wide on the right (a bottom sheet 86% of the screen high on phones) over a blurred board: a band in the pass's colours with series number, employer, role and dates; "On the pass" (its three pins); "What I did" (its Résumé lines); and the story link. It is a modal dialog: focus moves in, is contained, Escape and the veil close it, and focus returns to the pass.
**Acceptance:** opening and closing with keyboard alone works and restores focus; the page behind does not scroll; content equals the Role story's pins and Résumé lines.

#### OF-04 Work: proof plates and the self-issued pass
A wall of four: the Take Ownership certificate (7 columns); "Where I'm headed" as a dashed, self-issued pass (5 columns) with its line and three bars as label, title and "So far"; Joveen's desktop screen with its phone screen overlapping the lower right at 19% width (7); Optegra's homepage (5). Every plate is the image on a 10 px white mount (6 px on phones) with the object shadow and a caption: cobalt series number, bold title, one or two sentences of results, story link.
**Acceptance:** captions' figures match Role story evidence; images carry their existing alt text.

#### OF-05 Things I make: plates
Threshold spans 7 columns and two rows; Argus Risk and Flowtime take 5 columns each beside it; the other three take 4 each at 16:10. Captions carry number, name, outcome, type and year in mono, and links. A linked plate lifts 4 px on hover.

#### OF-06 How I work: four cards and a sheet
Four ruled index cards (26 px rules, a cobalt rule 46 px from the top, tilts −0.7°, 0.5°, −0.3°, 0.8°): number, habit at 21 px weight 500, proof at 15.5 px on the rules with the underline phrase marked by a hand-drawn cobalt stroke. A card straightens and lifts on hover. Below, offset a quarter of the width, the PRD quote typed in mono at 21 px on a sheet, tilted −0.4°, captioned with the PRD's date and a link.
**Acceptance:** the baseline of every proof line sits on a rule at 1440 and 390; the stroke follows its phrase when it wraps.

#### OF-07 Off the clock: ephemera
Running photo plate (3 columns); the training week as a card with a calendar tile and all seven sessions, today marked (4); the book as its cover with a spine shadow, opening 14° on hover (2); the film as a ticket with an "Admit one" stub, perforation, poster and rating, tilted 1.1° (3); the history clipping with its stamp, tilted −0.6° (5); the GitHub year with its total at 46 px (7). Carries L-03, L-04 and L-05 from Part 1 in adapted form.
**Acceptance:** each live object shows its live mark and has stale and fallback forms; the tile shows the visitor's weekday and date.

#### OF-08 Say hello, Role stories, motion
Say hello: the address at `clamp(28px, 5vw, 72px)` weight 300 with a cobalt underline, Copy as an outlined pill, three links at 21 px. Role story: the employer's pass hangs at the left of the opening, the employer name at up to 104 px weight 300, the summary at up to 28 px; sections are rows of series number, heading at 30 px, text at 19 px and a figure mounted as a tilted plate. Motion is limited to the pass swing, hover lifts, the book and the reading room (0.45 s). Reduced motion removes all of it.
**Acceptance:** `c2-on-file/bnp.html` is the visual reference.

**New copy for approval.** "Software engineer · London" (from the profile); series letters and "{n} items", "4 live", "1 address"; "Self-issued · not yet valid"; "On the pass"; "What I did"; "Staff pass"; "Close · Esc"; "Read it in the case study →"; "Role story"; caption sentences assembled from Role story evidence.
**Conflicts with DESIGN.md.** Replaces the column, margin, rows, the removal rule's ban on decoration at rest, the type family and scale. Keeps and enlarges staff passes, pins, the ticket, the clipping, the tile, "depth only on objects", employer colours and cobalt.
**Risks.** Skeuomorphism can tip into costume; every object needs the care the current 44 px objects received, at eight times the size. The most images of the three. Lettered series must stay functional. A serif body is a large change of voice.
**Effort.** Large. Many bespoke objects at full size in two themes with forced-colours forms; a modal with focus management; image pipeline changes for plate sizes.

---

### C3 · Life-size

**Thesis.** Every employer gave Elias a pass with one headline figure. Shown at the size of the screen, in the employer's own colour, each becomes impossible to miss.

**Principles.** One idea per field. Type is the image. A field's colour is its subject's own. Every large line is fitted to its measure.

**Tokens.** Paper `#f3f2ee` / `#101014`; ink the reverse; cobalt as C1; green for the opening `#008a56` / `#3ecf8e`. Fields (fixed in both themes): BNP Paribas `#00965e` with ink `#06120d`; Joveen `#0a0a0a` / `#f2f2f2`; Optegra `#006765` / `#f0fbf9`; Threshold `#c08a5a` / `#1a1714`; Argus Risk `#4f86f7` / `#07090f`; Flowtime `#1e1915` / `#ece4d8` with numerals in `#c0876a`; Off the clock `#101014` / `#f1f0ec`; Say hello `#2443d6` / `#ffffff`. Sans: Bricolage Grotesque; display at width 75, weight 800, optical size fixed at 96, line height 0.86, tracking −0.025 em. Mono: DM Mono 12.5 px. Field padding 56 px (20 px on phones), 96 px top; rules are 2 px in the field's ink.

#### LS-01 Fitted lines
A fitted line is set at the font size that makes it exactly as wide as its measure, capped at 56% of the viewport height, recomputed on resize and when fonts load. The server-rendered size is a viewport-relative estimate so the first paint is close and the correction does not shift layout below it.
**Acceptance:** at 1440, 1024, 390 and 320 each fitted line's width is within 2 px of its measure; layout shift from fitting is 0.00 (the line's box height is reserved).
*Risk:* this is the direction's main technical risk; a CSS-only fit should be tried first.

#### LS-02 Opening
A paper field one screen high. The h1 is the headline in three fitted lines on desktop ("I build pricing and risk" / "engines at BNP Paribas," / "and products of my own.") and five on phones ("I build pricing" / "and risk engines" / "at BNP Paribas," / "and products" / "of my own."), with "BNP Paribas," in green and "products of my own." in cobalt. One h1 in the accessibility tree at every width. Under a 2 px rule: the portrait at 72 px, the support line at 21 px, and the Work note right-aligned.
**Acceptance:** the sentence is read once by a screen reader; the three (or five) lines share both edges.

#### LS-03 Role fields
One field per employer, one screen high, newest first. Head row over a rule: employer at 30 px weight 750, role and setting, dates in mono, and "Valid · present" with a pulsing dot or a "Returned" stamp. Middle: the pass headline as a fitted line in 58% of the width ("Only", "−40%", "88%"), with its label beside it at `clamp(30px, 4.2vw, 64px)` weight 700. Foot: three pins as columns (bold label, detail) under 2 px rules, one proof sentence, and the story link at 20 px weight 650. Joveen counts from 0 to −40 and Optegra from 62 to 88 over 1.1 s on first view. On phones: head, numeral at full width, label, pins as rows, proof, link.
**Acceptance:** each field fits 1440×900 and 390×844 without internal scroll; the numeral never overlaps the foot; contrast of all text on each field passes X-03.

#### LS-04 Project fields
One field per featured project. Left 5 columns: type and year in mono, the name as a fitted line, the outcome at up to 30 px weight 600, four evidence figures (numeral at 64 px width 75 weight 800 over a 15 px label), and links over a rule. Right 7 columns: the screenshot bleeding off the right edge, `min(72svh, 640px)` tall, 12 px radius on its left corners. On phones: head, screenshot, figures two by two, links; height is natural.
**Acceptance:** figures equal the case studies' evidence; the screenshot keeps its alt text.

#### LS-05 Paper sections
"Where I'm headed", the other projects, and "How I work" sit on paper at natural height. Section heads are a heading at `clamp(44px, 6vw, 88px)` (width 75, weight 800) with the note beside it over a 2 px rule. Headed: three columns under 8 px rules in the source's colour, titles at 30 px. Other projects: rows with the name at up to 64 px. How I work: rows of a cobalt number at 44 px, the habit at up to 44 px weight 750, and the proof at 19 px with the underline phrase in weight 650 on a cobalt underline.

#### LS-06 Off the clock and Say hello
Off the clock is a dark field: head, today's session as a fitted line, the week as seven pills with today filled, then reading, watched, history and the GitHub year (green levels) in a row. Say hello is a cobalt field: the address as a fitted link, then Copy and the three links at 22 px over a rule.
**Acceptance:** the fitted session is the visitor's weekday's session; the address remains selectable text.

#### LS-07 The spine and the fixed name
A fixed spine on the right edge: one 8×26 px segment per field in that field's colour with a white and dark outline so it shows on any ground; the current one is 18 px wide; each shows its label on hover or focus and links to its field. On phones it is a 7 px strip along the bottom. The name and greeting are fixed at the top left in the ink of the field under them.
**Acceptance:** exactly one segment is current at any scroll position; every segment has an accessible name and a 24 px target on desktop; the name's contrast passes on every field.
*Open:* the phone strip's segments are below the 44 px target size; a larger tap zone or an alternative is needed.

#### LS-08 Scroll, motion and Role stories
Full-height fields snap by proximity on desktop only; never on phones or under reduced motion. The large element in each field rises 6% of the viewport height and fades in over 0.9 s on first view. Role story: a field in the employer's colour with the employer name fitted and the summary at up to 32 px; then paper sections with headings at up to 76 px; then a field in the next employer's colour as the link to it.
**Acceptance:** `c3-life-size/bnp.html` is the reference; keyboard and anchor navigation are never trapped by snapping.

**New copy for approval.** "The pass says"; "More things" (spine label); "Opening" (spine label); "Next"; pin labels on Joveen and Optegra assembled from evidence ("Time to deploy", "Consultation conversion").
**Conflicts with DESIGN.md.** Replaces everything except the typeface family, employer and project colours, cobalt, the greeting and the content. Exceeds the length budget by the most (11.54 and 12.94 screens).
**Risks.** Length. The device repeats. Fitted text depends on script. Large saturated fields are tiring to some readers and need a forced-colours form. The idiom is fashionable.
**Effort.** Medium. A field component, the fitting utility, the spine; few bespoke objects. The risk is in fitting and scroll behaviour across browsers, especially iOS Safari.

---

### Relationship to Part 1

| Part 1 requirement | C1 To scale | C2 On file | C3 Life-size |
|---|---|---|---|
| F-01 page-top step | Superseded (64 px opening) | Superseded | Dropped |
| F-02 header on the column | Dropped (new header) | Dropped | Dropped |
| F-03 short pages do not scroll | Carried | Carried | Carried |
| F-04 screenshot frame edge | Carried (built in) | Replaced by plate mount | Carried on project screenshots |
| F-05 header rule on scroll | Dropped | Dropped (rule is the rail) | Dropped |
| H-01 underline follows wrapped words | Resolved by construction | Resolved by construction | Dropped |
| H-02 GitHub year | Carried, restyled | Carried, restyled | Carried, restyled |
| H-03 pen arrows | Dropped | Dropped (stroke only) | Dropped |
| H-04 phone row text width | Dropped | Dropped | Dropped |
| H-05 live dot | Carried | Carried | Carried |
| H-06 Say hello lines | Dropped | Dropped | Dropped |
| L-01, L-02 closer looks | Dropped | Dropped | Dropped |
| L-03 ticket, L-04 book, L-05 strap | Dropped | Carried, adapted (OF-07, OF-02) | Dropped |
| P-01 phone large view | Carried | Carried | Carried |
| P-02 long-form ending | Carried | Carried | Carried (the next field) |
| P-03 Download PDF edge | Carried | Carried | Carried |
| V-01 contract and gates | Replaced by X-06 | Replaced by X-06 | Replaced by X-06 |

If no direction is chosen, Part 1 stands as written.

### Sequence and dependencies (for the chosen direction)

1. Approval of the direction, its new copy and its open items. Blocks everything.
2. X-06 contract, then tokens, fonts and the page shell and header.
3. The opening (TS-01/02, OF-02, LS-01/02). It proves the direction in production and carries the main technical risk.
4. Work (TS-03/04/05, OF-03/04, LS-03), then Things I make, How I work, Off the clock, Say hello.
5. Long-form pages (TS-08, OF-08, LS-08) and X-05.
6. Removal of superseded components and their tests, then X-02 to X-04 verification on a production build and a real iPhone.

Steps 4 and 5 can proceed section by section; each section depends only on step 2.

## Testing Decisions

- A good test here checks what a visitor can see or do: a bar's length against its stated value, a count of marks against its number, a dialog's focus, a field fitting its screen. It does not assert class names or CSS values.
- **One seam: the rendered page through the existing end-to-end runner.** Geometry assertions use bounding boxes with `expect.poll`, as the existing precision specs do; nothing reads animated state once after navigation.
- **C1:** a geometry spec for TS-03 (length per month constant; key equals twelve months), TS-04 (length ratios), TS-06 (mark counts), with a seeded TS-02.
- **C2:** a dialog spec for OF-03 (open, contain, Escape, restore), a first-screen spec for OF-02, baseline-grid checks for OF-06.
- **C3:** a fit spec for LS-01 at four widths, a field-fits-screen spec for LS-03, a spine spec for LS-07.
- **All:** the axe specs, reduced-motion and forced-colours captures, the copy contract and the materials baselines are updated, not removed. Prior art: the existing craft-precision, figure-expand, off-the-clock and phone-motion specs.
- Visual acceptance is a side-by-side with the prototype captures at 1440×900 and 390×844 in both themes, reviewed by Elias, not a pixel diff.

## Out of Scope

- Building any direction. Tickets. Any change to production, `main` or `DESIGN.md` before approval.
- New content, new projects, new data sources, or changes to the Résumé sheet.
- A hybrid of the three beyond TS-11.
- Items Elias has already declined (listed in Part 1).

## Further Notes

### Decisions for Elias

| # | Decision | Recommendation |
|---|---|---|
| E1 | Which direction, if any | C1 To scale |
| E2 | Whether the homepage may exceed the 4 and 5 screen budget | Yes for C1, with phone length reduced where a figure can be folded |
| E3 | New copy lists | Review per direction before build |
| E4 | C1: indexed bars for percentage-only results (TS-04) | Accept, labelled |
| E5 | C1: adopt the reading room (TS-11) | Decide after seeing the first build |
| E6 | Whether the header portrait and its closer look survive | Keep the portrait; drop the closer look |
| E7 | Whether the prototypes are kept on a throwaway branch | Yes, untracked on `main` until then |

### How the directions were chosen

About twenty candidates were considered along five axes (what leads, composition, type, navigation, tone). Rejected, with the reason: a terminal (cliché); a chat (cliché); a newspaper edition and a cream editorial page (current default look); a bento dashboard (default look); a draggable desk (fails on phones and for keyboard users); a spec-document site built from his PRD habit (strong idea, visually close to C1 and drier); a day and night split on the theme toggle (a device, not a design); annotated marginalia (extends the current pen without changing the silhouette).

### Evidence and its limits

- All captures are headless Chromium at 1440×900, 768×1024, 390×844 and 320×640. No horizontal overflow at any of them in any prototype, and no script errors. In the prototypes every story link opens the BNP Paribas page and case-study links are inert.
- **Not verified:** a real iPhone or Safari (matters most for C3's fitting, snap and bottom strip); how any motion feels; Firefox; forced colours; a screen reader; print; slow connections. The prototypes follow the system theme and have no toggle.
- Prototypes hotlink Google Fonts and two live cover images, and use a snapshot of GitHub levels from 10 November 2026. Production must self-host fonts and use the integrations.
- Prototype dialogs do not trap focus fully and fitted text is script-only. Both are requirements above, not properties of the prototypes.
- Each direction was reviewed and revised twice against its captures; the role-story pages once. They are faithful enough to choose between, not finished designs.

---

# Part 3: round two, after Elias's review of Part 2

Status: **three proposals awaiting Elias's choice. None is approved.** Written 11 November 2026. Part 2's three directions were reviewed and none was taken; they stay on file as the exploration record. Prototypes and captures: `docs/review/2026-11-11-creative-directions-round-2/` (open `index.html` there).

## What the review decided

| Feedback | Rule carried into every direction here |
|---|---|
| C1: proof and animation up front is right; the execution was loose | Proof is visible without a click, and each figure is finished to the standard of the type around it |
| C1: the time axis gave the most room to Optegra | **Rank by importance, never by duration.** BNP Paribas is the largest thing in Work; Joveen and Optegra are smaller and come after the hinge sentence |
| C2: the best of the three, elegant, too simple in places | D1 continues it; D2 and D3 keep its restraint |
| C3: too loud; the colours are right | No monumental condensed type and no full-bleed fields. Employer and project colours stay punchy but are contained (a mat, a stage, or light) |
| Redundant microcopy | **No eyebrows, no subheadings that restate a heading, no helper text.** See X-07 |

#### X-07 Text earns its place
Every direction drops: kickers above headings, series letters and item counts, figure numbers and "Fig." captions, mono labels above titles, "Live from …" marks where the row already names its source, and the section notes that restate their heading ("Products of my own…", "Four habits…", "What my own time looks like this week."). The Work note ("History, then marketing, then code…") is kept and promoted to a sentence in its own right between BNP Paribas and the earlier roles. Where a prototype removes approved copy, that is listed under the direction for Elias's approval.
**Acceptance:** no element sits directly above a heading as a label for it; removing any remaining line of text would lose a fact, a name, a state or an action.
*Open:* whether source marks must return for stale and fallback states (X-02 still requires those states to be shown).

#### X-08 Motion has a job
Applies with X-03. Each moving thing states something: the simulation shows what the engines do; bars grow to show before and after; a figure counts from its old value to its new one; an object lifts to show it is a link. One arrival per section (opacity with at most 16 px of travel, 0.6 to 1.1 s, ease-out), hover motion only for fine pointers, nothing loops except the simulation's slow re-run and the live dot, and reduced motion shows every end state at once.

## The three directions

| | D1 On file, second edition | D2 Stages | D3 Nocturne |
|---|---|---|---|
| In one line | Round one's board, with BNP Paribas leading and colour as a mat | Light and sleek; each subject on a stage in its own colour, sized by importance | Dark and quiet; the simulation is the opening picture |
| Type | Newsreader + DM Mono (small values only) | Geist | Cormorant Garamond display + Instrument Sans |
| Where colour lives | The mat under an object | The stage a subject sits on | Light: glows, numerals, the paths |
| BNP Paribas leads by | The largest pass, its pins named, then a green mat of three proofs | The first and largest stage, directly under the headline | The headline's green, the opening simulation, and three large claims |
| Themes | Light and dark | Light and dark | Dark only (a light version is undecided) |
| Homepage length, 1440×900 / 390×844 | 6.6 / 10.5 screens | 6.0 / 8.6 | 8.2 / 10.8 |
| Effort | Large | Medium | Medium |

### D1 · On file, second edition

Everything in Part 2's C2 (OF-01 to OF-08) stands except as changed here.

- **OF-09 The lead pass.** Passes hang in order of importance: BNP Paribas first at 1.2 scale on a 150 px strap, Joveen at 0.8 on 96 px, Optegra at 0.68 on 60 px, overlapping slightly. Each of BNP Paribas's three pins has a label to the left of the strap (name in serif 14 px, detail in mono 11 px) joined by a 22 px hairline. The lead pass carries a soft highlight that follows a fine pointer. The headline starts below the pin labels (168 px under the rail at desktop widths) and is `clamp(34px, 3.9vw, 56px)`. Replaces OF-02's order, sizes and series list. On phones the lead pass is at scale 1 with its labels, and the other two are reached by scrolling the shelf.
  **Acceptance:** at 1440, 1024 and 390 no pin label touches the headline or another pass; the three passes' areas rank BNP Paribas, Joveen, Optegra.
- **OF-10 The BNP Paribas mat.** Work opens with a section headed "BNP Paribas" (role, division and dates at the right) and a green mat (44 px padding, 6 px radius) holding three plates: the simulated-paths plot with its caption sentence (drawn when it enters view), the two before-and-after pairs with the feature-flag line, and the certificate. Plates are tilted −0.5°, 0.4° and 1.1°. Then the story link, then the hinge sentence at `clamp(28px, 3.3vw, 46px)` weight 300, then Joveen's and Optegra's plates. Replaces OF-04's first row.
- **OF-11 Mats for projects.** The three featured projects sit on mats in their own colours (Threshold `#c08a5a`, Argus Risk `#4f86f7`, Flowtime `#3a2c22`) with 34 px of mat showing; the screenshot lifts 6 px on hover.
- **OF-12 No series.** Series letters, numbers and counts are removed everywhere (X-07). The header's links are plain serif names. "Where I'm headed" becomes one wide dashed card with its three parts side by side.
- **Known gaps in the prototype:** at 1024 the straps hang from the text block's end, not from a rule; the two returned passes are small enough that their dates are hard to read.

### D2 · Stages

- **ST-01 Shell and type.** Background `#fafaf8` / `#0a0a0b`; ink `#0b0b0c` / `#f3f3f0`. Geist throughout; headline `clamp(38px, 5.3vw, 78px)`, weight 600, tracking −0.042 em, three lines at 1440. Content 1280 px wide in 32 px gutters. Section headings are `clamp(28px, 3vw, 40px)` weight 600 with nothing above or beside them. A plain header (name, five links), not sticky.
- **ST-02 A stage.** A stage is a 28 px-radius block (22 px on phones) in its subject's colour with its own ink, a 1 px inner top highlight, and no shadow. Stages are the only coloured surfaces. Everything else is type on the page.
- **ST-03 The BNP Paribas stage.** Directly under the headline, full width, at least 640 px tall, green with a soft radial lift from the top left. Top row: employer, role and dates, "Valid · present" with the live dot. Left: "Only" at `clamp(120px, 15vw, 216px)` and "C# engineer on the team" at up to 30 px, then three pin chips. Right: the simulation on a canvas (70 paths at 20% ink, one white path 2.5 px wide), fading in from the left, drawn over 1.8 s and re-run with a new highlighted path every 7 s while the tab is visible. Bottom: three inset tiles (the two before-and-after pairs with white "after" bars, and the feature flag with its switch shown off) and the story link as a pill.
  **Acceptance:** at 1440×900 the stage's top row, "Only" and the moving paths are in the first screen; the paths never run under "Only"; tiles' bar ratios equal their stated values.
- **ST-04 The hinge and the earlier roles.** The Work note at `clamp(24px, 2.9vw, 40px)`, then two equal stages side by side: Joveen (`#0b0b0c`) and Optegra (`#006765`), each with employer, role and dates, its headline figure at up to 152 px counting from its old value, its label, three facts under a rule, and its story link. They are each less than half the BNP Paribas stage's area.
- **ST-05 The rest.** "Where I'm headed": heading and line, then three columns each marked by a 56 px bar in its source's colour (no labels). Things I make: Threshold on a wide copper stage with its three figures and its screenshot bleeding off the right and bottom; Argus Risk (blue) and Flowtime (dark brown) on half-width stages with screenshots rising from the bottom; the other three as rows. How I work: four columns, habit at 24 px weight 600, proof with its phrase underlined in cobalt. Off the clock: one dark stage holding the week (seven dots), reading, watched, history and the GitHub year. Say hello: a cobalt stage with the address at up to 84 px.
- **Copy changes for approval:** the opening's support sentence is not shown (the stage and its pins say the same things); section notes removed per X-07; "Live pricing, new path" and "Behind a flag that defaults to off" are assembled from the Role story's figure.
- **Risks.** A grid of rounded blocks can read as a product template; the defence is that sizes follow importance and every stage holds real, moving proof. Needs care at 720 to 1080 px, where the lead stage reflows.

### D3 · Nocturne

- **NO-01 Shell and type.** Background `#0a0a0c`, ink `#f0eee9`, muted `#98958f`, hairlines at 13% ink. Display: Cormorant Garamond 400 for the headline, section and employer names, project names, habits and figures. Text: Instrument Sans. Green `#5fe3a6`, cobalt `#8ea2ff`, gold `#e6bd55`. Content 1200 px in 48 px gutters; sections are 168 px apart; structure is drawn with hairlines, never boxes.
- **NO-02 The opening.** One screen high. The headline at `clamp(44px, 7vw, 112px)`, line height 0.96, three lines, with "BNP Paribas" in green and "products of my own." in cobalt. Behind and below it, the simulation: 110 paths at 11% green drawn additively and one bright path with a soft glow, drawn over 3.2 s, re-run with a crossfade every 9 s while the opening is on screen. The paths are masked to the band under the headline so no path crosses text. Under a hairline: the support sentence at 17.5 px and the three awards as gold-dotted items.
  **Acceptance:** no path overlaps the headline or the foot at 1440, 1024 and 390; reduced motion shows the finished run.
- **NO-03 BNP Paribas.** Employer name with role and dates at the right; three claims in columns divided by hairlines, each a figure in green at up to 152 px ("Only", "Six", "Under 5", the last counting down from 40) over its label; then the two before-and-after pairs as a 2 px line and a 4 px glowing green line; then the story link.
- **NO-04 The hinge and the earlier roles.** The Work note in the display serif at up to 56 px; then Joveen and Optegra as two columns divided by a hairline, figures at up to 160 px (off-white, teal `#35d6bd`), three facts, story link.
- **NO-05 The rest.** "Where I'm headed" as three hairline columns each started by a 64 px glowing line. Things I make: three rows alternating image and text; each screenshot has a blurred glow of its project's colour behind it (42% opacity, 60% on hover), names at up to 80 px, figures in the project's colour. How I work: a two-by-two grid of habits at up to 48 px. Off the clock: four hairline columns and the GitHub year in green. Say hello: the address at up to 112 px on a cobalt hairline.
- **Risks.** Dark-only is a position; a light counterpart needs designing before build. A light display serif on black needs checking at small sizes and on low-density screens. The canvas must pause off screen and stay within the performance budget (X-04).

## Decisions for Elias

| # | Decision | Recommendation |
|---|---|---|
| G1 | Which direction, if any | **D2 Stages**, with D1 close behind |
| G2 | If D2: whether the opening's support sentence may be dropped | Yes; it repeats the stage |
| G3 | If D3: light theme | Design one before committing |
| G4 | Section notes removed under X-07 | Approve the removals listed |

**Why D2.** It answers each point of the review most directly: BNP Paribas is the first and largest thing after the headline, its proof moves in front of the visitor, the colours are the ones liked in C3 without the volume, and it is the shortest page of the six. D1 is the richest and the closest to what was liked in C2, and costs the most to build well. D3 has the most atmosphere and the best opening, and takes the largest risk on theme.

**What was checked.** Headless Chromium at 1440×900, 1024×768 (D1 only), 768×1024, 390×844 and 320×640: no horizontal overflow and no script errors in any of the three. Each direction had one build and two rounds of fixes against its captures (hero collisions, clipped labels, stamp placement, path overlap). **Not checked:** a real iPhone or Safari, motion at real speed, keyboard and screen reader, forced colours, D1 and D2 in dark beyond their first screens, and role-story pages, which round two does not include.

## Direction E: one design from the round-two review

Status: **proposed, not approved.** Added 11 November 2026 after Elias ranked round two D2, D3, D1 and took none alone. E is a single direction assembled from what he kept. Prototype: `docs/review/2026-11-11-direction-e/index.html`; captures in its `shots/`.

| Kept | From | In E |
|---|---|---|
| The opening, the staff passes and their pointer highlight | D1 | Unchanged in kind; the highlight is on all three passes (OF-09) |
| A panel per subject, sized by importance | D2 | ST-02; Newsreader replaces Geist for headings and figures, Instrument Sans for small text |
| Earlier roles as stat panels | D2 | ST-04, with every fact drawn as a before and after pair |
| Off the clock as one dark panel | D2 | ST-05 |
| Colour as light under the projects | D3 | Each project stage casts a soft shadow in its own colour |
| Note cards for habits | D1 | E-04 |
| The plain serif footer | D1 | OF-08's Say hello |

Changes the review asked for:

- **E-01 The simulation explains itself.** The BNP Paribas stage's figure has axes ("Today", "Horizon"), one highlighted path labelled "One scenario", a histogram of where all paths end drawn on the right edge, and a dashed line at their average labelled "One price". Paths draw first, the histogram grows after 1.3 s, the price line appears at 2 s. The caption is the existing sentence plus one new one: "Thousands of possible market paths go in; a price and its risk come out."
  **Acceptance:** a reader who has never seen the site can say what the figure shows from its labels alone; the histogram's bins sum to the number of paths; the price line sits at the mean of the endpoints.
  *Open:* Elias to confirm the wording is accurate for the engines.
- **E-02 Comparisons name both sides.** Each BNP Paribas tile states who or what each bar is: "An experienced engineer · about two weeks" against "Me, new to it · a couple of days"; "Before · 30–40 min" against "After · under 5 min". Joveen and Optegra show three pairs each with the values at the right.
- **E-03 No pass furniture off a pass.** "Valid · present" appears only on the staff pass. Every stage header is employer at the left, role and dates at the right.
- **E-04 "How I work" and "Where I'm headed" are shown, not listed.** Each habit card has its heading above the blue rule, the proof on ruled lines, and a small drawing of its evidence at the foot (the two projects, 57 ticks, a switch that is off, a bar 15% longer). "Where I'm headed" is one paper panel: each of the three parts starts from a chip naming where the evidence comes from, and a bracket gathers all three into "Product engineer".
- **E-05 Awards say what happened.** The third pin reads "AI workflow, now used by several teams" in place of the title "AI Champion". *Open:* final wording is Elias's.

Checked: no horizontal overflow or script errors at 1440, 1024, 768, 390 and 320 px; homepage is 6.5 screens at 1440×900 and 10.0 at 390×844. Not checked: real iPhone or Safari, motion at real speed, keyboard and screen reader, dark beyond the first screen, role-story pages.

### Direction E, second pass (11 November 2026)

Status: **proposed, not approved.** Elias walked the first pass and asked for the changes below. Where an item here differs from E-01 to E-05, this one stands. Pages: `index.html` (homepage), `bnp.html` (role story), `threshold.html` (case study), `things.html` (archive), sharing one `style.css` and `app.js`. Captures: `shots/e2-*.jpg`; the first pass's are in `shots/v1/`.

- **E-06 The opening is its own screen.** The headline, the support sentence and the three staff passes fill the first viewport on a wide screen (`min-height: min(100svh − header, 900px)`), and nothing of the Work section shows before a scroll. Below 1200 px the text stacks above the passes, which hang from a hairline.
  **Acceptance:** at 1440×900 and 1280×720 the top of the Work heading is below the fold on load.
- **E-07 A staff pass looks like one.** Each pass is a CR80-proportioned printed card (14.5 : 23) hanging from a two-ply woven lanyard by a metal clip through a punched slot. The card has the employer's colour as a header band, a portrait, the name, role and dates, three points, a status, and a barcode. The current pass's portrait is in colour and carries a hologram with "Valid · present"; returned passes have a greyscale portrait and "Returned". All three passes are the same kind of object; BNP Paribas is first, largest and hangs lowest.
  - BNP Paribas: Winner (Digitisation competition, 2025); Take Ownership (Award, Q1 2026); AI workflow (Used by several teams).
  - Joveen: −40% (Page load); 520 → 230 ms (Key API p95); +30% (Mobile retention).
  - Optegra: 62 → 88% (Core Web Vitals pass rate); −30% (p95 page load); +15% (Consultation conversion).
  The gold lanyard pins and their leader labels are removed (supersedes OF-09's pins and E-05's placement). The pointer highlight stays and also turns the hologram.
  **Acceptance:** every figure on a pass is one of its role story's evidence items or stated facts; the pass's accessible name carries the same content as its print; no text on a pass renders below 9.5 px at 1201 px wide.
  *Open:* the portrait is `public/profile/elias.webp`; Elias to confirm he wants his photo on the passes, and the Take Ownership line's wording.
- **E-08 Work has a heading.** The section opens with "Work" as its title and "History, then marketing, then code. Each move was towards the work I liked most." as its subheading, then BNP Paribas, then Joveen and Optegra. Employer names are one level below the section title.
- **E-09 The BNP Paribas panel has one thing to read first.** Order of attention: "Six months, from zero C# to production code"; the simulation figure; two named comparisons under a rule; the link. Removed from the panel: the highlighted "One scenario" path, the "Six months" and feature-flag tiles (the flag is shown in How I work and in the role story). The figure keeps "Today", "Horizon" and "One price" (supersedes E-01's labels).
  **Acceptance:** the panel holds one display-size figure, one chart and two comparisons, and nothing else competes at display size.
- **E-10 Where I'm headed names the aim, not a job title.** The "Product engineer" destination and its bracket are removed. The lead reads "I’m working towards turning new ideas into software people use every day. Three things that takes, and how far I’ve got on each." The panel is its own section with the standard gap above and below.
  *Open:* this edits approved copy; Elias to confirm or supply his own line.
- **E-11 Colour as light only where there is dark.** In the light theme project and employer panels cast no coloured shadow. In the dark theme each project panel has a soft glow in its own colour.
- **E-12 How I work reads in three steps.** Each card is the habit (serif, above the blue rule), the story (muted, with the proof phrase highlighted, not underlined, so it cannot be mistaken for a link), and the proof as a drawing in a tinted foot: the two projects, "57" with 57 ticks, a switch that is off, "+15%" with its bar. Cards are upright; the two-line and one-line headings share one rule height.
- **E-13 One set of controls.** Solid pill, outline pill and page button share one height (44 px), radius, type and press state; arrows move 4 px on hover for fine pointers. Text links underline the words, not the arrow. Project rows highlight as a whole row. The header has a theme button (follows the system until pressed) and, under 720 px, a Menu button that opens the five section links. Radii: 28 px panels, 16 px cards and figures inside them, full for pills.
- **E-14 Every page uses the same parts.** 
  - *Role story:* employer as the title, role, dates and setting, the summary as the lede, the story's evidence figures, and that employer's pass hanging at the right. Sections are a heading at the left and the text at the right; points are a serif lead and a muted line. Figures reuse the homepage's parts in the employer's colour (the flag as two lanes with a switch, the comparisons to scale, the certificate). The page ends on the next role as a panel in that employer's colour.
  - *Case study:* a panel in the project's colour with the title, description, stack, live and code links, evidence figures and the screenshot. The same section layout; the PRD line is a paper card with the blue rule; the page ends on the next project.
  - *Archive:* the six projects as panels, the three with case studies in their colours, the rest on paper.
  Section numbers and "Summary" as a heading are not used.

Checked: `index`, `bnp`, `threshold` and `things` at 1024, 768, 390 and 320 px wide, and the homepage at 1440: no horizontal overflow, no script errors. Light and dark first screens captured. Not checked: real iPhone or Safari, motion at real speed, keyboard and screen reader, forced colours, dark below the first screen, the Joveen and Optegra role stories, the Argus Risk and Flowtime case studies, the résumé and the 404.

### Direction E, third pass (11 November 2026)

Elias accepted the direction ("very happy with the design and direction"; remaining polish belongs to implementation) and asked for three changes, all made in the prototype. Captures: `shots/e3-*.jpg`.

- **E-15 The clip goes through the pass.** The hook's two legs cross the strip above the slot, enter the slot and end at its lower edge, so the loop reads as passing behind the card. (Refines E-07.)
- **E-16 Off the clock follows the theme.** The panel is paper with ink in the light theme and the dark surface in the dark theme; the contribution grid has a light and a dark ramp. (Supersedes ST-05's fixed dark panel.)
- **E-17 The header keeps the greeting.** Beside the name, the existing time-of-day line by the visitor's own clock ("Kettle’s on.", "Nearly five?" or "Nowhere to be?", "Home yet?", "Still up?", and "Hello" before script runs); on hover or focus on a fine pointer it gives London's time ("it’s 23:51 here in London"). Copy and hour boundaries are the current site's (`src/content/stretch/greeting.ts`). Hidden under 400 px.
