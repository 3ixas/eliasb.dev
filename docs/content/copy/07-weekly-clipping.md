# Copy: the Weekly Curiosity (#84)

Status: approved by Elias, 2 October 2026. He chose the strapline and the open fan-out button, and left the dateline and source link to my recommendation.

Covers the newspaper clipping on the Board: its masthead and dateline, the main oddity, the two more that fan out, image credits, the source link, and what shows when Wikimedia can't be reached. Rules: plain, concrete, first person where there's a person at all, British spelling, no em dashes. Example values are the canvas's (week of 28 September 2026).

## The clipping

| Element | Copy | Source |
|---|---|---|
| Masthead | The Weekly Curiosity | Approved in #82 as the pin's label |
| Strapline | Odd but true, from this week in history | |
| Dateline, left | Vol. 2026 · No. 40 | The year, and the week's number in the year |
| Dateline, middle | Week of 28 Sept | The Monday the week starts |
| Dateline, right | Price: one click | |
| Stamp | Strange but true | The issue |
| The fact | The first aerial circumnavigation is completed by a team from the US Army. | Wikipedia's own sentence, unedited |
| Date line | 28 September 1924 | The week's Monday, in the event's year |
| Date line, for a birth | Born 28 September 1866 | |
| Image credit | Image: The Museum of Flight · Public domain | Commons: creator and licence |
| Fan-out button, closed | 2 more oddities this week | |
| Fan-out button, open | Fold them away | |
| Link on each fact | Read on Wikipedia ↗ | The event's own Wikipedia article |
| Source link | More from 28 September on Wikipedia ↗ | The readable Wikipedia page for the day, e.g. `en.wikipedia.org/wiki/September_28` |

The facts stay in Wikipedia's words. I don't rewrite them, so they stay accurate and match the page they link to.

The credit's creator links to the image's Commons page and the licence links to the licence. A clipping without a suitable image shows no picture and no credit, rather than a placeholder.

The two extra clippings are smaller cuttings with the same parts: date line, fact, image and credit if there is one, and their own "Read on Wikipedia" link. They have no masthead or stamp.

For screen readers, the fan-out button says whether the extra clippings are showing, and the arrow on it (↓ closed, ↑ open) is decoration.

The two extra clippings open below the main one on every screen (changed in #87, 3 October 2026), so they never cover the pins beside it.

## When Wikimedia can't be reached

The weekly snapshot and its failure handling stay as they are. Once a week's clippings are fetched, a failed refresh later that week keeps them up. Last week's clippings are never shown as this week's, so if the new week's first fetch fails, the saved oddities show until a fetch works:

| Element | Copy |
|---|---|
| Dateline, middle | From the archive |
| Date line | The year only (1783, 1933, 2003): the saved facts are from different days |
| Source link | Browse history on Wikipedia ↗ (the Wikipedia history portal, as now) |
| Link on each fact | Read more ↗ (the saved facts link to their own sources: the Smithsonian, CMLL and NASA, not Wikipedia) |

Everything else (masthead, stamp, fan-out) is the same. The saved oddities are the three already in the code: the sheep, duck and rooster balloon flight (1783), the founding of Mexican wrestling's CMLL (1933), and Galileo's dive into Jupiter (2003).

## Changes from the current site

- The "History" section heading and "This week in history" heading go; the masthead replaces them.
- "Week of 28 September 2026" becomes the dateline "Week of 28 Sept".
- "On this day" and "Born" labels above each fact become the date line under it.
- "Read the record" becomes "Read on Wikipedia".
- "View this week's Wikimedia events", which opened raw JSON, becomes a link to the readable Wikipedia page for the day.
- The image credit's separate "Commons" link folds into the creator's name.
- Three facts shown at once become one, with the other two fanning out.
