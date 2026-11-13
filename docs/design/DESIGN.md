# DESIGN.md: passes and panels

The design contract for all of eliasb.dev: the homepage, the shell (header and theme), the Role stories, the Case studies, the Work archive, the Résumé and the 404. It is the only live design reference. When this file and anything else disagree, this file wins.

> **Being built.** Elias approved this direction on 11 November 2026. Until the redesign's tickets ([#409](https://github.com/3ixas/eliasb.dev/issues/409)) land, `main` still runs the quiet index, and a part that has not been replaced yet follows `history/QUIET-INDEX.md` and its gates. Each ticket that replaces a part removes this caveat for that part. Built so far: the tokens and type (#410), in `src/app/tokens.css`, beside the quiet index's; the panel, the controls and the arrival motions (#423), in `src/app/parts.css`; the shell (#411): the page colour, the header with Menu and the theme control, and Say hello on every page, in `src/app/shell.css`.

**Keeping it current.** A tweak edits this file in place, in the same pull request as the change. A new direction first copies this file into `history/` with a superseded note at the top, then rewrites it. The directions it replaced are in `history/`: the quiet index (`QUIET-INDEX.md`), the Stretch direction (`STRETCH.md`), the Board (`BOARD.md`) and the Cabinet of Curiosities (`SELECTED-DIRECTION.md`).

The build spec, with acceptance criteria and the order of work, is `docs/specs/PASSES-AND-PANELS-SPEC.md` (requirements `R-01` to `R-40`). How the direction was reached is in `docs/specs/CRAFT-ELEVATION-SPEC.md`. The visual reference is the prototype in `docs/review/2026-11-11-direction-e/` (`index.html`, `bnp.html`, `joveen.html`, `threshold.html`, `things.html`, `404.html`, `resume.html`, and `parts.html` for the states and parts those pages do not show, with `style.css` holding every value below). What each part replaces in the code is in `docs/specs/PASSES-AND-PANELS-CODE-MAP.md`. Where the prototype and this file disagree, this file wins. Terms follow `GLOSSARY.md`; approved copy is in `docs/content/redesign-copy.md`.

## Principle

The work is the design. The first screen is the opening line and my three employers' **Staff passes**, drawn as real ID cards. After it, each subject has a **panel** sized by how much it matters, in its own colour, with its proof drawn on it.

## The four rules

A change that breaks one needs Elias's decision, not a judgement in review.

1. **Rank by importance, never by duration.** BNP Paribas is first and largest wherever employers appear.
2. **Proof is visible without a click.** Nothing a visitor needs is behind a hover or a tap. Hover adds feedback, never content.
3. **Text earns its place.** No eyebrows, kickers, series letters, figure numbers or helper text. A heading; a subheading only where it says something the heading does not. If text isn't needed, it isn't there.
4. **Motion has a job.** A value arriving, a thing settling, a control answering. Nothing loops. Reduced motion shows the end state.

## Layout

- **The page**: `max-width: 1344px`, centred, with 32 px gutters (16 px under 720 px).
- **Sections**: 144 px apart (96 px under 720 px). Each opens with its title; Work alone has a subheading.
- **Panels in a section**: 16 px apart. Two panels side by side stack under 720 px.
- **Breakpoints**: 1260 px (the opening and wide panels stack), 900 px (the passes scroll sideways), 720 px (phone).
- **Length**: the homepage stays within 8 screens at 1440 × 900 and 11 at 390 × 844. Something new takes the place of something else. A long-form page has no budget.

## The panel

| Part | Spec |
|---|---|
| Shape | 28 px radius (22 px under 720 px); a 1 px lighter top edge inside; contents clipped |
| Field and ink | The subject's own colour and its ink, or paper and ink for a panel that follows the theme |
| Header | The name at the left (`clamp(30px, 3vw, 42px)`, Newsreader); role and dates at the right in 14.5 px, two lines, where there are any |
| Padding | 40 to 44 px (26 × 22 px under 720 px) |
| Inside | Cards, figures and tiles take a 16 px radius; images 12 px; pills are fully round |
| Depth | None in light. In dark a project panel glows in its own colour (`0 50px 90px -56px`, the field at 70%) |

Pass furniture ("Valid · present", "Returned", a barcode) never appears on a panel.

**Text on a coloured panel is the panel's ink at full strength.** Dimmed text is allowed only where it still measures AA: on the dark fields (Joveen, Optegra, Flowtime) and on paper. BNP Paribas's panel lifts from `#2cbd86` at its top left to its field `#00965e` and is never darker than the field.

## The staff pass

A printed card hanging from a lanyard. It is an object, so it keeps its printed colours in both themes; its card stock is a step darker in dark.

- **Card**: CR80 proportion (14.5 : 23), 0.8 em radius, white stock, a hairline edge, a 1.5 px lower edge for thickness, and two soft shadows. Sizes inside it are in em of the card's width ÷ 14.5.
- **Lanyard**: two plies of woven ribbon in the employer's colour, 1 em wide, opening upward at 4.5° each way and running out of view at the top.
- **Clip**: a metal crimp, a swivel and a loop. The loop's two legs cross the strip above the slot, enter the slot and end at its lower edge, so it passes behind the card.
- **Print, top to bottom**: a header band in the employer's colour with the employer's name in Newsreader 500; the white-tux portrait (`public/profile/elias-evening.webp`; colour on the current pass, greyscale on a returned one); "Elias Bennett", the role, the dates; three points, each a Newsreader lead over an Instrument Sans detail, ruled apart; the status and a barcode. The current pass has a hologram beside "Valid · present"; a returned pass says "Returned".
- **Points**: BNP Paribas: Winner (Digitisation competition, 2025), Take Ownership (Award, Q1 2026), AI workflow (Used by several teams). Joveen: −40% (Page load), 520 → 230 ms (Key API p95), +30% (Mobile retention). Optegra: 62 → 88% (Core Web Vitals pass rate), −30% (p95 page load), +15% (Consultation conversion). Every point is a fact its Role story tells.
- **Size and order**: BNP Paribas first, 264 px wide, hanging lowest; Joveen and Optegra 248 px. Every text on a pass is at least 13 px.
- **Where**: three in the homepage's opening, each linking to its panel in Work; one at the top of each Role story, not a link.
- **Accessible name**: the pass's whole content as a sentence; the drawing itself is hidden from assistive technology.

## Controls

One set on every page.

| Control | Spec |
|---|---|
| Solid pill | On a panel. 44 px tall, 20 px side padding, Instrument Sans 15 px / 500. Fill is the panel's ink, text is its field |
| Outline pill | On a panel. The same, with a 1 px outline; a 10% fill of the ink on hover |
| Button | On the page. The same shape with a 1 px ink outline; fills with ink on hover. Copy keeps one width when it says "Copied" |
| Text link | Newsreader 19 px. The words are underlined in hair, turning ink on hover; the arrow is not underlined |
| Row | The other projects and the 404's suggestions: name, line and metadata on a hairline; the whole row takes the tint on hover |
| Chip | 13 px / 500 to 600 in a round outline: a stack item, or a source in its colour |
| Theme control | A 36 px round button in the header |
| Menu | Under 900 px: a 36 px outline button that opens the section links as a list beneath the header |

- **Hover** applies only to a hovering fine pointer. Arrows move 4 px.
- **Press**: 0.97 scale over 150 ms. Reduced motion drops the scale.
- **Feedback**: every control answers in 100 to 250 ms on `--out` and reverses from where it has reached.
- **Focus**: one ring, 2 px cobalt at 3 px offset. On a coloured panel it takes the panel's ink.
- **Targets** are at least 44 px, except links inside running text.

## The header (every page)

The name in Newsreader 500 at 20 px, a link to the homepage; the greeting; the five section links (Work, Things I make, How I work, Off the clock, Say hello) in a navigation landmark named "On this page"; and the theme control. It sits over a 1 px ink rule and is 64 px tall. It is not sticky. On an inner page the links go to the homepage's sections. Under 900 px, where the full row no longer fits, the links are behind Menu; Escape or choosing one closes it. Without script the links show.

**The greeting** is the existing one, whole: "Hello" before the clock is read and without script, then by the visitor's own time "Kettle’s on." (from 05:00), "Nearly five?" on a weekday or "Nowhere to be?" at the weekend (from 12:00), "Home yet?" (from 17:00), "Still up?" (from 22:00), with its small scene. Hover or focus adds "it’s HH:MM here in London". Its width is reserved for the longest line. It hides under 400 px.

## The homepage, in order

1. **Header.**
2. **The opening**, one screen tall (`min(100svh − header, 900px)`): the opening line as the `h1`, "I build pricing and risk engines at BNP Paribas, and products of my own.", with a green underline on "BNP Paribas" and "products of my own." in cobalt; the supporting line in Newsreader 20 px, muted; and the three Staff passes hanging from the header's rule at the right. Under 1260 px the text is above the passes, which hang from a hairline. Nothing of Work shows before a scroll at 1440 × 900 or 1280 × 720.
3. **Work**: the title, and the subheading "History, then marketing, then code. Each move was towards the work I liked most."
   - **BNP Paribas**, full width, green. In reading order: "Six months", "from zero C# to production code"; the simulation; two comparisons to scale under a rule; "The BNP Paribas story →".
   - **Joveen** and **Optegra**, side by side: a display figure and its label, three before and after pairs, the link to the story.
4. **Where I'm headed**: one paper panel. The title and lead at the left; three parts at the right, each from a chip naming its source (Optegra, BNP Paribas, Threshold).
5. **Things I make**: Threshold wide; Argus Risk and Flowtime side by side; the other projects as rows, newest first, at most ten; the link to the Work archive with the true count.
6. **How I work**: four cards, then the link to Threshold's PRD.
7. **Off the clock**: one paper panel in three bands. Three cells: the training week and today's session, the book, the film. Then this week in history, full width: the image, its title, the year and the fact, and an outline pill ("1 of 3") that steps to the next oddity in place. Then the GitHub year: the total, with "Now making" and the latest repository beneath it, beside the grid. A stale feed says "From Goodreads, as of 2 Nov"; a feed that is down shows its authored fallback, and the panel keeps its shape.
8. **Say hello**, which ends every page.

Anchors stay `#work`, `#things-i-make`, `#how-i-work`, `#off-the-clock` and `#say-hello`.

## Figures

- **Display figure**: Newsreader 500, `clamp(88px, 9.6vw, 140px)`, lining tabular figures, with its label in Newsreader 20 px beneath. One per panel. BNP Paribas's is words ("Six months") at `clamp(64px, 7vw, 104px)`.
- **Bars to scale**: a pair of bars from one left edge. The before bar is thin and soft; the after bar is thicker and solid (white on BNP Paribas's green, the panel's ink elsewhere, cobalt on paper). Both sides are named ("An experienced engineer", "Me, new to it"; "Before", "After") and the values are written out. Lengths are in proportion to the content's own amounts.
- **The simulation**: illustrative simulated paths from "Today" to "Horizon" on hairline axes, a histogram of their endpoints on the right edge, and a dashed white line at their mean labelled "One price". It says it is illustrative in its accessible description. It appears only on the BNP Paribas panel.
- **The flag** (BNP Paribas's Role story): two lanes, the live path as a solid white line and the new path as a dashed one behind a switch that is off, "off by default".
- **Screenshots**: 12 px radius inside a panel, bleeding off its lower or right edge; 16 px with a hairline edge in a long-form column. In a long-form column a screenshot is also a button that opens it large in a dialog.
- **Evidence figures**: a value in Newsreader 500 at 46 px over its label in 14 px.

## How I work's cards

Four across (two under 1260 px, one under 720 px), upright, on paper with a hairline edge and a 16 px radius. Each reads in three steps: the habit in Newsreader 500 at 26 px above a 2 px cobalt rule, the rule at one height on every card; the story in 15.5 px muted text with its proof phrase highlighted by a cobalt tint (never an underline, which reads as a link); and the proof drawn in a 76 px foot tinted with cobalt at 8%: the two projects as coloured dots, "57" with 57 ticks, a switch that is off, "+15%" with its bar.

## Long-form pages: Role stories and case studies

- **A Role story's opening**: "← Work"; the employer as the `h1` (`clamp(52px, 7vw, 104px)`); role, dates and setting on one muted line; the summary as the lede (`clamp(20px, 1.8vw, 25px)`); the evidence figures; and the employer's Staff pass hanging at the right (below the text under 1260 px).
- **A case study's opening**: a panel in the project's colour holding "← Things I make", the title, the description, the stack as chips, Live site and Code as pills, the evidence figures and the landing screenshot.
- **Sections**: the heading at the left (4 of 12 columns, `clamp(28px, 2.7vw, 40px)`) and the text at the right, at most 760 px wide, with a hairline and 64 px between sections. Paragraphs are Newsreader 20 px at line height 1.5. Points are a Newsreader 500 lead at 23 px over a muted 16.5 px line, with hairlines between. Under 720 px the heading sits above the text. No section numbers, and no "Summary" heading.
- **Figures** sit in the text column with a 14 px muted caption. A Role story's flag and comparisons are on a panel in the employer's colour.
- **The PRD** is a paper card with a 2 px cobalt rule on top: the quote in Newsreader at `clamp(22px, 2.2vw, 30px)`, and its source and date beneath.
- **Ending**: the next role or project as a panel in its own colour ("Next role" or "Next project" with its line at the left, the name large at the right), then Say hello.

## The Work archive

`/things-i-make`: the `h1` and its note, then every project as a panel, three across (two under 1260 px, one under 720 px). The three with case studies take their colours; the others are on paper and link out. Filters (Products, Systems, Experiments) appear once there are more than ten projects, as outline pills.

## The Résumé

The sheet is unchanged: it is what prints and what `public/Elias-Bennett-Resume.pdf` holds, so `verify:resume` and the committed PDF stay valid. The page around it takes the header, the page colour and Say hello. Download PDF is the Button and sits on the sheet's edge.

## The 404

The `h1`, "This page doesn’t exist.", and its line. The address asked for, struck through, with "Not on file" and "404". Then "Try one of these" and the five homepage sections as rows, with the copy deck's lines.

## Say hello

Under a 1 px ink rule: the title; the email in Newsreader 300 at `clamp(28px, 5vw, 72px)` with a cobalt underline, and Copy; then Résumé, GitHub and LinkedIn in Newsreader 21 px. If the browser refuses the clipboard, Copy selects the address. No page has any other footer.

## Share cards

One template: the page's own words at the top and "ELIAS BENNETT" at the foot, on 1200 × 630 with the same margins everywhere, in Newsreader. The homepage's card, and any page without its own, says the opening line on the page colour with "products of my own." in cobalt. A Role story's and a case study's take the employer's or project's field and ink. The Résumé sheet is never drawn on a card.

## Tokens

Dark follows the device unless a visitor has chosen. Once script runs, the theme controller decides and a change crossfades.

| Token | Light | Dark | Role |
|---|---|---|---|
| page | `#eeede9` | `#0d0d0f` | Page background |
| paper | `#fbfbf9` | `#19191c` | Panels and cards that follow the theme |
| ink | `#141416` | `#f0efeb` | Text |
| muted | `#5f5e5a` | `#a3a29c` | Secondary text |
| hair | ink at 14% | ink at 16% | Hairlines and outlines (not text) |
| tint | ink at 5% | ink at 7% | Hover fills |
| cobalt | `#2443d6` | `#8c9eff` | The accent |
| green | `#00965e` | `#3ecf8e` | BNP Paribas's green as a mark on the page |
| GitHub year, 0 to 4 | tint, `#a8e6c4`, `#5fcf98`, `#1fae70`, `#00804f` | tint, `#1e5c42`, `#23845a`, `#2fb078`, `#46d996` | Contribution levels |

**Employer fields** (field, ink): BNP Paribas `#00965e`, `#04140d`; Joveen `#0b0b0c`, `#f4f4f2`; Optegra `#006765`, `#f0fbf9`. **Project fields**: Threshold `#c58f5e`, `#1a1714`; Argus Risk `#4f86f7`, `#060a14`; Flowtime `#2a211b`, `#ece4d8`. They are data on each Role story and project, and a coloured panel keeps its field in both themes. Lanyards: BNP Paribas `#0b6b47`, Joveen `#2b2b2d`, Optegra `#00aa90`.

Every text pair passes WCAG 2.2 AA, measured on the rendered page and on every panel field.

## Colour rules

- **Cobalt** marks "products of my own.", the email's underline, focus, the habit cards' rule, highlight and proof, and the after side of a comparison on paper.
- **Green** on the page is only the underline on "BNP Paribas". BNP Paribas's panel and pass carry it as their field.
- **Employer and project colours** are whole panels, pass bands, lanyards and source chips. They are never text on the page.
- **GitHub's greens** appear only on the GitHub year.
- **Colour never carries meaning alone**: a bar has its value written, a level has a text alternative, a source chip has its name.

## Type

- **Newsreader** (variable, optical size on) for the opening line, titles, figures, ledes, prose and the email. **Instrument Sans** for interface text, labels, captions and the stories on the habit cards. Both self-hosted through `next/font`, with fallback faces scaled to their measured widths. Only the Résumé sheet keeps JetBrains Mono.
- **Scale**: opening line `clamp(36px, 3.7vw, 54px)` at line height 1.05 and −0.028 em; page titles `clamp(52px, 7vw, 104px)`; section titles `clamp(36px, 3.6vw, 52px)`; panel titles `clamp(30px, 3vw, 42px)`; prose 20 px; interface 15 to 16 px; small text 13 to 14.5 px.
- **One floor.** Nothing a visitor reads is smaller than 13 px, on the page or printed on a pass.
- **Figures** are lining and tabular wherever they are compared or count up.
- **No italics for emphasis and no uppercase display.** Emphasis is colour (the opening line) or the highlight (a habit's proof).
- **Lines of parts** (a role and its dates) wrap between parts; a dot never starts or ends a line.

## Motion

- **Easings**: `--out: cubic-bezier(.22, 1, .36, 1)` for things that settle, `--spring: cubic-bezier(.3, 1.5, .4, 1)` for things that swing.
- **Passes** swing to rest once on arrival (1.8 s, each 80 ms after the last). On hover a pass leans the other way, catches the light where the pointer is, and its hologram turns.
- **Panels and cards** rise 16 px and fade in once, when 15% in view.
- **Display figures** count to their value once, over 1.2 s.
- **Bars** grow from the left once, the after bar 300 ms behind the before.
- **The simulation**: the paths draw over about 1.1 s, the histogram grows, the price line appears last. It is drawn when it comes into view, never before first paint.
- **Screenshots** in a project panel lift 10 px on hover.
- **Theme changes** crossfade over 0.3 s.
- **Reduced motion** shows every end state at once: nothing swings, rises, counts or draws, and theme changes are instant. Content never waits for motion.

## Craft bar

What holds the finish in place. Each rule is checked by a gate, or by hand where feel is the point.

- **Layout shift**: at most 0.01 over a first visit, scrolled to the bottom and back, on the homepage, BNP Paribas and Threshold, at 390 and 1440 px.
- **JavaScript size**: a route fails `check:built` when its gzipped scripts grow more than 10% over `scripts/js-budget.json`.
- **Spacing, type, feedback, press and focus** are the values in this file; `verify:craft` and `verify:type-scale` read the CSS for them.
- **The component checkpoint**: each shared part is the same on every route, in both themes, at 390 and 1440 px, across its variants, hover, press, focus and keyboard use.
- **States**: every fallback, slow and fast loading, the 404 and the clipboard refusal are complete, and none flashes an indicator.
- **Worst-case data** goes through the real boundaries and is kept as a fixture.
- **A real iPhone** at each sign-off, or the Simulator recorded as a limit.
- **Motion specs pause and seek.** They never wait out a transition's length.

## Accessibility

- **One `h1` per page**: the opening line on the homepage, the title elsewhere. Section titles are `h2`; an employer or project name inside a section is `h3`.
- **Every drawing has its content as text.** A pass's accessible name is its print. A bar pair's values are written beside it. The simulation has an accessible description.
- **Keyboard**: everything that can be pressed is reachable in reading order, and focus is always visible. Menu closes on Escape and returns focus to its button.
- **Forced colours** keep the data and the drawings: bars take the text colour (before) and the highlight (after), the GitHub year keeps its five levels with a hairline on each cell, and passes keep the colours they were drawn in.
- **Reduced motion**: see Motion.
- **The standing checks** hold: the skip link, content in the server HTML and complete without script, axe, AA contrast, 3:1 focus rings, external links marked `↗` that open in a new tab, the theme rules, and each page's title, description and social image.
- **Overflow**: nothing scrolls sideways from 320 to 1440 px except the pass rail and the GitHub year on a phone, which scroll inside themselves. No state widens the page. 200% zoom holds.

## What this design avoids

Found in the lens passes and in the three rounds of concepts behind this direction. Each was built, looked at and removed.

- Eyebrows, kickers, series letters, "Fig. 1" numbering and helper text under headings.
- A panel that repeats what its heading says.
- Ranking by length of service.
- Proof behind a hover.
- Italic or coloured emphasis inside headings beyond the opening line's two marks.
- Underlines on text that is not a link.
- Decorative glows, gradients and shadows in the light theme.
- Tilted cards and ruled-paper textures as decoration.
- Display type so large it becomes the subject (the giant "Only").
- A job title where the work can be described ("AI Champion", "Product engineer").
- Charts with no labels.
- Brutalist full-bleed colour fields and fitted, viewport-wide type.

## What retires

From the quiet index, with its code, tokens, specs and baselines, each in the ticket that replaces it:

- the row, the 44 px objects and the mini pass
- closer looks, the margin, the inline fold and the dotted reveal words
- the header portrait and its closer look
- the pen, the calendar tiles, the shelf, the ticket and the clipping
- enamel Pass pins and their glyphs
- the phone carousel of featured projects
- the removal rule, the two-width rule and the four-screen length budget
- Bricolage Grotesque, DM Mono and the Fine cut

## Decided in review

Elias agreed these between 10 and 12 November 2026, across three rounds of prototypes:

1. **None of the six concepts alone.** C1 to C3 and D1 to D3 were explored and not taken; this direction combines what he kept from D1 (the opening and the passes), D2 (a panel per subject) and D3 (colour as light, in dark only).
2. **BNP Paribas leads**, and nothing is ranked by how long it lasted.
3. **The opening is its own screen**, with the Work section starting below it under its own heading.
4. **Passes are realistic**, with the points printed on the card and no pins on the lanyard.
5. **The BNP Paribas panel is calm**: one figure, one chart, two comparisons.
6. **"Where I'm headed" names no job title.**
7. **Off the clock follows the theme.**
8. **The header keeps the time-of-day greeting.**

9. **The portrait on the passes is the white-tux photo** (`public/profile/elias-evening.webp`).
10. **History steps on a tap**, at every width; there is no swipe.
11. **Section notes go**, except Work's, which is its subheading.
12. **"Where I'm headed" leads with** "I’m working towards the judgement, depth and range to be trusted with what to build, building it well and getting it used. Here’s how far I’ve got on each."
