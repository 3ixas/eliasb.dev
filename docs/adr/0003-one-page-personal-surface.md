---
status: accepted
date: 2026-09-21
supersedes: 0002-library-label.md
---

# Make the homepage the canonical personal surface

The site will use one scroll-first homepage as the primary personal experience. Its navigation moves between four meaningful anchors: Home, Work, Outside work, and About. The homepage carries the authored narrative from the introduction through featured work, personal signals, experiments, portrait, and contact.

Work has two intentional layers. The homepage shows a flexible, manually curated selection of the projects Elias most wants to showcase. `/work` remains a growing archive of all case studies, and each substantial project can continue to receive an evergreen narrative page at `/work/[slug]`. A “View all work” action connects the homepage selection to the archive.

The previous Lab and Library destinations become homepage sections. The compact **Experiments** section preserves occasional Lab material without creating a publishing obligation or a primary navigation tab. The unified **Outside work** section gathers GitHub activity, London status, training, fantasy football, current reading, cinema, Spotify, and history. Its cards can change grouping and arrangement as the material changes; science fiction is not a standalone category until it has a concrete entry worth showing. The supporting line is “Some of what I’m into lately.”

The About story, personal texture, contact links, and white-tux portrait also live on the homepage. Existing `/about`, `/library`, and `/lab` paths remain compatibility routes to their corresponding homepage anchors. `/work` remains the full archive, and existing case-study URLs remain stable.

This reduces duplicated content and maintenance while preserving a clear professional entry point and the Work archive's capacity to grow. It also makes the site's personal material feel like one coherent view of Elias outside the projects rather than a set of loosely related destinations. The cost is a route and component refactor, plus careful anchor redirects and canonical metadata for existing paths.

The implementation should keep authored data in the repository, preserve the existing signal fallbacks and accessibility behavior, and treat the single homepage as a composition rather than a rigid card taxonomy.

## Follow-up decision — navigation label

After the 22 September 2026 review, the primary navigation uses **Library** for the existing unified Personal signals destination. This changes the label only: the #outside-work anchor remains stable, /library remains a compatibility route, and no separate Library page returns. This supersedes the primary-navigation label in this ADR; the one-page structure and flexible collection remain unchanged.
