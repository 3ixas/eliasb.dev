# Site copy

Approved copy for the shipped Passes and panels site (first approved 8 October 2026 for [#113](https://github.com/3ixas/eliasb.dev/issues/113); refined in [#512](https://github.com/3ixas/eliasb.dev/issues/512) and reviewed across every surface in [#528](https://github.com/3ixas/eliasb.dev/issues/528), signed off by Elias on 24 November 2026). Every line traces to #103, the CV, `docs/content/CASE-STUDY-SOURCES.md`, and each project’s own records. Retired Stretch and quiet-index copy lives in `docs/content/quiet-index-copy.md` and git history.

`{braces}` are live values.

## Site-wide

| Where | Copy |
| --- | --- |
| Page title (home) | Elias Bennett, software engineer at BNP Paribas |
| Page title (others) | {Page} · Elias Bennett |
| Meta description (home) | I’m Elias, a software engineer in London. I build pricing and risk engines at BNP Paribas in C# and Java, and products of my own. |
| Social image | ELIAS BENNETT · I build pricing and risk engines at BNP Paribas, and *products of my own.* |
| Social image alt (home / archive / résumé) | Elias Bennett: I build pricing and risk engines at BNP Paribas, and products of my own. |
| Social image alt (Role stories) | Role story · Elias Bennett |
| Social image alt (Case studies) | Case study · Elias Bennett |
| Navigation links | Work · Things I make · How I work · Off the clock · Say hello |
| Header nav landmark (home / inner) | On this page · Site |
| Header controls | Menu · Dark theme · ← Work |
| Greeting (header) | Kettle’s on. (05:00 to 11:59) · Nearly five? (12:00 to 16:59 on a weekday) / Nowhere to be? (12:00 to 16:59 on Saturday and Sunday) · Home yet? (17:00 to 21:59) · Still up? (22:00 to 04:59), by the visitor’s own clock and day. Hello before the browser has read it, and without script ([#300](https://github.com/3ixas/eliasb.dev/issues/300), [#180](https://github.com/3ixas/eliasb.dev/issues/180)). |
| Greeting, London time | It’s {14:28} here in London |

### 404

- Title: Nothing here
- Heading: This page doesn’t exist.
- Line: It’s moved, or it never did. Everything else is where you left it.
- Visitor pass ([#470](https://github.com/3ixas/eliasb.dev/issues/470)): its band says Visitor; it prints the address asked for (shortened in the middle at 32 characters), struck through. Its line is Not on file and its metadata is 404.
- Section title: Try one of these
- Section note: The homepage, a section at a time.

| Section | Line |
| --- | --- |
| Work | BNP Paribas, Joveen and Optegra |
| Things I make | Threshold, Argus Risk, Flowtime and more |
| How I work | Four habits, and the proof for each |
| Off the clock | Training, a book, a film, this week in history |
| Say hello | The email, the résumé, GitHub and LinkedIn |

## Opening

| Where | Copy |
| --- | --- |
| Opening line (`h1`) | I build pricing and risk engines at BNP Paribas, and *products of my own.* |
| Supporting line | I’m the team’s only C# engineer, and the engines run on CPU and GPU. I’ve won the bank’s digitisation competition and a Take Ownership award. |
| Actions | Work · Say hello |
| Staff pass | Prints who and when only ([#493](https://github.com/3ixas/eliasb.dev/issues/493)): employer, name, role, dates, and status (`Valid · present` or `Returned`). |

## Work

- Heading: Work
- Subheading: History, then marketing, then code. Each move was towards the work I liked most.
- BNP Paribas figure: 6 months · from zero C# to production code
- Simulation heading: How the pricing engines work
- Simulation: Today · Horizon · One price
- Simulation controls: Run again · Paths · 10 · 100 · 1,000 · 10th–90th spread
- Simulation settled, read to a screen reader when a run settles: {1,000} paths: one price, {1.2}% {above / below} today; 10th–90th spread {87.1}%. · {10} paths: one price, level with today; 10th–90th spread {87.1}%.
- Simulation caption: Thousands of possible market paths go in; a price and its risk come out.
- Simulation description: Illustrative simulated paths from today to the horizon, a histogram of where they end on the right edge, and a dashed line at their average, labelled one price.

| Comparison | Before | After |
|---|---|---|
| Integrating a pricer | An experienced engineer · about two weeks | Me, new to it · a couple of days |
| The competition dashboard’s data load | Before · 30–40 min | After · under 5 min |

| Panel | Pair | Value |
|---|---|---|
| Joveen | Key API p95 | 520 ms → 230 ms |
| Joveen | Time to deploy | 10 min → under 2 |
| Joveen | Mobile retention | +30% |
| Optegra | Core Web Vitals | 62% → 88% |
| Optegra | p95 page load | −30% |
| Optegra | Consultation conversion | +15% |

## Things I make

- Heading: Things I make
- Note: Products of my own, from a rental calculator to a risk simulator.
- Archive link: Everything I’ve built ({6}) →
- Homepage row overrides: Argus Risk (`A risk simulator where every number shows its source and age.`), Home Secretary (`A household coordination prototype, built for coursework.`).
- Connect Four is left out ([#106](https://github.com/3ixas/eliasb.dev/issues/106)).

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

## Where I’m headed and How I work

Where I’m headed and How I work share one full-bleed `--band` section (R-48, R-49, R-55). Every drawn number is checked against its highlighted phrase or source evidence by `verify:copy`.

### Where I’m headed

- Heading: Where I’m headed
- Lead: I’m working towards the judgement, depth and range to be trusted to decide what to build, build it well and get it used. Here’s how far I’ve got on each.
- Tag: So far

| Bar | Title | So far | Link |
| --- | --- | --- | --- |
| Judgement | Close enough to users to know what’s worth building. | At Optegra, split tests and dashboards guided what the engineers built next. | The Optegra story → |
| Depth | Knowing it well enough that people can rely on it. | Six months from zero C# to production code, in a pricing engine of around 70 projects. | The BNP Paribas story → |
| Range | All the way, from first idea to how it gets used. | Threshold, from 57 user stories to a live site. | The Threshold case study → |

### How I work

- Heading: How I work
- Note: Four habits, and the proof for each.
- PRD link: Threshold’s PRD, 16 Apr 2026 →

| Habit | Proof | Highlighted | Drawn |
| --- | --- | --- | --- |
| Start from a real problem. | Threshold started because my friends had no clear idea what renting would cost by area. Flowtime started because Pomodoro kept cutting me off mid-flow. | no clear idea | Threshold · Flowtime |
| Write it down first. | Before I build, I write down the problem, who it’s for, and what’s out of scope. Threshold had 57 user stories before any code. | 57 user stories | 57, 13 slices |
| Ship it so it’s safe to undo. | At BNP Paribas, taking a stale data dependency out of live pricing, I put the new path behind a feature flag that defaults to off, with caching and an end-to-end test nobody had asked for. | defaults to off | A switch, Off / On · Today’s path · New cached path |
| Measure whether it works. | I learned this in marketing. At Optegra, split tests and analytics dashboards showed which changes brought in consultations, and conversion rose by 15%. | rose by 15% | +15%, Before · After, its bar 15% longer |

## Off the clock

- Heading: Off the clock
- Note: What my own time looks like this week.
- Section margin headings: Today’s workout · On my shelf and screen · Odd but true, from this week in history · GitHub, the past year

| Item | Live | When the source is empty |
| --- | --- | --- |
| Training | Today’s workout · My training week · Photo caption: Out on a run, central London. · Photo alt: Elias mid-run on a rainy street in central London | Authored, so never empty. |
| Now reading | Now reading · {title} · {author} · Goodreads ↗ · From Goodreads, as of {date} | Between books. |
| Last watched | Last watched {9 Oct} · {★★★½} · Letterboxd ↗ · From Letterboxd, as of {date} | Nothing logged yet. |
| The Weekly Curiosity | Odd but true, from this week in history · {date} · {fact} · Image: {creator} · {licenseName} · {1} of {3} (screen-reader suffix: `, next fact`) · Born {date} · Live from Wikipedia | From the archive |
| Now making | What I’m building now · Live from GitHub · {project or repository name} · {GitHub description, or the project’s line} | Hidden when GitHub can’t be reached |
| GitHub | GitHub, the past year · {1,221} contributions in the past year · Less / More / today · Use the arrow keys to move between days. · Live from GitHub | From GitHub, as of {date} |

### Training week

| Day | Full | Cue | Session |
|---|---|---|---|
| Mon | Monday | Upper | Upper body gym |
| Tue | Tuesday | Lower | Lower body gym |
| Wed | Wednesday | Zone 2 | Zone 2, assault bike |
| Thu | Thursday | Upper | Upper body gym |
| Fri | Friday | Lower | Lower body gym |
| Sat | Saturday | Rope | Skipping rope intervals |
| Sun | Sunday | Bike | Assault bike intervals |

## Say hello

- Heading: Say hello
- Email: {eliasthebennett@gmail.com} · Copy (screen-reader suffix: `email address`) → Copied
- Links: Résumé → · GitHub ↗ · LinkedIn ↗

## Work archive (`/things-i-make`)

- Heading: Things I make
- Note: Everything I’ve built that I’d happily talk through.
- Filters (shown after 10 projects): All · Products · Systems · Experiments
- Meta description: Products of my own, from a rental calculator to a risk simulator, with the thinking behind the main ones.

## Case studies

Voice rule: frame everything positively. Say what exists, what I did, and what’s next; never write what’s missing, unfinished or unmeasured.

Shared labels: ← Things I make · Live site ↗ · Code ↗ · Next project · All projects · From the PRD. Chapter rail landmark name (not on screen): Case study sections. The header lede uses the case study’s `Meta description` (`study.description`) so visitors get concrete product context rather than repeating the homepage panel’s short outcome.

### Threshold

| Section | Copy |
| --- | --- |
| Opening | A clearer view of what moving could cost. · Product · Data visualisation · 2026 · React 19, TypeScript, MapLibre |
| 01 Where it started | **The rent is the easy part.** My friends had no clear idea what renting would cost by area, and one of them was about to move to Switzerland. Most rent calculators stop at the monthly figure. Before you get the keys you might need five weeks’ deposit in London, or three months’ in Switzerland, plus the first month’s rent, moving costs and furniture. Can I afford to move, and if not, how long until I can? |
| 02 On paper | **The problem, on paper.** “People in their 20s and 30s make the decision to move out … without a clear, honest view of what it will actually cost.” · Evidence: 57 user stories · 13 slices, built in a day · 182 tests · 3 cities |
| 03 Decisions | **Two totals and a straight answer.** *Upfront and monthly stay separate.* You can often afford the monthly costs long before you’ve saved the upfront ones. *The answer is one of three.* Move now; not yet, and how many months of saving; or your income doesn’t cover the monthly costs. *Each city keeps its own rules.* Different deposits, local charges and transport passes, and every default can be changed. *Suggestions show what would help.* A cheaper district, a smaller place, or a flatmate, and how much each would save. |
| 04 How it’s built | **The link is the save file.** Everything you choose lives in the URL: no account, no backend. The calculations are plain functions with no state of their own. The maps use real boundaries: 33 London boroughs, Zurich’s 12 Kreise and Basel in seven areas. |
| 04 · The working link | Controls: City · District · Place (London · Basel · Zurich; each city’s districts; Room · Studio · 1-bed · 2-bed · 3-bed). Button: Copy link, then Copied. Action: Open this scenario ↗. Caption: Change a choice and the link changes with it. Copy it, or open the scenario straight in Threshold. Without script the screenshot keeps its caption. |
| 05 Where it stands | **Used for real.** I used it during my own flat hunt, and friends have used it too. |
| 06 What’s next | *Keep the data fresh.* Move the April 2026 snapshot to a scheduled refresh where the sources allow it. *Show the sources in the app.* Link every default to its source. *Finer areas in Basel.* Use its 19 Wohnviertel rather than seven areas. |
| Meta description (and header lede) | A rental calculator for London, Basel and Zurich that shows what a move costs: upfront, monthly and how long until you can afford it. |

### Argus Risk

| Section | Copy |
| --- | --- |
| Opening | Every number shows where it came from and how old it is. · Event-driven systems · 2026 · .NET 8, Kafka, PostgreSQL, SignalR |
| 01 Where it started | **A total doesn’t say how old it is.** I work on pricing and risk systems, and I wanted to build a small version of that world end to end, with a front end that makes it easy to see. Most risk dashboards show a portfolio’s value, but not how old it is, which feed it came from, or whether the system is keeping up. Argus is a simulator: its prices, FX rates and trades are generated, and it runs on your machine. |
| 02 On paper | **Two users, on paper.** The spec names the simulated user, a risk or portfolio manager, and the real audience: “hiring managers and engineers at banks, hedge funds, and trading firms”. · Evidence: 5 currencies · 4 services · 126 .NET tests · 1 command to run it |
| 03 Decisions | **Show the number with its history.** *Every change is an event.* Replay them and you can see any position at any point in time. *Freshness sits next to the value.* If a feed stalls, you see what failed and how old the number is. *The maths is plain functions.* FIFO cost basis, P&L and Value at Risk: same inputs, same answer. *Check the answer.* A reconciliation run replays history and compares it with the live state. |
| 03 · The numbers with their history | Label: Unrealised P&L (USD). Each number opens on From: A price tick on market-data.prices, then {symbol} at {price} {currency} and, for GBP and EUR, Converted at {pair} {rate}; and Age: {n} s, with Stale past 5 seconds. Button: New event. Announced: {symbol}: a new price of {price} {currency}, unrealised P&L {value}. Description (read with the list): Illustrative positions in Argus’s own shapes. Argus counts a price older than 5 seconds as stale. Caption: Press a number to see the price it came from and how old it is. New event brings a new price for the oldest one. Without script the screenshot keeps its caption. |
| 04 How it’s built | **Four services and a stream.** Two simulators publish prices, FX rates and trades to Kafka (Redpanda locally). The risk engine publishes a snapshot every second, and SignalR pushes it to a Next.js dashboard. Marten keeps position events in PostgreSQL, so history replays at up to 60 times speed. |
| 05 Where it stands | **Runs locally with one command.** One Docker command runs the whole stack on your machine. I designed it for under 500 ms from a price change to the dashboard. |
| 06 What’s next | *Measure the latency.* Add a benchmark and publish the result. *Make it easier to see.* Add a recorded replay or a hosted read-only demo. *Stress testing.* Shock a currency or a sector and watch the portfolio react. |
| Meta description (and header lede) | A local simulator for a multi-currency risk platform, where every number on the dashboard shows where it came from and how old it is. |

### Flowtime

| Section | Copy |
| --- | --- |
| Opening | Breaks that match how long you actually focused. · Offline-first interaction · 2026 · Next.js, TypeScript, Service Worker |
| 01 Where it started | **Pomodoro kept cutting me off.** Twenty-five minutes in, the timer would cut me off mid-flow. Flowtime counts up while you focus, then sets a break in proportion. In a browser that has two catches: background tabs slow timers down, and closing the tab loses the session. |
| 02 On paper | **The problem, on paper.** “Practitioners manually time sessions with phone stopwatches, calculate break durations mentally.” The spec’s test: finish a first full cycle within two minutes of landing. · Evidence: 6 timer states · 189 unit tests · ⅕ default break · 2-minute first cycle (the target) |
| 03 Decisions | **Count from a fixed point, and ask instead of guessing.** *Time comes from a timestamp.* A sleeping tab never loses minutes. *The break follows the focus.* It is a fifth by default, adjustable from a third to an eighth. *Every state has a name.* There are six, so the interface always knows what to show. *Ask, don’t assume.* Come back to an unfinished session and Flowtime asks what to do. |
| 03 · The break that follows the focus | Slider: How long you focused. Two rounds, each a Focus and a Break in {n} min: Flowtime (its Focus is the slider’s value) and A Pomodoro (25 min and 5 min). The slider is announced as {focus} minutes of focus, a {break}-minute break (an for a break of 8, 11 or 18). Caption: Flowtime’s break is a fifth of your focus, rounded up to the minute. A Pomodoro is 25 and 5, however the work is going. Without script the figure stays, held at 45 minutes. |
| 04 How it’s built | **Everything stays in your browser.** Sessions, tags, notes and settings live on your device, with a CSV export. A service worker keeps it working offline. It works from the keyboard and announces changes to screen readers. |
| 05 Where it stands | **Used for real.** I use it for my own focused work. |
| 06 What’s next | *Move between devices.* Sync or transfer sessions between devices while keeping local storage as the default. *See when you focus best.* Show the time of day you tend to focus longest. |
| Meta description (and header lede) | A focus timer that counts up, sets breaks in proportion to your focus and keeps your history on your device. |

## Role stories

Shared labels: ← Work · Next role · Evidence. Chapter rail landmark name (not on screen): Story sections. The stories run newest to oldest: BNP Paribas → Joveen → Optegra, which ends on ← Work.

### BNP Paribas

| Part | Copy |
| --- | --- |
| Opening | Software engineer · Risk division · London · Jul 2025 – now |
| 01 Summary | I’m a software engineer in BNP Paribas’s risk division in London. I work in C# on the engines that price and risk-manage trades on CPU and GPU, and I’m the team’s only C# engineer. |
| 02 The role | The engines run large simulation-based calculations across several asset classes. It’s a big codebase, around 70 projects, and some of the C# is translated to run on the GPU. I joined in July 2025 having never written C#. Today I own implementation and delivery on the C# side, from planning through review. |
| 03 The problems | *Market data.* Loaders written in Java had to be ported to C#, pulling data from several sources into one place and checking it on the way. *A stale dependency.* The live pricing pipeline relied on a data file that was no longer reliably available in production. *Quant code.* Pricing code written by quantitative developers had to be integrated into the engine. *Two execution paths.* The same tests had to run on both CPU and GPU. |
| 04 Decisions | *Ship the risky change behind a flag, switched off.* Removing the dependency touched live pricing, so I put the new path behind a feature flag that defaults to off, added caching and wrote an end-to-end test nobody had asked for. The architect’s view was that the thing to protect was the blast radius, not only correctness. I’d have called that a nice-to-have before; now it’s how I start. *Validate the data before trusting it.* The commodity loader was the harder one: ten file types, correlation groups, unit conversions and records linked to each other. I checked the links, so an orphaned record gets caught on load rather than showing up as a strange number in a simulation. *Give AI work phases.* I built a workflow where each stage has its own scoped agent: grill the problem, plan, build test-first, self-review, then a health review. Each agent only sees what that stage needs, which keeps it from skipping ahead. |
| 05 What changed | I used that workflow to integrate a pricer into the calculation engine in a couple of days. For an experienced integration engineer it takes about two weeks, and I was new to it. The bank’s digitisation competition is the other half of this. I led a team of four and co-built a dashboard from our users’ requirements, which cut a 30–40 minute data load to under 5. We won, out of five groups, and presented it to the Head of Risk Systems. · Evidence: Nov 2025 won the bank’s digitisation competition · 6 months from zero C# to production code |
| 06 What I took with me | I was nominated as an AI Champion in the risk division, and the workflow is now used by several teams across the department. I also won a Take Ownership award. The habit underneath all of it: write down what you’re doing before you build it, and ship it so it’s safe to undo. |
| Figures | Under 04 Decisions, the flag figure: Live pricing · today’s path / New path · no stale file · cached · off by default. Caption: Protect the blast radius. Under 05 What changed, two bars to scale: Integrating a pricer (Before · about two weeks, experienced / After · a couple of days, new to it) and The competition dashboard’s data load (Before · 30–40 min / After · under 5 min). Caption: Bars to scale. Two weeks is taken as ten working days. Under 06 What I took with me, the Take Ownership certificate, whole. Caption: Take Ownership · _nology · Q1 2026 · awarded May 2026. Alt: _nology’s Q1 2026 Take Ownership award certificate for Elias Bennett, citing his move into a C# role with no prior experience, production C# in pricing and risk systems, onboarding documentation and a winning digitisation project. |
| Title | Software engineer at BNP Paribas · Elias Bennett |
| Meta description | I’m a software engineer in BNP Paribas’s risk division in London. I work in C# on the engines that price and risk-manage trades on CPU and GPU, and I’m the team’s only C# engineer. |
| Social card | BNP Paribas · Software engineer · ELIAS BENNETT |

### Joveen

| Part | Copy |
| --- | --- |
| Opening | Full stack software engineer · Aug 2024 – Jun 2025 |
| 01 Summary | I was a full stack software engineer at Joveen, working on its e-commerce site in React, Java with Spring Boot and MySQL. |
| 02 The role | I worked across the React front end, the Java API behind it and the MySQL database underneath. I was also on a coding bootcamp alongside the job. |
| 03 The problems | Pages took too long to load. Some modules were still in PHP and had to move to Spring Boot. Layouts and features broke on some phones and browsers, and a key API was slower than it needed to be. |
| 04 Decisions | *Make the front end do less up front.* We refactored React components and lazy-loaded assets, so a page loads what it needs first. *Move PHP to Spring Boot in pieces.* Migrating module by module let us release in smaller steps. I wrote endpoints, validation and tests, and fixed defects along the way. *Test across browsers, then fix.* A cross-browser testing pipeline caught the mobile layout and functionality bugs, and I fixed them. *Measure the database.* We added indexes and rewrote slow queries, starting with the API that mattered most. |
| 05 What changed | Page load fell by 40% once the front end did less up front, and mobile retention rose by 30% after the cross-browser fixes. Indexes and rewritten queries took the key API’s p95 from 520 ms to 230 ms, and deploys went from 10 minutes to under 2. Cloud costs fell by 18%. · Evidence: −40% page load · Under 2 minutes to deploy, down from 10 · +30% mobile retention · 230 ms key API p95, down from 520 ms |
| 06 What I took with me | Alongside the job I did freelance AI training, reviewing 1,000 code items across TypeScript, Python, Java, C# and SQL at 97% QA precision. It was my first sustained work with AI on code, and the start of the thread that leads to the workflow I built at BNP Paribas. |
| Figures | Under 02 The role, the joveen.com homepage hero, desktop beside phone. Link: joveen.com. Alt (desktop): The joveen.com homepage on a desktop: the Joveen wordmark and menu above a hero for CliniCare skincare, with a Shop the Range button and a row of the range’s products. Alt (phone): The same joveen.com hero on a phone, stacked: the CliniCare line, the Shop the Range button and the products. Under 05 What changed, four bars to scale: Page load (After · −40%), Time to deploy (Before · 10 min / After · under 2 min), Mobile retention (After · +30%) and Key API p95 (Before · 520 ms / After · 230 ms). Caption: Bars to scale. A change in per cent is drawn from 100. |
| Title | Full stack software engineer at Joveen · Elias Bennett |
| Meta description | I was a full stack software engineer at Joveen, working on its e-commerce site in React, Java with Spring Boot and MySQL. |
| Social card | Joveen · Full stack software engineer · ELIAS BENNETT |

### Optegra Eye Healthcare & Kensington Medical

| Part | Copy |
| --- | --- |
| Opening | Marketing executive · Sep 2021 – Aug 2024 |
| 01 Summary | I was a marketing executive at Kensington Medical and Optegra Eye Healthcare, and the best part was working with the engineers who built our website. |
| 02 The role | From September 2021 at Kensington Medical, and from October 2022 at Optegra, I did digital marketing: campaign analysis, split tests and analytics dashboards. I also worked with the engineers on the company website, scoping and ticketing fixes. |
| 03 The problems | *Slow, uneven pages.* The Core Web Vitals pass rate was 62%, and page loads were slower than they needed to be. *No clear view of what worked.* We couldn’t easily tell which changes brought in consultations. |
| 04 Decisions | *Scope the fix so it can be built.* I scoped performance fixes with the engineers and ticketed them, so each one was something they could build and I could measure. *Test, then build.* Split tests and analytics dashboards showed which changes helped, and that guided what the engineers worked on next. |
| 05 What changed | The Core Web Vitals pass rate went from 62% to 88%. The p95 page-load time fell by 30%. Consultation conversion rose by 15%. · Evidence: 88% Core Web Vitals pass rate, up from 62% · −30% p95 page load · +15% consultation conversion |
| 06 What I took with me | The click came in early 2024. A friend loved his work so much that even a hectic week sounded exciting, and I wanted that from mine. I started coding in my spare time, just to see, and by August 2024 I was doing it for a living. |
| Figures | Under 02 The role, the Optegra homepage as it was on 5 June 2024. Link: Optegra’s homepage in June 2024, on the Wayback Machine. Alt: The Optegra homepage in June 2024: a sunset beach behind the headline Choose Our Top Rated Eye Hospitals, a booking panel for a free video or telephone consultation, and the Trustpilot and NHS marks. Under 04 Decisions, the dry AMD treatment launch page as it was on 13 June 2024. Link: Optegra’s dry AMD page in June 2024, on the Wayback Machine. Alt: Optegra’s dry AMD treatment page in June 2024: the headline Dry AMD Treatment, Available at our Central London and Manchester Eye Hospitals, Valeda Light Therapy, and a Request a Callback form. Under 05 What changed, three bars to scale: Core Web Vitals pass rate (Before · 62% / After · 88%), p95 page load (After · −30%) and Consultation conversion (After · +15%). Caption: Bars to scale. A change in per cent is drawn from 100. |
| Title | Marketing executive at Optegra Eye Healthcare & Kensington Medical · Elias Bennett |
| Meta description | I was a marketing executive at Kensington Medical and Optegra Eye Healthcare, and the best part was working with the engineers who built our website. |
| Social card | Optegra Eye Healthcare & Kensington Medical · Marketing executive · ELIAS BENNETT |

## Checks

- **Facts:** every claim traces to #103, the CV, `docs/content/CASE-STUDY-SOURCES.md`, or the project specs (Argus `project-spec.md`; Flowtime `project-spec.md`, added 3 January 2026). Threshold’s figures come from the evidence note.
- **Privacy:** BNP Paribas detail stays at CV level; no colleague names, internal system names, or review context. “The team’s only C# engineer” is CV wording.
- **Voice:** plain with character, first person, British spelling, concrete over general, few em-dashes, no corporate phrasing.
