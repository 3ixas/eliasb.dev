# STRETCH.md: the Stretch direction

The live design reference for eliasb.dev. It replaces `DESIGN.md` (the Board), which is kept as history. Decisions are in [ADR 0005](../adr/0005-stretch-redesign.md); scope, motion timings and tests are in the [spec](../specs/STRETCH-REDESIGN-SPEC.md) ([#114](https://github.com/3ixas/eliasb.dev/issues/114)); approved copy is in `docs/content/redesign-copy.md`; terms follow `GLOSSARY.md`. When this file and the spec disagree about a value, the spec wins; fix this file.

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

- **Cobalt** marks Elias's name, "today" and "now", and the way to say hello. It never colours a project, a tile or decoration. Case studies use it only for *Say hello*.
- **Project colours** appear on a project's Work tile, its case study's opening band and framing, and its swatches. The page behind stays neutral.
- Colour never carries meaning alone.

## Type

- **Bricolage Grotesque** (variable `opsz`, `wdth`, `wght`), self-hosted through `next/font`. Display text is at 75% width, weight 800, uppercase. Body copy uses the same family at normal width.
- **JetBrains Mono** for metadata, counts, dates and section notes.
- The name fills the screen on phones (32vw, no wrap) and is capped on desktop. Section headings are giant, condensed and uppercase, with a mono note and true counts ("06 things I've built · 03 I'm proudest of").
- Newsreader is retired.

## Fasteners

One per physical-looking object (a tile, a card, the portrait), and never more. The card itself stays clean and the image carries the colour.

- **Tape**: lifts on hover. More transparent in dark.
- **Paperclip**: swings on hover.
- **Pin**: presses on hover.
- A Fastener is decoration on a card, never a stand-in for content, and reduced motion removes its movement.

## Components

| Component | Notes |
|---|---|
| Hero | Name, real `h1`, supporting line, *See my work* and *Say hello*, portrait tilted 3° (2° on phones) with a cobalt "Software engineer" label |
| Featured tile | Up to three, in the project's colours; the first spans two columns; outline number, name, outcome, metadata, tilted screenshot (±1–1.5°), one Fastener |
| Project index row | Number, name, outcome, type, year; turns cobalt with an arrow nudge on hover or focus and previews its screenshot; thumbnail and single tap on phones |
| How I work | Three habit and proof beats, the honest line, the PRD card |
| Career ruler | Vertical, oldest first; dates, bar (cobalt for the current role), role, organisation; notes and milestone markers |
| Off the clock | Training poster (today in cobalt), book, film, history clipping, **Now making** (pulsing cobalt "now"), GitHub year grid (today in cobalt) |
| Lights | "Lights on / Lights off" pill: a button whose pressed state means on |
| Case study | Opening band in the project colour, section links, a neutral reading column about 720 px wide, framed figures, PRD card with evidence strip, Next-project tile |
| Signature entrance | Homepage only; timings in the spec |

## Motion

- Springs for movement, short fades for state; the entrance and tile timings are in the spec.
- Scroll sway uses CSS scroll-driven animations with a still fallback.
- Theme changes crossfade over 1.2 s with `cubic-bezier(0.42, 0, 0.58, 1)`, or 0.2 s with reduced motion.
- Reduced motion removes all movement and keeps 0.2 s fades. Content never waits for motion, apart from the entrance's guarded hold (ADR 0005).

## Phones

Designed at 320 to 390 px, below about 760 px: single-column cards, 16 px gutters, targets at least 44 px, no page-level horizontal scroll. The header shows Lights and Menu only, with the clock inside a full-screen menu dialog. The GitHub grid scrolls inside its card and opens on today. Tablets use the desktop layout with a narrower grid.

## Accessibility

WCAG 2.2 AA. Server-rendered content from first paint. A visible focus ring on every interactive element. The entrance never delays what assistive technology can read.
