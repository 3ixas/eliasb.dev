# DESIGN.md: The Board

Supersedes the 21 September 2026 refinement brief and `SELECTED-DIRECTION.md` (Cabinet of Curiosities). The product scope is in `docs/specs/REFOUNDATION-SCOPE.md`; ADR 0004 covers the motion and styling architecture.

## Product and decision

- **Product:** eliasb.dev, Elias Bennett's personal site.
- **Problem and user:** the current site looks good but is "not fully there". Hiring founders, product teams, and fellow builders should feel within seconds that this person has taste and care, then want to explore the person behind the work.
- **Design decision this work must settle:** a complete visual and motion system for the **Board**, a well-kept studio wall Elias pins things to, strong enough to meet his subjective bar: a site he is proud to share with anyone, and one that would genuinely impress them.
- **Primary job:** show that Elias is a **maker of clarity**. The work is pinned carefully and clearly; the life around it is pinned more loosely.
- **Primary journey:** the opening headline is typed and then pinned → a supporting line → Work (pinned carefully, over a faint grid) → a case study or back → the personal Board (the making pin, books, film, music, weekly clipping, training, fantasy, London, GitHub) → About (the story, opening with history) → contact.
- **Success looks like:** the polish criteria in the scope (no blank content, no layout shift, one type and spacing scale, shared motion, every state designed, 320–1440 px in both themes, strong Lighthouse scores), plus Elias's side-by-side judgement against the references.

## Scope

- **Surfaces:** `/` (the One-page home), `/work`, `/work/[slug]` (three case studies), the navigation shell, the theme control, the social share image, and the `/about`, `/library`, and `/lab` redirects (no UI).
- **Target devices:** 320, 390, 820, and 1440 px, plus wide screens. Pointer, touch, and keyboard. Light and dark themes. Reduced motion.
- **Included states:** the first-load opening, a reload, back-navigation without the opening, live, cached, and fallback pins, a pin removed when it has nothing current, fantasy between game windows, fantasy off-season, the Making pin fallback, weekly clipping closed and open, a clipping without an image, slow images, JavaScript blocked, and long content.
- **Explicitly excluded:** visitor-draggable pins, 3D scenes or WebGL, gated intros ("click to enter"), sound, new integrations, a CMS.
- **Constraints:** Next.js App Router. Tokens plus Tailwind v4 and Motion (ADR 0004). All content in the HTML and visible from first paint. Self-hosted fonts through `next/font`. WCAG 2.2 AA.
- **Real content and assets:** real project screenshots (`public/work/*`), portraits (`public/profile/*`), the running photo (source `~/Downloads/IMG_1421.HEIC`, metadata stripped), the London photograph, live book and film artwork, Wikimedia images for the clipping, and the E/B mark with its orange slash.

## References

| Reference | Role | Carry over | Do not carry over |
|---|---|---|---|
| [Commissioner](https://commissioner.design) | Opening and hero typography | Two-part typed headline; objects held by paperclips; generous whitespace; calm confidence | The cloud character and illustrations; content blank until lazy-loaded |
| [Matthew Yu](https://matthewyu.dev) | One signature tactile object | A single memorable interaction built from a personal artefact; restraint around it | The sketchbook itself; the minimal grey world |
| [Sparsh Paliwal](https://www.sparshpaliwal.com) | Clarity and hierarchy | A one-line identity statement; a plain project list whose images carry colour; clear Email and Résumé actions; a restrained palette in both themes | The generic dark grey surface and system-sans feel |
| [Josh W. Comeau](https://www.joshwcomeau.com) | Theme woven into the scene; delight | The theme changes a scene rather than swapping colours; small, rewarding interactions | Cartoon illustration style; sound |
| [Yalamps](https://www.awwwards.com/sites/yalamps) (Awwwards captures; the live site was redesigned) | Light and dark as a lighting change | Day and night as a narrative change, with a toggle that feels like light | Storybook landscape illustration |
| [Mohit Virli](https://www.awwwards.com/sites/mohit-virlis-portfolio) | Light and dark as a lighting change | Daylight to starry night as the theme transition | 3D, heavy loading, blank first paint |
| [Emil Kowalski](https://emilkowal.ski) | Motion craft | Interruptible spring motion, tiny durations, nothing gratuitous | The minimal text-only layout |
| [Rauno Freiberg](https://rauno.me) | Interaction detail | Small, surprising details that reward attention | The experimental layout |
| [In Common With](https://www.incommonwith.com/collections/all-products) | The bar for a woven theme and its timing | Its "Light" switch crossfades every product photo to a version shot with the lamp on. The page background eases over 1.2 s with `cubic-bezier(0.42, 0, 0.58, 1)`, a slow, symmetrical ease-in-out that feels calm rather than abrupt. | Product photography, the shop layout |

Rejected: Maggie Appleton (Elias does not like the look), Henry Heffernan (the site is gated behind a start screen), Craig Mod and Frank Chimero (too plain for this direction).

## Design DNA

- **Content priority:** identity statement → Work → the personal Board → the story → contact. Work is always the first thing reached from navigation.
- **Layout and density:** a 12-column desktop grid. The hero and Work are pinned carefully: large, rotated at most ±0.5°, generously spaced, and aligned to a faint pinned grid visible only behind Work. Personal pins are looser: ±1–3°, different sizes, occasional overlap of up to 8%, never covering text. On mobile, the Board becomes one column of pins with tilt capped at ±1.5° and no overlap.
- **Type roles:**
  - A self-hosted characterful serif for statements, pin titles, and split-colour headings. The last word is italic and in the accent colour; Elias loves this and it stays.
  - A clean sans for reading and controls.
  - A mono for small labels, dates, and metrics.
  - One modular scale with a fluid display size. No sizes outside the scale.
  - **Chosen (30 September 2026): A, Newsreader with Hanken Grotesk and JetBrains Mono.**
  - Candidate pairings compared on the canvas:
    - A: Newsreader with Hanken Grotesk and JetBrains Mono.
    - B: Besley with Figtree and Spline Sans Mono.
    - C: Brygada 1918 with Schibsted Grotesk and IBM Plex Mono.
  - Fraunces and Young Serif were dropped: Fraunces is an overused default, and Young Serif has no italic for the split-colour headings.
- **Colour roles:**
  - Wall: warm plaster by day, deep warm umber at night.
  - Paper: pin stock, a little lighter than the wall.
  - Ink and muted ink.
  - One accent: the E/B slash orange, used for emphasis, action, and the highlight.
  - Paper stocks for pins: sage, ochre, blueprint blue, terracotta. These are object identity only, never UI state.
  - Focus: its own high-contrast ring.
- **Surfaces:**
  - The personal Board is a **framed pinboard** mounted on the wall: a thin oak frame and a warm linen surface with a few old pin holes, lit by the same light. It makes the Board read as a board without cork kitsch (Elias, 30 September 2026).
  - **Work text sits on sticky notes** in pin stocks (ochre, blueprint blue, sage), overlapping the screenshot's edge slightly, so descriptions stand out from the wall (Elias, 30 September 2026).
  - Pins are paper, photographs, clippings, or cards, each held by a physical fixing chosen by type: a pushpin for notes and headline, tape for photographs, a clip for documents and case studies.
  - **One light source.** Every shadow is cast from the same light, so each shadow's direction is a theme token rather than a per-component choice.
  - Radii are small, like real paper corners.
- **Components and feedback:**
  - On hover or focus, a pin lifts and straightens slightly, and its shadow lengthens away from the light.
  - On touch, a pin shows a pressed state.
  - Hover is never the only route to information.
  - Links read as links.
- **Motion:**
  - Motion follows physics: pins settle with springs, and nothing slides in from off-screen.
  - Durations are 120, 200, and 320 ms for UI changes; springs are used for pin movement.
  - All motion is interruptible, and reduced motion swaps it for instant state changes.
  - Content never waits for motion.

## Direction

- **Chosen direction: A, "Studio wall"**, with two borrowed elements.
  - From B (the crit wall): a faint pinned grid, only behind Work.
  - From C (the night desk): the dark theme.
- **Theme as lighting, not colour swap** (Elias's requirement, 29 September 2026):
  - **Day:** soft daylight from a window at the upper left. A very faint window-frame shadow lies across the wall, and pin shadows fall down and to the right.
  - **Night:** the window goes dark and a desk lamp clamped to the wall's upper right switches on, casting a warm pool of light. Pins inside the pool are warmly lit; pins outside it are dimmer but always meet AA contrast. Pin shadows swing to fall down and to the left, away from the lamp.
  - **The theme control is a light switch in the header** (it superseded an earlier pull cord on 1 October 2026). Flipping it visibly switches the lights on or off, and every shadow on the page swings with the light.
  - The site starts in the visitor's system theme and follows live changes; a manual choice overrides this, with a clear route back to automatic.
  - **Timing (from In Common With):** the switch is a 1.2 s ease-in-out (`cubic-bezier(0.42, 0, 0.58, 1)`) crossfade of the wall, the lamp's glow, and pin lighting. Shadows swing over the same 1.2 s. The rocker moves at once with a short spring, so the control feels immediate while the room changes slowly.
  - With reduced motion, the theme change is a 200 ms crossfade with no swinging and no flicker.
- **Signature: the headline gets pinned.** The sentence types in two parts, the hand-drawn highlight is drawn beneath it, then the headline card settles onto the wall and a pushpin presses in. The Board is visible behind it from the first frame. It replays on every load or reload, never on back-navigation, and reduced motion shows the finished state at once.
- **Anti-goals:**
  - Generic AI portfolio defaults: centred hero with a gradient, Inter or Geist on grey, bento grids, glassmorphism, emoji.
  - Kitsch corkboard texture or clip-art pins.
  - Novelty that hides content.
  - Motion that is decoration rather than physics.
  - Many shadow styles, accents, or font sizes.
  - Blank panels while scrolling.
  - Text over photographs without a scrim.
- **Why it fits:** it is Elias's own description of what he loves, a board he has stuck things onto. Clarity sits in the careful pins and warmth in the loose ones. One light source gives the system a physical rule that enforces consistency, which is the polish the first build lacked.
- **Alternatives considered:**
  - B, "Crit wall" (cool, gridded): clearest, but too cold on its own.
  - C, "Desk at night" (cursor-moved lamp across the whole site): most dramatic, but it risks legibility and does not work on mobile. It survives as the dark theme.

## Screens and states

| Screen | User decision | Empty | Loading | Error | Success | Other states |
|---|---|---|---|---|---|---|
| Home: hero | Is this person worth my time? | n/a | Fonts load without text jumping (metric-matched fallbacks) | JavaScript blocked: finished headline shown | Headline pinned, Board visible | First load, reload, back-navigation, reduced motion, day and night |
| Home: Work | Which project should I open? | n/a | Screenshots have reserved sizes with a paper placeholder | Missing image shows a titled paper pin | Three projects pinned carefully, "View all work" | Hover lift, focus, 320 px stack |
| Home: personal Board | What's he like? | A pin with nothing current is removed | Artwork placeholders reserve their space | Cached pin with a subtle "as of" date; authored fallback | A composed Board | Fantasy: live, last week, off-season. Clipping: closed, open, no image. Making fallback. Training with or without Strava |
| Home: About | Do I connect with his story? | n/a | Portrait placeholder reserves space | n/a | Story opening with history, portrait | Long text, day and night |
| Home: contact | How do I reach him? | n/a | n/a | n/a | Email as the main action; résumé, GitHub, LinkedIn | Contact cursors on fine pointers only |
| `/work` archive | Which case study? | n/a | Image placeholders | n/a | All case studies | 320 px |
| `/work/[slug]` | Is the reasoning good? | n/a | Hero image placeholder | External link unavailable | Clean reading page with a hint of the Board | Back to Work without replaying the opening |

## Exploration record

- **Service:** Claude Design (the core Design canvas type).
- **Canvas:** [eliasb.dev: The Board](https://claude.ai/artifact/4zfQfGQme3zy2kUgvh4V8H), created on 29 September 2026. It is private to Elias.
- **Design system:** built from this file; no stock design system.
- **First artboard group (round 1, 29 September 2026):**
  - `Main`: the day hero, with the lamp off.
  - `Night`: the same hero with the lamp on.
  - `Type`: pairings A, B, and C.
  - `Work`: three projects pinned with binder clips over the grid.
  - `Board`: the weekly clipping, running photo, Making, fantasy (real week 3 result), book, film, London, GitHub year (real data), and music.
  - `Mobile`: 390 px.
  - Every artboard except `Type` has a Type tweak for switching pairings A, B, and C.
  - Strava counts are shown as `[n]` placeholders because the production credentials are unconfirmed.
  - The draft headline is "I build everyday software, and make complicated things feel simple." It still needs approval in the copy document.
- **Round 3 (30 September 2026):**
  - Added the night Board, with the framed pinboard under the lamp.
  - Mobile now carries the sticky notes and the framed board.
- **Motion prototype:** a throwaway page on the `prototype/board-motion` branch (`prototypes/board-motion/index.html`, Motion 13.4.6). Its bottom bar compares:
  - **Opening:** A types the first clause and the rest lands; B types everything and "feel simple." lands.
  - **Lamp:** A is one 1.2 s room crossfade; B has the bulb bloom first and the room follow.
  - **Clipping:** A fans out from behind; B unfolds in place.
  - **Scroll:** still or sway.
  - **Reduced motion:** a simulated setting.
- **Motion verdict (Elias, 30 September 2026, after running the prototype himself):**
  - **Opening B:** type the sentence through "complicated things", then "*feel simple.*" drops in with a small spring (bounce 0.3, 0.45 s), the highlight draws beneath it (0.52 s strong ease-out), and the card settles as the pin presses in. Elias: A felt "a little more rushed"; B "grips me in a bit more".
  - **Lamp A:** one calm 1.2 s room crossfade using `cubic-bezier(0.42, 0, 0.58, 1)`, with the cord's instant tug.
  - **Clipping A:** the week's other two cuttings fan out from behind the main one on a spring (bounce 0.2, 0.5 s). On narrow screens they stack below it.
  - **Scroll sway:** pins drift and rotate very slightly with scroll depth (at most about 14 px and 0.9°). "It makes the site feel alive." It is off under reduced motion. The production build should drive it with Motion's hardware-accelerated scroll timeline, not a per-frame callback.
- **Round 4 (30 September 2026): every section lit its own way, every object earned.** Elias approved the full section scan.
  - **Lights, one per section.** By day, window light falls across everything and each light is an object, switched off. Flipping the switch turns them all on together, and each section's shadows fall away from its own light.

    | Section | Light |
    |---|---|
    | Hero | Clamp desk lamp |
    | Work | A brass picture light above each project |
    | Board | Two sources, each attached to the frame: the festoon string across the top (pooling top right) and fairy lights wound down the bottom-right corner. At night the board dims overall so the pools and darker gaps read clearly, but every pin keeps AA-contrast text (measured, not judged by eye) |
    | About | A candle on a small wall shelf on iron brackets, beside a row of book spines, beside the About heading, in the top half and well away from the neon: gentle flicker at night, steady with reduced motion |
    | Contact | A bold neon sign: a dark scanlined sign box bolted to the wall with its cable to a socket, a large hot-pink "hello" with a small cyan "SAY" and underline tube. Unlit glass by day; at night it glows strongly and washes the wall pink and cyan. An occasional single-letter flicker, off under reduced motion |

  - **Objects:**

    | Section | Object |
    |---|---|
    | Nav | A small pushpin marks the current section and springs between links |
    | Work tech stacks | Embossed label tape on the sticky notes |
    | "View all work" | An archive drawer of manila folders |
    | Case-study pages | An opened kraft case-file folder: tab labelled in label tape, a red "CASE FILE Nº" stamp, and coloured divider tabs on the right edge as the chapter navigation (Problem, Decisions, How it's built, What I'd change). Inside: a red margin rule, a large title, the thesis on a sticky note, a paperclipped screenshot with a pencil note, label-tape stack tags, and stamp-style Live and Code buttons |
    | Making | A blueprint sheet with a title block |
    | GitHub | Graph paper with ink-stamp days and a pencil note on hover |
    | London | Photo plus an analogue clock showing real London time |
    | Fantasy | A matchday ticket stub |
    | Book | Cover plus a stamped library card |
    | Film | Poster plus a cinema ticket stub |
    | Music | A portable cassette player with a track list (see the culture corner below) |
    | Training | Polaroid plus tally marks, with the number beside them |
    | About | Prose beside a connected journey: a red string with arrowheads, pinned at five numbered stops and starting with a pencilled "start here". The stops are: (1) history essay, (2) plain bakery bag with doughnut (no brand logo), (3) speech bubble quoting "I need that feeling from what I do.", (4) code sticky note, (5) lanyard, "BNP Paribas, today". In the build, the string draws stop by stop on scroll, and is static under reduced motion |
    | Contact | A postcard with an E/B stamp, plus pinned link cards |
    | Footer | The frame's bottom edge and "Made by Elias" |
    | Stale pins | Sun-faded with a pencilled "as of" date |
    | Missing photos | A blank polaroid saying "photo coming" |
    | 404 | "Something was pinned here." on an empty patch of board, with a red "404" stamp |
    | Favicon | A pushpin |
    | Social image | The pinned headline card |

  - **Fixings always have a surface (Elias, 1 October 2026).**
    - Clips belong to clipboards. Project screenshots sit on a hardboard clipboard with a metal clip.
    - Pins go into the plaster wall (faint plaster texture) or the framed linen board.
    - Tape joins paper to a visible surface.
    - Lights are mounted too: clamped, hung, screwed to the wall, or standing on a shelf.
    - Nothing pinned, clipped, or taped floats.
  - **One theme control: a light switch in the header (Elias, 1 October 2026).**
    - The cord and the footer switch are retired.
    - The control is a UK-style rocker switch, modelled on the MK Logic Plus one-gang switch: a tall rectangular cream plate with a soft bevel and slotted cream screws top and bottom, and an all-cream rocker (slightly lighter than the plate) in a thin shadow gap. The tilt is shown through shading: the pressed end slopes away and darkens, and the proud end is bright and casts a small shadow. No brass (Elias, 1 October 2026: brass made it unrecognisable as a switch). With the lights off the top half is pressed in; with them on, the bottom half is. At night it has a faint warm glow. (Elias rejected a flick toggle on 1 October 2026.)
    - It sits in the sticky header, so it is always visible on every screen size.
    - Clicking rocks the switch instantly with a short spring, then the room changes over the 1.2 s fade.
    - The section lights are scenery and are not clickable.
    - The accessible name is "Turn the lights on" or "Turn the lights off".
    - **Back to automatic (build, #77):** flipping the switch so the lights match the device's own setting returns the site to following the device; any other flip is an explicit choice that persists. The single rocker needs no separate "System" control.
    - Each picture light's glow covers the whole project row (screenshot and sticky note), plus a soft wash on the wall.
  - **The weekly clipping is "The Weekly Curiosity" (Elias, 1 October 2026).**
    - A bold all-caps Newsreader masthead between double rules, with the strapline "Odd, true, and from this week in history".
    - A red "STRANGE BUT TRUE" rubber stamp on the photo.
    - A playful issue line: "Vol. · No. · Week of · Price: one click".
    - The fact is set as the bold headline, and the button reads "2 more oddities this week".
    - Curation must favour surprising, quirky "I never knew that" facts over news-headline events.
  - **The training pin is a photo plus a log card (Elias, 1 October 2026).**
    - The polaroid carries the mood ("Out on a run, central London.").
    - A lined "Training this week · via Strava" card pinned over its edge carries the data: one row per activity (Lifts, Runs, and Muay Thai once recorded), each with tally marks and a number.
  - **The GitHub pin is a full-width feature (Elias, 1 October 2026).**
    - A graph-paper sheet spanning the board, with a large ink total and month labels.
    - Days are small rounded squares in GitHub's five-step green scale (Elias: green is what people recognise). This is the one deliberate exception to the site palette. There is a Quiet-to-Busy legend.
    - A pencil loop around the busiest stretch, computed from the data, with a handwritten note.
    - A hover or tap invitation to see each day's count.
  - **Every pin says what it is to a stranger (Elias, 1 October 2026).** Each pin carries a clear tag or headline (for example "Now reading", "Last watched", "On repeat") as well as its image.
  - **The culture corner (Elias, 1 October 2026):** a dedicated row of large objects, each with a kraft shipping tag.
    - **Book:** cover plus a stamped library card.
    - **Film:** poster plus an "Admit one · Last watched" ticket.
    - **Music:** a retro portable cassette player ("E/B Sound") hanging by its strap from a pin. Its tape window is labelled with the playlist, and it has real Previous, Play, and Next controls. Below it is a track-list card. Play opens the official Spotify player, and the track list fills from Spotify.
  - **Photos (Elias, 1 October 2026):** the white-tux portrait (`public/profile/elias-evening.webp`), Elias's favourite, is the hero polaroid. The grey-jumper photo (`public/profile/elias.webp`) goes in About.
  - **Removed:** the scroll progress bar (the nav pin replaces it) and the per-link contact cursors (the postcard replaces them).
  - **Kept plain:** focus states stay a solid, high-contrast accent outline.
  - **Scroll sway:** kept, implemented with CSS scroll-driven animations (`animation-timeline: view()`) on transforms only. Browsers without support show still pins. Confirm support in Safari and Firefox during implementation.
  - **Canvas:** artboards `R4Work`, `R4Board`, and `R4Story` each have a Lighting tweak, and the `…Night` artboards show them with the lights on. `R4Extras` covers the case-study folder, 404, states, favicon, and social image.
  - **Copy status:** the About prose on the canvas is a draft from Elias's spoken story and is not approved. The copy document governs.
  - **Mobile:** the mobile artboard does not yet show round 4. Mobile follows the single-column rules during implementation.
- **Motion prototype scope:** It covers the pinned headline, pin lift, the theme lamp with shadow swing, clipping open, and reduced-motion equivalents.
- **Chosen direction:** A, "Studio wall", with lighting-based themes.
- **Rejected directions:** B and C as whole-site environments (see above); Cabinet of Curiosities as the direction's name.
- **Open decisions (settled at sign-off, 1 October 2026):**
  - **Paper stocks:** the canvas colours (ochre, blueprint blue, sage, terracotta, kraft), fine-tuned for AA contrast in the build.
  - **Light rendering:** line-drawn objects with CSS light and shadow (no photography or illustration), and a different light type per section.
  - **Handwriting:** not in v1.
  - **Case-study chapter pages:** designed in the build within these rules, extending the case-file folder.
  - **Mobile:** follows the single-column rules (tilt capped at ±1.5°, no overlap) with the round 4 objects.
  - **Cord discoverability:** superseded. The control is now the header rocker switch; it is still checked by Elias in the first slice that builds it.
- **Round 2 (30 September 2026):**
  - Elias loves the headline and the lamp idea, and chose Newsreader.
  - He asked for Work descriptions on coloured sticky notes, now done, and for the Board to read more clearly as a board, now done with a framed pinboard.
  - He confirmed that the cord switches the theme.
  - The mobile artboard does not yet carry the round 2 changes.
- **Round 4 iterations (1 October 2026):** 16 comment threads, all resolved and recorded above.
- **Last reviewed:** 1 October 2026.

## Acceptance and sign-off

- **Acceptance criteria:** the polish criteria in `REFOUNDATION-SCOPE.md`, plus:
  - One light source per theme: all shadows are consistent.
  - At most four font families and weights in total across the display, sans, and mono families.
  - Every token comes from this file.
  - The theme control changes the lighting visibly within 600 ms.
  - The signature is visible on the home page in both themes.
- **Evidence reviewed:** the live site (29 September 2026), the reference sites above, and a `globals.css` audit: 30 font sizes, 33 box-shadows, 10 accent and 10 ink values, and a system-only font stack that renders Baskerville or Times New Roman outside Apple devices.
- **User feedback:**
  - Elias approved direction A with the borrowed elements, the pinned-headline signature, web fonts, and creating the canvas (29 September 2026).
  - He requested that light and dark be woven into the design, like lamps switching on.
- **User sign-off:** Elias signed off the full design direction on 1 October 2026 ("Happy with everything after these iterations, signed off").
- **Signed off on:** 1 October 2026, against canvas version 32.

## Implementation handoff

- **Approved artboards:**
  - [Canvas](https://claude.ai/artifact/4zfQfGQme3zy2kUgvh4V8H): `Main` and `Night` (hero), `Type`, `R4Work` and `R4WorkNight`, `R4Board` and `R4BoardNight`, `R4Story` and `R4StoryNight`, and `R4Extras`.
  - Rounds 1–3 (`Work`, `Board`, `BoardNight`, `Mobile`) are superseded where round 4 differs.
- **Tokens:**
  - Wall, paper, ink, muted, rule, and accent `#C94A22` (night wall accent `#FF8A5C`).
  - Pin stocks: ochre `#F2DFAA`, blueprint `#C9D8E6`, sage `#CCD8C1`, terracotta, kraft `#D7AE63`.
  - GitHub greens (exception).
  - Day shadow `1px 2px 2px rgba(70,45,20,.10), 8px 12px 22px -8px rgba(70,45,20,.28)`. Night shadows fall away from each section's light.
  - Fonts: Newsreader, Hanken Grotesk, JetBrains Mono, all through `next/font`.
  - Spacing scale 4–128; one type scale with a fluid display size.
  - The canvas values are the starting point; they are normalised into the token file in the first slice.
- **Component rules:**
  - Every fixing has a visible surface.
  - Every pin says what it is to a stranger.
  - Lights are mounted objects and are not interactive.
  - The single theme control is the header rocker switch.
  - Hover: lift and straighten. Press: squeeze. Focus: a solid accent outline.
- **Responsive:**
  - 12-column desktop. Below 900 px, a single column with tilt capped at ±1.5° and no overlap.
  - The sticky header keeps the switch visible.
  - The culture corner stacks.
  - The GitHub sheet scrolls horizontally on phones, with month labels.
- **Accessibility:**
  - WCAG 2.2 AA, measured in both themes, including the dimmed areas of the night Board.
  - One `h1` per route; the full headline is in the HTML.
  - Decorative objects are `aria-hidden`; meaningful images have alt text.
  - The 44 px target minimum applies to the switch and pin actions.
- **Motion:**
  - Opening B: the card starts lifted, the headline types, "feel simple." lands on a spring (bounce 0.3, 0.45 s), the highlight draws (0.52 s), and the pin presses in. It replays on every load and reload, never on back-navigation.
  - The theme change is a 1.2 s `cubic-bezier(0.42, 0, 0.58, 1)` room crossfade with shadow swing; the switch rocks instantly.
  - The clipping fans out on a spring (bounce 0.2, 0.5 s).
  - Scroll sway uses CSS scroll-driven animations, transform only.
  - Support, checked 2 October 2026 (#82): Chromium 153 and WebKit 26.6 support `animation-timeline: view()` (verified in Playwright). Firefox does not ship it: MDN's compatibility data (8.1.4, 1 October 2026) lists it as preview-only on desktop and unsupported on Android. Firefox visitors get the still pins, which is the accepted fallback.
  - The About string draws on scroll.
  - The neon flickers occasionally, and the candle flickers gently.
  - Reduced motion removes movement and keeps 200 ms crossfades.
  - Prototype: the `prototype/board-motion` branch.
- **Acceptance evidence for the build:** rendered checks at 320, 390, 820, and 1440 px in both themes, Playwright, Lighthouse, contrast measurements, and Elias's review of each slice against the canvas.
