# Mature, playful personal sites: a reference library

Research for [#101](https://github.com/3ixas/eliasb.dev/issues/101), part of the map [#100](https://github.com/3ixas/eliasb.dev/issues/100) "A more mature Board".

**Question:** which 12–15 live personal or portfolio sites are mature yet playful, and what do they do that the current Board does not? For each, its colour base and where colour comes from, how tactile props are executed, how sections are named, and any theme change that comes from the site's subject.

**Answer in brief:** the mature sites keep the canvas almost colourless (off-white `#f7f7f7`–`#fdfdfc` or near-black `#0a0a0a`–`#1c1a17`) and let real images carry all the colour. When they use props, they use one per object and rarely more than a handful per page, drawn realistically and at small scale. Sections get plain labels ("Work", "Where I've been", "Off the clock"). The only theme or mode changes that read as mature come from the owner's subject: a lamp seller's light switch, a person's "living space" with its lights, a Notes-app clone for someone who writes in notes. This supports Elias's suspicion: a neutral base with objects carrying their own colour, plus one subject-derived light change, is the pattern that recurs.

## Method and limits

- Every site below was loaded in a real browser on **8 October 2026** and screenshotted at desktop width. Background and text colours, font stacks and heading text were read from computed styles in the live DOM, so the hex/RGB values are measured, not guessed.
- Prop counts and execution notes come from scrolling the home page. They describe the home page only, not case-study pages.
- Where a mechanism was observed but not explained by the site (Spencer Chang's lights), the note says what was seen and marks the cause as inference.
- Existing references in [`docs/design/DESIGN.md`](../design/DESIGN.md) are reused where they still earn a place (Commissioner, Matthew Yu, Rauno Freiberg, In Common With). The rejected references (Maggie Appleton, Henry Heffernan, Craig Mod, Frank Chimero) are excluded. Henry Desroches (henry.codes) below is a different person from the rejected Henry Heffernan.
- Sites checked and left out: Paco Coursey, Jakub Krehel, Benji Taylor, Josh Puckett, Brian Lovin, Samuel Kraft (mature but not playful: text lists on a dark or white field); Lochie Axon (deliberately brutalist); Fons Mans (studio landing page); Cassie Evans (site retired, now a farewell note); tonsky.me (bright yellow base, the opposite of the brief).

## The bar: Commissioner

### 1. Commissioner — David Ukauwa, design engineer

[commissioner.design](https://commissioner.design)

- **Colour base:** `rgb(247, 247, 247)` canvas, `rgb(20, 20, 20)` text. Grey serif (BIZ UDPMincho) for the voice, a pixel mono (Bitcount Grid) for metadata, a handwriting face (Kalam) used sparingly.
- **Where colour comes from:** only the project captures. The Grain card is a real app screenshot with its own green; the SalonCentric card is a black brand panel. The page itself adds no colour.
- **Props:** one prop per project card, each different and drawn realistically: a steel paperclip on Grain, a strip of crumpled tape on SalonCentric, a torn bottom edge on the SalonCentric image. Props sit on the card's corner; the card itself stays a clean white rounded rectangle. A tilted sticker-like card sits near the top of the work section. Roughly 3–5 props across a long page.
- **Sections:** plain H2s: "Latest work / projects", "Where I've been", "Awards I've picked up along the way", "I've got your back with…", "Off the clock" (with "Cats", "Painting", "Running"). Each project row carries a one-line description and mono metadata, for example "Design Strategy · UX · Visual, 2025".
- **Theme change:** none observed on the home page.
- **Take:** the order and plain labels Elias already chose for the homepage match this site almost exactly. The lesson is the ratio: one restrained prop per card, card stays clean, metadata in a second typeface, the screenshot does the colour.

## Sites that carry colour through real images

### 2. Matthew Yu — designer and engineer

[matthewyu.dev](https://matthewyu.dev)

- **Colour base:** cool grey `rgb(230, 233, 237)`, text `rgb(29, 31, 34)`, Futura.
- **Colour:** the hero is a real sketchbook spread (blue ink city drawing of Taipei with a red seal stamp); the work grid below is full-bleed product shots, merch photos and phone mockups, each bringing its own palette.
- **Props:** one signature object, the sketchbook, paged with arrows and captioned by city ("TAIPEI"). Nothing else on the page is decorated.
- **Sections:** four nav words, "work", "play", "about", "inspiration"; one "PROJECTS" heading.
- **Theme change:** none.
- **Take:** a single personal artefact, photographed rather than drawn, can be the whole playful layer. The Board's clipboard or training log could be that one object, shot or rendered realistically, with everything else kept plain.

### 3. Rachel How — designer, video lead at Mobbin

[rachelhow.com](https://www.rachelhow.com)

- **Colour base:** warm off-white `rgb(253, 252, 249)`, text `rgb(34, 34, 39)`, PP Mori.
- **Colour:** every card is a photo or screen capture of a real experiment (a webcam snowboarding game, embroidered dumpling stickers, a snack museum on a monitor). The colour is loud but contained inside rounded image frames.
- **Props:** none drawn. The playfulness is in the projects themselves.
- **Sections:** a greyed one-line identity after the name, then "Fun experiments I did recently", a plain sentence as a section label.
- **Theme change:** none observed.
- **Take:** playful content on a quiet canvas reads as confident, not childish. Section labels can be plain sentences in Elias's own voice.

### 4. Raphael Salaja — design engineer

[raphaelsalaja.com](https://www.raphaelsalaja.com)

- **Colour base:** white, near-black text (`lab(9.8 0 0)`), Inter.
- **Colour:** a grid of small UI captures (a toast, a 404, a colour picker) supplies all of it.
- **Props:** none.
- **Sections:** "Work" with a count badge ("19+"), then "Library" for writing.
- **Take:** a count beside a section label is a cheap, grown-up signal of depth. The Board could label "Work" the same way.

### 5. Linus Rogge — design engineer at SPACING

[linusrogge.com](https://linusrogge.com)

- **Colour base:** white, black text, Fragment Mono.
- **Colour:** a single strip of about 20 photo thumbnails along the bottom of the viewport; everything above it is black type.
- **Props:** none; one sound toggle in the corner.
- **Sections:** none on the home page beyond the name, role and four links.
- **Take:** the extreme version of "images carry colour". Useful as a floor: if a Board section has no real image, it may need less decoration, not more.

## Sites with tactile or object-led play, done maturely

### 6. Steve Ruiz — founder of tldraw

[steveruiz.me](https://www.steveruiz.me)

- **Colour base:** white, black text, Fira Sans.
- **Colour:** hand-drawn hero illustrations in tldraw's own line style, with a single yellow sticky-note fill.
- **Props:** the drawings are the props, and they come straight from his product: the style is what tldraw draws.
- **Sections:** "Home" and "About"; posts listed plainly.
- **Theme change:** a standard sun-icon toggle (not subject-derived).
- **Take:** the clearest case of a playful visual language earned by the subject. A sticky note reads as mature here because sticky notes are what his tool makes. The Board's stickies need the same reason to exist (for example, notes that are genuinely Elias's working notes on a project).

### 7. Henry Desroches — design engineer (not the rejected Henry Heffernan)

[henry.codes](https://henry.codes)

- **Colour base:** `rgb(250, 250, 250)`, text `rgb(42, 39, 34)`, Neue Montreal with a condensed display face and an italic serif.
- **Colour:** almost none. A black-and-white engraved illustration and black condensed headlines; colour only in a thin rainbow rule at the top.
- **Props:** the whole home page is set as a newspaper front page ("TRUE TERRORS of the NEW DARK WEB"), with a dateline that includes the weather and coordinates, an "editor's letter" and "selected works".
- **Sections:** every nav item carries a one-line gloss, for example "Articles — Polished, complete guides and essays", "Notes — The tending of seeds and saplings of ideas", "Now — Current focus…". Groups are labelled "GARDEN" and "META".
- **Theme change:** none.
- **Take:** this is what the Board's newspaper clipping looks like when it commits to the typography of a newspaper rather than the shape of one. The gloss-under-label pattern directly fixes "sections are unclear".

### 8. Rauno Freiberg — interaction designer, Vercel

[rauno.me](https://rauno.me) (already in DESIGN.md)

- **Colour base:** grey `rgb(237, 237, 237)` page, white slides, black text.
- **Colour:** one saturated yellow circle behind the hero type; otherwise the slides hold project captures.
- **Props:** none; the play is in interaction (a horizontal deck with a tick-mark scrubber).
- **Sections:** short tags, "DD", "Craft", "Projects".
- **Take:** one saturated shape on a neutral field is enough accent for a whole page. It argues for a single accent colour on the Board, used once per view.

### 9. Mackenzie Child — design engineer

[mackenziechild.me](https://www.mackenziechild.me)

- **Colour base:** near-black (`lab(2.5 0.2 -0.9)`), white text, Pressura.
- **Colour:** a dithered green-tinted portrait, company logos in their own colours on the timeline, and project images in "Highlighted work".
- **Props:** a "Career journey" panel: a vertical year ruler (2008–2027) with each role as a bar spanning its dates, plus life milestones in small caps ("Bought my first MacBook – secured Photoshop"). An age counter ticks in decimals.
- **Sections:** small uppercase labels on each panel: "ABOUT ME", "ROLE", "FOCUS", "STACK", "EXPERIENCE", "SUPERPOWER", "CAREER JOURNEY", "HIGHLIGHTED WORK".
- **Take:** this is the mature version of the Board's red-string timeline. Same idea (where I've been, in order), carried by a precise ruler and real dates instead of string and pins.

### 10. Tim Ritter — design engineer

[tim.cv](https://tim.cv)

- **Colour base:** `rgb(17, 17, 15)`, warm grey text `rgb(184, 180, 169)`, Akkurat Mono.
- **Colour:** a single red for his name and for "London" on an ASCII-dot map of the places he has lived and worked (Manchester, Birmingham, Essen, Brussels).
- **Props:** the ASCII map is the one object.
- **Sections:** "Home", "Projects", "Craft", "Writing".
- **Take:** a "Where I've been" section can be a map rather than a timeline, and one accent colour can mark "here, now". Shows the accent doing a job (current location) rather than decorating.

### 11. Amelia Wattenberger — research engineer

[wattenberger.com](https://wattenberger.com)

- **Colour base:** white, navy text `rgb(15, 43, 61)`, Parclo serif.
- **Colour:** a green gradient inside the last letters of her name, a single blue flower-shaped badge ("this site is WIP"), then interactive diagrams further down.
- **Props:** one badge sticker in the corner of the hero.
- **Sections:** uppercase labels plus sentence-case subheads: "I'M THINKING ABOUT...", "PREVIOUS WRITINGS", "What I'm currently noodling on", "What I've been building at work".
- **Take:** a coloured treatment on the end of the name is the same move as Elias's italic last word; here it is the only colour above the fold. Supports keeping that device and dropping other warm colour.

## Sites where the theme or frame comes from the subject

### 12. Spencer Chang — artist and engineer

[spencer.place](https://spencer.place)

- **Colour base:** in the first load, a cream `rgb(255, 250, 224)` paper texture; on a later load the same layout rendered on a dark blue-grey night texture. Vulf Sans and a serif body.
- **Colour:** small inline emoji-like icons next to key phrases, a paper-lantern lamp illustration, a calendar tile and a live "ppl" counter.
- **Props:** a paper lamp, a date tile, a status box ("ppl", "time", "energy"). About five, all part of one conceit.
- **Sections:** sidebar verbs: "welcome", "describe", "collaborate", "create", "write", then "Now & Upcoming".
- **Theme change:** the site's own hint reads "a living space actively shaped by visitors. Change the lights…". The light state changed between two loads (day, then night with a moon beside "NA-PST"). **Inference:** lighting follows shared visitor state or his local time; the site does not say which.
- **Take:** a lamp-driven theme change is credible when the site is framed as a room. If the Board is a studio wall, the light should be the studio's light (time of day in London, or a desk lamp that is actually on the wall), not a generic toggle.

### 13. Ryo Lu — head of design at Cursor

[ryo.lu](https://ryo.lu)

- **Colour base:** `rgb(17, 17, 17)`, light grey text, NB International Mono.
- **Colour:** none on the page; a tiny OS-style clock widget in the corner.
- **Props:** none drawn. The play is live data: a headline that states where he is ("Ryo is exploring Taipei.") and a last-seen line naming the place and district.
- **Sections:** verb links in caps, "READ JOURNAL", "FURNISH MY HOME", "EXPLORE RYOS", then "PAST WORK" listing companies. Language switch EN/中/日.
- **Take:** the typed headline can carry true, current state (what Elias is building or training for this week) instead of a prop. That is playful and adult at once.

### 14. Alana Goyal — managing partner, basecase

[alanagoyal.com](https://www.alanagoyal.com)

- **Colour base:** a faithful macOS desktop with a dark Notes window (`rgb(26, 26, 26)`), system fonts.
- **Colour:** the system's own yellow selection, emoji in note titles, the Dock icons.
- **Props:** the entire site is one object, a working Notes app. Sections are notes grouped by date the way Notes groups them: "Pinned", "Today", "Yesterday", "Previous 7 Days", with notes such as "about me", "principles", "reading list".
- **Theme change:** none; the frame itself is the theme.
- **Take:** the boldest version of subject-derived play, kept mature by being exact. The caution for the Board: an imitation only works if it is precise; a half-real cassette player reads as a toy.

### 15. Lynn Fisher — designer for the web

[lynnandtonic.com](https://lynnandtonic.com)

- **Colour base:** `rgb(17, 17, 17)` with a single red `rgb(255, 59, 59)` for all type, Sydonia Atramentiqua display face.
- **Colour:** one colour only.
- **Props:** none on the index. The play is the annual redesign: the footer marks this as "v. XIX".
- **Sections:** a book-style table of contents with dot leaders and Roman numerals: "ABOUT … I", "WORK … II", "THOUGHTS … III", "ARCHIVE … IV".
- **Theme change:** a moon glyph sits under the version number.
- **Take:** a numbered contents list is a crisp way to mark sections on a long scroll. A Board equivalent could number pins or sections the way a studio numbers its boards.

### Anchor (not a personal site): In Common With

[incommonwith.com](https://www.incommonwith.com/collections/all-products), already in DESIGN.md. Confirmed live: the collection page still has a "Light:" control labelled "Toggle Lighting" beside "All Products¹⁰⁰", on an off-white canvas with thin oxblood rules, where the lamps themselves carry the colour (red glass shades). It remains the clearest example of a theme change that comes from what the business sells.

## Patterns that recur

1. **A neutral canvas, measured.** Of the 15 sites, 13 put content on a background with no meaningful hue: off-white or light grey (`#f7f7f7`, `#fafafa`, `#fdfcf9`, `#ededed`, white) or near-black (`#0a0a0a`–`#1c1a17`). The two exceptions are both whole-site conceits: Spencer Chang's cream paper (a room that swaps to night) and Alana Goyal's macOS wallpaper (around a neutral dark Notes window). None uses a brown or umber base.
2. **Colour lives in the evidence.** Screenshots, photos, sketchbook scans and logos supply nearly all the colour. Where the page itself adds colour, it is one accent used for one job: Tim Ritter's red marks where he is now; Rauno's yellow circle sits behind his name; Wattenberger's gradient sits inside her name.
3. **One prop per object, few per page, drawn true.** Commissioner uses one paperclip, tape strip or torn edge per card, about 3–5 on the page, rendered realistically and small. Matthew Yu has exactly one object. Nobody stacks several prop types on one card or uses cartoon outlines.
4. **The card stays clean; the prop sits on its edge.** Props attach to a plain rectangle rather than replacing it, so the content's layout never depends on the prop.
5. **Plain section names, often with a gloss or count.** "Work", "Where I've been", "Off the clock", "Fun experiments I did recently", "Work 19+", "Articles — Polished, complete guides and essays", "I. About". Labels say what is there; the personality is in the gloss.
6. **Metadata in a second typeface.** Commissioner, Tim Ritter, Ryo Lu and Henry Desroches set dates, disciplines and status in mono or small caps beneath a humane display face. It reads as a professional's index.
7. **Subject-derived play beats added play.** The props that read as mature come from the owner's work or life: tldraw's drawing style, a real sketchbook, a Notes app, a career ruler with real dates, a live location line. Theme changes that work are lighting in a room or a lamp shop.
8. **Live, true state is a playful device.** Ryo's "last seen" line, Mackenzie's ticking age, Spencer's visitor counter. Small, factual, and current.

## Implications for a more mature Board

These are recommendations for the map's design and grilling tickets, not decisions.

1. **Change the base to near-white and near-black.** Replace plaster and umber with a neutral off-white (around `#f7f7f5`) and a neutral near-black (around `#111110`). Keep Newsreader. Let the pinned objects carry colour: project screenshots, the book cover, the film still, real photos. This is the single change most consistent across the references.
2. **One accent, one job.** Keep the italic, differently coloured last word in the headline and use the same accent only for "now" states (current project, this week's training). Drop every other warm tint.
3. **Cut prop types to one per pin, and attach rather than replace.** Each pin becomes a clean card or image with at most one realistic fastener (paperclip, tape, pin) or edge treatment (torn, folded). Retire props that are a whole cartoon object standing in for content (the cassette player and neon sign are the likeliest candidates), or redraw them photographically.
4. **Name sections plainly and add a gloss.** Use the agreed order (Hero → Work → How I work → Where I've been → Off the clock → Contact) as visible labels, each with a one-line gloss in the second typeface, and a count where it helps ("Work · 6").
5. **Turn the red-string timeline into a ruler.** Follow Mackenzie Child or Tim Ritter: real dates on a precise scale, or a small map, for "Where I've been". The string can survive as a single thin line, not a prop.
6. **Make the newspaper clipping typographic.** Borrow from henry.codes: a real masthead, dateline and column rules set in type, rather than a beige paper shape.
7. **Tie the light switch to the studio, or drop it.** The lamp only earns its place if the Board is literally a studio wall with a lamp on it, and the change reads as light falling on objects (In Common With, Spencer Chang), ideally following London time. A generic light/dark switch styled as a lamp is the bolted-on version.
8. **Let the headline carry live, true state.** A typed line that says what Elias is building or training for right now is more mature play than another object.

## Sources

All accessed 8 October 2026.

- Commissioner (David Ukauwa): <https://commissioner.design>
- Matthew Yu: <https://matthewyu.dev>
- Rachel How: <https://www.rachelhow.com>
- Raphael Salaja: <https://www.raphaelsalaja.com>
- Linus Rogge: <https://linusrogge.com>
- Steve Ruiz: <https://www.steveruiz.me>
- Henry Desroches: <https://henry.codes>
- Rauno Freiberg: <https://rauno.me>
- Mackenzie Child: <https://www.mackenziechild.me>
- Tim Ritter: <https://tim.cv>
- Amelia Wattenberger: <https://wattenberger.com>
- Spencer Chang: <https://spencer.place>
- Ryo Lu: <https://ryo.lu>
- Alana Goyal: <https://www.alanagoyal.com>
- Lynn Fisher: <https://lynnandtonic.com>
- In Common With: <https://www.incommonwith.com/collections/all-products>
- Existing references and rejections: [`docs/design/DESIGN.md`](../design/DESIGN.md)
