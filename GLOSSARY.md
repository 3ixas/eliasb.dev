# Personal site

Language for Elias's public presence at eliasb.dev.

## Language

**Personal site**:
Elias's public corner of the internet, containing professional work, interests, and ideas in a thoughtful, beautiful, personal experience.
_Avoid_: Online CV, LinkedIn replacement

**Stretch direction**:
The visual direction chosen for the from-scratch redesign on 8 October 2026 ([#107](https://github.com/3ixas/eliasb.dev/issues/107)). It has a clean neutral base with enough expressiveness to stay interesting: the **Cobalt accent** used large, Bricolage Grotesque condensed at display size with JetBrains Mono for metadata, **Featured work** tiles in each **Project colour**, and **Fasteners** on cards. It replaces the Board.
_Avoid_: Board, playful theme (its play comes from scale and colour, not from added objects)

**Cobalt accent**:
The site's one accent colour (`#2340ff` in light, `#8b9cff` in dark). It may be used large, and marks Elias's name, today and now, and the way to say hello. It also colours the award pins on a **Staff pass**, wherever the pass appears, as Elias's own achievements ([#198](https://github.com/3ixas/eliasb.dev/issues/198)). It never colours a project.
_Avoid_: Using it for project tiles or as decoration

**Eclipse**:
The theme toggle in the header: an icon-only sun while the page is light and a crescent moon while it is dark. Pressing it eclipses one into the other as the page changes ([#156](https://github.com/3ixas/eliasb.dev/issues/156)). It shows the current theme, is announced as "Dark theme", pressed while dark, and has no outline at rest (it keeps its focus ring for keyboard users), because the theme isn't the focus and the control should be understood at a glance and then ignored. It replaces the "Lights on / Lights off" pill.
_Avoid_: Lights pill, "Lights on / Lights off" (retired wording), a metaphor that needs a second look

**Project colour**:
The colours a project already has in its own interface, carried by its **Featured work** tile and swatches: Threshold gold, Argus Risk blue, Flowtime copper. The work carries the colour; the page stays neutral.
_Avoid_: Recolouring projects in the Cobalt accent

**Employer colour**:
An employer's own hue (BNP Paribas green, Joveen black, Optegra teal), worn the way a **Project colour** is: by its **Role story** and, on the homepage, by its part of **Work**. A hue only, never a logo. The page stays neutral and the Cobalt accent stays Elias's own.
_Avoid_: Employer logos, recolouring employers in the Cobalt accent

**Case study**:
A project's own page at `/things-i-make/[slug]`, short and in its **Project colour**: Where it started, What I wrote down first, Decisions, How it's built, Where it stands, What I'd do next, then the next project. Every number comes from the project's own records, and "Where it stands" says plainly what isn't launched or measured ([#112](https://github.com/3ixas/eliasb.dev/issues/112)).
_Avoid_: Case file, long write-up

**Project index**:
The newest-first list under **Featured work** that holds every other project worth talking through in an interview. Each row has a number, name, one-line outcome, type, and year, with a screenshot that previews on hover or focus. It shows about ten rows, then links to the **Work archive**.
_Avoid_: Grid of every project, filters on the homepage

**How I work**:
The homepage section with three beats (start from a real problem, write it down first, measure whether it works), each with one true proof, and the PRD card beside them. Its identity is **Margin notes**: the beats in reading order, marked up in ink that draws as it scrolls into view, with the PRD as the evidence for writing it down first ([#195](https://github.com/3ixas/eliasb.dev/issues/195)). Honesty about what isn't launched or measured lives in each **Case study**'s "Where it stands", not here.
_Avoid_: Claims of users or impact, colour fields (colour belongs to Work and Things I make)

**Margin notes**:
How I work's hand-drawn layer: a circled number for each beat, an arrow from each beat to the next, one underline under the strongest phrase of each proof, and an arrow to the PRD. Ink only, and it marks what's already there rather than adding words ([#195](https://github.com/3ixas/eliasb.dev/issues/195)).
_Avoid_: Doodles, decoration that marks nothing, highlighting in the Cobalt accent

**Work**:
The homepage section straight after the hero, led by employment. Every employer is a **Staff pass** hanging from one rail, the current one largest, with History as a plain note; **Where I'm headed** follows below. The passes replaced Now and **How I got here** as text ([#194](https://github.com/3ixas/eliasb.dev/issues/194)). Employment leads, so it comes before **Things I make** ([#157](https://github.com/3ixas/eliasb.dev/issues/157)).
_Avoid_: Experience, CV, calling Elias's own projects "Work"

**Staff pass**:
A pass hanging on its lanyard: a strap and clip, Elias's portrait as the ID photo, a top line, a foot with a barcode, and real text, never decoration. It comes in two kinds. An **employer's pass** hangs in **Work** and again at the top of its **Role story**, in its **Employer colour**: the employer, role and dates, one headline number, and a link to its **Role story**. The current pass is the largest and reads "Valid · present"; a past one is stamped "Returned". Awards are pins on the current pass's lanyard. Its content is the employment history ([#194](https://github.com/3ixas/eliasb.dev/issues/194)). On its own Role story it is the opening object rather than a link, and its pins lead to the evidence for each award ([#198](https://github.com/3ixas/eliasb.dev/issues/198)). It carries the lean. The **self-issued pass** is the one pass with no employer: **Where I'm headed**, issued by Elias to himself. It has no **Employer colour** of its own, no pins, no status or dates, and no lean; its fields are the bars of his direction ([#190](https://github.com/3ixas/eliasb.dev/issues/190)).
_Avoid_: Badge, ID card, "Expired" (it can read as "let go"), employer logos

**Things I make**:
The homepage section for Elias's own projects: **Featured work** above the **Project index**, with a count of what he has built, introduced by what the hero used to say: making complicated things feel simple, and taking ideas all the way through ([#159](https://github.com/3ixas/eliasb.dev/issues/159)). It follows **Work**: reordered, not reduced, and keeping its product edge. The **Work archive** and every **Case study** live under `/things-i-make`, and `/work` and the old case-study paths redirect there permanently, one path at a time, since `/work/[employer]` now holds the **Role story** pages ([#157](https://github.com/3ixas/eliasb.dev/issues/157), [#158](https://github.com/3ixas/eliasb.dev/issues/158)).
_Avoid_: Work (that means employment), On my own

**How I got here** (superseded):
Superseded by the **Staff passes** ([#194](https://github.com/3ixas/eliasb.dev/issues/194)); its note survives under the Work heading. Was the last part of **Work**: the earlier roles as compact rows, newest first, in the **Project index** style (dates, role, organisation, a one-line note), each linking to its **Role story**. History has a row but no link. A one-line note frames the changes of craft as evidence for the direction rather than as a record. It replaces the **Career ruler** ([#157](https://github.com/3ixas/eliasb.dev/issues/157)).
_Avoid_: Timeline, oldest first, the full CV

**Where I've been** (superseded):
The homepage section that told Elias's path on a **Career ruler**, with his story as one-line notes and CV-level milestones as markers. It replaced the **About section**. Superseded on 11 October 2026 by **Work**, with **Where I'm headed** and **How I got here** inside it ([#157](https://github.com/3ixas/eliasb.dev/issues/157)); kept for history.
_Avoid_: About, long biography

**Off the clock**:
The homepage section for Elias's own time: his training week, what he is reading and last watched, the weekly history clipping, **Now making**, and his GitHub contributions. Each item is a **Live signal** with a fallback.
_Avoid_: Library, Personal signals, Board

**Now making**:
The **Off the clock** item that follows Elias's latest pushed public GitHub repository (not forks, archives, the profile repository or `personal-portfolio-v1`), refreshed with the page and cached for six hours. A repository that is one of his projects shows the project's name and links to its case study; any other shows its name and GitHub description and links to GitHub. Hidden when GitHub can't be reached. It replaces the **Making pin**.
_Avoid_: Experiments, Lab

**Fastener**:
The single small prop on a card's edge: tape, a paperclip, or a pin. There is at most one per object, the card itself stays clean, and the image carries the colour.
_Avoid_: Prop that stands in for content, more than one per card

**Career ruler** (superseded):
Where I've been, shown as a vertical log, oldest first: each stage has its dates, a bar (cobalt for the current role), the role, and the organisation, with story beats as one-line notes and milestones as marked lines beneath it ([#110](https://github.com/3ixas/eliasb.dev/issues/110)). Superseded on 11 October 2026 by **How I got here** ([#157](https://github.com/3ixas/eliasb.dev/issues/157)); kept for history.
_Avoid_: Red string, timeline pins

**Board** (superseded):
The site's organising metaphor: a well-kept studio wall where Elias pins things he is making, reading, watching, and thinking about. Pins sit at slight angles, can overlap a little, and are swapped as life changes. Replaces Cabinet of Curiosities as the name of the visual direction. Superseded on 8 October 2026 by the **Stretch direction** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: Cabinet, dashboard, widget grid

**Pin** (superseded):
One item placed on the Board, such as a project, a book, a film, a playlist, or this week's history clipping. A pin earns its place only while it has something current or meaningful to show; a stale or empty pin is removed rather than displayed. Superseded on 8 October 2026 by the **Stretch direction** ([#107](https://github.com/3ixas/eliasb.dev/issues/107)); kept for history.
_Avoid_: Widget, card (when meaning the Board item)

**One-page home**:
The canonical scrollable homepage where the primary navigation moves between six authored sections of one narrative: Hero, **Work**, **Things I make**, **How I work**, **Off the clock**, and Say hello ([#106](https://github.com/3ixas/eliasb.dev/issues/106), reordered in [#157](https://github.com/3ixas/eliasb.dev/issues/157)). **How I work** follows **Things I make** because its proofs come from Elias's own projects.
_Avoid_: Making Library, Lab, or About separate primary destinations.

**Featured work**:
Up to three of Elias's strongest projects, chosen by hand and shown as big tiles in their **Project colour** at the top of **Things I make**, above the **Project index**. A featured project needs a case study, a screenshot, and its colours.
_Avoid_: Treating the homepage as a complete project archive.

**Work archive**:
The `/things-i-make` page, headed "Things I make" (moved from `/work`, which redirects, in [#157](https://github.com/3ixas/eliasb.dev/issues/157)): the full **Project index**, newest first, with filters (Products, Systems, Experiments) once there are more than 10 projects ([#112](https://github.com/3ixas/eliasb.dev/issues/112)). A project with a **Case study** links to it; others link to the live site or the code.
_Avoid_: Limiting the archive to the homepage selection.

**Primary audience**:
People seeking founding engineers or product engineers who care about product thinking, design, UI, UX, and code. Elias's title is **Software engineer**. **How I work** shows that he also decides what is worth building and checks whether it works, so the evidence makes the product claim, not the title. Fellow builders are also an important audience.

**Role story**:
An employer's own page at `/work/[employer]` (`bnp-paribas`, `joveen`, `optegra`), telling what Elias did and achieved there, as a **Case study** does for a project: Summary, The role, The problems, Decisions, What changed, then What I took with me, which bridges to the next role. It opens on its **Staff pass**, carries a few figures drawn only from its own facts (such as an award certificate or a to-scale before and after), and has an evidence strip that leaves out what the pass's pins already show ([#198](https://github.com/3ixas/eliasb.dev/issues/198)). It has a length scaled to what there is to tell, and awards told as the result of work rather than listed. It wears the employer's own colour the way a project wears its **Project colour** (a hue only, never a logo), and ends on Next role, newest to oldest. Every employer gets one, including marketing, which is the product edge a typical computer science graduate lacks, shown through product-minded behaviours. Detail is anything he could reasonably brag about in an interview, and never proprietary, so it needs no confidentiality line. Freelance work through platforms (such as AI training) is not an employer and gets a line inside the Joveen story, not a Role story of its own ([#158](https://github.com/3ixas/eliasb.dev/issues/158)). Outside the page it reads as "{role} at {employer} · Elias Bennett", is described by its Summary, and shares as a card in the employer's colour. Its back link, "← Work", returns to the homepage's **Work** section ([#162](https://github.com/3ixas/eliasb.dev/issues/162)).
_Avoid_: Job description, CV entry, a confidentiality disclaimer, employer logos

**Where I'm headed**:
The last part of **Work**, below the **Staff passes**: who Elias wants to become as an engineer (a direction of growth, not a target job or company). It names the direction, not the section, because the section leads with what he does now ([#157](https://github.com/3ixas/eliasb.dev/issues/157)). It hangs as his one self-issued **Staff pass** and reads as striving rather than as a record: a line saying he wants to be really good at this, then three bars (Judgement, Depth, Range) that say what “good” means. Each bar has one existing fact as its “So far”, drawn from his work or his own products and threaded in that source’s colour, so the facts show the climb rather than define the bar ([#190](https://github.com/3ixas/eliasb.dev/issues/190)). The direction covers the next two or three years. It sits alongside **Maker of clarity** and never replaces it.
_Avoid_: Timeline, CV in chronological order, level or job titles ("aspiring Staff"), signals of looking for work ("Not yet issued", "Valid from"), words that claim drive instead of showing it ("passionate", "driven")

**First glance**:
What a skimming recruiter takes from the first screen at a glance: who Elias is, what he does now, and his strongest proof. The **Signature entrance** names BNP Paribas within about a second and completes the First glance at about 4 s ([#160](https://github.com/3ixas/eliasb.dev/issues/160)). It reuses the hero's slots ([#159](https://github.com/3ixas/eliasb.dev/issues/159)): the headline "I build pricing and risk engines at BNP Paribas, and *products of my own.*", so it lands in the entrance's first beat; under the name, the role line "Software Engineer at BNP Paribas CIB"; a supporting line with the stack and both awards; and the portrait label "Based in London". It serves a second audience alongside the **Primary audience** without replacing it, and never repeats the proofs that lead Work's Now. The same story carries off the page: the home title is "Elias Bennett, software engineer at BNP Paribas", and the description and social image lead with the BNP pricing and risk engines and products of my own, so a search result or a shared link does the First glance's job ([#162](https://github.com/3ixas/eliasb.dev/issues/162)).
_Avoid_: Treating the whole site as a CV for skimmers, a separate Now section

**Signature entrance**:
The Commissioner-style opening on every load and reload ([#109](https://github.com/3ixas/eliasb.dev/issues/109)), in two acts inside one typed sentence ([#160](https://github.com/3ixas/eliasb.dev/issues/160)): Act 1, "I build pricing and risk engines at BNP Paribas,", types alone on a blank page so BNP is readable in about a second; the comma is the act break; "and" types and Act 2, "*products of my own.*", drops in with its underline; the finished sentence holds alone for a beat, then moves up into the hero as the name settles with the role line, the portrait swings in, the label presses on, and the rest of the page arrives, in about 4.6 s. The name is capped at about 45% of the screen's height so the First glance fits on the first screen. It can't be skipped, it doesn't replay on back-navigation, and reduced motion gets the finished page. The content is in the HTML throughout.
_Avoid_: Loader, interaction gate, anything else that holds the page

**Signature motion**:
The one motion a surface is remembered by, and the only motion that belongs to it: the **Signature entrance** for the hero, an employer's **Staff pass** lean (a pendulum on touch screens) for **Work** and each **Role story**, the screenshot straightening for **Things I make**, **Margin notes** drawing for **How I work**, the Now making pulse for **Off the clock**, Elias filling with cobalt in the footer for the end of the page ([#200](https://github.com/3ixas/eliasb.dev/issues/200)), and the lost-property tag's swing-in for the 404 page. An object brings its signature with it wherever it appears. The self-issued pass for **Where I'm headed** holds still, so Work's one signature stays the employer passes' lean ([#190](https://github.com/3ixas/eliasb.dev/issues/190)). Everything else that moves is shared (scroll sway, a **Fastener**'s reaction, the theme crossfade) or feedback (a state change that only shows what is hovered, focused or chosen, such as an index row turning cobalt with its arrow nudge), and never counts against a surface's one. A signature is defined by what moves, not by what starts it: a hover can start a signature, as it starts the lean and the straightening ([#199](https://github.com/3ixas/eliasb.dev/issues/199)).
_Avoid_: Calling shared or feedback motion a section's signature, two signatures on one surface

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
Elias's positioning. He builds everyday software, end to end, that makes complicated things simple, useful, and beautiful. It is an aspiration, never a claim of adoption or impact. Since [#159](https://github.com/3ixas/eliasb.dev/issues/159) it introduces **Things I make** rather than heading the hero.
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
Project stories, the training week, status, and other material Elias maintains directly in version-controlled typed data.
_Avoid_: CMS content
