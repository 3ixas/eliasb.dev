# Personal site discovery

## Confirmed direction

- The site should feel like a thoughtful, beautiful, personal corner of the internet.
- Its primary audience is people hiring founding engineers or product engineers who value code, product thinking, design, UI, and UX. Fellow builders also matter, and nontechnical visitors should be able to enjoy it.
- It should include professional work, interests, ideas, and other personal material. It should not read like a corporate profile or an online CV.
- Design, UI, UX, and frontend craft are central to the project.
- Primary professional statement: **“I build thoughtful software for complex problems.”**
- Compare several visual concepts before choosing a direction. No implementation should begin until the discovery tree is complete and Elias confirms shared understanding.

## Personal material

The site may include all four of these areas. Their hierarchy and presentation remain open:

1. Building and experimentation: work in progress, interface studies, small tools, failed ideas, and lessons from making products.
2. History, cinema, reading, and science fiction: a cultural notebook, shelf, timeline, collection, or another format distinct from a conventional blog.
3. Lifting, running, and Muay Thai: human texture through routines, milestones, or occasional observations.
4. Football and fantasy sports: a playful addition with a data-oriented angle.

## Lead references

### Commissioner

The lead reference. Elias likes its personalisation, typography, animation, illustrations, integrations, and GitHub contribution widget. Its page-opening sequence is the preferred interaction model: a sentence types quickly, then settles into the page while the rest of the interface loads with subtle motion.

### Sparsh Paliwal

Elias likes its clarity, layout, light and dark modes, restrained use of colour, and small playful illustrations.

### Matthew Yu

Elias especially likes the interactive sketchbook. It is a personal artifact that also becomes a memorable interaction.

## Design principles inferred from the references

These principles are accepted only where they restate Elias's answers. Specific visual treatments remain open.

- Start from a primarily black-and-white or neutral system, with selective punches of colour.
- Use expressive fonts, illustration, motion, or integrations to add personality without overwhelming the content.
- Make the initial introduction automatic, brief, and attention-grabbing.
- Do not require visitors to understand or complete a gesture before reaching the content.
- Type the primary statement during the signature entrance and resolve that same sentence into the permanent page heading in about two seconds.
- Run the full entrance only on the first homepage visit in a browsing session and do not replay it during internal navigation.
- Make the entrance brief and fluid enough that it does not need a visible skip control. Reveal the page as the opening statement resolves instead of making visitors wait at a separate screen.
- Replace the typing sequence with a simple reveal when reduced motion is preferred.
- Keep the information clear and well composed even when the presentation is playful.
- Support light and dark modes.

## Living site

Begin with a strong, durable core and leave room for an optional area for notes, experiments, or discoveries. Do not require a publishing schedule. Building and experimentation is the leading candidate for this living area; the other personal material may connect to it or use different formats.

Elias wants all seven proposed live-signal categories because current activity makes the site feel personal:

1. GitHub contributions and recent building activity.
2. Current or recent books, potentially presented through an interactive book experience.
3. Recent films or progress through the cinema journey, potentially using Letterboxd and interactive movie posters.
4. Training activity from lifting, running, or Muay Thai, potentially using Strava.
5. Fantasy-football team, matchup, player, or prediction data.
6. Music or another currently-enjoying signal.
7. Local time and a short manually controlled status.

The integrations should form part of a composed personal experience rather than a grid of generic widgets. Their sources, distribution, privacy boundaries, refresh model, and fallback architecture are confirmed below; their final visual treatment will be tested in the concept work.

Confirmed integration direction:

- Distribute the live signals through their relevant parts of the site. Show only a composed current-life glimpse on the homepage.
- Include aggregate private GitHub contribution counts. Do not expose private repository names or activity details.
- Use a public Letterboxd feed and poster-led film experience.
- Use an official Strava embed for current public activity, paired with a custom site-owned training visualization. Do not expose routes, exact locations, heart-rate data, body measurements, or detailed schedules.
- Use Elias's main Sleeper redraft league as the fantasy-football showcase, with other league members anonymized.
- Use a public Spotify “currently listening” playlist that Elias updates occasionally. Present the official playlist embed inside the site's own typography, description, permitted artwork treatment, and last-updated context.
- Keep book data site-owned and enrich it with external metadata and covers.
- Use a manually controlled status with an expiry.

## Information architecture and case studies

- Use a hybrid structure: a substantial homepage tells the main story and links to deeper project and personal experiences.
- Use the primary navigation **Work, Lab, Library, About**.
- **Lab** contains experiments, works in progress, lessons from making, Ask Professor Past, and the fantasy-football experience.
- **Library** contains books, cinema, history, science fiction, and music.
- The homepage should include the signature entrance, concise introduction, three selected projects, a glimpse of current activity, personal texture, and contact information.
- Use layered project case studies. Each begins with an accessible visual story and offers optional technical depth.
- Threshold emphasises product and visual reasoning.
- Argus Risk emphasises architecture and system behaviour.
- Flowtime emphasises state, resilience, accessibility, and interaction refinement.

Confirmed detailed page model:

- **Work** has an index, separate case studies for Threshold, Argus Risk, and Flowtime, concise professional experience, and a résumé link.
- **Lab** is an exploratory collection of experiments, works in progress, making notes, interface studies, Ask Professor Past, and the fantasy-football experience. Individual items receive pages only when their content warrants one.
- **Library** is one cohesive interactive space for books, cinema, history, science fiction, and Spotify. Individual entries may open as overlays or pages when there is something meaningful to say.
- **About** contains the personal story and photograph, safe professional context, training and Strava, current status, contact details, résumé, GitHub, and LinkedIn.

Confirmed homepage narrative order:

1. Signature entrance using “I build thoughtful software for complex problems.”
2. Concise introduction covering Elias, financial-systems work, and the intersection of engineering, product, and design.
3. Selected work: Threshold, Argus Risk, then Flowtime.
4. A composed current-life glimpse spanning current building, local time and status, reading, cinema, music, training, and fantasy football.
5. A preview from the Lab.
6. A preview from the Library.
7. About, contact, résumé, GitHub, and LinkedIn.

## Visual concept territories

Explore three distinct concepts against the same content architecture before selecting or combining them:

1. **Living Editorial**: strong typography, generous space, black-and-white foundations, selective colour, elegant transitions, marginal notes, and a composed publication quality. This is closest to Commissioner.
2. **Cabinet of Curiosities**: books, posters, records, project artifacts, and personal objects become tactile interactive elements on a quiet canvas. This draws from Matthew Yu without copying the sketchbook.
3. **Signals and Systems**: restrained grids, diagrams, timelines, live data, system states, and animated signals, softened by editorial typography and personal content.

Current hypothesis: Living Editorial may provide the foundation, Cabinet of Curiosities the memorable interactions, and Signals and Systems the language for GitHub, training, and fantasy data. Test the concepts separately before validating that combination.

Elias has several suitable photographs and is open to either a prominent portrait or a smaller natural photograph. Test photographic prominence within the visual concepts rather than deciding it in isolation. Prefer real photography over a generic illustrated avatar.

## Experience quality

- Treat clear navigation, accessibility, and direct access as constraints, then push visual distinctiveness within them.
- Visitors must not have to guess how to reach Work, contact Elias, go back, or identify an interaction.
- Preserve the complete content and core personality on mobile while adapting spatial composition and heavy motion for touch and smaller screens.
- Replace hover-only discoveries with visible touch targets. Adapt page turns to clear taps or swipes and data views to focused sequences.
- Design keyboard access, semantic structure, screen-reader labels, contrast, reduced motion, and fast initial rendering from the first concept.

## Delivery strategy

Build and review privately in stages. Change `eliasb.dev` only after the coherent launch experience is complete:

1. Content architecture and three visual concepts.
2. Selected visual system and homepage.
3. Work case studies.
4. Lab, Library, and About.
5. Integrations and designed fallback states.
6. Responsive, accessibility, and performance validation.
7. Domain cutover.

## Technical and repository foundation

- Use Next.js App Router with TypeScript and deploy on Vercel.
- Pre-render the main pages and case studies. Use focused Client Component islands for the entrance, tactile objects, and data visualizations.
- Keep authored content in repository-owned MDX and typed TypeScript data. Do not add a CMS at launch.
- Refresh external sources through one protected daily scheduled route. Validate sources independently and write a normalized last-known-good snapshot to Vercel Blob.
- Start on Vercel Hobby. Reconsider Pro only if the value of sub-daily freshness justifies the recurring cost.
- Keep the repository public as `3ixas/eliasb.dev` and create its local checkout at `/Users/elias/_LifeOS/03_ENGINEERING/repos/personal/eliasb.dev` after discovery is approved.
- Use `eliasb.dev` as the canonical hostname and redirect `www.eliasb.dev` to it.
- Keep the existing GitHub Pages site available as a rollback target during the domain cutover.

## Voice and professional boundary

- Use a warm, conversational voice as the base.
- Give project writing editorial restraint.
- Use wit sparingly in labels, empty states, and interactions.
- Describe current work on financial risk systems at a safe, high level. Do not expose internal details or fabricate a case study from confidential work.
- Let public personal projects provide the detailed evidence of product and engineering craft.
- Use email as the primary visitor action. Keep the résumé, GitHub, and LinkedIn as visible secondary links.

## Open decisions

The discovery tree is complete. Cabinet of Curiosities was selected on 2026-09-14, with Living Editorial supplying the structural foundation. Signals and Systems will be limited to softened, contained data treatments because the site-wide concept felt too harsh.

The following design decisions remain in the selected-direction phase:

- The final type system, colour accents, illustration approach, photographic prominence, and motion language.
- The visual composition of signals and their authored fallback states.

Confirmed final policies:

- Compare the same homepage and Library slice in all three visual directions at desktop and mobile sizes, followed by focused coded interaction prototypes.
- Follow the visitor's system theme initially and preserve a manual light/dark preference.
- Use privacy-conscious page-view and performance analytics without advertising cookies, invasive profiles, or session replay.
- Support current Safari, Chrome, Firefox, and Edge across desktop and mobile, with core content available through progressive enhancement.
- Use real project screenshots, candidate photographs, and representative cultural material in the first serious concepts.
- Retain last-known-good signal content with a subtle update time; use an authored editorial fallback when no snapshot exists.

## Public GitHub evidence

Reviewed the nine public, non-fork repositories on `3ixas` on 2026-09-13. Public repository evidence supports the proposed positioning: an engineer who owns products end to end and cares about behaviour, interface, and operational correctness.

### Strongest portfolio stories

The confirmed display order is:

1. **Threshold**: lead project and strongest product and visual-design case. It combines rental-affordability calculations, maps and data visualisation, typed city configuration, shareable URL state, accessibility considerations, tests, CI, and explicit design exploration. Its bundled data is dated and some values are estimates, which a case study must state honestly.
2. **Argus Risk**: strongest systems-engineering complement. It combines an event-driven .NET backend with Kafka, PostgreSQL, SignalR, and a Next.js interface, with event sourcing, reconciliation, stale-state handling, observability, architecture documentation, and tests. It is a local educational simulator rather than a production product.
3. **Flowtime**: strongest UX and reliability case. It is an offline-first focus timer with explicit timer states, recovery after browser closure, local-only data and export, keyboard and screen-reader support, reduced-motion behavior, extensive tests, and a visible design-refinement history.

### Supporting work and caveats

- **Ask Professor Past** adds personality, history, and an AI-assisted experience, but its public documentation overstates its testing and uses imprecise model terminology. Clean it before presenting it as technical proof.
- **Home Secretary prototype** shows full-stack, security, delivery-process, and database-policy work. It should be described as university coursework.
- **Risk Event Tracker** and **Connect Four** are early or small exercises rather than flagship work.
- The old personal portfolio is a baseline for evolution, not a flagship case study.
- Public repositories do not establish customer traction or founding experience. The site should demonstrate product judgment without inventing market outcomes.

### Candidate narrative

Elias builds end-to-end products that make consequential or messy states understandable. The work combines interface craft with humane correctness: recovery, accessibility, data ownership, shareable state, explicit uncertainty, and operational reliability.

This evidence supports the confirmed primary statement: **“I build thoughtful software for complex problems.”** The supporting copy can explain the more specific end-to-end product and interface qualities without overloading the opening sentence.

## Existing-site constraints

- The existing public repository is `3ixas/personal-portfolio-v1` on its `main` branch.
- It is a static site deployed through GitHub Pages, with `eliasb.dev` assigned through `CNAME`.
- The eventual domain change must be an intentional cutover from the old deployment.
- The new local repository is intended to live under `/Users/elias/_LifeOS/03_ENGINEERING/repos/personal`.
