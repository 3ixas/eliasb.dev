# STRETCH.md: the Stretch direction

The live design reference for eliasb.dev. It replaces `DESIGN.md` (the Board), which is kept as history. Decisions are in [ADR 0005](../adr/0005-stretch-redesign.md); scope, motion timings and tests are in the [spec](../specs/STRETCH-REDESIGN-SPEC.md) ([#114](https://github.com/3ixas/eliasb.dev/issues/114)); approved copy is in `docs/content/redesign-copy.md`; terms follow `GLOSSARY.md`. When this file and the spec disagree about a value, the spec wins; fix this file. The one exception is the design review's approved, not-yet-built work (the note under Components, and the Cobalt pins below): there its tickets win, until the design review's own spec replaces them ([#190](https://github.com/3ixas/eliasb.dev/issues/190)).

## Principle

The page stays neutral and the work carries the colour. Expressiveness comes from scale (the name at display size, giant section headings), one accent used large, and a few physical objects, not from added decoration. It should feel crafted without feeling like a toy.

## Tokens

Defined in `src/app/stretch-tokens.css` as `--stretch-*` variables. Dark follows the device unless a visitor has chosen light. Once script runs, the theme controller decides: it flips `data-lights` after marking the page as changing, so a change of the device setting crossfades like a click; the media query alone applies only when script has not run.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--stretch-page` | `#fbfbf8` | `#0d0d12` | Page background |
| `--stretch-ink` | `#111114` | `#f1f1f4` | Body and heading text |
| `--stretch-muted` | `#5a5a63` | `#a2a2ad` | Secondary text and metadata |
| `--stretch-rule` | `#dcdcd6` | `#2a2a33` | Hairlines and dividers (not text) |
| `--stretch-card` | `#f0f0ea` | `#17171f` | Cards and raised surfaces |
| `--stretch-cobalt` | `#2340ff` | `#8b9cff` | The Cobalt accent |
| `--stretch-on-cobalt` | `#ffffff` | `#0d0d12` | Text on a cobalt surface |
| `--stretch-tape` | `rgba(232,222,188,.85)` | `rgba(232,222,188,.6)` | Fastener tape, more transparent in dark |
| `--stretch-tile-edge` | none | `#2a2a33` | Hairline that keeps tiles visible in dark |

Every text pair passes WCAG 2.2 AA (5.7:1 to 18.2:1, [#108](https://github.com/3ixas/eliasb.dev/issues/108)); `e2e/stretch-tokens.spec.ts` measures them on the rendered page. Rules are decorative and are not held to the text ratio.

**Project colours** are data on each project (field, ink, swatch), for example Threshold `#1a1714` field, `#c08a5a` swatch, `#f2efe9` ink. Text over a project colour is checked per project.

## Colour rules

- **Cobalt** marks Elias's name, "today" and "now", and the way to say hello. It never colours a project, a tile or decoration. Case studies use it only for *Say hello*. One approved exception: the award pins on a **Staff pass** are cobalt, on Work and on the pass that opens a Role story, so the two read as one object. A Role story uses cobalt for nothing else but focus, selection and these pins; the pass opening it wears its Employer colour's other-theme pair, so it stands off the band ([#212](https://github.com/3ixas/eliasb.dev/issues/212), [#194](https://github.com/3ixas/eliasb.dev/issues/194), [#198](https://github.com/3ixas/eliasb.dev/issues/198)).
- **Project colours** appear on a project's Things I make tile, its case study's opening band and framing, and its swatches. The page behind stays neutral.
- Colour never carries meaning alone.

## Type

- **Bricolage Grotesque** (variable `opsz`, `wdth`, `wght`), self-hosted through `next/font`. Display text is at 75% width, weight 800, uppercase. Body copy uses the same family at normal width.
- **JetBrains Mono** for metadata, counts, dates and section notes.
- The name fills the screen's width on phones (31.5vw, no wrap) and is capped at 28svh everywhere, so it never takes more than about 45% of the screen's height. Section headings are giant, condensed and uppercase, with a mono note and true counts ("06 things I've built · 03 I'm proudest of").
- Newsreader is retired.
- **One floor.** Nothing a visitor is meant to read is smaller than 13 px, on the page or as **Print** on an object (a Staff pass, an award pin, the lost-property tag, a credit). Reading text is 15 px or more, and body copy is 17 px. Text below the floor is enlarged to 13 px, or removed when it repeats something nearby or carries nothing a visitor needs ([#244](https://github.com/3ixas/eliasb.dev/issues/244)).
- **One text scale.** Text under 24 px uses five steps, each a token in `stretch-tokens.css`: `--text-label` 13 px (mono labels, dates, counts, print), `--text-small` 15 px, `--text-body` 17 px, `--text-lead` 19 px and `--text-quote` 22 px. A size may move up one step at a wider breakpoint, but never off the scale. Display type (the name, section headings, posters) stays fluid, each size fitted to its own space.

## Fasteners

A Fastener fastens only what would be held to a surface: a screenshot on its tile, a sheet of paper on a wall. A card that is simply a card has none ([#242](https://github.com/3ixas/eliasb.dev/issues/242)). Where one belongs, there is one per object and never more. The card itself stays clean and the image carries the colour.

- The homepage carries six: the three Featured tiles, the PRD card, tape on the training poster and a push pin on the history clipping. The book, film, Now making and GitHub cards have none.
- Elsewhere: the case-study PRD, the Next-project tile and a Role story's certificate.
- **Tape**: lifts on hover. More transparent in dark.
- **Paperclip**: swings on hover.
- **Push pin**: presses on hover. Not to be confused with an award pin, which is part of a Staff pass.
- A Fastener is decoration on a card, never a stand-in for content, and reduced motion removes its movement.

## Components

> **Approved, not yet built** (the design review, [#190](https://github.com/3ixas/eliasb.dev/issues/190)). Work becomes **Staff passes** on one rail, replacing Now and How I got here ([#194](https://github.com/3ixas/eliasb.dev/issues/194)), and How I work gains **Margin notes**, with the honest line moving to each Case study's "Where it stands" ([#195](https://github.com/3ixas/eliasb.dev/issues/195)). Each Role story opens on its Staff pass and gains figures ([#198](https://github.com/3ixas/eliasb.dev/issues/198)). Until they're built, the Work and How I work rows below describe the live site. The tickets win over the spec for this work (see the rule at the top), and `GLOSSARY.md` already uses the new terms.

| Component | Notes |
|---|---|
| Hero | Name (capped at 28svh) with the role line under it, real `h1`, supporting line, *See my work* and *Say hello*, portrait tilted 3° (2° on phones) with a cobalt "Based in London" label |
| Featured tile | Up to three, in the project's colours; the first spans two columns; outline number, name, outcome, metadata, tilted screenshot (±1–1.5°), one Fastener |
| Project index row | Number, name, outcome, type, year; turns cobalt with an arrow nudge on hover or focus and previews its screenshot; thumbnail and single tap on phones |
| How I work | Three habit and proof beats, the honest line, the PRD card |
| Work | Now (role line, three proofs, a link to the Role story), Where I'm headed (a line and three strands, each with a proof and a link) and How I got here: rows in the Project index's style, newest first, dates, role, organisation and a one-line note, a whole-row link to the Role story and History with none |
| Off the clock | Training poster (today in cobalt), book, film, history clipping, **Now making** (pulsing cobalt "now"), GitHub year grid (today in cobalt) |
| Theme | The Eclipse: an icon-only sun (light) or crescent moon (dark), named "Dark theme", pressed while the dark theme is in force |
| Case study | Opening band in the project colour, section links, a neutral reading column about 720 px wide, framed figures, PRD card with evidence strip, Next-project tile |
| Signature entrance | Homepage only; timings in the spec |

## Motion

- Springs for movement, short fades for state; the entrance and tile timings are in the spec.
- Scroll sway uses CSS scroll-driven animations with a still fallback.
- Theme changes crossfade over 0.3 s with `cubic-bezier(0, 0, 0.38, 0.9)`, or switch instantly with reduced motion.
- Reduced motion removes all movement and keeps 0.2 s fades, except theme changes which are instant. Content never waits for motion, apart from the entrance's guarded hold (ADR 0005).

## Phones

Designed at 320 to 390 px, below about 760 px: single-column cards, 16 px gutters, targets at least 44 px, no page-level horizontal scroll. Below 900 px the header shows the theme button and Menu only, with the greeting inside a full-screen menu dialog, so a tablet never gets a two-row header. The GitHub grid scrolls inside its card and opens on today. Tablets use the desktop page layout with a narrower grid, under the phone header until 900 px.

## Accessibility

WCAG 2.2 AA. Server-rendered content from first paint. A visible focus ring on every interactive element. The entrance never delays what assistive technology can read.
