# Spec: Re-found eliasb.dev as the Board

Published as [GitHub issue #75](https://github.com/3ixas/eliasb.dev/issues/75).

Sources:
- Scope: `docs/specs/REFOUNDATION-SCOPE.md`, approved 29 September 2026.
- Design: `docs/design/DESIGN.md`, signed off 1 October 2026 against the [canvas](https://claude.ai/artifact/4zfQfGQme3zy2kUgvh4V8H), version 32.
- Architecture: ADR 0004 (Motion and design tokens).
- Motion reference: the `prototype/board-motion` branch.

Vocabulary follows `GLOSSARY.md`: Board, Pin, Making pin, Weekly clipping, Maker of clarity.

## Problem Statement

eliasb.dev looks good but is "not fully there". Visitors on different operating systems see different typography, because the site uses system fonts only. Nothing shares a system: there are 30 font sizes, 33 shadows, and ten accents. Panels go blank on a fast scroll because content is hidden until motion fires. Live pins show meaningless states, such as `0.0 vs 0.0` fantasy scores between game windows and a history link to raw JSON. The opening animation broke twice in production. The copy reads like system notices, and the career story reads like a CV.

Elias wants a site he is proud to share with anyone, and one that would genuinely impress them. It should feel like his own personal, physical space, and present him as a maker of clarity.

## Solution

Rebuild the presentation layer as the Board: a well-kept studio wall that Elias pins things to, lit by daylight through a window. A light switch in the header turns on a different light in each section (desk lamp, picture lights, festoon, spotlight and fairy lights, candle, neon sign), and every shadow swings with the light. Each section becomes the physical object its content naturally is:
- Work: projects clipped to clipboards, with sticky notes.
- Case studies: opened case-file folders.
- History: a newspaper clipping.
- Fantasy: a matchday ticket stub.
- Film: a cinema ticket.
- Music: a cassette player.
- About: a pinned journey on red string.
- Contact: a neon sign above a postcard.

Keep the existing integrations, snapshots, content data, and routes. Rewrite every public line in Elias's voice through approved copy documents. The site launches in one switchover once it passes the polish bar.

## User Stories

### Arriving and the opening

1. As a first-time visitor, I want the headline, "I build everyday software, and make complicated things feel simple.", to type in, have "feel simple." land, and then get pinned to the wall, so that the site introduces itself with personality in a few seconds.
2. As a first-time visitor, I want the rest of the Board visible behind the headline from the first frame, so that I never wait on a blank screen.
3. As a returning visitor who reloads the page, I want the opening to play again, so that it feels the same every time I arrive.
4. As a visitor coming back from a case study, I want the home page without the opening, so that navigation feels instant.
5. As a keyboard or screen-reader user, I want the full headline available as one heading immediately, so that the animation never hides meaning.
6. As a visitor with reduced motion, I want the finished headline and page straight away, so that nothing moves unnecessarily.
7. As a visitor on a slow connection or with JavaScript blocked, I want the complete page and headline readable, so that the site never depends on script to show content.

### Light and dark

8. As a visitor, I want the site to start in my device's appearance and follow it when it changes, so that it feels native.
9. As a visitor, I want a recognisable UK-style rocker light switch in the header, so that I immediately understand it turns the lights on or off.
10. As a visitor, I want the switch to respond instantly and the room to change over a calm 1.2-second fade, so that the switch feels physical and the change feels atmospheric rather than abrupt.
11. As a visitor, I want each section's own light to come on at night (desk lamp, picture lights, festoon, spotlight, fairy lights, candle, neon), so that the dark theme feels like the same room at night.
12. As a visitor, I want every shadow to fall away from its section's light, so that the scene feels physically consistent.
13. As a visitor who chose a theme manually, I want my choice kept until I return to my device setting, so that my preference sticks.
14. As a visitor at night, I want every pin's text to stay comfortably readable, even in the darker gaps between light pools.
15. As a visitor with reduced motion, I want the theme change to be a short crossfade without swinging shadows or flicker.
16. As a visitor scrolling down the page, I want the switch to stay visible in the sticky header.

### Navigation and structure

17. As a visitor, I want the navigation for Work, Library, and About, with a small pushpin marking the section I'm in, so that I always know where I am.
18. As a visitor, I want the existing `/about`, `/library`, and `/lab` links to still take me to the right section.
19. As a visitor, I want the scroll progress bar gone, so that the page is calmer.

### Work

20. As a hiring founder, I want Work to be the first section after the hero, so that I see the evidence quickly.
21. As a visitor, I want each featured project as a screenshot clipped to a clipboard, with its description on a coloured sticky note, so that projects stand out from the wall.
22. As a visitor, I want each project's technologies shown as embossed label tape, so that the stack is scannable.
23. As a visitor at night, I want each project lit by its own picture light, with the glow covering the screenshot and the note.
24. As a visitor, I want "View all work" to be an archive drawer of manila folders, so that the archive feels like a real place.

### Case studies

25. As a visitor, I want each case study to open as a kraft case-file folder, with a "Case file Nº" stamp and the project name in label tape, so that the page feels like opening the file.
26. As a visitor, I want coloured divider tabs on the folder's edge for Problem, Decisions, How it's built, and What I'd change, so that I can jump to the part I care about.
27. As a visitor, I want the thesis on a sticky note, a paperclipped screenshot, and clear Live and Code buttons, so that the key facts and actions are obvious.
28. As a visitor, I want case-study writing that explains what was confusing, what Elias made clear, and how, so that each page proves the maker-of-clarity claim.
29. As a visitor, I want a clear way back to the drawer.

### The Board (personal section)

30. As a visitor, I want the personal pins on a framed linen pinboard, so that it clearly reads as a board.
31. As a visitor, I want every pin labelled in plain words ("Now reading", "Last watched", "On repeat"), so that I understand what each one shows without knowing Elias.
32. As a visitor, I want The Weekly Curiosity clipping, a newspaper cutting with a bold masthead and a "Strange but true" stamp, showing a surprising fact from this week in history with its image and credit.
33. As a visitor, I want "2 more oddities this week" to fan out the other two clippings, and to fold them away again.
34. As a visitor, I want the clipping to link to a readable Wikipedia page for the day, never raw JSON.
35. As a visitor, I want the clipping to show surprising, quirky facts rather than news-headline events.
36. As a visitor, I want a clipping without a usable image to stay text-only rather than show an unrelated picture.
37. As a visitor, I want the Making pin as a blueprint sheet saying what Elias is building now, so that I see current work.
38. As Elias, I want the Making pin to fall back to my latest public repository when nothing is current, so that it never goes stale.
39. As a visitor, I want Elias's running photo with a "Training this week · via Strava" log card, showing lifts and runs as tally marks with numbers.
40. As a visitor, I want a Muay Thai row to appear automatically once sessions are recorded, and nothing about Muay Thai before then.
41. As a visitor, I want the fantasy pin as an NFL ticket stub: last week's result and season record from Tuesday until kickoff, the live score during games, and no pin off-season.
42. As a visitor, I want the fantasy pin to name Elias's team and keep opponents and the league anonymous.
43. As a visitor, I want the GitHub pin as a full-width graph-paper sheet: a big contribution total, GitHub-green days, month labels, a legend, and a pencil loop around the busiest stretch.
44. As a visitor, I want to hover or tap a day to see its count, and to scroll the year sideways on a phone.
45. As a visitor, I want London shown as a photo with an analogue clock set to London time.
46. As a visitor, I want the culture corner: a large book cover with a library card, a large film poster with a cinema ticket, and a cassette player for the playlist.
47. As a visitor, I want the cassette player's Play button to open the official Spotify player and show the real track list.
48. As a visitor at night, I want the Board lit by the festoon, a clamp spotlight, and fairy lights, with pools of light and darker gaps.
49. As a visitor, I want pins to sway very slightly as I scroll, so that the Board feels alive.
50. As a visitor, I want a stale pin to look sun-faded with a pencilled "as of" date, and a missing photo to show "photo coming".
51. As a visitor, I want a pin with nothing current removed rather than shown empty.

### About

52. As a visitor, I want Elias's story in his own words, starting with history at university, so that I understand why he builds software.
53. As a visitor, I want the story's objects connected by a red string with arrows across five numbered stops (history essay, bakery bag, "I need that feeling" speech bubble, code sticky note, lanyard), so that the journey reads in order.
54. As a visitor, I want the string to draw itself as I scroll, unless I prefer reduced motion.
55. As a visitor, I want a candle on a small wall shelf beside the About heading, lit at night.
56. As a visitor, I want the grey-jumper photo in About and the white-tux photo in the hero.

### Contact and footer

57. As a visitor, I want a bold neon "SAY hello" sign bolted to the wall, unlit by day and glowing pink and cyan at night, so that the ending is memorable.
58. As a visitor, I want a postcard reading "Wish you were here." with Elias's email on the address side and an E/B stamp, so that emailing him is the obvious action.
59. As a visitor, I want the CV, GitHub, and LinkedIn as pinned cards.
60. As a visitor, I want the footer to show the frame's edge and "Made by Elias".

### Copy, content, and identity

61. As a visitor, I want every line to sound like Elias (plain, concrete, first person, British spelling, no em dashes, no data-handling disclaimers), so that the site feels personal.
62. As Elias, I want to approve each slice's copy document before it ships, so that nothing goes out in a voice I don't recognise.
63. As a visitor, I want the 404 page to show an empty space on the board: "Something was pinned here.", a red 404 stamp, and a way back.
64. As a visitor sharing the site, I want the social image to show the pinned headline card, and the favicon to be a pushpin.

### Quality

65. As a visitor on any OS, I want the same self-hosted Newsreader, Hanken Grotesk, and JetBrains Mono, with no layout jump as fonts load.
66. As a visitor, I want no blank or late-appearing content and no layout shift anywhere.
67. As a visitor on a phone, I want a single readable column at 320 and 390 px, with pins tilted only slightly and never overlapping, and nothing scrolling sideways except the GitHub year.
68. As a keyboard user, I want every interactive object reachable, with a solid visible focus outline and 44 px targets.
69. As a screen-reader user, I want decorative objects hidden and meaningful images described.
70. As Elias, I want the site fast (mobile Lighthouse Performance ≥ 90; Accessibility, Best Practices, and SEO at 100 on the home page and a case study).
71. As Elias, I want WCAG 2.2 AA contrast measured in both themes, including the night Board's dim areas.

## Implementation Decisions

### Keep and change

- **Keep:**
  - Integrations and snapshot/fallback behaviour (GitHub, Goodreads, Letterboxd, Sleeper, Spotify, Strava, Wikimedia history with its cache).
  - Authored content data.
  - Routes and redirects.
  - Metadata generation.
  - Next.js App Router on Vercel.
- **Rebuild the presentation layer** (components, styling, motion) per ADR 0004:
  - Design tokens as CSS variables derived from `DESIGN.md`, plus component-scoped Tailwind v4 utilities.
  - Motion for springs and choreography.
  - CSS scroll-driven animations for sway and string-drawing.
  - The global stylesheet is retired.
- **Remove:** the `/concepts` routes and renderer, the scroll progress bar, the per-link contact cursors, and the training schedule.

### Design system and pins

- **Design system module:** tokens for wall, paper, ink, muted, rule, accent, pin stocks, GitHub greens, spacing scale, type scale (fluid display), radii, motion durations and curves, and shadow-by-light.
  - Shadows depend on the theme and the section's light source, through a per-section light token. Components never hard-code shadows.
- **Pin primitive:** a shared component for anything placed on the wall. It takes:
  - the object type;
  - the fixing (pushpin, tape, clip, clipboard, string, shelf);
  - the surface it is attached to;
  - its tilt;
  - its looseness tier (careful for hero and Work; loose for Board and About).
  - Every fixing renders against a visible surface; an unattached fixing cannot be expressed.
- **Light primitive:** a decorative, `aria-hidden` component per section light type (clamp lamp, picture light, festoon, clamp spotlight, fairy lights, candle, neon). Each has off (day) and on (night) states and a light-pool overlay. Lights are never interactive.

### Theme

- **Theme controller:** three states: `system` (follows the device setting live), `light`, and `dark`.
  - An explicit choice persists until the visitor returns to system.
  - The only control is the header rocker switch, modelled on a UK MK Logic Plus one-gang switch:
    - an all-cream plate with slotted screws;
    - a slightly lighter rocker in a shadow gap;
    - the top pressed when the lights are off and the bottom pressed when they are on;
    - an accessible name that says the action.
  - Switching rocks the switch at once (short spring), then crossfades the room over 1.2 s with `cubic-bezier(0.42, 0, 0.58, 1)`. Shadows swing over the same duration.
  - Hover shadows use 0.22 s outside a switch.
  - Reduced motion uses a 200 ms crossfade.
  - The theme is applied before first paint, so the page never flashes the wrong theme.

### Opening

- **Content is always present:** the headline is server-rendered in full. The animated layer is decorative and `aria-hidden`.
- **Sequence:**
  1. The card starts lifted.
  2. "I build everyday software, and make complicated things " types with a caret at steady timing (about 38 ms per character, slightly faster on spaces), with a pause at the comma.
  3. "feel simple." lands on a spring (bounce 0.3, visual duration 0.45 s).
  4. The highlight draws (0.52 s, strong ease-out).
  5. The card settles and the pin presses in (springs 0.25 and 0.35).
- **When it runs:** on every fresh load and reload, never on client-side back-navigation.
- **Fail-safe:** any failure, slow script, or reduced-motion preference shows the finished state. Content is never hidden waiting for script.

### Motion

- **Pins:** on hover or focus they lift 4 px and reduce their tilt to 30%; on press they squeeze slightly. Hover effects are gated to fine pointers.
- **Clipping:** the fan-out uses springs (bounce 0.2, 0.5 s), with a 60 ms stagger between the two clippings. On narrow screens the clippings stack below the main one, measured from real sizes.
- **Scroll sway and the About string:** CSS scroll-driven animations on transforms and stroke only. The sway is at most about 14 px and 0.9°, scaled by pin depth. Browsers without support show static pins.
- **Flicker:** an occasional single-letter flicker on the neon and a gentle candle flicker.
- **Reduced motion:** removes movement and keeps opacity and colour changes.

### Pin data rules

These rules sit in the integration and mapper layer, not in components.

- **Fantasy:** the pin state is derived from the NFL state and calendar.
  - From Tuesday until Thursday kickoff: the previous week's final scores and the season record.
  - During game windows: the live score.
  - Off-season: no pin.
  - Shows Elias's team name; the opponent and the league stay anonymous.
- **Training:** weekly counts by category from Strava (Lift, Run, plus Muay Thai and Other when present). Zero categories are hidden. If Strava has no data, the photo and caption stand alone.
- **GitHub:**
  - The total and per-day counts with GitHub's five-level scale.
  - The busiest stretch: the four-week window with the highest total, computed from the data.
  - Day details on hover, focus, or tap.
  - Date labels are deterministic and locale-independent (the hydration fix stays).
- **Weekly clipping:**
  - Curation prefers surprising, quirky facts and avoids news-headline events.
  - One featured fact plus two more, with images, credits, and licences.
  - A text-only fallback when there is no suitable image.
  - The source link points to the readable Wikipedia page for the day.
  - The existing weekly cache and failure retention stay.
- **Making pin:** authored entry (title, line, image, link). Falls back to the latest public repository from the GitHub data.
- **Removing pins:** any pin with nothing current is removed. A stale pin shows its "as of" date with sun-faded styling.
- **Music:** the cassette player is a facade. Play loads the official Spotify embed and track list on demand, so third-party script doesn't hurt first load.

### Content

- **Copy process:** each slice has a copy document (`writing` skill, voice profile) approved by Elias before implementation. Applies to the headline, sections, pins, case studies (rewritten around "what was confusing, what I made clear, how"), About (from the Obsidian source note; Greggs named; friend and bootcamp unnamed), contact, metadata, and the social image.
- **Photos:** the white-tux portrait in the hero; the grey-jumper photo in About; the running photo with metadata stripped.

### Layout and delivery

- **Responsive:**
  - 12-column desktop grid.
  - Below 900 px, a single column with tilt capped at ±1.5° and no overlap.
  - The culture corner stacks; the GitHub year scrolls horizontally with sticky month labels.
  - The sticky header carries the switch.
- **Delivery:**
  - Built on a long-running branch with Vercel preview deployments.
  - One switchover to production after the polish bar is met.
  - Rollback through Vercel's instant rollback.
  - No interim changes to production.

## Testing Decisions

- **Good tests check behaviour, not implementation.** They assert what a visitor can see, reach, and understand, or what a mapper returns for given source data. They never assert component names, CSS selectors beyond stable landmarks, or animation internals.
- **Seam 1, the rendered production build (primary).** A committed Playwright suite runs against a production build at 320, 390, 820, and 1440 px, in light and dark, in Chromium and WebKit (Firefox where available). It covers:
  - the opening (headline semantics, finished state with reduced motion and with JavaScript blocked, no replay on back-navigation);
  - the theme (system follow, switch toggling and persistence, no wrong-theme flash);
  - navigation and the nav pin;
  - redirects;
  - no blank content after a fast scroll;
  - no horizontal overflow;
  - focus visibility and keyboard reach;
  - axe accessibility scans;
  - contrast measurements on the night Board's dim areas;
  - the clipping fan-out open and close;
  - pin labels and removed states, using fixture data;
  - the 404.

  Lighthouse runs on the home page and one case study.
- **Seam 2, signal and mapper contracts.** Extend the existing `verify:signals` scripts:
  - fantasy calendar states (Tuesday to Thursday shows last week; game windows; off-season shows no pin);
  - anonymisation;
  - training categories and hidden zero categories;
  - the GitHub busiest-stretch calculation and locale-independent labels;
  - clipping curation and fallbacks;
  - the readable source link;
  - the Making pin fallback;
  - stale and missing states.
- **Prior art:**
  - `verify-signal-contracts`, `verify-history-cache`, `verify-opening`, `verify-canonical-routes`, and `verify-release`. These stay in CI, updated where the rebuild changes their surfaces.
  - The motion prototype on `prototype/board-motion`, for timing values.
- **Review:** Elias reviews each slice against the canvas. Slices with a subjective call end with his check (for example, whether the switch is recognisable).

## Out of Scope

- Visitor-draggable pins.
- Handwritten pin labels (v1).
- Apple Health or other new integrations.
- A CMS.
- Sound.
- 3D or WebGL.
- Rebuilding Professor Past (only its pin).
- A new framework.
- Interim fixes to the current production site.
- Changing domains or hosting.

## Further Notes

- **The known current defects are fixed by this rebuild, not patched separately:** blank scroll-reveal panels, the fantasy `0.0 vs 0.0`, and the Wikimedia JSON link.
- **Strava credentials** in production must be confirmed during the training-pin slice.
- **Firefox support** for scroll-driven animations is checked during the motion slice. The static fallback is acceptable.
- **The canvas About and postcard text is draft only.** The copy documents govern.
