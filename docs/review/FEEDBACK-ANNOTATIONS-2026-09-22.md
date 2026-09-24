# Personal site annotated review — 22 September 2026

## Source

This capture records sixteen browser annotations on the live site at [`https://www.eliasb.dev/#work`](https://www.eliasb.dev/#work), reviewed at an 820 × 814 viewport. The user supplied a screenshot for each annotation in the review conversation. The comments below preserve the requested changes and identify the visible page area; they are feedback for a later specification pass, not implementation decisions.

## Annotations

1. **Navigation label — Outside work.** The user prefers the previous label, `Library`, for this navigation item. Target: `div#top > header.site-header > nav > a:nth-of-type(3)`.

2. **Featured work presentation.** The first featured project’s layout works well. The other two expected showcases are much smaller, and a third showcase is missing. Make the remaining showcased projects comparably prominent and include the missing project. The annotation refers to three showcases; it does not set a permanent limit on the number of featured projects. Target: `section#work`.

3. **Outside work signal grid.** The signal cards feel cramped against the left side. Improve the grid’s spacing and balance. Target: `section#outside-work > div.currently-section > div.signal-grid:nth-of-type(2)`.

4. **GitHub activity calendar.** The contribution calendar is too small and needs to be more prominent. Target: the activity trace in the GitHub signal, described accessibly as “GitHub contributions over the last year, including private totals.”

5. **Training schedule contrast.** The schedule’s text is difficult to read against its background. Improve the contrast while keeping the schedule easy to scan. Target: the training signal’s “Typical week training schedule.”

6. **Site-wide writing voice.** The user finds copy such as `Authored schedule · not synced to a fitness service.` unnatural and computer-like. They want the site’s writing to sound natural and personable throughout. Target: training schedule note; scope of comment: writing across the site.

7. **Recently watched film.** Make it clear that the film shown is the user’s most recently watched film from Letterboxd. Target: the film poster in the Culture and curiosities section.

8. **Currently reading book.** Make it clear that the book shown is what the user is currently reading, sourced from Goodreads. Target: the reading object summary.

9. **Playlist wording.** The heading `A playlist with the aux cable.` feels weird and overly dramatic. Use more natural wording. Target: playlist room heading.

10. **Spotify embed layout.** The Spotify widget feels cramped and too compact. Give it more room in the playlist section. Target: playlist room.

11. **Weekly history presentation.** The user likes the idea of the weekly history section but finds its presentation visually plain and boring. Add visual interest while preserving the section’s purpose. Target: weekly history panel.

12. **Ask Professor Past.** The comment is exactly `V1`. At capture time its meaning was unclear; Elias later clarified that the highlighted experiment is V1 of the Professor Past project. Target: Ask Professor Past title in Experiments.

13. **About copy repetition.** The About prose uses `awkward` twice close together; change one instance to a different word. Target: About prose.

14. **Career overview clarity.** Make the section labelled `Connecting thread` clearer as an overview of the user’s career path. Target: About career-thread section.

15. **Career overview presentation.** The same career-thread section feels visually boring; give it more visual interest. Target: About career-thread section.

16. **Outside the editor section.** The user does not think the interests section is needed and suggests removing it. Target: About interests section.

## Notes for specification

- Keep the comments as the source of truth when translating them into acceptance criteria; avoid inventing copy or a fixed number of featured projects.
- Comment 12 was clarified before implementation: identify the highlight as V1 of Professor Past, without implying a redesign request.
- Comment 6 expresses a site-wide copy-quality concern. A later spec should define a bounded review method for natural, personable wording across the affected surfaces.
