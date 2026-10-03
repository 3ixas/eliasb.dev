# Copy: the training log (#86)

Status: approved by Elias, 3 October 2026, with the pencilled note. The examples were corrected after approval to follow the note's table: 4 lifts and 2 runs make 6 sessions, a "Busy week."

Covers the training pin on the Board: the running photo and its caption, the log card tucked under it with this week's sessions from Strava as tally marks, and what shows when Strava has nothing. Rules: plain, concrete, British spelling, no em dashes. Light, dry humour is welcome, as on the fantasy stub, but it never claims something about a session that the data doesn't say. Example numbers are the canvas's: 4 lifts and 2 runs.

## The photo

| Element | Copy | Notes |
|---|---|---|
| Caption | Out on a run, central London. | The canvas's round 4 line, in italic under the photo |
| Alt text | Elias mid-run on a rainy street in central London | |

The photo is taped to the linen like London's, and the log card is pinned over its bottom edge, as on the canvas.

## The log card

Lined paper with a red rule under the heading, like a page from a training diary.

| Element | Copy | Notes |
|---|---|---|
| Heading | Training this week | Approved in #82 as "Training this week · via Strava"; split as on the canvas |
| Source, right of the heading | via Strava | |
| Row | Lifts · tally marks · 4 | One row per category with sessions |
| Rows, in order | Lifts, Runs, Muay Thai, Other | Muay Thai and Other only once they have sessions |
| Pencilled note | Busy week. | By the week's total (see below); 4 lifts and 2 runs make 6 |

Tally marks go in fives: four strokes and a fifth across them. Past 15 in a row, the marks stop at three gates and the number carries the rest, so a big week doesn't run off the card.

"Other" is anything Strava logs that isn't a lift, a run or Muay Thai (a walk, a swim, a ride).

The week is Monday to Sunday, London time. On Monday morning it starts again from nothing.

### The pencilled note

The note goes by the number of sessions this week, not by how they went. Strava's counts can't say whether a run went well, so nothing here claims it did.

| Sessions this week | Note |
|---|---|
| 0 | Rest days, so far. |
| 1 to 2 | Easing in. |
| 3 to 5 | Steady week. |
| 6 or more | Busy week. |

Alternative, if you'd rather the card stayed plain: no note at all, and a week with nothing logged shows only "Nothing logged yet this week." under the heading.

### For screen readers

The card reads as one sentence: "Training this week, from Strava: 4 lifts and 2 runs. Busy week." The tally marks are decoration. With nothing logged: "Training this week, from Strava: nothing logged yet. Rest days, so far."

## When Strava has nothing

| Situation | What shows |
|---|---|
| Nothing logged yet this week | The card, with no rows and the note "Rest days, so far." |
| Strava couldn't be reached, and this week was fetched earlier | This week's last good counts, as they were |
| Strava couldn't be reached, and this week hasn't been fetched yet | The photo and caption alone; no card |
| No Strava credentials (as in production today) | The photo and caption alone; no card |

Last week's counts are never shown as this week's, so the card can't go stale: at worst it's missing for a while. The 8-day stale limit in `pin-rules.ts` stays as the backstop.

## Changes from the current site

- "Training" with a "Typical week" bar chart becomes the running photo with a log card.
- The authored "My weekly training plan" fallback goes. Without Strava, the photo stands alone rather than showing a typical week as if it were real.
- "Lift" and "Run" bars become "Lifts" and "Runs" tally rows, and empty categories no longer show as zero.
- "Live · this week" and "Week of 28 Sept" go; the heading says "this week".
