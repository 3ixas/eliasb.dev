# DESIGN.md: passes and panels

The design contract for all of eliasb.dev: the homepage, the shell (header and theme), the Role stories, the Case studies, the Work archive, the Résumé and the 404. It is the only live design reference. When this file and anything else disagree, this file wins.

**Keeping it current.** A tweak edits this file in place, in the same pull request as the change. A new direction first copies this file into `history/` with a superseded note at the top, then rewrites it. The directions it replaced are in `history/`: the quiet index (`QUIET-INDEX.md`), the Stretch direction (`STRETCH.md`), the Board (`BOARD.md`) and the Cabinet of Curiosities (`SELECTED-DIRECTION.md`).

The build spec, with acceptance criteria and the order of work, is `docs/specs/PASSES-AND-PANELS-SPEC.md` (requirements `R-01` to `R-40`), updated by the 23 November 2026 refinement spec in `docs/specs/PASSES-AND-PANELS-REFINEMENT-SPEC.md` (requirements `R-41` to `R-55`). How the original direction was reached is in `docs/specs/CRAFT-ELEVATION-SPEC.md`. The live visual reference for the homepage, Role stories, Case studies and archive is the approved Hybrid A + B prototype in `docs/review/2026-11-23-gemini-explorations/prototype-final/` (`index.html`, `bnp.html`, `threshold.html`, `things.html`, `style.css`, `app.js`, `README.md`); `docs/review/2026-11-11-direction-e/` remains the reference for untouched pages (`404.html`, `resume.html`, `parts.html`). What the initial redesign replaced in the code is in `docs/specs/PASSES-AND-PANELS-CODE-MAP.md`. Where a prototype and this file disagree, this file wins. Terms follow `GLOSSARY.md`; approved copy is in `docs/content/redesign-copy.md`.

## Principle

The work is the design. The first screen is the opening line and my current **Staff pass** (BNP Paribas), drawn as a real ID card. After it, each subject has a **panel** sized by how much it matters, in its own colour, with its proof drawn on it.

## The four rules

A change that breaks one needs Elias's decision, not a judgement in review.

1. **Rank by importance, never by duration.** BNP Paribas is first and largest wherever employers appear.
2. **Proof is visible without a click.** Nothing a visitor needs is behind a hover or a tap. Hover adds feedback, never content.
3. **Text earns its place.** No eyebrows, kickers, series letters, figure numbers or helper text. A heading; a subheading only where it says something the heading does not. If text isn't needed, it isn't there.
4. **Motion has a job.** A value arriving, a thing settling, a control answering. Nothing loops. Reduced motion shows the end state.

## Layout

- **The page**: `max-width: 1216px` (`--frame`), centred, with 48 px gutters from 1024 px, 32 px from 720 px and 16 px under it (`--gutter`). At 1440 the page's side margin is 160 px.
- **Two widths**: prose and ledes keep a measure of 640 px or less (`--measure`); passes, panels and figures take the frame's full width. No centred column.
- **Sections**: 128 px apart (88 px under 720 px), set by `--section-space` on every page: a homepage section's top padding, and half above and half below a long-form section's hairline. Each opens with its title, 32 px above its content (28 px under 720 px); where a section has a subheading (Work, Things I make, How I work, Off the clock), it stacks directly underneath the `h2`, left-aligned, never floated to the right.
- **Panels in a section**: 16 px apart. Two panels side by side stack under 720 px.
- **Breakpoints**: 1260 px (wide panels stack), 960 px (the homepage's opening, Role story and case study openings, and Off the clock rows stack, [#461](https://github.com/3ixas/eliasb.dev/issues/461)), 900 px (header links move behind Menu), 720 px (phone).
- **Length**: the homepage stays within 9 screens at 1440 × 900 and 12 at 390 × 844 (raised from 8 and 11 on 15 November 2026, when Off the clock gained its headings, a fuller workout and Now making's description). Something new takes the place of something else. A long-form page has no budget.

## The panel

| Part | Spec |
|---|---|
| Shape | 28 px radius (22 px under 720 px); contents clipped |
| Field and ink | The subject's own colour and its ink, or paper and ink for a panel that follows the theme |
| Header | The name at the left (`--type-panel`, `clamp(22px, 2vw, 28px)`, Newsreader); role and dates at the right in 14.5 px, two lines, where there are any. A Work panel puts them under the name instead (see "The homepage, in order") |
| Padding | 40 to 44 px (26 × 22 px under 720 px) |
| Inside | Cards, figures and tiles take a 16 px radius; images 10 to 12 px; featured project screenshots sit whole and uncropped inside a concentric optical bezel (`24–28 px` panel → `16 px` bezel → `10–12 px` image) tuned per field so dark UIs stay crisply separated; pills are fully round |
| Depth ([#458](https://github.com/3ixas/eliasb.dev/issues/458), [#476](https://github.com/3ixas/eliasb.dev/issues/476), refined 23 Nov 2026) | Every panel, card and optical bezel is edged with a subtle `1 px` grey hairline (`--hair` on paper and band surfaces; a crisp subtle `1 px` edge on coloured fields in both light and dark themes so dark fields like Joveen and Flowtime stay clearly separated from the `#0d0d0f` dark page) and lit softly from above (`.surface`) in both themes (Elias retired "no depth in light" on 17 November 2026). A close contact shadow and a soft, wide one tinted by the panel's own field (neutral on paper, black in dark). A bright field (its ink darker than it: BNP Paribas, Threshold, Argus Risk) is never deepened, where its ink would fall under AA. Text is AA at every point of every field. Nothing glows in its own colour in dark: the project panels' coloured glow retired for calm (Elias, [#493](https://github.com/3ixas/eliasb.dev/issues/493), 19 November 2026); a surface keeps its tint, its subtle `1 px` edge and its black shadow. In forced colours the shadows give way to a 1 px outline. A surface tunes its knobs (`--rim`, `--edge`, `--cast`, `--lit`, `--foot` in `parts.css`), never its own shadows. How I work's cards, structured Role/Case study cards, and a case study's PRD card are bordered paper surfaces; cells and tiles inside a panel stay flat |

Pass furniture ("Valid · present", "Returned", a barcode) never appears on a panel.

**Text on a coloured panel is the panel's ink at full strength.** Dimmed text is allowed only where it still measures AA: on the dark fields (Joveen, Optegra, Flowtime) and on paper. BNP Paribas's panel lifts from `#2cbd86` at its top left to its field `#00965e` and is never darker than the field.

## The staff pass

A printed card hanging from a lanyard. It is an object, so it keeps its printed colours in both themes; its card stock is a step darker in dark.

- **Card**: CR80 proportion (14.5 : 23), 0.8 em radius, white stock, a hairline edge, a 1.5 px lower edge for thickness, and two soft shadows. Sizes inside it are in em of the card's width ÷ 14.5.
- **Lanyard**: two plies of woven ribbon in the employer's colour, 1 em wide, opening upward at 4.5° each way and running out of view at the top.
- **Clip**: a metal crimp, a swivel and a loop. The loop's two legs cross the strip above the slot, enter the slot and end at its lower edge, so it passes behind the card.
- **Print, top to bottom**: a header band in the employer's colour with the employer's name in Newsreader 500; the white-tux portrait (`public/profile/elias-evening.webp`; colour on the current pass, greyscale on a returned one); "Elias Bennett", the role, the dates; the status and a barcode. The card is 14.5 em square. The current pass has a hologram beside "Valid · present"; a returned pass says "Returned".
- **Who and when, not results** ([#493](https://github.com/3ixas/eliasb.dev/issues/493), Elias, 19 November 2026): the pass prints no figures or awards. Work's panels draw each result once, so the pass and its panel never say the same thing twice.
- **Size and placement**: on the homepage opening, **one pass only** — the current role (**BNP Paribas**, `248–264 px` wide) — hanging directly from the header's `1 px` grey hairline at the right on desktop, and from a quiet rail hairline beneath the opening actions on phones. No multi-pass rail on the homepage, and no passes hanging inside mobile Work panels. Each Role story hangs its own employer's **Staff pass** (`PassLight` + `StaffPass`, `role="img"`, not a link) from the header's `1 px` hairline beside its coloured hero banner from 960 px, and from a quiet rail hairline beneath the hero banner under 960 px. Every text on a pass is at least 13 px, so a date range may wrap, but only after its dash: a month never parts from its year.
- **Accessible name**: the pass's whole content as a sentence; the drawing itself is hidden from assistive technology.
- **In 3D** ([#448](https://github.com/3ixas/eliasb.dev/issues/448), [#486](https://github.com/3ixas/eliasb.dev/issues/486), `components/parts/lanyard/`): where the browser has WebGL 2 on a graphics chip (not a software renderer) and motion is on, one canvas hangs the single pass on the homepage opening (BNP Paribas) or on a Role story (that employer's current or returned pass) over the printed pass, painted from its own print at its exact size. The card hangs from a woven two-ply polyester twill strap by a nickel clip, swings once and settles, and can be dragged and thrown. The webbing (`public/lanyard/webbing.webp`, tinted in the employer's lanyard colour from its seamless grey tile with a derived normal map) and, on the current BNP Paribas pass only, the guilloche hologram foil (`public/lanyard/foil.webp`, driving its print and thin-film finish under the scene's light) are seamless generated textures that load only with the scene; the card stock stays procedural. The canvas reaches the window's sides and 320 px below its rail (clipped cleanly at its top anchor so the strap never pokes above the header or opening actions), takes no pointer so surrounding text stays live, and uses a hit pad the pass's size to take hold. It is antialiased on 1× screens only: at 2× its pixels smooth the edges, and multisampling the wider canvas cost six times the frame. Pulled down past its length, the strap stretches, harder the further it goes, up to about a card's width, and springs back when let go. A mouse takes hold at once; a touch takes hold after resting a quarter of a second, so a swipe still scrolls the page. A click or tap that does not drag follows the pass's link if it has one (the homepage pass links to `#bnp-paribas`; a Role story's pass is not a link and goes nowhere). The printed pass stays in the page, unseen, for its accessible name, link and keyboard focus ring. With no script, no WebGL or reduced motion, the printed pass is all there is. Where the scene will draw, the print never shows first: it waits unseen while the scene loads, and shows if the scene cannot draw, fails or takes more than 5 s.

## Controls

One set on every page.

| Control | Spec |
|---|---|
| Solid pill | On a panel. 44 px tall, 20 px side padding, Instrument Sans 15 px / 500. Fill is the panel's ink, text is its field |
| Outline pill | On a panel. The same, with a 1 px outline; a 10% fill of the ink on hover |
| Button | On the page. The same shape with a 1 px hairline/ink outline; fills with ink on hover. Copy morphs synchronously in place (`Copy` → `✓ Copied`) at one fixed width with zero layout shift |
| Text link | Newsreader 19 px. The words are underlined in hair, turning ink on hover; the arrow is not underlined |
| Row | The other projects and the 404's suggestions: bordered paper strips (`1 px solid var(--hair)`) with visible-at-rest `60 × 40 px` micro-thumbnails for secondary projects, name, line and metadata; the whole row takes the tint on hover |
| Chip | 13 px / 500 to 600 in a round outline: a stack item, or a source in its colour |
| Theme control | The live Eclipse SVG icon button (`eclipse-toggle.tsx`), borderless on the header ground (44 px hit target, soft hover tint and cobalt focus ring only, no outer ring at rest) |
| Menu | Under 900 px: a 44 px hairline button that opens the section links as a list beneath the header |

- **Hover** applies only to a hovering fine pointer. Arrows move 4 px.
- **Press**: 0.97 scale over 150 ms. Reduced motion drops the scale.
- **Feedback**: every control answers in 100 to 250 ms on `--out` and reverses from where it has reached.
- **Focus**: one ring, 2 px cobalt at 3 px offset. On a coloured panel it takes the panel's ink.
- **Targets** are at least 44 px, except links inside running text.

## The header (every page)

The name in Newsreader 500 at 20 px, a link to the homepage; the greeting with its live `GreetingScene` SVG glyphs; the five section links (Work, Things I make, How I work, Off the clock, Say hello) in a navigation landmark named "On this page"; and the borderless Eclipse SVG theme control. It sits over a subtle `1 px` grey hairline (`--hair`) and is 64 px tall. It is not sticky. On an inner page the links go to the homepage's sections. Under 900 px, where the full row no longer fits, the links are behind Menu; Escape or choosing one closes it. Without script the links show.

**The greeting** is the existing one, whole: "Hello" before the clock is read and without script, then by the visitor's own time "Kettle’s on." (from 05:00), "Nearly five?" on a weekday or "Nowhere to be?" at the weekend (from 12:00), "Home yet?" (from 17:00), "Still up?" (from 22:00), with its small scene. The scene is icon-sized, drawn in a 30 × 22 box in one 1.8 line weight with only the detail that reads at that size ([#467](https://github.com/3ixas/eliasb.dev/issues/467), chosen by Elias on 19 November 2026 from three redraws): a prompt with a cobalt cursor for "Hello", a kettle, a clock a few minutes short of five, a table lamp with its light on, and the moon with two stars. The clock's pivot, the bulb and its light are the site's only amber (`--sun`). It is decorative; the words carry the meaning. Hover or focus adds "it’s HH:MM here in London". Its width is reserved for the longest line. It hides under 400 px.

## The homepage, in order

1. **Header.**
2. **The opening**, one screen tall (`min(100svh − header, 900px)`): the opening line as the `h1`, "I build pricing and risk engines at BNP Paribas, and products of my own.", with a green underline on "BNP Paribas" and "products of my own." in cobalt; the supporting line in Newsreader 20 px, muted; the primary actions (`Work` / `Say hello` or equivalent concise pills); and **one Staff pass only — the current role (BNP Paribas)** — hanging directly from the header's `1 px` grey hairline at the right. Under 960 px the text sits above the pass, which hangs cleanly from a subtle rail hairline beneath the actions. No bottom metadata baseline (no location tag, stack tag, or `Work ↓` jump). Nothing of Work shows before a scroll at 1440 × 900 or 1280 × 720.
3. **Work**: the title, with the subheading "History, then marketing, then code. Each move was towards the work I liked most." stacked directly underneath it.
   - Every Work panel has one structure ([#458](https://github.com/3ixas/eliasb.dev/issues/458), refined 23 Nov 2026) and a subtle `1 px` grey hairline edge in both themes: the name leads, with the role over the dates directly under it; then the headline figure/well and evidence; then the story link.
   - **BNP Paribas**, full width, green (`#00965e`, full-strength `#04140d` / `#03110a` ink). From 1000 px two columns: who and what on the left (the name, role and dates, "6 months" and "from zero C# to production code" in a light translucent stat well, "The BNP Paribas story →"), the evidence on the right (two comparisons in their own units — "Integrating a pricer" and "The competition dashboard's data load"). Narrower, it stacks in that order. The Monte Carlo simulation stays exclusively on its Role story ([#457](https://github.com/3ixas/eliasb.dev/issues/457)).
   - **Joveen** (`#1a1a1f` dark slate) and **Optegra** (`#07535b` / `#006765` deep teal), side by side, crisp full-colour panels edged with subtle `1 px` grey hairlines in both themes: employer, role/dates, headline figure and label, a **compact 3-metric tray** (`520 ms → 230 ms`, `10 min → under 2`, `+30%`; `62% → 88%`, `−30%`, `+15%`; three columns from 360 px of tray width, three compact horizontal rows narrower so values never wrap awkwardly at 720–960 px or on phones), and the story link. The two share their rows from 720 px so trays and links stay level.
4. **Things I make**: **Threshold** (`#c58f5e`) wide with an inline `London / Basel / Zurich` city URL switcher in the left column (closing the empty ochre left void and updating a live preview URL); **Argus Risk** (`#4f86f7`) and **Flowtime** (`#2a211b`) side by side. All three retain their full signature colours and stage their complete, uncropped screenshot inside a **concentric optical bezel** (`24–28 px` panel → `16 px` bezel → `10–12 px` image) tuned per field so dark UIs stay sharp and separated. The other projects (`Home Secretary`, `Risk Event Tracker`, `Ask Professor Past`) sit on bordered paper strips (`1 px solid var(--hair)`) with visible-at-rest `60 × 40 px` micro-thumbnails, newest first, followed by the link to the Work archive with the true count.
5. **Where I'm headed & How I work**: grouped inside one **full-bleed warm-linen tonal band** (`--band`: `#e4e1da` light / `#14151a` dark, edged top and bottom by `1 px` grey hairlines):
   - **Where I'm headed**: asymmetric `4 / 7` bordered paper panel (`--paper` on `--band`). Title and lead on the left; three parts on the right, each with a source-coloured chip (`Optegra`, `BNP Paribas`, `Threshold`), its heading, its "So far" line, and its bespoke drawn SVG proof (`where-im-headed.tsx`, [#459](https://github.com/3ixas/eliasb.dev/issues/459)): a split test for Optegra, six months from a hollow zero to production code for BNP Paribas, and 57 ticks leading to one filled live mark for Threshold. Each drawing takes its source's thread colour where it holds 3:1 against paper, else cobalt, never relies on colour alone, and is hidden from assistive technology because its line already says it.
   - **How I work**: 2 × 2 bordered paper cards (see "How I work's cards"), each with its own distinct bordered inset proof tray so no two cards share the same visual shape and the 57-tick drawing is never repeated.
6. **Off the clock**: one bordered paper panel containing **nested stone rows** (`--page` fill inside `--paper`, edged with subtle `1 px` grey hairlines), each with its Newsreader 20 px heading in a left margin column from 960 px (`184–232 px`) and content on the right (stacking under 960 px):
   - **Today’s workout**: today’s session above a calm, scannable **7-day weekly schedule** of compact day tiles (`Mon · Upper`, `Tue · Lower`, `Wed · Zone 2`, `Thu · Upper`, `Fri · Lower`, `Sat · Rope`, `Sun · Bike`) with today highlighted — static display with no click-to-preview buttons and no redundant summary/instruction line — beside the Central London running photo (tap/click to enlarge full-size in the lightbox with `cursor: zoom-in` and zero visible `Enlarge ↗` copy).
   - **On my shelf and screen**: book and film covers side by side as prints (112 px; 88 px under 960 px) lifting 3 px on pointer hover.
   - **Odd but true, from this week in history**: an enlarged framed 3:2 illustration (`~216–280 px` desktop, full width on phones) that also opens full-size in the lightbox on click/tap (`cursor: zoom-in`, zero visible `Enlarge ↗` copy; an oddity with no picture shows its year in the frame, and a week with no pictures has no frame), date, fact, and an outline pill (`1 of 3`) stepping to the next oddity in place.
   - **GitHub, the past year**: title in the left margin column matching the rows above, giving **What I’m building now** (`ekit` — live mark, repository name, and GitHub description) a full-width horizontal strip directly above the contribution grid.
   - A stale feed says "From Goodreads, as of 2 Nov"; a feed that is down shows its authored fallback, and the panel keeps its shape.
7. **Say hello**: full-bleed `--band` closing band under a subtle `1 px` grey hairline, ending every page.

Anchors stay `#work`, `#things-i-make`, `#how-i-work`, `#off-the-clock` and `#say-hello`.

## Figures

- **Employer** (a Work panel's name): Newsreader 400, `--type-employer` (`clamp(36px, 3.6vw, 52px)`), with the role over the dates at 18 px directly under it, a line each. It is the first read of a Work panel.
- **Display figure**: Newsreader 500, `--type-figure` (`clamp(28px, 2.6vw, 38px)`), lining tabular figures, with its label in Newsreader 18 px beneath. One per panel, a clear step under its employer ([#458](https://github.com/3ixas/eliasb.dev/issues/458)). BNP Paribas's is "6 months" at `clamp(26px, 2.4vw, 34px)`.
- **Comparisons, each in its own unit** ([#456](https://github.com/3ixas/eliasb.dev/issues/456)): the drawing says what the number says. A latency is two bars over a tick every 100 ms. Working days are same-size squares, grouped in working weeks: ten against two. Minutes are a tick a minute on the pair's one scale, every fifth taller; the minutes it took are full height, and the uncertain minutes of a range ("30–40") or a bound ("under 5") are short. A rate is one 0 to 100 axis with before filled to its mark and the gain to after solid between the marks. A change in per cent with no absolute is before at 100 against after to scale. Before is soft and after solid (white on BNP Paribas's green, the panel's ink elsewhere, cobalt on paper); bars are thin before and thicker after. Both sides are named ("An experienced engineer", "Me, new to it"; "Before", "After") and the values are written out. Every amount is the content's own, checked against its words.
- **The simulation** ([#457](https://github.com/3ixas/eliasb.dev/issues/457), legibility tuned 23 Nov 2026): on the BNP Paribas Role story, under The role, on a bordered panel in BNP Paribas's colour (the homepage's panel stays a summary like Joveen's and Optegra's). Illustrative simulated paths from "Today" to "Horizon" on clearly legible hairline axes across the panel, under a small heading that names what it shows ("How the pricing engines work", set as the comparisons' headings are). Background walks stay visibly crisp at rest rather than vanishing into the green; three stand out in the panel's full-strength ink (10th, 50th and 90th percentiles, showing the spread). Each endpoint is a dot stacked in its right-edge histogram band, the mean's band white. A dashed white line at their mean is labelled "One price" at its end (above its end on a phone). Under it: "Run again" (outline pill), Paths (`10`, `100`, `1,000` segmented control), and a live tabular **`10th–90th spread`** readout: the gap between the run's 10th and 90th percentile endpoints, recomputed on every run. More paths steady the estimate from run to run; they do not narrow the spread, which the market's volatility sets. At 1,000 a dot stands for ten walks. A screen reader is told each new run's paths, price and spread. It says it is illustrative in its accessible description. It appears only on the BNP Paribas Role story.
- **The flag** (BNP Paribas's Role story, and in compact interactive form on How I work's third card): two lanes, the live path as a solid line and the new path as a dashed one behind a switch that is off, "off by default". It is a switch you can flip ([#461](https://github.com/3ixas/eliasb.dev/issues/461)): a `button` with `role="switch"`, named by the new path's words and described by "off by default", 44 px around the drawn switch, in the panel's ink with the panel's ring. Switched on, the new path is solid and today's dashed, and a request (a dot in the panel's ink) travels the path taken over 0.9 s; the next on the new path is served from the cache, a third of the time. Switched off, a request takes today's path. Each trip is one value arriving; a switch mid-trip starts the new trip. With reduced motion the lanes change and no request travels; without script it is the still figure, drawn off.
- **Screenshots and tap-to-enlarge imagery**: each product screenshot is caught at the state that tells its product's story (an answer, a break earned, a request and its response), never an idle screen or a list of routes, at 2× ([#460](https://github.com/3ixas/eliasb.dev/issues/460)). Inside a featured project panel or case study stage, screenshots sit **whole and uncropped** inside a concentric optical bezel (`24–28 px` panel → `16 px` bezel → `10–12 px` image) rather than bleeding off an edge; in a long-form column they take `16 px` with a subtle hairline edge. In a long-form column — and for Off the clock's running photo and history illustration — an image is also a button (`cursor: zoom-in`, accessible `aria-label`, no visible `Enlarge ↗` helper copy) that grows from where it sits into a modal large view and returns there ([#471](https://github.com/3ixas/eliasb.dev/issues/471)): on touch devices the large view sits in a scrollable, pinch-zoomable stage where a double tap zooms to the point tapped (2× to 2.5×), a single tap on the image stays open, and Close or a tap outside dismisses while the page behind stays still; with a pointer a click anywhere or Esc closes it and focus returns to the button.
- **Evidence figures**: a value in Newsreader 500 at `--type-figure` over its label in 14 px.

## How I work's cards

Set inside the full-bleed `--band` tonal band as a **2 × 2 grid** (stacking to one column under 720 px) of bordered paper cards (`1 px solid var(--hair)`, `16 px` radius). Each card leads with its habit in Newsreader 500 and concise Instrument Sans story with the proof phrase highlighted in a soft cobalt tint, followed by its own **distinct bordered inset proof tray** (so the four cards never look like a repetitive wall of identical tiles and never repeat Where I'm headed's 57-tick drawing):

1. **Start from a real problem:** `Threshold` and `Flowtime` micro-screenshot pills with their colour swatches, linking directly to their case studies.
2. **Write it down first:** `57` serif numeral, a 13-slice stepped bar, and a direct `Threshold’s PRD, 16 Apr 2026 →` link inside the tray.
3. **Ship it so it’s safe to undo:** an interactive accessible `Off / On` `role="switch"` wired to live `Today’s path` and `New cached path` routing chips that flip state when toggled.
4. **Measure whether it works:** bold `+15%` serif figure over proportional Before / After bars.

## Long-form pages: Role stories and case studies

- **A Role story's opening**: a coloured employer hero banner edged with a subtle `1 px` grey hairline holding "← Work"; the employer as the `h1` (`--type-title`, `clamp(40px, 4.4vw, 64px)`, or `clamp(32px, 3.6vw, 52px)` for a name over 24 characters, so Optegra Eye Healthcare & Kensington Medical fits at 320 px); role, dates and setting on one line; the summary as the lede (`clamp(19px, 1.5vw, 22px)`); and a bordered evidence strip — beside that employer's real hanging **Staff pass** (`PassLight` + `StaffPass`, hanging from the header's `1 px` hairline at the right from 960 px, and from a quiet rail hairline beneath the coloured hero banner under 960 px).
- **A case study's opening**: a **lifted open-ground header** matching Role stories' rhythm ("← Things I make", title, outcome, stack chips, Live site and Code actions, and four bordered evidence cards on `--page`), followed directly by a **full-width project-colour exhibition stage** holding the complete, uncropped screenshot in a concentric optical bezel (zoomable on click/tap). This replaces the tall full-colour `.case-open` opening slab so visitors reach the product and story immediately.
- **Sections and chapter rail**: from 960 px, a **sticky left chapter rail** (plain section titles, zero chapter numbers; active chapter highlighted in a lifted bordered paper pill with a cobalt dot) beside the right reading column (prose measure ≤ 640 px, figures up to 760 px). Under 960 px the rail collapses cleanly above/between sections. Structured Problem and Decision entries sit in tonal bordered paper cards (`1 px solid var(--hair)`). Paragraphs are Newsreader 19 px (18 px under 720 px) at line height 1.5. No section numbers, and no "Summary" heading.
- **Figures** sit in the text column with a 14 px muted caption, 24 px below a panel so it clears the panel's shadow. A Role story's flag and comparisons are on a bordered panel in the employer's colour. Each Role story draws every number in its evidence once, under What changed, each in its own unit ([#461](https://github.com/3ixas/eliasb.dev/issues/461)); a change in per cent is drawn from 100, with no words on its before side. Printed artefacts such as BNP Paribas's `_nology` Take Ownership certificate sit on a neutral archival mat so they separate cleanly in both themes.
- **A working figure** ([#462](https://github.com/3ixas/eliasb.dev/issues/462)) is a slice of the product a visitor can use where the prose says what it does: a lit surface of paper tinted with the project's colour (13%), rising off the page as every panel does, 16 px corners, its caption 24 px beneath, taking the text side's width. The project's full colour is only on what a visitor presses: each control is a raised key in the project's field and ink, lit along its top with a short cast shadow, pressing to 0.97 and turning over to the project's ink with its colour as the words when it says "Copied". So a figure never melts into the project's own full-colour panels around it (Elias, 18 November 2026). The server draws it at its start, laid out as it will work, so first paint never waits and nothing moves when it starts working; its script loads as it nears the view (within 600 px). Without script it is the screenshot it stands in for, with that screenshot's caption. **Threshold's link** sits under "The link is the save file.": City, District and Place (Threshold's own options) as keys over a drawn address bar holding the live link, with synchronous `Copy link → ✓ Copied` and a direct **`Open this scenario ↗`** external link (`target="_blank"`, `rel="noopener noreferrer"`) side by side directly beneath it, opening Threshold with the chosen query. A value never breaks across lines; the link breaks between its parts, and the address keeps room for the longest link (two lines where the sticky chapter rail narrows the column, three under 720 px, four under 360 px) so the action row stays put as choices change. A choice rewrites the link at once; the part that changed arrives in 200 ms on a wash of Threshold's colour that fades over 1.2 s, and a new city starts on its first district, as Threshold does. The link is announced politely. Copy link copies the working link, which opens Threshold on those choices; if the clipboard is refused it selects the link. Reduced motion: the link changes with no motion.
- **Argus Risk's numbers with their history** ([#463](https://github.com/3ixas/eliasb.dev/issues/463)), the second working figure, under "Show the number with its history.": three positions' unrealised P&L in USD, each a disclosure (a `button` with `aria-expanded`, never a hover; it rises into a key in Argus's colour while open) that opens on the price tick it came from and that price's age. The age is text, updated once a second only while its number is open and on screen; past 5 whole seconds it reads "Stale", Argus's own threshold. New event, a key, brings the next price for the oldest position, opens it, and says so politely; the changed number and price arrive as Threshold's link does. The data is illustrative, in Argus's shapes, and the list's description says so.
- **Flowtime's break that follows the focus** ([#464](https://github.com/3ixas/eliasb.dev/issues/464)), the third working figure, under "Count from a fixed point, and ask instead of guessing.", beside its point "The break follows the focus.": a native range for How long you focused (5 to 90 minutes, a minute a step, 45 at the start), a 44 px row whose thumb is a key in Flowtime's colour and whose track fills in cobalt to the thumb. Beneath it two rounds, each a Focus and a Break in #456's minutes on the slider's one 90-minute scale: Flowtime's, solid in cobalt, its focus the slider's value and its break Flowtime's own rule (a fifth, rounded up to the minute); and a Pomodoro's 25 and 5, soft. The round is named once and its minutes carry the weight. The slider is announced as both numbers ("45 minutes of focus, a 9-minute break"); a changed number arrives as Threshold's link does, and the ticks follow in 150 ms. Flowtime's Decisions had no screenshot, so without script the figure is its own still, held at 45 minutes. Reduced motion: the ticks jump to length. Forced colours: the track in GrayText filled in Highlight, the thumb Highlight ringed in CanvasText.
- **The PRD** is a paper card: the quote in Newsreader at `clamp(20px, 1.7vw, 24px)`, its opening mark hanging in the card's margin in cobalt at 2.2 times the quote's size (`clamp(44px, 3.74vw, 53px)`), as a printed pull quote's does, and its source and date beneath. The colour marks the words, not the card.
- **Ending**: the next role or project as a panel in its own colour ("Next role" or "Next project" with its line at the left, the name large at the right), then Say hello. The last Role story (Optegra) ends on "← Work"; the last case study (Flowtime) ends on a bordered paper "All projects" panel ("Things I make →") linking to `/things-i-make`.

## The Work archive

`/things-i-make`: the `h1` and its note, then every project as a panel, three across (two under 1260 px, one under 720 px). The three with case studies take their colours; the others are on paper and link out. Filters (Products, Systems, Experiments) appear once there are more than ten projects, as outline pills.

## The Résumé

An A4 sheet lying on the desk (`resume.css`, [#468](https://github.com/3ixas/eliasb.dev/issues/468)), set in the site's own faces: Newsreader for the name, the summary line and the quiet left-margin section titles; Instrument Sans with tabular figures for everything else, with hairline rules between sections and 12 mm / 13 mm A4 margins. It stays light paper in both themes, prints exactly what it shows, aims for one A4 page (never more than two), and regenerates `public/Elias-Bennett-Resume.pdf` with embedded fonts and live links (`pnpm resume:pdf`, held by `verify:resume`). The page around it takes the header, the page colour and Say hello. Download PDF is the Button and sits on the sheet's edge.

## The 404

The `h1`, "This page doesn’t exist.", and its line. Then the visitor pass, the page's one object ([#470](https://github.com/3ixas/eliasb.dev/issues/470), chosen by Elias on 19 November 2026 from three placements): a staff pass's card at 184 px, small and still, with no lanyard, no 3D scene and no drag. It prints "Visitor" in ink on a band of the card stock under a hairline, a grey silhouette where the portrait would be, the address asked for, struck through and shortened in the middle to the pass's text limit (32 characters, three lines at most), and "Not on file". It has no barcode. It is a picture (`role="img"`) named by its print with the whole address; it keeps its printed colours in both themes and in forced colours. "404" sits in cobalt at its foot. Without script the pass prints no address. Then "Try one of these" and the five homepage sections as rows, with the copy deck's lines.

## Say hello

In a full-bleed `--band` closing band under a subtle `1 px` grey hairline (`--hair`): the title; the email in Newsreader 300 at `clamp(28px, 3.4vw, 48px)` with a cobalt underline, and a synchronous morphing `Copy → ✓ Copied` button (fixed width, zero shift); then Résumé, GitHub and LinkedIn in Newsreader 18 px. If the browser refuses the clipboard, Copy selects the address. No page has any other footer.

## Share cards and favicon

- **Share cards** ([#469](https://github.com/3ixas/eliasb.dev/issues/469), refined 23 Nov 2026): one template on 1200 × 630 with the same outer margins (`64 × 80 × 68 px`; for hanging passes, the 80 px right margin is measured to the printed card's edge while its soft shadow sits inside the margin and its lanyard meets the top edge), Newsreader at the left and "ELIAS BENNETT" at the foot, carrying each page's object on the right. The homepage's card (and any page without its own) sets the opening line on the page colour (`#eeede9`) with "products of my own." in cobalt (`#2443d6`) beside the single current BNP Paribas Staff pass hanging from the top edge (matching the single-pass opening). A Role story's card takes its employer's field and ink with that employer's pass hanging on the right. A case study's card takes its project's field and ink with its `#460` screenshot framed at 16 px radius on the right. Passes and screenshots are committed still PNGs under `public/share/` (`pnpm share:assets`), held fresh against live pass content, `tokens.css` and source screenshots by `verify:share-assets` (Satori cannot run the CSS pass and `resvg` drops WebP). Every text pair holds WCAG 2.2 AA (4.5:1) on its field. The Résumé sheet is never drawn on a card.
- **Favicon** ([#469](https://github.com/3ixas/eliasb.dev/issues/469), chosen by Elias on 22 November 2026 from two candidates at 16, 32 and 180 px): an outlined Newsreader 18pt SemiBold "E" in today's cobalt (`#2443d6`) on paper (`#fbfbf9`) with a hairline tile edge (`src/app/icon.svg`), switching via `prefers-color-scheme: dark` to `#8c9eff` on `#0d0d0f`, paired with a 32 px PNG fallback (`src/app/icon1.png`) for Safari and a 180 px full-bleed Apple touch icon (`src/app/apple-icon.png`). Bricolage Grotesque and `#2340ff` are banned by `verify:retired`.

## Tokens

Dark follows the device unless a visitor has chosen. Once script runs, the theme controller decides and a change crossfades.

| Token | Light | Dark | Role |
|---|---|---|---|
| page | `#eeede9` | `#0d0d0f` | Page background |
| band | `#e4e1da` | `#14151a` | Full-bleed tonal band (Where I'm headed & How I work; Say hello) |
| paper | `#fbfbf9` | `#19191c` | Panels and cards that follow the theme |
| ink | `#141416` | `#f0efeb` | Text |
| muted | `#5f5e5a` | `#a3a29c` | Secondary text |
| hair | ink at 14% | ink at 16% | Hairlines, header/band rules and subtle 1 px outlines (not text) |
| tint | ink at 5% | ink at 7% | Hover fills |
| cobalt | `#2443d6` | `#8c9eff` | The accent |
| green | `#00965e` | `#3ecf8e` | BNP Paribas's green as a mark on the page |
| GitHub year, 0 to 4 | tint, `#a8e6c4`, `#5fcf98`, `#1fae70`, `#00804f` | tint, `#1e5c42`, `#23845a`, `#2fb078`, `#46d996` | Contribution levels |

**Employer fields** (field, ink): BNP Paribas `#00965e`, `#04140d`; Joveen `#1a1a1f` (lifted from `#0b0b0c` with a subtle `1 px` grey hairline edge so it never melts into `#0d0d0f` dark ground), `#f4f4f2`; Optegra `#07535b` (or `#006765`), `#f0fbf9` / `#ffffff`. **Project fields**: Threshold `#c58f5e`, `#1a1714`; Argus Risk `#4f86f7`, `#060a14`; Flowtime `#2a211b`, `#ece4d8`. They are data on each Role story and project, and a coloured panel keeps its field in both themes with a subtle `1 px` grey hairline edge. Lanyards: BNP Paribas `#0b6b47`, Joveen `#2b2b2d`, Optegra `#00aa90`.

Every text pair passes WCAG 2.2 AA, measured on the rendered page and on every panel field.

## Colour rules

- **Cobalt** marks "products of my own.", the email's underline, focus, the habit cards' rule, the PRD's opening quote mark, highlight and proof, and the after side of a comparison on paper.
- **Green** on the page is only the underline on "BNP Paribas". BNP Paribas's panel and pass carry it as their field.
- **Employer and project colours** are whole panels, pass bands, lanyards, source chips, and a working figure's tint and keys. They are never text on the page, and never a stripe along one edge of a panel.
- **GitHub's greens** appear only on the GitHub year.
- **Colour never carries meaning alone**: a bar has its value written, a level has a text alternative, a source chip has its name.

## Type

- **Newsreader** (variable, optical size on) for the opening line, titles, figures, ledes, prose, the email, and the Résumé sheet's name, summary line and section titles. **Instrument Sans** for interface text, labels, captions, the stories on the habit cards, and the rest of the Résumé sheet (with tabular figures for dates and links). Both self-hosted through `next/font`, with fallback faces scaled to their measured widths. No other face loads anywhere on the site ([#468](https://github.com/3ixas/eliasb.dev/issues/468)).
- **Scale** ([#493](https://github.com/3ixas/eliasb.dev/issues/493)): display type stays Newsreader at about half its first size, so the largest step is 4× body, not 6×. Page titles `clamp(40px, 4.4vw, 64px)`; employer `clamp(36px, 3.6vw, 52px)`; opening line `clamp(32px, 3vw, 44px)` at line height 1.05 and −0.028 em; figures `clamp(28px, 2.6vw, 38px)`; section titles `clamp(28px, 2.4vw, 36px)`; panel titles `clamp(22px, 2vw, 28px)`; quote `clamp(20px, 1.7vw, 24px)`; lede `clamp(19px, 1.5vw, 22px)`; prose 19 px (18 px under 720 px); a point's lead 20 px; rows, links, names and Say hello's links one 18 px step; interface 15 to 16 px; small text 13 to 14.5 px.
- **One floor.** Nothing a visitor reads is smaller than 13 px, on the page or printed on a pass.
- **Figures** are lining and tabular wherever they are compared or roll.
- **No italics for emphasis and no uppercase display.** Emphasis is colour (the opening line) or the highlight (a habit's proof).
- **Lines of parts** (a role and its dates) wrap between parts; a dot never starts or ends a line.

## Motion

- **Easings**: `--out: cubic-bezier(.22, 1, .36, 1)` for things that settle, `--spring: cubic-bezier(.3, 1.5, .4, 1)` for things that swing.
- **Passes** swing to rest once on arrival (1.8 s, each 80 ms after the last). On hover a pass leans the other way, catches the light where the pointer is, and its hologram turns. In 3D a pass swings once on its strap where it was printed, within the gap to its neighbour, and settles; its hologram turns its colours as the card turns.
- **Panels and cards** rise 16 px and fade in once, when 15% in view.
- **Display and evidence figures** roll to their value once, over 1.2 s: each digit turns, behind a window that fades at its top and bottom, from its start digit to its own, all together; digits the start does not reach fade in. A screen reader is given the value, never the rolling digits.
- **Comparisons** arrive once, in their own unit. A latency's bars fill in their real time, together and at a constant rate: 520 ms takes 520 ms and 230 ms takes 230 ms, so the faster one is felt finishing first. Working days arrive a square at a time (60 ms apart) and minutes a tick at a time from zero (14 ms apart), after following before by 300 ms. Other bars grow from the left, the after bar 300 ms behind the before. Arming is instant; only the arrival moves.
- **The simulation** arrives once, walk by walk over 1.6 s ([#457](https://github.com/3ixas/eliasb.dev/issues/457)): each endpoint lands as a dot, sliding into its band, and "One price" appears with the first walk and follows the mean of the walks so far, so it wobbles and then settles as they add up; the featured three stand out last. It is drawn when it comes into view, never before first paint. After that it moves only when a control is pressed: each new run arrives the same way, and a control pressed mid-arrival starts the new run from an empty plot.
- **The greeting's scene** has one arrival, played on load and again on hover or focus, finished within 1.2 s: the cursor blinks three times, steam rises from the spout, the minute hand ticks up, the lamp's light comes on, or the moon rocks as the stars come out.
- **Screenshots** in a project panel lift 10 px on hover. On a long-form page, opening a screenshot grows it from its thumbnail into the modal dialog over 280 ms on `--out` via a same-document view transition (`zoom-shot`), and closing returns it to its live position over 220 ms ([#471](https://github.com/3ixas/eliasb.dev/issues/471)); a double tap on touch zooms to the tapped point over 220 ms. Without View Transitions support or with reduced motion, opening, closing and zooming happen at once.
- **Panel to page** ([#472](https://github.com/3ixas/eliasb.dev/issues/472), quietened in [#493](https://github.com/3ixas/eliasb.dev/issues/493); supersedes [#364](https://github.com/3ixas/eliasb.dev/issues/364) for these navigations only): moving between a Work panel and its Role story, a project panel (homepage or archive) and its case study, a next-role or next-project panel and the next page, and back via the back link carries only the employer or project title across over 240 ms on `--out`. Screenshots do not travel, the root never fades and everything else changes at once. Browser Back and swipe-back keep native history restoration without double-animating; with reduced motion or without View Transitions support, navigation happens at once.
- **Theme changes** crossfade over 0.3 s.
- **Reduced motion** shows every end state at once: nothing swings, rises, rolls or draws, and theme changes are instant. Content never waits for motion.

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
- **Forced colours** keep the data and the drawings: bars, day squares and minute ticks take the text colour (before) and the highlight (after), and their scales grey; Where I'm headed's and How I work's ticks, chosen split-test variant, six month segments, production code mark and live mark take the highlight while unselected variants, zero start and dividers take grey; the GitHub year keeps its five levels with a hairline on each cell, and passes keep the colours they were drawn in.
- **Reduced motion**: see Motion.
- **The standing checks** hold: the skip link, content in the server HTML and complete without script, axe, AA contrast, 3:1 focus rings, external links marked `↗` that open in a new tab, the theme rules, and each page's title, description and social image.
- **Overflow**: nothing scrolls sideways from 320 to 1440 px except the GitHub year on a phone, which scrolls inside itself. No state widens the page. 200% zoom holds.

## What this design avoids

Found in the lens passes and in the three rounds of concepts behind this direction. Each was built, looked at and removed.

- Eyebrows, kickers, series letters, "Fig. 1" numbering and helper text under headings.
- A panel that repeats what its heading says.
- Ranking by length of service.
- Proof behind a hover.
- Italic or coloured emphasis inside headings beyond the opening line's two marks.
- Underlines on text that is not a link.
- Decoration for its own sake: a glow, gradient or shadow that does not model light on an object (Elias retired the old "no depth in light" rule on 17 November 2026, [#458](https://github.com/3ixas/eliasb.dev/issues/458): depth that makes a surface read as made is welcome in both themes). A surface never glows in its own colour in dark ([#493](https://github.com/3ixas/eliasb.dev/issues/493)).
- Tilted cards and ruled-paper textures as decoration.
- Display type so large it becomes the subject (the giant "Only").
- A job title where the work can be described ("AI Champion", "Product engineer").
- Charts with no labels.
- Brutalist full-bleed colour fields and fitted, viewport-wide type.
- A coloured stripe along one edge of a panel or card, standing in for the panel's own colour (Elias, 18 November 2026: "a typical AI design tell"). A colour is a whole surface, a tint, or a thing you press.

## What retires

From the quiet index, with its code, tokens, specs and baselines, each in the ticket that replaces it:

- the row, the 44 px objects and the mini pass
- closer looks, the margin, the inline fold and the dotted reveal words
- the header portrait and its closer look
- the pen, the calendar tiles, the shelf, the ticket and the clipping
- enamel Pass pins and their glyphs
- the phone carousel of featured projects
- the removal rule, the two-width rule and the four-screen length budget
- Bricolage Grotesque, JetBrains Mono, DM Mono and the Fine cut

## Decided in review

Elias agreed these between 10 and 12 November 2026, across three rounds of prototypes:

1. **None of the six concepts alone.** C1 to C3 and D1 to D3 were explored and not taken; this direction combines what he kept from D1 (the opening and the passes), D2 (a panel per subject) and D3 (colour as light, in dark only).
2. **BNP Paribas leads**, and nothing is ranked by how long it lasted.
3. **The opening is its own screen**, with the Work section starting below it under its own heading.
4. **Passes are realistic**: who and when printed on the card, no results (#493), and no pins on the lanyard.
5. **The BNP Paribas panel is calm**: one figure, one chart, two comparisons.
6. **"Where I'm headed" names no job title.**
7. **Off the clock follows the theme.**
8. **The header keeps the time-of-day greeting.**

9. **The portrait on the passes is the white-tux photo** (`public/profile/elias-evening.webp`).
10. **History steps on a tap**, at every width; there is no swipe.
11. **Section notes stack directly underneath their `h2`**, left-aligned, never floated to the right (refined 23 November 2026).
12. **"Where I'm headed" leads with** "I’m working towards the judgement, depth and range to be trusted with what to build, building it well and getting it used. Here’s how far I’ve got on each."

### Refined in review (23 November 2026)

Following a full `interface-design` exploration and two live preview annotation passes (`docs/review/2026-11-23-gemini-explorations/prototype-final/`), Elias approved the Hybrid A + B refinement:

1. **Single current 3D Staff pass in the opening:** keep the real Three.js material pass (`components/parts/lanyard/`), simplified to BNP Paribas only, hanging from the header's `1 px` grey hairline on desktop and a quiet rail hairline below the opening actions on mobile; drop the opening's bottom metadata baseline and mobile Work-panel passes.
2. **Subtle `1 px` grey borders (`--hair`) everywhere:** replace stark ink rules on the header and Say hello, and edge Joveen (`#1a1a1f`), Optegra (`#07535b`), project panels, bezels and cards consistently in both themes; keep the live `GreetingScene` SVG glyphs and a borderless live `EclipseToggle`.
3. **Full-colour Work & Things I make with optical staging:** keep full signature colours on Joveen and Optegra (with compact 3-metric trays) and on Threshold (with inline city URL switcher), Argus Risk and Flowtime (with uncropped screenshots in concentric optical bezels); Monte Carlo stays inside the BNP Paribas Role story; secondary projects gain visible-at-rest micro-thumbnails on bordered paper strips.
4. **Full-bleed `--band` for Where I'm headed & How I work:** asymmetric `4 / 7` panel with `where-im-headed.tsx` drawn proofs, plus a 2 × 2 How I work grid where each card has a distinct bordered inset proof tray (micro-screenshot pills, `57` + 13-slice bar + PRD link, interactive flag switch wired to live routing chips, and `+15%` before/after bars).
5. **Calm nested Off the clock & tap-to-enlarge imagery:** nested stone rows inside one bordered paper panel; static scannable 7-day workout schedule with no preview chrome or redundant summary line; tap-to-enlarge lightbox on both the running photo and the enlarged history illustration with zero `Enlarge ↗` instruction copy; full-width `What I’m building now` (`ekit`) row above the GitHub grid.
6. **Long-form reading architecture:** coloured Role story hero banner paired with each employer's hanging Staff pass (beside the hero from 960 px, beneath it on a quiet rail hairline under 960 px; refined during 24 November 2026 real-device sign-off), lifted open-ground Case study header above a full-width project-colour exhibition stage, sticky left chapter rail (no numbers, lifted paper active pill), structured tonal Problem & Decision cards, high-legibility Monte Carlo with `10th–90th spread`, archival mat for the Take Ownership certificate, `Open this scenario ↗` on Threshold's live URL builder, and Flowtime ending on a paper `All projects` panel to `/things-i-make`.
