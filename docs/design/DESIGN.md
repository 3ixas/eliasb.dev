# DESIGN.md: the quiet index

The design contract for all of eliasb.dev: the homepage, the shell (header and theme), the Case studies, the Role stories, the Work archive, the Résumé and the 404. It is the only live design reference. When this file and anything else disagree, this file wins.

**Keeping it current.** A tweak edits this file in place, in the same pull request as the change. A new direction first copies this file into `history/` with a superseded note at the top, then rewrites it. The directions it replaced are in `history/`: the Stretch direction (`STRETCH.md`), the Board (`BOARD.md`) and the Cabinet of Curiosities (`SELECTED-DIRECTION.md`).

The decisions are on [Map: a refined foundation with moments of character](https://github.com/3ixas/eliasb.dev/issues/276):
- [What the current contract and tests lock in](https://github.com/3ixas/eliasb.dev/issues/277)
- [Three directions on real content](https://github.com/3ixas/eliasb.dev/issues/278)
- [What stays on the homepage, and the one signature object](https://github.com/3ixas/eliasb.dev/issues/279)
- [The Signature entrance under a composed-first bar](https://github.com/3ixas/eliasb.dev/issues/280)
- [A copy pass in Elias's voice](https://github.com/3ixas/eliasb.dev/issues/281)
- [The quiet index design contract, with its removal rule](https://github.com/3ixas/eliasb.dev/issues/282)
- [The inner pages in the quiet index's language](https://github.com/3ixas/eliasb.dev/issues/301)
- [Closer looks on phones: the dock, or inline under the row](https://github.com/3ixas/eliasb.dev/issues/302)
- [Object illustrations that look finished](https://github.com/3ixas/eliasb.dev/issues/285)

The visual references are the agreed prototypes, kept outside the repo: the homepage at `~/.agents/handoffs/eliasb.dev/2026-10-26-quiet-index-prototype/` (`sketch/m.html`, `sketch/tap.html` for phones, and `sketch/finish.html` for how every object is finished), the Staff pass at `~/.agents/handoffs/eliasb.dev/2026-10-26-objects-prototype/` (`sketch/pass.html?o=b`), and the inner pages at `~/.agents/handoffs/eliasb.dev/2026-10-26-inner-pages-prototype/` (`sketch/role.html`, `sketch/case.html` and `sketch/404.html`, and `sketch/role-tap.html` for phones). Where a prototype and this file disagree, this file wins. Terms follow `GLOSSARY.md`; approved copy is in `docs/content/redesign-copy.md`.

## Principle

Simplicity and focus are the foundation; character is what you find when you look closer. Every page is one quiet column. **Anything that names something real can show it**: point at it and a closer look arrives in the margin, moving the way the real thing would; on a phone, tap it and the closer look opens in place. Nothing else moves, and nothing appears unasked.

## The removal rule

The Stretch homepage grew by addition: every pass added a well-made object, and none took one away. These rules stop that happening again. A change that breaks one needs a decision on the map, not a judgement in review.

1. **Everything is a row.** A row has a 44 px object, a title, one line, and optional quiet metadata. The only things that aren't rows are the opening line, the GitHub year and Say hello's email.
2. **A new object earns a place in two ways only**: as a row's object, drawn for the 44 px slot, or as a row's closer look. No new section-level set pieces, cards, Fasteners, tilts, posters or rails.
3. **Motion must mean something.** It is allowed for a closer look, for a reaction of something real, for feedback on a control, and for the three arrival reactions. Nothing loops on screen, apart from a reveal that is itself showing work happening (the cores).
4. **There are two widths.** The 600 px reading column and the 300 px margin. Nothing spans them.
5. **The homepage has a length budget.** It stays within 4 screens at 1440 × 900 and 5 screens at 390 × 844 with nothing open (measured: 3.8 and 4.8). Something new pushes something else into a closer look or off the homepage. A long-form page has no budget: its length is the story.
6. **Detail goes behind, not beside.** A fact that doesn't need to be read on arrival moves into a closer look or onto its own page. It doesn't get its own block on the homepage.
7. **Proof is inline; names are behind.** On a long-form page, a figure the paragraph argues from (a screenshot of the work, a to-scale comparison, the PRD) sits inline at column width. A real thing the sentence only names (a certificate, the cores behind "CPU and GPU", a site as it is today) is a closer look on that word. Neither sits beside the column.

## Layout

- **The column**: `min(100% − 40px, 600px)`, centred, with 96 px above the header on desktop and 32 px on phones.
- **Sections**: 80 px apart (64 px on phones). Each has a title at 17 px, weight 650, and a note at 15 px muted directly beneath. There are no giant headings and no mono counts in headings.
- **Lists**: rows 2 px apart. A list sits 18 px below its note and extends 12 px into the gutter on each side, so a row's hover fill lines up with the text column.

## The row

| Part | Spec |
|---|---|
| Grid | `44px` object · `1fr` text · `auto` metadata; 16 px gaps; at least 68 px tall; 10 × 12 px padding; 14 px radius |
| Title | 17 px, weight 600, line height 1.35 |
| Line | 15 px, muted, line height 1.45 |
| Metadata | 13 px mono, muted (a year, a source). Hidden on phones |
| Hover / focus | Card fill (`--stretch-card`), and an arrow that appears beside the metadata (opacity and 4 px travel) and turns cobalt. A 2 px cobalt focus ring inside the row |
| States | A link row goes to its page. A plain row (History at uni, a habit, a strand) is focusable only if it has a closer look. On phones a link row with a closer look has two targets: its object opens the closer look, the rest of the row opens the page |

Every row's text starts at the same edge down the whole page; that alignment is what makes the page read as one list.

## Objects

An object is drawn to be read at 44 px. It is never a whole page shrunk down.

| Object | Where | What it is |
|---|---|---|
| Project | Things I make | One legible detail of the project's own screenshot (Threshold's serif "Th", Argus Risk's donut, Flowtime's timer, Home Secretary's button, Risk Event Tracker's method badges, Ask Professor Past's portrait), on its **Project colour**, 11 px radius. The crop is data on the project: focal point and zoom |
| Mini pass | Work | A 28 × 38 **Staff pass**, portrait, on a short strap and metal clip in its **Employer colour**: a punched slot, the photo, two lines and a barcode. It carries no marks of its own: its **Pass pins** belong to its closer look |
| Cover | Off the clock | The real book cover or film poster, 30 × 44, with a spine crease and shadow |
| Calendar tile | Training, history, History at uni | A desk-calendar tile: a band with two binding holes, and a number on paper. The band is cobalt for today. It turns over to a second face (the year, the week) as a reaction |
| Thread | Where I'm headed | A 4 px line in the colour of the strand's source |
| Number | How I work | The habit's number, ringed by the pen (below) |
| Sheet | Threshold's PRD; Say hello and the 404 | A small page of ruled lines with a folded corner |
| Contribution tile | Say hello (GitHub) | A 38 px card holding a five by five contribution calendar in GitHub's own levels; the pattern is authored, not data. No logo is drawn |
| Name card | Say hello (LinkedIn) | A 40 by 28 px business card: a cobalt portrait dot and two printed lines. No logo is drawn |
| Brackets | Now making | Code brackets in ink with a cobalt slash; the live dot is left to "Live from GitHub" |
| Empty slot | The 404's missing row | A dashed 44 px outline with nothing in it |

## Finish

Decided in [Object illustrations that look finished](https://github.com/3ixas/eliasb.dev/issues/285): objects are **laminated**, not printed flat and not tilting toward the pointer. Character comes from each object being made of its real material; the rows and the page around them stay flat.

- **One light, from above.** A highlight on an object's top edge, a contact shadow under it and a soft ambient one beneath that. Only objects have depth.
- **Each object in its real material.** Card for the Staff pass, with a PVC sheen, edge light and a small hologram on the photo's corner. Woven cloth for its strap, with stitched edges, and metal for its swivel clip. Enamel with a gilt rim for **Pass pins**. Glass edges for project crops. Paper for the calendar tile, the sheet and the note (the note keeps its fold crease). Cream card stock for the cinema ticket, with a dotted perforation and notches where it tears. Newsprint with grain for the clipping, whose photo is greyed, and whose stamp is ink on the paper. Cloth and print for the shelf's spines, on a plank. A chip package with its pins for the cores. Graph paper under the simulation.
- **Photographs stay as they are**: no print border.
- **Corners are concentric**: a nested shape's radius is its parent's minus the gap between them.
- **Detail thins as the object shrinks.** At 44 px only the edge light, shadow and one defining detail survive (a spine crease, binding holes, a folded corner, the slot and clip).
- **The Staff pass** has a real ID card's proportions (CR80, 85.6 × 54) and hangs from a punched slot. It carries the employer's name in condensed caps as its wordmark, the photo, the role, the dates, its status ("Valid · present" or "Returned"), its headline figure and a barcode with a real bar rhythm. Every text on it is at least 13 px.
- **Pass pins**: three on every employer's pass. Each is an enamel pin with a glyph, with its label beside it: BNP Paribas's trophy (Winner), key (Take Ownership) and spark (AI Champion); Joveen's gauge (page load), database (key API p95) and phone (mobile retention); Optegra's tick (Core Web Vitals), gauge (p95 page load) and branch (where the switch started). Each enamel colour is as in the prototype.

## Closer looks

A **closer look** is a row's detail: on desktop it appears in the margin, and on phones inline, under the row or paragraph that was tapped. Each kind arrives the way the real thing would. They use only approved copy and real assets.

| Row or word | Closer look | Arrives by |
|---|---|---|
| A project | Its screenshot on its Project colour, then type and year | Sliding in and settling |
| An employer | Its full Staff pass, then that role's three **Pass pins** in the same form for every employer: BNP Paribas's three awards, and Joveen's and Optegra's three best points from the copy deck, then the Résumé lines that explain its figure | Dropping on its strap and swinging to rest; the points pop on; the figure counts up (Optegra 62% → 88%, Joveen's page load cut by 40%) |
| History at uni | A note: University of Essex, Diploma of Higher Education, History, Jul 2021 | Unfolding |
| A Where I'm headed strand | "So far" with its source and proof | Its thread drawing down from the source |
| Threshold's PRD | The quote | Typing itself, with a caret. Typing is time-based and smooth: characters appear on the animation frame at a steady rate (about 45 a second), never one timer per character |
| Today's training | The run photo and the week, today in cobalt | The days filling in one by one, today last |
| The book | The cover pulled from a row of spines, then the title, author and a "Live from Goodreads" line | It starts as a spine in line, is pulled up, widens as its neighbours part, and turns to face you; then the title and author arrive in turn (about 1.4 s) |
| The film | A ticket with the poster, title, date and stars | Arriving, the stars filling in, the stub tearing |
| This week in history | A newspaper clipping with the image, date, fact and credit | Unfolding, then being stamped "This week in history" |
| Now making | The repository and its description (the row says only "Now making" and "Live from GitHub") | The description typing itself |
| Your face (header) | The full white-tux portrait, "Based in London" | Sliding in |
| "pricing and risk engines" | Illustrative simulated paths, one in BNP green, with the Role story's line about simulation-based calculations | The paths fanning out |
| "CPU and GPU" | A CPU with a few cores taking turns and a GPU with many lighting at once, with the line about running the same tests on both | The cores lighting |
| "digitisation competition" | Its award pin, its Résumé line, and two bars: 30–40 min and under 5 | The pin popping on and the bar shrinking |
| "Take Ownership award" | The certificate | Sliding up like a sheet of paper |
| "joveen.com" (Joveen's Role story) | The site as it is today, on Shopify, with the caption saying it isn't Elias's UI | Sliding in and settling |

On a long-form page, the closer looks are the real things its prose names in passing (rule 7). The Role stories' and case studies' own figures are inline, not closer looks.

**Words that can show something** have a dotted underline (muted at 70%, 1.5 px, 5 px offset), which turns cobalt on hover or focus. They are focusable.

**BNP Paribas** in the opening line is the exception: it reacts where it is. It turns BNP green, and a small pass drops below it on its strap. On phones, tapping it plays that reaction only; the BNP Paribas row in Work holds its closer look.

**The history row cycles.** Clicking it, or pressing Enter, swaps in the week's next oddity in place: the clipping restamps and "1 of 3" moves on. Nothing opens or closes. The change is announced politely. On phones the row opens and closes the clipping like any other row, and a tap on the clipping itself swaps in the next oddity; from the keyboard, Right or Down arrow on the open row does the same (it says so in `aria-keyshortcuts`).

### The margin (desktop)

- **When it's used**: on wide screens (from 1180 px) with a hovering pointer. A row or word shows its closer look on pointer enter or focus, and hides it 140 ms after leave or blur.
- **Placement**: 40 px right of the column, 300 px wide. It lines up with the row's top (minus 6 px), but always fits the window: it rises until it sits 16 px above the bottom edge, and never above 16 px from the top. It keeps fitting as images load (`ResizeObserver`) and while the page scrolls.
- **The header's portrait** is the one look that does not sit level with its trigger: the header's links and Eclipse fill the margin's height there, so its look hangs 16 px below the header, on the same edge. On phones it opens under the header's row.
- **Moving between rows**: it glides on the `spring` timing. It takes no pointer events and never covers the column. A closer look has no links; the row is the link.

### Inline (phones and touch)

Decided in [Closer looks on phones: the dock, or inline under the row](https://github.com/3ixas/eliasb.dev/issues/302), with both options built on the prototypes at phone size. It replaces the dock and the reading line.

- **When it's used**: below 1180 px, or without hover.
- **Only when tapped.** Nothing appears as the page scrolls. A plain row's, a cycling row's, a row that leaves the site's or a dotted word's closer look opens when it is tapped anywhere; for a row that links to another page of this site (Work, Things I make, Résumé), only its 44 px object opens the look, and tapping the rest follows the link in one tap.
- **A row that leaves the site opens its look first, and the look is the link.** The book, the film and Now making open their look when the row is tapped; tapping the look opens the book on Goodreads, the film on Letterboxd or the repository on GitHub, in a new tab. Pressing Enter on the row's link still follows it.
- **Where it opens**: under the tapped row, starting on the row's text edge, or under the paragraph that holds the tapped word. It pushes the text below it down. It is the full closer look, as the margin shows it, at up to 300 px wide; there is no compact form.
- **Closing**: tapping the same row, object or word again closes it, and so does tapping the look itself (a look that is a link follows its link instead, and a cycling look steps on). Opening another one closes the first, so only one is ever open. Both opening and closing animate: a look folds back the way it opened, at the same 0.3 s, fading as it goes; with reduced motion it just goes. Tapping elsewhere does nothing. When a closer look above the tapped row closes, the tapped row stays where it was on screen.
- **Nothing extra inside**: no hint and no link. The row is the link.
- **Reactions**: a row's object plays its reaction when it is tapped, never as it scrolls into view.
- **Featured work**: the three featured projects become swipeable cards (82% wide, snapping to the gutter) with their screenshots at a readable size. Tapping a card opens its page; it has no closer look, because the card already shows the work. The other projects stay rows. Markup is one list that changes shape, not two.

## Reactions that aren't closer looks

| Where | Reaction |
|---|---|
| "products of my own." | It draws its cobalt underline once on arrival. On hover, the letters lift in a short wave and the underline scribbles out and back |
| Greeting | A line and a small object for the visitor's own time of day, all drawn for 30 × 22 px: "Hello" (before the clock is read, and without script) a terminal prompt with a blinking cobalt cursor; morning, "Kettle’s on.", a kettle whose steam curls; afternoon, a clock a few minutes short of five whose minute hand ticks up, saying "Nearly five?" on a weekday and "Nowhere to be?" on Saturday and Sunday (the visitor's own day; only the afternoon changes with it); evening, "Home yet?", a desk lamp whose pool of light fades in; late, "Still up?", the moon rocking as the stars come out. Hover or focus plays it and adds "it's HH:MM here in London". On a phone it plays once on arrival, and tapping the greeting plays it again and says London's time beneath, on its own line; tapping it again hides it. The width is reserved for the longest line, so no line moves the header |
| The Eclipse (theme) | The icon turns over when pressed. The page crossfades (see Motion) |
| Rows' objects | Projects lift and tilt 3°, Flowtime's icon counts seconds, passes swing, covers open on their spine, calendar tiles turn over |
| How I work's pen | Rings around the numbers, arrows between habits, and underlines under each proof's strongest phrase draw as they scroll up the screen and un-draw on the way back (CSS scroll-driven animations; drawn when unsupported) |
| GitHub year | The cells fill in and the total counts up when it first comes into view. A day shows its count on hover |
| Live signals | "Live from Goodreads / Letterboxd / GitHub" with a cobalt dot that pulses three times, then rests |
| Say hello | The email copies in place: the button turns cobalt and says "Copied" |

## The arrival

No hold. The page is complete and usable in its first frame, and nothing waits for motion. On every load, the underline draws, the greeting's scene plays, and the GitHub total counts up when it comes into view. The Signature entrance retires ([#280](https://github.com/3ixas/eliasb.dev/issues/280)).

## The header (every page)

One header on every page, in the same place, so following a row never moves it. It has the white-tux portrait as a 40 px circle (it opens the full portrait), "Elias Bennett", the greeting and the Eclipse. The portrait and name lead to the homepage from every other page.

- **Its links are the sections of the page you're on, or none.** On the homepage they are its five sections (Work, Things I make, How I work, Off the clock, Say hello). On a Role story or case study they are that page's own sections, which replaces the numbered section bar. The Work archive, the Résumé and the 404 have no sections, so they have no links.
- **Style**: 15 px, muted, turning ink on hover, and underlined while their section is in view (`aria-current`). They sit in a navigation landmark named "On this page".
- **Width**: on wide screens the header spans the column and the margin (940 px), because a long-form page's section names don't fit in 600 px. Its left edge is the column's.
- **Phones**: no links and no menu, and the greeting moves under the name. A long-form page is read top to bottom, with its back link at the top.

## The homepage, in order

1. **Header**, as above.
2. **The opening line**, as an `h1`: "I build pricing and risk engines at BNP Paribas, and products of my own." It is set in Bricolage at `clamp(34px, 5.4vw, 50px)`, weight 650, line height 1.1, −0.03 em tracking, and it is the loudest thing on the page. The supporting line follows at 17 px, muted.
3. **Work**: BNP Paribas, Joveen, Optegra, then History at uni. Then **Where I'm headed**: its line, and three strand rows (Judgement, Depth, Range).
4. **Things I make**: the three featured projects, the other projects newest first (at most ten), and the link to the Work archive with the true count.
5. **How I work**: four habit rows with the pen (real problem, write it down, safe to undo, measure), then Threshold's PRD.
6. **Off the clock**: today's training, the GitHub year, the book, the film, the history row and Now making.
7. **Say hello**: the line, the email with Copy, then Résumé, GitHub and LinkedIn. The page ends here: **no page has a footer** ("Made by Elias" is retired). Each page ends on its own last content, with 80 to 128 px of room below it.

Anchors stay `#work`, `#things-i-make`, `#how-i-work`, `#off-the-clock` and `#say-hello`, so the redirects, the 404's rows and each Role story's "← Work" keep working.

## Long-form pages: Role stories and case studies

The two share one template. Each is the header, a back link, an opening, then its sections in the column, then one row to the next page. The removal rule holds, with rule 7 for figures; there is no length budget.

- **Back link**: "← Work" on a Role story (to `/#work`), "← Things I make" on a case study (to the Work archive). 15 px, muted.
- **Title**: the page's `h1`, in the opening line's treatment (`clamp(34px, 5.4vw, 50px)`, weight 650). It is the loudest text on the page. A supporting line follows at 17 px, muted, then quiet metadata in 13 px mono.
- **Sections**: a 17 px title (weight 650) and the prose at 17 px, as on the homepage. No numbers, no giant headings, no condensed display type.
- **Figures** (rule 7): inline at column width with a 13 px mono caption beneath. Screenshots sit on their Project colour with a 14 px radius. The to-scale bars and the flag figure are drawn on the card surface (`--stretch-card`). Every figure keeps its alt text.
- **Ending**: one row, under "Next role" or "Next project", with the next page's 44 px object, its name and its one line. The order is unchanged (Role stories newest to oldest; case studies in the Things I make order).

### A Role story's opening

The title (the employer), the role and setting as its line, and the dates. Beside them in the column hangs the employer's full **Staff pass** with its lean and its Pass pins, as the homepage's closer look shows it. On phones the pass falls below the title. On arrival the pass swings to rest once, over a page that is already readable.

### A case study's opening

The title (the project), its outcome as the line, its type, year and stack as metadata, then Live site and Code. Below them, the project's landing screenshot at column width on its Project colour.

### The PRD and evidence

A case study's PRD is one inline **Sheet**: the quote at 19 px, "From the PRD" and its date, then the evidence figures as a quiet line (each value at 17 px, weight 600, its label in 13 px mono). A Role story's evidence figures follow the same pattern beneath its Summary, leaving out what the pass's pins already show.

### Motion on long-form pages

The pass swings to rest once on arrival; the to-scale bars shrink once when they scroll into view; closer looks arrive as on the homepage. Nothing else moves.

## The Work archive

`/things-i-make` is the homepage's Things I make, unabridged: the same rows, objects and closer looks, every project newest first. Its `h1`, "Things I make", takes the opening line's treatment, with its note beneath. The filters (Products, Systems, Experiments) appear once there are more than ten projects. The header has no links.

## The Résumé

The sheet is unchanged: it is what prints and what `public/Elias-Bennett-Resume.pdf` holds, so `verify:resume` and the committed PDF stay valid. The page around it takes the shared header (no links), the desk, and Download PDF above the sheet.

## The 404

The page tells you what didn't work, then what to try.

1. The header, with no links.
2. The `h1`, "This page doesn't exist.", in the opening line's treatment, and its line.
3. **The missing row**: the address asked for, struck through, with an empty dashed slot as its object, "Not on file" as its line and "404" in cobalt as its metadata. It is not a link. The address is shortened in the middle when long, as the lost-property tag did.
4. **"Try one of these"**, a section title with its note, then the five homepage sections as rows, each with its section's own object: the BNP mini pass (Work), Threshold's "Th" (Things I make), the ringed 1 (How I work), today's calendar tile (Off the clock) and the Sheet (Say hello). Their lines come from the copy deck.

The lost-property tag retires.

## Tokens

Defined in `src/app/stretch-tokens.css` as `--stretch-*` variables. Dark follows the device unless a visitor has chosen light. Once script runs, the theme controller decides: it flips `data-lights` after marking the page as changing, so a change of the device setting crossfades like a click; the media query alone applies only when script has not run.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--stretch-page` | `#fbfbf8` | `#0d0d12` | Page background |
| `--stretch-ink` | `#111114` | `#f1f1f4` | Body and heading text |
| `--stretch-muted` | `#5a5a63` | `#a2a2ad` | Secondary text and metadata |
| `--stretch-rule` | `#dcdcd6` | `#2a2a33` | Hairlines and dividers (not text) |
| `--stretch-card` | `#f0f0ea` | `#17171f` | A row's hover fill, figures and raised surfaces |
| `--stretch-cobalt` | `#2340ff` | `#8b9cff` | The Cobalt accent |
| `--stretch-on-cobalt` | `#ffffff` | `#0d0d12` | Text on a cobalt surface |
| `--stretch-tile-edge` | none | `#2a2a33` | Hairline that keeps objects visible in dark |
| `--gh-0` | `#e1e4e8` | `#1f242c` | GitHub year, no contributions. Light is a step darker than GitHub's own, so it shows on the card |
| `--gh-1` … `--gh-4` | `#9be9a8` `#40c463` `#30a14e` `#216e39` | `#0e4429` `#006d32` `#26a641` `#39d353` | GitHub's contribution greens |
| `--sun` | `#e39a2d` | `#f5b84f` | The greeting's amber, and nothing else: the lamp's bulb and pool of light and the clock's pivot. An illustration colour, never an interface colour |

Every text pair passes WCAG 2.2 AA; `e2e/stretch-tokens.spec.ts` measures them on the rendered page. Rules are decorative and are not held to the text ratio. `--stretch-tape`, the Fasteners' tape, retires with them.

**Project colours** are data on each project (field, ink, swatch), for example Threshold `#1a1714` field, `#c08a5a` swatch, `#f2efe9` ink. **Employer colours** are data on each Role story, with a light and a dark pair. Text over either is checked per project and per employer.

## Motion

- **Timing**: `--spring: cubic-bezier(.34, 1.56, .64, 1)` for things that arrive or swing, and `--out: cubic-bezier(.2, .8, .2, 1)` for things that settle.
- **Theme changes** crossfade over 0.3 s with `cubic-bezier(0, 0, 0.38, 0.9)`, or switch instantly with reduced motion.
- **Reduced motion** removes all movement and keeps 0.2 s fades, except theme changes, which are instant. Content never waits for motion.

## Colour rules

- **Cobalt** marks "products of my own", today, now (the live dots, and the slash in Now making's brackets), the way to say hello, focus and a hovered row's arrow. **Pass pins** take their own enamel colours, inside the pass. On the GitHub year it is a ring around today, never a fill, so the greens stay true. Elias's name is no longer cobalt: the opening line leads.
- **Employer and Project colours** appear only inside objects, figures and closer looks (and on BNP Paribas when hovered), on every page. A Role story's pass and a case study's screenshots carry them; the page around them stays neutral, with no coloured opening band. A page's share card keeps its colour.
- **GitHub's greens** appear only on the GitHub year.
- **Colour never carries meaning alone.** A level of the GitHub year has a count on hover and a text alternative; today is marked by a ring as well as colour.

## Type

- **Bricolage Grotesque** (variable `opsz`, `wdth`, `wght`), self-hosted through `next/font`, for everything people read. **JetBrains Mono** for metadata, dates, counts, captions and Print.
- **One floor.** Nothing a visitor is meant to read is smaller than 13 px, on the page or as **Print** on an object (a Staff pass, a Pass pin's label, a credit), closer looks included. Reading text is 15 px or more, and body copy is 17 px. Calendar-tile bands are 13 px.
- **One text scale.** Text under 24 px uses five steps, each a token in `stretch-tokens.css`: `--text-label` 13 px, `--text-small` 15 px, `--text-body` 17 px, `--text-lead` 19 px and `--text-quote` 22 px. A size may move up one step at a wider breakpoint, but never off the scale. `scripts/verify-type-scale.mjs` checks it.
- **Display type** is only the homepage's opening line, each page's `h1` in the same treatment, and the bold figures inside a Staff pass. Section headings are text, not display. Condensed uppercase display retires everywhere except the pass.

## Accessibility

- **A closer look is supplementary.** Anything a closer look says that isn't on the row or on the row's destination page is also the row's accessible description, through visually hidden text referenced by `aria-describedby`. The margin and the inline closer look are themselves `aria-hidden`.
- **Keyboard**: every row and dotted word with a closer look is focusable, and focus shows it as hover does. Escape hides the margin, and focus stays put. The GitHub year keeps today's single tab stop and arrow keys.
- **Reduced motion** shows each closer look with a 0.2 s fade and no arrival motion. The pen is drawn, the underline is drawn, nothing counts or types, and the greeting's scene rests, finished (the steam drawn, the lamp's pool lit, the cursor still).
- **The standing checks** in the "keep" rows of [#277](https://github.com/3ixas/eliasb.dev/issues/277) all hold. That means one `h1` (the opening line), the skip link, content in the server HTML and complete without script, axe, AA contrast, 3:1 focus rings, external links marked `↗` that open in a new tab, the theme rules, and the home title, description and social image.
- **Every page has one `h1`**: the opening line on the homepage, the title elsewhere. Section titles are `h2`.
- **Figures** keep their alt text and captions; a closer look's words are also its word's accessible description.
- **Touch targets** are at least 44 px.
- **Overflow**: nothing scrolls sideways at 320–1440 px, and no state widens the page. The greeting's extra words are desktop-only for that reason.
- **On phones, a row's object is its own button**, a sibling of the row's link, never inside it (a button nested in a link is invalid and confuses screen readers). Its accessible name says what it shows, such as "A closer look at Joveen".

## What retires

These go from the homepage and its checks:
- the hero's display name, tilted portrait and cobalt label
- the Staff-pass rail and its hanging physics on the homepage
- Featured tiles and their tilt, straightening and Fasteners
- the PRD card and the training poster as objects
- giant section headings with mono counts
- the Signature entrance
- the First glance as a hero layout
- the phone menu (the page is short enough to scroll)

The Staff pass, its lean and its Pass pins remain on each Role story.

These go from the inner pages and their checks:
- the subpage header (every page now shares one header)
- the coloured opening band and the 128 px condensed title on Role stories and case studies
- the numbered section bar (the header's links replace it)
- giant section headings
- the PRD card and its separate evidence strip (one inline Sheet replaces them)
- the Next-project tile (a row replaces it)
- the Work archive's 96 px display heading and its side preview
- the 404's display heading, its numbered rows and the lost-property tag
- **Fasteners**, everywhere: tape, paperclips and push pins, with their tokens and hover motion

## Decided in review

Elias agreed these on 26 October 2026, when the draft was reviewed:

1. **The amber stays**, as `--sun`, only in the greeting's illustration (the lamp and the clock, since the sun left).
2. **Navigation**: quiet section links in the desktop header, and no phone menu. The release check's five navigation targets and labels stay.
3. **The simulation gets a caption** saying the paths are illustrative, worded in the copy pass ([#281](https://github.com/3ixas/eliasb.dev/issues/281)).
4. **This file was the contract** for the homepage and shell only, as `QUIET-INDEX.md`. On 26 October 2026 the inner pages joined it ([#301](https://github.com/3ixas/eliasb.dev/issues/301)), and it became `DESIGN.md`, the one contract for the site.

## Still to come

- **Copy for the 404's rows** and the "Try one of these" note, through the copy deck.
- **The build**: the homepage is specified in [Spec: build the quiet index homepage](https://github.com/3ixas/eliasb.dev/issues/288); a follow-on spec covers the inner pages, on the same integration branch. Moving the specs and copy checks across follows the checklist in [#277](https://github.com/3ixas/eliasb.dev/issues/277).

## Exploration record

The options rounds behind the inner pages ([#301](https://github.com/3ixas/eliasb.dev/issues/301)), each drawn on real content in the inner pages prototype:

- Round 1 (Direction): header A homepage links, B this page's sections, C no links. Chose B, because the header stays put and its links are the outline of what you're reading. Six section names don't fit in 600 px, so the header spans column and margin.
- Round 1 (Direction): long-form layout A one column, B sidenotes in the margin, C closer looks only [stretch]. Chose a hybrid, now rule 7: proof inline, names behind. B lost because the margin keeps one job; C lost because evidence shouldn't hide on a page people chose to read.
- Round 1 (Detail): title (a) the opening line's treatment, (b) 128 px condensed display. Chose (a): one loudest-thing rule for the site.
- Round 2 (Design): Role story opening A the pass in the column, B a mini pass with the full pass behind the title, C the title printed on the pass [stretch]. Chose A. B opened on a bare page; C was a section-level set piece and filled a phone's first screen.
- Round 2 (Design): case study opening A the screenshot under the title, B an object with the screenshot behind it, C the screenshot first [stretch]. Chose A, the Role story's shape.
- Round 3 (Design): 404 A rows only, B the missing row, C the lost-property tag as a closer look [stretch]. Chose B with A's "Try one of these" heading, so the page reads: this didn't work, try one of these.

The rounds behind phones ([#302](https://github.com/3ixas/eliasb.dev/issues/302)), with both options built on the homepage and Role story prototypes and compared at 390 × 844:

- Round 1: closer looks in a dock at the bottom of the screen, or inline under the tapped row. Chose inline. On a long page the dock covered the paragraph after the tapped word and competed with Safari's bottom bar; inline sits where the word is and covers nothing. Inline at full size, not the dock's compact form, which made no sense on a screen that is already small.
- Round 1: a link row's tap, (a) twice (first shows, second opens) or (b) the object shows and the rest opens. Chose (b): opening the page is the row's main job, and the closer look is supplementary.
- Round 1: objects reacting at the reading line or only when tapped. Chose tapped only, which retires the reading line.
- Round 2: closing (only the same trigger or another one, not tapping elsewhere, so text doesn't collapse under a thumb), no hint inside, the history row's two targets, and "BNP Paribas" reacting in place only, since its row holds the closer look.

The rounds behind the finish ([#285](https://github.com/3ixas/eliasb.dev/issues/285)), drawn on the three employers' passes and then on every other object:

- Round 1 (Design): the Staff pass A printed (flat, drawn like a real card), B laminated (A plus real material), C physical [stretch] (B plus thickness and a light that follows the pointer as it tilts). Chose B: the passes looked cartoonish because they had no material. A stayed close to clip art; C couldn't work in the margin, which takes no pointer events, and its tilt is decoration under rule 3.
- Round 1: pins as enamel pins with glyphs rather than text labels, on every employer's pass, not only BNP Paribas's. Joveen's and Optegra's are their copy deck points, so nothing new is claimed.
- Round 2: B's vocabulary applied to every other object, side by side with the old drawing. Agreed, without a print border on photographs.
