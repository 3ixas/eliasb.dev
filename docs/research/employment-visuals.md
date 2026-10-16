# How engineer portfolios show employment visually

Research for [#191](https://github.com/3ixas/eliasb.dev/issues/191), part of the section-by-section design review ([#190](https://github.com/3ixas/eliasb.dev/issues/190)). It feeds the **Work** prototype ([#194](https://github.com/3ixas/eliasb.dev/issues/194)). Nothing here is a decision.

Question: how do standout engineer portfolios show employment visually, rather than as a text CV, when the work itself is confidential? Which patterns fit the staff-pass-on-a-lanyard direction (one pass per employer in its **Employer colour**, BNP's the biggest), and which fight it?

Method: sites visited in a real browser on 16 October 2026 (screenshots taken and described below in words), plus first-party write-ups. Where a page did not load, that is said.

## What the sites actually do

### 1. Reverse-chronological list with tech chips (the default)

[brittanychiang.com](https://brittanychiang.com/#experience). A dark navy page; each role is a block with a small uppercase date range ("2024 — PRESENT"), a heading of title · employer with an outward arrow linking to the employer, a short paragraph, then a row of rounded teal-tinted pills for the stack (JavaScript, TypeScript, React…). Apple and Starry entries add links to press (9to5Mac, The Verge). The list ends with "View Full Résumé". No logos, no employer colour. Clear and widely copied; the only visual layer is the chips.

Her older v4 site ([v4.brittanychiang.com](https://v4.brittanychiang.com/#jobs)) is known for a tabbed employer list, but it rendered blank in the browser, so it is not described here.

### 2. Logo-avatar cards (the template pattern)

[dillion.io](https://dillion.io/) (the Magic UI portfolio template's author). "Work Experience" is a stack of rounded white cards, each with a circular employer logo on the left (Atomic Finance, Shopify, Nvidia, Splunk, Lime), employer name in bold, role underneath, dates right-aligned. A card expands to a paragraph. The logo carries all the colour.

### 3. Structured log with metadata and duration

[chanhdai.com](https://chanhdai.com/). Dark, monospace-flavoured. Each employer has a small icon tile, the name, location and "(Remote)" with a blue live dot for current roles. Under it each position has an icon, title, a row of metadata ("Full-time | 01.2026—∞ | 10m"), a collapsible bullet list, and mono tag chips. An infinity sign stands for "present"; a computed duration is shown. A vertical rule ties positions to their employer, so promotions read as one tenure.

### 4. Employer named in prose, no section at all

[emilkowal.ski](https://emilkowal.ski/) ("Today — I work on the Web team at Linear… Previously, I worked on the design team at Vercel"), [paco.me](https://paco.me/) ("Webmaster at Linear… In the past I've developed the Vercel design system"), [brianlovin.com](https://brianlovin.com/) ("currently making AI products at Notion"), [leerob.com](https://leerob.com/) (employer names as links in the bio). Employment is one sentence near the top; everything visual is spent on the person's own work. This is the most common pattern among well-known design engineers.

### 5. Employer in an oversized hero card

[rauno.me](https://rauno.me/). The site is a horizontal row of white cards on grey. The first card is the intro set very large: "Rauno Freiberg is an Estonian interaction designer working with Vercel and Devouring Details", with a big yellow disc behind it. The employer is part of the headline; the card is the object.

### 6. A role told through team artefacts and hard numbers, not the work

[leerob.com/vercel](https://leerob.com/vercel), "5 Things I Learned From 5 Years At Vercel". It opens with numbers about the company and his growth (joined at 30 people and $1M ARR; left at 650 people and over $200M ARR; IC to VP), then a horizontal strip of slightly rotated polaroid-style photos with handwritten-style captions ("Next.js Conf 2024", "Vercel team dinner", "Japan community meetup"). Nothing proprietary is shown; the life around the work carries the visuals.

### 7. The lanyard badge itself

Vercel's [Ship 2024 write-up](https://vercel.com/blog/building-an-interactive-3d-event-badge-with-react-three-fiber): a white card with the attendee's name, hung from a strap made of three physics joints drawn as a thick line through a Catmull-Rom curve. On drag the card follows the pointer, and on release it swings back and is nudged to face front again (the authors say this is not physically accurate, on purpose). Glossy clearcoat and iridescent material. Built with React Three Fiber, Drei, react-three-rapier and MeshLine in about 80 lines. The stated aim was "a tangible experience" and a shareable reward. The write-up does not cover accessibility, keyboard, reduced motion or a non-WebGL fallback. The live [Ship 2024 page](https://vercel.com/ship/2024) now shows only the event title; the badge was not visible when visited.

[React Bits Lanyard](https://reactbits.dev/components/lanyard) is a ready-made version: "Swinging 3D badge on a stretchy woven band that you can drag, throw or click to flip", with props for front and back images, card colour, strap colour or a repeating strap image, finish (glossy, matte, holographic, metallic), clamp metal, size, anchor, gravity, damping and elasticity. The demo shows a white card hanging from a dark band with a silver clamp, and a "Try dragging" hint.

No engineer portfolio found uses a lanyard for employment; searches turned up only the Vercel badge, React Bits, and generic 3D portfolio templates. The metaphor is unclaimed.

## What design writing says about confidential work

- Liz Hamburger, [Presenting Confidential Design Work Under NDA](https://gooddesigner.substack.com/p/presenting-confidential-design-work) (Good Designer, Feb 2024): anonymise or redact, focus on method, and highlight your contribution and growth; prefer public work.
- Summaries of NDA advice from [UX Collective](https://uxdesign.cc/is-nda-in-the-way-of-your-design-career-5-ways-to-navigate-around-it-215176bea567) and others: show process rather than finals, use relative numbers rather than raw ones, recreate visuals in a neutral style so the client cannot be identified, and lean on side projects. (Read via search summaries, not in full.)
- Josh Comeau, [Building an Effective Dev Portfolio](https://www.joshwcomeau.com/effective-portfolio/): a portfolio is a highlight reel that guides the reader to what matters; templates are not tuned for employers.

The common thread: when the work can't be shown, show **the role, the numbers and the life around it**, never a disguised screenshot.

## Fit with staff passes

| Pattern | Fit | Why |
| --- | --- | --- |
| Lanyard badge (Vercel, React Bits) | Fits: it *is* the direction | Proves the object reads instantly and invites play. Its gaps (no a11y, no fallback, WebGL weight) are what the prototype must solve. |
| Hero/oversized card naming the employer (Rauno) | Fits | Same move as BNP's big pass: the employer is the headline on an object. |
| Hard numbers and artefacts (leerob /vercel) | Fits | Pass fields can carry one true number or award; photos-as-artefacts echo the tactile layer without showing work. |
| Structured metadata log (chanhdai) | Fits as content | Dates, duration, "present", role under employer map naturally to pass fields (issued, valid until, grade). Its visual style (dense dark log) fights. |
| Logo avatars (dillion) | Fights | Logos are banned for Role stories in GLOSSARY.md, and the logo would replace the Employer colour as the carrier. |
| Tech-chip lists (Brittany Chiang) | Fights as the main layer | It is the text CV the redesign is leaving; chips on a pass would clutter it. A stack line belongs in the Role story. |
| Prose-only employer line (Emil, Paco, Brian, Lee) | Neutral; a fallback | Proves "information first": one sentence carries the facts. Keep it as the accessible text the passes sit on. |
| Disguised or blurred screenshots (NDA advice) | Fights, and is ruled out | BNP work is never screenshotted. |

## Confidence

High for what each visited site does (seen directly on 16 October 2026). Medium for "no portfolio uses a lanyard for employment": a few searches, not exhaustive. NDA guidance is practitioner writing, not primary research.
