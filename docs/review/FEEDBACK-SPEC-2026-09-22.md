# Spec: refine the one-page personal site from the 22 September review

## Problem Statement

The live one-page site has the right overall structure, but the latest review found places where its hierarchy and wording do not yet feel as clear or personal as Elias intends. The primary navigation label “Outside work” should return to “Library.” Featured Work gives one project a strong presentation while the other examples are much smaller and the third current flagship project is missing. The Personal signals section feels crowded to the left; its GitHub calendar is too small and the training schedule is hard to read. Several labels do not make the source or current status of the reading and film clear, and some copy reads like a system message rather than a person’s site. The Spotify player is cramped, the weekly history panel looks plain, and About repeats a word, makes the career path hard to recognise, and repeats interests already represented elsewhere.

## Solution

Refine the existing One-page home using the selected Cabinet of Curiosities direction and the hierarchy of Living Editorial. Restore “Library” as the public navigation label for the same unified Personal signals destination, while keeping the one-page structure and existing anchor and compatibility routes. Present Threshold, Argus Risk, and Flowtime with a comparable level of prominence in Featured Work while retaining a manually curated selection that can grow or change. Improve Personal signals spacing, calendar size, training contrast, source clarity, and Spotify space. Review public-facing copy for natural, personable language while preserving factual claims and truthful source/freshness labels. Give the weekly history and career path considered visual structure, remove the duplicate About interests section, and keep the established responsive and accessibility behaviour.

Elias later clarified that “V1” identifies the Ask Professor Past highlight as the first version of the project. Make that clear without treating it as a request for a redesign.

## User Stories

1. As a first-time visitor, I want the site’s primary navigation to use the familiar label “Library,” so that I can find the personal and cultural material quickly.
2. As a visitor selecting Library, I want to reach the existing unified Personal signals section, so that the label does not lead to a new or separate content destination.
3. As a returning visitor, I want existing homepage anchors and the `/library` compatibility route to keep working, so that saved links remain useful after the label change.
4. As a visitor interested in Elias’s work, I want the three current flagship projects—Threshold, Argus Risk, and Flowtime—to be represented in Featured Work, so that the homepage reflects the work Elias wants to show first.
5. As a visitor, I want the featured projects to receive a comparable level of visual attention, so that one case study does not appear to matter more solely because of its layout.
6. As Elias, I want to keep choosing and ordering Featured Work by hand, so that it reflects my current judgement and can grow without a fixed project limit.
7. As a visitor, I want each featured project to open its existing case study, so that I can move from the overview to the full project story.
8. As a visitor, I want the View all work action and full Work archive to remain available, so that the homepage selection does not hide the rest of the case studies.
9. As a visitor scanning Personal signals, I want the cards to sit within a balanced, spacious composition, so that the content does not feel crowded against the left edge.
10. As a visitor interested in what Elias has been building, I want the GitHub contribution calendar to be large enough to read and notice, so that it has the prominence its year of activity deserves.
11. As a screen-reader user, I want the enlarged GitHub calendar to retain a useful accessible description, so that its visual emphasis does not remove its meaning.
12. As a visitor reading the training schedule, I want its text to contrast clearly with its background, so that each day and activity is legible in either theme.
13. As a visitor, I want the training schedule to read as an authored typical week, so that I do not mistake it for live workout tracking.
14. As a visitor, I want the site’s visible writing to sound natural, warm, and personable, so that I meet Elias through the site rather than through computer-like status messages.
15. As a visitor, I want source and freshness details to remain accurate when the copy is made more conversational, so that clear writing does not make a live, cached, or authored signal seem different from what it is.
16. As a visitor looking at the reading card, I want it to say plainly that this is Elias’s current book and identify Goodreads as its source, so that I understand what the card represents.
17. As a visitor looking at the cinema card, I want it to say plainly that this is Elias’s most recently watched film and identify Letterboxd as its source, so that I understand how current the selection is.
18. As a visitor, I want the reading and cinema source links to remain available, so that I can inspect the original shelf or diary entry.
19. As a visitor reading the playlist introduction, I want its heading and description to sound straightforward and personal, so that the music section feels relaxed rather than theatrical.
20. As a visitor using the Spotify player, I want it to have enough room to browse and play the playlist, so that the embed does not feel squeezed into its panel.
21. As a visitor on a narrow screen, I want the Spotify player and its direct Spotify link to remain usable, so that the playlist is still available when the layout stacks.
22. As a visitor interested in history, I want the weekly note to have more visual character, so that a section whose idea I like is also engaging to explore.
23. As a visitor, I want the weekly history dates, event text, and sources to stay easy to read, so that the visual treatment supports the material rather than competing with it.
24. As a visitor reading About, I want nearby repeated wording such as “awkward” to be edited, so that the prose feels considered.
25. As a visitor learning about Elias’s work, I want the connecting-thread section to be clearly presented as a career path overview, so that I understand how the different stages of his work relate.
26. As a visitor, I want to follow the career path’s stages and progression, so that the section explains the journey rather than relying on an abstract slogan.
27. As a visitor, I want the career path to have more visual interest through the site’s existing palette and editorial structure, so that it feels deliberate without becoming decorative noise.
28. As a visitor, I want the standalone “Outside the editor” interests block removed from About, so that the page does not repeat personal material already gathered in Library.
29. As Elias, I want removing that About block to leave the unified Personal signals material intact, so that reading, training, cinema, music, and the other signals remain available in their single section.
30. As a visitor on a phone or tablet, I want the navigation, three featured projects, signal cards, Spotify player, and career path to adapt to the available width, so that the revised layouts remain readable and balanced.
31. As a keyboard user, I want navigation, project links, source links, and the Spotify fallback to remain reachable with visible focus, so that I can use the revised site without a pointer.
32. As a visitor who prefers reduced motion, I want these refinements to preserve the site’s reduced-motion behaviour, so that the changes remain comfortable to use.
33. As a visitor using either theme, I want text and data surfaces to keep readable contrast, so that the selected palette remains usable in light and dark modes.
34. As a site owner, I want the refinements to retain existing routes, sources, integrations, privacy boundaries, and authored fallbacks, so that a visual and copy pass does not change the site’s data or operational behaviour.
35. As a visitor reading Ask Professor Past, I want to know that the highlighted experiment is V1 of the project, so that I understand where it fits.

## Implementation Decisions

- Use the established domain terms One-page home, Featured work, Work archive, Experiments section, Personal signals section, and About section. The latest user review restores “Library” as the public primary navigation label for the Personal signals destination; update the project vocabulary and decision record so they no longer describe “Outside work” as the navigation label.
- Keep the unified Personal signals section, its current one-page anchor, and the `/library` compatibility redirect. Changing the navigation label does not restore a separate Library page or split the collection into Now and Library.
- Include the current flagship projects Threshold, Argus Risk, and Flowtime in the homepage Featured work selection with a comparable visual treatment. Keep the selection manually curated and flexible in size; do not turn it into an automatic feed or a fixed three-project limit.
- Keep the Work archive and stable case-study destinations as the complete set of project narratives. Featured project changes should link into that existing archive.
- Refine the Personal signals composition using the selected design direction: balance the section grid, give the GitHub year view more visual weight, and adjust the authored training schedule’s text/background contrast. Keep signal groupings flexible.
- Keep signal facts and source semantics unchanged. Copy may become more natural, but labels must still distinguish authored, live, cached, unavailable, and source-linked material accurately.
- Make the reading and cinema cards explicit about their meaning and provenance: the current book comes from Goodreads and the most recently watched film comes from Letterboxd. Preserve their existing source links and data contracts.
- Give the existing official Spotify embed more visual space within the responsive playlist composition. Keep the direct Spotify link and current fallback behaviour.
- Add visual interest to the existing weekly history panel and About career path using current typography, spacing, and palette. Preserve the history events and their source links; do not create a new visual system or add decorative material that obscures reading.
- Present the About career story as a recognisable path through the stages already described. Replace one of the repeated uses of “awkward” with natural wording that keeps its meaning.
- Remove the separate About interests block. Personal signals and interests already present in the unified Library destination remain available there.
- Review user-facing copy across the public site for natural, personable language. Preserve established facts, technical claims, source attribution, and operationally important freshness/fallback meaning; do not invent personal experiences or claims.
- Identify the Ask Professor Past highlight as V1 of the project, following Elias’s clarification. Do not infer a redesign request from that label.

## Testing Decisions

- Good tests should prove what visitors can see and do in the rendered site. They should not lock the implementation to private component names, CSS selectors, or a particular card DOM structure.
- Use one primary acceptance seam: inspect the built site in a browser at desktop width, 820px, and 390px. Review the Library navigation destination, Featured work hierarchy, Personal signals balance and legibility, source labels, Spotify player, history panel, About career path, and removal of the duplicate interests block in the rendered page.
- At each width, check for clipping and horizontal overflow. Check the training text/background contrast in light and dark themes; verify the labels remain visible and the Spotify embed and direct link work when stacked.
- Exercise the navigation, case-study links, Goodreads and Letterboxd source links, Spotify direct link, and contact path with keyboard input. Check visible focus, reduced motion, and semantic names for the GitHub calendar and other meaningful visuals.
- Use the existing production release contract check as prior art for rendered homepage sections, navigation anchors, work links, metadata, images, and internal routes. Extend its expected visible navigation and featured-work contract for this spec where useful.
- Use the existing canonical route check as prior art to confirm `/library` and the other compatibility routes still point to their one-page destinations and that Work and case-study routes remain canonical.
- Use the existing signal contract verification as prior art to ensure this presentation pass keeps live, cached, authored, pending, and unavailable states truthful.
- Run the project’s established lint, TypeScript, signal, production-build, route, release-surface, and whitespace checks. Record the exact revision and browser widths reviewed.
- Compare visual results against the current launch validation and selected design rules: editorial hierarchy, tactile but restrained surfaces, selective colour, readable mobile layouts, and direct actions.

## Out of Scope

- Creating new projects, experiments, or case-study pages. Flowtime is already part of the project catalogue; this spec only changes its featured presentation.
- Changing the Work archive’s role, existing case-study URLs, or the content of its source repositories.
- Changing GitHub, Goodreads, Letterboxd, Spotify, history, or fantasy-football integrations; adding a new data provider, credential, paid service, or refresh schedule.
- Replacing the Spotify player or removing the direct Spotify link.
- Restoring separate Now, Library, Lab, or About destinations. The one-page home and current compatibility routes remain.
- Replacing the Cabinet of Curiosities direction, introducing a new site-wide visual system, or turning every Personal signals card into a dashboard.
- Removing the unified Personal signals material when removing the duplicate About interests block.
- Inferring a redesign request for Ask Professor Past from its V1 label.
- Deploying the site or changing production settings as part of the specification.

## Further Notes

- Source: sixteen user annotations on the live site reviewed on 22 September 2026; the durable annotation record preserves each target and comment.
- The project design brief identifies Threshold, Argus Risk, and Flowtime as the current flagship projects. At the time of the review, the homepage selected Threshold and Argus Risk; this spec therefore treats Flowtime as the missing third project.
- This spec intentionally supersedes the earlier decision that “Outside work” should be the public navigation label. It preserves the more important accepted decision: all personal signals and cultural material remain together in one flexible section.
- Elias clarified after the first feedback review that “V1” identifies the current Ask Professor Past highlight as the first version of the project.
- The work was divided into implementation slices for navigation and Featured work, Personal signals and copy, and About composition.
