# Mature, playful personal sites: a reference library

Research for [#101](https://github.com/3ixas/eliasb.dev/issues/101), part of the map [#100](https://github.com/3ixas/eliasb.dev/issues/100) "A more mature Board".

**Question:** which 12–15 live personal or portfolio sites are mature yet playful, and what do they do that the current Board does not? For each, its colour base and where colour comes from, how tactile props are executed, how sections are named, and any theme change that comes from the site's subject.

**Answer in brief:** the mature sites keep the canvas almost colourless (off-white `#f7f7f7`–`#fdfdfc` or near-black `#0a0a0a`–`#1c1a17`) and let real images carry all the colour. When they use props, they use one per object and rarely more than a handful per page, drawn realistically and at small scale. Sections get plain labels ("Work", "Where I've been", "Off the clock"). The only theme or mode changes that read as mature come from the owner's subject: a lamp seller's light switch, a person's "living space" with its lights, a Notes-app clone for someone who writes in notes. This supports Elias's suspicion: a neutral base with objects carrying their own colour, plus one subject-derived light change, is the pattern that recurs.

**Update after Elias's ten additions (8 October 2026):** the core conclusion holds; 20 of the 25 sites use a neutral base and let the work carry the colour. Three things changed. Tactile props turn out to be optional rather than the source of maturity, because none of the additions use them and they get their energy from type scale and how the work is presented instead. One accent may be used large when it carries identity. And Work gains a clear model: an index plus one showcase image, with a one-line outcome and the project's own colours. The additions also show a common failure to avoid: seven of the ten hide content behind a loader, intro or gate, which the Board's first-paint rule already forbids.

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

## Elias's additions (8 October 2026)

After the first pass, Elias added ten sites, each with his reason. The method is the same as above: each site was loaded in the built-in browser on 8 October 2026, screenshotted at desktop width, and measured from computed styles. Two caveats apply to this group:

- **Five are studios or agencies, not personal sites:** Obys, Garden Eight, Unseen Studio, Locomotive and PORTO ROCHA. They show composition and art direction made with a team's budget, not a single person's voice. Mat Voyce's site is personal, but its footer credits the studio Uncommon with the design.
- **Several rely on WebGL or heavy motion** (Bruno Simon, Unseen, Garden Eight, Obys, Huy Phan) or on heavy media (Mat Voyce, PORTO ROCHA). That conflicts with the constraints in `DESIGN.md`: "All content in the HTML and visible from first paint", "Content never waits for motion", the anti-goals "Novelty that hides content" and "Blank panels while scrolling", and the earlier rejection of Mohit Virli for "3D, heavy loading, blank first paint".

### First-content timing

These are rough, single cold loads in the built-in browser on a home connection, so the numbers give an order of magnitude, not a benchmark. "FCP" is the browser's first-contentful-paint entry. "Readable content" is when a screenshot first showed the site's real headline or work rather than a loader. "Transferred" adds up `transferSize` for resources loaded by the time of measurement (about 5–15 s); it undercounts cross-origin media that hides its size. The server-HTML check fetched each page with `curl` and stripped scripts and styles.

| Site | Server HTML has text? | FCP | First thing painted | Readable content | Transferred |
| --- | --- | --- | --- | --- | --- |
| Mat Voyce | Yes | 2.2 s | Blue letters animating in on cream | About 8 s for the work grid | About 63 MB (4 videos, 72 images) |
| Dennis Snellenberg | Yes | 0.4 s | Dark loader cycling greetings ("Hello", "Bonjour"…) | About 2–4 s | 0.5 MB |
| Isabel Moranta | Yes | 0.3 s | Black screen with a "( LOADED )" counter | About 5 s | Not reported (11 videos) |
| Huy Phan | Yes | 0.3 s | Black, then a red name wipe | About 1 s (name); work on scroll | 2.7 MB |
| Bruno Simon | Yes, but none of it visible | 3.1 s | Violet grid with a loading ring | About 15 s for the 3D world | About 7.2 MB (1.6 MB physics WASM, 1 MB JS) |
| Obys | Yes | 0.4 s | Black intro with one image | About 5–8 s | Not reliable (38 mostly cross-origin images) |
| Garden Eight | Yes | 1.2 s | Tiny wordmark on dark | 6.1 s (largest paint, the hero type) | 1.9 MB |
| Unseen Studio | Yes | 0.35 s | Pink entry gate: "Enter" or "Enter without audio" | Only after a click | About 7 MB before entering |
| Locomotive | Yes | 0.4 s | Black logo splash | About 2 s (video hero) | 2.1 MB |
| PORTO ROCHA | Yes | 2.6 s | Black | 3.1 s (largest paint, an image) | About 15 MB (344 images) |

**Reading:** all ten put their text in the server HTML, which is good, but **seven of the ten hide it behind a loader, intro or gate** for 2–15 s. Only Huy Phan (about 1 s), Locomotive and Dennis Snellenberg (about 2 s) come close to the Board's rule that content is visible from first paint, and even those three show a splash first. None of the first fifteen sites did this; the nearest was Commissioner's lazy-loaded panels, which `DESIGN.md` already rejects.

### 16. Mat Voyce — type designer and animator

[matvoyce.tv](https://matvoyce.tv/) · Elias's reason: personality. Huge blue italic lettering, playful animated graphics and colourful work; the site expresses his energy as a type designer and animator.

- **Colour base:** cream-white `rgb(255, 254, 248)`, black text, F37 Judge and F37 Judge Extended.
- **Colour:** a giant sky-blue "MAT VOYCE" behind the content, and a wall of saturated lettering tiles, each a piece of his work, filling the first screen. The featured projects ("Olipop TV", "Friends 30th") are full-colour animations.
- **Props:** none. The lettering is the object.
- **Sections:** "His best work / Featured work", "What he does" (Type design & illustration, Type animation, Motion design), "Brands Mat's worked with", "Contact Mat". They are written in the third person, plain and slightly cheeky.
- **Timing:** see the table: about 8 s before the grid is readable, and around 63 MB of video and images.
- **Take:** the play is the craft itself. The canvas stays near-white while the work is as loud as it likes. **Extends** pattern 2: one accent can be huge when it *is* the person's identity (here, his type). **Conflicts** with the first-paint rule and is far too heavy.

### 17. Dennis Snellenberg — freelance designer and developer

[dennissnellenberg.com](https://www.dennissnellenberg.com/) · Elias's reason: a polished designer-developer portfolio. A portrait hero, an oversized moving name, restrained colours and clear navigation.

- **Colour base:** the loader is `rgb(28, 29, 32)`; the hero is a grey studio portrait; the content below sits on white. One custom face, "Dennis Sans".
- **Colour:** almost none outside the project images (a black-and-orange TWICE site, a green-shaded hotel shot).
- **Props:** a black pill badge, "Located in the Netherlands", with a spinning globe; round magnetic buttons ("About me").
- **Sections:** three nav words, "Work", "About", "Contact". Each project shows its name, role and year ("TWICE · Interaction & Development · 2024"); "More work 11" carries a count; the footer shows "Version 2022 © Edition" and "Local time 12:33 PM CEST".
- **Take:** an oversized marquee of the name over a real portrait makes a confident, grown-up hero. The local time in the footer is another live-state detail. The greeting loader is the part not to copy.

### 18. Isabel Moranta — design and art director

[isabelmoranta.com](https://www.isabelmoranta.com/) · Elias's reason: editorial art direction. A dramatic serif, tiny informational text, grainy black backgrounds and empty space.

- **Colour base:** grainy `rgb(8, 8, 8)` with off-white `rgb(239, 239, 238)` text. Ogg (a display serif) set against CentSchbook Mono at a tiny size.
- **Colour:** only the work thumbnails, one of them red; a greyscale hero image.
- **Props:** none. Parentheses act as the graphic device: "( Art Director )", "( Canada )", "( Play showreel )", "( 1 / 8 )", "( Socials )", "( Reach out )", "( Development )".
- **Sections:** "About", "Work", "Archive"; a scroll-driven quotation in huge serif, attributed to Virginia Woolf's *Orlando*; a project viewer with "Project", the client and a counter.
- **Take:** the strongest example of **scale contrast**, enormous serif against tiny mono, and it would suit Newsreader directly. It **supports** a black base. The preloader conflicts with the first-paint rule.

### 19. Huy Phan — designer

[huyml.co](https://huyml.co/) · Elias's reason: inventive project presentation. Imagery, descriptions and credits are arranged in space, giving an exhibition feel in which the work and its supporting information share the screen.

- **Colour base:** light grey `rgb(236, 236, 236)`, black text; BT Grotesk, BT Glyphius and F37 Bolton.
- **Colour:** a red name in the intro, then each project's own imagery. Each project also shows **three colour swatches**, its palette as small chips under the description.
- **Props:** project images fan out and tilt in 3D around a centred caption (a WebGL canvas).
- **Sections:** a huge index number with the total ("01 /19"), then the category ("Agency & Studio"), the project name ("Fromanother"), a one-line description and the palette chips; "Come say hi" closes the page.
- **Take:** the clearest model for **Work on the Board**: number, category, name, one sentence, and the project's own colours shown as swatches. The swatches make "objects carry their own colour" literal. The 3D fan is optional; the information layout is the lesson.

### 20. Bruno Simon — creative developer

[bruno-simon.com](https://bruno-simon.com/) · Elias's reason: the most memorable concept. You drive a car through a 3D world, and the experience itself demonstrates the skill.

- **Colour base:** a violet night grid, then a lit 3D island (a pink tree, low-poly objects). Nunito in the UI.
- **Colour:** the world itself.
- **Props:** the whole site is made of props: a drivable car, and signs and buildings that stand for projects and links.
- **Sections:** places in the world instead of headings; while you drive, the page title becomes an emoji road ("Bruno 🚗 🌳").
- **Timing:** about 15 s to a usable world, with no visible text until then.
- **Take:** this is pattern 7 at full strength: the subject (a creative developer who builds 3D web experiences) *is* the site. For a product engineer the equivalent is not 3D; it is a working product moment. It **conflicts** with almost every Board constraint (first paint, content not waiting for motion, keyboard access, mobile) and is the definition of novelty that hides content. Use it as a test of how strong a concept is, not as a model for execution.

### 21. Obys — design studio (agency)

[obys.agency](https://obys.agency/) · Elias's reason: an unconventional work browser. A sparse white canvas, a vertical ribbon of project images, precise metadata, and vertical, horizontal and grid views.

- **Colour base:** white, black text, a custom "Obys" face.
- **Colour:** the images in the ribbon, mostly muted or greyscale, with the focused one framed by bracket marks.
- **Props:** none; the brackets are the only graphic device.
- **Sections:** a left-hand list of every project name; for the focused project, its sector ("Fashion, Photography"), services ("Creative Direction, Web Design/Dev") and number ("10"); view switches "Vertical, Horizontal, Grid"; and "Work", "About", "Contact".
- **Take:** precise metadata beside one large image is very close to Commissioner's project row, turned into a browser. A list-or-grid switch is a mature, useful interaction for Work. The intro conflicts with first paint.

### 22. Garden Eight — digital design studio, Tokyo (agency)

[garden-eight.com](https://garden-eight.com/) · Elias's reason: typography and atmosphere. A sculptural serif over soft cream 3D forms, with understated navigation.

- **Colour base:** the loader is `rgb(30, 31, 31)`; the hero is a soft cream 3D scene of white sculpted lizards and birds; text `rgb(219, 214, 208)`, with Lausanne for the UI.
- **Colour:** almost none: cream on cream, with shadow doing the work.
- **Props:** the sculptures are WebGL objects.
- **Sections:** small-caps nav, "Cases", "About", "Archives", "Contact", "AI", "JA", with a one-line studio description at top left. The hero asks "What can we make next" in a high-contrast display face.
- **Timing:** the hero type is the largest paint, at 6.1 s.
- **Take:** shows that a near-monochrome scene can feel warm without brown: the warmth comes from light and shadow, not a tinted base. That is useful for the lighting-change idea. The 3D and the 6 s wait conflict with the constraints.

### 23. Unseen Studio — brand, digital and motion studio (agency)

[unseen.co](https://unseen.co/) · Elias's reason: immersive art direction. Dreamlike architecture, water, pastels and a serif/sans contrast; a world you recognise straight away.

- **Colour base:** a dusty-pink entry gate, then a pastel 3D world of arches, stairs and water. Saol Display italic over Neue Montreal.
- **Colour:** the world.
- **Props:** a cartoon pair of eyes as the gate's mascot, and the rendered architecture.
- **Sections:** "Index", "Projects", "Contact"; a single hero line mixing italic serif and sans; "View our work" and "Our 2025 Wrapped".
- **Timing:** nothing is reachable until the visitor chooses "Enter" or "Enter without audio".
- **Take:** the italic-serif-plus-sans headline is the same device as Elias's italic last word, at its most confident. Everything else (the gate, the world, the mascot) **conflicts** with the constraints and with Elias's own "kiddie" concern.

### 24. Locomotive — digital-first design agency, Montréal (agency)

[locomotive.ca](https://locomotive.ca/en) · Elias's reason: cinematic presentation. Full-screen moving imagery, elegant type and a clear route into featured projects; a strong opening that leads into a substantial portfolio.

- **Colour base:** white `rgb(255, 255, 255)`, black text; Helvetica Now Display and a custom "LocomotiveNew" serif.
- **Colour:** a full-bleed video hero (a saturated blue portrait with pixelated eyes), then the project imagery.
- **Props:** small tag boxes, "OPS · DES · DEV", beside the H1.
- **Sections:** "Featured work" is a list of huge serif project names separated by hairline rules ("Lightship", "Wolverine Worldwide"…), followed by "All work", "Extras (13)", "Articles", "Culture" and "Store". The nav reads "Work", "Agency", "Careers", "Store", "Let's talk".
- **Timing:** about 2 s, behind a logo splash; the H1 is the largest paint, at 0.5 s.
- **Take:** the route from opening to work is one scroll: the hero, one line about the studio, then a typographic index of featured work. That index of names suits a short list like Elias's. The count in "Extras (13)" repeats pattern 5. A cookie banner appears on load; it was left unanswered.

### 25. PORTO ROCHA — strategy and design agency, New York and London (agency)

[portorocha.com](https://www.portorocha.com/) · Elias's reason: the work carries the design. A compact project index beside a large visual showcase, with a quiet interface.

- **Colour base:** black `rgb(0, 0, 0)`, pale grey `rgb(226, 230, 227)` text, SF Pro Text and Display.
- **Colour:** only the work and news images (an orange folded map at MoMA, a pink Common Matters poster).
- **Props:** none. Rounded dark cards carry each client's logo.
- **Sections:** a fixed left column holds the studio name, a **live date and clock** ("Thursday, October 8 / New York, 06:37:05"), "About us", and a project index in which each entry is a client plus a one-line outcome ("FURSYS — Making room for workplace reinvention"). The right column is a dated news feed. "Show all projects" opens the full index.
- **Timing:** FCP 2.6 s, about 15 MB of images within 5 s, and a page about 168,000 px tall.
- **Take:** the one-line *outcome* for each project ("Making room for…") is exactly the product framing Elias wants: what changed, not what was made. The live clock repeats pattern 8. The page weight is not a model.

### Rauno Freiberg, revisited

Elias listed Rauno for **graphic restraint**: large typographic panels, a grey and white canvas, one vivid yellow accent, few ingredients. Entry 8 already records the grey `rgb(237, 237, 237)` page, the white panels, the black type and the single yellow circle. One point to add: what makes it mature is how few ingredients it uses (one typeface, three neutrals, one accent, one shape), and that is a useful budget for the Board.

## Patterns that recur

Revised on 8 October 2026 after Elias's additions. Each pattern is marked **Holds**, **Extended** or **Changed**, with the reason.

1. **A neutral canvas, measured.** *Holds, widened.* Of the first 15 sites, 13 put content on a background with no meaningful hue: off-white or light grey (`#f7f7f7`, `#fafafa`, `#fdfcf9`, `#ededed`, white) or near-black (`#0a0a0a`–`#1c1a17`). Seven of the ten additions do the same: Mat Voyce `#fffef8`, Dennis Snellenberg white, Isabel Moranta `#080808`, Huy Phan `#ececec`, Obys white, Locomotive white, PORTO ROCHA `#000`. That makes **20 of 25**. The five exceptions are all whole-site worlds: Spencer Chang's paper room, Alana Goyal's macOS desktop, Bruno Simon's island, Garden Eight's cream sculpture scene (still near-monochrome) and Unseen's pastel architecture. None uses a brown or umber base. New evidence: pure black works for editorial portfolios (Isabel Moranta, PORTO ROCHA), not only near-black.
2. **Colour lives in the evidence.** *Holds, extended.* The additions confirm it strongly: Mat Voyce's tile wall, PORTO ROCHA's showcase and Obys's ribbon are the only colour on their pages. Extension: the one accent can be *large* when it is the person's identity (Mat Voyce's giant blue name, Huy Phan's red name). Huy Phan also shows a project's palette as swatches, which makes "objects carry their own colour" literal.
3. **One prop per object, few per page, drawn true.** *Changed: props are optional, not required.* None of the ten additions uses a tactile prop. Their play comes from type scale, motion and how the work is presented. The rule still holds where props are used, but maturity does not need them.
4. **The card stays clean; the prop sits on its edge.** *Holds.*
5. **Plain section names, often with a gloss or count.** *Holds, reinforced.* More counts: "01 /19", "( 1 / 8 )", "Extras (13)", "More work 11". A new form of gloss: a one-line *outcome* per project (PORTO ROCHA).
6. **Metadata in a second typeface.** *Extended into scale contrast.* Isabel Moranta, Obys, Huy Phan and Garden Eight pair a very large display face with tiny mono or small-caps metadata. The gap in size is part of what reads as grown-up.
7. **Subject-derived play beats added play.** *Holds, extended.* The subject can be the owner's craft, not only their topic: Bruno Simon's drivable world for a 3D developer, Mat Voyce's lettering for a type animator. For a product engineer, the equivalent is a real product moment, not a 3D scene.
8. **Live, true state is a playful device.** *Holds, reinforced.* PORTO ROCHA's live New York clock and Dennis Snellenberg's local time join Ryo Lu's "last seen" line.
9. **New: openings that gate content are the usual failure of award-winning sites.** Seven of the ten additions show a loader, intro or entry gate for 2–15 s; none of the first fifteen did. The Board's first-paint rule sets it apart from these sites. Keep it rather than relax it to match them.
10. **New: Work as an index plus a showcase.** Obys, PORTO ROCHA, Locomotive and Huy Phan all pair a compact list of every project with one large image of the focused project and precise metadata.

## Implications for a more mature Board

These are recommendations for the map's design and grilling tickets, not decisions. Changes made after Elias's additions are marked.

1. **Change the base to near-white and near-black.** Replace plaster and umber with a neutral off-white (around `#f7f7f5`) and a neutral near-black (around `#111110`). Keep Newsreader. Let the pinned objects carry colour: project screenshots, the book cover, the film still, real photos. This is the single change most consistent across the references. *Unchanged; now 20 of 25 sites. The dark theme can go as far as true black (Isabel Moranta, PORTO ROCHA).*
2. **One accent, one meaning.** Keep the italic, differently coloured last word in the headline and use the same accent only for "now" states (current project, this week's training). Drop every other warm tint. *Changed: the accent may also be used large, once (for example, the last word at display scale, as with Mat Voyce's and Huy Phan's names), as long as it still means one thing.*
3. **At most one prop per pin, and consider none on Work.** Each personal pin becomes a clean card or image with at most one realistic fastener (paperclip, tape, pin) or edge treatment (torn, folded). Retire props that are a whole cartoon object standing in for content (the cassette player and neon sign are the likeliest candidates), or redraw them photographically. *Changed: props are now optional rather than the default. All ten additions show work with no props at all. Commissioner remains the precedent for one small fastener on a work card, so whether Work keeps a fastener or has none is a choice for grilling. Either way, the screenshot carries the card.*
4. **Name sections plainly and add a gloss.** Use the agreed order (Hero → Work → How I work → Where I've been → Off the clock → Contact) as visible labels, each with a one-line gloss in the second typeface, and a count where it helps ("Work · 6" or "01 / 06"). *Unchanged.*
5. **Turn the red-string timeline into a ruler.** Follow Mackenzie Child or Tim Ritter: real dates on a precise scale, or a small map, for "Where I've been". The string can survive as a single thin line, not a prop. *Unchanged.*
6. **Make the newspaper clipping typographic.** Borrow from henry.codes: a real masthead, dateline and column rules set in type, rather than a beige paper shape. *Unchanged.*
7. **Tie the light switch to the studio, or drop it.** The lamp only earns its place if the Board is literally a studio wall with a lamp on it, and the change reads as light falling on objects (In Common With, Spencer Chang), ideally following London time. A generic light/dark switch styled as a lamp is the bolted-on version. *Unchanged; Garden Eight adds that warmth should come from light and shadow, not from tinting the base.*
8. **Let the headline carry live, true state.** A typed line that says what Elias is building or training for right now is more mature play than another object. *Unchanged; reinforced by PORTO ROCHA and Dennis Snellenberg.*
9. **New: present Work as an index plus a showcase.** Each project gets a number, category, name, one-line *outcome* (PORTO ROCHA), role and year (Dennis Snellenberg, Commissioner), and three swatches of its own colours (Huy Phan), with one large real screenshot. A list/grid switch (Obys) is optional. This also gives `/work/[slug]` a natural entry point.
10. **New: use scale contrast in type.** Set the headline and section titles in larger Newsreader, and metadata in a small mono or small caps (Isabel Moranta, Obys, Huy Phan). It adds energy without adding objects, which answers "kiddie" with type rather than props.
11. **New: borrow composition, never loading.** Do not take loaders, intros, entry gates, WebGL scenes, sound or autoplaying video walls from the additions. Any motion runs on content that is already visible. This keeps the first-paint constraint in `DESIGN.md` and the Mohit Virli rejection consistent.

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
- Mat Voyce: <https://matvoyce.tv/>
- Dennis Snellenberg: <https://www.dennissnellenberg.com/>
- Isabel Moranta: <https://www.isabelmoranta.com/>
- Huy Phan: <https://huyml.co/>
- Bruno Simon: <https://bruno-simon.com/>
- Obys: <https://obys.agency/>
- Garden Eight: <https://garden-eight.com/>
- Unseen Studio: <https://unseen.co/>
- Locomotive: <https://locomotive.ca/en>
- PORTO ROCHA: <https://www.portorocha.com/>
- Existing references and rejections: [`docs/design/DESIGN.md`](../design/DESIGN.md)
