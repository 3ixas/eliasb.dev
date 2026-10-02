# Copy: Argus Risk, Flowtime, and the work drawer (#81)

Status: approved by Elias, 2 October 2026, with every "What I'd change" point kept.

Covers the Argus Risk and Flowtime case files (same folder template as Threshold, see `03-threshold.md`), the `/work` archive drawer, and the back links between them. Rules: plain, concrete, first person, British spelling, no em dashes. Facts come from each project's repository and README, within the limits in `docs/content/CASE-STUDY-SOURCES.md`: Argus is a local simulator with no real market data, production use, or measured latency; Flowtime's "on your device" means browser storage, not encryption or sync.

## Back links

| Where | Copy | Goes to |
|---|---|---|
| Every case file, top and bottom | ← Back to the drawer | `/work` |
| The drawer | ← Back to the Board | `/#work` |
| Home page, under Work (unchanged from `02-work.md`) | View all work → | `/work` |

## The drawer (`/work`)

| Element | Copy |
|---|---|
| Kicker | Work archive · 3 case files |
| Title (`h1`) | Everything I've built, *filed.* |
| Intro | Each folder is a case study: what was confusing, what I made clear, and how I built it. |
| Folder tab (label tape) | The project name |
| On each folder | Nº 01 · the case file's kicker · the thesis |
| Drawer front label card (decorative, from the signed-off R4Work canvas; added after Elias's review asked for the drawer to read more clearly) | All my work |
| Folder link (accessible name) | Open the Threshold folder (and so on) |
| Visible link text | Open the folder → |
| Page title | Work |
| Description | Case studies of the products I've built: what was confusing, what I made clear, and how. |

## Argus Risk (case file Nº 02, blueprint)

### Header

| Element | Copy |
|---|---|
| Folder tab | ARGUS RISK |
| Kicker | Event-driven systems · Financial simulation · 2026 |
| Thesis (blueprint sticky note) | *Every number shows where it came from and how old it is.* |
| Summary | A risk dashboard shows you a total and expects you to believe it. Argus is a local simulator for a multi-currency risk platform where you can follow a simulated trade through an event stream, into the risk calculations, and onto the dashboard, with the age of every figure in view. |
| Live button | None: there's no hosted version |
| Note beside the Code button | Runs locally with one Docker command. |
| Code button | CODE ↗ |
| Label tape | .NET 8 · Kafka · PostgreSQL · SignalR |
| Pencil note under the screenshot | ↑ portfolio value, P&L, and how fresh each feed is |

### Problem: A total doesn't say how old it is.

A portfolio's value is only as good as the prices and trades behind it. Most dashboards show the total, but not how old it is, which feed it came from, or whether the system is still keeping up.

I wanted to understand that path end to end, so I built a small version of it: simulated prices and trades in five currencies, a risk engine that turns them into portfolio snapshots, and a dashboard that shows them live.

Argus is a simulator. It doesn't use real market data, and it runs on your machine rather than in production.

### Decisions: Show the number with its history.

- **Every change is an event.** Each position change is stored as an event: opened, increased, decreased, reversed, or closed. Replay them and you can see how a position looked at any point in time.
- **Freshness sits next to the value.** Each portfolio value shows connection status, price age, and alerts. If a feed stalls, you can see what failed and how old the number is.
- **The maths is plain functions.** FIFO cost basis, P&L, and Value at Risk take inputs and return results, nothing else. The same inputs always give the same answer, which makes them easy to test and to replay.
- **Check the answer.** A reconciliation run replays the event history and compares checksums with the live state, so drift shows up as a failed check rather than a quietly wrong number.

Figure: positions table. Alt: "Argus Risk positions table with live price and freshness data". Caption: "Open positions, each with its live price and how fresh it is."

### How it's built: Four services and a stream.

Two simulators publish prices, FX rates, and trades to Kafka topics, using Redpanda locally. The risk engine aggregates positions and publishes a snapshot every second, and an ASP.NET Core API pushes each one to a Next.js dashboard over SignalR.

Marten stores the position events in PostgreSQL. Replay plays the history back at 1, 5, 10, or 60 times speed.

OpenTelemetry traces, Prometheus metrics, and Grafana dashboards show what happens when data arrives late. Circuit breakers and staleness checks handle a feed that stops.

One `docker compose up` starts the whole stack. There are 126 .NET tests, and CI runs them alongside the dashboard's type checks and Vitest.

### What I'd change: What I'd do next.

- **Measure the latency.** I designed for under 500 ms from a price change to the dashboard, but I haven't measured it under load. I'd add a benchmark and publish the result.
- **Make it easier to see.** Argus only runs locally, so looking at it means cloning the repo and starting Docker. A recorded replay or a hosted read-only demo would fix that.
- **Stress testing.** I'd add user-defined shocks, so you can see how the portfolio would react to a sudden move in a currency or a sector.

### Metadata

Description: "A local simulator for a multi-currency risk platform, where every number on the dashboard shows where it came from and how old it is."

## Flowtime (case file Nº 03, sage)

### Header

| Element | Copy |
|---|---|
| Folder tab | FLOWTIME |
| Kicker | Offline-first interaction · State design · 2026 |
| Thesis (sage sticky note) | *Breaks that match how long you actually focused.* |
| Summary | A Pomodoro timer decides when you stop. Flowtime counts up while you focus and sets your break in proportion to the time you put in. It keeps accurate time in a background tab, saves everything on your device, and asks what you want to do if you close the tab mid-session. |
| Live button | LIVE SITE ↗ |
| Code button | CODE ↗ |
| Label tape | Next.js · TypeScript · Service Worker |
| Pencil note under the screenshot | ↑ the timer, counting up |

### Problem: A timer that interrupts you, or loses track.

A Pomodoro timer stops you after 25 minutes whether you're stuck or in the middle of something good. The Flowtime technique flips that: you work until you stop, then take a break that fits.

Building that in a browser has two catches. Browsers slow down timers in background tabs, so a timer that counts ticks drifts. And if you close the tab mid-session, the session is gone.

### Decisions: Count from a fixed point, and ask instead of guessing.

- **Time comes from a timestamp.** Flowtime stores when the session started and works out the elapsed time from that, so a sleeping tab never loses minutes.
- **The break follows the focus.** By default the break is a fifth of your focus time, rounded up to the minute. You can set the ratio anywhere from a third to an eighth.
- **Every state has a name.** The timer is always in one of six states: stopped, running, paused, results, break, or break complete. Each is its own type, so the interface always knows what to show.
- **Ask, don't assume.** If you come back to an unfinished session, Flowtime asks what to do rather than deciding for you. After a few minutes away you can pick up where you left off; after longer, you can end the session or discard it.

### How it's built: Everything stays in your browser.

Sessions, tags, notes, and settings live in your browser's storage. There's no account and no backend, and a CSV export lets you take your history with you.

A service worker caches the app, so you can install it and it keeps working offline.

Your history shows a 52-week heatmap, personal records, and week, month, and year views.

The timer works from the keyboard, announces state changes to screen readers, and respects reduced motion. 189 unit tests cover the timer, the break maths, storage, and export.

No second figure: Flowtime has one screenshot, which is the paperclipped one.

### What I'd change: What I'd do next.

- **Move between devices.** Your history lives in one browser. I'd add a way to carry it to another device while keeping local storage as the default.
- **Show when you focus best.** The history shows what you did, not the pattern behind it. I'd add simple insights, like the time of day you tend to focus longest.

### Metadata

Description: "A focus timer that counts up, sets breaks in proportion to your focus, and keeps your history on your device."

## Changes from the current site

- Argus Risk and Flowtime move from the three-chapter page to the four-tab folder; their facts strips and full stack lists go, as Threshold's did.
- Both get a thesis on a sticky note; the Work notes on the home page are unchanged.
- `/work` becomes the drawer: "What I built, and how I approached it." becomes "Everything I've built, filed."
- Case files link back to the drawer instead of Work, following the canvas; the drawer links back to the Board.
