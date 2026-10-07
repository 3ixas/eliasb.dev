# Copy: the Board (#82)

Status: approved by Elias, 2 October 2026, with the staleness limits below.

Covers the personal section's heading, the plain-words label on every pin, the London pin, and the wording for stale and missing pins. #82 builds the framed pinboard, London, and the pin rules; the other pins arrive in #83 to #87 and use the labels fixed here. Their own copy (a clipping's facts, a ticket's score) belongs to those tickets. Rules: plain, concrete, first person, British spelling, no em dashes. Every label should make sense to a stranger who has never met Elias.

## Section

| Element | Copy |
|---|---|
| Kicker | 02 / Library |
| Heading (`h2`) | Some of what I'm into *lately.* |

The kicker now matches the header's "Library" link; the current site says "02 / Outside work". The heading is unchanged.

## Pin labels

Each pin carries one short label in mono capitals, saying what it shows. Where a source matters, it follows a middle dot.

| Pin (ticket) | Label | Notes |
|---|---|---|
| Weekly clipping (#84) | The Weekly Curiosity | The masthead is the label. |
| Making (#87) | Now making | |
| GitHub sheet (#87) | GitHub · the past year | |
| Training (#86) | My training week | Changed from "Training this week · via Strava" on 3 October 2026; see 09-training-log.md |
| Fantasy ticket (#85) | NFL fantasy · Week 3 | The week number is live. |
| London (#82) | Home, London | |
| Culture corner (#83) | The culture corner | The corner's own heading. |
| Book (#83) | Now reading | |
| Film (#83) | Last watched | On the ticket stub: "Admit one · Last watched". |
| Playlist (#83) | On repeat | The cassette player's heading stays "What I'm listening to". |

## London

| Element | Copy |
|---|---|
| Label | Home, London |
| Photo alt text | London skyline from the Thames, with St Paul's Cathedral and the City beyond |
| Clock (accessible name) | The time in London: 14:05 |

The clock face is drawn, so screen readers hear the time once, in 24-hour form, rather than the hands. The time updates each minute; it's the time in London wherever the visitor is.

## Pin states

| State | What shows | Copy |
|---|---|---|
| Nothing current | The pin is taken down, with no gap left | None |
| Stale | The pin looks sun-faded, with a pencilled date under it | as of 12 Sept |
| Missing photo | A blank polaroid in the photo's place | photo coming |

A pin goes stale only when it is showing saved data because its live source couldn't be reached, and that data is older than the pin's natural rhythm: GitHub after 3 days, the book and film after 60. Training, the playlist, Making, London, fantasy, and the clipping never go stale (training since it became an authored plan on 3 October 2026); they are authored, live, or already have their own windows. The limits live in `src/integrations/pin-rules.ts`.

The "as of" date is the day the pin's data was last fresh, written day and short month ("as of 3 Oct", "as of 12 Sept"), the same in every locale. Screen readers hear it as part of the pin: "as of 12 September".

## Changes from the current site

- "02 / Outside work" becomes "02 / Library", matching the navigation.
- The labels change from "Recent building", "Around here", "Training", and "Fantasy football" to the plain-words labels above.
- London's caption "London · home base" becomes the label "Home, London", and the digital time becomes an analogue clock.
- The second heading, "A few things I'm into outside work.", goes; the culture corner's label replaces it in #83.
