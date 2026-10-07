# Copy: the 404, the social image, the favicon, and metadata (#90)

Status: approved by Elias, 6 October 2026, with "Elias Bennett" as the site name.

Covers what people see outside the page itself: the not-found page, the image when a link is shared, the browser-tab icon, and every route's title and description. Rules: plain, first person, British spelling, no em dashes. The 404 and social image are the canvas's (`R4Extras`); the metadata is new.

## The 404

An empty space on the linen board where something used to be pinned: a dashed outline, the pin still in the board, and a torn corner of paper caught under it.

| Element | Copy | Notes |
|---|---|---|
| Stamp | 404 | Red, at an angle; decoration, as the heading says it |
| Heading (`h1`) | Something was pinned here. | |
| Line | It's been taken down, or it was never up. The rest of the board is still here. | |
| Link | Back to the board → | To the home page |
| Page title | Nothing pinned here · Elias Bennett | |

## The social image

What shows when someone shares a link to the site: the wall, with the opening headline on a pinned card and my mark in the corner.

| Element | Copy | Notes |
|---|---|---|
| Card | I build everyday software, and make complicated things *feel simple.* | The hero headline, "feel simple." in the accent |
| Mark | E/B | Bottom right, with the orange slash |
| Alt text | A card pinned to a wall reading "I build everyday software, and make complicated things feel simple." | |

Work and the case studies keep their own screenshots as their social images (from #80 and #81).

## The favicon

A red pushpin on the wall's colour, as on the canvas, with a darker tile for dark browser tabs. No words.

## Metadata

| Route | Title | Description |
|---|---|---|
| Home | Elias Bennett, software engineer in London | I'm Elias, a software engineer in London. I build everyday software, and make complicated things feel simple. Here's my work, a few things I'm into, and how I got here. |
| Work | Work · Elias Bennett | Unchanged: approved in #81 |
| Each case study | Threshold · Elias Bennett (and so on) | Unchanged: approved in #80 and #81 |
| 404 | Nothing pinned here · Elias Bennett | None (not indexed) |

| Element | Copy | Notes |
|---|---|---|
| Title pattern | (page) · Elias Bennett | Was "(page) · Elias B." |
| Site name (when shared) | Elias Bennett | Was "Elias B." |

Decided: the full name everywhere. The hero, the kicker and the footer all say Elias Bennett, and a stranger sharing the site sees who it is.

## Changes from the current site

- The home title "Elias Bennett | Software engineer and product builder" becomes "Elias Bennett, software engineer in London". "Product builder" goes; the headline says what I build.
- The description "…I take ideas through design, full-stack development, and iteration, aiming to make useful, enjoyable products." becomes the headline plus what's on the page.
- The social image changes from the dark card with "Projects I'm working on, and a few things I enjoy." to the pinned headline on the wall.
- The E/B tile favicon becomes the pushpin.
- The 404 is new; the default Next.js page goes.

## Found while building

- The postcard's postage stamp (#89) had taken over the `board-stamp` class, so the case files' "Case file Nº" ink stamp and this 404's stamp drew as an empty postage stamp. The postcard's stamp is now `board-postage-stamp`.
- By night the linen dims, and muted text on it fell below AA (2.4:1), so the 404's line is in ink (5.1:1 by night), as the canvas's darker grey suggests.
