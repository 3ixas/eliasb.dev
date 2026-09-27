# Spec: Refine the product-builder story and live interactions

## Problem Statement

The latest changes made the site feel more personal and animated, but Elias’s review of the live page found several rough edges: the homepage typing animation has no moving caret and does not play on mobile; its underline looks thin and broken; the theme control can appear to do nothing before changing appearance; the contribution calendar’s month labels collide; and the training and fantasy cards leave a conspicuous empty area. The Work heading does not share the accent treatment used by some other section headings. The contact portrait is not wanted there, and its links could be more expressive. Scrolling still feels too still.

The wording also needs a clearer thread. The site should introduce Elias as a software engineer and builder who cares about product judgement and sees ideas through to shipped software. Current copy describes individual interests and technical work, but does not yet explain that product journey consistently. Some role wording is generic or unnecessary, while the footer repeats the location without adding much.

## Solution

Keep the accepted One-page home and its existing visual direction. Refine only the annotated interactions, signal layout, heading emphasis, contact treatment, footer line, and the public copy needed to tell one coherent product-builder story.

Keep the main headline broad and about what Elias does now. Use its supporting copy to explain how he thinks about what to make, shapes and designs it, builds across the stack with others where appropriate, and follows through into shipping and iteration. Present the wish to make useful, beautiful, simple software that earns a place in everyday life as an ambition and working standard, not a claim about existing adoption or outcomes. Let the Work archive and case studies provide specific evidence and technologies.

## User Stories

1. As a first-time visitor, I want the headline to tell me plainly that Elias is a software engineer and builder, so that I understand what he does without first inferring it from project details.
2. As a visitor, I want the supporting copy to explain the product journey Elias cares about, from deciding what is worth making through shaping, designing, building, shipping, and improving it, so that I understand his product judgement as well as his engineering.
3. As a visitor, I want that story to leave room for collaboration, so that Elias’s ownership does not imply that he performs every product discipline alone.
4. As a visitor, I want to hear the ambition behind his work: software that solves a recurring need, feels simple and beautiful, and is a joy to use, so that I understand the standard he brings to projects.
5. As a visitor, I want that ambition described as an aspiration rather than an outcome already achieved, so that the site does not imply unsupported users, adoption, or impact.
6. As a visitor arriving at the homepage, I want the two-part headline to read as one natural sentence with a meaningful comma pause, so that its wording fits the Signature entrance rather than being split arbitrarily.
7. As a visitor on desktop or mobile, I want a visible caret to follow the typed text and the same opening sequence to run on every screen size, so that the effect reads as typing wherever I visit.
8. As a visitor, I want the final headline highlight to look like a loose, continuous hand-drawn marker stroke beneath the words, so that it feels expressive rather than thin and broken into fragments.
9. As a keyboard or screen-reader user, I want the complete headline available as one semantic, accessible statement while the visual sequence runs, so that animation never hides or delays its meaning.
10. As a visitor using reduced motion, I want the finished headline and page content immediately, so that the opening remains comfortable and usable.
11. As a visitor, I want one clear sun/moon control whose icon is fully visible and whose click changes the effective theme immediately, so that I can switch from dark to light or light to dark in one activation.
12. As a visitor using automatic appearance, I want the site to keep following live device-theme changes until I choose otherwise, and to offer a clear way back to system appearance, so that the one-click toggle does not silently disable a useful preference.
13. As a visitor, I want the major section headings to use the site’s accent-and-italic emphasis consistently when a phrase naturally supports it, including “building” in Featured work, so that the section titles feel like one considered voice.
14. As a visitor viewing the GitHub signal, I want the total and calendar to reflect the contribution counts GitHub makes visible on Elias’s profile, including private contributions he has chosen to show, so that the displayed activity matches his intended public aggregate.
15. As a visitor, I want one clear overall GitHub contribution total without a separate “0 private” statistic, so that the card focuses on the activity rather than an unnecessary breakdown.
16. As a visitor, I want the GitHub calendar’s month labels to remain separated and readable across the full year, so that month boundaries do not collide at the ends or on narrow screens.
17. As a visitor, I want the training and fantasy-football cards arranged to use their available space deliberately, so that their group does not look like a widget or image is missing.
18. As a visitor, I want the current BNP Paribas role line to say more about the verified pricing and risk systems work, so that the career story is more descriptive without narrowing Elias’s overall identity to a domain or language.
19. As a visitor, I want the unnecessary “through _nology” wording removed while the verified employers, dates, and career facts remain intact, so that the entry reads cleanly and accurately.
20. As a visitor, I want the homepage introduction, About story, career entries, and relevant project introductions to tell one consistent story about product judgement and follow-through, so that the site feels coherent from the opening to the detailed evidence.
21. As a visitor, I want project pages to retain their specific problems, evidence, and technology details, so that broad positioning does not flatten the differences between projects.
22. As a visitor, I want the contact section to focus on clear ways to connect rather than a second portrait, so that its links remain the visual centre of the section.
23. As a pointer user, I want the contact-link cursor to respond with an appropriate visual mark for email, GitHub, LinkedIn, and résumé, so that each action feels distinct and easy to recognise.
24. As a visitor using a keyboard, touch screen, reduced-motion preference, or browser without custom-cursor support, I want the same contact actions and clear feedback without relying on the custom pointer, so that the links remain usable everywhere.
25. As a visitor reaching the bottom of the page, I want the footer to say “Made by Elias” without the extra “in London” phrase, so that the sign-off feels simpler.
26. As a visitor scrolling through the One-page home, I want section content and objects to react visibly and smoothly to my progress, so that the experience feels more alive than a thin progress bar and one-time reveals.
27. As a visitor who prefers reduced motion, I want nonessential scroll and pointer effects removed or simplified, so that stronger motion remains comfortable and does not obscure content.
28. As a site owner, I want personal status, live-signal meaning, employer facts, project evidence, privacy boundaries, routes, and technology details to remain accurate, so that a clearer story does not invent or expose information.

## Implementation Decisions

- Keep the existing One-page home, Featured work, Work archive, Personal signals section, Experiments section, About section, and Cabinet of Curiosities direction. This is a focused refinement, not a new information architecture or a site-wide redesign.
- Revise only the narrative surfaces needed for the requested positioning: the headline and supporting copy, About and career framing, and relevant project introductions. Preserve unrelated personal updates and factual descriptions. Use first-person, conversational language with quiet confidence; avoid slogans, hype, robotic explanations, and vague abstractions.
- Keep the hero identity broad and focused on software engineering and building. Explain product judgement and follow-through in supporting copy. Treat everyday usefulness, beauty, clarity, and delight as an ambition. Keep project-specific domains, implementation evidence, and technologies in the relevant project introductions and case studies.
- Preserve project facts, role dates, employers, technologies, and outcomes. Describe collaboration where the evidence supports it. Do not turn an aspiration into an adoption claim, fabricate users or impact, claim every role is solo, or imply a different official employer title. Give the current role a more descriptive public-facing line grounded in its verified pricing and risk systems context. Remove the `_nology` clause from the career context.
- Preserve the natural punctuation and meaning of the two-part Signature entrance. Add a leading typing caret and an organic, continuous highlight that follows the wrapped headline. Run the same sequence on mobile and desktop; keep the semantic heading complete, preserve the existing way to skip the opening, and show the finished content immediately for reduced motion.
- Keep system appearance as the default and preserve live system updates while that preference is active. Make one activation of the primary appearance control visibly switch the effective light/dark theme, including when the current theme was explicitly selected. Keep a clear accessible action for returning to system appearance. Use one complete, legible sun/moon graphic and preserve the existing accessible control name behavior.
- Apply accent-and-italic emphasis consistently to major section titles where the wording naturally supports it. Feature “building” in the Featured work title. Do not force decorative emphasis into titles that read better without it, and do not restyle unrelated content as part of the copy update.
- Use the same GitHub contribution aggregate that matches the counts Elias has enabled on his public GitHub contribution profile. Do not add the private count a second time, expose repository names or details, or render a standalone “0 private” metric. If the source cannot supply the expected aggregate, keep the signal truthful rather than inventing a value.
- Keep the contribution calendar’s full-year view, keyboard exploration, day details, and touch scrolling. Adjust month-label placement or density so adjacent labels never collide at supported widths.
- Recompose the training and fantasy cards using their existing information and authentic imagery where useful. Fill the available space through purposeful grouping and proportion, not unrelated filler or invented content.
- Remove the portrait from Contact only; retain the selected portrait in About. Give each contact action a restrained, recognisable pointer mark: envelope for email, GitHub and LinkedIn marks for their links, and a document/page symbol for the résumé. Treat the marks as decorative; keep ordinary links, click targets, focus indication, selection, and touch behavior intact. Restrict custom pointer behavior to suitable hover-capable pointers and disable or simplify it for reduced motion.
- Remove “in London” from the footer sign-off. Leave other accurate London references unchanged.
- Make scroll response perceptible across the major stretches of the page, not only at the hero. Extend the existing motion language with restrained responses tied to scroll progress or section entry. Avoid layout jumps, constant distracting parallax, hidden content, or effects that compete with reading. Preserve keyboard access and reduced-motion behavior.
- Do not add a paid service, a third-party credential, or an external cursor-asset dependency for these refinements.

## Testing Decisions

- Good tests should prove what a visitor can see, read, and operate on a rendered production build. Locate content by visible text, semantic structure, and accessible names rather than private CSS classes or a particular layout implementation.
- Reuse the previously approved browser walkthrough as the primary end-to-end seam, with the existing route, signal-contract, and release-surface checks. Inspect desktop, tablet, and narrow mobile layouts, including 320px width, in Chromium and other available engines.
- On a fresh homepage load and reload, observe the background-first opening, caret tracking, comma pause, second-phrase landing, hand-drawn highlight, and full-page reveal at both wide and mobile widths. Check that the complete semantic heading is present before animation finishes, keyboard input can skip the entrance, and reduced motion presents the finished state immediately.
- In the browser walkthrough, switch from dark to light and light to dark with one activation. Verify the icon is fully drawn, the accessible name is current, system changes are followed while in system mode, explicit selection is respected, and returning to system mode works.
- Review major section headings for consistent but natural accent emphasis. Read the hero, supporting copy, About/career text, and project introductions together and verify one coherent product-builder story without unsupported outcome claims or unrelated copy changes.
- Use deterministic GitHub signal fixtures for the profile-visible aggregate, contribution days, absent token/source fallback, and private-contribution setting. Verify totals and calendar days are not double-counted, the separate “0 private” metric is absent, and private repository details never appear. In the rendered browser, check month labels at the start, end, and scroll positions of the year at wide and narrow widths.
- Inspect the Personal signals layout at desktop, tablet, and mobile widths. Confirm training and fantasy content fill their composition deliberately without clipping, blank-looking gaps, or fabricated filler.
- Hover each contact action and confirm the matching pointer mark. Verify links still work with ordinary pointer clicks, keyboard focus, touch, text scaling, and reduced motion. Confirm the removed contact photo does not remove the About portrait.
- Scroll from the top through contact and confirm visible motion responds across major sections without content jumps or blocking controls; repeat with reduced motion enabled and confirm nonessential effects are absent or simplified.
- Reuse the established lint, TypeScript, signal-contract, canonical-route, production-build, and release-surface checks.

## Out of Scope

- Replacing the accepted One-page home, navigation, Work archive, or Cabinet of Curiosities visual direction.
- Reopening the completed history, general imagery, theme-default, or prior site-wide motion work except for the specific refinements listed here.
- Rewriting every sentence or changing unrelated personal updates, data descriptions, signal sources, or project chapter content.
- Adding new projects, technologies, metrics, users, adoption claims, career anecdotes, or employer facts.
- Replacing the GitHub, Sleeper, Wikimedia, Spotify, reading, film, or training integrations; exposing private repositories or other private activity.
- Removing the About portrait, changing production domains, adding new credentials, or introducing a paid or external cursor service.
- Reworking project layouts or the overall design as a side effect of the copy improvements.

## Further Notes

- Source: nine browser annotations on the live site plus Elias’s explicit positioning and copy constraints in this request.
- This is a follow-up to the shipped polish captured in GitHub issue #52. It records the new defects and positioning direction without reopening the completed tickets #53–#60 wholesale.
- The repository vocabulary uses Personal site, One-page home, Signature entrance, Featured work, Work archive, Personal signals section, Experiments section, and About section. The accepted One-page home decision and the navigation-label follow-up remain in force.
- The current implementation already has a semantic Signature entrance, system-theme preference, contribution-calendar interaction, responsive Personal signals grid, contact links, scroll progress, and section-entry motion. Prefer improving those existing seams over adding a new framework or a second interaction system.
- The previously approved test seam remains the production-build browser walkthrough combined with the existing route, signal, and release checks; this spec adds the specific cases above.
