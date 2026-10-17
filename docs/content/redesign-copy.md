# Redesign copy

Approved by Elias on 8 October 2026 for [#113](https://github.com/3ixas/eliasb.dev/issues/113), 8 October 2026. Every line is true to #103, the CV, and each project's own records. The title is "Software engineer". Brevity rule: each section says only what it needs to show.

`{braces}` are live values.

## Site-wide

| Where | Copy |
| --- | --- |
| Page title (home) | Elias Bennett, software engineer at BNP Paribas |
| Page title (others) | {Page} · Elias Bennett |
| Meta description | I’m Elias, a software engineer in London. I build pricing and risk engines at BNP Paribas in C# and Java, and products of my own. |
| Social image | ELIAS BENNETT · I build pricing and risk engines at BNP Paribas, and *products of my own.* |
| Menu | Work · Things I make · How I work · Off the clock · Say hello |
| Header | Dark theme · Menu · Close · ← Work |
| Greeting (header, and the menu dialog on phones) | Good morning (05:00 to 11:59) · Good afternoon (12:00 to 17:59) · Good evening (18:00 to 21:59) · Still up? (22:00 to 04:59), by the visitor’s own clock. Hello before the browser has read it, and without script. Approved by Elias on 15 October 2026 for [#180](https://github.com/3ixas/eliasb.dev/issues/180) |
| Footer | Made by Elias |

**404**

- Title: Nothing here
- Heading: This page doesn’t exist.
- Line: It’s moved, or it never did. Everything else is where you left it.
- Button: Back to the homepage →

## Hero

- Role line, plain text under the name: Software Engineer at BNP Paribas CIB
- Label on the portrait: Based in London
- Headline: I build pricing and risk engines at BNP Paribas, and *products of my own.*
- Supporting line: In C# and Java, on CPU and GPU. I’ve won BNP’s Early Careers digitisation competition and a Take Ownership award.
- Buttons: See my work ↓ · Say hello

The First glance changed for the forward-facing redesign ([#159](https://github.com/3ixas/eliasb.dev/issues/159), [#162](https://github.com/3ixas/eliasb.dev/issues/162), [#168](https://github.com/3ixas/eliasb.dev/issues/168)): the entrance is built around “*products of my own.*” landing.

## Work

The homepage section straight after the hero, led by employment ([#157](https://github.com/3ixas/eliasb.dev/issues/157), [#175](https://github.com/3ixas/eliasb.dev/issues/175)). Proof copy approved by Elias on 16 October 2026. Nothing here repeats the First glance’s wording.

- Heading: Work

### Now

The current Staff pass. Its role, dates and link come from its Role story, and its headline number from `src/content/stretch/staff-pass.ts`: the first approved proof, “I’m the team’s only C# engineer, so I own the C# side from planning through review”, became that headline (“Only · C# engineer on the team”). The other two stay on the pass as lines (#210).

| Part | Copy |
| --- | --- |
| Proofs | I was nominated as an AI Champion, and the workflow I built is now used by several teams across the department. · With that workflow I integrated a pricer in a couple of days, a job that takes an experienced engineer about two weeks. |

### Where I’m headed

The self-issued Staff pass (#211, settled on the map on 16 October 2026). Each bar says what “good” means; its “So far” restates a fact already in a Role story or Case study, checked by `verify:copy`. The Optegra line says “guided”, as the Optegra Role story does (the prototype said “decided”).

- Heading: Where I’m headed
- Line: I want to be really good at this. Here’s what that means to me, and how far I’ve got.
- Tag: So far

| Bar | Title | So far | Link |
| --- | --- | --- | --- |
| Judgement | Knowing what’s worth building. | At Optegra, split tests and dashboards guided what the engineers built next. | The Optegra story → |
| Depth | Knowing why it works, not just that it does. | Six months from zero C# to production code, in a pricing engine of around 70 projects. | The BNP Paribas story → |
| Range | The whole way, from idea to running in production. | Threshold, from 57 user stories to a live site. | The Threshold case study → |

### How I got here

Joveen and Optegra are now Staff passes (role, dates and headline number from their Role stories, stamped “Returned”). What remains as text is the note under the Work heading and History, a dashed note under the rail (#210).

- Note: History, then marketing, then code. Each move was towards the work I liked most.

| Dates | Role | Note |
| --- | --- | --- |
| Before 2021 | History at uni | Because I loved it, and I still do. |

## Things I make

The homepage section for my own projects ([#157](https://github.com/3ixas/eliasb.dev/issues/157), [#170](https://github.com/3ixas/eliasb.dev/issues/170)).

- Heading: Things I make
- Intro: I build everyday software, and make complicated things feel simple. I take ideas all the way through: deciding what’s worth making, designing it, building it across the stack, and finding out whether it actually works.
- Note: 06 things I’ve built · 03 I’m proudest of

**Featured tiles** (outcome · metadata)

| Project | Outcome | Metadata |
| --- | --- | --- |
| Threshold | A clearer view of what moving could cost. | Product · Data visualisation · 2026 |
| Argus Risk | Every number shows where it came from and how old it is. | Event-driven systems · 2026 |
| Flowtime | Breaks that match how long you actually focused. | Offline-first interaction · 2026 |

**Index rows** (outcome · type · year)

| Project | Outcome | Type | Year |
| --- | --- | --- | --- |
| Ask Professor Past | History you can talk to. Version 1; I’m rebuilding it. | AI product | 2025 |
| Home Secretary | A household coordination prototype, built for my software engineering coursework. | Prototype | 2026 |
| Risk Event Tracker | A tested C# Web API for managing risk events. | Systems · API | 2025 |

- Link to the archive: Everything I’ve built ({06}) →
- Connect Four is left out (the interview rule from #106).

## How I work

- Heading: How I work
- Note: Three habits, and where I picked them up.

| Beat | Proof |
| --- | --- |
| **Start from a real problem.** | Threshold started because my friends had no clear idea what renting would cost by area. Flowtime started because Pomodoro kept cutting me off mid-flow. |
| **Write it down first.** | Before I build, I write down the problem, who it’s for, and what’s out of scope. Threshold had 57 user stories before any code. |
| **Measure whether it works.** | I learned this in marketing, running split tests and conversion dashboards. At BNP Paribas I co-built a dashboard from users’ requirements that cut a 30–40 minute data load to under 5. |

- PRD card caption: Threshold’s PRD, 16 April 2026

## Off the clock

- Heading: Off the clock
- Note: What my own time looks like this week.

| Item | Live | When the source is empty |
| --- | --- | --- |
| Training | Today · {Thursday} / {Interval run} · My training week · Zone 2 means slow on purpose. · Photo caption: Out on a run, central London. · Photo alt: Elias mid-run on a rainy street in central London | Authored, so never empty. |
| Now reading | Now reading · {title} · {author} · Goodreads ↗ | Between books. |
| Last watched | Admit one · Last watched · {title} · {year} · Letterboxd ↗ | Nothing logged yet. |
| The Weekly Curiosity | Odd but true, from this week in history · {fact} · {year} · {n} more oddities this week ↓ · Read on Wikipedia ↗ | From the archive |
| Now making | ● Now making · {project or repository name} · {GitHub description, when it has one} · View on GitHub ↗ (a project with a case study links its name to the case study instead) | Hidden when GitHub can’t be reached |
| GitHub | {1,221} contributions in the past year · busiest stretch, {September–October} → · ← swipe for the whole year · Quiet / Busy / today | as of {date} |

Strings added while building, shipped, and recorded here on 2026-10-09 so `verify:copy` covers them. They were not in the original approved copy; Elias signed them off on 2026-10-09.

- Training week plan: Mon Monday Full-body gym · Tue Tuesday Zone 2 run · Wed Wednesday Full-body gym · Thu Thursday Interval run · Fri Friday Full-body gym · Sat Saturday Zone 2, rower or bike · Sun Sunday Assault bike intervals
- Weekly Curiosity: Read more ↗ · Image:
- GitHub: GitHub, the past year · Use the arrow keys to move between days.

## Say hello

- The email action is also the section heading; no separate repeated heading.
- Big link: Say hello ↗
- Line: Got an idea, a project, or just want to talk about building things? Email’s the best way to reach me.
- Links: Résumé · GitHub · LinkedIn
- Résumé opens the current publicly shared PDF: https://drive.google.com/file/d/1Yv_oB-sNMXQhyY9K_EJbQ4CV11hM2ZY7/view?usp=drivesdk

## Work archive (`/things-i-make`)

- Heading: Things I make
- Note: Everything I’ve built that I’d happily talk through.
- Filters, after 10 projects: All · Products · Systems · Experiments
- Meta description: Products of my own, from a rental calculator to a risk simulator, with the thinking behind the main ones.

## Case studies

Shared labels: ← Things I make · Live site ↗ · Code ↗ · Next project · {02} · section numbers 01–06.

### Threshold

| Section | Copy |
| --- | --- |
| Opening | A clearer view of what moving could cost. · Product · Data visualisation · 2026 · React 19, TypeScript, MapLibre |
| 01 Where it started | **The rent is the easy part.** My friends had no clear idea what renting would cost by area, and one of them was about to move to Switzerland. Most rent calculators stop at the monthly figure. Before you get the keys you might need five weeks’ deposit in London, or three months’ in Switzerland, plus the first month’s rent, moving costs, and furniture. Can I afford to move, and if not, how long until I can? |
| 02 What I wrote down first | **The problem, on paper.** “People in their 20s and 30s make the decision to move out … without a clear, honest view of what it will actually cost.” · Evidence: 57 user stories · 13 slices, built in a day · 182 tests · 3 cities |
| 03 Decisions | **Two totals and a straight answer.** *Upfront and monthly stay separate.* You can often afford the monthly costs long before you’ve saved the upfront ones. *The answer is one of three.* Move now; not yet, and how many months of saving; or your income doesn’t cover the monthly costs. *Each city keeps its own rules.* Different deposits, local charges, and transport passes, and every default can be changed. *Suggestions show what would help.* A cheaper district, a smaller place, or a flatmate, and how much each would save. |
| 04 How it’s built | **The link is the save file.** Everything you choose lives in the URL: no account, no backend. The calculations are plain functions with no state of their own, covered by 182 tests. The maps use real boundaries: 33 London boroughs, Zurich’s 12 Kreise, and Basel in seven areas. |
| 05 Where it stands | **Used, not launched.** I used it during my own flat hunt, and friends have used it too. I didn’t record what changed from what they told me, and it isn’t launched or measured yet. |
| 06 What I’d do next | *Keep the data fresh.* Move the April 2026 snapshot to a scheduled refresh where the sources allow it. *Show the sources in the app.* Link every default to its source. *Finer areas in Basel.* Use its 19 Wohnviertel rather than seven areas. |
| Meta description | A rental calculator for London, Basel, and Zurich that shows what a move really costs: upfront, monthly, and how long until you can afford it. |

### Argus Risk

| Section | Copy |
| --- | --- |
| Opening | Every number shows where it came from and how old it is. · Event-driven systems · 2026 · .NET 8, Kafka, PostgreSQL, SignalR · Runs locally with one Docker command. |
| 01 Where it started | **A total doesn’t say how old it is.** I built this one on purpose. I work on pricing and risk systems, and I wanted to build a small version of that world end to end, with a front end that makes it easy to see. Most risk dashboards show a portfolio’s value, but not how old it is, which feed it came from, or whether the system is keeping up. Argus is a simulator: no real market data, and it runs on your machine. |
| 02 What I wrote down first | **Two users, on paper.** The spec names the simulated user, a risk or portfolio manager, and the real audience: “hiring managers and engineers at banks, hedge funds, and trading firms”. · Evidence: 5 currencies · 4 services · 126 .NET tests · 1 command to run it |
| 03 Decisions | **Show the number with its history.** *Every change is an event.* Replay them and you can see any position at any point in time. *Freshness sits next to the value.* If a feed stalls, you see what failed and how old the number is. *The maths is plain functions.* FIFO cost basis, P&L, and Value at Risk: same inputs, same answer. *Check the answer.* A reconciliation run replays history and compares it with the live state. |
| 04 How it’s built | **Four services and a stream.** Two simulators publish prices, FX rates, and trades to Kafka (Redpanda locally). The risk engine publishes a snapshot every second, and SignalR pushes it to a Next.js dashboard. Marten keeps position events in PostgreSQL, so history replays at up to 60 times speed. |
| 05 Where it stands | **Runs locally, not measured yet.** It only runs locally, so looking at it means cloning the repo. I designed for under 500 ms from a price change to the dashboard, but I haven’t measured it. |
| 06 What I’d do next | *Measure the latency.* Add a benchmark and publish the result. *Make it easier to see.* A recorded replay or a hosted read-only demo. *Stress testing.* Let you shock a currency or a sector and watch the portfolio react. |
| Meta description | A local simulator for a multi-currency risk platform, where every number on the dashboard shows where it came from and how old it is. |

### Flowtime

| Section | Copy |
| --- | --- |
| Opening | Breaks that match how long you actually focused. · Offline-first interaction · 2026 · Next.js, TypeScript, Service Worker |
| 01 Where it started | **Pomodoro kept cutting me off.** Twenty-five minutes in, the timer would cut me off mid-flow. Flowtime counts up while you focus, then sets a break in proportion. In a browser that has two catches: background tabs slow timers down, and closing the tab loses the session. |
| 02 What I wrote down first | **The problem, on paper.** “Practitioners manually time sessions with phone stopwatches, calculate break durations mentally.” The spec’s test: finish a first full cycle within two minutes of landing. · Evidence: 6 timer states · 189 unit tests · ⅕ default break · 2-minute first cycle (the target) |
| 03 Decisions | **Count from a fixed point, and ask instead of guessing.** *Time comes from a timestamp,* so a sleeping tab never loses minutes. *The break follows the focus:* a fifth by default, adjustable from a third to an eighth. *Every state has a name:* six of them, so the interface always knows what to show. *Ask, don’t assume:* come back to an unfinished session and Flowtime asks what to do. |
| 04 How it’s built | **Everything stays in your browser.** Sessions, tags, notes, and settings live on your device, with a CSV export. A service worker keeps it working offline. It works from the keyboard and announces changes to screen readers. |
| 05 Where it stands | **Used, not launched.** I use it for my own focused work, and friends have used it too. I didn’t record what changed from what they said, and it isn’t launched or measured yet. |
| 06 What I’d do next | *Move between devices,* keeping local storage as the default. *Show when you focus best,* like the time of day you tend to focus longest. |
| Meta description | A focus timer that counts up, sets breaks in proportion to your focus, and keeps your history on your device. |

## Role stories

Shared labels: ← Work · Next role · Evidence · section numbers 01–06 ([#172](https://github.com/3ixas/eliasb.dev/issues/172)). BNP Paribas prose approved by Elias on 14 October 2026; Joveen and Optegra on 15 October 2026 ([#174](https://github.com/3ixas/eliasb.dev/issues/174)). The stories run newest to oldest: BNP Paribas → Joveen → Optegra, which ends on ← Work.

### BNP Paribas

| Part | Copy |
| --- | --- |
| Opening | Software engineer · Risk division · London · Jul 2025 – now |
| 01 Summary | I’m a software engineer in BNP Paribas’s risk division in London. I work in C# on the engines that price and risk-manage trades on CPU and GPU, and I’m the team’s only C# engineer. |
| 02 The role | The engines run large simulation-based calculations across several asset classes. It’s a big codebase, around 70 projects, and some of the C# is translated to run on the GPU. I joined in July 2025 having never written C#. Today I own implementation and delivery on the C# side, from planning through review. |
| 03 The problems | *Market data.* Loaders written in Java had to be ported to C#, pulling data from several sources into one place and checking it on the way. *A stale dependency.* The live pricing pipeline relied on a data file that was no longer reliably available in production. *Quant code.* Pricing code written by quantitative developers had to be integrated into the engine. *Two execution paths.* The same tests had to run on both CPU and GPU. |
| 04 Decisions | *Ship the risky change behind a flag, switched off.* Removing the dependency touched live pricing, so I put the new path behind a feature flag that defaults to off, added caching, and wrote an end-to-end test nobody had asked for. The architect’s view was that the thing to protect was the blast radius, not only correctness. I’d have called that a nice-to-have before; now it’s how I start. *Validate the data before trusting it.* The commodity loader was the harder one: ten file types, correlation groups, unit conversions, and records linked to each other. I checked the links, so an orphaned record gets caught on load rather than showing up as a strange number in a simulation. *Give AI work phases.* I built a workflow where each stage has its own scoped agent: grill the problem, plan, build test-first, self-review, then a health review. Each agent only sees what that stage needs, which keeps it from skipping ahead. |
| 05 What changed | I used that workflow to integrate a pricer into the calculation engine in a couple of days. For an experienced integration engineer it takes about two weeks, and I was new to it. I went from no C# to shipping production code independently in six months. The Early Careers digitisation competition is the other half of this. I led a team of four and co-built a dashboard from our users’ requirements, which cut a 30–40 minute data load to under 5. We won, out of five groups, and presented it to the Head of Risk Systems. · Evidence: Nov 2025 won the Early Careers digitisation competition · 6 months from zero C# to production code |
| 06 What I took with me | I was nominated as an AI Champion in the risk division, and the workflow is now used by several teams across the department. I also won a Take Ownership award. The habit underneath all of it is simple: write down what you’re doing before you build it, and ship it so it’s safe to undo. |
| Title | Software engineer at BNP Paribas · Elias Bennett |
| Meta description | I’m a software engineer in BNP Paribas’s risk division in London. I work in C# on the engines that price and risk-manage trades on CPU and GPU, and I’m the team’s only C# engineer. |
| Social card | BNP Paribas · Software engineer · ELIAS BENNETT |

### Joveen

| Part | Copy |
| --- | --- |
| Opening | Full stack software engineer · Aug 2024 – Jun 2025 |
| 01 Summary | I was a full stack software engineer at Joveen, working on its e-commerce site in React, Java with Spring Boot and MySQL. |
| 02 The role | I worked across the React front end, the Java API behind it and the MySQL database underneath. I was also on a coding bootcamp alongside the job. |
| 03 The problems | *A slow site.* Pages took too long to load. *A codebase on its way out.* Some modules were still in PHP and had to move to Spring Boot. *Mobile and browser bugs.* Layouts and features broke on some phones and browsers. *Slow queries.* A key API was slower than it needed to be. |
| 04 Decisions | *Make the front end do less up front.* We refactored React components and lazy-loaded assets, so a page loads what it needs first. *Move PHP to Spring Boot in pieces.* Migrating module by module let us release in smaller steps. I wrote endpoints, validation and tests, and fixed defects along the way. *Test across browsers, then fix.* A cross-browser testing pipeline caught the mobile layout and functionality bugs, and I fixed them. *Measure the database.* We added indexes and rewrote slow queries, starting with the API that mattered most. |
| 05 What changed | Page load fell by 40%. Deploys went from 10 minutes to under 2. Mobile retention rose by 30%. The key API’s p95 dropped from 520 ms to 230 ms, and cloud costs fell by 18%. · Evidence: −40% page load · Under 2 minutes to deploy, down from 10 · +30% mobile retention · 230 ms key API p95, down from 520 ms |
| 06 What I took with me | Alongside the job I did freelance AI training, reviewing 1,000 code items across TypeScript, Python, Java, C# and SQL at 97% QA precision. It was my first sustained work with AI on code, and the start of the thread that leads to the workflow I built at BNP Paribas. |
| Title | Full stack software engineer at Joveen · Elias Bennett |
| Meta description | I was a full stack software engineer at Joveen, working on its e-commerce site in React, Java with Spring Boot and MySQL. |
| Social card | Joveen · Full stack software engineer · ELIAS BENNETT |

### Optegra Eye Healthcare & Kensington Medical

| Part | Copy |
| --- | --- |
| Opening | Marketing executive · Sep 2021 – Aug 2024 |
| 01 Summary | I was a marketing executive across two healthcare providers: private, at Kensington Medical, and NHS work through Optegra Eye Healthcare. The best part of the job was working with the engineers who built our website. |
| 02 The role | From September 2021 at Kensington Medical, and from October 2022 at Optegra, I did digital marketing: campaign analysis, split tests and analytics dashboards. I also worked with the engineers on the company website, scoping and ticketing fixes. |
| 03 The problems | *Slow, uneven pages.* The Core Web Vitals pass rate was 62%, and page loads were slower than they needed to be. *No clear view of what worked.* We couldn’t easily tell which changes brought in consultations. |
| 04 Decisions | *Scope the fix so it can be built.* I scoped performance fixes with the engineers and ticketed them, so each one was something they could build and I could measure. *Test, then build.* Split tests and analytics dashboards showed which changes helped, and that guided what the engineers worked on next. |
| 05 What changed | The Core Web Vitals pass rate went from 62% to 88%. The p95 page-load time fell by 30%. Consultation conversion rose by 15%. · Evidence: 88% Core Web Vitals pass rate, up from 62% · −30% p95 page load · +15% consultation conversion |
| 06 What I took with me | The click came in early 2024. A friend loved his work so much that even a hectic week sounded exciting, and I wanted that from mine. I started coding in my spare time, just to see, and by August 2024 I was doing it for a living. |
| Title | Marketing executive at Optegra Eye Healthcare & Kensington Medical · Elias Bennett |
| Meta description | I was a marketing executive across two healthcare providers: private, at Kensington Medical, and NHS work through Optegra Eye Healthcare. The best part of the job was working with the engineers who built our website. |
| Social card | Optegra Eye Healthcare & Kensington Medical · Marketing executive · ELIAS BENNETT |

## Checks

- **Facts:** every claim traces to #103, the CV, `src/content/case-files.ts`, or the project specs (Argus `project-spec.md`; Flowtime `project-spec.md`, added 3 January 2026). Threshold’s figures come from the evidence note.
- **Privacy:** BNP Paribas detail stays at CV level; no colleague names, internal system names, or review context. “The team’s only C# engineer” is CV wording.
- **Voice:** British spelling, plain verbs, few em-dashes, at most one light touch of humour per section.
