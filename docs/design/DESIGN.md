# DESIGN.md

## Product and decision

- **Product:** eliasb.dev, Elias Bennett's personal portfolio and cultural notebook.
- **Design decision:** preserve and sharpen the selected Cabinet of Curiosities direction, using Living Editorial for hierarchy and Signals and Systems only inside relevant data views.
- **Problem and user:** prospective collaborators, employers, and fellow builders should understand Elias's work and judgment quickly, then have room to explore the person and the artefacts around the work.
- **Primary journey:** arrive at the homepage → understand the promise and point of view → inspect featured work → browse Outside work → explore occasional Experiments → reach About and contact.
- **Success:** the visitor can find the next meaningful thing without explanation, while the site feels personal, tactile, calm, and technically trustworthy.

## Scope

- **Surfaces:** `/`, `/work`, `/work/[slug]`, compatibility redirects for `/lab`, `/library`, and `/about`, and the mobile navigation shell.
- **Target devices:** narrow touch layouts from 320px through desktop widths; pointer, keyboard, light theme, dark theme, and reduced-motion preferences.
- **Included states:** first entrance, returning visitor, live signal, cached signal, authored fallback, missing imagery, open Outside work object, external-link handoff, focus-visible, loading imagery, and long content.
- **Explicitly excluded:** a second personal destination taxonomy, new personal claims, new third-party credentials, new paid services, a new visual world, and replacing the Spotify player.
- **Constraints:** Next.js App Router, server-owned integrations with truthful fallback labels, project-owned CSS/components, semantic HTML, WCAG-conscious keyboard and focus behavior, responsive images, and no animation that delays access to content.

## References

| Reference | Useful for | Carry over | Do not carry over |
| --- | --- | --- | --- |
| `docs/discovery/DESIGN-BRIEF.md` | Product intent, voice, journey, content and privacy boundaries | Thoughtful personal corner of the internet; clear work-first journey; authored fallbacks | Invented claims, corporate/CV framing, exposed private activity |
| `docs/design/SELECTED-DIRECTION.md` | Accepted visual direction | Tactile objects, selective colour, editorial restraint, small irregularity | Turning every section into a novelty object |
| `docs/content/IMAGE-CREDITS.md` | Real imagery and rights record | Bundled project, London, football, Lab, and profile imagery | Uncredited or decorative stock imagery |
| Current running site at `http://localhost:3012` | Existing implementation and rendered truth | Existing tokens, component anatomy, responsive rules, current copy and signal states | Blindly changing the established direction |

No external visual reference or Stitch exploration is needed for this pass: the visual direction is already selected and the work is a bounded refinement of the existing product.

## Design DNA

- **Content priority and reading path:** premise first, featured Work second, Outside work third, occasional Experiments fourth, contact always reachable.
- **Layout, grid, rhythm, and density:** generous section openings; asymmetrical editorial grids; tactile cards and framed images; dense mono labels only where they add orientation; mobile becomes a single readable column with a persistent bottom navigation.
- **Typography roles:** serif display for statements and artefact titles; sans for explanatory copy and controls; mono for labels, status, dates, metrics, and source links.
- **Colour roles:** warm paper/canvas and ink as the base; burnt orange for emphasis and action; green, ochre, blue, and terracotta reserved for object identity or meaningful status; focus remains visibly distinct from decoration.
- **Surfaces, borders, shadows, and radii:** paper cards, thin ink rules, small rounded frames, offset shadows, and restrained rotations that make objects feel handled without harming reading order.
- **Components and interaction feedback:** shared headers, source links, signal status pills, framed imagery, Outside work disclosures, theme toggle, and explicit external-link affordances; hover is enhancement, not the only path.
- **Motion purpose and pacing:** the hero entrance reveals hierarchy; object opening and route entry preserve continuity; hover lift/rotation confirms affordance; all motion is interruptible and collapses to immediate state changes for reduced-motion users.
- **Platform and accessibility assumptions:** semantic headings and links remain primary; keyboard focus is visible; content does not depend on hover, animation, or the third-party Spotify iframe; reduced motion, narrow screens, zoom, slow images, and fallback data are first-class states.

## Screens and states

| Screen | User decision | Empty | Loading | Error | Success | Other states |
| --- | --- | --- | --- | --- | --- | --- |
| Homepage | What should I explore next? | Authored signal cards | Image/iframe loading | Signal fallback | Work and contact visible | First entrance, returning visitor, reduced motion, light/dark |
| Work archive | Which case study is relevant? | Not applicable | Image loading | Missing image fallback | All linked case studies | Hover/focus, narrow card stack |
| Case study | Do I want the reasoning and source? | Missing optional live link | Hero/gallery image loading | External project unavailable | Layered narrative and source links | Back to work, reduced motion |
| Outside work | What should I pick up, follow, or revisit? | Authored signal and culture fallback | Feed/image/Spotify loading | Cached or authored state | Flexible signal collection with clear sources | Cards may regroup; open/close by keyboard and pointer |
| Experiments | Which occasional idea is worth opening? | A rough or unfinished item remains legible | Image loading | Missing optional live/code link | Image, description, and clear open action | Touch/pointer, focus, long descriptions |
| About | Does the person and contact context fit? | No empty state | Portrait loading | Contact link failure is external | Story, journey, life texture, contact | Local time, theme, reduced motion |

## Stitch exploration record

- **Stitch project:** not used; the direction and representative implementation already exist.
- **Design system:** project-owned CSS variables and component classes in `src/app/globals.css`.
- **Generated screens or variants:** none for this refinement pass.
- **Chosen direction:** existing Cabinet of Curiosities, grounded by Living Editorial.
- **Rejected directions:** Signals and Systems remains a supporting language for data cards, not the site-wide environment.
- **Remaining open decisions:** whether a future performance decision should change live-feed regeneration semantics; whether structured integration telemetry is justified by an operational need.
- **Last reviewed:** 21 September 2026, local rendered surface at `http://localhost:3012`; the production webpack build was checked separately.

## Implementation handoff

- **Approved tokens and component rules:** preserve `--paper`, `--ink`, `--muted`, `--line`, `--soft`, `--accent`, serif/sans/mono roles, shared headers, signal cards, framed images, and explicit source links.
- **Responsive changes:** retain the 12-column desktop composition, collapse to readable single-column content below the existing breakpoint, and keep the fixed mobile navigation clear of focus targets.
- **Accessibility requirements:** one meaningful `h1` per route; semantic links and disclosures; visible `:focus-visible`; no essential information behind hover or motion; labelled Spotify iframe plus direct Spotify fallback; reduced-motion CSS for every animation and transition.
- **Motion requirements:** use short transform/opacity transitions for affordance and route continuity; avoid layout animation; do not delay content; honor `prefers-reduced-motion: reduce` globally.
- **Acceptance evidence:** screenshots and accessibility trees from local routes; existing cross-browser evidence in `docs/launch/VALIDATION.md`; lint, typecheck, signal checks, production build, and diff checks.
- **Approved reference links:** `docs/discovery/DESIGN-BRIEF.md`, `docs/design/SELECTED-DIRECTION.md`, and `docs/content/IMAGE-CREDITS.md`.
