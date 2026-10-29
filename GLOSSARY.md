# Personal site

Language for Elias's public presence at eliasb.dev.

## Language

**Personal site**:
Elias's public corner of the internet, containing professional work, interests, and ideas in a thoughtful, beautiful, personal experience.
_Avoid_: Online CV, LinkedIn replacement

**Stretch direction**:
The visual direction chosen for the from-scratch redesign on 8 October 2026 ([#107](https://github.com/3ixas/eliasb.dev/issues/107)). It has a clean neutral base with enough expressiveness to stay interesting: the **Cobalt accent** used large, Bricolage Grotesque condensed at display size with JetBrains Mono for metadata, **Featured work** tiles in each **Project colour**, and **Fasteners** on cards. It replaces the Board.
Superseded on the homepage and the site shell on 26 October 2026 by the **Quiet index** ([#278](https://github.com/3ixas/eliasb.dev/issues/278)), and on the inner pages the same day ([#301](https://github.com/3ixas/eliasb.dev/issues/301)). Kept as history in `docs/design/history/STRETCH.md`.
_Avoid_: Board, a playful theme of props (its play comes from scale, colour and a few paper objects from one desk, each carrying real content; [#242](https://github.com/3ixas/eliasb.dev/issues/242))

**Quiet index**:
The site's direction since 26 October 2026, first on the homepage ([#278](https://github.com/3ixas/eliasb.dev/issues/278)) and then on every inner page ([#301](https://github.com/3ixas/eliasb.dev/issues/301)); its contract is `docs/design/DESIGN.md`. One quiet column of **Rows**, the opening line as the loudest thing, and character found by looking closer. Anything that names something real can show it, as a **Closer look**. It replaces the Stretch homepage, which grew by addition, and carries a removal rule so it can't grow that way again.
_Avoid_: Minimal (it isn't empty), adding a section-level set piece

**Row**:
The one shape on the **Quiet index**: a 44 px object, a title, one line and quiet metadata, all starting on the same text edge. Projects, employers, strands, habits and personal things are all rows. The object is drawn to read at 44 px (a legible detail of a screenshot, a mini **Staff pass**, a real cover, a calendar tile), never a whole page shrunk down.
_Avoid_: Card, tile, thumbnail of a whole page

**Closer look**:
A **Row**'s detail, shown in the **Margin** on desktop and inline on phones, under the tapped row or paragraph, only when tapped. Each kind arrives the way the real thing would: a pass drops and swings, a book is plucked from a shelf, a ticket tears, a clipping is stamped, the PRD types itself. It uses only approved copy and real assets, has no links of its own (the row is the link), and anything it says that isn't elsewhere is also the row's accessible description. On a long-form page, a closer look shows a real thing the prose only names (a certificate, the cores behind "CPU and GPU"); a figure the paragraph argues from is shown inline instead, never hidden behind a word.
_Avoid_: Tooltip, popover, preview (alone), a closer look that adds facts, hiding a page's evidence behind a closer look

**Margin**:
The 300 px space to the right of the column on wide screens with a pointer, where a **Closer look** appears beside its row on hover or focus. It always fits the window, glides between rows and never covers the column. It is the homepage's signature ([#279](https://github.com/3ixas/eliasb.dev/issues/279)). Not to be confused with **Margin notes**, How I work's ink.
_Avoid_: Stage, sidebar, a standing panel that shows something other than what you're looking at

**Dock**:
Retired ([#302](https://github.com/3ixas/eliasb.dev/issues/302)). It was a compact **Closer look** fixed at the bottom of a phone screen. On phones a closer look now opens inline, under the row or paragraph that was tapped, and only when tapped.
_Avoid_: Bottom sheet, drawer, a closer look that appears as the page scrolls

**Reading line**:
Retired ([#302](https://github.com/3ixas/eliasb.dev/issues/302)). It was the line 38% down a phone screen that put the row crossing it in focus. Nothing on a phone now happens because of where a row sits on the screen.
_Avoid_: Scroll trigger

**Reveal word**:
A word in the opening or supporting line that names something real and can show it: "pricing and risk engines", "CPU and GPU", the digitisation competition, the Take Ownership award. It has a dotted underline that turns cobalt, is focusable, and opens its **Closer look** like a row. "BNP Paribas" reacts where it is instead: it turns BNP green and drops its pass. On phones that reaction is all it does.
_Avoid_: Link styling (it isn't a link), more than a few per line

**Missing row**:
The 404's first **Row**: the address asked for, struck through, with an empty slot for its object and "Not on file" as its line. It is not a link. "Try one of these" and the homepage's five sections follow it, so the page says what didn't work, then what to try ([#301](https://github.com/3ixas/eliasb.dev/issues/301)). It replaces the lost-property tag.
_Avoid_: Error illustration, a set piece on the 404

**Cobalt accent**:
The site's one accent colour (`#2340ff` in light, `#8b9cff` in dark). It may be used large, and marks Elias's name, today and now, and the way to say hello. It coloured the award pins on a **Staff pass** until [#285](https://github.com/3ixas/eliasb.dev/issues/285); **Pass pins** now take their own enamel colours. It never colours a project.
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
A project's own page at `/things-i-make/[slug]`, short, with its **Project colour** carried by its screenshots: Where it started, What I wrote down first, Decisions, How it's built, Where it stands, What I'd do next, then the next project. Every number comes from the project's own records, and "Where it stands" says plainly what isn't launched or measured ([#112](https://github.com/3ixas/eliasb.dev/issues/112)). Its back link, "← Things I make", returns to the Things I make index ([#248](https://github.com/3ixas/eliasb.dev/issues/248)).
_Avoid_: Case file, long write-up

**Project index**:
The newest-first list under **Featured work** that holds every other project worth talking through in an interview. Each row has a number, name, one-line outcome, type, and year, with a screenshot that previews on hover or focus. It shows about ten rows, then links to the **Work archive**.
_Avoid_: Grid of every project, filters on the homepage

**How I work**:
The homepage section of four habits (start from a real problem, write it down first, ship it so it's safe to undo, measure whether it works), each a **Row** with one true proof, then Threshold's PRD as a row whose **Closer look** types the quote. The numbers are ringed, the habits joined and each proof's strongest phrase underlined by the pen, which draws as it scrolls into view ([#296](https://github.com/3ixas/eliasb.dev/issues/296)). The earlier hand-drawn layer, **Margin notes**, is in the history below. Honesty about what isn't launched or measured lives in each **Case study**'s "Where it stands", not here.
_Avoid_: Claims of users or impact, colour fields (colour belongs to Work and Things I make)

**Work**:
On the **Quiet index**, the first section after the opening line: one **Row** per employer (each with a mini **Staff pass**, whose full pass is its **Closer look**), then History at uni, then **Where I'm headed** as three strand rows. The **Pass rail** is in the history below. Employment leads, so Work comes before **Things I make** ([#157](https://github.com/3ixas/eliasb.dev/issues/157)).
_Avoid_: Experience, CV, calling Elias's own projects "Work"

**Staff pass**:
A pass hanging on its lanyard: a strap and clip, Elias's portrait as the ID photo, a top line, a foot with a barcode, and real text, never decoration. It comes in two kinds. An **employer's pass** hangs in **Work** and again at the top of its **Role story**, in its **Employer colour**: the employer, role and dates, one headline number, and a link to its **Role story**. The current pass is the largest and reads "Valid · present"; a past one is stamped "Returned", and its dates say when it ended, with no separate status date ([#244](https://github.com/3ixas/eliasb.dev/issues/244)). Each employer's pass carries three **Pass pins**: its awards or best points. Its content is the employment history ([#194](https://github.com/3ixas/eliasb.dev/issues/194)). On its own Role story it is the opening object rather than a link; its Pass pins are not links either ([#198](https://github.com/3ixas/eliasb.dev/issues/198) made them lead to their evidence; the quiet index retired that). It carries the lean. The **self-issued pass** is the one pass with no employer: **Where I'm headed**, issued by Elias to himself. It has no **Employer colour** of its own, no award pins, no status or dates, and no lean; its fields are the bars of his direction ([#190](https://github.com/3ixas/eliasb.dev/issues/190)).
On the **Quiet index** homepage an employer's pass is a mini pass in its row's slot, and the full pass arrives as the row's **Closer look**, dropping and swinging to rest; Role stories still open on the full pass.
_Avoid_: Badge, ID card, "Expired" (it can read as "let go"), employer logos

**Pass pin**:
An enamel pin with a gilt rim and a glyph, with its label beside it, on an employer's **Staff pass**: three per employer ([#285](https://github.com/3ixas/eliasb.dev/issues/285)). BNP Paribas's are its awards (**Award pins**); Joveen's and Optegra's are their three best points from the copy deck. It is part of the pass, not a **Fastener**, and claims nothing that isn't approved copy.
_Avoid_: Pin (alone), badge, a pin for something with no evidence

**Award pin**:
A **Pass pin** for an award: BNP Paribas's Winner (Digitisation), Take Ownership and AI Champion, as Elias's own achievements. Until [#285](https://github.com/3ixas/eliasb.dev/issues/285) they were cobalt and the only pins.
_Avoid_: Pin (alone), badge

**Print**:
The text on an object, such as a **Staff pass**'s top line, dates and foot, an **Award pin**'s label, or an image credit. It follows the same 13 px floor as the page, so an object never gets smaller text for the sake of realism ([#244](https://github.com/3ixas/eliasb.dev/issues/244)).
_Avoid_: Fine print, small print as an exception to the floor

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
The single small prop on a card's edge: tape, a paperclip, or a push pin. It fastens only what would be held to a surface (a screenshot on its tile, a sheet of paper on a wall), so a card that is simply a card has none ([#242](https://github.com/3ixas/eliasb.dev/issues/242)). There is at most one per object, the card itself stays clean, and the image carries the colour.
Retired from the homepage by the **Quiet index** ([#278](https://github.com/3ixas/eliasb.dev/issues/278)), and from every other page on 26 October 2026 ([#301](https://github.com/3ixas/eliasb.dev/issues/301)).
_Avoid_: Prop that stands in for content, more than one per card, a Fastener on every card, "pin" alone (say push pin, or award pin)

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
On the **Quiet index** they are the first three **Rows** of Things I make; on phones they become swipeable cards with readable screenshots.
_Avoid_: Treating the homepage as a complete project archive.

**Work archive**:
The `/things-i-make` page, headed "Things I make" (moved from `/work`, which redirects, in [#157](https://github.com/3ixas/eliasb.dev/issues/157)): the full **Project index**, newest first, with filters (Products, Systems, Experiments) once there are more than 10 projects ([#112](https://github.com/3ixas/eliasb.dev/issues/112)). A project with a **Case study** links to it; others link to the live site or the code.
_Avoid_: Limiting the archive to the homepage selection.

**Primary audience**:
People seeking founding engineers or product engineers who care about product thinking, design, UI, UX, and code. Elias's title is **Software engineer**. **How I work** shows that he also decides what is worth building and checks whether it works, so the evidence makes the product claim, not the title. Fellow builders are also an important audience.

**Role story**:
An employer's own page at `/work/[employer]` (`bnp-paribas`, `joveen`, `optegra`), telling what Elias did and achieved there, as a **Case study** does for a project: Summary, The role, The problems, Decisions, What changed, then What I took with me, which bridges to the next role. It opens on its **Staff pass**, carries a few figures drawn only from its own facts (such as an award certificate or a to-scale before and after), and has an evidence strip that leaves out what the pass's pins already show ([#198](https://github.com/3ixas/eliasb.dev/issues/198)). It has a length scaled to what there is to tell, and awards told as the result of work rather than listed. It wears the employer's own colour the way a project wears its **Project colour** (a hue only, never a logo), and ends on Next role, newest to oldest. Every employer gets one, including marketing, which is the product edge a typical computer science graduate lacks, shown through product-minded behaviours. Detail is anything he could reasonably brag about in an interview, and never proprietary, so it needs no confidentiality line. Freelance work through platforms (such as AI training) is not an employer and gets a line inside the Joveen story, not a Role story of its own ([#158](https://github.com/3ixas/eliasb.dev/issues/158)). Outside the page it reads as "{role} at {employer} · Elias Bennett", is described by its Summary, and shares as a card in the employer's colour. Its back link, "← Work", returns to the homepage's **Work** section ([#162](https://github.com/3ixas/eliasb.dev/issues/162)).
_Avoid_: Job description, CV entry, a confidentiality disclaimer, employer logos

**Résumé**:
Elias's career on one printable sheet at `/resume`, for a recruiter who wants it in the usual form. The page is an A4 sheet lying on the desk, and what it shows is exactly what prints and what its PDF holds. It stays light paper in the dark theme and carries no **Fastener**, because nothing holds it to a surface. It reads top to bottom: contact details, a one-line summary, each employer's role, dates and a few results, the projects he's proudest of, awards, skills and education. Each employer's results belong to its **Role story**, so the Résumé is another view of the same facts and can't drift from **Work**. It aims for one page and never runs past two. It is linked from Say hello, never from the hero or the main navigation, because the homepage is not a CV ([#247](https://github.com/3ixas/eliasb.dev/issues/247)).
_Avoid_: Online CV, CV page, a Google Drive link, a separately written résumé

**Where I'm headed**:
The last part of **Work**, below the **Staff passes**: who Elias wants to become as an engineer (a direction of growth, not a target job or company). It names the direction, not the section, because the section leads with what he does now ([#157](https://github.com/3ixas/eliasb.dev/issues/157)). It hangs as his one self-issued **Staff pass** and reads as striving rather than as a record: a line saying he wants to be really good at this, then three bars (Judgement, Depth, Range) that say what “good” means. Each bar has one existing fact as its “So far”, drawn from his work or his own products and threaded in that source’s colour, so the facts show the climb rather than define the bar ([#190](https://github.com/3ixas/eliasb.dev/issues/190)). The direction covers the next two or three years. It sits alongside **Maker of clarity** and never replaces it.
_Avoid_: Timeline, CV in chronological order, level or job titles ("aspiring Staff"), signals of looking for work ("Not yet issued", "Valid from"), words that claim drive instead of showing it ("passionate", "driven")

**Signature motion**:
The one motion a surface is remembered by, and the only motion that belongs to it: the **Signature entrance** (in the history below) for the hero, an employer's **Staff pass** lean (a pendulum on touch screens) for **Work** and each **Role story**, the screenshot straightening for **Things I make**, **Margin notes** (in the history below) drawing for **How I work**, the Now making pulse for **Off the clock**, Elias filling with cobalt in the footer for the end of the page ([#200](https://github.com/3ixas/eliasb.dev/issues/200)), and nothing on the 404, which holds still. An object brings its signature with it wherever it appears. The self-issued pass for **Where I'm headed** holds still, so Work's one signature stays the employer passes' lean ([#190](https://github.com/3ixas/eliasb.dev/issues/190)). Everything else that moves is shared (scroll sway, a **Fastener**'s reaction, the theme crossfade) or feedback (a state change that only shows what is hovered, focused or chosen, such as an index row turning cobalt with its arrow nudge), and never counts against a surface's one. A signature is defined by what moves, not by what starts it: a hover can start a signature, as it starts the lean and the straightening ([#199](https://github.com/3ixas/eliasb.dev/issues/199)).
Superseded on the homepage: the **Quiet index**'s signature is the **Margin** itself, and each **Closer look** moves the way its own thing would ([#279](https://github.com/3ixas/eliasb.dev/issues/279)). The inner pages followed on 26 October 2026 ([#301](https://github.com/3ixas/eliasb.dev/issues/301)): a Role story's pass keeps its lean, and nothing else on a long-form page has a signature.
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

## History

Homepage terms the **Quiet index** retired ([#300](https://github.com/3ixas/eliasb.dev/issues/300)). They stay here so older issues and `docs/design/history/` still read.

**First glance**:
What a skimming recruiter takes from the first screen at a glance: who Elias is, what he does now, and his strongest proof. The **Signature entrance** names BNP Paribas within about a second and completes the First glance at about 4 s ([#160](https://github.com/3ixas/eliasb.dev/issues/160)). It reuses the hero's slots ([#159](https://github.com/3ixas/eliasb.dev/issues/159)): the headline "I build pricing and risk engines at BNP Paribas, and *products of my own.*", so it lands in the entrance's first beat; under the name, the role line "Software Engineer"; a supporting line with the stack and both awards; and the portrait label "Based in London". On the screen the headline is the only line that names the employer; the others refer back to it ("the bank's") rather than repeat it ([#243](https://github.com/3ixas/eliasb.dev/issues/243)). It serves a second audience alongside the **Primary audience** without replacing it, and never repeats the proofs that lead Work's Now. The same story carries off the page: the home title is "Elias Bennett, software engineer at BNP Paribas", and the description and social image lead with the BNP pricing and risk engines and products of my own, so a search result or a shared link does the First glance's job ([#162](https://github.com/3ixas/eliasb.dev/issues/162)).
Superseded on 26 October 2026: the **Quiet index** has no hero layout. The opening line does the First glance's job, and the off-page title, description and social image keep doing theirs ([#278](https://github.com/3ixas/eliasb.dev/issues/278)).
_Avoid_: Treating the whole site as a CV for skimmers, a separate Now section, naming the employer twice on the screen

**Signature entrance**:
The Commissioner-style opening on every load and reload ([#109](https://github.com/3ixas/eliasb.dev/issues/109)), in two acts inside one typed sentence ([#160](https://github.com/3ixas/eliasb.dev/issues/160)): Act 1, "I build pricing and risk engines at BNP Paribas,", types alone on a blank page so BNP is readable in about a second; the comma is the act break; "and" types and Act 2, "*products of my own.*", drops in with its underline; the finished sentence holds alone for a beat, then moves up into the hero as the name settles with the role line, the portrait swings in, the label presses on, and the rest of the page arrives, in about 4.6 s. The name is capped at about 45% of the screen's height so the First glance fits on the first screen. Any scroll, tap, click or key press fast-forwards it to the finished page ([#241](https://github.com/3ixas/eliasb.dev/issues/241)), it doesn't replay on back-navigation, and reduced motion gets the finished page. The content is in the HTML throughout.
Retired on 26 October 2026: no surface holds the page. The arrival is the underline drawing, the greeting's scene and the GitHub total counting up, over a page that is already complete ([#280](https://github.com/3ixas/eliasb.dev/issues/280)).
_Avoid_: Loader, interaction gate, anything else that holds the page

**Margin notes**:
How I work's hand-drawn layer: a circled number for each beat, an arrow from each beat to the next, one underline under the strongest phrase of each proof, and an arrow to the PRD. Ink only, and it marks what's already there rather than adding words ([#195](https://github.com/3ixas/eliasb.dev/issues/195)).
Superseded on 26 October 2026: How I work's pen does the same job on four habit rows, ringing the numbers, joining the habits and underlining each proof ([#296](https://github.com/3ixas/eliasb.dev/issues/296)).
_Avoid_: Doodles, decoration that marks nothing, highlighting in the Cobalt accent

**Featured tile** (retired):
The big tile in a project's **Project colour** at the top of **Things I make**, tilted at rest, straightening on hover and carrying a **Fastener**. Retired from the homepage by the **Quiet index** ([#278](https://github.com/3ixas/eliasb.dev/issues/278)): the featured three are the first **Rows** of Things I make, and swipeable cards on phones ([#295](https://github.com/3ixas/eliasb.dev/issues/295)).
_Avoid_: Tile, card (for a **Row**)

**Pass rail** (retired):
The rail on the homepage's Work section from which every employer's **Staff pass** hung, the current one largest, with the History note beneath. Retired from the homepage ([#279](https://github.com/3ixas/eliasb.dev/issues/279)): each employer is a **Row** with a mini pass, and the full pass arrives as its **Closer look**. A **Role story** still opens on the full pass.
_Avoid_: Timeline, a rail on any other surface
