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

**Fastener**:
The single small prop on a card's edge: tape, a paperclip, or a pin. There is at most one per object, the card itself stays clean, and the image carries the colour.
_Avoid_: Prop that stands in for content, more than one per card

**Career ruler**:
Where I've been, shown as each role on a precise, dated scale rather than a string of pins.
_Avoid_: Red string, timeline pins

**Board** (superseded):
The site's organising metaphor: a well-kept studio wall where Elias pins things he is making, reading, watching, and thinking about. Pins sit at slight angles, can overlap a little, and are swapped as life changes. Replaces Cabinet of Curiosities as the name of the visual direction. Superseded on 8 October 2026 by the **Stretch direction** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: Cabinet, dashboard, widget grid

**Pin** (superseded):
One item placed on the Board, such as a project, a book, a film, a playlist, or this week's history clipping. A pin earns its place only while it has something current or meaningful to show; a stale or empty pin is removed rather than displayed. Superseded on 8 October 2026 by the **Stretch direction** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: Widget, card (when meaning the Board item)

**One-page home**:
The canonical scrollable homepage where the primary navigation moves between authored sections of one narrative: introduction, featured work, personal signals, experiments, about, and contact.
_Avoid_: Making Library, Lab, or About separate primary destinations.

**Featured work**:
A curated selection of Elias's strongest projects shown on the homepage. Its size is intentionally flexible; it represents the work he most wants a visitor to see first.
_Avoid_: Treating the homepage as a complete project archive.

**Work archive**:
The durable Work destination containing the full collection of project case studies. Each substantial project can have its own case-study page with a blog-like narrative and technical depth.
_Avoid_: Limiting the Work destination to the homepage selection.

**Primary audience**:
People seeking founding engineers or product engineers who care about product thinking, design, UI, UX, and code. Elias presents as a **product engineer**: someone who codes and also decides what is worth building, so engineering work is shown alongside how he chooses what to make and how he knows it is working. Fellow builders are also an important audience.

**Signature entrance**:
A brief automatic opening sequence that introduces the site's voice and flows directly into accessible content.
_Avoid_: Splash screen, interaction gate

**Living area** (superseded):
The parts of the site that can grow through notes, experiments, cultural entries, or discoveries without a publishing schedule. Superseded on 8 October 2026 by the **Stretch direction** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: Blog, feed

**Lab**:
The legacy name for experiments, works in progress, making notes, and playful technical experiences. The current visible term is **Experiments**, a compact homepage section.
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
A former compact homepage section for Lab material. It is replaced by the Making pin.

**Library**:
The public primary-navigation label for the unified Personal signals section. It takes visitors to the existing one-page collection and does not create a separate Library page.
_Avoid_: Treating the legacy `/library` path as a separate content system.

**Personal signals section**:
The single homepage section reached by the **Library** navigation item. Its stable anchor remains #outside-work. It gathers current building, London status, training, fantasy football, reading, cinema, music, and history as personal signals alongside the case studies. Its cards can be grouped and arranged according to the material rather than a fixed taxonomy.
_Avoid_: Splitting personality across separate Now and Library sections, or presenting science fiction as a standalone category without enough material to support it.

**About section**:
The homepage's long-form personal section containing Elias's professional context, connecting thread, interests, portrait, and contact links. The white-tux portrait is the chosen primary image for this section.
_Avoid_: A detached profile page that repeats the homepage story.

**Live signal**:
A recently refreshed piece of personal or professional activity, displayed with its update time and a deliberate fallback when its source is unavailable.
_Avoid_: Widget

**Snapshot**:
A small site-owned record derived from an external source and retained as the last known good state for public display.
_Avoid_: Live API response

**Interaction island**:
A focused interactive component inside an otherwise pre-rendered page, used for experiences such as the signature entrance, a tactile book, or a data visualization.
_Avoid_: Making an entire page client-rendered for one interaction

**Authored content**:
Project stories, Experiments entries, Outside work selections, status, and other material Elias maintains directly in version-controlled MDX or typed data.
_Avoid_: CMS content
