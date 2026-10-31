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
| Header | Dark theme · ← Work |
| Greeting (header) | Kettle’s on. (05:00 to 11:59) · Nearly five? (12:00 to 16:59 on a weekday) / Nowhere to be? (12:00 to 16:59 on Saturday and Sunday) · Home yet? (17:00 to 21:59) · Still up? (22:00 to 04:59), by the visitor’s own clock and day. Hello before the browser has read it, and without script. Replaced Good morning · Good afternoon · Good evening on 28 October 2026 ([#300](https://github.com/3ixas/eliasb.dev/issues/300)); the edges are from [#180](https://github.com/3ixas/eliasb.dev/issues/180) |
| Footer | Made by Elias |

**404**

- Title: Nothing here
- Heading: This page doesn’t exist.
- Line: It’s moved, or it never did. Everything else is where you left it.
- Missing row: the address asked for (shortened in the middle at about 48 characters), struck through. Its line is Not on file and its metadata is 404.
- Section title: Try one of these
- Section note: The homepage, a section at a time.

The five homepage sections as rows, each with that section’s own object ([#334](https://github.com/3ixas/eliasb.dev/issues/334)). Each line restates what the section already shows:

| Section | Line |
| --- | --- |
| Work | BNP Paribas, Joveen and Optegra |
| Things I make | Threshold, Argus Risk, Flowtime and more |
| How I work | Four habits, and the proof for each |
| Off the clock | Training, a book, a film, this week in history |
| Say hello | The email, the résumé, GitHub and LinkedIn |

The lost-property tag, the “Or try” lead-in and the numbered rows retired with the quiet index ([#301](https://github.com/3ixas/eliasb.dev/issues/301)).

## Hero

- Role line, plain text under the name: Software Engineer
- Label on the portrait: Based in London
- Headline: I build pricing and risk engines at BNP Paribas, and *products of my own.*
- Supporting line: In C# and Java, on CPU and GPU. I’ve won the bank’s digitisation competition and a Take Ownership award.
- Buttons: See my work ↓ · Say hello

The First glance changed for the forward-facing redesign ([#159](https://github.com/3ixas/eliasb.dev/issues/159), [#162](https://github.com/3ixas/eliasb.dev/issues/162), [#168](https://github.com/3ixas/eliasb.dev/issues/168)): the entrance is built around “*products of my own.*” landing.

> **Leaves with this section** when the quiet index replaces it: the role line, the portrait label as a sticker (its words stay, as the portrait’s caption), the supporting line (rewritten under The quiet index homepage) and See my work ↓.

## Work

The homepage section straight after the hero, led by employment ([#157](https://github.com/3ixas/eliasb.dev/issues/157), [#175](https://github.com/3ixas/eliasb.dev/issues/175)). Proof copy approved by Elias on 16 October 2026. Nothing here repeats the First glance’s wording.

- Heading: Work

### Where I’m headed

Three strands (#211, settled on the map on 16 October 2026), shown as rows. Each says what “good” means; its “So far” is its closer look, and restates a fact already in a Role story or Case study, checked by `verify:copy`. The Optegra line says “guided”, as the Optegra Role story does (the prototype said “decided”).

- Heading: Where I’m headed
- Tag: So far

| Bar | Title | So far | Link |
| --- | --- | --- | --- |
| Judgement | Knowing what’s worth building. | At Optegra, split tests and dashboards guided what the engineers built next. | The Optegra story → |
| Depth | Knowing why it works, not just that it does. | Six months from zero C# to production code, in a pricing engine of around 70 projects. | The BNP Paribas story → |
| Range | The whole way, from idea to running in production. | Threshold, from 57 user stories to a live site. | The Threshold case study → |

### How I got here

The employers are rows (role and dates from their Role stories). What is text of its own is the note under the Work heading (#210).

- Note: History, then marketing, then code. Each move was towards the work I liked most.

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

> **Leaves with this section** when the quiet index replaces it: the intro’s second sentence and the note “06 things I’ve built · 03 I’m proudest of”. Argus Risk’s and Home Secretary’s lines are rewritten on the homepage only; the inner pages keep today’s.

## How I work

- Heading: How I work
- Note: Three habits, and where I picked them up.

| Beat | Proof |
| --- | --- |
| **Start from a real problem.** | Threshold started because my friends had no clear idea what renting would cost by area. Flowtime started because Pomodoro kept cutting me off mid-flow. |
| **Write it down first.** | Before I build, I write down the problem, who it’s for, and what’s out of scope. Threshold had 57 user stories before any code. |
| **Measure whether it works.** | I learned this in marketing, running split tests and conversion dashboards. At BNP Paribas I co-built a dashboard from users’ requirements that cut a 30–40 minute data load to under 5. |

- PRD card caption: Threshold’s PRD, 16 April 2026

> **Leaves with this section** when the quiet index replaces it: the note “Three habits, and where I picked them up.” and the Measure proof, both rewritten for four habits.

## Off the clock

- Heading: Off the clock
- Note: What my own time looks like this week.

| Item | Live | When the source is empty |
| --- | --- | --- |
| Training | Today · {Thursday} / {Interval run} · My training week · Zone 2 means slow on purpose. · Photo caption: Out on a run, central London. · Photo alt: Elias mid-run on a rainy street in central London | Authored, so never empty. |
| Now reading | Now reading · {title} · {author} · Goodreads ↗ | Between books. |
| Last watched | Admit one · Last watched · {title} · {year} · Letterboxd ↗ | Nothing logged yet. |
| The Weekly Curiosity | Odd but true, from this week in history · {3} things that happened this week, some stranger than others. · This week in history · {fact} · {year} · {1} of {3} · Live from Wikipedia | From the archive |
| Now making | ● Now making · {project or repository name} · {GitHub description, when it has one} · View on GitHub ↗ (a project with a case study links its name to the case study instead) | Hidden when GitHub can’t be reached |
| GitHub | {1,221} contributions in the past year · Less / More / today · Live from GitHub | From GitHub, as of {date} |

Strings added while building, shipped, and recorded here on 2026-10-09 so `verify:copy` covers them. They were not in the original approved copy; Elias signed them off on 2026-10-09.

- Training week plan: Mon Monday Full-body gym · Tue Tuesday Zone 2 run · Wed Wednesday Full-body gym · Thu Thursday Interval run · Fri Friday Full-body gym · Sat Saturday Zone 2, rower or bike · Sun Sunday Assault bike intervals
- Weekly Curiosity: Image:
- GitHub: GitHub, the past year · Use the arrow keys to move between days.

> **Leaves with this section** when the quiet index replaces it: the training row’s “Today · {Thursday}” and “My training week” (now one line), “Zone 2 means slow on purpose.”, Admit one as a row label (it stays on the film’s closer look), and the clipping’s Read on Wikipedia and Read more links (a closer look has no links).

## Say hello

- The email action is also the section heading; no separate repeated heading.
- Big link: Say hello ↗
- Line: Got an idea, a project, or just want to talk about building things? Email’s the best way to reach me.
- Links: Résumé · GitHub · LinkedIn
- Résumé opens `/resume`, the sheet built from the site’s own records, with the internal → arrow ([#247](https://github.com/3ixas/eliasb.dev/issues/247)).

> **Leaves with this section** when the quiet index replaces it: the big Say hello ↗ link and the line under it. The new heading has no line after it.

## The quiet index homepage

The quiet index homepage’s copy, merged from the copy deck (`docs/content/quiet-index-copy.md`, [#281](https://github.com/3ixas/eliasb.dev/issues/281)) for [#289](https://github.com/3ixas/eliasb.dev/issues/289). Elias agreed it on 26 October 2026; the deck keeps the research and decisions behind it. Layout is in `docs/design/DESIGN.md`.

It sits beside today’s homepage copy above rather than replacing it, so today’s homepage still passes `verify:copy`. Each section ticket of [#288](https://github.com/3ixas/eliasb.dev/issues/288) takes its copy from here, and removes the strings marked **Leaves with this section** above when it changes that section. A retired string stays wherever an inner page still uses it.

The markers cover the deck’s retired list and the old wording of rows it marks *changed*. A string the deck doesn’t mention is its section ticket’s to decide, with Elias. A *kept* row that points to today’s section relies on that string staying there, so a ticket that clears an old section moves those strings here first.

**Status:** *kept* is approved copy used as it is; *moved* is approved copy in a new place; *changed* is a rewrite; *new* is a string the old homepage didn’t have. `{braces}` are live values.

### Quiet index · Site-wide

| Where | Copy | Status |
| --- | --- | --- |
| Page title, meta description, social image | As in Site-wide at the top of this file | kept |
| Header links (desktop) | Work · Things I make · How I work · Off the clock · Say hello | kept (the Menu entries) |
| Theme button name | Dark theme | kept |
| Header links, landmark name (not on screen) | On this page | new: the design contract names the navigation landmark |
| Greeting | Good morning · Good afternoon · Good evening · Still up? (Hello before script) | kept |
| Greeting, on hover | it’s {14:28} here in London | new: London’s time, from Elias’s side of the screen |
| Footer | Made by Elias | kept |

### Quiet index · Opening

| Where | Copy | Status |
| --- | --- | --- |
| Opening line (`h1`) | I build pricing and risk engines at BNP Paribas, and *products of my own.* | kept |
| Supporting line | I’m the team’s only C# engineer, and the engines run on CPU and GPU. I’ve won the bank’s digitisation competition and a Take Ownership award. | changed: leads with the concrete fact; “Early Careers” dropped, because it read as a graduate scheme (agreed 26 October 2026) |
| Portrait caption (closer look) | Based in London | moved, from the portrait label |

### Quiet index · Work

| Where | Copy | Status |
| --- | --- | --- |
| Note | History, then marketing, then code. Each move was towards the work I liked most. | kept |
| BNP Paribas row | Software engineer · Jul 2025 – now | kept (from the Role story) |
| BNP Paribas closer look | The pass, then: I was nominated as an AI Champion, and the workflow I built is now used by several teams across the department. · With that workflow I integrated a pricer in a couple of days, a job that takes an experienced engineer about two weeks. | moved, from Now’s proofs |
| Joveen row | Full stack software engineer · Aug 2024 – Jun 2025 | kept |
| Joveen closer look | The pass, then three points, each a bold result and its cause: **Page load, cut by 40%** · Cut page load by 40% by refactoring React components and lazy-loading assets. **Key API p95, 520 ms → 230 ms** · Added indexes and rewrote slow queries, starting with the API that mattered most. **Mobile retention, up 30%** · Fixed mobile layout and browser bugs found by a cross-browser testing pipeline. | changed: the bare “−40% page load” becomes three explained results, in the form of BNP’s pins (#283) |
| Optegra row | Marketing executive · Sep 2021 – Aug 2024 | kept |
| Optegra closer look | The pass, then: **Core Web Vitals pass rate, 62% → 88%** · Scoped performance fixes with the engineers and ticketed them. **p95 page load, cut by 30%** · The same scoped, ticketed fixes. **Where the switch started** · The best part of the job was working with the engineers who built our website. | changed: three points (#283). Its 15% conversion is How I work’s Measure proof, so it isn’t repeated here |
| Where I’m headed: heading and line | Where I’m headed · Building a whole product well: what to make, why it works, and getting it to production. How far I’ve got on each. | changed: the aim as a job, not a feeling (#283) |
| Strand rows (title · line) | Knowing what’s worth building. · Judgement · Knowing why it works, not just that it does. · Depth · The whole way, from idea to running in production. · Range | kept (the bars’ titles and labels) |
| Strand closer looks | So far · {Optegra / BNP Paribas / Threshold}, then its “So far” line from today’s Where I’m headed | kept |

### Quiet index · Things I make

| Where | Copy | Status |
| --- | --- | --- |
| Note | Products of my own, from a rental calculator to a risk simulator. | moved, from the Work archive’s description (agreed 26 October 2026) |
| Argus Risk row | A risk simulator where every number shows its source and age. | changed: says what it is first (#283) |
| Project rows (outcome · year) | As approved: A clearer view of what moving could cost. · Breaks that match how long you actually focused. · A tested C# Web API for managing risk events. · History you can talk to. Version 1; I’m rebuilding it. | kept |
| Home Secretary row | A household coordination prototype, built for coursework. | changed: the old line wrapped to two lines in a row; “software engineering” is already implied by the section |
| Project closer look | {type} · {year} under the screenshot | kept (the tiles’ metadata) |
| Archive link | Everything I’ve built ({06}) → | kept |
| Phone cards | {name} · {outcome} | kept |

### Quiet index · How I work

| Where | Copy | Status |
| --- | --- | --- |
| Note | Four habits, and where I picked them up. | changed: four habits (#284) |
| Start from a real problem. | As in today’s How I work section, underlining “no clear idea” | kept |
| Write it down first. | As in today’s How I work section, underlining “57 user stories” | kept |
| Ship it so it’s safe to undo. | At BNP Paribas, taking a stale data dependency out of live pricing, I put the new path behind a feature flag that defaults to off, with caching and an end-to-end test nobody had asked for. Underline: “defaults to off” | new: Elias’s own line from the BNP Role story (#284) |
| Measure whether it works. | I learned this in marketing. At Optegra, split tests and analytics dashboards showed which changes brought in consultations and guided what the engineers built next; consultation conversion rose by 15%. Underline: “rose by 15%” | changed: a real measurement rather than a speed-up (#284); the competition dashboard stays in the award’s closer look |
| PRD row | Threshold’s PRD · 16 April 2026 | kept (today’s PRD card caption; the · separates the row’s parts) |
| PRD closer look | Threshold’s PRD quote from its case study, typed, and its caption | kept |

### Quiet index · The reveal words in the opening

| Word | Closer look caption | Status |
| --- | --- | --- |
| pricing and risk engines | The engines run large simulation-based calculations across several asset classes. | kept. The line "Illustrative paths, not real prices." was removed on 31 October 2026 ([#349](https://github.com/3ixas/eliasb.dev/issues/349)) |
| CPU and GPU | The same tests had to run on both CPU and GPU. | kept (from the Role story) |
| digitisation competition | Winner · Digitisation · 2025, then: Led a team of four to win the bank’s digitisation competition, co-building a dashboard that cut a 30–40 minute data load to under 5. Bars: **30–40 min** · **Under 5** | changed: the Résumé line without “Early Careers”; the bar labels are new |
| Take Ownership award | Take Ownership · _nology · Q1 2026 · awarded May 2026 | kept (the certificate’s caption) |

The engines' look is also described as: “Illustrative simulated paths fanning out from one level, with one highlighted in green.” Screen readers read it with the caption; nothing shows it on screen.

### Quiet index · Off the clock

| Where | Copy | Status |
| --- | --- | --- |
| Note | What my own time looks like this week. | kept |
| GitHub year | GitHub, the past year · {1,726} contributions in the past year · Less / More · {12} contributions on {3 June} | kept (the sketch said “last year”); “Less / More” replaces “Quiet / Busy” to match GitHub’s own key |
| Training row | {Assault bike intervals} · Today’s session, from my training week | changed: replaces the sketch’s “Today, from my training week” |
| Training row, before today is known | My training week (no line) | new: until the browser tells the page what day it is, and when there is no script, the row shows the plan's name and nothing under it. The name was already approved |
| Training closer look | The week, today in cobalt · Out on a run, central London. | changed: “Zone 2 means slow on purpose.” is dropped (Elias, 28 October 2026) |
| Source marks (live) | Live from Goodreads · Live from Letterboxd · Live from GitHub · Live from Wikipedia | new |
| Source marks (saved data gone stale) | From Goodreads, as of {date} (and so on) | new: built on the approved “as of {date}” |
| Book row | {Dark Age} · Now reading · {Pierce Brown} | kept |
| Book fallback | Between books. | kept |
| Film row | {Kiss Kiss Bang Bang} · Last watched {9 Oct} · {★★★½} | kept |
| Film fallback | Nothing logged yet. | kept |
| Film closer look | Admit one · {title} · {year} · Watched {9 Oct} · {stars} | kept |
| History row title | Odd but true, from this week in history | kept |
| History row line | {3} things that happened this week, some stranger than others. | new: says it’s weekly and meant to be fun, using only live values |
| History closer look | The clipping stamped **This week in history**, then {date}, {fact}, the image credit, and **{1} of {3}** | changed: “{n} more oddities this week ↓” becomes a count, because clicking the row now cycles them in place |
| History fallback | From the archive | kept |
| Now making row | {eliasb.dev} · Now making · Live from GitHub (the description is in the closer look) | changed: the description is said once, in the look |

### Quiet index · Say hello

| Where | Copy | Status |
| --- | --- | --- |
| Heading | Say hello, with no line after it: the email and its Copy button are the line | changed: none of 21 experienced engineers’ sites asks the reader a question (#283) |
| Email | {eliasthebennett@gmail.com} · Copy → Copied | new (the copy button) |
| Links | Résumé → · GitHub ↗ · LinkedIn ↗ | kept |

**Not drafted:** a “what to write to me about” line in Say hello. It would need Elias to say what he wants to hear about.

**Excluded:** Joveen’s deploy time, because the Role story records no cause for it.

## Work archive (`/things-i-make`)

- Heading: Things I make
- Note: Everything I’ve built that I’d happily talk through.
- Filters, after 10 projects: All · Products · Systems · Experiments
- Meta description: Products of my own, from a rental calculator to a risk simulator, with the thinking behind the main ones.

## Case studies

Voice rule: frame everything positively. Say what exists and what I did, and what I want to do next; do not say what is missing, unfinished or unmeasured (no "not launched", "not measured yet", "I haven’t…"). What is next belongs in "What’s next".

Shared labels: ← Things I make · Live site ↗ · Code ↗ · Next project · From the PRD. The header’s section links are the short labels below (On paper, What’s next), so the six fit one row of the column; a section’s own title is its bold line. Row numbers 01–06 are this deck’s, not the page’s.

### Threshold

| Section | Copy |
| --- | --- |
| Opening | A clearer view of what moving could cost. · Product · Data visualisation · 2026 · React 19, TypeScript, MapLibre |
| 01 Where it started | **The rent is the easy part.** My friends had no clear idea what renting would cost by area, and one of them was about to move to Switzerland. Most rent calculators stop at the monthly figure. Before you get the keys you might need five weeks’ deposit in London, or three months’ in Switzerland, plus the first month’s rent, moving costs, and furniture. Can I afford to move, and if not, how long until I can? |
| 02 On paper | **The problem, on paper.** “People in their 20s and 30s make the decision to move out … without a clear, honest view of what it will actually cost.” · Evidence: 57 user stories · 13 slices, built in a day · 182 tests · 3 cities |
| 03 Decisions | **Two totals and a straight answer.** *Upfront and monthly stay separate.* You can often afford the monthly costs long before you’ve saved the upfront ones. *The answer is one of three.* Move now; not yet, and how many months of saving; or your income doesn’t cover the monthly costs. *Each city keeps its own rules.* Different deposits, local charges, and transport passes, and every default can be changed. *Suggestions show what would help.* A cheaper district, a smaller place, or a flatmate, and how much each would save. |
| 04 How it’s built | **The link is the save file.** Everything you choose lives in the URL: no account, no backend. The calculations are plain functions with no state of their own, covered by 182 tests. The maps use real boundaries: 33 London boroughs, Zurich’s 12 Kreise, and Basel in seven areas. |
| 05 Where it stands | **Used for real.** I used it during my own flat hunt, and friends have used it too. |
| 06 What’s next | *Keep the data fresh.* Move the April 2026 snapshot to a scheduled refresh where the sources allow it. *Show the sources in the app.* Link every default to its source. *Finer areas in Basel.* Use its 19 Wohnviertel rather than seven areas. |
| Meta description | A rental calculator for London, Basel, and Zurich that shows what a move really costs: upfront, monthly, and how long until you can afford it. |

### Argus Risk

| Section | Copy |
| --- | --- |
| Opening | Every number shows where it came from and how old it is. · Event-driven systems · 2026 · .NET 8, Kafka, PostgreSQL, SignalR · Runs locally with one Docker command. |
| 01 Where it started | **A total doesn’t say how old it is.** I built this one on purpose. I work on pricing and risk systems, and I wanted to build a small version of that world end to end, with a front end that makes it easy to see. Most risk dashboards show a portfolio’s value, but not how old it is, which feed it came from, or whether the system is keeping up. Argus is a simulator: no real market data, and it runs on your machine. |
| 02 On paper | **Two users, on paper.** The spec names the simulated user, a risk or portfolio manager, and the real audience: “hiring managers and engineers at banks, hedge funds, and trading firms”. · Evidence: 5 currencies · 4 services · 126 .NET tests · 1 command to run it |
| 03 Decisions | **Show the number with its history.** *Every change is an event.* Replay them and you can see any position at any point in time. *Freshness sits next to the value.* If a feed stalls, you see what failed and how old the number is. *The maths is plain functions.* FIFO cost basis, P&L, and Value at Risk: same inputs, same answer. *Check the answer.* A reconciliation run replays history and compares it with the live state. |
| 04 How it’s built | **Four services and a stream.** Two simulators publish prices, FX rates, and trades to Kafka (Redpanda locally). The risk engine publishes a snapshot every second, and SignalR pushes it to a Next.js dashboard. Marten keeps position events in PostgreSQL, so history replays at up to 60 times speed. |
| 05 Where it stands | **Runs locally with one command.** One Docker command runs the whole stack on your machine. I designed it for under 500 ms from a price change to the dashboard. |
| 06 What’s next | *Measure the latency.* Add a benchmark and publish the result. *Make it easier to see.* A recorded replay or a hosted read-only demo. *Stress testing.* Let you shock a currency or a sector and watch the portfolio react. |
| Meta description | A local simulator for a multi-currency risk platform, where every number on the dashboard shows where it came from and how old it is. |

### Flowtime

| Section | Copy |
| --- | --- |
| Opening | Breaks that match how long you actually focused. · Offline-first interaction · 2026 · Next.js, TypeScript, Service Worker |
| 01 Where it started | **Pomodoro kept cutting me off.** Twenty-five minutes in, the timer would cut me off mid-flow. Flowtime counts up while you focus, then sets a break in proportion. In a browser that has two catches: background tabs slow timers down, and closing the tab loses the session. |
| 02 On paper | **The problem, on paper.** “Practitioners manually time sessions with phone stopwatches, calculate break durations mentally.” The spec’s test: finish a first full cycle within two minutes of landing. · Evidence: 6 timer states · 189 unit tests · ⅕ default break · 2-minute first cycle (the target) |
| 03 Decisions | **Count from a fixed point, and ask instead of guessing.** *Time comes from a timestamp,* so a sleeping tab never loses minutes. *The break follows the focus:* a fifth by default, adjustable from a third to an eighth. *Every state has a name:* six of them, so the interface always knows what to show. *Ask, don’t assume:* come back to an unfinished session and Flowtime asks what to do. |
| 04 How it’s built | **Everything stays in your browser.** Sessions, tags, notes, and settings live on your device, with a CSV export. A service worker keeps it working offline. It works from the keyboard and announces changes to screen readers. |
| 05 Where it stands | **Used for my own focus.** I use it for my own focused work, and friends have used it too. |
| 06 What’s next | *Move between devices,* keeping local storage as the default. *Show when you focus best,* like the time of day you tend to focus longest. |
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
| 05 What changed | I used that workflow to integrate a pricer into the calculation engine in a couple of days. For an experienced integration engineer it takes about two weeks, and I was new to it. I went from no C# to shipping production code independently in six months. The bank’s digitisation competition is the other half of this. I led a team of four and co-built a dashboard from our users’ requirements, which cut a 30–40 minute data load to under 5. We won, out of five groups, and presented it to the Head of Risk Systems. · Evidence: Nov 2025 won the bank’s digitisation competition · 6 months from zero C# to production code |
| 06 What I took with me | I was nominated as an AI Champion in the risk division, and the workflow is now used by several teams across the department. I also won a Take Ownership award. The habit underneath all of it is simple: write down what you’re doing before you build it, and ship it so it’s safe to undo. |
| Figures (#213) | Under 04 Decisions, the flag figure: Live pricing · today’s path · on / New path · no stale file · cached · off by default. Caption: Protect the blast radius. Under 05 What changed, two bars to scale: Integrating a pricer (Before · about two weeks, experienced / After · a couple of days, new to it) and The competition dashboard’s data load (Before · 30–40 min / After · under 5 min). Caption: Bars to scale. Two weeks is taken as ten working days. Under 06 What I took with me, the Take Ownership certificate, whole. Caption: Take Ownership · _nology · Q1 2026 · awarded May 2026. Alt: _nology’s Q1 2026 Take Ownership award certificate for Elias Bennett, citing his move into a C# role with no prior experience, production C# in pricing and risk systems, onboarding documentation and a winning digitisation project. |
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
| Figures (#214) | Under 02 The role, the joveen.com homepage hero, desktop beside phone. No caption, only the link: joveen.com. Alt (desktop): The joveen.com homepage on a desktop: the Joveen wordmark and menu above a hero for CliniCare skincare, with a Shop the Range button and a row of the range’s products. Alt (phone): The same joveen.com hero on a phone, stacked: the CliniCare line, the Shop the Range button and the products. |
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
| Figures (#214) | Under 02 The role, the Optegra homepage as it was on 5 June 2024. No caption, only the link, in plain words: Optegra’s homepage in June 2024, on the Wayback Machine (to web.archive.org/web/20240605112227/https://www.optegra.com/). Alt: The Optegra homepage in June 2024: a sunset beach behind the headline Choose Our Top Rated Eye Hospitals, a booking panel for a free video or telephone consultation, and the Trustpilot and NHS marks. Under 05 What changed, the dry AMD treatment launch page as it was on 13 June 2024. No caption, only the link, in plain words: Optegra’s dry AMD page in June 2024, on the Wayback Machine (to web.archive.org/web/20240613032246/https://www.optegra.com/dry-amd-treatment/). Alt: Optegra’s dry AMD treatment page in June 2024: the headline Dry AMD Treatment, Available at our Central London and Manchester Eye Hospitals, Valeda Light Therapy, and a Request a Callback form. |
| Title | Marketing executive at Optegra Eye Healthcare & Kensington Medical · Elias Bennett |
| Meta description | I was a marketing executive across two healthcare providers: private, at Kensington Medical, and NHS work through Optegra Eye Healthcare. The best part of the job was working with the engineers who built our website. |
| Social card | Optegra Eye Healthcare & Kensington Medical · Marketing executive · ELIAS BENNETT |

## Checks

- **Facts:** every claim traces to #103, the CV, `src/content/case-files.ts`, or the project specs (Argus `project-spec.md`; Flowtime `project-spec.md`, added 3 January 2026). Threshold’s figures come from the evidence note.
- **Privacy:** BNP Paribas detail stays at CV level; no colleague names, internal system names, or review context. “The team’s only C# engineer” is CV wording.
- **Voice:** British spelling, plain verbs, few em-dashes, at most one light touch of humour per section.
