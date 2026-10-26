# QUIET-INDEX.md: the quiet index

The design reference for the homepage and the site shell (header, theme, footer). It replaces the Stretch homepage. `STRETCH.md` stays in force for the inner pages (Case studies, Role stories, the Work archive, the Résumé and the 404) until they have their own pass, and its tokens carry over unchanged unless this file says otherwise.

The decisions are on [Map: a refined foundation with moments of character](https://github.com/3ixas/eliasb.dev/issues/276):
- [What the current contract and tests lock in](https://github.com/3ixas/eliasb.dev/issues/277)
- [Three directions on real content](https://github.com/3ixas/eliasb.dev/issues/278)
- [What stays on the homepage, and the one signature object](https://github.com/3ixas/eliasb.dev/issues/279)
- [The Signature entrance under a composed-first bar](https://github.com/3ixas/eliasb.dev/issues/280)

The visual reference is the agreed prototype, kept outside the repo at `~/.agents/handoffs/eliasb.dev/2026-10-26-quiet-index-prototype/` (`sketch/m.html`). Where the prototype and this file disagree, this file wins. Terms follow `GLOSSARY.md`; approved copy is in `docs/content/redesign-copy.md`.

## Principle

Simplicity and focus are the foundation; character is what you find when you look closer. The page is one quiet column of rows. **Anything that names something real can show it**: point at it and a closer look arrives in the margin, moving the way the real thing would. Nothing else moves.

## The removal rule

The Stretch homepage grew by addition: every pass added a well-made object, and none took one away. These rules stop that happening again. A change that breaks one needs a decision on the map, not a judgement in review.

1. **Everything is a row.** A row has a 44 px object, a title, one line, and optional quiet metadata. The only things that aren't rows are the opening line, the GitHub year and Say hello's email.
2. **A new object earns a place in two ways only**: as a row's object, drawn for the 44 px slot, or as a row's closer look. No new section-level set pieces, cards, Fasteners, tilts, posters or rails.
3. **Motion must mean something.** It is allowed for a closer look, for a reaction of something real, for feedback on a control, and for the three arrival reactions. Nothing loops on screen, apart from a reveal that is itself showing work happening (the cores).
4. **There are two widths.** The 600 px reading column and the 300 px margin. Nothing spans them.
5. **The page has a length budget.** It stays within 4 screens at 1440 × 900 and 5 screens at 390 × 844 with nothing open (measured: 3.8 and 4.8). Something new pushes something else into a closer look or off the homepage.
6. **Detail goes behind, not beside.** A fact that doesn't need to be read on arrival moves into a closer look or onto its own page. It doesn't get its own block on the homepage.

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
| Metadata | 13 px mono, muted (a year, a source). Hidden on phones, where the whole row is the target |
| Hover / focus | Card fill (`--stretch-card`), and an arrow that appears beside the metadata (opacity and 4 px travel) and turns cobalt. A 2 px cobalt focus ring inside the row |
| States | A link row goes to its page. A plain row (History at uni, a habit, a strand) is focusable only if it has a closer look |

Every row's text starts at the same edge down the whole page; that alignment is what makes the page read as one list.

## Objects

An object is drawn to be read at 44 px. It is never a whole page shrunk down.

| Object | Where | What it is |
|---|---|---|
| Project | Things I make | One legible detail of the project's own screenshot (Threshold's serif "Th", Argus Risk's donut, Flowtime's timer, Home Secretary's button, Risk Event Tracker's method badges, Ask Professor Past's portrait), on its **Project colour**, 11 px radius. The crop is data on the project: focal point and zoom |
| Mini pass | Work | A 30 × 38 **Staff pass** on a short strap in its **Employer colour**. The current pass carries three cobalt dots, one for each award pin |
| Cover | Off the clock | The real book cover or film poster, 30 × 44, with a spine shadow |
| Calendar tile | Training, history, History at uni | A day tile with a band and a number. The band is cobalt for today. It turns over to a second face (the year, the week) as a reaction |
| Thread | Where I'm headed | A 4 px line in the colour of the strand's source |
| Number | How I work | The habit's number, ringed by the pen (below) |
| Sheet | Threshold's PRD | A small page of ruled lines |
| Dot | Now making | The cobalt "now" dot |

## Closer looks

A **closer look** is a row's detail: on desktop it appears in the margin, and on phones in the dock. Each kind arrives the way the real thing would. They use only approved copy and real assets.

| Row or word | Closer look | Arrives by |
|---|---|---|
| A project | Its screenshot on its Project colour, then type and year | Sliding in and settling |
| An employer | Its full Staff pass (BNP Paribas with its three award pins), then the Résumé lines that explain its figure | Dropping on its strap and swinging to rest; the pins pop on; the figure counts up (Optegra 62% → 88%, Joveen 40% faster) |
| History at uni | A note: University of Essex, Diploma of Higher Education, History, July 2021 | Unfolding |
| A Where I'm headed strand | "So far" with its source and proof | Its thread drawing down from the source |
| Threshold's PRD | The quote | Typing itself, with a caret |
| Today's training | The run photo and the week, today in cobalt | The days filling in one by one, today last |
| The book | The cover pulled from a row of spines, then the title, author and a "Live from Goodreads" line | Lifting off the shelf and turning to face you |
| The film | A ticket with the poster, title, date and stars | Arriving, the stars filling in, the stub tearing |
| This week in history | A newspaper clipping with the image, date, fact and credit | Unfolding, then being stamped "This week in history" |
| Now making | The repository and its description | The description typing itself |
| Your face (header) | The full white-tux portrait, "Based in London" | Sliding in |
| "pricing and risk engines" | Illustrative simulated paths, one in BNP green, with the Role story's line about simulation-based calculations | The paths fanning out |
| "CPU and GPU" | A CPU with a few cores taking turns and a GPU with many lighting at once, with the line about running the same tests on both | The cores lighting |
| "Early Careers digitisation competition" | Its award pin, its Résumé line, and two bars: 30–40 min and under 5 | The pin popping on and the bar shrinking |
| "Take Ownership award" | The certificate | Sliding up like a sheet of paper |
| Résumé (Say hello) | The one-page sheet | Sliding up |

**Words that can show something** have a dotted underline (muted at 70%, 1.5 px, 5 px offset), which turns cobalt on hover or focus. They are focusable.

**BNP Paribas** in the opening line is the exception: it reacts where it is. It turns BNP green, and a small pass drops below it on its strap. On phones, tapping it sends BNP's closer look to the dock.

**The history row cycles.** Clicking it, or pressing Enter, swaps in the week's next oddity in place: the clipping restamps and "1 of 3" moves on. Nothing opens or closes. The change is announced politely.

### The margin (desktop)

- **When it's used**: on wide screens (from 1180 px) with a hovering pointer. A row or word shows its closer look on pointer enter or focus, and hides it 140 ms after leave or blur.
- **Placement**: 40 px right of the column, 300 px wide. It lines up with the row's top (minus 6 px), but always fits the window: it rises until it sits 16 px above the bottom edge, and never above 16 px from the top. It keeps fitting as images load (`ResizeObserver`) and while the page scrolls.
- **Moving between rows**: it glides on the `spring` timing. It takes no pointer events and never covers the column. A closer look has no links; the row is the link.

### The dock (phones and touch)

- **When it's used**: below 1180 px, or without hover.
- **The reading line** sits 38% down the screen. The row crossing it takes its focus fill, and its closer look appears in a dock at the bottom of the screen in a compact form: the picture on the left, the words on the right, at most 38% of the screen tall. It clears the safe area, and the page reserves room below its last row.
- **Interaction**: tapping the dock opens the row's page; × hides the dock for the visit. Tapping a dotted word sends its closer look to the dock. No row opens or closes, and nothing in the column moves as the dock changes.
- **Playing once**: each row's object plays its reaction once as it reaches the reading line.
- **Featured work**: the three featured projects become swipeable cards (82% wide, snapping to the gutter) with their screenshots at a readable size. The other projects stay rows. Markup is one list that changes shape, not two.

## Reactions that aren't closer looks

| Where | Reaction |
|---|---|
| "products of my own." | It draws its cobalt underline once on arrival. On hover, the letters lift in a short wave and the underline scribbles out and back |
| Greeting | A small scene for the visitor's own time of day: morning (the sun comes up), afternoon (the rays turn), evening (the sun sets), late (the moon rocks and the stars come out). Hover or focus plays it and adds "it's HH:MM here in London". Phones play it once on arrival, without the extra words |
| The Eclipse (theme) | The icon turns over when pressed. The page crossfade is as in `STRETCH.md` |
| Rows' objects | Projects lift and tilt 3°, Flowtime's icon counts seconds, passes swing, covers open on their spine, calendar tiles turn over |
| How I work's pen | Rings around the numbers, arrows between habits, and underlines under each proof's strongest phrase draw as they scroll up the screen and un-draw on the way back (CSS scroll-driven animations; drawn when unsupported) |
| GitHub year | The cells fill in and the total counts up when it first comes into view. A day shows its count on hover |
| Live signals | "Live from Goodreads / Letterboxd / GitHub" with a cobalt dot that pulses three times, then rests |
| Say hello | The email copies in place: the button turns cobalt and says "Copied" |
| Footer | "Made by Elias" fills with cobalt on hover |

## The arrival

No hold. The page is complete and usable in its first frame, and nothing waits for motion. On every load, the underline draws, the greeting's scene plays, and the GitHub total counts up when it comes into view. The Signature entrance retires ([#280](https://github.com/3ixas/eliasb.dev/issues/280)).

## The homepage, in order

1. **Header**: the white-tux portrait as a 40 px circle (it opens the full portrait), "Elias Bennett", the greeting and the Eclipse. On desktop it also has five quiet section links (Work, Things I make, How I work, Off the clock, Say hello) at 15 px, muted, turning ink on hover and underlined while their section is in view. On phones there are no links and no menu, because the page is under 5 screens, and the greeting moves under the name.
2. **The opening line**, as an `h1`: "I build pricing and risk engines at BNP Paribas, and products of my own." It is set in Bricolage at `clamp(34px, 5.4vw, 50px)`, weight 650, line height 1.1, −0.03 em tracking, and it is the loudest thing on the page. The supporting line follows at 17 px, muted.
3. **Work**: BNP Paribas, Joveen, Optegra, then History at uni. Then **Where I'm headed**: its line, and three strand rows (Judgement, Depth, Range).
4. **Things I make**: the three featured projects, the other projects newest first (at most ten), and the link to the Work archive with the true count.
5. **How I work**: three habit rows with the pen, then Threshold's PRD.
6. **Off the clock**: today's training, the GitHub year, the book, the film, the history row and Now making.
7. **Say hello**: the line, the email with Copy, then Résumé, GitHub and LinkedIn.
8. **Footer**: "Made by Elias".

Anchors stay `#work`, `#things-i-make`, `#how-i-work`, `#off-the-clock` and `#say-hello`, so the redirects, the 404's rows and each Role story's "← Work" keep working.

## Tokens

Every `--stretch-*` token carries over. New:

| Token | Light | Dark | Role |
|---|---|---|---|
| `--gh-0` | `#e1e4e8` | `#1f242c` | GitHub year, no contributions. Light is a step darker than GitHub's own, so it shows on the card |
| `--gh-1` … `--gh-4` | `#9be9a8` `#40c463` `#30a14e` `#216e39` | `#0e4429` `#006d32` `#26a641` `#39d353` | GitHub's contribution greens |
| `--sun` | `#e39a2d` | `#f5b84f` | The greeting's sun, and nothing else: an illustration colour, never an interface colour |

**Timing**: `--spring: cubic-bezier(.34, 1.56, .64, 1)` for things that arrive or swing, and `--out: cubic-bezier(.2, .8, .2, 1)` for things that settle.

## Colour rules

- **Cobalt** marks "products of my own", today, now (the live dots, Now making), the way to say hello, award pins, focus and a hovered row's arrow. On the GitHub year it is a ring around today, never a fill, so the greens stay true. Elias's name is no longer cobalt: the opening line leads.
- **Employer and Project colours** appear only inside objects and closer looks (and on BNP Paribas when hovered). The page stays neutral.
- **GitHub's greens** appear only on the GitHub year.
- **Colour never carries meaning alone.** A level of the GitHub year has a count on hover and a text alternative; today is marked by a ring as well as colour.

## Type

`STRETCH.md`'s rules hold: Bricolage Grotesque and JetBrains Mono, the five text steps (13, 15, 17, 19 and 22 px), and **the 13 px floor everywhere, objects and closer looks included**. Calendar-tile bands are 13 px. Display type is now only the opening line and the bold figures inside a Staff pass; section headings are text, not display.

## Accessibility

- **A closer look is supplementary.** Anything a closer look says that isn't on the row or on the row's destination page is also the row's accessible description, through visually hidden text referenced by `aria-describedby`. The margin and dock themselves are `aria-hidden`.
- **Keyboard**: every row and dotted word with a closer look is focusable, and focus shows it as hover does. Escape hides the margin, and focus stays put. The GitHub year keeps today's single tab stop and arrow keys.
- **Reduced motion** shows each closer look with a 0.2 s fade and no arrival motion. The pen is drawn, the underline is drawn, nothing counts or types, and the greeting's scene rests.
- **The standing checks** in the "keep" rows of [#277](https://github.com/3ixas/eliasb.dev/issues/277) all hold. That means one `h1` (the opening line), the skip link, content in the server HTML and complete without script, axe, AA contrast, 3:1 focus rings, external links marked `↗` that open in a new tab, the theme rules, and the home title, description and social image.
- **Touch targets** are at least 44 px.
- **Overflow**: nothing scrolls sideways at 320–1440 px, and no state widens the page. The greeting's extra words are desktop-only for that reason.
- **The phone dock** stays inside the safe area and never covers the focused row.

## What retires from the homepage

These go from the homepage and its checks:
- the hero's display name, tilted portrait and cobalt label
- the Staff-pass rail and its hanging physics on the homepage
- Featured tiles and their tilt, straightening and Fasteners
- the PRD card and the training poster as objects
- giant section headings with mono counts
- the Signature entrance
- the First glance as a hero layout
- the phone menu (the page is short enough to scroll)

The Staff pass, its lean and its pins remain on each Role story.

## Decided in review

Elias agreed these on 26 October 2026, when the draft was reviewed:

1. **The sun's amber stays**, as `--sun`, only in the greeting's illustration.
2. **Navigation**: quiet section links in the desktop header, and no phone menu. The release check's five navigation targets and labels stay.
3. **The simulation gets a caption** saying the paths are illustrative, worded in the copy pass ([#281](https://github.com/3ixas/eliasb.dev/issues/281)).
4. **This file is the contract** for the homepage and shell, and `STRETCH.md` governs the inner pages until their pass.

## Still to come

- **Copy**: [A copy pass in Elias's voice](https://github.com/3ixas/eliasb.dev/issues/281).
- **The inner pages**, in this language.
- **A real-device check** of the dock (Safari's bars, thumb scrolling).
- **Moving the specs and copy checks across**, and slicing the build. The checklist is in [#277](https://github.com/3ixas/eliasb.dev/issues/277).
