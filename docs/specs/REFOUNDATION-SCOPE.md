# Scope: Re-found eliasb.dev

Status: **approved** by Elias on 29 September 2026, including the listed assumptions.

## Problem, trigger, and intended outcome

The site was built with GPT-6 Luna in Codex between 13 and 27 September 2026 and is live at `https://www.eliasb.dev`. It is well designed for what built it, but it lacks a layer of polish and refinement that Elias can see without being able to point to one cause. Several requests needed repeated attempts and still landed as poor implementations. The clearest cases are the opening animation (#2, #42, #54, #64, then the production fixes in #73 and #74), site-wide motion (#41, #49, #60, #70), voice (#38, #53, #63), the career story (#37, #47, #58, #63), the GitHub calendar (#44, #56, #67), and weekly history (#36, #46, #57).

Elias is not actively job hunting. There is no deadline and no reason to rush.

**Done** means the re-founded site is live on eliasb.dev and Elias would send it to a founder without caveats.

## Settled decisions

### Depth: re-found, not refine or rewrite

Revisit the product and design decisions from first principles, treating the current site as evidence rather than a requirement. Redesign through Claude Design, then rebuild the presentation layer (components, styling, and motion). Keep the parts of the codebase that hold up: integrations, snapshots and fallbacks, authored content data, and routes.

A full rewrite was rejected because it would discard proven integration behaviour, such as the weekly history cache and the calendar hydration fix. A refinement pass was rejected because the recurring failures come from the presentation and motion layer as a whole, not from isolated defects.

### Fixed and reopened decisions

**Fixed:**

- The audience: people hiring founding or product engineers, plus fellow builders.
- The privacy boundaries.
- The integrations and their truthful fallback behaviour.
- The factual career and project content.
- Next.js on Vercel.

**Reopened:**

- The visual direction.
- The headline and positioning.
- The one-page structure and section order.
- Which personal signals earn a place.
- The motion language.
- The writing voice.

### Process

1. Grilling, which produces this scope.
2. The design phase through `interface-design` in Claude Design: references, a new `DESIGN.md`, screen exploration, and Elias's sign-off. It includes a working motion prototype that Elias approves by feel before any spec is written.
3. `to-spec`.
4. `to-tickets`.
5. `implement`, one ticket per invocation, with rendered verification on every slice.

### Documents

- The glossary moves to the root as `GLOSSARY.md`, formerly `docs/discovery/CONTEXT.md`.
- This file is the canonical scope for the re-foundation.
- Earlier discovery documents, feedback specs, and ADRs stay in place as history.

### Organising metaphor: the Board

The site is a **Board**: a well-kept studio wall Elias has pinned things to. This follows his own description of what he likes, "a live active board that I've stuck things on", and explains why objects are tilted and why they change. It replaces Cabinet of Curiosities as the name of the visual direction. The design phase explores the Board theme; it is not yet a finished visual system.

### Positioning: maker of clarity

The site presents Elias as a **maker of clarity**. He builds everyday software, taking ideas end to end as a product engineer, and makes complicated things simple, useful, beautiful, and easy to use. The aim is software people would not want to live without.

That aim is an **aspiration**, never a claim of existing adoption or impact. The projects show the thread concretely: Threshold makes moving costs clear, Argus Risk makes risk state visible, and Flowtime makes focus recoverable. The exact headline wording is settled in the design phase with the typing rhythm in mind. "Maker of clarity" sets the direction, and the end-to-end product arc goes in the supporting line.

### Structure

Keep the One-page home, the `/work` archive, and the stable `/work/[slug]` case studies. Work comes before the personal part of the Board. The case-study pages are in scope for the redesign because they are the proof for the hiring audience.

### Which pins earn a place

Fewer pins, and each one current.

- **Keep:** GitHub, the current book, the latest film, music, weekly history, and London.
- **Fantasy football:** follows the game calendar.
  - From Tuesday until Thursday kickoff: last week's result and the season record, for example "Won 124.3–98.1 last week".
  - During game windows: the live score.
  - Off-season: the pin is removed entirely.
- **Training:** shows that Elias trains. The written weekly schedule is removed. It is replaced by a real photo of Elias running (source: `~/Downloads/IMG_1421.HEIC`, supplied 29 September 2026) with a short caption he writes. When Strava has data, it adds live weekly session counts: counts only, never routes, locations, or health data. The existing classifier already groups Strava activities into Lift, Run, Muay Thai, and Other, so lifts count if they are recorded in Strava.
- **Experiments:** no longer a separate section with one item. It becomes a pinned "thing I'm making" on the Board.
- **Weekly history:** one newspaper-style clipping pinned to the Board. It shows the week's single most surprising fact with its image and opens to reveal the other two. Selection, sourcing, and caching stay automatic through the existing Wikimedia curation and cache. The visual treatment belongs to the design phase.

### How messy the Board is

- **Hero and Work:** pinned carefully. They are large, nearly straight, and generously spaced, which is the clarity part.
- **Personal pins:** looser, with more tilt, some overlap, and smaller sizes.
- **Case-study pages:** clean reading pages with only a hint of the Board, such as a pinned screenshot or a margin note.
- **Themes:** both light and dark stay. The design phase decides what the Board looks like at night.

### Interaction

The Board is composed by Elias. Visitors do not drag pins in v1. Pins respond with physical micro-interactions: they lift and straighten slightly on hover or focus, and show a pressed state on touch. Drag may come later if the design phase makes a strong case for it.

### Opening

Keep the typed headline and the hand-drawn highlight. They replay on every fresh load or reload, with no replay button.

Three new rules:

- The opening never replays on back-navigation from a case study.
- All page content is in the HTML and visible from first paint. The opening animates only the headline; everything else enhances what is already visible and is never hidden while waiting for JavaScript.
- The opening is built and approved in the design-phase motion prototype before it appears in any ticket.

### Presentation layer (ADR candidate)

- **Motion:** Motion (motion.dev) for springs, scroll-linked movement, and layout transitions. Plain CSS for trivial hover changes.
- **Styling:** the 99 KB `globals.css` is replaced by design tokens (CSS variables generated from the new `DESIGN.md`) plus Tailwind v4, scoped per component.
- **Trade-off:** this adds roughly 30 KB of JavaScript in exchange for a single, consistent motion system.

### About: the career story

About tells Elias's story in his own words, from a spoken source he supplied on 29 September 2026. The source is held privately in Obsidian Personal Knowledge (`10 Areas/Engineering/Notes/eliasb.dev career story (source).md`), not in this public repo.

- All of the story's beats are publishable.
- About opens with history. Elias studied it for love, not as a career plan, and this connects the story to the weekly history clipping and to Professor Past.
- His dad's Greggs campaign is named.
- The friend and the bootcamp are not named.
- No story detail comes from anywhere else.
- Elias confirmed on 29 September 2026 that the Greggs campaign can be mentioned.

### Making pin

The pin shows what Elias is building now, with one line, one image, and typed content he updates. The current entry is "Rebuilding Professor Past from scratch", with a link to v1 on GitHub. If nothing is current, it falls back to his latest public repository from the GitHub data.

### Training pin detail

Show Lift and Run counts from Strava. A Muay Thai category appears automatically only once sessions are recorded. The site says nothing about Muay Thai before then. The photo may be used as supplied, because the location is not near Elias's home. All metadata must be stripped. The Strava production credentials must be confirmed.

### Copy across the whole site

Every public line is rewritten through the copy process: homepage, pins, About, contact, case studies, metadata, and the social image. Facts are preserved.

### Delivery

The re-foundation is built on a long-running branch with Vercel previews. It switches over to production in one go, once it passes the polish bar. The current site gets no interim fixes, so the design and spec work stays focused. The known defects below are folded into the implementation phase.

### Known defects in the current site (to fix in the implementation phase)

- Scroll-reveal leaves panels blank on a fast scroll.
- The fantasy card shows the new week's `0.0 vs 0.0` between game windows.
- "View this week's Wikimedia events" links to the raw REST API JSON (`src/integrations/history.ts`, the live `sourceUrl`). It should link to a human-readable Wikipedia page for the day.

### Leftovers from the first build

- Remove the `/concepts` routes and their renderer. They remain in git history.
- Keep the `/about`, `/library`, and `/lab` compatibility redirects.
- Leave the historical docs in place.

### Standard for every section

The Board, the weekly clipping, and the fantasy calendar rule each rethink a section from what it is for, not only how it looks. Every section, large or small, gets that treatment, because this is what lifts the site to the subjective bar.

### Copy

- Every line is written with the `writing` skill against Elias's voice profile at `Personal Knowledge/99 System/voice-profile.md`. The writing skill's `VOICE.md` is an empty template.
- Each implementation slice gets one copy document, which Elias approves before implementation.
- Rules: plain, concrete, first person, and British spelling. No em dashes. No disclaimers about how the site handles data.

### Definition of polish

**Checkable criteria:**

- No blank or late-appearing content.
- No layout shift.
- One spacing scale and one type scale.
- Shared motion timings, with reduced motion handled.
- Deliberate hover, focus, empty, loading, and stale states for every component.
- Correct at 320, 390, 820, and 1440 px in both themes.
- A fast Lighthouse result.

**Subjective bar:** the wow factor. It has to be a site Elias is proud to share with anyone, and one that would genuinely impress them. He judges it in a side-by-side review against reference sites chosen in the design phase: Commissioner, Sparsh Paliwal, Matthew Yu, and any new ones.

## Taste inputs (from Elias, 29 September 2026)

These are what Elias likes about the current site. None of them is fixed; each can be tweaked, changed, or improved.

- **The E/B logo** with the orange slash.
- **The opening animation**: the typed headline and the hand-drawn highlight.
- **Tilted, placed objects.** Cards sit at slight angles, like a live board Elias has stuck things onto. This suits a personal site.
- **Split-colour headings**, where the last word is italic and in the accent colour.
- **The warm palette and overall feel**, as opposed to the plain black or white backgrounds most personal sites use.
- **Personal texture**: aspects of his life outside work that give the site personality.
- **The idea behind This Week in History**, which shows his love of history. He likes the idea, but the execution could be better.

What Elias dislikes is overall, not specific: the site "looks nice, it looks good, but it's not fully there yet". The missing layer is polish and refinement.

### Observed on the live site (29 September 2026)

- A fast scroll leaves whole panels empty, because scroll-reveal hides content until it fires.
- The fantasy card shows `0.0 vs 0.0`.
- All styling lives in one hand-written 99 KB `globals.css`. There is no motion library and no component tests.

## Carried-forward constraints (unchanged from the first build)

- **Privacy:** never show private repository names or activity details, other fantasy managers' identities, routes, exact locations, health data, or confidential employer detail.
- **Pins that fail:** each pin fails independently. It keeps its last-known-good snapshot and falls back to authored content, never to raw errors or empty widgets. Under the Board rules, a pin with nothing current is removed.
- **Browsers:** current Safari, Chrome, Firefox, and Edge on desktop and mobile. Core content works without advanced animation.
- **Theme:** follows the system appearance, with a manual light/dark override.
- **Analytics:** privacy-conscious page-view and performance analytics only.
- **No new services:** no CMS, no paid services, and no new third-party credentials beyond those already configured.

## Explicit exclusions

- Visitor-draggable pins, which may come later.
- An Apple Health or Apple Fitness integration.
- A new codebase or framework change.
- Rebuilding Professor Past (it is Elias's separate project; only its pin is in scope).
- Interim fixes to the current production site.

## Assumptions (accepted 29 September 2026)

- **Social image:** the metadata and social share image are redesigned as part of the new visual system.
- **Accessibility:** the target is WCAG 2.2 AA.
- **Performance:** "fast Lighthouse" means mobile Performance ≥ 90, plus Accessibility, Best Practices, and SEO at 100 on the homepage and one case study.
- **Browser tests:** rendered browser checks become a committed Playwright suite in the repo, replacing the one-off `/tmp` scripts used so far.
- **Cutover:** the current production deployment is the rollback target, through Vercel instant rollback.

## Risks

- **The subjective bar may not be reached in one design pass.** Mitigation: the design phase ends only with Elias's sign-off, and the motion prototype is judged by feel.
- **The Board could tip into novelty clutter.** Mitigation: the tidiness levels above, and removing any pin that has nothing current.
- **Personal content goes stale.** Mitigation: the fallbacks for the making pin and the fantasy pin, and the rule that a stale pin is removed.

## Next steps

1. Design phase through `interface-design` in Claude Design, including the motion prototype.
2. `to-spec`.
3. `to-tickets`.
4. `implement`, one ticket per invocation.
