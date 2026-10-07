# Copy: Threshold case file (#80)

Status: approved by Elias, 2 October 2026, with all three "What I'd change" points kept.

Covers the Threshold case-study page as an opened case-file folder: the folder's tab and stamp, the page header, the four divider-tab sections, the screenshots, the links, and the page metadata. Argus Risk and Flowtime follow in #81. Rules: plain, concrete, first person, British spelling, no em dashes. Facts come from the Threshold repository (calculation and affordability functions, city configs, URL state, README); see `docs/content/CASE-STUDY-SOURCES.md`.

## Folder

| Element | Copy |
|---|---|
| Folder tab (label tape) | THRESHOLD |
| Stamp | CASE FILE Nº 01 |
| Back link (until the drawer lands in #81) | ← Back to Work |
| Divider tabs | Problem · Decisions · How it's built · What I'd change |

The arrow is decoration: screen readers hear "Back to Work". In #81 the link becomes "← Back to the drawer", following the canvas.

## Header

| Element | Copy |
|---|---|
| Kicker | Product engineering · Data visualisation · 2026 |
| Title (`h1`) | Threshold |
| Thesis (ochre sticky note) | *A clearer view of what moving could cost.* |
| Summary | Rent calculators tell you the rent. Threshold tells you what it takes to move: the money you need on day one, what you'll spend each month after, and how long it would take to save the difference. It covers London, Basel, and Zurich. |
| Live button | LIVE SITE ↗ |
| Code button | CODE ↗ |
| Label tape | React 19 · TypeScript · MapLibre |
| Pencil note under the screenshot | ↑ the first thing you see when you open it |

## Problem

| Element | Copy |
|---|---|
| Heading (`h2`) | The rent is the easy part. |

Most rent calculators stop at the monthly figure. That's the number everyone asks about, but it isn't what decides whether you can move. Before you get the keys you might need five weeks' deposit in London, or three months' in Switzerland, plus the first month's rent, moving costs, and furniture.

The monthly picture is muddled too. Council tax in London, health insurance in Switzerland, transport that depends on which zone you live in. Each of these is easy to find on its own; the hard part is seeing them together for one flat in one district.

So the question I wanted to answer was simple: can I afford to move, and if not, how long until I can?

## Decisions

| Element | Copy |
|---|---|
| Heading (`h2`) | Two totals and a straight answer. |

**Upfront and monthly stay separate.** Adding them together hides the real problem. You can often afford the monthly costs long before you've saved the upfront ones, so Threshold shows both totals side by side.

**The answer is one of three.** You can move now; not yet, and here's how many months of saving it would take; or your income doesn't cover the monthly costs. I'd rather give a clear answer than a score you have to interpret.

**Each city keeps its own rules.** London, Basel, and Zurich have different deposits, local charges, and transport passes. Threshold doesn't use one set of assumptions for all three, and every default can be changed.

**Suggestions show what would help.** If a cheaper district nearby, a smaller place, or a flatmate would save a meaningful amount each month, Threshold says so and shows how much.

## How it's built

| Element | Copy |
|---|---|
| Heading (`h2`) | The link is the save file. |

Everything you choose lives in the URL: the district, the home, the household, and your income and savings. There's no account and no backend. Copy the link and someone else sees exactly the same scenario, and you can add a second scenario to compare two moves.

The calculations are plain functions with no state of their own, so each one is easy to test. The project has 182 tests, mostly against those functions.

The maps use MapLibre with real boundaries: 33 London boroughs, Zurich's 12 Kreise, and Basel grouped into seven areas. London transport costs follow the TfL zone for each borough.

The cost data is a snapshot from April 2026, taken from sources like the ONS, Numbeo, and the transport operators. Each city shows when its figures were last updated.

## What I'd change

| Element | Copy |
|---|---|
| Heading (`h2`) | What I'd do next. |

- **Keep the data fresh.** The figures are a hand-collected snapshot from April 2026, so they start going stale straight away. I'd move them to a scheduled refresh where the sources allow it.
- **Show the sources in the app.** Each city shows a date, but not where each figure came from. I'd link every default to its source so you can check it.
- **Finer areas in Basel.** Basel is grouped into seven areas rather than its 19 Wohnviertel, which hides real differences in rent.

## Screenshots

| Image | Alt text | Caption |
|---|---|---|
| Landing (paperclipped) | Threshold landing page introducing the real cost of moving out | Pencil note above |
| Calculator | Threshold calculator with a district map and scenario controls | The district map and the choices that drive the estimate. |
| Costs | Threshold results showing upfront and monthly cost breakdowns | Upfront and monthly totals, kept apart. |

## Metadata

| Element | Copy |
|---|---|
| Page title | Threshold |
| Description | A rental calculator for London, Basel, and Zurich that shows what a move really costs: upfront, monthly, and how long until you can afford it. |

## Changes from the current site

- The three chapters ("Frame the decision", "Make assumptions visible", "Share a scenario") become the four divider-tab sections in the spec.
- The page now names the confusion (calculators stop at rent) and what Threshold makes clear (two totals and a three-way answer).
- The facts strip ("3 city models", "2 cost horizons" and so on) is dropped; those facts now sit in the prose where they explain something.
- The full stack list is replaced by three label-tape items, matching Work.
- The canvas's "Back to the drawer" waits for #81; this slice links back to Work.
