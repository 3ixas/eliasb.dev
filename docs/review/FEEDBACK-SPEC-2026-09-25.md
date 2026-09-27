# Spec: Make the portfolio feel alive, visual, and unmistakably personal

Published as [GitHub issue #52](https://github.com/3ixas/eliasb.dev/issues/52).

## Problem Statement

The one-page site has already had a substantial design and motion pass, but the latest live review shows a gap between the experience Elias wants and what visitors still see. Some sentences sound like system notices or privacy disclaimers rather than a person talking. The opening types too quickly and unevenly, without the natural pause and second-part landing Elias likes in the Commissioner Design reference. The theme control neither follows device changes live nor gives the brand mark its orange slash. The GitHub year is still difficult to read at a glance. History has improved but still needs more curious, less headline-like facts and relevant images. The career path lists jobs more than it tells Elias’s story, and the contact area is mostly text. Across the site, too many moments remain still when they could respond to someone reading, scrolling, hovering, or tapping.

## Solution

Extend the accepted one-page experience so it feels like a lively, image-rich personal site rather than a set of static information cards. Give the homepage a deliberate opening sequence built around a natural two-part sentence; make the system theme the default and animate one sun-to-moon control; make the GitHub calendar readable and explorable; select genuinely curious, source-backed weekly history and pair it with rights-cleared images where available; and tell a more personal, evidence-based career story. Audit all public writing, imagery, and interactions so each adds useful character and the page responds consistently from opening to contact.

## User Stories

1. As a visitor, I want the writing throughout the public site to sound direct, warm, and like Elias, so that the site feels personal rather than generated or corporate.
2. As a visitor, I want unnecessary explanations and privacy disclaimers removed when they do not help me understand the page, so that the site does not explain its internal data handling to me.
3. As a visitor, I want useful source, freshness, and fallback labels to stay accurate and concise, so that more natural writing does not misrepresent live or saved information.
4. As a visitor arriving at the homepage, I want to see the page background first and then a clean, paced opening, so that the site feels intentionally introduced rather than abruptly rendered.
5. As a visitor, I want the opening sentence to type to a natural comma and let its second thought land with a distinct, smooth motion, so that its animation follows the sentence’s meaning.
6. As a visitor, I want the final highlight to arrive after the words and sit under the text, so that the heading’s finish feels deliberate.
7. As a returning visitor, I want the same opening to play on a fresh page load or reload, so that there is no separate replay control to discover.
8. As a keyboard, screen-reader, or reduced-motion user, I want the complete heading and page meaning available without waiting for visual effects, so that the entrance never blocks access to the site.
9. As a visitor, I want the site to start in the light or dark appearance I use on my device, so that it feels native when I open it.
10. As a visitor using automatic appearance, I want the site to change when I change my device’s light/dark setting while the page is open, so that I do not need to reload.
11. As a visitor, I want to choose a site appearance and return to automatic mode when I want, so that an intentional override does not silently disable system following forever.
12. As a visitor, I want one custom sun-to-moon mark to animate smoothly with the theme change, so that the control feels considered without displaying emoji or separate competing icons.
13. As a visitor, I want the E/B wordmark to use the orange slash in every theme and placement, so that the site has one consistent brand mark.
14. As a visitor interested in Elias’s work, I want a contribution calendar that shows the full trailing year at a useful size, so that I can see the rhythm and scale of his activity.
15. As a visitor, I want month and year context around the contribution calendar, so that I can tell which part of the year I am looking at.
16. As a pointer or touch user, I want to inspect individual contribution weeks or days without losing the year view, so that the chart gives me useful detail as well as an overview.
17. As a visitor on a narrow screen, I want to swipe through the full contribution year, so that the calendar stays legible instead of shrinking into tiny squares.
18. As a visitor, I want any contribution total or private aggregate to remain accurate while private repository names and details stay hidden, so that the visual improvement does not change the privacy boundary.
19. As a visitor, I want cards, images, headings, and section transitions to react to my movement in a consistent, purposeful way, so that the entire site feels alive rather than only the hero.
20. As a keyboard or touch user, I want to receive equivalent interaction feedback without relying on hover, so that the animated site remains usable on every input method.
21. As a visitor who prefers reduced motion, I want nonessential movement removed or simplified, so that the site stays comfortable and clear.
22. As a visitor, I want each major stretch of the site to have a useful visual anchor, including the opening, work, personal interests, career story, and contact, so that I understand the people, places, and projects behind the writing.
23. As a visitor, I want images to show real people, places, work, or source material rather than unrelated filler, so that the visuals make the site more informative and personal.
24. As a visitor, I want meaningful images to have appropriate descriptions and fast, responsive delivery, so that they work across screen sizes and assistive technology.
25. As a visitor reading the weekly history selection, I want surprising, little-known facts from a broad range of eras, so that the section is fun to explore rather than a list of familiar news headlines.
26. As a visitor, I want each history fact to be checked against a source and linked to its record, so that an unusual story is still trustworthy.
27. As a visitor, I want each history fact to have a relevant, rights-cleared image when one can be found and cached, so that the weekly selection becomes more vivid without relying on unrelated or unlicensed art.
28. As a visitor, I want the history section to remain readable when an image cannot be sourced, so that a missing image never makes the weekly note fail or imply a false connection.
29. As a visitor learning about Elias, I want the career section to explain the story and interests behind each transition, so that it adds something a résumé cannot.
30. As a visitor, I want the BNP Paribas role to describe the kind of software engineering Elias does, especially the pricing and risk systems context, without presenting him as only a C# engineer, so that the title is informative without narrowing his identity.
31. As a visitor, I want career claims, role framing, employer names, and dates to be grounded in details Elias has supplied, so that a more personal story remains truthful.
32. As a visitor reaching the end of the page, I want the contact area to combine a strong visual, personal language, motion, and clear ways to get in touch, so that it feels like a satisfying ending rather than a text-only footer.
33. As a visitor, I want imagery and interaction to feel coherent across the header, homepage, work, personal signals, experiments, career, and contact, so that each section feels part of the same site.
34. As a site owner, I want the existing routes, project links, sources, signal fallbacks, and privacy limits preserved, so that this experience pass does not break established behavior.

## Implementation Decisions

- Retain the accepted One-page home structure and Cabinet of Curiosities direction, with Living Editorial hierarchy. Add motion and images to that direction instead of introducing a separate visual system.
- Review public writing across the homepage, Work archive and case studies, Outside work, Experiments, About, and contact. Prefer short first-person wording. Remove redundant explanations such as privacy statements about private GitHub repositories or fantasy league managers when they do not help the visitor. Keep a source or freshness label only when it helps explain what the visitor sees.
- Preserve facts, source meaning, and state accuracy. Keep private repository names, branches, and activity details off the public page even when removing public-facing privacy prose.
- Write a first-person hero line with the same meaning as the current statement and a natural comma-led turn. Stage its visual entrance as: page background; steady typing through the first clause; the second clause arriving as a distinct landing; the highlight drawing beneath the complete statement; then the rest of the page entering. Run it on each fresh load and reload; remove the replay button. Keep the full sentence in the semantic heading, provide a keyboard way to move past the opening, and show the complete page immediately for reduced motion.
- Treat system appearance as the default state. Respond to live operating-system changes while in that state. Preserve an explicit light or dark choice until the visitor returns to system mode. Use one accessible inline sun/moon graphic whose shape transitions with the effective theme; the control name communicates the current or next action. Apply the orange slash consistently to every E/B wordmark in light and dark themes.
- Show a real trailing-year GitHub calendar with month and year context, individual day detail on pointer/focus/touch, and a horizontally navigable view on narrow screens. Size it for legibility rather than squeezing a year into a small static panel. Preserve aggregate-only treatment for private contributions.
- Keep the existing Wikimedia-based weekly history contract and seven-day refresh. Strengthen editorial selection for surprising, concrete, source-verifiable curiosities from different eras. Resolve a relevant Commons thumbnail and its creator, title, source, and license metadata when available; cache it with the weekly record and expose an appropriate credit/source link. If the image is missing, unrelated, or unsuitable for reuse, retain the fact as a clear text-led card rather than substituting a misleading image.
- Rework the About timeline into a short first-person story of the documented path from healthcare marketing and data, through full-stack engineering, to pricing and risk systems. Describe the BNP role in broad software-engineering terms with its verified systems context, not as an official title or a single-language specialty. Add story details only when supported by Elias’s CV, existing site material, or other approved project evidence; do not invent anecdotes.
- Audit major sections for a relevant visual anchor. Preserve the real project screenshots, London photograph, book and film artwork, music player, football visual, portrait, and workplace marks where they help. Add an authentic visual near the opening and a personal visual to contact. Keep an image credit record and meaningful alternative text where the image conveys information; mark purely decorative imagery accordingly. Avoid stock or AI filler that makes a claim about Elias.
- Apply one motion language across the full page: meaningful entry, scroll, hover, focus, and touch responses; restrained pacing; no essential information behind an effect; no motion that causes layout jumps or competes with reading. Make movement easy to disable through reduced-motion support.
- Retain existing project pages, anchors, signal integrations, source links, and the responsive mobile navigation. Do not add a paid service or third-party credentials for this work.

## Testing Decisions

- Good tests should prove what a visitor can see, reach, and understand in a rendered production build. They should not assert private component names, CSS selectors, or a specific layout implementation.
- Use the previously approved browser walkthrough as the primary acceptance seam. Inspect the built site at desktop, tablet, and mobile widths, including a narrow 320px viewport; run the walkthrough in Chromium, Firefox, and WebKit where available. Extend it to emulate light/dark system changes while the page is open, test an explicit override and return to system mode, and review the animated icon in both themes.
- Observe the opening from a fresh load and reload: background first, natural comma pause, second phrase landing, highlight below the text, then page reveal. Confirm the complete semantic heading is present, keyboard users can skip the entrance, and reduced motion shows the finished page immediately.
- At the browser seam, check the contribution year and month/year labels at wide and narrow widths, horizontal touch scrolling, focus access, day/week details, and truthful aggregate totals. Verify that no private repository names or activity details are rendered.
- Check the history selection and image/fallback states using deterministic source fixtures: varied eras, concrete source links, relevant image metadata, license/creator credit, weekly caching, and graceful text-only display when a suitable image is absent.
- Review the career story against supplied career evidence and the contact visual in the rendered page. Confirm keyboard, pointer, and touch users get equivalent affordances and that no critical information depends on hover.
- Reuse the existing route, signal, release-surface, lint, type, and production-build checks. Similar prior tests already cover canonical routes, live/cached/authored signal states, section anchors, responsive layouts, reduced motion, and the previous history selection.

## Out of Scope

- Replacing the accepted one-page structure, starting a new visual direction, or changing the role of the Work archive and case-study routes.
- Replacing GitHub, Sleeper, Wikimedia, Spotify, reading, film, or training integrations; exposing private activity; adding credentials, a paid service, or a new public activity feed.
- Publishing unsupported career anecdotes, changing official employer records, or narrowing Elias’s professional identity to one programming language.
- Using unlicensed images, implying endorsement by an employer, presenting an unrelated image as a historical source, or adding generic stock imagery for decoration alone.
- Rebuilding Ask Professor Past, changing the site’s section taxonomy, or reintroducing the removed replay button.
- Changing deployment, domain, or social-preview configuration.

## Further Notes

- Source: ten browser annotations on the live site dated 25 September 2026. The comments specifically call out robotic GitHub and fantasy-football sentences, the first-screen animation, system-theme following, the orange E/B slash, contribution calendar readability, site-wide motion, useful imagery, weekly history, career storytelling, and contact.
- This spec captures the new and remaining deltas after the earlier voice and motion tickets (#38 and #41–#49) were closed; it does not reopen those tickets wholesale.
- The previously approved browser test seam remains in place, with live OS color-scheme switching added to its checklist.
- Exa research informed the interaction and image decisions: the Commissioner Design reference supplies the two-part headline structure Elias likes; MDN documents the `prefers-color-scheme` and `prefers-reduced-motion` preferences; W3C explains disabling nonessential interaction animation; Wikimedia documents image metadata and reuse terms. References: [Commissioner Design](https://commissioner.design/#about), [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [W3C: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [MediaWiki Imageinfo API](https://www.mediawiki.org/wiki/API:Imageinfo/en), and [Wikimedia Commons reuse licenses](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia/licenses).
