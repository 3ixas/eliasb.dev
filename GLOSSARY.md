# Personal site

Language for Elias's public presence at eliasb.dev.

## Language

**Personal site**:
Elias's public corner of the internet, containing professional work, interests, and ideas in a thoughtful, beautiful, personal experience.
_Avoid_: Online CV, LinkedIn replacement

**Stretch direction**:
The visual direction chosen for the from-scratch redesign on 8 October 2026 ([#107](https://github.com/3ixas/eliasb.dev/issues/107)). It has a clean neutral base with enough expressiveness to stay interesting: the **Cobalt accent** used large, Bricolage Grotesque condensed at display size with JetBrains Mono for metadata, Work tiles in each **Project colour**, and **Fasteners** on cards. It replaces the Board.
_Avoid_: Board, playful theme (its play comes from scale and colour, not from added objects)

**Cobalt accent**:
The site's one accent colour (`#2340ff` in light, `#8b9cff` in dark). It may be used large, and marks Elias's name, today and now, and the way to say hello. It never colours a project.
_Avoid_: Using it for project tiles or as decoration

**Project colour**:
The colours a project already has in its own interface, carried by its Work tile and swatches: Threshold gold, Argus Risk blue, Flowtime copper. The work carries the colour; the page stays neutral.
_Avoid_: Recolouring projects in the Cobalt accent

**Case study**:
A project's own page at `/work/[slug]`, short and in its **Project colour**: Where it started, What I wrote down first, Decisions, How it's built, Where it stands, What I'd do next, then the next project. Every number comes from the project's own records, and "Where it stands" says plainly what isn't launched or measured ([#112](https://github.com/3ixas/eliasb.dev/issues/112)).
_Avoid_: Case file, long write-up

**Project index**:
The newest-first list under **Featured work** that holds every other project worth talking through in an interview. Each row has a number, name, one-line outcome, type, and year, with a screenshot that previews on hover or focus. It shows about ten rows, then links to the **Work archive**.
_Avoid_: Grid of every project, filters on the homepage

**How I work**:
The homepage section with three beats (start from a real problem, write it down first, measure whether it works), each with one true proof, and an honest line that Elias's own projects are not yet launched or measured.
_Avoid_: Claims of users or impact

**Where I've been**:
The homepage section that tells Elias's path on a **Career ruler**, with his story as one-line notes and CV-level milestones as markers. It replaces the **About section**.
_Avoid_: About, long biography

**Off the clock**:
The homepage section for Elias's own time: his training week, what he is reading and last watched, the weekly history clipping, **Now making**, and his GitHub contributions. Each item is a **Live signal** with a fallback.
_Avoid_: Library, Personal signals, Board

**Now making**:
The **Off the clock** item showing the project Elias is building in his own time, in one line. It replaces the **Making pin**.
_Avoid_: Experiments, Lab

**Fastener**:
The single small prop on a card's edge: tape, a paperclip, or a pin. There is at most one per object, the card itself stays clean, and the image carries the colour.
_Avoid_: Prop that stands in for content, more than one per card

**Career ruler**:
Where I've been, shown as a vertical log, oldest first: each stage has its dates, a bar (cobalt for the current role), the role, and the organisation, with story beats as one-line notes and milestones as marked lines beneath it ([#110](https://github.com/3ixas/eliasb.dev/issues/110)).
_Avoid_: Red string, timeline pins

**Board** (superseded):
The site's organising metaphor: a well-kept studio wall where Elias pins things he is making, reading, watching, and thinking about. Pins sit at slight angles, can overlap a little, and are swapped as life changes. Replaces Cabinet of Curiosities as the name of the visual direction. Superseded on 8 October 2026 by the **Stretch direction** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: Cabinet, dashboard, widget grid

**Pin** (superseded):
One item placed on the Board, such as a project, a book, a film, a playlist, or this week's history clipping. A pin earns its place only while it has something current or meaningful to show; a stale or empty pin is removed rather than displayed. Superseded on 8 October 2026 by the **Stretch direction** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: Widget, card (when meaning the Board item)

**One-page home**:
The canonical scrollable homepage where the primary navigation moves between six authored sections of one narrative: Hero, Work, How I work, Where I've been, Off the clock, and Say hello ([#106](https://github.com/3ixas/eliasb.dev/issues/106)).
_Avoid_: Making Library, Lab, or About separate primary destinations.

**Featured work**:
Up to three of Elias's strongest projects, chosen by hand and shown as big tiles in their **Project colour**, above the **Project index**. A featured project needs a case study, a screenshot, and its colours.
_Avoid_: Treating the homepage as a complete project archive.

**Work archive**:
The `/work` page: the full **Project index**, newest first, with filters (Products, Systems, Experiments) once there are more than 10 projects ([#112](https://github.com/3ixas/eliasb.dev/issues/112)). A project with a **Case study** links to it; others link to the live site or the code.
_Avoid_: Limiting the Work destination to the homepage selection.

**Primary audience**:
People seeking founding engineers or product engineers who care about product thinking, design, UI, UX, and code. Elias's title is **Software engineer**. **How I work** shows that he also decides what is worth building and checks whether it works, so the evidence makes the product claim, not the title. Fellow builders are also an important audience.

**Signature entrance**:
The Commissioner-style opening on every load and reload ([#109](https://github.com/3ixas/eliasb.dev/issues/109)): the headline types alone on a blank page, moves up into the hero, then the name settles, the portrait swings in, the label presses on, and the rest of the page arrives, in about 5 s. It can't be skipped, it doesn't replay on back-navigation, and reduced motion gets the finished page. The content is in the HTML throughout.
_Avoid_: Loader, interaction gate, anything else that holds the page

**Living area** (superseded):
The parts of the site that can grow through notes, experiments, cultural entries, or discoveries without a publishing schedule. Superseded on 8 October 2026 by the **Stretch direction** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: Blog, feed

**Lab** (superseded):
The legacy name for experiments, works in progress, making notes, and playful technical experiences. Superseded on 8 October 2026 by **Now making** under **Off the clock** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: Treating Lab as a separate publishing destination or confusing it with the main Work archive.

**Making pin** (superseded):
The Pin showing what Elias is building right now, in one line with one image. It replaces the Experiments section. When nothing is current, it shows his latest public repository instead. Superseded on 8 October 2026 by the **Stretch direction** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: Experiments section, Lab

**Weekly clipping** (superseded):
This week's history Pin: one surprising, source-linked fact shown like a newspaper cutting, which opens to reveal the week's other two. Superseded on 8 October 2026 by the **Stretch direction** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: History widget, history panel

**Maker of clarity**:
Elias's positioning. He builds everyday software, end to end, that makes complicated things simple, useful, and beautiful. It is an aspiration, never a claim of adoption or impact.
_Avoid_: Claims of users, traction, or "can't live without" as a fact

**Experiments section** (retired):
A former compact homepage section for Lab material. It is replaced by **Now making**.

**Library** (superseded):
The public primary-navigation label for the unified Personal signals section. It takes visitors to the existing one-page collection and does not create a separate Library page. Superseded on 8 October 2026 by the six-section homepage ([#106](https://github.com/3ixas/eliasb.dev/issues/106)); kept for history.
_Avoid_: Treating the legacy `/library` path as a separate content system.

**Personal signals section** (superseded):
The single homepage section reached by the **Library** navigation item. Its stable anchor remains #outside-work. It gathers current building, London status, training, fantasy football, reading, cinema, music, and history as personal signals alongside the case studies. Its cards can be grouped and arranged according to the material rather than a fixed taxonomy. Superseded on 8 October 2026 by the six-section homepage ([#106](https://github.com/3ixas/eliasb.dev/issues/106)); kept for history.
_Avoid_: Splitting personality across separate Now and Library sections, or presenting science fiction as a standalone category without enough material to support it.

**About section** (superseded):
The homepage's long-form personal section containing Elias's professional context, connecting thread, interests, portrait, and contact links. The white-tux portrait is the chosen primary image for this section. Superseded on 8 October 2026 by the six-section homepage ([#106](https://github.com/3ixas/eliasb.dev/issues/106)); kept for history.
_Avoid_: A detached profile page that repeats the homepage story.

**Live signal**:
A recently refreshed piece of personal or professional activity, displayed with its update time and a deliberate fallback when its source is unavailable.
_Avoid_: Widget

**Snapshot**:
A small site-owned record derived from an external source and retained as the last known good state for public display.
_Avoid_: Live API response

**Interaction island**:
A focused interactive component inside an otherwise pre-rendered page, used for experiences such as the signature entrance or a data visualization.
_Avoid_: Making an entire page client-rendered for one interaction

**Authored content**:
Project stories, the **Now making** entry, the training week, status, and other material Elias maintains directly in version-controlled typed data.
_Avoid_: CMS content
