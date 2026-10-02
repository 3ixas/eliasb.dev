# Copy: the culture corner (#83)

Status: approved by Elias, 2 October 2026. Where the draft offered options, the first was taken; Elias can still swap any of them.

Covers the corner's heading, the book pin, the film pin, the cassette player for the playlist, and what each pin shows when there's nothing current. Rules: plain, concrete, first person, British spelling, no em dashes. The example values are what the feeds returned on 2 October 2026.

## Corner

| Element | Copy |
|---|---|
| Heading | The culture corner |

Approved in #82. It replaces the current "Books, films, music and history" kicker and the second heading.

## Book: library card and cover

| Element | Copy | Source |
|---|---|---|
| Tag label | Now reading | Approved in #82 |
| Tag title | Dark Age | Goodreads `title`, with the series suffix "(Red Rising Saga, #5)" removed, as now |
| Tag line | Pierce Brown · Goodreads | `author_name` |
| Library card column | Date started | |
| Card stamp | 14 Sept | `user_date_added` on the currently-reading shelf |
| Stamp, for screen readers | Started 14 September | |
| Cover alt text | Cover of Dark Age by Pierce Brown | |
| Link | View on Goodreads ↗ | Goes to my Goodreads profile, as now |

Decided: the date started is the day the book went onto my currently-reading shelf. Changing the book on Goodreads changes the date. The stamp uses the same date style as the "as of" note.

## Film: poster and ticket

| Element | Copy | Source |
|---|---|---|
| Ticket heading | Admit one · Last watched | Approved in #82 |
| Ticket title | The Invite | Letterboxd `filmTitle` |
| Ticket line | Watched 14 Sept · ★★★★ | `watchedDate`, `memberRating` |
| Ticket line, for screen readers | Watched 14 September, rated 4 out of 5 | |
| Poster alt text | Poster for The Invite (2026) | `filmTitle`, `filmYear` |
| Link | Logged on Letterboxd ↗ | Goes to that film's diary entry, as now |

Decided: the ticket shows both the date and the rating. Half stars show as ½ (★★★★½). The integration doesn't read `watchedDate` yet; #83 adds it.

## Playlist: cassette player

### The design

The player is built round Spotify's own embed, not beside it. Spotify's player has its own artwork, controls and track list, so ours doesn't repeat any of them.

- **Before Play:** a cassette deck with a tape in it, and a J-card (the folded paper insert in a cassette case) clipped beside it, carrying the playlist's name in handwriting. One button: Play.
- **After Play:** the deck's lid opens and Spotify's full player (artwork, controls and the scrolling track list) sits inside the deck's window, framed by the cassette player's casing. The J-card stays as decoration.
- **Gone from the canvas:** the Previous and Next buttons and the separate "Track list · from Spotify" card. Spotify's player does both jobs better.

I'll redraw the cassette on the canvas (`R4Board`) for your review before building it.

### Copy

| Element | Copy |
|---|---|
| Tag label | On repeat |
| Tag title | My playlist |
| Tag line | Whatever I've had on loop lately |
| Player heading | What I'm listening to |
| Player badge (decorative) | E/B Sound · Stereo · Side A |
| J-card | Side A · press play to see what's on it |
| Play button, visible | Play |
| Play button, accessible name | Play my playlist on Spotify |
| Spotify player title (for screen readers) | My Spotify playlist |
| Fallback link, always shown | Open in Spotify ↗ |

The first draft's "Nothing from Spotify loads until you do" is gone. The privacy reason holds, since Spotify's player only loads after Play, but the page doesn't need to say so.

## When there's nothing current

Decided: the book and film come only from their live feeds. The saved *Dark Age* and *Avengers: Infinity War* are removed. When a feed works but has nothing to show, the pin stays up with an empty state.

| Pin | Empty state |
|---|---|
| Book | The library card with no stamp, and the tag reads **Now reading** · **Between books** |
| Book, cover | A blank cover in the cover's place, the same idea as "photo coming" |
| Film | The ticket reads **Admit one · Last watched** · **Nothing logged yet** |
| Film, poster | A blank poster in the poster's place |

The film feed lists my whole diary, so the empty state will only show if the diary is empty. The book's will show whenever my currently-reading shelf is empty.

**When a feed can't be reached** (Goodreads or Letterboxd is down, or slow): the pin keeps the last version it fetched successfully, and goes stale after 60 days as approved in #82. Only a first visit with nothing fetched yet falls back to the empty state. This is a build detail rather than copy; I'll prove it in tests during #83.

## Changes from the current site

- The book and film move from cards with a "Currently reading" or "Most recently watched" status into a library card and a cinema ticket.
- The book's description is no longer shown; the card holds the title, author and date started.
- The film adds the date watched, beside the rating.
- The saved fallback book and film go; an empty feed shows an empty state instead.
- The playlist becomes a cassette player that opens to Spotify's own player. "Open playlist in Spotify" becomes "Open in Spotify".
- The Spotify embed no longer loads on first visit; it loads when you press Play.
