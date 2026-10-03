# Copy: the fantasy ticket stub (#85)

Status: approved by Elias, 3 October 2026, with the recommended lines ("shall remain nameless", "Took me to the cleaners."). The first draft was accurate but flat; this one adds a pencilled verdict and matchday-ticket wording.

Covers the NFL matchday ticket stub on the Board: what it says after a week ends, while games are on, between games, and when there's no pin at all. Rules: plain, concrete, British spelling, no em dashes. Light, dry humour is welcome here, as long as it never names the opponent or the league. Example values are real Sleeper data: week 3 is the canvas's, week 4 is the state on Saturday 3 October 2026.

## The stub

The stub has a main part and a torn-off side. The side carries the season record and the source, set sideways as on the canvas. The verdict is a pencilled note beside the result, in the same hand as the GitHub sheet's "busiest stretch" note.

| Element | Copy | Source |
|---|---|---|
| Label | NFL fantasy · Week 3 | Approved in #82; the week is live |
| Result | Won | Or Lost, Tied, Ahead, Behind, Level (see below) |
| Pencilled verdict | Not even close. | Picked by the state and margin (see below) |
| Score | 151.24 – 90.52 | My score first, two decimals as Sleeper gives them |
| Team line | K9 Unit vs. a rival who shall remain nameless | My team name from Sleeper; the opponent is never named |
| Gate line | Gates open Thursday night | Mono, at the foot of the main part; changes with the calendar |
| Side of the stub | 1–2 · Sleeper | Wins–losses, or wins–losses–ties (8–5–1) once there's a tie |

Alternatives for the team line, if "shall remain nameless" is too much: "K9 Unit vs. someone from the league" or "K9 Unit vs. a mate (names withheld)".

The stub isn't a link. Sleeper's league page names the league and every team, so linking to it would undo the anonymity. "Sleeper" on the side credits the source in words only.

## The pencilled verdict

After a week ends, the verdict depends on the margin. A field goal is 3 points, a blowout is 40 or more.

| Result | Margin | Verdict |
|---|---|---|
| Won | 40 or more | Not even close. |
| Won | 3 to 40 | I'll take it. |
| Won | under 3 | By less than a field goal. |
| Lost | under 3 | By less than a field goal. Ouch. |
| Lost | 3 to 40 | There's always next week. |
| Lost | 40 or more | Took me to the cleaners. |
| Tied | 0 | Nobody's happy. |

Alternative for the blowout loss: "Let's not talk about it."

While the week is in play, the verdict depends only on who's ahead:

| Result | Verdict |
|---|---|
| Ahead | Don't jinx it. |
| Behind | Plenty of time. |
| Level | Anyone's game. |

## When it says what

Times follow the NFL calendar in US Eastern time, so they move with the clocks and cover London games without a special case.

| State | When | Result | Score | Gate line |
|---|---|---|---|---|
| Last week | From the end of Monday night's game until Thursday's kickoff | Won / Lost / Tied | Last week's final score | Gates open Thursday night |
| Live | During a game window: Thursday night, Sunday, Monday night | Ahead / Behind / Level | This week's score so far | Live now |
| Between games | Between those windows, mid-week (e.g. Saturday) | Ahead / Behind / Level | This week's score so far | Back on Sunday (or Back on Monday night) |
| Off-season | Pre-season, off-season, and once my season is over | No pin | | |

Worked examples:

- **Tuesday 29 September:** NFL fantasy · Week 3 / Won, *Not even close.* (a 60.72-point margin) / 151.24 – 90.52 / K9 Unit vs. a rival who shall remain nameless / Gates open Thursday night / side: 1–2 · Sleeper.
- **Saturday 3 October:** NFL fantasy · Week 4 / Ahead, *Don't jinx it.* / 24.60 – 0.00 / K9 Unit vs. a rival who shall remain nameless / Back on Sunday / side: 1–2 · Sleeper.

The record on the side counts finished weeks only, so it doesn't change mid-week.

A new week can't show 0.00 – 0.00. Until either side has scored, the stub keeps last week's final result. This replaces the current `0.0 vs 0.0`.

"My season is over" means Sleeper has no matchup for me this week: I've been knocked out of the playoffs, or I've missed them. Nothing replaces the pin. It comes back when next season's week 1 kicks off.

For screen readers, the stub reads as one passage: "NFL fantasy, week 3. K9 Unit won 151.24 to 90.52 against a rival who shall remain nameless. Not even close. Season record: 1 win, 2 losses. Gates open Thursday night." The sideways text and the dashed tear are decoration.

## When Sleeper can't be reached

No new copy and no "as of" date. The approved pin rules say fantasy never goes stale, so the stub never shows an old score as if it were current.

- If the last good fetch is still from the same state (say, last week's final on a Wednesday), it stays up. A final score doesn't change.
- A live score fetched in the last hour also stays up, so the pin doesn't blink off at the start of a window while the 15-minute refresh catches up.
- Otherwise the pin is removed, as any pin with nothing current is.

## Changes from the current site

- "Fantasy football", "Main redraft league" and "Weekly matchup" become the label "NFL fantasy · Week N".
- "My team" and "Opponent" become my team's name and "a rival who shall remain nameless".
- Scores go from one decimal (151.2) to Sleeper's two (151.24).
- The score bars go; the result word and the pencilled verdict say who's ahead and by how much.
- "No matchup just yet", "No current week yet", "Week unavailable" and "No live update from Sleeper" all go. In each of those cases the pin either shows last week's result or isn't there.
- The link to the Sleeper league page goes.
