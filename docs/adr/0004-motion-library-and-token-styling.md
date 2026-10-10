---
status: accepted
date: 2026-09-29
---

> **Amended** on 8 October 2026 by [ADR 0005](0005-stretch-redesign.md): the first-paint constraint at the end is replaced. Only the homepage's signature entrance may hold the page visually, for about 5 seconds; content is in the server HTML throughout. Motion is no longer a runtime dependency either: the entrance runs its own spring (`components/site/entrance.ts`), and `verify:opening` checks it against Motion's `spring`, so the package is a dev dependency.

# Rebuild the presentation layer on Motion and design tokens

The re-founded site uses Motion (motion.dev) for springs, scroll-linked movement, and layout transitions. Plain CSS handles only trivial hover changes. The single hand-written `globals.css` (about 99 KB) is replaced by design tokens, which are CSS variables derived from the new `DESIGN.md`, plus component-scoped Tailwind v4 utilities.

The first build used CSS keyframes, hand-rolled intersection observers, and one global stylesheet. Motion requests needed four or more attempts each (#41, #49, #60, #70 for site motion; #2, #42, #54, #64, #73, #74 for the opening). Two production failures came from content hidden until client-side motion code ran. A shared motion library gives one set of timings and springs, interruptible animation, and built-in reduced-motion handling. Tokens give one spacing, type, and colour system that the design phase can own.

The cost is about 30 KB of client JavaScript, plus a rebuild of every presentational component. We accept this because the integration, snapshot, and content layers stay as they are.

Constraint that stays in force whichever library is used: all content is present in the HTML and visible from first paint. Motion only enhances visible content and never gates it.
