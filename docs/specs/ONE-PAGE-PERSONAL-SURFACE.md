## Problem Statement

The site currently asks visitors to move between a homepage narrative and separate Lab, Library, and About destinations. Those routes repeat parts of the same personal story, split the live signals from the cultural material, and create maintenance surfaces that do not match how Elias expects to update the site.

The homepage already contains the strongest narrative and the Work section. The next architecture should make that homepage the coherent personal experience while preserving Work as a durable case-study archive that can grow over time.

## Solution

Make the root route the canonical one-page personal surface.

The homepage will contain:

1. The signature introduction.
2. Featured Work: a flexible, manually curated selection of the projects Elias most wants to showcase.
3. Outside work: one flexible collection of personal signals and interests.
4. Experiments: a compact, occasional area for Lab material.
5. About, the selected white-tux portrait, and contact.

The primary navigation is Home, Work, Library, and About. These items move between homepage anchors; Library reaches the unified Personal signals section. Work also provides a View all work action to the complete Work archive at /work.

Work keeps two layers:

- The homepage selection remains intentionally small and editorial. It has no fixed project count and is manually ordered.
- /work remains the full archive of case studies, with stable /work/[slug] narrative pages for substantial projects.

The unified Outside work section will contain GitHub activity, London status, training, fantasy football, current reading, recent cinema, Spotify, and history. Its cards may be grouped and arranged according to the material. The supporting line is “Some of what I’m into lately.” Science fiction is not a standalone visible category until a concrete entry earns space.

Lab becomes the visible Experiments section and leaves the primary navigation. Library and About become homepage sections. Existing /about, /library, and /lab paths remain compatibility routes to their corresponding homepage anchors.

## User Stories

1. As a first-time visitor, I want to understand Elias’s point of view from one continuous homepage, so that the site feels like one personal experience rather than a set of disconnected destinations.

2. As a returning visitor, I want the Home navigation item to return me to the top of the homepage, so that I can restart the narrative easily.

3. As a visitor interested in professional work, I want the Work navigation item to take me directly to the homepage featured-work section, so that I can reach the strongest evidence quickly.

4. As a visitor interested in professional work, I want the homepage featured-work section to show the projects Elias currently considers his strongest, so that the first impression stays focused and intentional.

5. As Elias, I want to change the number and order of featured projects manually, so that the homepage can adapt to my judgement without requiring a fixed project count or an automatic feed.

6. As a visitor, I want each featured project to open its detailed case study, so that I can move from a quick overview into the reasoning and implementation behind the work.

7. As a visitor, I want a clear View all work action, so that I can discover projects that are not currently part of the homepage selection.

8. As Elias, I want the Work archive to accept new case studies over time, so that the portfolio can grow without making the homepage longer every time.

9. As a visitor, I want the Work archive to present case studies as evergreen project narratives, so that I can understand the problem, decisions, behaviour, and outcome of each project.

10. As a visitor, I want existing case-study URLs to remain stable, so that shared links and search results continue to work after the homepage architecture changes.

11. As a visitor, I want the Library navigation item to reach one unified personal section, so that I can explore Elias’s interests and current activity in one place.

12. As a visitor, I want to see GitHub activity in Outside work, so that I can understand what Elias has been building recently.

13. As a visitor, I want to see London time and a short current status, so that the site has a sense of place without exposing precise location or private routines.

14. As a visitor, I want to see the authored training pattern, so that training adds human texture without pretending that the site has live Apple Health or Apple Workouts data.

15. As a visitor, I want to see the fantasy-football signal with anonymous opponent information, so that the section shows personality while respecting other people’s privacy.

16. As a visitor, I want to see the current book, so that I can understand what Elias is reading now.

17. As a visitor, I want to see the latest film entry and its Letterboxd source, so that the cinema signal remains current and verifiable.

18. As a visitor, I want to see the Spotify playlist through the official embed and a direct Spotify link, so that I can listen in place or continue in Spotify.

19. As a visitor, I want to see a small history note, so that the cultural section has room for curiosity beyond the current book and film.

20. As Elias, I want Outside work cards to regroup when the material changes, so that the section remains expressive without imposing a permanent taxonomy.

21. As Elias, I want to omit science fiction as a named category until there is a meaningful entry, so that the site does not preserve a redundant or empty concept.

22. As a visitor, I want the Outside work section to label the content plainly with “Some of what I’m into lately,” so that the tone stays personal and direct.

23. As a visitor, I want the Experiments section to show occasional ideas such as Ask Professor Past, fantasy models, and interface studies, so that the site retains its exploratory personality.

24. As Elias, I want Experiments to remain a compact homepage area without a primary navigation tab or publishing schedule, so that maintaining it does not become another obligation.

25. As a visitor, I want the About navigation item to reach the full personal context on the homepage, so that the professional story, interests, portrait, and contact details remain together.

26. As a visitor, I want to see the white-tux portrait in About, so that the chosen image carries the intended personal tone.

27. As a visitor, I want a clear primary contact action at the end of the homepage, so that reaching Elias does not depend on finding a secondary profile link.

28. As a visitor using an old About URL, I want to reach the homepage About section, so that existing bookmarks remain useful.

29. As a visitor using an old Library URL, I want to reach the homepage Personal signals section, so that existing links do not lead to a retired destination.

30. As a visitor using an old Lab URL, I want to reach the homepage Experiments section, so that existing links remain meaningful.

31. As a visitor, I want homepage navigation to update the URL with a meaningful anchor, so that I can share or revisit a specific section.

32. As a keyboard user, I want anchor navigation and section actions to remain keyboard accessible, so that I can use the one-page experience without a pointer.

33. As a keyboard user, I want focus to remain visible and predictable after navigation, so that I can tell where I am in the long page.

34. As a visitor who prefers reduced motion, I want anchor navigation, object opening, and route transitions to avoid unnecessary animation, so that the page remains comfortable and fully usable.

35. As a visitor on a narrow screen, I want the sections and flexible cards to collapse into a readable sequence, so that the one-page structure remains useful on mobile.

36. As a visitor in either theme, I want the new sections and navigation to retain the existing intentional light and dark treatments, so that the architecture change does not weaken the visual system.

37. As a visitor, I want live, cached, and authored fallback states to remain identifiable in Outside work, so that the site does not present stale or unavailable data as current.

38. As a site owner, I want the one-page experience to keep using repository-owned authored content and existing signal integrations, so that this architecture change does not introduce a CMS, new credentials, or a second data platform.

## Implementation Decisions

- The homepage composition becomes the highest implementation seam. It owns the section order, anchor IDs, primary navigation destinations, featured Work selection, Outside work composition, Experiments preview, About content, portrait, and contact.
- The shared site header and mobile navigation use the destinations Home, Work, Library, and About; Library reaches the unified Personal signals section. Work navigates to the homepage Work anchor; a separate action opens the full Work archive.
- The homepage uses stable semantic anchors for the top, Work, Outside work, Experiments, About, and contact sections. Navigation and deep links preserve meaningful hash targets and remain progressively usable without motion.
- Featured Work is a manually ordered authored collection with a flexible count. It is independent from the complete Work archive and does not automatically become a feed of the newest projects.
- The Work archive remains a full route and accepts new case-study entries. Existing case-study routes remain stable. Archive ordering remains editorial, with room for new additions without changing the homepage composition.
- Case-study pages remain evergreen project narratives with visual evidence, accessible explanations, optional technical depth, and existing project/source links.
- Outside work replaces the previous Now and Library split with one flexible composition. It reuses the existing GitHub, manual-status/local-time, training, Sleeper, Goodreads, Letterboxd, Spotify, and history signal contracts and their truthful freshness/fallback states.
- Outside work does not introduce a rigid card taxonomy. Card order and grouping can change as the authored and refreshed material changes, while the section remains one navigation destination.
- The Outside work supporting copy is “Some of what I’m into lately.” Science fiction is omitted from the visible category model until a concrete entry justifies it.
- Experiments reuses the existing Lab material as an occasional homepage section. Its visible name is Experiments, it has no primary navigation item, and its compatibility route points to the homepage section.
- The homepage About section uses the white-tux portrait as the primary image and retains the current professional boundary, connecting thread, interests, external links, résumé, and contact action.
- The former About, Library, and Lab routes become compatibility redirects to homepage anchors. The Work index route remains the complete archive rather than becoming a redirect.
- The canonical metadata and sitemap describe the root homepage and the Work archive. Compatibility routes must not create competing indexable copies of the same content.
- Authored content remains repository-owned typed data or MDX. No CMS, new account integration, new credential, or new storage service is introduced by this change.
- The existing visual direction, theme system, image-credit rules, integration fallbacks, motion contract, and accessibility contract remain in force.

## Testing Decisions

- Tests should prove external behaviour at the route and rendered-interface seam. They should not assert private component structure or CSS implementation details.
- The highest-value seam is the homepage route plus the shared navigation shell: render the homepage, activate each navigation item, verify the target hash and visible section, and confirm the links work with keyboard input.
- Test the Work boundary by verifying that featured cards open their case-study routes, the View all work action opens the archive, the archive can render more entries than the homepage selection, and existing case-study URLs remain valid.
- Test compatibility routes by requesting /about, /library, and /lab and verifying that each resolves to the intended homepage anchor without producing a duplicate content surface.
- Test Outside work as a composition: all required signal categories can appear, card grouping is not assumed by the test, and live, cached, fallback, missing, and source-link states remain truthful.
- Test the exact supporting copy, visible section label, selected portrait, and omission of a standalone science-fiction card through rendered output.
- Test responsive rendering at the established narrow mobile and desktop widths, including long descriptions, open disclosures, the Spotify iframe fallback link, and the Work archive.
- Test keyboard navigation, visible focus, skip-link behaviour, semantic headings, anchor navigation, and reduced-motion behaviour on the homepage and compatibility redirects.
- Test light and dark themes for contrast and legibility in the new navigation and sections.
- Test canonical metadata, sitemap entries, and exclusion of compatibility duplicates.
- Use the repository’s existing signal contract verification as prior art for integration fallback behaviour.
- Run the established lint, TypeScript, production build, signal verification, and diff-check commands after implementation.
- Repeat the existing route crawl and browser QA approach recorded in the launch validation documents, adding the new anchor and compatibility-route cases.

## Out of Scope

- Rewriting the individual Threshold, Argus Risk, or Flowtime case-study content.
- Adding new projects, new experiments, or new cultural entries as part of this architecture change.
- Building a CMS, private editor, database, or new content publishing workflow.
- Adding Apple Health, Apple Workouts, paid Strava access, new fitness providers, or new live-data credentials.
- Adding a new film metadata provider, synopsis scraper, or new Spotify integration.
- Creating a standalone science-fiction section.
- Replacing the Spotify iframe.
- Adding automatic project ranking, search, filtering, or a continuously generated project feed.
- Changing the selected Cabinet of Curiosities visual direction or creating a new site-wide visual system.
- Removing or rewriting stable Work case-study URLs.
- Deploying, changing DNS, or changing production credentials as part of this spec.

## Further Notes

- The accepted architecture decision is recorded in ADR 0003, and the domain glossary now uses One-page home, Featured work, Work archive, Experiments section, Personal signals section, and About section.
- The earlier decision to use Outside work as the public navigation label is superseded by the 22 September 2026 feedback decision: Library labels the unified Personal signals section. The #outside-work anchor and /library compatibility route remain in place.
- The implementation should be split into dependency-aware slices after this parent issue: route and navigation foundation, homepage section composition, Work archive/featured boundary, compatibility routes and metadata, and responsive/accessibility verification.
- The site remains a personal portfolio and cultural notebook rather than a blog or dashboard. The architecture should make future updates easier without making the experience feel like a feed.
