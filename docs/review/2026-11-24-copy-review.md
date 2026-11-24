# Full-site copy review (#528)

Date: 24 November 2026  
Reviewed against: `main` at `8afb065` (live local render and source side by side), Elias’s `voice-profile.md` and `writing-preferences.md`, `docs/design/DESIGN.md`, `docs/specs/PASSES-AND-PANELS-REFINEMENT-SPEC.md` (R-41 to R-55), and `docs/content/redesign-copy.md`.

## Overall judgement

Most of the site already sounds like one person talking: plain, direct, British English, concrete over general, with real numbers and zero corporate filler. The strongest writing on the site — the opening headline, the Work subheading, BNP Paribas’s flag decision, Optegra’s closing paragraph, the 404 copy, and the header greetings — should stay untouched.

The real problems are almost all **drift left behind by the refinement**, **local repetition between adjacent surfaces**, and **unfriendly machine/screen-reader strings**:

### Highest-impact fixes (factual and structural drift)

1. **Homepage meta description (`M2`):** still says `"in C# and Java"` at BNP Paribas — a holdover from the October hero. The BNP Paribas Role story states you work in **C#** there (porting legacy Java loaders to C#; your Java API work was at Joveen).
2. **Markdown mirror `/index.md` (`L5`–`L9`):** says Off the clock `"opens with my GitHub year, then my training week"` (the opposite of the shipped page), lists `Where I’m headed` in the retired quiet-index position inside `Work`, repeats the opening headline twice in consecutive lines, repeats `"cut page load by 40%"` twice in Joveen’s first bullet, and omits BNP Paribas’s Work-panel metrics.
3. **Threshold working figure caption (`C11`):** still only mentions copying the link (`"Copy it to open Threshold as you left it."`) and ignores the `Open this scenario ↗` button added beside it in `#520`.
4. **Header navigation landmark (`H6`):** labelled `"On this page"` on every route, including Role stories, Case studies, the archive, Résumé and 404, where those links leave the page for `/#...` on the homepage (and collide conceptually with the actual on-page chapter rail).
5. **External-link screen-reader announcements (`A1`):** `host-label.ts` only humanises `github.com` → `GitHub`, so screen readers hear `"opens linkedin.com in a new tab"`, `"opens threshold-beta.vercel.app in a new tab"`, and `"opens flowtime-focus-timer.vercel.app in a new tab"`.

### Key editorial improvements (repetition, clarity, voice)

6. **BNP Paribas simulation caption (`R7`):** repeats the exact 11-word opening sentence of the paragraph directly above it (`"The engines run large simulation-based calculations across several asset classes."`).
7. **Flowtime `Where it stands` (`C27`):** heading `"Used for my own focus."` followed immediately by `"I use it for my own focused work."` — the same six words twice.
8. **Where I’m headed + How I work band (`WH2`, `HW2`, `HW6`):**
   - `Where I’m headed` lead has an awkward parallel clause (`"trusted with what to build, building it well and getting it used"`).
   - `How I work` subheading says `"Four habits, and where I picked them up."`, though only Card 4 names where you picked it up; `"Four habits, and the proof for each."` (already on the 404) matches all four cards and trays.
   - `How I work` Card 4 echoes the Optegra clause `"guided what the engineers built next"` from `Where I’m headed` directly above it on the same band.
9. **Share-card `og:image:alt` (`S2`, `S3`):** Role story and Case study share cards use internal design jargon (`"in the employer’s colour"`, `"in the project’s colour"`).
10. **R-55 strings:** all five approved strings (`10th–90th spread`, `Open this scenario ↗`, `Threshold’s PRD, 16 Apr 2026 →`, `Today’s path` / `New cached path`, and the 7-day workout cues) read cleanly in context — **keep all five**.

### Strengths to preserve

- First-person candour without pitchiness (`"I’d have called that a nice-to-have before; now it’s how I start."`, `"The click came in early 2024…"`).
- Plain, concrete labels (`Integrating a pricer`, `Me, new to it`, `Everything I’ve built that I’d happily talk through.`).
- Understated British tone in the greeting (`Kettle’s on.`, `Nearly five?`, `Nowhere to be?`, `Home yet?`, `Still up?`) and 404 (`It’s moved, or it never did. Everything else is where you left it.`).

---

## Surface 1 · Header & greeting

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| H1 | Skip link (`site-header.tsx:18`) | `Skip to content` | Keep | — | Standard, concise. |
| H2 | Brand link (`site-header.tsx:21`) | `Elias Bennett` | Keep | — | Matches `profile.name`. |
| H3 | Header greetings (`site-copy.ts:45–49`) | `Hello` · `Kettle’s on.` · `Nearly five?` · `Nowhere to be?` · `Home yet?` · `Still up?` | Keep | — | Dry, British, matches Elias’s casual warmth; edges verified in `greeting.ts`. |
| H4 | London time reveal (`site-copy.ts:37`) | `it’s {HH:MM} here in London` | `It’s {HH:MM} here in London` | Voice / clarity | Every greeting now ends with `.` or `?` (`Kettle’s on.`, `Nearly five?`), and on mobile this starts its own line underneath. Lowercase `it’s` is a leftover from the old punctuation-free `Good morning`. |
| H5 | Nav links (`site-copy.ts:26–32`) | `Work` · `Things I make` · `How I work` · `Off the clock` · `Say hello` | Keep | — | Matches the five homepage `h2` headings in order. |
| H6 | Header nav `aria-label` (`site-copy.ts:39`, `site-header.tsx:24`) | `On this page` (used on all routes) | `On this page` on homepage (`home={true}`); `Site` on inner routes | Accessibility wording / accuracy | On Role stories, Case studies, `/things-i-make`, `/resume` and `/404`, these links go to `/#...` on the homepage, not sections on the current page. Calling them `On this page` beside an actual chapter rail (`Story sections` / `Case study sections`) misleads screen-reader users. |
| H7 | Mobile menu button (`site-copy.ts:41`) | `Menu` | Keep | — | Plain, standard. |
| H8 | Theme toggle `aria-label` (`site-copy.ts:34`, `eclipse-toggle.tsx:44`) | `Dark theme` (with `aria-pressed`) | Keep | — | Clear toggle-button naming pattern. |

---

## Surface 2 · Homepage: Opening & Staff pass

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| O1 | Headline `h1` (`opening.ts:28`) | `I build pricing and risk engines at BNP Paribas, and products of my own.` | Keep | — | Plain, direct, anchors the whole site; verified against `role-stories.ts:21` and `projects.ts`. |
| O2 | Supporting line (`opening.ts:29`) | `I’m the team’s only C# engineer, and the engines run on CPU and GPU. I’ve won the bank’s digitisation competition and a Take Ownership award.` | Keep | — | Concrete, British spelling (`digitisation`), names BNP once across the opening; verified against `role-stories.ts:21, 26, 66, 71`. |
| O3 | Primary action pills (`opening.tsx:35–40`) | `Work` · `Say hello` | Keep | — | Concise, matches section headings. |
| O4 | Opening Staff pass (`staff-pass.tsx`, `staff-pass.ts:36, 77`, `role-stories.ts:14, 16`) | `BNP Paribas` · `Elias Bennett` · `Software engineer` · `Jul 2025 – now` · `Valid · present` | Keep | — | Prints who and when only (`#493`); matches Role story metadata. |
| O5 | Opening Staff pass `aria-label` (`pass-name.ts:14`) | `BNP Paribas. Elias Bennett, Software engineer, Jul 2025 – now. Valid · present.` | Keep | — | Follows `DESIGN.md` R-12 ("its accessible name is its print"). |

---

## Surface 3 · Homepage: Work panels & trays

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| WK1 | Section heading (`work-panels.ts:45`) | `Work` | Keep | — | Plain, matches nav. |
| WK2 | Section subheading (`work-panels.ts:46`) | `History, then marketing, then code. Each move was towards the work I liked most.` | Keep | — | Plain, candid, sounds distinctly like Elias; verified against `role-stories.ts` and `resume.ts:33`. |
| WK3 | BNP panel header (`work.tsx:12–26`) | `BNP Paribas` · `Software engineer` · `Jul 2025 – now` | Keep | — | Matches Role story. |
| WK4 | BNP stat well (`work-panels.ts:49`) | `Six months` / `from zero C# to production code` | Keep (or `6 months` if you also change `R2` below) | — | Verified against `role-stories.ts:122`. Spelled-out `Six months` reads warmly here; align only if you prefer `6 months` across both surfaces. |
| WK5 | BNP comparison 1 (`work-panels.ts:51`, `role-stories.ts:90`) | `Integrating a pricer` · `An experienced engineer` `about two weeks` · `Me, new to it` `a couple of days` | Keep | — | Natural, concrete, verified against `role-stories.ts:65`. |
| WK6 | BNP comparison 2 (`work-panels.ts:52`, `role-stories.ts:96`) | `The competition dashboard’s data load` · `Before` `30–40 min` · `After` `under 5 min` | Keep | — | Connects cleanly to `"the bank’s digitisation competition"` in the opening; verified against `role-stories.ts:66`. |
| WK7 | BNP story pill (`work.tsx:32`) | `The BNP Paribas story →` | Keep | — | Clear next action. |
| WK8 | Joveen panel header & figure (`work.tsx:82–92`, `role-stories.ts:226`) | `Joveen` · `Full stack software engineer` · `Aug 2024 – Jun 2025` · `−40%` `page load` | Keep | — | Verified against `role-stories.ts:135–138, 177`. |
| WK9 | Joveen 3-metric tray (`work-panels.ts:61–63`) | `520 ms → 230 ms` `Key API p95` · `10 min → under 2` `Time to deploy` · `+30%` `Mobile retention` | Keep | — | All three distinct from `−40% page load`; verified against `role-stories.ts:177`. |
| WK10 | Joveen story pill (`work.tsx:32`) | `The Joveen story →` | Keep | — | Clear next action. |
| WK11 | Optegra panel header & figure (`work.tsx:82–92`, `role-stories.ts:338`) | `Optegra` · `Marketing executive` · `Sep 2021 – Aug 2024` · `88%` `Core Web Vitals pass rate, up from 62%` | Keep (see `WK12` note) | Repetition across surfaces | Verified against `role-stories.ts:243–245, 280`. Note: `62% → 88%` is immediately repeated in tray cell 1 below because Optegra has three total metrics and R-45 keeps a 3-cell tray matching Joveen. Removing cell 1 would be a layout change (out of scope here; noted under Follow-ups). |
| WK12 | Optegra tray cell 1 (`work-panels.ts:70`) | `62% → 88%` · `Pass rate` | `62% → 88%` · `Core Web Vitals` | Clarity | Bare `Pass rate` does not name what passed; `Core Web Vitals` (15 chars, shorter than `Consultation conversion` at 23 chars) makes the cell self-explanatory. Source: `role-stories.ts:280`. |
| WK13 | Optegra tray cells 2–3 (`work-panels.ts:71–72`) | `−30%` `p95 page load` · `+15%` `Consultation conversion` | Keep | — | Verified against `role-stories.ts:280`. |
| WK14 | Optegra story pill (`work.tsx:32`) | `The Optegra story →` | Keep | — | Clear next action. |

---

## Surface 4 · Homepage: Things I make

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| T1 | Section heading (`site-copy.ts:74`) | `Things I make` | Keep | — | Plain, matches nav. |
| T2 | Section subheading (`site-copy.ts:75`) | `Products of my own, from a rental calculator to a risk simulator.` | Keep | — | Deliberately echoes the opening’s cobalt `"products of my own."` and names the range concretely. |
| T3 | Threshold panel (`projects.ts:62–63`, `project-panel.tsx:87`) | `Threshold` · `A clearer view of what moving could cost.` · `The Threshold case study →` | Keep | — | Plain, specific, clear next action. |
| T4 | Threshold city switcher (`threshold-city-switcher.tsx:31`, `threshold-link.ts:11, 86–90`) | Group `aria-label`: `City` · Buttons: `London`, `Basel`, `Zurich` · Live URL: `threshold-beta.vercel.app/{city}?district={id}&type=room` | Keep (or group `aria-label`: `Threshold city`) | Accessibility wording | Matches the case study’s `City` select; `Threshold city` is slightly clearer if encountered out of context. |
| T5 | Argus Risk panel (`projects.ts:84`, `site-copy.ts:78`) | `Argus Risk` · `A risk simulator where every number shows its source and age.` | Keep on homepage (see `AR2` / `RS7` on unifying with `projects.ts:85`) | — | Says what Argus is up front (`#283`), stronger than `projects.ts:85`. |
| T6 | Flowtime panel (`projects.ts:105–106`) | `Flowtime` · `Breaks that match how long you actually focused.` | Keep | — | Concrete, crisp. |
| T7 | Secondary row · Home Secretary (`projects.ts:127`, `site-copy.ts:79`) | `Home Secretary` · `A household coordination prototype, built for coursework.` · `2026` | Keep | — | Intentional tighter line for the narrow homepage row (`redesign-copy.md:207`). |
| T8 | Secondary row · Risk Event Tracker (`projects.ts:143–144`) | `Risk Event Tracker` · `A tested C# Web API for managing risk events.` · `2025` | Keep | — | Direct, concrete. |
| T9 | Secondary row · Ask Professor Past (`projects.ts:161–162`) | `Ask Professor Past` · `History you can talk to. Version 1; I’m rebuilding it.` · `2025` | Keep | — | States what exists and what’s next cleanly; fits the settled rule. |
| T10 | Archive link (`site-copy.ts:82`) | `Everything I’ve built (06) →` | `Everything I’ve built (6) →` | Voice / consistency | Leading-zero numbering (`01`–`06`) was retired across the site in R-52/R-54, and everywhere else uses plain numerals (`3 cities`, `6 timer states`, `1 of 3`). Plain `(6)` reads like ordinary prose rather than index code. |

---

## Surface 5 · Homepage: Where I’m headed

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| WH1 | Heading (`work.ts:196`) | `Where I’m headed` | Keep | — | Plain, direct. |
| WH2 | Lead (`work.ts:198`) | `I’m working towards the judgement, depth and range to be trusted with what to build, building it well and getting it used. Here’s how far I’ve got on each.` | `I’m working towards the judgement, depth and range to be trusted to decide what to build, build it well and get it used. Here’s how far I’ve got on each.` | Clarity / voice | `"trusted with what to build, building it well and getting it used"` breaks parallel grammar (`"trusted with getting it used"` is awkward). Parallel verbs (`decide … build … get it used`) read cleanly on one pass and avoid repeating `"worth building"` from `WH3` right beside it. |
| WH3 | Part 1 · Optegra (`work.ts:203, 205`) | Chip `Optegra` · `Close enough to users to know what’s worth building.` · `At Optegra, split tests and dashboards guided what the engineers built next.` | Keep (and trim the duplicate clause in `HW6` below) | Repetition across surfaces | Verified against `role-stories.ts:274`. Currently shares the verbatim clause `"guided what the engineers built next"` with How I work Card 4 just below on the same band; trimming Card 4 (`HW6`) removes the echo while keeping `headedProblems` green. |
| WH4 | Part 2 · BNP Paribas (`work.ts:213, 215`) | Chip `BNP Paribas` · `Knowing it well enough that people can rely on it.` · `Six months from zero C# to production code, in a pricing engine of around 70 projects.` | Keep | — | Verified against `role-stories.ts:26, 122`. Echoes the BNP Work panel’s `"Six months from zero C# to production code"`, but earns its place by adding `"in a pricing engine of around 70 projects"`. |
| WH5 | Part 3 · Threshold (`work.ts:223–224`) | Chip `Threshold` · `All the way, from first idea to how it gets used.` · `Threshold, from 57 user stories to a live site.` | Keep | — | Verified against `case-studies.ts:87`. Shares `57 user stories` with How I work Card 2 below, though both drawn proofs key to `57` (changing the proof is a design change). |

---

## Surface 6 · Homepage: How I work

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| HW1 | Heading (`how-i-work.ts:42`) | `How I work` | Keep | — | Matches nav. |
| HW2 | Subheading (`how-i-work.ts:43`) | `Four habits, and where I picked them up.` | `Four habits, and the proof for each.` | Accuracy | Only Card 4 actually says where you picked the habit up (`"I learned this in marketing."`). Cards 1–3 give proof of using the habit, and every card has a proof tray. `Four habits, and the proof for each.` is already approved copy on the 404 (`site-copy.ts:66`). |
| HW3 | Card 1 (`how-i-work.ts:46–50`) | `Start from a real problem.` · `Threshold started because my friends had no clear idea what renting would cost by area. Flowtime started because Pomodoro kept cutting me off mid-flow.` · Tray pills: `Threshold` · `Flowtime` | Keep | — | Plain, concrete, matches `case-studies.ts:18, 180`. |
| HW4 | Card 2 (`how-i-work.ts:53–57, 74`, `how-i-work.tsx:80`) | `Write it down first.` · `Before I build, I write down the problem, who it’s for, and what’s out of scope. Threshold had 57 user stories before any code.` · Tray: `57`, 13 bars, `Threshold’s PRD, 16 Apr 2026 →` *(R-55)* | Keep | — | Verified against `case-studies.ts:84, 87–88`. R-55 link copy is compact and clear. |
| HW5 | Card 3 (`how-i-work.ts:60–64`) | `Ship it so it’s safe to undo.` · `At BNP Paribas, taking a stale data dependency out of live pricing, I put the new path behind a feature flag that defaults to off, with caching and an end-to-end test nobody had asked for.` · Tray: `Off` / `On`, `Today’s path`, `New cached path` *(R-55)* | Keep | — | Concrete, verified against `role-stories.ts:51`. Switch `aria-labelledby` (`New cached path`) + `aria-describedby` (`defaults to off`) reads clearly. R-55 chips hold up well. |
| HW6 | Card 4 (`how-i-work.ts:67–71`) | `Measure whether it works.` · `I learned this in marketing. At Optegra, split tests and analytics dashboards showed which changes brought in consultations and guided what the engineers built next; consultation conversion rose by 15%.` · Tray: `+15%`, `Before`, `After` | `I learned this in marketing. At Optegra, split tests and analytics dashboards showed which changes brought in consultations, and conversion rose by 15%.` | Repetition across surfaces / length | Drops `"and guided what the engineers built next"`, which repeats `Where I’m headed` (`WH3`) almost word for word directly above it on the same band. Keeps the exact highlighted phrase `rose by 15%` and shortens the longest card by 47 characters. Source: `role-stories.ts:274, 280`. |

---

## Surface 7 · Homepage: Off the clock

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| OC1 | Section heading & subheading (`off-the-clock.ts:10–11`) | `Off the clock` · `What my own time looks like this week.` | Keep | — | Plain, warm, matches nav. |
| OC2 | Row 1 · Today’s workout (`off-the-clock.ts:19–37`, `training-today.tsx`) | Heading: `Today’s workout` · 7-day cues *(R-55)*: `Mon · Upper`, `Tue · Lower`, `Wed · Zone 2`, `Thu · Upper`, `Fri · Lower`, `Sat · Rope`, `Sun · Bike` · Full sessions (`Upper body gym`, `Lower body gym`, `Zone 2, assault bike`, `Skipping rope intervals`, `Assault bike intervals`) · List `aria-label`: `My training week` · Caption: `Out on a run, central London.` · Alt: `Elias mid-run on a rainy street in central London` | Keep | — | Calm, scannable; R-55 cues all come from the authored plan (`off-the-clock.ts:29–37`). |
| OC3 | Row 2 · Shelf & screen (`off-the-clock.ts:40–52`, `film-line.ts`) | Heading: `On my shelf and screen` · Book: `Now reading · {author}` (fallback: `Between books.`), alt `Cover of {title} by {author}` · Film: `Last watched {9 Oct} · {★★★½}` (spoken: `Last watched {9 October}, rated {3.5} out of 5`; fallback: `Nothing logged yet.`), alt `Poster for {title} ({year})` · Stale: `From {source}, as of {date}` | Keep | — | Concise, thoughtful spoken rating format, clear fallbacks. |
| OC4 | Row 3 · This week in history (`off-the-clock.ts:55–64`, `history.ts:85–134`) | Heading: `Odd but true, from this week in history` · Credit: `Image: {creator} · {licenseName}` · Birth prefix: `Born {date}` · Fallback mark: `From the archive` · Three fallback facts (1783 Montgolfier balloon, 1933 CMLL, 2003 Galileo) | Keep | — | Lively, factual, well-paced. |
| OC5 | Row 3 · History stepper button (`history-band.tsx:71–76`) | Visible: `{1} of {3} →` · Accessible name: `{1} of {3}` (`→` is `aria-hidden`) | Keep visible `{1} of {3} →`; add `<span className="sr-only">, next fact</span>` | Accessibility wording / clarity of next action | A screen-reader user currently hears a button named only `"1 of 3"`, with no cue that pressing it advances to the next history fact. Adding hidden `, next fact` keeps WCAG 2.5.3 label-in-name intact without adding visible text. |
| OC6 | Row 4 · GitHub & Now making (`off-the-clock.ts:15, 68–79`) | Margin heading: `GitHub, the past year` · Subheading: `What I’m building now` · Badge: `Live from GitHub` · Total: `{1,221} contributions in the past year` · Grid `aria-label`: `GitHub contributions over the past year: {1,221}.` · Hint: `Use the arrow keys to move between days.` · Legend: `Less` · `More` · `today` | Keep | — | Clear, matches GitHub’s own legend. |
| OC7 | Row 4 · GitHub day labels (`contribution-calendar-model.ts:7, 108–113`) | `{n} contributions on Thu 15 Jan` (uses `June`, `July`, `Sept` in `SHORT_MONTH_NAMES`) | Use 3-letter `Jun`, `Jul`, `Sep` to match the rest of the site (and optionally full weekday/month in `aria-label`) | Voice / accessibility wording | Everywhere else (`role-stories.ts`, `how-i-work.ts`) uses 3-letter `Jun`, `Jul`, `Sep`; `contribution-calendar-model.ts` and `pin-rules.ts:63` mix in `June`, `July`, `Sept`. Also, `Thu 15 Jan` is slightly clipped when read aloud by screen readers compared to `Thursday 15 January`. |

---

## Surface 8 · Homepage & site-wide: Say hello

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| SH1 | Heading & email (`say-hello.tsx:24–30`) | `Say hello` · `eliasthebennett@gmail.com` | Keep | — | Direct, no filler prompt line. |
| SH2 | Copy button (`say-hello.tsx:31`, `site-copy.ts:87–88`, `copy-button.tsx`) | Visible: `Copy` → `✓ Copied` · Accessible name: `Copy` · Live status: `Copied` | Keep visible `Copy` → `✓ Copied`; add `<span className="sr-only"> email address</span>` to Say hello’s button | Accessibility wording / clarity of next action | Out of context (e.g. in a screen reader’s buttons list), bare `Copy` doesn’t say what gets copied, unlike Threshold’s `Copy link`. Hidden ` email address` preserves visible brevity and WCAG 2.5.3 label-in-name. |
| SH3 | Footer links (`site-copy.ts:90–94`) | `Résumé →` · `GitHub ↗` · `LinkedIn ↗` | Keep | — | Clean, matches `profile.links`. (External link `sr-only` hostname wording is covered in `A1`.) |

---

## Surface 9 · Role stories (`/work/bnp-paribas`, `/work/joveen`, `/work/optegra`)

### Shared Role story chrome

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| RS-C1 | Back link (`role-story.ts:51`) | `← Work` | Keep | — | Clear. |
| RS-C2 | Chapter rail (`role-story.tsx:49`, `role-story.ts:38–45`) | Landmark: `Story sections` · Chapters: `The role`, `The problems`, `Decisions`, `What changed`, `What I took with me` | Keep | — | Plain, unique landmark, clear narrative order. |
| RS-C3 | Evidence list, Scale labels & Next panel (`story-parts.tsx:84`, `role-story-figures.tsx:62, 68`, `role-story.ts:48`, `role-story.tsx:61`) | `Evidence` · `Before` / `After` · `Next role` · `Back to Work` | Keep | — | Clear and consistent. |

### BNP Paribas (`/work/bnp-paribas`)

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| R1 | Header & lede (`role-stories.ts:13–21`) | `BNP Paribas` · `Software engineer` · `Jul 2025 – now` · `Risk division · London` · `I’m a software engineer in BNP Paribas’s risk division in London. I work in C# on the engines that price and risk-manage trades on CPU and GPU, and I’m the team’s only C# engineer.` | Keep | — | First sentence slightly echoes the header meta line, but this paragraph is also the page’s `<meta name="description">`, where being self-contained earns its words. |
| R2 | Evidence strip (`role-stories.ts:120–123`) | `Nov 2025` `won the bank’s digitisation competition` · `Six` `months from zero C# to production code` | `Nov 2025` `won the bank’s digitisation competition` · `6 months` `from zero C# to production code` | Clarity / consistency | Splitting `Six` from `months` leaves the big figure unitless (`Six`), unlike `230 ms`, `88%` and `−40%` on the other Role stories. `6 months` is 8 chars (within `TEXT_LIMITS.figure`), keeps the unit with the number, and aligns with the homepage stat well (`Six months` / `from zero C# to production code`). Source: `role-stories.ts:122`. |
| R3 | Embedded pass (`embedded-pass.tsx`) | `BNP Paribas` · `Elias Bennett` · `Software engineer` · `Jul 2025 – now` · `Valid · present` | Keep | — | Matches opening pass. |
| R4 | The role (`role-stories.ts:25–28`) | `The engines run large simulation-based calculations across several asset classes. It’s a big codebase, around 70 projects, and some of the C# is translated to run on the GPU.` / `I joined in July 2025 having never written C#. Today I own implementation and delivery on the C# side, from planning through review.` | Keep | — | Concrete, plain, zero jargon. |
| R5 | Simulation heading & controls (`simulation-copy.ts:9–19`) | `How the pricing engines work` · `Today` · `Horizon` · `One price` · `Run again` · `Paths` (`10`, `100`, `1,000`) · `10th–90th spread` *(R-55)* | Keep | — | Clear, exact; R-55 `10th–90th spread` earns its place. |
| R6 | Simulation accessible description & live announcement (`simulation-copy.ts:16, 21–25`) | `Illustrative simulated paths from today to the horizon, a histogram of where they end on the right edge, and a dashed line at their average, labelled one price.` / `{1,000} paths: one price, {1.2}% {above/below} today; 10th–90th spread {87.1}%.` | Keep | — | Accurate, honest that the paths are illustrative, matches R-53/R-55. |
| R7 | Simulation caption (`simulation-copy.ts:14`) | `The engines run large simulation-based calculations across several asset classes. Thousands of possible market paths go in; a price and its risk come out.` | `Thousands of possible market paths go in; a price and its risk come out.` | Repetition across surfaces | Its first sentence repeats `role-stories.ts:26` word for word right underneath it (leftover from when the simulation lived on the homepage before `#457`). Dropping the duplicate sentence leaves the exact explanation of what the plot shows. |
| R8 | The problems (`role-stories.ts:31–45`) | 4 cards: `Market data.`, `A stale dependency.`, `Quant code.`, `Two execution paths.` | Keep | — | Tight, concrete, scannable. |
| R9 | Decisions (`role-stories.ts:48–61`) | 3 cards: `Ship the risky change behind a flag, switched off.`, `Validate the data before trusting it.`, `Give AI work phases.` | Keep | — | Strongest engineering prose on the site; specific, candid, first-person. |
| R10 | Flag figure (`role-stories.ts:78–84`) | `Live pricing · today’s path` · `New path · no stale file · cached` · `off by default` · Caption: `Protect the blast radius` | Keep (or add trailing full stop `Protect the blast radius.` for caption consistency) | Voice / consistency | Clear and concise; every other sentence caption on Role/Case studies ends with a full stop. |
| R11 | What changed & Scale figure (`role-stories.ts:64–67, 87–103`) | 2 paragraphs + scale bars (`Integrating a pricer`, `The competition dashboard’s data load`) + caption `Bars to scale. Two weeks is taken as ten working days.` | Keep | — | Concrete, transparent about the 10-working-day assumption. |
| R12 | What I took with me & Certificate (`role-stories.ts:70–73, 105–112`) | 2 paragraphs + certificate caption `Take Ownership · _nology · Q1 2026 · awarded May 2026` + alt | Keep | — | Plain, restrained, accurate. |

### Joveen (`/work/joveen`)

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| R13 | Header, lede & embedded pass (`role-stories.ts:135–143`) | `Joveen` · `Full stack software engineer` · `Aug 2024 – Jun 2025` · `I was a full stack software engineer at Joveen, working on its e-commerce site in React, Java with Spring Boot and MySQL.` · Pass status: `Returned` | Keep | — | Plain, accurate. |
| R14 | Evidence strip (`role-stories.ts:226–229`) | `−40%` `page load` · `Under 2` `minutes to deploy, down from 10` · `+30%` `mobile retention` · `230 ms` `key API p95, down from 520 ms` | Keep (or `<2 min` `to deploy, down from 10` if you prefer unit-with-number like `R2`) | — | Verified against `role-stories.ts:177`. `Under 2` matches the plain prose style; `<2 min` is slightly more compact. |
| R15 | The role & Screens figure (`role-stories.ts:147, 187–206`) | `I worked across the React front end, the Java API behind it and the MySQL database underneath. I was also on a coding bootcamp alongside the job.` · Link: `joveen.com ↗` · Desktop & phone alts | Keep | — | Clear, honest; detailed, accurate alts. |
| R16 | The problems (`role-stories.ts:152`) | `Pages took too long to load. Some modules were still in PHP and had to move to Spring Boot. Layouts and features broke on some phones and browsers, and a key API was slower than it needed to be.` | Keep | — | Plain and direct. *(Note: BNP Paribas and Optegra render Problems as structured cards whereas Joveen is a single paragraph — structural choice, left alone here.)* |
| R17 | Decisions (`role-stories.ts:156–173`) | 4 cards: `Make the front end do less up front.`, `Move PHP to Spring Boot in pieces.`, `Test across browsers, then fix.`, `Measure the database.` | Keep | — | Concrete action + reasoning on each card. |
| R18 | What changed & Scale figure (`role-stories.ts:177, 209–217`) | Paragraph + 4 scale bars + caption `Bars to scale. A change in per cent is drawn from 100.` | Keep | — | Concrete numbers, British `per cent`. |
| R19 | What I took with me (`role-stories.ts:182`) | `Alongside the job I did freelance AI training, reviewing 1,000 code items across TypeScript, Python, Java, C# and SQL at 97% QA precision. It was my first sustained work with AI on code, and the start of the thread that leads to the workflow I built at BNP Paribas.` | Keep | — | Concrete and connects cleanly to BNP Paribas. |

### Optegra Eye Healthcare & Kensington Medical (`/work/optegra`)

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| R20 | Header, lede, evidence & pass (`role-stories.ts:242–250, 338–340`) | `Optegra Eye Healthcare & Kensington Medical` · `Marketing executive` · `Sep 2021 – Aug 2024` · Lede · `88%` `Core Web Vitals pass rate, up from 62%`, `−30%` `p95 page load`, `+15%` `consultation conversion` · Pass: `Optegra`, `Returned` | Keep | — | Warm, clear throughline. |
| R21 | The role & Homepage screenshot (`role-stories.ts:254, 291–305`) | Paragraph · Link: `Optegra’s homepage in June 2024, on the Wayback Machine ↗` · Alt | Keep | — | Plain, grounded, accurate alt. |
| R22 | The problems (`role-stories.ts:258–264`) | 2 cards: `Slow, uneven pages.`, `No clear view of what worked.` | Keep | — | Concise, concrete. |
| R23 | Decisions & Dry AMD screenshot (`role-stories.ts:267–276, 307–322`) | 2 cards: `Scope the fix so it can be built.`, `Test, then build.` · Link: `Optegra’s dry AMD page in June 2024, on the Wayback Machine ↗` · Alt | Keep | — | Clear, grounded. |
| R24 | What changed & Scale figure (`role-stories.ts:280, 324–331`) | Paragraph + 3 scale bars + caption `Bars to scale. A change in per cent is drawn from 100.` | Keep | — | Crisp, plain. |
| R25 | What I took with me (`role-stories.ts:285`) | `The click came in early 2024. A friend loved his work so much that even a hectic week sounded exciting, and I wanted that from mine. I started coding in my spare time, just to see, and by August 2024 I was doing it for a living.` | Keep | — | Standout paragraph — human, specific, zero cliché. |

---

## Surface 10 · Case studies (`/things-i-make/threshold`, `/argus-risk`, `/flowtime`)

### Shared Case study chrome & header lede choice

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| C1 | Back link, actions, stack `aria-label`, PRD prefix, Next label (`case-study.ts:41–47`, `case-study.tsx:119`) | `← Things I make` · `Live site ↗` · `Code ↗` · `Stack` · `From the PRD` · `Next project` | Keep | — | Plain, consistent. |
| C2 | Chapter rail (`case-study.tsx:38`, `case-study.ts:31–38`) | Landmark: `Case study sections` · Chapters: `Where it started`, `On paper`, `Decisions`, `How it’s built`, `Where it stands`, `What’s next` | Keep | — | Clear, unique landmark. |
| C3 | Header lede source across all 3 case studies (`case-study.tsx:118`) | Currently renders `study.description` (full sentence explaining what the tool is), whereas `docs/content/redesign-copy.md` lists `project.outcome` (short punchline from the homepage panel) | **Keep `study.description` on the page**, and update `docs/content/redesign-copy.md` to match | Clarity / repetition across surfaces | Visitors arriving from the homepage or archive just read `project.outcome`. On the case study itself, `study.description` tells them concretely what the product is (e.g. `"A rental calculator for London, Basel and Zurich…"`). Recommend keeping `study.description` rather than reverting to `project.outcome`. |

### Threshold (`/things-i-make/threshold`)

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| C4 | Header, stack & evidence (`case-studies.ts:13, 86–94`) | `Threshold` · lede · `React 19`, `TypeScript`, `MapLibre` · `57 user stories`, `13 slices, built in a day`, `182 tests`, `3 cities` | Keep | — | Concrete, verified against Threshold repo (`CASE-STUDY-SOURCES.md`). |
| C5 | Exhibition stage alt (`projects.ts:74`) | `Threshold's answer for a room in Hackney: on £2,400 a month with £2,500 saved, three months until you can move in, £2,992 still needed upfront and a £1,496 monthly surplus` | Keep (curly apostrophe `Threshold’s` for consistency) | Voice / typography | Specific, reads real numbers off the screenshot. |
| C6 | 01 Where it started (`case-studies.ts:16–19`) | `The rent is the easy part.` + paragraph | Keep | — | Concrete, relatable, strong question at the end. |
| C7 | 02 On paper (`case-studies.ts:21, 81–85`) | `The problem, on paper.` + PRD quote + `From the PRD · 16 April 2026` | Keep | — | Verbatim quote from PRD. |
| C8 | 03 Decisions & static figure (`case-studies.ts:23–48`) | `Two totals and a straight answer.` + 4 cards + caption `Upfront and monthly totals, kept apart.` + alt | Keep | — | Clear, concrete. |
| C9 | 04 How it’s built prose (`case-studies.ts:51–54`) | `The link is the save file.` + paragraph (`33 London boroughs, Zurich’s 12 Kreise and Basel in seven areas`) | Keep | — | Memorable heading, clear technical detail. |
| C10 | 04 Working figure controls (`threshold-link.ts:11–16`) | `City` · `District` · `Place` · `Copy link` (→ `Copied`) · `Open this scenario ↗` *(R-55)* | Keep | — | Clear; R-55 `Open this scenario ↗` names the action cleanly. |
| C11 | 04 Working figure caption (`threshold-link.ts:17`) | `Change a choice and the link changes with it. Copy it to open Threshold as you left it.` | `Change a choice and the link changes with it. Copy it, or open the scenario straight in Threshold.` | Accuracy / clarity of next action | `#520` added the `Open this scenario ↗` button right beside `Copy link`, but the caption still only describes copying. |
| C12 | 04 No-JS fallback figure (`case-studies.ts:56–60`) | Caption: `The district map and the choices that drive the estimate.` · Alt: `Threshold calculator with a district map and scenario controls` | Keep | — | Clear. |
| C13 | 05 Where it stands (`case-studies.ts:65–68`) | `Used for real.` · `I used it during my own flat hunt, and friends have used it too.` | Keep | — | Honest, restrained. |
| C14 | 06 What’s next (`case-studies.ts:70–79`) | 3 cards: `Keep the data fresh.`, `Show the sources in the app.`, `Finer areas in Basel.` | Keep | — | Specific, says what’s next without apologising. |

### Argus Risk (`/things-i-make/argus-risk`)

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| C15 | Header, stack, evidence & stage alt (`case-studies.ts:98, 163–171`, `projects.ts:95`) | `Argus Risk` · lede · `.NET 8`, `Kafka`, `PostgreSQL`, `SignalR` · `5 currencies`, `4 services`, `126 .NET tests`, `1 command to run it` · stage alt | Keep | — | Grounded in `CASE-STUDY-SOURCES.md`. |
| C16 | 01 Where it started (`case-studies.ts:101–104`) | `A total doesn’t say how old it is.` · `I built this one on purpose. I work on pricing and risk systems, and I wanted to build a small version of that world end to end, with a front end that makes it easy to see. Most risk dashboards show a portfolio’s value, but not how old it is, which feed it came from, or whether the system is keeping up. Argus is a simulator: its prices, FX rates and trades are generated, and it runs on your machine.` | Drop `"I built this one on purpose."` → start with `I work on pricing and risk systems, and I wanted to build a small version of that world end to end, with a front end that makes it easy to see. …` | Voice / clarity | `"I built this one on purpose."` only makes sense as an implicit contrast with Threshold/Flowtime; read standalone, it sounds odd (as if you might build a four-service Kafka system by accident). Starting on `"I work on pricing and risk systems…"` is sharper and more direct. |
| C17 | 02 On paper (`case-studies.ts:106, 159–162`) | `Two users, on paper.` + PRD lead/quote + `From the PRD` | Keep | — | Candid about simulated vs real audience. |
| C18 | 03 Decisions (`case-studies.ts:108–126`) | `Show the number with its history.` + 4 cards (`Every change is an event.`, `Freshness sits next to the value.`, `The maths is plain functions.`, `Check the answer.`) | Keep | — | Clear, British `maths`. |
| C19 | 03 Working figure & no-JS fallback (`argus-provenance.ts:10–21`, `case-studies.ts:128–133`) | `Unrealised P&L (USD)` · `From` / `A price tick on market-data.prices` / `Converted at {pair} {rate}` · `Age` / `Stale` · `New event` · Announcement: `{symbol}: a new price, {value}` · Description & caption · Fallback screenshot caption & alt | Keep | — | Every control and rule explained plainly; British `Unrealised`. |
| C20 | 04 How it’s built (`case-studies.ts:137–140`) | `Four services and a stream.` + paragraph (`Kafka (Redpanda locally)`, `SignalR`, `Marten`, `60 times speed`) | Keep | — | Concrete architecture summary (`CASE-STUDY-SOURCES.md`). |
| C21 | 05 Where it stands (`case-studies.ts:143–146`) | `Runs locally with one command.` · `One Docker command runs the whole stack on your machine. I designed it for under 500 ms from a price change to the dashboard.` | Keep | — | Honest about design target vs measured latency (`CASE-STUDY-SOURCES.md:16`). |
| C22 | 06 What’s next (`case-studies.ts:148–157`) | 3 cards: `Measure the latency.`, `Make it easier to see.`, `Stress testing.` | Keep | — | Clear, forward-looking. |

### Flowtime (`/things-i-make/flowtime`)

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| C23 | Header, stack, evidence & stage alt (`case-studies.ts:175, 227–235`, `projects.ts:117`) | `Flowtime` · lede · `Next.js`, `TypeScript`, `Service Worker` · `6 timer states`, `189 unit tests`, `⅕ default break`, `2-minute first cycle (the target)` · stage alt | Keep | — | Clear, grounded. |
| C24 | 01 Where it started & 02 On paper (`case-studies.ts:178–183, 222–226`) | `Pomodoro kept cutting me off.` + paragraph · `The problem, on paper.` + PRD quote + `The spec’s test: finish a first full cycle within two minutes of landing.` + `From the PRD · 3 January 2026` | Keep | — | Tight, concrete. |
| C25 | 03 Decisions & Working figure (`case-studies.ts:185–201`, `flowtime-break.ts:10–21`) | `Count from a fixed point, and ask instead of guessing.` + 4 cards · Slider `How long you focused`, `Flowtime` / `A Pomodoro`, `Focus` / `Break`, `aria-valuetext`, caption | Keep | — | Crisp, witty caption (`however the work is going`). |
| C26 | 04 How it’s built (`case-studies.ts:204–207`) | `Everything stays in your browser.` + paragraph | Keep | — | Concrete and clear. |
| C27 | 05 Where it stands (`case-studies.ts:210–213`) | Heading: `Used for my own focus.` · Body: `I use it for my own focused work.` | Heading: `Used for real.` (or `Live in the browser.`) · Body: `I use it for my own focused work.` | Repetition across surfaces / length | The heading and the one-sentence body repeat the exact same six words back to back. Changing the heading removes the tautology without inventing any new claim (`Used for real.` also mirrors Threshold). |
| C28 | 06 What’s next · card 1 (`case-studies.ts:217`) | `Move between devices.` `Keep local storage as the default.` | `Move between devices.` `Sync or transfer sessions between devices while keeping local storage as the default.` | Clarity | Current text jumps straight to the constraint (`Keep local storage as the default`) without stating what is being added. Clarifies the intention using existing concepts (`CASE-STUDY-SOURCES.md:22`). |
| C29 | 06 What’s next · card 2 (`case-studies.ts:218`) | `See when you focus best.` `Show the time of day you tend to focus longest.` | Keep | — | Clear. |

---

## Surface 11 · Work archive (`/things-i-make`)

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| AR1 | Heading & subheading (`site-copy.ts:99–100`) | `Things I make` · `Everything I’ve built that I’d happily talk through.` | Keep | — | Candid, sounds just like Elias. |
| AR2 | Project card lines (`projects.ts:63, 85, 106, 128, 144, 162`) | 6 projects using `project.outcome`. Note Argus Risk here is `Every number shows where it came from and how old it is.` (whereas homepage uses `A risk simulator where every number shows its source and age.`). | Keep other 5; consider unifying Argus Risk to `A risk simulator where every number shows its source and age.` *(see PDF note in `RS7`)* | Clarity / consistency | On `/things-i-make` (and `/resume`), `"Every number shows where it came from and how old it is."` does not say Argus is a risk simulator. **Caution:** changing `projects.ts:85` also changes `/resume`, which would disagree with the committed Résumé PDF unless `/resume` keeps its own line or the PDF is updated later. |
| AR3 | Filters & live status (`site-copy.ts:104–111`, `work-archive.tsx:21`, active after 10 projects) | `Filter projects` · `All`, `Products`, `Systems`, `Experiments` · `Showing {n} project(s)` | Keep | — | Clean and clear. |

---

## Surface 12 · Résumé page (`/resume`)

> **PDF boundary (`#528`):** `public/Elias-Bennett-Resume.pdf` is out of scope, and `pnpm verify:resume` requires `/resume` and the committed PDF to match verbatim. Any item below marked **PDF disagreement** is flagged for a follow-up PDF refresh rather than changed in `#528` unless you want the PDF regenerated too.

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| RS1 | Download button (`resume.ts:26`) | `Download PDF` | Keep | — | Clear; outside the PDF sheet. |
| RS2 | Sheet header (`resume.ts:64–74`) | `Elias Bennett` · `Software Engineer` · `London` · contacts · `I build pricing and risk engines at BNP Paribas, and products of my own.` | Keep | — | Note: `Software Engineer` is title-cased here (vs `Software engineer` elsewhere) — intentional for a formal CV header, and changing it would cause a **PDF disagreement**. |
| RS3 | Section headings (`resume.ts:27`) | `Experience` · `Selected projects` · `Awards` · `Skills` · `Education` | Keep | — | Standard, scannable. |
| RS4 | Experience · BNP Paribas (`role-stories.ts:115–118`) | 4 bullets (six months from no C# to production; ported Java loaders & feature flag; scoped-agent AI workflow; digitisation competition dashboard) | Keep | — | Strong, concrete, every number checked by `resumeLineProblems`. |
| RS5 | Experience · Joveen (`role-stories.ts:220–223`) | 4 bullets (`Cut page load by 40%…`; `Moved PHP modules to Spring Boot module by module…`; `Fixed mobile layout…`; `Added indexes…`) | Keep *(optional follow-up: `Moved PHP modules to Spring Boot module by module` → `Migrated PHP to Spring Boot module by module` — **PDF disagreement**)* | Voice / length | All four are accurate and concrete; minor `"modules … module by module"` echo noted for next PDF update. |
| RS6 | Experience · Optegra (`role-stories.ts:334–335`) | 2 bullets (Core Web Vitals 62%→88% & −30% p95; split tests & dashboards & +15% conversion) | Keep | — | Clear, concrete. |
| RS7 | Selected projects (`resume.ts:86–91`) | `Threshold`, `Argus Risk`, `Flowtime` (reads `project.outcome` from `projects.ts`) | Keep in `#528` *(see `AR2`: changing `projects.ts:85` would cause a **PDF disagreement**)* | Clarity | Flagged here because `resume.ts` pulls directly from `projects.ts`. |
| RS8 | Awards (`resume.ts:92`, `staff-pass.ts:39–43`) | `Winner` `Digitisation · 2025` · `Take Ownership` `Q1 2026` · `AI Champion` `2026` | Flag for follow-up PDF refresh (**PDF disagreement** if changed here): e.g. `BNP Paribas Digitisation Competition` `Winner · 2025` · `Take Ownership Award` `_nology · Q1 2026` · `AI Champion` `BNP Paribas Risk Division · 2026` | Clarity | These strings originally sat as pins on the BNP Paribas lanyard, where the pass already named the bank. On `/resume` (and `/index.md`), bare `"Winner  Digitisation · 2025"` and `"Take Ownership  Q1 2026"` don’t name the employer or issuer (`role-stories.ts:66, 71, 111`). Do not edit without updating the PDF. |
| RS9 | Skills (`resume.ts:38–41`) | `Languages`: `C#, Java, TypeScript, Python, SQL` · `Frameworks`: `.NET, Spring Boot, React, Next.js` · `Data and messaging`: `PostgreSQL, MySQL, Kafka` · `Practice`: `Docker, feature flags, CPU and GPU testing` | Keep | — | Every item traced to Role stories / Case studies. |
| RS10 | Education (`resume.ts:32–33`) | `University of Derby`, `Computing and Information Technologies BSc (Hons)`, `Expected Jun 2027` · `University of Essex`, `Diploma of Higher Education, History`, `Jul 2021` | Keep | — | Authoritative record. |

---

## Surface 13 · 404 page (`not-found.tsx`, `visitor-pass.tsx`)

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| NF1 | Heading & line (`site-copy.ts:55–56`) | `This page doesn’t exist.` · `It’s moved, or it never did. Everything else is where you left it.` | Keep | — | Warm, dry, unmistakable voice. |
| NF2 | Visitor pass (`site-copy.ts:58–59`, `visitor-pass.tsx:56`) | `Visitor` · struck-through path · `Not on file` · `404` · `aria-label`: `Visitor. {path}, struck through. Not on file.` | Keep | — | Clear, honest, accessible. |
| NF3 | Try section heading & note (`site-copy.ts:61–62`) | `Try one of these` · `The homepage, a section at a time.` | Keep | — | Concise, helpful. |
| NF4 | Section rows (`site-copy.ts:63–69`) | `Work` (`BNP Paribas, Joveen and Optegra`) · `Things I make` (`Threshold, Argus Risk, Flowtime and more`) · `How I work` (`Four habits, and the proof for each`) · `Off the clock` (`Training, a book, a film, this week in history`) · `Say hello` (`The email, the résumé, GitHub and LinkedIn`) | Keep (or update Off the clock row to `Training, a book, a film, history and GitHub`) | Accuracy | All five read cleanly; Off the clock omits the fourth row (GitHub / What I’m building now), though the current four-item rhythm is slightly smoother — your call. |

---

## Surface 14 · What visitors don’t see

### 14a · Page titles & meta descriptions

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| M1 | Home `<title>` (`site-copy.ts:15`) | `Elias Bennett, software engineer at BNP Paribas` | Keep | — | Plain, accurate. |
| M2 | Home `<meta name="description">` (`site-copy.ts:18–19`) | `I’m Elias, a software engineer in London. I build pricing and risk engines at BNP Paribas in C# and Java, and products of my own.` | `I’m Elias, a software engineer in London. I build pricing and risk engines in C# at BNP Paribas, and products of my own.` | Accuracy | Stale `"in C# and Java"` from the retired October hero. At BNP Paribas you build in **C#** (`role-stories.ts:21, 27`, porting legacy Java loaders to C#); your Java API work was at Joveen (`role-stories.ts:142`). |
| M3 | Inner `<title>`s (`site-copy.ts:17`, route pages) | `Software engineer at BNP Paribas · Elias Bennett` · `Full stack software engineer at Joveen · Elias Bennett` · `Marketing executive at Optegra Eye Healthcare & Kensington Medical · Elias Bennett` · `Things I make · Elias Bennett` · `Threshold · Elias Bennett` · `Argus Risk · Elias Bennett` · `Flowtime · Elias Bennett` · `Résumé · Elias Bennett` · `Nothing here · Elias Bennett` | Keep | — | Consistent template, accurate. |
| M4 | Inner `<meta name="description">`s (`role-stories.ts`, `case-studies.ts`, `site-copy.ts:112`, `resume.ts:25`) | Role story summaries · Archive (`Products of my own, from a rental calculator to a risk simulator, with the thinking behind the main ones.`) · Case study descriptions · Résumé (`My résumé on one page: my roles at BNP Paribas, Joveen and Optegra, three projects, awards, skills and education.`) | Keep | — | All accurate, concrete, and right length for search/link previews. |

### 14b · Share-card text & `og:image:alt`

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| S1 | Homepage / Archive / Résumé share card (`opengraph-image.tsx:7`, `share.ts:9`, `site-copy.ts:20–24`) | Card text: `I build pricing and risk engines at BNP Paribas, and products of my own.` / `ELIAS BENNETT` · Alt: `ELIAS BENNETT. I build pricing and risk engines at BNP Paribas, and products of my own.` | Keep card text; change alt to `Elias Bennett: I build pricing and risk engines at BNP Paribas, and products of my own.` | Accessibility wording | All-caps `ELIAS BENNETT.` in alt text can be read letter-by-letter by screen readers; title case matches the other share-card alts. *(No PNG regeneration needed.)* |
| S2 | Role story share card (`work/[slug]/opengraph-image.tsx:6, 28–33`) | Card text: `{employer}` / `{role}` / `ELIAS BENNETT` + hanging pass · Alt: `Elias Bennett: a role story, in the employer’s colour` | Keep card text; change alt to `Role story · Elias Bennett` (or wire per-slug `{role} at {employer} · Elias Bennett` in `generateMetadata`) | Accessibility wording / voice | `"in the employer’s colour"` is internal design-system jargon, not useful alt text for a link preview. |
| S3 | Case study share card (`things-i-make/[slug]/opengraph-image.tsx:8, 35–40`) | Card text: `{name}` / `{outcome}` / `ELIAS BENNETT` + screenshot · Alt: `Elias Bennett: a case study, in the project’s colour` | Keep card text; change alt to `Case study · Elias Bennett` (or wire per-slug `{name}: {outcome} · Elias Bennett` in `generateMetadata`) | Accessibility wording / voice | Same: `"in the project’s colour"` is design-system jargon. *(Note: Next.js also still emits the root OG image on `/404` despite `openGraph: null` in `not-found.tsx` — technical note for `#521`.)* |

### 14c · Alt text, accessible names & live-region announcements

*(Per-control items already listed in their surface tables: `H6`, `O5`, `T4`, `OC5`, `OC7`, `SH2`, `R6`, `C5`.)*

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| A1 | External-link `sr-only` host labels (`host-label.ts:2–5`, used by `site-link.tsx`, `say-hello.tsx`, `things-i-make.tsx`, `project-panel.tsx`, `off-the-clock-cells.tsx`) | `opens GitHub in a new tab`, else raw hostname: `opens linkedin.com in a new tab`, `opens goodreads.com in a new tab`, `opens letterboxd.com in a new tab`, `opens threshold-beta.vercel.app in a new tab`, `opens flowtime-focus-timer.vercel.app in a new tab`, `opens web.archive.org in a new tab` | Map known hosts to human names: `LinkedIn`, `Goodreads`, `Letterboxd`, `Threshold`, `Flowtime`, `the Wayback Machine` (keeping `GitHub` and bare-hostname fallback for any other domain) | Accessibility wording / voice | `host-label.ts:1` intends `"as a person would say it"`. Saying `"opens threshold-beta.vercel.app in a new tab"` sounds robotic when `"opens Threshold in a new tab"` is right there. |
| A2 | Project screenshot alts (`projects.ts:74, 95, 117, 135, 151, 169`) | 6 descriptive alts | Keep (normalise straight apostrophes in `Threshold's` and `event's` to curly `’` to match the rest of the site) | Voice / typography | Specific, accurate descriptions of the actual screenshots. |
| A3 | Lightbox (`zoomable-image.tsx:375, 380, 434`) | Button suffix: ` (view larger)` · Dialog `aria-label`: `{alt}` · Close button: `Close` | Keep | — | Clear, unobtrusive. |
| A4 | Unused `heroPortrait` alt (`src/content/stretch/media.ts:2–7`) | `Elias in a white tuxedo, smiling` | Keep (file unused on current routes; note for `#521` cleanup) | — | Accurate if still kept; no visitor sees it today. |

### 14d · `llms.txt` & Markdown mirror (`/index.md`) (`src/content/markdown.ts`)

| ID | Where | Current copy | Proposed copy | Category | Reason & fact source |
| --- | --- | --- | --- | --- | --- |
| L1 | `llms.txt` intro (`markdown.ts:103`) | `This is Elias's personal site. The homepage below is the whole of it in text; the pages under it go further into each part.` | `My personal site. The Markdown homepage below covers the whole site in plain text; the pages under it go deeper into each role and project.` | Voice | Switches from 3rd person (`Elias's`, straight apostrophe) here to 1st person (`who I am, my work`) four lines down. Keeping 1st person throughout matches Elias’s voice and the blockquote above it. |
| L2 | `llms.txt` homepage link line (`markdown.ts:107`) | `who I am, my work, what I make, how I work, and how to reach me` | `who I am, my work, what I make, how I work, off the clock and how to reach me` | Accuracy | Omits the Off the clock section that `/index.md` actually includes; drops Oxford comma for site consistency. |
| L3 | `llms.txt` Résumé link line (`markdown.ts:108`) | `my career on one page` | Keep | — | Concise, accurate. |
| L4 | `llms.txt` Things I make link line (`markdown.ts:109`) | `everything I have built` | `everything I’ve built that I’d happily talk through` (or `everything I’ve built`) | Voice | Uncontracted `I have` sounds stiff next to the rest of the site’s `I’ve`. |
| L5 | `/index.md` opening (`markdown.ts:41–47`) | Prints `siteCopy.description` (`…at BNP Paribas in C# and Java, and products of my own.`) followed immediately by `> I build pricing and risk engines at BNP Paribas, and products of my own.` | Print `I’m Elias, a software engineer in London.` above the blockquote `> I build pricing and risk engines at BNP Paribas, and products of my own.` (then `opening.support`) | Accuracy / repetition across surfaces | Currently states `"I build pricing and risk engines at BNP Paribas, and products of my own."` twice in two consecutive lines (with the stale `"in C# and Java"` in the first). |
| L6 | `/index.md` Work bullets (`markdown.ts:25–31`, `work.ts:162–194`) | BNP Paribas prints only `Winner: Digitisation · 2025`, `Take Ownership: Q1 2026`, `AI Champion: 2026`. Joveen prints `Page load, cut by 40%: Cut page load by 40% by refactoring React components and lazy-loading assets.` | Use each role’s `story.resume` bullets (already single-statement, verified by `resumeLineProblems`) — or for BNP Paribas include its Work-panel proofs and fix Joveen’s duplicate `Cut page load by 40%` | Accuracy / repetition across surfaces | `index.md` currently pulls from retired quiet-index `work.employers[].pins`, which duplicates `"Cut page load by 40%"` inside Joveen’s first bullet and omits BNP Paribas’s actual work results (`role-stories.ts:115–118`). |
| L7 | `/index.md` section order (`markdown.ts:55–75`) | Lists `### Where I’m headed` inside `## Work`, before `## Things I make` | Move `## Where I’m headed` after `## Things I make` (before `## How I work`) | Accuracy | `markdown.ts:23` promises `"section by section in the order the page shows them"`. On the shipped site (`homepage.tsx`), `Where I’m headed` sits after `Things I make`, on the shared band with `How I work`. |
| L8 | `/index.md` secondary projects (`markdown.ts:36`) | Unlinked plain text (`Home Secretary`, `Risk Event Tracker`, `Ask Professor Past`) | Link each to `project.links.code` (GitHub) | Accuracy / clarity of next action | On the homepage these rows link to their GitHub repos; in `/index.md` the links are dropped. |
| L9 | `/index.md` Off the clock intro (`markdown.ts:78`) | `What my own time looks like this week. The section opens with my GitHub year, then my training week:` | `What my own time looks like this week. My usual training week:` | Accuracy | **Factually inverted** — Off the clock opens with `Today’s workout` (the training week) and ends with `GitHub, the past year` (leftover from the retired quiet-index order). |
| L10 | `/index.md` Off the clock live-signals line (`markdown.ts:82`) | `The page also shows what I am reading, the last film I watched, an odd fact from this week in history and what I am making now, live from Goodreads, Letterboxd, Wikipedia and GitHub.` | `The page also shows what I’m reading, the last film I watched, an odd fact from this week in history, what I’m building now and my GitHub year, live from Goodreads, Letterboxd, Wikipedia and GitHub.` | Voice / accuracy | Replaces stiff `I am` with `I’m`, updates `"making now"` to match the shipped `"What I’m building now"` heading, and keeps GitHub year accounted for after fixing `L9`. |

---

## Copy deck cleanup (`docs/content/redesign-copy.md`) — Phase 2

Once you sign off on the tables above, I will apply the approved edits and clean up `docs/content/redesign-copy.md` (and `scripts/verify-copy.mjs`) so the deck matches the shipped Passes and panels site with zero retired sections left active:

- **Remove retired Stretch & Quiet Index sections** (pointing to `docs/content/quiet-index-copy.md` and git history for the historical record):
  - Old `## Hero` (`Software Engineer`, `Based in London` sticker, `In C# and Java`, `See my work ↓`)
  - Old `## Things I make` intro and `06 things I’ve built · 03 I’m proudest of` note
  - Old `## How I work` three-habit note and old Measure proof
  - Old `## Off the clock` retired lines (`Zone 2 means slow on purpose.`, `Admit one` row label, `This week in history` stamp, etc.)
  - Old `## Say hello` retired `Say hello ↗` prompt line
  - Retired `## The quiet index homepage` subsections (closer looks, `Good morning / Good afternoon / Good evening`, `Made by Elias` footer, old `Where I’m headed` lead)
- **Add missing live copy to the deck** so `verify:copy` holds the whole site: Case study header ledes (`study.description`), `Menu` button, `Off the clock` live/stale/fallback strings currently split across sections, and the approved `llms.txt` / `/index.md` / `host-label` wording.

## Follow-up notes (outside copy-only scope)

- **Optegra Work panel repetition (`WK11`):** `62% → 88%` appears in both the display figure and tray cell 1 because Optegra has three total metrics and R-45 mirrors Joveen’s 3-cell tray. Removing cell 1 would be a layout change (follow-up if desired).
- **Résumé PDF refresh (`RS5`, `RS7`, `RS8`):** regenerating `public/Elias-Bennett-Resume.pdf` is out of scope for `#528`. If you want Awards on `/resume` to name the employer/issuer (or unify Argus Risk’s outcome line on `/resume`), do that alongside `pnpm resume:pdf` in a follow-up (or in `#521`).
- **404 OG image inheritance (`S3`):** Next.js still emits the root `opengraph-image` meta tags on `/404` even with `openGraph: null` in `not-found.tsx`; note for `#521`.
- **Joveen `The problems` (`R16`):** renders as a single paragraph while BNP Paribas and Optegra render structured Problem cards; structural change if you ever want them uniform.
