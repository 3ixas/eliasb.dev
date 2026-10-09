# Spec: the Stretch redesign of eliasb.dev

Published as [#114](https://github.com/3ixas/eliasb.dev/issues/114) (`ready-for-agent`).

Synthesised on 8 October 2026 from the map [#100](https://github.com/3ixas/eliasb.dev/issues/100) and its resolved tickets #101–#113, the [Claude Design canvas](https://claude.ai/artifact/QLwnYXRfSBsi8zD6kJdMpD), the approved copy in `docs/content/redesign-copy.md`, `GLOSSARY.md`, and the throwaway prototypes on branch `prototype/stretch-motion`. Terms follow the glossary.

## Problem Statement

Elias's site was built around the **Board**, a studio-wall metaphor of pins, sticky notes, props and a lamp. In his words it drifted into "too playful… a bit too gimmicky", and it no longer resembles the mature personal sites he originally wanted. It also tells the wrong story for his audience. It presents a software engineer's projects, but not how he decides what's worth building or how he knows something works. Its hero line claims he improves things "after it ships", which isn't yet true of his own projects. Work is hard-wired to three projects, although he'll keep building more. People hiring founding or product engineers need to see the work, the reasoning and an honest status quickly, on any device, in a site that feels expressive without feeling like a toy.

## Solution

A from-scratch front end in the **Stretch direction**, keeping the existing data layer: integrations, snapshots and fallbacks, routes, and case-study facts.

- **Look:** a clean neutral page; Elias's **Cobalt accent** used large for his name, "today/now" and "Say hello"; each project in its own **Project colour**; Bricolage Grotesque condensed at display size with JetBrains Mono for metadata; one **Fastener** per physical-looking object.
- **Homepage sections:** Hero, Work, How I work, Where I've been, Off the clock, Say hello.
- **Work:** up to three hand-picked featured tiles, then a newest-first **Project index** that scales to any number of projects.
- **Case studies:** short and evidence-led.
- **Signature entrance:** a Commissioner-style opening that plays on every load.
- **Theme:** light and dark through a "Lights" pill.
- **Throughout:** a phone layout designed at 320–390 px, and copy that is short and true throughout.

## User Stories

**Visitors: first impression**
1. As a visitor, I want the homepage to open with Elias's headline typing on its own and the page assembling around it, so that the site feels crafted and memorable.
2. As a visitor, I want the whole opening to finish in about 5 seconds, so that I'm never kept waiting long.
3. As a visitor who reloads the homepage, I want the opening to play again, so that the site behaves consistently, like Commissioner.
4. As a visitor going back to the homepage from a case study, I want the finished page immediately, without the opening, so that navigating doesn't punish me.
5. As a visitor with reduced motion turned on, I want the finished homepage at once, with no opening and no movement, so that the site respects my setting.
6. As a screen-reader user, I want the full homepage content available from the start, so that the visual opening never delays what I can read.
7. As a search engine, I want all homepage content in the server-rendered HTML, so that the site is indexed completely.
8. As a visitor whose script fails or is blocked, I want the finished page rather than a blank one, so that a failure never hides the site.
9. As a visitor, I want to see Elias's name at display size in cobalt, his title "Software engineer", his headline and his supporting line on the first screen, so that I know who he is straight away.
10. As a visitor, I want *See my work* and *Say hello* in the hero, so that I can act immediately.

**Visitors: Work**
11. As a hiring manager, I want up to three featured projects shown as large tiles in each project's own colours, so that I see the best work first.
12. As a hiring manager, I want each featured tile to show its number, name, one-line outcome, type and year, so that I can choose one to open.
13. As a hiring manager, I want every other project listed newest-first in a typographic index, so that I can see the breadth of the work.
14. As a mouse or keyboard user, I want hovering or focusing an index row to turn it cobalt and preview its screenshot beside the list, so that I can browse quickly.
15. As a phone user, I want a small screenshot beside each index row and a single tap to open it, so that I can browse without hover.
16. As a visitor, I want the homepage index to stop at about ten rows with *All work (n)*, so that the homepage stays a homepage as projects grow.
17. As a visitor, I want a featured tile's tilted screenshot to straighten when I hover or focus it, so that the work invites a closer look.
18. As a phone user, I want screenshots to straighten as they pass the middle of the screen, so that the same idea works without hover.
19. As a visitor, I want the tape, paperclip and pin fasteners to react subtly on hover, so that the props feel physical.

**Visitors: How I work and Where I've been**
20. As a hiring manager, I want three short habits, each with one true proof, so that I understand how Elias decides what to build and checks whether it works.
21. As a hiring manager, I want an honest line that his own projects aren't launched or measured yet, so that I can trust the rest.
22. As a visitor, I want Where I've been shown as a vertical log, oldest first, with dates, roles, organisations, one-line story notes and milestone markers, so that I can follow his path at a glance.
23. As a visitor, I want the current role marked in cobalt, so that I can see where he is now.

**Visitors: Off the clock**
24. As a visitor, I want this week's training as a poster with today marked in cobalt, so that I get a sense of his life outside work.
25. As a visitor, I want the current book with its cover and the last film with its poster, so that the section has real colour.
26. As a visitor, I want the week's history oddity as a newspaper clipping with its image, so that his love of history shows.
27. As a visitor, I want *Now making* with a cobalt "now" mark, so that I can see what he's building in his own time.
28. As a visitor, I want his GitHub year as the familiar square grid in the site's style, with today in cobalt, so that the activity is readable at a glance.
29. As a phone user, I want the GitHub year to swipe inside its card, opening on today, so that the page itself never scrolls sideways.
30. As a phone user, I want today's training as a large card over the week's seven days, so that it fits a narrow screen.
31. As a visitor, I want every live item to keep its shape with a written fallback when its source is empty, so that the section never looks broken.

**Visitors: theme**
32. As a visitor, I want the site to follow my device's light or dark setting, so that it feels native.
33. As a visitor, I want a "Lights on / Lights off" pill to switch the theme and remember my choice, so that I stay in control.
34. As a visitor, I want the theme never to flash the wrong colours on load, so that the page feels solid.
35. As a visitor, I want switching the lights to crossfade calmly over 1.2 seconds, or 0.2 seconds with reduced motion, so that it feels like light.
36. As a visitor in dark mode, I want project tiles to keep a visible edge, so that they don't merge into the page.

**Visitors: navigation and mobile**
37. As a desktop visitor, I want the London clock, Lights and the section links in the header, so that I can move around and see the live state.
38. As a phone visitor, I want only Lights and Menu in the header, with a full-screen menu of big section names and the clock inside it, so that the header stays clean.
39. As a keyboard user, I want the menu to move focus to Close and return it to Menu on Escape or Close, so that I never lose my place.
40. As a phone user, I want the name to fill the screen width without breaking, and every target at least 44 px tall, so that the layout feels designed rather than shrunk.

**Visitors: case studies and the archive**
41. As a hiring manager, I want each case study in a fixed order (Where it started, What I wrote down first, Decisions, How it's built, Where it stands, What I'd do next), so that I can find the reasoning and the honest status.
42. As a hiring manager, I want an evidence strip of real numbers from the project's own records, so that the claims are concrete.
43. As a reader, I want short copy, wide screenshots in the project's colour and a link to the next project, so that I can read quickly and keep going.
44. As a reader, I want case studies to open immediately with no opening sequence, so that I get straight to the content.
45. As a visitor, I want `/work` to list every project as index rows, newest first, with filters (Products, Systems, Experiments) once there are more than ten, so that I can browse everything.
46. As a visitor on an old link, I want `/about`, `/library` and `/lab` to land on the matching homepage section, so that old links still work.
47. As a visitor who lands on a missing page, I want a short 404 with a way back to the homepage, so that I'm not stuck.
48. As someone sharing a link, I want the social image to show Elias's name and headline in the new type, so that shares look like the site.

**Elias: maintaining the site**
49. As Elias, I want to choose the featured projects by editing one ordered list, so that curating Work stays deliberate.
50. As Elias, I want to add a project by adding one catalogue entry (name, outcome, type, year, links, screenshot, colours), so that Work grows without design work.
51. As Elias, I want case-study content held as typed data in the new section structure, so that writing a case study is filling in fields.
52. As Elias, I want all approved copy kept in the repository's content modules, so that copy changes are reviewable diffs.

## Implementation Decisions

**Architecture and records**
- The data layer stays: integrations, snapshots and fallbacks, case-study facts and routes (ADR 0001). The presentation layer is rebuilt on Motion and design tokens (ADR 0004).
- **A new ADR 0005 records the Stretch redesign.** It supersedes ADR 0003's section list and navigation, the Library label, and the About section. It also amends ADR 0004's first-paint constraint to: "content is in the server HTML from first paint; visually, only the homepage's signature entrance may hold the page, for about 5 seconds; nothing else ever gates content." The Board-era `docs/design/DESIGN.md` becomes history, and a new design document records the Stretch tokens and the components below.
- **Fantasy football is removed:** its pin, fixtures, Sleeper fetching and copy. The Spotify playlist and the London photo also leave the page. Their integration modules are deleted, not just hidden, so no unused secret or refresh remains.
- **Routes:** `/`, `/work`, `/work/[slug]` (stable URLs), and the 404. `/about` redirects permanently to `/#where-ive-been`; `/lab` and `/library` to `/#off-the-clock`. Homepage anchors: `#work`, `#how-i-work`, `#where-ive-been`, `#off-the-clock`, `#say-hello`.

**Design tokens**

| Token | Light | Dark |
|---|---|---|
| Page | `#fbfbf8` | `#0d0d12` |
| Ink | `#111114` | `#f1f1f4` |
| Muted | `#5a5a63` | `#a2a2ad` |
| Rule | `#dcdcd6` | `#2a2a33` |
| Card | `#f0f0ea` | `#17171f` |
| Cobalt | `#2340ff` | `#8b9cff` |
| On cobalt | `#ffffff` | `#0d0d12` |
| Tile edge | none | `#2a2a33` hairline |

All text pairs pass WCAG 2.2 AA (5.7:1–18.2:1, #108). Project colours are data on each project, for example Threshold `#1a1714` field, `#c08a5a` swatch, `#f2efe9` ink.

**Type:** Bricolage Grotesque (variable `opsz`, `wdth`, `wght`), self-hosted through `next/font`. Display text is at 75% width, weight 800, uppercase. JetBrains Mono is for metadata. The self-hosted Newsreader and its accents subset retire. The social image draws from the self-hosted Bricolage.

**Content model (typed modules)**
- *Project catalogue:* each entry has slug, name, outcome, type, year, links (case study, live, code), screenshot (image, alt text, size), colours (field, ink, swatch), and an optional fastener (tape, paperclip, pin). It also holds the hand-ordered list of up to three featured slugs, with a build-time check that each featured project has a case study and a screenshot.
- *Index:* the catalogue minus the featured projects, newest first. Inclusion is editorial: only work Elias would talk through in an interview. Today that's Ask Professor Past v1 (linking to its live site), Home Secretary and Risk Event Tracker. Connect Four is out.
- *Case study:* opening (number, name, outcome, metadata, stack, links, hero screenshot), six sections keyed `where-it-started`, `written-down-first`, `decisions`, `how-its-built`, `where-it-stands`, `whats-next`, and a PRD card (quote, date) plus an evidence strip of up to four `{value, label}` items. A figure can attach to any section. It ends with the next project.
- *How I work:* three `{habit, proof}` beats, the honest line, and the PRD card's caption.
- *Career log:* stages, each with dates, role, organisation, an `isCurrent` flag, notes (each with an optional "when" label) and milestones (text, when).
- *Off the clock:* the training plan (an authored week, with today computed in Europe/London) plus the existing book, film, clipping, Now making and GitHub signals, each with live and fallback copy.
- All copy comes from `docs/content/redesign-copy.md`.

**Homepage composition**
- **Hero:** the name at 32vw on phones (no wrap, capped on desktop), the headline (a real `h1`), the supporting line, two actions, and the portrait tilted 3° (2° on phones) with a cobalt "Software engineer" label. On desktop the portrait sits to the right of the name; on phones it's stacked below the actions.
- **Work:** the featured tiles (the first spans two columns), each in its project colour, with its outline number, name, outcome and metadata, a screenshot tilted ±1–1.5°, and one fastener. Then the index rows, the preview, and *All work (n)*.
- **Each section's header:** a giant condensed uppercase heading with a mono note and counts where true ("06 things I've built · 03 I'm proudest of").

**The signature entrance (homepage only)**
- **Server render:** the finished page.
- **Holding the page:** a pre-paint inline script marks the document as "entering" only when reduced motion is off and the page wasn't restored from the back-forward cache. While entering, every section except the typed overlay is visually held. It stays in the accessibility tree, and the real `h1` is complete throughout. The typed text is an `aria-hidden` overlay, as today.
- **Failure:** a safety timeout releases the hold if the sequence hasn't finished within 7 seconds, and any script error releases it at once.
- **Client-side return:** navigating back to `/` from another page never re-enters.
- **Timings,** taken from the prototype (`prototypes/stretch-motion`, tip `ff0d834`), to the whole page in about 5 s:

```
start             200 ms
type              38 ms/char · 28 ms/space · 420 ms pause after the comma
"feel simple."    spring(bounce 0.3, visualDuration 0.45); underline starts at +200 ms, 0.52 s cubic-bezier(0.23,1,0.32,1)
move into place   spring(0.15, 0.7)   (fade 0.3 s instead if the h1's slot is below the fold)
name settle       +100 ms into the move; per letter translateY(0.18em→0) and font-stretch 100%→75%, spring(0.35, 0.55), 35 ms stagger
portrait swing    +200 ms after the name starts; rotate 9°→3°, translateY(−14px→0), spring(0.4, 0.6)
label press       when the move ends; scale 1.25→1, spring(0.45, 0.3)
header + support  fade 0.5 s when the move ends
rest of the page  fade 0.5 s when the name and portrait settle
```

**Other motion**
- **Tile hover or focus:** the screenshot springs to rotate 0, −6 px, scale 1.02 (spring 0.25, 0.35).
- **Fasteners on hover:** the tape lifts, the paperclip swings, the pin presses.
- **Scroll sway:** tiles and cards drift up to 14 px and tilt at most 0.6°, using CSS scroll-driven animations with a still fallback.
- **Phones:** screenshots straighten when centred, scroll-driven.
- **Index rows:** cobalt plus an arrow nudge on hover or focus.
- **Now making:** the dot pulses.
- **The clock** just ticks.
- **Reduced motion:** removes all movement and keeps 0.2 s fades.

**Theme:** the existing controller's behaviour carries over: system or remembered preference, a pre-paint boot script, and choosing the device's theme returns to following the device. The control becomes the "Lights on / Lights off" pill: a button whose pressed state means "on". The theme crossfades over 1.2 s with `cubic-bezier(0.42,0,0.58,1)`. The browser's toolbar colour follows the page background. Fastener tape is more transparent in dark.

**Phones (below about 760 px)**
- **Header:** Lights and Menu only, with a full-screen menu dialog. The clock lives in that dialog.
- **Layout:** single-column cards, 16 px gutters, targets at least 44 px, and no page-level horizontal scroll.
- **Contained scrolling:** only the GitHub grid scrolls sideways, inside its card, opening on today and reachable by keyboard.
- **Where I've been:** dates sit above each role.
- **Tablets:** use the desktop layout with a narrower grid.

**Case studies and the archive**
- **Case study layout:**
  - an opening band in the project's colour
  - a row of section links
  - a neutral reading column about 720 px wide
  - wide figures framed in the project's colour
  - the PRD card with the evidence strip
  - a Next-project tile
- **Cobalt:** used only for "Say hello", and these pages have no entrance.
- **Archive:** the full index, with filters rendered only when the catalogue has more than ten entries.
- **Ask Professor Past** gets no case study until v2 ships.

## Testing Decisions

**What makes a good test here:** assert what a visitor or assistive technology can observe in the rendered page (text, roles, accessible names, focus, computed colour and contrast, layout bounds, timing of visible states), never component internals. Signal states are driven through the existing fixtures routes, not network mocks inside components.

**Seam 1, the main one: Playwright against rendered pages.** Prior art: `e2e/*.spec.ts`, `e2e/support/contrast.ts`, `rendered-contrast.ts`, `focus-contrast.ts` and `motion-diagnostics.ts`. Specs to build:
- **Entrance:**
  - the `h1`'s accessible name is complete throughout
  - the typed overlay appears, then the page is fully visible within 6 s
  - the opening replays on reload but not on a back-forward-cache restore or a client-side return
  - reduced motion shows the finished page immediately
  - a blocked script still shows everything
- **Homepage sections:** order, anchors, headings and counts; featured tiles from the curated list; index order and its ten-row cap; *All work (n)*.
- **Off the clock:** each item live and in fallback, via fixtures; the GitHub grid's text alternative; today marked.
- **Theme:** device preference, a remembered choice, no wrong-theme flash, the Lights pill's state and name, and the dark tile edge.
- **Contrast:** every token pair, and text over project colours.
- **Phones (390 and 320):** no page-level horizontal scroll, the name doesn't wrap, the menu dialog's focus behaviour, targets of at least 44 px, and the GitHub grid scrolls within its card.
- **Case studies:** six sections in order, the evidence strip, Next project, and no entrance.
- **Archive:** order, and filters absent at 10 or fewer projects.
- **Redirects:** `/about`, `/lab` and `/library` land on the right anchors.
- **404:** copy, and the link home.

**Seam 2: the existing contract scripts.**
- `verify:signals`, `verify:routes` and `verify:release` keep guarding the data layer and routes.
- `verify:opening` is rewritten for the new entrance timings, or retired in favour of the Playwright entrance spec.
- A build-time catalogue check enforces "featured needs a case study and a screenshot".

**Running tests:** one worker locally, the relevant specs only, and the full suite only with Elias's approval.

## Out of Scope

- Changing integrations, snapshot storage or their refresh, other than removing fantasy, Spotify and the London photo.
- A CMS or database.
- Ask Professor Past's case study, which waits for v2.
- New projects or screenshots beyond capturing the three index screenshots (Ask Professor Past v1, Home Secretary, Risk Event Tracker).
- Analytics, which are still planned but not installed.
- WebGL, sound, entry gates, or any opening on pages other than the homepage.
- Visitor-draggable objects.

## Further Notes

- **Visual reference:** the canvas boards *C · Stretch*, *Work at scale · A*, *Personal · Chosen*, *Case study · Chosen* and its phone version. Motion and phone behaviour: `prototypes/stretch-motion` and `prototypes/stretch-mobile` on `prototype/stretch-motion`. The prototypes are reference, not production code.
- **Screenshots still needed:** the three index screenshots must be captured before launch, or those rows ship without a preview. Risk Event Tracker is an API, so its screenshot is likely its API documentation page.
- **Tests to retire:** the Board's tests (`board`, `fantasy`, `about`, `drawer`, `culture-corner`, the opening's "rest of the Board is there from the first frame") retire with the components they cover. Their behavioural intent carries into the new specs above.
