# Copy: the GitHub sheet and the Making pin (#87)

Status: approved by Elias, 3 October 2026. He confirmed he's rebuilding Professor Past, and an entry counts as "now" for 8 weeks.

Covers the last two pins on the Board: the GitHub year as a full-width graph-paper sheet, and the Making pin as a blueprint. Rules: plain, concrete, British spelling, no em dashes. Light, dry humour in pencil, as on the fantasy stub and the training plan, but only about what the data shows. Example values are the canvas's: 1,089 contributions, busiest in mid-January.

## The GitHub sheet

A full-width sheet of graph paper taped to the linen, under the culture corner's row.

| Element | Copy | Notes |
|---|---|---|
| Label | GitHub · the past year | Approved in #82 |
| Total | 1,089 | Large, in GitHub's darkest green |
| Beside the total | contributions in the past year | Italic |
| Legend | Quiet ▢▢▢▢▢ Busy | GitHub's five greens, lightest to darkest |
| Link | github.com/3ixas ↗ | My profile |
| Month labels | Oct Nov Dec Jan Feb Mar Apr May June July Aug Sept | Short months as on the "as of" dates, the same in every locale |

### The busiest stretch

A pencil loop round the four weeks with the most contributions, worked out from the data, with a pencilled note beside it:

| Element | Copy | Notes |
|---|---|---|
| Pencilled note | ← busiest stretch, mid-January | "early", "mid" or "late" by the stretch's middle day: 1st to 10th, 11th to 20th, 21st on |

Alternative, with the count: "← busiest stretch: 214 in four weeks". I'd keep the canvas line; the total already carries the number.

### A day's count

Hovering, focusing or tapping a day shows a small pencilled tag beside it:

| Count | Tag |
|---|---|
| 0 | Nothing on Thu 15 Jan |
| 1 | 1 contribution on Thu 15 Jan |
| More | 12 contributions on Thu 15 Jan |

Dates are written by the site, not the browser, so they're the same everywhere and can't cause a hydration mismatch (the current site's fix stays).

### On phones

The year scrolls sideways inside the sheet; the page doesn't. The month labels stay above their weeks as it scrolls.

| Element | Copy |
|---|---|
| Scroll hint, under the sheet on phones | Swipe for the whole year → |

### For screen readers

The sheet is named "GitHub contributions over the past year: 1,089, busiest in mid-January." Each day is a button that reads its tag, and the arrow keys move between days, as now:

| Element | Copy |
|---|---|
| Keyboard hint (screen readers only) | Use the arrow keys to move between days. |

### When GitHub can't be reached

| Situation | What shows |
|---|---|
| A refresh fails | The last good year stays up. After 3 days without a fresh one it's sun-faded with its "as of" date (the approved pin rule) |
| Nothing has been fetched yet | No GitHub pin, rather than a partial year from public events only |

## The Making pin

A blueprint sheet: blue paper with a white grid, a line drawing of the project, and a title block in the corner, as an architect's drawing has.

### What I'm making now

Authored, with a date after which it's no longer "now":

| Element | Copy | Notes |
|---|---|---|
| Label | Now making | Approved in #82 |
| Title | Rebuilding Professor Past from scratch. | The canvas's line |
| Line | v1 is on GitHub if you want to meet the professor. | From the round 2 canvas |
| Link | Code ↗ | `github.com/3ixas/ask-professor-past` |
| Title block | Drawn E.B. · v2 | |
| Drawing | A line drawing of the app's screen | Decoration; no alt text |

Confirmed by Elias: he's rebuilding Professor Past. If that changes, the entry changes with it.

An entry counts as "now" for 8 weeks from the day it's written, so a forgotten one can't sit there for a year. Renew it by changing its date in `src/content/board.ts`.

### When nothing is current

The pin falls back to my most recently pushed public repository, from the GitHub data. My profile repository (`3ixas`) and forks are skipped.

| Element | Copy | Example |
|---|---|---|
| Label | Latest on GitHub | |
| Title | The repository's name | eliasb.dev |
| Line | The repository's own description | Personal site for Elias B. — thoughtful software, projects, experiments, and personal signals. |
| Link | View on GitHub ↗ | |
| Title block | Drawn E.B. · updated 3 Oct | The day it was last pushed |

The description is GitHub's, shown as written, like the clipping's facts. The example above has an em dash in it; I'd rather fix the repository's description on GitHub than rewrite it on the site.

If GitHub can't be reached either, the pin is removed, as any pin with nothing current is.

## Changes from the current site

- "Recent building" with the contribution grid becomes the graph-paper sheet; "I've made 1089 contributions in the past year." becomes the large total.
- "I can't show the full-year calendar just now." goes; without a full year there's no pin.
- The public-events-only fallback ("Pushed to eliasb.dev") goes from the GitHub sheet; the latest repository moves to the Making pin's fallback instead.
- The Making pin is new.
