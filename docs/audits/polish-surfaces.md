# Polish audit of the remaining surfaces

Answer to [Polish audit of the remaining surfaces](https://github.com/3ixas/eliasb.dev/issues/196), on the map [Map: section-by-section design review](https://github.com/3ixas/eliasb.dev/issues/190). This is an audit only: nothing in the code was changed.

## How it was checked

- **Surfaces:** the hero, Things I make (Featured work tiles and the Project index), the Work archive at `/things-i-make`, the three Case studies (Threshold, Argus Risk, Flowtime), the header, the menu dialog, the Eclipse, Off the clock, Say hello and the footer.
- **Captures:** `next dev` with `BOARD_FIXTURES=1` on `main` at `3c1f3c7`, using Playwright Chromium. Each page was captured at 320, 390, 820 and 1440 px, in light and dark, with reduced motion: 40 first screens, 40 full pages, and section crops at 390 and 1440. The GitHub year grid was captured from the live site at 320, 390, 820 and 1440 px.
- **DOM checks on every page and width:** horizontal overflow, broken images, missing alt text, heading order, and touch targets under 44 px on phones.
- **Keyboard:** Tab order and the computed focus ring on the homepage at 1440 and 390, and on a Case study. The menu dialog's focus trap and Escape behaviour at 390.
- **Motion:** every `transition`, `animation`, reduced-motion and hover-gating rule in `src/app/stretch-shell.css` was read and checked against the motion rules.
- **Arrow check:** the case-study title was measured at ten widths, and the header height every 10 px from 761 to 1091.
- The screenshots are in [`docs/audits/polish-surfaces/`](polish-surfaces/), and each finding names its file.

## What held up

- No page scrolls sideways at any width or in either theme. Every image loads and has alt text, and the heading order is sound everywhere.
- Every interactive element has a visible 3 px focus ring. On a Case study's opening band the ring switches to the band's ink colour so it stays visible. The skip link comes first.
- The menu dialog traps focus, cycles through its links and Close, and returns focus to Menu when Escape closes it.
- Reduced motion gives the finished page with no movement. The tile hover and scroll sway are gated behind `(hover: hover) and (pointer: fine)` and `prefers-reduced-motion: no-preference`, and phones get a scroll-driven straighten instead of a hover pose. This is careful work.
- The Off the clock GitHub year grid **does render** on the live site, with today in Cobalt and a bracket under the busiest stretch. It's missing from local dev only because no GitHub token is set: `GitHubCard` returns nothing when there's no activity, which is the designed fallback. `/fixtures/off-the-clock` shows it locally.
- The six phone touch targets under 44 px are all inline image-credit links inside the history clipping's caption. WCAG 2.5.8 exempts links in a sentence.

## Findings, ranked

Each finding is graded **Broken** (it fails at a real width), **Rule** (it breaks a standing STRETCH rule), **Ugly** (it works but reads as unfinished) or **Polish**. They are ranked by reach × impact.

| # | Grade | Surface | Screenshot | Problem | Fix |
|---|---|---|---|---|---|
| 1 | Broken | Case study opening band | `01-cs-title-820-dark.jpg` | From 761 to 1099 px, the display title breaks mid-word: "THRESHOL / D". The `h1` uses `overflow-wrap: anywhere`, and its font scales with the viewport (99 to 128 px) while the band's left column narrows to 305 to 419 px. Argus Risk wraps at its space and Flowtime fits, but any longer one-word name will break the same way. | Drop `overflow-wrap: anywhere` from the display title. Size it against its column instead of the viewport (container query units, or a `min()` that includes the column width), so the longest single word fits. Add a spec check that the title's line count never splits a word at 761, 820 and 1000 px. |
| 2 | Broken | Header | `02-header-820-dark.jpg` | From 761 to about 895 px, the header grows from 69 to 121 px tall. The greeting sits alone on the first row and the nav wraps left-aligned onto a second row with nothing on the right. Tablets, the layout STRETCH says uses the desktop design, get a header that looks unfinished. | Either move the switch to Menu up to about 900 px, so tablets get the phone header, or keep one row by putting the greeting into the menu below 900 px and tightening the nav gaps. Recommended: Menu below 900 px, which keeps one header rule and costs one breakpoint value. |
| 3 | Rule | Off the clock · history clipping | `04-otc-1440-light-live.jpg` | A 2 px Cobalt line runs under "Odd but true, from this week in history" (`stretch-shell.css:1594`). Cobalt marks only the name, today and now, and Say hello, so this is decoration in the accent. | Use `--stretch-ink` or `--stretch-rule` for the line. |
| 4 | Ugly | Work archive and Project index at desktop | `03-archive-1440-light.jpg`, `03b-index-1440-light.jpg` | The rows fill the left 62% and the right 38% stays empty until a row is hovered or focused, because it's the screenshot preview's stage. At rest the archive reads as a bare list beside a blank column, and desktop shows no project images even though phones get thumbnails. | Give the stage a resting preview: show the first row's screenshot by default, swap it on hover or focus, and keep the last one shown when the pointer leaves. It uses the same element and state, with no new layout. |
| 5 | Ugly | Off the clock at 1440 | `04-otc-1440-light-live.jpg` | The two independent columns end about 240 px apart, leaving a hole under the book and film cards beside Now making. The book card stretches to the film card's height, so its lower half is empty. | Let the book and film cards size to their content (`align-self: start`), then rebalance the columns. This is a layout choice for the spec; see the questions. |
| 6 | Polish | Buttons and back links site-wide | `06-arrows-320-light.jpg` | The arrows touch their labels: "←Things I make", "Live site↗", "Code↗", "See my work↓". The space sits inside an `aria-hidden` span within an `inline-flex` container, where trailing whitespace collapses. | Add `gap: 0.3em` to `.stretch-button`, `.stretch-cs-back` and `.stretch-cs-button`, and remove the literal spaces. This is one rule, and it fixes every page. |
| 7 | Ugly | Case study section links on phones and tablets | `07-cs-links-390-light.jpg` | At 390 px the six links wrap into ragged rows of 1, 2, 2 and 1, about 190 px tall. Each link's 12 px padding puts the first label at 28 px instead of on the 16 px gutter. | On phones, use a single row that scrolls sideways with scroll snap and an edge fade, or a fixed two-column grid. Cancel the first link's padding so its text sits on the gutter. |
| 8 | Ugly | Case study · Next project tile | `08-next-tile-1440-dark.jpg` | A 1016 px card in the next project's colour has text in its left third and nothing on the right. The Featured work tile for the same project carries its screenshot and a Fastener. | Reuse the Featured tile's anatomy for Next project: the tilted screenshot on the right, with one Fastener. |
| 9 | Ugly | Hero at 1440 | `09-hero-1440-light.jpg` | The portrait column ends about 420 px above the actions, leaving a blank area to the right of the headline, the supporting line and both buttons. | Align the portrait to the bottom of the text column, or let it grow to the column's height inside the current 28svh rules. Check this against the Signature entrance's end positions. |
| 10 | Ugly | Say hello and the footer | `10-say-hello-1440-dark.jpg`, `10b-say-hello-390-light.jpg`, `10c-footer-1440-light.jpg` | The page's last moment is small. At 1440 px Say hello takes the left 45% and the right is empty. At 390 px its three link pills wrap 2 + 1, leaving LinkedIn alone. The footer is a single "Made by Elias" in an 86 px band. | Polish: keep the three links on one row on phones (smaller pills or a plain text row). Whether it needs more than that is the map's open fog question; see the questions. |
| 11 | Polish | Off the clock · card headings | `04-otc-1440-light-live.jpg` | The cards' headings use three styles: display condensed ("My training week"), mono uppercase at heading size ("Odd but true…", the only large mono text on the site), and small mono labels ("Now reading", "Last watched"). | Choose two roles: display for the card that leads (training) and the small mono label for the rest, so the history heading becomes a label. |
| 12 | Polish | Off the clock · film card | `04-otc-1440-light-live.jpg` | "Kiss Kiss Bang Bang" takes three lines plus the year, and the rating "★★★½" wraps alone after "Watched 9 Oct ·". Real titles will be longer still. | Keep the date and rating together with a non-breaking separator, and limit the title to three lines with the full title in the link. Test with a 40-character title. |
| 13 | Polish | Metadata lines on phones (Project index, archive, Case studies) | `12-meta-390-dark.jpg` | Separators begin a line: "Offline-first interaction / · 2026", "Event-driven systems · / 2026". | Render each "· item" as one unbreakable unit, so a separator always stays with the item after it. |
| 14 | Polish | GitHub year grid on phones (live) | `13-github-320-dark-live.jpg` | The grid opens scrolled to today, correctly, but the "busiest stretch" caption scrolls with it and opens clipped ("stretch, early-October →"), and a stray month fragment shows at the left edge. | Pin the caption outside the scroller (or anchor it right), and fade the scroller's left edge. |
| 15 | Polish | Menu dialog | `15-menu-390-light.jpg` | The five links fill the top half and the lower half is empty. Résumé, GitHub and LinkedIn are only at the bottom of the page. | An option, not a fault: put the three Say hello links at the bottom of the sheet. |
| 16 | Polish | Motion · Now making | code: `stretch-shell.css:1723` | The "now" dot pulses forever by animating `box-shadow`, which repaints on every frame for as long as the page is open. | Pulse a pseudo-element ring with `transform: scale()` and `opacity`, which runs on the compositor. It looks the same. |
| 17 | Polish | Hover colour on touch | code: `stretch-shell.css` lines 156, 168, 1439, 1454, 2105, 2215, 2289, 2534 | The nav, link, Say hello and case-study button colour changes on hover aren't gated, so they stick after a tap on iOS. The movement hovers are already gated. | Wrap these colour hovers in `@media (hover: hover)`, matching the Eclipse at line 230. |
| 18 | Polish | App shell | code: `stretch-shell.css:21` | `min-height: 100vh` overshoots on mobile Safari, whose toolbars resize the viewport. | Use `100svh`. |

### Motion notes that are by design (not findings)

- The Fastener reactions run as keyframes (the tape lifts, the paperclip swings, the pin presses), and the tile screenshot straightens with a 0.5 s overshoot. Both are longer than the ~300 ms UI guideline, and keyframes can't be interrupted. They are rare, playful and recorded in STRETCH, and reduced motion removes them, so they stay.
- The Project index preview fades with plain `ease` over 0.2 s. That's fine at this length.

## Elias's decisions (16 October 2026)

1. **Header (finding 2):** below 900 px the header switches to the phone layout (Eclipse + Menu), so tablets get the header that's already designed rather than a two-row desktop one.
2. **Project index and archive (finding 4):** a resting preview. The stage shows the first row's screenshot until another row is hovered or focused, and keeps the last one shown when the pointer leaves. No desktop thumbnails.
3. **Off the clock (finding 5):** the book and film cards size to their content. The columns aren't rebalanced for now; reopen that only if the remaining gap still reads as a hole.
4. **Say hello and the footer (finding 10):** more than polish. The ending of the page becomes its own prototype ticket, An ending for the page. The hero stays polish only (finding 9).

Every other finding goes into the spec as written.

## Passed to other tickets

- **Work** (for the Work passes spec, [Work as staff passes on lanyards](https://github.com/3ixas/eliasb.dev/issues/194)): keyboard users meet three "The BNP Paribas story →" links in a row. The passes replace that markup, so the spec should keep one story link per pass.
