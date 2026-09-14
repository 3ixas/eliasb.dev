# Elias B. personal site — complete discovery brief

## Product intent

Create a new personal site from scratch for `eliasb.dev`. A successful result makes nontechnical visitors, prospective employers, and fellow builders feel that they have entered a thoughtful, beautiful, personal corner of the internet.

The primary audience is people looking for founding engineers or product engineers who care about code, product thinking, design, UI, and UX. The site should demonstrate professional judgment without resembling a corporate profile or online CV.

Primary statement:

> I build thoughtful software for complex problems.

Supporting copy can describe Elias as a software engineer working across product, interface, and systems. Current financial-systems work must remain high level and must not expose confidential information or become a fabricated case study.

## Character and voice

- Personal, warm, curious, and assured.
- Editorial restraint in project writing.
- Sparse wit in labels, interactions, and empty states.
- A black-and-white or neutral foundation with selective, confident colour.
- Expressive typography, illustration, photography, motion, and live signals used with restraint.
- Light and dark modes should both feel intentionally designed.

The experience should feel distinctive without hiding ordinary actions. Visitors must be able to find Work, contact Elias, navigate back, and understand interactive elements immediately.

## Signature entrance

On the first homepage visit in a browsing session, type the primary statement in about two seconds. Resolve that same sentence into the permanent heading while the rest of the page appears through subtle, flowing motion.

The entrance must not require interaction or block access long enough to need a skip control. Do not replay it during internal navigation. Replace the typing sequence with a simple reveal when the visitor prefers reduced motion.

## Information architecture

Use a substantial homepage with four primary destinations: **Work, Lab, Library, About**.

Homepage order:

1. Signature entrance.
2. Concise introduction to Elias and the intersection of engineering, product, and design.
3. Selected work: Threshold, Argus Risk, then Flowtime.
4. A composed glimpse of current building, local time and status, reading, cinema, music, training, and fantasy football.
5. Lab preview.
6. Library preview.
7. About, email, résumé, GitHub, and LinkedIn.

Email is the primary action. Résumé, GitHub, and LinkedIn are visible secondary actions.

## Work

Each flagship project receives a separate layered case study. The opening should communicate an accessible visual story in about two minutes, followed by optional technical depth.

1. **Threshold** leads with product and visual reasoning. State clearly where bundled data is dated or estimated.
2. **Argus Risk** demonstrates architecture and system behaviour. Describe it as a local educational simulator.
3. **Flowtime** demonstrates state design, resilience, accessibility, and interaction refinement.

Ask Professor Past belongs in the Lab after its public documentation is corrected. Home Secretary is supporting university work. Risk Event Tracker and Connect Four are not flagship projects. Claims must demonstrate judgment without inventing users, traction, production scale, or founding experience.

The connecting narrative is that Elias makes consequential or messy states understandable through interface craft and humane correctness: recovery, accessibility, data ownership, shareable state, explicit uncertainty, and operational reliability.

## Lab

Lab is an exploratory collection of experiments, works in progress, failed ideas, making notes, interface studies, small tools, Ask Professor Past, and fantasy-football work. An item receives its own page only when its content or interaction merits one. It does not require a publishing schedule.

## Library

Library is one cohesive cultural space rather than a conventional blog or feed. It can contain books, cinema, history, science fiction, and music. Books, pages, movie posters, records, shelves, or related objects can become tactile interactions. Entries can open as overlays or pages when Elias has something meaningful to say.

## About and personal texture

About combines Elias's personal story, a real photograph, safe professional context, current status, local time, training, contact details, and external profiles. Test both a prominent portrait and a smaller natural photograph during concept work.

Lifting, running, Muay Thai, football, and fantasy sports should add human texture. Do not publish routes, exact locations or schedules, heart-rate data, body measurements, or other sensitive training information.

## Live and maintained signals

Distribute signals through the places where they make narrative sense. The homepage shows a composed current-life glimpse rather than a widget grid.

- **GitHub:** public activity plus aggregate private contribution counts; never expose private repository names or details.
- **Books:** site-owned reading data enriched with Open Library metadata and covers; allow an interactive book or shelf treatment.
- **Cinema:** public Letterboxd activity enriched with TMDB posters; use a poster-led interaction.
- **Training:** an official Strava public embed for current Strava data plus a custom visualization based on independently maintained, site-owned data.
- **Fantasy football:** Elias's main Sleeper redraft league, adapted to the season; anonymize other members. A bespoke prediction model can come later.
- **Music:** an official embed of a public Spotify “currently listening” playlist, framed by site-owned typography, description, permitted artwork treatment, and last-updated context.
- **Presence:** local time and a manually controlled short status with an expiry.

Keep the last successful signal with a subtle update timestamp when refreshes fail. If a source has never loaded, replace it with a designed editorial fallback made from authored content. Do not expose raw errors, permanent spinners, or empty widgets.

## Visual concept process

Explore three directions independently before selecting or combining them:

1. **Living Editorial:** expressive typography, generous space, marginalia, restrained motion, and selective colour.
2. **Cabinet of Curiosities:** tactile books, posters, records, project artifacts, photographs, and personal objects.
3. **Signals and Systems:** restrained grids, traces, diagrams, timelines, live data, and system states softened by editorial and personal material.

The working hypothesis is a Living Editorial foundation, memorable Cabinet interactions, and Signals and Systems language for data. It remains a hypothesis until the comparison is complete.

Compare the same representative slice in every direction: entrance, introduction, one selected project, the current-life glimpse, and one Library interaction. Produce desktop and mobile compositions, then a focused coded prototype for motion and interaction. Evaluate clarity, distinctiveness, personal specificity, warmth, accessibility, mobile behaviour, performance, and maintenance before combining ideas.

Use real project screenshots, one or two candidate photographs, and representative books, films, and music in the first serious concepts. Use temporary material only where credentials or final data are unavailable.

## Experience policy

- Follow the visitor's system theme initially and provide a persistent manual light/dark preference.
- Preserve the full content and personality on mobile, adapting composition and motion to smaller screens and touch.
- Replace hover-only behavior with visible touch targets. Support taps or swipes for tactile interactions and focused sequences for dense data.
- Support current Safari, Chrome, Firefox, and Edge on desktop and mobile.
- Keep core content, navigation, and contact usable without advanced animation; add richer behavior through progressive enhancement.
- Design semantic structure, keyboard access, screen-reader labels, contrast, reduced motion, and fast initial rendering from the first concept.
- Use privacy-conscious page-view and performance analytics only. Do not add advertising cookies, invasive visitor profiles, or session replay.

## Technical foundation

- Next.js App Router and TypeScript on Vercel.
- Pre-rendered pages with focused Client Component interaction islands.
- Repository-owned MDX and typed TypeScript data; no CMS at launch.
- One protected daily scheduled refresh on Vercel Hobby.
- Independent validation of every external source and a normalized last-known-good snapshot in Vercel Blob.
- A same-origin signals endpoint and bundled fallback content.
- Local core images and narrowly allowed remote image sources.
- Official Spotify and Strava embeds.

The accepted rationale is in `docs/adr/0001-nextjs-vercel-and-snapshot-architecture.md`.

## Repository and domain

- Public GitHub repository: `3ixas/eliasb.dev`.
- Local checkout: `/Users/elias/_LifeOS/03_ENGINEERING/repos/personal/eliasb.dev`.
- Canonical hostname: `eliasb.dev`.
- Redirect `www.eliasb.dev` to the apex hostname.

Do not change the live domain during design and development. Validate the complete site on its Vercel URL, preserve unrelated DNS records, and keep the old GitHub Pages deployment available at its `github.io` address during a rollback window.

## Delivery sequence

1. Establish the repository and carry these canonical documents into it.
2. Produce the three comparable visual concepts.
3. Select and document the visual system, then build the homepage.
4. Build the three Work case studies.
5. Build Lab, Library, and About.
6. Add integrations and their designed fallback states.
7. Validate responsive behavior, accessibility, browser support, and performance.
8. Validate the production deployment and cut over `eliasb.dev`.

The coherent launch experience should be complete before the domain changes. Later entries, experiments, and richer fantasy predictions can expand after launch without blocking it.

## Discovery status

The discovery decision tree is complete. Repository creation and implementation begin only after Elias confirms that this brief reflects the shared understanding.
