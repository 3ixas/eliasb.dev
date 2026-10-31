# Quiet index copy

The copy deck for the quiet index homepage ([#281](https://github.com/3ixas/eliasb.dev/issues/281); layout in `docs/design/DESIGN.md`). It covers every string the new homepage shows, including the closer looks.

**Merged** into `docs/content/redesign-copy.md`, under The quiet index homepage, for [#289](https://github.com/3ixas/eliasb.dev/issues/289) on 27 October 2026. That file is the source from now on: change the copy there, not here. This deck stays as the record of how the copy was decided. The inner pages' copy is unchanged.

Facts come only from the Role stories, `src/content/resume.ts` and the project catalogue. The voice follows Elias's voice profile: the position first, something concrete behind every claim, plain words, British spelling and few dashes.

**Status**: *kept* is approved copy used as it is; *moved* is approved copy in a new place; *changed* is a rewrite; *new* is a string the old homepage didn't have. `{braces}` are live values.

## Site-wide

| Where | Copy | Status |
|---|---|---|
| Page title, meta description, social image | As in `redesign-copy.md` | kept |
| Header links (desktop) | Work · Things I make · How I work · Off the clock · Say hello | kept (the Menu entries) |
| Theme button name | Dark theme | kept |
| Greeting | Kettle’s on. (05:00 to 11:59) · Nearly five? (12:00 to 16:59 on a weekday) / Nowhere to be? (12:00 to 16:59 on Saturday and Sunday) · Home yet? (17:00 to 21:59) · Still up? (22:00 to 04:59), by the visitor's own clock and day; Hello before script | changed: was Good morning · Good afternoon · Good evening · Still up? |
| Greeting, on hover | it’s {14:28} here in London | new: London's time, from Elias's side of the screen |
| Footer | Made by Elias | kept |

## Opening

| Where | Copy | Status |
|---|---|---|
| Opening line (`h1`) | I build pricing and risk engines at BNP Paribas, and *products of my own.* | kept |
| Supporting line | I’m the team’s only C# engineer, and the engines run on CPU and GPU. I’ve won the bank’s digitisation competition and a Take Ownership award. | changed: leads with the concrete fact; "Early Careers" dropped, because it read as a graduate scheme (agreed 26 October 2026) |
| Portrait caption (closer look) | Based in London | moved, from the portrait label |

## Work

| Where | Copy | Status |
|---|---|---|
| Note | History, then marketing, then code. Each move was towards the work I liked most. | kept |
| BNP Paribas row | Software engineer · Jul 2025 – now | kept (from the Role story) |
| BNP Paribas closer look | The pass, then: I was nominated as an AI Champion, and the workflow I built is now used by several teams across the department. · With that workflow I integrated a pricer in a couple of days, a job that takes an experienced engineer about two weeks. | moved, from Now's proofs |
| Joveen row | Full stack software engineer · Aug 2024 – Jun 2025 | kept |
| Joveen closer look | The pass, then three points, each a bold result and its cause: **Page load, cut by 40%** · Cut page load by 40% by refactoring React components and lazy-loading assets. **Key API p95, 520 ms → 230 ms** · Added indexes and rewrote slow queries, starting with the API that mattered most. **Mobile retention, up 30%** · Fixed mobile layout and browser bugs found by a cross-browser testing pipeline. | changed: the bare "−40% page load" becomes three explained results, in the form of BNP's pins (#283) |
| Optegra row | Marketing executive · Sep 2021 – Aug 2024 | kept |
| Optegra closer look | The pass, then: **Core Web Vitals pass rate, 62% → 88%** · Scoped performance fixes with the engineers and ticketed them. **p95 page load, cut by 30%** · The same scoped, ticketed fixes. **Where the switch started** · The best part of the job was working with the engineers who built our website. | changed: three points (#283). Its 15% conversion is How I work's Measure proof, so it isn't repeated here |
| History at uni row | Before 2021 · Because I loved it, and I still do. | kept |
| History at uni closer look | University of Essex · Diploma of Higher Education, History · Jul 2021 | new: from the Résumé's education |
| Where I’m headed: heading and line | Where I’m headed · Building a whole product well: what to make, why it works, and getting it to production. How far I’ve got on each. | changed: the aim as a job, not a feeling (#283) |
| Strand rows (title · line) | Knowing what’s worth building. · Judgement · Knowing why it works, not just that it does. · Depth · The whole way, from idea to running in production. · Range | kept (the bars' titles and labels) |
| Strand closer looks | So far · {Optegra / BNP Paribas / Threshold}, then the approved "So far" line | kept |

## Things I make

| Where | Copy | Status |
|---|---|---|
| Note | Products of my own, from a rental calculator to a risk simulator. | moved, from the Work archive's description (agreed 26 October 2026) |
| Argus Risk row | A risk simulator where every number shows its source and age. | changed: says what it is first (#283) |
| Project rows (outcome · year) | As approved: A clearer view of what moving could cost. · Breaks that match how long you actually focused. · A tested C# Web API for managing risk events. · History you can talk to. Version 1; I’m rebuilding it. | kept |
| Home Secretary row | A household coordination prototype, built for coursework. | changed: the old line wrapped to two lines in a row; "software engineering" is already implied by the section |
| Project closer look | {type} · {year} under the screenshot | kept (the tiles' metadata) |
| Archive link | Everything I’ve built ({06}) → | kept |
| Phone cards | {name} · {outcome} | kept |

## How I work

| Where | Copy | Status |
|---|---|---|
| Note | Four habits, and where I picked them up. | changed: four habits (#284) |
| Start from a real problem. | As approved, underlining “no clear idea” | kept |
| Write it down first. | As approved, underlining “57 user stories” | kept |
| Ship it so it’s safe to undo. | At BNP Paribas, taking a stale data dependency out of live pricing, I put the new path behind a feature flag that defaults to off, with caching and an end-to-end test nobody had asked for. Underline: “defaults to off” | new: Elias's own line from the BNP Role story (#284) |
| Measure whether it works. | I learned this in marketing. At Optegra, split tests and analytics dashboards showed which changes brought in consultations and guided what the engineers built next; consultation conversion rose by 15%. Underline: “rose by 15%” | changed: a real measurement rather than a speed-up (#284); the competition dashboard stays in the award's closer look |
| PRD row | Threshold’s PRD · 16 April 2026 | kept |
| PRD closer look | The approved quote, typed, and its caption | kept |

## The reveal words in the opening

| Word | Closer look caption | Status |
|---|---|---|
| pricing and risk engines | The engines run large simulation-based calculations across several asset classes. | kept. The line "Illustrative paths, not real prices." was removed on 31 October 2026 ([#349](https://github.com/3ixas/eliasb.dev/issues/349)) |
| CPU and GPU | The same tests had to run on both CPU and GPU. | kept (from the Role story) |
| digitisation competition | Winner · Digitisation · 2025, then: Led a team of four to win the bank’s digitisation competition, co-building a dashboard that cut a 30–40 minute data load to under 5. Bars: **30–40 min** · **Under 5** | changed: the Résumé line without "Early Careers"; the bar labels are new |
| Take Ownership award | Take Ownership · _nology · Q1 2026 · awarded May 2026 | kept (the certificate's caption) |

The engines' look is also described as: “Illustrative simulated paths fanning out from one level, with one highlighted in green.” Screen readers read it with the caption; nothing shows it on screen.

## Off the clock

| Where | Copy | Status |
|---|---|---|
| Note | What my own time looks like this week. | kept |
| Training row | {Assault bike intervals} · Today’s session, from my training week | changed: replaces the sketch's "Today, from my training week" |
| Training closer look | The week, today in cobalt · Out on a run, central London. | changed: “Zone 2 means slow on purpose.” is dropped (Elias, 28 October 2026) |
| GitHub year | GitHub, the past year · {1,726} contributions in the past year · Less / More · {12} contributions on {3 June} | kept (the sketch said "last year"); "Less / More" replaces "Quiet / Busy" to match GitHub's own key |
| Source marks (live) | Live from Goodreads · Live from Letterboxd · Live from GitHub · Live from Wikipedia | new |
| Source marks (saved data gone stale) | From Goodreads, as of {date} (and so on) | new: built on the approved "as of {date}" |
| Book row | {Dark Age} · Now reading · {Pierce Brown} | kept |
| Book fallback | Between books. | kept |
| Film row | {Kiss Kiss Bang Bang} · Last watched {9 Oct} · {★★★½} | kept |
| Film fallback | Nothing logged yet. | kept |
| Film closer look | Admit one · {title} · {year} · Watched {9 Oct} · {stars} | kept |
| History row title | Odd but true, from this week in history | kept |
| History row line | {3} things that happened this week, some stranger than others. | new: says it's weekly and meant to be fun, using only live values |
| History closer look | The clipping stamped **This week in history**, then {date}, {fact}, the image credit, and **{1} of {3}** | changed: "{n} more oddities this week ↓" becomes a count, because clicking the row now cycles them in place |
| History fallback | From the archive | kept |
| Now making row | {eliasb.dev} · Now making · Live from GitHub (the description is in the closer look) | changed: the description is said once, in the look |

## Say hello

| Where | Copy | Status |
|---|---|---|
| Heading | Say hello, with no line after it: the email and its Copy button are the line | changed: none of 21 experienced engineers' sites asks the reader a question (#283) |
| Email | {eliasthebennett@gmail.com} · Copy → Copied | new (the copy button) |
| Links | Résumé → · GitHub ↗ · LinkedIn ↗ | kept |

## Retired with the old homepage

These strings are retired from the homepage (they stay in `redesign-copy.md` wherever an inner page still uses them):
- the role line under the name, and the portrait label as a sticker
- See my work ↓
- the Things I make intro's second sentence
- the "06 things I’ve built · 03 I’m proudest of" note
- Now as a heading
- the How I got here note's dashed box
- Admit one as a row label
- the GitHub "busiest stretch" and "swipe" lines
- the giant Say hello ↗

## How this was decided

Agreed with Elias on 26 October 2026, after the two research tickets:
- [How experienced engineers word their homepages](https://github.com/3ixas/eliasb.dev/issues/283), with findings at `~/.agents/handoffs/eliasb.dev/2026-10-26-copy-research/283-homepage-copy-patterns.md`
- [Ways of working from top builders, against Elias's evidence](https://github.com/3ixas/eliasb.dev/issues/284), with findings at `.../284-ways-of-working.md`

The decisions:
- **Opening:** the supporting line leads with "only C# engineer".
- **The competition** is "the bank’s digitisation competition" everywhere, with no "Early Careers". Elias: it made him sound like a fresh graduate, which he isn't.
- **Things I make:** the note is the archive's description, and Argus Risk's line now says what it is.
- **Work:** Joveen and Optegra get three best points each.
- **Where I'm headed** names the whole product.
- **How I work** has four habits.
- **Off the clock:** the history row is framed as "some stranger than others".
- **Say hello** has no question.

**Not drafted:** a "what to write to me about" line. It would need Elias to say what he wants to hear about.

**Excluded:** Joveen's deploy time, because the Role story records no cause for it.
