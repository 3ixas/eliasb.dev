# Copy: the training pin (#86)

Status: second version, approved by Elias, 3 October 2026, with the recommended note. The first version (approved earlier the same day) counted this week's sessions from Strava. Strava's API now needs a paid subscription, and Bevel and Apple Health have no web API, so there's no source the site can read. This version shows my training week as a plan instead, from the schedule Elias gave. Live counts are an optional post-launch ticket (#94).

Covers the training pin on the Board: the running photo and its caption, and a page from a training diary pinned over its bottom edge with my usual week on it. Rules: plain, concrete, British spelling, no em dashes. Light, dry humour is welcome, but the card only says what I plan to do, never what I did: it's a plan, so it can't go out of date or claim a session happened.

## The photo

Unchanged from the first version.

| Element | Copy | Notes |
|---|---|---|
| Caption | Out on a run, central London. | Italic, under the photo |
| Alt text | Elias mid-run on a rainy street in central London | |

## The diary page

Lined paper with a red rule under the heading, pinned over the photo's bottom edge, as on the canvas.

| Element | Copy | Notes |
|---|---|---|
| Heading | My training week | Replaces "Training this week · via Strava" from #82, since nothing comes from Strava now |
| Right of the heading | The plan | Says plainly it's the plan, not a log |

One row per day, the day in mono capitals and the session in the display face:

| Day | Session |
|---|---|
| Mon | Full-body gym |
| Tue | Zone 2 run |
| Wed | Full-body gym |
| Thu | Interval run |
| Fri | Full-body gym |
| Sat | Zone 2, rower or bike |
| Sun | Assault bike intervals |

### Today

Today's row (London time) gets a pencil loop round the day and a pencilled "← today" beside the session, in the same hand as the fantasy stub's verdict. It's the only thing on the card that changes, and it only says which day it is. When the page is narrow (under about 280 px, as on phones and in the Board's middle column), the loop alone marks today, so each session keeps to one line.

### The pencilled note

One line at the foot of the page, in pencil:

| Note | Notes |
|---|---|
| Zone 2 means slow on purpose. | Recommended: true by definition, and explains the jargon for a stranger |

Alternatives: "Three gym days, four cardio, no days off." (a plain count of the plan), or no note.

### For screen readers

The page reads as one passage, with today first: "My training week, the plan. Today, Saturday: zone 2, rower or bike. Monday: full-body gym. Tuesday: zone 2 run. Wednesday: full-body gym. Thursday: interval run. Friday: full-body gym. Sunday: assault bike intervals. Zone 2 means slow on purpose." The pencil loop and arrow are decoration.

## States

The page is authored, so it has no live, stale or missing states. It's always up, and never sun-faded. The training pin joins the other authored pins (London, Making) as never going stale: `staleAfterDays.training` becomes null.

## Changes from the current site and the spec

- The Strava-driven "Training this week · via Strava" card, its tally marks and its Strava integration go. The Strava runbook goes with them.
- The spec's user stories 39 and 40 (Strava tallies, and a Muay Thai row once sessions are logged) are replaced by this plan. This also brings back a weekly schedule, which the spec listed for removal. Elias chose it on 3 October 2026, and unlike the old one it's labelled as the plan rather than sitting where live data would.
- The pin's label in `05-board.md`, "Training this week · via Strava", becomes "My training week".
