# How expensive interfaces get their precision, in numbers

Research for [How do expensive interfaces get their precision, in numbers?](https://github.com/3ixas/eliasb.dev/issues/360), on [Map: an expensive, crafted finish](https://github.com/3ixas/eliasb.dev/issues/358). It feeds the craft bar and does not set it: every value under "What could apply" is a recommendation for that decision.

**Method.** Live measurement on **3 November 2026** in the Claude desktop browser pane (Chromium, device pixel ratio 2), at 1440 × 900 and 390 × 844, in light and dark emulation: computed styles over every visible element, every readable stylesheet rule (Linear 7,893 rules, Apple 4,823, Rauno 152, none blocked), `getAnimations()`, and interruption tests. Curve peaks and speeds were calculated from the measured Bézier values. This site was read from `main` at `2ceca91` and measured live.

**Labels.** **O** observed: read from the rendered page or its live stylesheet, on the source named, that date. **S** stated: the author says so in writing; not measured. **I** inferred: my reasoning from observations. Values in tables are O unless marked. Source codes are at the end.

## Short answer

Precision in these interfaces comes from four habits more than from any single value:

1. **Feedback is short, and overshoot is rare and small.** Colour and fill changes mostly run 100 to 250 ms on a decelerating curve. Overshooting curves are 1 of 32 on Linear and 5 of 216 on Apple, and every one sits on a small object or a decorative loop. None is on a menu, panel, hover or press.
2. **Pointer-driven motion can change its mind.** Hover and press use CSS transitions, which reverse from where they are. Apple's hover transition, reversed halfway, ran 217 ms instead of 300 ms from its current value. Keyframes are kept for overlays and staged sequences, and they are the part that breaks when interrupted.
3. **Type is tuned per size.** Linear and Apple change tracking at nearly every step, and all three references render with `antialiased`.
4. **Depth is nearly absent, and very faint where it exists.** Layers are 1 to 12% alpha in light mode, and 1 px rings do the edge work.

This site is closer than it may feel. Its `--out` is the same curve as Rauno's "snappy" token, and its row hover is already instant. The gaps are specific: **no press state anywhere, a hover swing that snaps when interrupted (7° to 0° in one frame), a 10% overshoot on interface glide, no per-size tracking below display, and object shadows three to four times stronger than the references' on the light theme.**

## 1. Motion by kind of movement

| Kind | Linear (L1) | Rauno (R1, R2, R3) | Apple (A1, A3) | This site (E) |
|---|---|---|---|---|
| **Feedback: text colour** | 100 ms `ease` or out-quad | 100 ms `ease-out` | 100 ms `linear`; 320 ms standard on nav links; 20 ms on some nav items | 200 ms `--out` or `ease` |
| **Feedback: fill** | 160 ms out-quad on buttons; highlight **0 ms in, 150 ms out** | 250 ms `ease` on list hover | 100 ms `linear`; 240 ms standard on some controls | row fill instant both ways; arrow 200 ms |
| **Feedback: press** | `scale(.97)`, 160 ms | `scale(.96)` (O on a control, S as a rule) | `scale(.9)` on a small play control; fill on buttons | **none: no `:active` rule in `src/app`** |
| **Hover on an object** | n/a | n/a | card scale, 300 ms `(0, 0, .5, 1)`; product image `scale(1.0161)` | lift and tilt 3°, 400 ms `--spring`; swing 900 ms; turn 600 ms |
| **Arrival: small overlay** | tooltip and context menu 100 to 120 ms from `scale(.9)`; nav popup 180 ms `ease` from `.98`; dialog 175 ms from `.96` | tooltip tokens only; guideline says never from 0 (S) | flyout items 320 ms standard, 20 ms stagger per item, 8 px travel | look fade 200 ms `ease-out`, then its object |
| **Arrival: large** | sheets 500 to 700 ms `(.32, .72, 0, 1)` | page frames 350 ms `ease-in-out` after 800 ms, on arrival only | reveals 400 to 500 ms; curtain 320 ms + 80 ms delay | pass 1 s, book about 1.4 s, phone look 300 ms |
| **Exit** | mirrors entry: 120 ms, 175 ms, 180 ms; context menu 100 ms `ease-in` | menu fades out, no entry animation (S, on macOS) | curtain 320 ms both ways; flyout height rules 240 and 320 ms by state, direction not timed | phone look 300 ms, same as entry; margin hides after 140 ms |
| **Theme** | marketing site forced dark in both emulations; `data-theme` tokens exist | no transition on theme switch (S) | no `prefers-color-scheme` rules; dark is per section | 300 ms crossfade of the palette on the root, `(0, 0, .38, .9)`; instant with reduced motion |

Rauno's stated ceiling for interactions is 200 ms (R3). His own site's hover list runs 250 ms, so it is a guideline he bends.

### The curves, calculated

| Curve | Source | Peak | 80% done at | 95% done at |
|---|---|---|---|---|
| `(.2, .8, .2, 1)` | **This site's `--out`, and Rauno's `--transitions-snappy`** | 1.000 | 28% of time | 51% |
| `(.34, 1.56, .64, 1)` | **This site's `--spring`** | **1.098** | 24% | 33% |
| `(0, 0, .38, .9)` | This site's theme curve | 1.000 | 58% | 83% |
| `(.25, .46, .45, .94)` | Linear out-quad; Jakub's enter (S) | 1.000 | 53% | 79% |
| `(.165, .84, .44, 1)` | Linear out-quart | 1.000 | 34% | 59% |
| `(.32, .72, 0, 1)` | Linear sheets | 1.000 | 26% | 48% |
| `(0, 0, .5, 1)` | Apple hover and card | 1.000 | 58% | 80% |
| `(.4, 0, .6, 1)` | Apple standard | 1.000 | 70% | 85% |

**I:** the speed of `--out` matters here. At 200 ms it is 80% done by 56 ms, so the row arrow already feels faster than its number. Moving it to Linear's 160 ms would change little; Apple's slower curves need their longer durations for the same reason.

**Overshoot, from a scan of every `cubic-bezier` in the stylesheets:**

| Where | Curve | Peak | Used on |
|---|---|---|---|
| Apple (A1), 5 of 216 uses | `(.3, 2, .5, 1)`, 400 ms with stagger | 1.250 | Product viewer's small colour and AR buttons popping in |
| | `(.4, 0, .3, 2)`, 240 ms | 1.280 | Live badge in the video player |
| | `(.34, 2.16, .64, 1)`, 700 ms | n/a | A canvas's opacity, which cannot exceed 1, so no visible overshoot |
| Linear (L1), 1 of 32 | `(.45, 1.45, .8, 1)` | 1.066 | One step of a decorative looping keyframe |
| Rauno (R2) | none, of the 1 curve declared | | |

Linear also has a 150 ms dip to `scale(.98)` when a dialog refuses to close. **I:** overshoot is not absent from expensive interfaces. It is reserved for small things that pop, which is close to this site's rule for objects. Apple's swatch overshoots harder than `--spring`; the difference is that it never moves a panel.

### Interruption

| Surface | Mechanism | What happened when interrupted | Label |
|---|---|---|---|
| Apple card hover (A3) | transition | Driven through the page's own rule (my value, `scale(1.02)`), paused at 150 of 300 ms at `scale(1.01444)`, then released: the reverse started **at 1.01444**, same curve, **216.6 ms** | O |
| Linear nav popup (L1) | keyframes | Closing, then reopened: opacity went from 1 to **0** and scale to **.98**, and the 180 ms entry replayed from the start. A visible flash, kept short by its length. Synthetic pointer events | O |
| Linear hover and press (L1) | transition | Rule type only; behaviour as Apple's | I |
| Rauno (R2) | n/a | Calls interruptibility a property taken from the real world, and criticises iOS Settings for not allowing it | S |
| **This site: Mini pass hover swing** | keyframes tied to `:hover` | Real pointer, paused at 270 ms at the 7° peak, pointer moved away: **transform `none` at once**, no animation left, no transition. The pass jumps | O |
| This site: phone look, tapped again mid-open | keyframes `qi-open`, `qi-close` | Same class as Linear's popup; not run | I |
| This site: Eclipse icon | transition | Code comment says a press that reverses mid-flip turns back from where it is | Source, not run |
| This site: margin glide | transition on `top`, `left`, 500 ms `--spring` | Retargets, but starts the full curve again; a 70 px hop overshoots by about 7 px | I, from the curve |

Jakub states the rule directly (J): transitions for interactions, keyframes for sequences that run once. The measurements back it.

## 2. Type

### Tracking by size, in em

| Size | Linear (Inter) | Apple (SF) | Rauno | This site (Bricolage) |
|---|---|---|---|---|
| 96, 80 | | −.015 | 0 | |
| 64 | −.022 | −.009 | | |
| 56 | | −.005 | | |
| 50 | | | | **−.03** |
| 48 | −.022 | −.003 | | |
| 40, 38 | −.022 (38) | 0 (40) | | |
| 34 (phone) | | | | **−.03** |
| 32, 28 | | +.004, +.007 | | |
| 24, 21 | −.012 (24) | +.009, +.011 | | |
| 20, 19 | −.012 (20) | +.012 (19) | | 0 (19) |
| 17 | | **−.022** | | 0 |
| 16, 15 | −.011 (15) | | 0 (16) | 0 (15) |
| 14 | −.013 | −.016 | 0 | |
| 13, 12 | −.01 (13), 0 (12) | −.01 (12) | | 0 (13) |

Apple's jump from +.012 at 19 to −.022 at 17 is where SF Display gives way to SF Text. It is tied to that font and does not transfer as a number (I).

Rauno runs zero tracking even at 720 px, so per-size tracking is **shared by two of three**.

### Other settings

| Setting | Linear | Apple | Rauno | This site |
|---|---|---|---|---|
| Smoothing | `antialiased` | `antialiased` | `antialiased` | **`auto`** |
| Display line height | 1.0 at 64, 1.1 at 38 | 1.04 at 96, 1.08 at 48 | n/a | 1.1 |
| Body | 15/24 (1.6) | 17/25 (1.47) | 16/28 (1.75) | 17/25.5 (1.5) |
| Weights | 400, 510, 590 | 400, 600 | 400, 500 | 400, 600, 650 |
| Features | `cv01`, `ss03` | none | none | none |
| Numerals | `lining-nums tabular-nums` on IDs, counts, time only | normal, including prices | tabular where layout must not shift (S) | tabular on three figures |
| Wrapping | `balance` on h2, `pretty` on paragraphs and quotes | `wrap` throughout | `wrap` throughout | `balance` on h1 only |
| Metadata face | tabular Inter at 12; Berkeley Mono on few labels | sans | sans, 14 | JetBrains Mono, 13 |

**Bricolage, measured on this site at 17 px:** ten 1s are 51.7 px wide and ten 8s are 109.45 px, a **2.1× gap** in proportional figures. With `tabular-nums` both are 102.13 px, so the font does support it. That makes numerals matter more here than in Inter. Optical sizing is working: `auto` matches `opsz` 17 exactly (229.30 px on a sample), while `opsz` 96 sets the same line at 204.48 px, 11% narrower.

## 3. Spacing and alignment

| Measure | Linear | Apple | Rauno | This site |
|---|---|---|---|---|
| Section gap, desktop | 128 px | 144 px, up to 224 | 160 px above the column | 80 px |
| Section gap, phone | not padded on `section` | 112 px | 160 px | 64 px |
| **Phone side gutter at 390** | **24 px** | **24 px** | **24 px** | **16 px column; 22 px portrait** |
| Common small steps | 8, 4, 6, 12, 32, with 7 and 11 | 8, 12, 20, 28, 32, with 7 and 18 | 12, 24, 4, 8 | 10, 16, 18, 2, 4, 12 |
| Reading width | n/a | 946 px | 672 px | 600 px |

- **Nobody is on a strict grid.** Linear's frequent values include 7 and 11; Apple's include 7 and 18. Linear's five-column edges land on half pixels (522.5, 744.5, 966.5). **I:** a 4 px grid would be an invented rule, not a learned one. What repeats is a small set of values used consistently.
- **Phone gutter:** the earlier review also noted about 24 px on Noé's and Jakub's sites (P), which makes 24 the strongest number in this research.
- **A mismatch on this site:** `DESIGN.md` gives the column `min(100% − 40px, 600px)`, which is 20 px at 390. The live column uses `--stretch-gutter: 16px`, while the portrait sits at x = 22. Text starts at 16. **Six pixels between the header's left edge and everything below it** is one for the Plain defects list.

## 4. Shadows and edges

### Recipes, as measured

**Linear (L1)**

```css
/* Button stack, both themes; light adds the first line */
inset 0 -1px 1px rgb(0 0 0 / .11),
0 8px 2px transparent, 0 5px 2px rgb(0 0 0 / .01), 0 3px 2px rgb(0 0 0 / .04),
0 1px 1px rgb(0 0 0 / .07), 0 0 1px rgb(0 0 0 / .08);

/* Elevation tokens */
light: 0 1px 4px -1px / .09 · 0 3px 12px / .09 · 0 7px 24px / .06
dark:  0 2px 4px / .10 · 0 4px 24px / .20 · 0 7px 32px / .35

/* Dark panel edge light */
inset 0 0 0 1px rgb(255 255 255 / .03), inset 0 1px 0 rgb(255 255 255 / .04),
0 0 0 1px rgb(0 0 0 / .6), 0 4px 4px rgb(0 0 0 / .1);

/* Dark hairlines */
inset 0 0 0 1px rgb(255 255 255 / .05), or .08 at 0.5 px
```

The light tokens were read from the stylesheet. The marketing site does not render its light theme.

**Rauno (R1, R2):** `0 0 0 1px #ededed` in light, `0 0 0 1px #2e2e2e` in dark. Tooltip `0 4px 8px / .04, 0 1px 1px / .02`. Elevation tokens `0 5px 10px`, `0 8px 30px`, `0 30px 60px`, all at .12.

**Apple (A1):** `inset 0 0 .5px rgb(0 0 0 / .11)` on media, `0 0 0 1px rgb(40 40 40)` on dark. A `.tile-shadow` token exists (`8px 8px 16px / .08`), but rendered tiles use **no shadow** and 28 px radii.

**Jakub (J, S):** light `0 0 0 1px / .06, 0 1px 2px -1px / .06, 0 2px 4px / .04`; dark `0 0 0 1px rgb(255 255 255 / .08)`. Images get a 1 px outline at 10%.

**This site (E):** objects `0 1px 1px / .3, 0 3px 5px -1px / .35`; some add `inset 0 1px 0 rgb(255 255 255 / .25 to .4)` as the top edge. The same stacks were read in the light desktop and dark phone passes.

### What the numbers say

- **Light-mode alpha:** Linear .01 to .11, Jakub .04 to .06, Rauno .02 to .12. This site's objects: .25 to .35, three to four times stronger at the top of the range.
- **Dark mode is where alpha rises:** Linear's tokens go from .06 to .09 in light to .10 to .35 in dark. This site uses one stack in both, so **I:** its shadows are probably about right for dark and heavy for light. This also bears on "How light and depth hold up in dark mode" in the map.
- **Caveat:** objects here are small, material things, and the references are shadowing panels and buttons. A 44 px object needs a tighter, darker contact shadow than a 300 px panel, so this needs eyes on a prototype. It is not a straight swap.

## 5. Focus and hover

| | Linear | Apple | Rauno | This site |
|---|---|---|---|---|
| Trigger | `:focus-visible` | `:focus-visible` | `:focus-visible` | `:focus-visible` |
| Ring | solid accent, 1 or 2 px by token set, offset 2; inset on lists | 2 px `#0071e3`, offset 1; −7 on nav | 2 px, or 4 px offset 4 on large frames; 2.5 px shadow on one control | 2 px cobalt, offset −2 on rows |
| Hover gating | 85 `(hover: hover)` rules | `html.no-touch` and 11 hover queries | `(hover: hover)` | `(hover: hover)` |
| Tap highlight | transparent | browser default | browser default | transparent, **with no replacement** |

Focus is already at the references' level. Rauno says a removed tap highlight needs a replacement (R3). This site removes it and adds no press state, so a tap on a link row gives no feedback before navigation (I, from the rules). This answers "How taps feel on phones" in the map's open list.

## 6. Shared, and one site's habit

**Shared by all three (use these for the bar):**

- `antialiased` text.
- Decelerating or symmetric curves on menus, panels, hover and press, with no overshoot there.
- Pointer feedback in transitions.
- Press and entry scales that stay near 1 (.9 to .98).
- 2 px accent focus on `:focus-visible` (Linear also has a 1 px set).
- 1 px rings over heavy shadow.
- 24 px phone gutter.

**Shared by two:** per-size tracking (Linear, Apple); press scale .96 to .97 (Linear, Rauno); hover gated by a media query (all three by different means).

**One site's habit (do not treat as a standard):**

- **Linear:** `cv01`/`ss03`, weights 510 and 590, the five-layer button stack, instant highlight with 150 ms fade-out, the sheet curve, forced dark.
- **Rauno:** zero tracking, 16/28, Georgia italics inline, yellow `::selection`, .12 elevation tokens.
- **Apple:** positive tracking from 19 to 32 px, 28 px radii, 20 ms nav colour, 20 ms stagger, sections of 144 px, dark per section, `linear` hover.

## 7. What could apply here

Recommendations only. "Open" means the map's tuning scope covers it; a change still edits `DESIGN.md` in place.

| # | Value | Where | Against the contract |
|---|---|---|---|
| 1 | **Reactions play through once started.** No snap on pointer leave. The header already has the pattern: `[data-playing]` | `.qi-mini`, `.qi-tile` hover | Fits |
| 2 | **Press state:** row fill to `--stretch-card` at once on `:active`; `scale(.96)` to `.97`, 100 to 160 ms, on controls of 44 px or less. **Not** scale on a 600 px row: 3% moves its edge 9 px, and Rauno ties values to trigger size (R3) | Rows, Copy, Eclipse, dotted words | Fits rule 3 (feedback on a control) |
| 3 | **Margin glide:** `--out` at about 300 ms, on `transform`, in place of `top`, `left` at 500 ms `--spring` | `.qi-margin[data-glide]` | Open, but edits `DESIGN.md`, which says "glides on the `spring` timing" |
| 4 | **Overshoot for small objects only** (pins, ticket, pass), never for the margin. The peak itself can stay: 1.098 is gentler than Apple's swatch. `spring.ts` can already produce gentler curves through `bounce` if a prototype asks for them | `--spring` uses | Open; edits the Motion section |
| 5 | **Row fill:** 0 ms in, 150 ms out | `.qi-row` | Fits |
| 6 | **Text colour changes:** 100 ms `ease-out`, from 200 ms | Links, dotted words, arrow colour | Fits |
| 7 | **`antialiased`** site-wide, checked in dark mode where it matters most | `base.css` | Bricolage settings: prototype |
| 8 | **Tracking:** try display −.02 to −.03 (now the tightest of the set at its size) and −.005 to −.012 at 15 to 19 px | Type tokens | Bricolage settings: prototype. The 13 px floor and 17 px body stay |
| 9 | **`tabular-nums`** on anything that counts or sits in a column: pass figures, count-ups, years. Prose stays proportional | Figures | Fits; 2.1× digit gap measured |
| 10 | **`text-wrap: pretty`** on prose and notes; `balance` on any multi-line title | Paragraphs, notes | Fits; recheck the phone budget (4.81 of 5 screens) |
| 11 | **Object shadow, light theme:** try .12 to .18 contact and ambient, keeping today's values in dark | Object stacks | Open; "one light" stays |
| 12 | **Phone gutter:** agree one number. 24 matches every reference, but costs 16 px of text width against the live 16 px gutter and could push the budget. 20 is what `DESIGN.md` already says. **I'd try 20 first**, then 24 with the budget measured | `--stretch-gutter`, header | Rule 5 applies; the two widths are not touched |
| 13 | **Metadata face:** try tabular Bricolage at 13 against JetBrains Mono. I would keep the mono: it is this site's habit, not a reference's, but it is also part of why the page looks like it | Rows | In the prototype scope |
| 14 | **Margin look exit:** opacity only, about 120 ms, no travel | `.qi-margin` | Open; Linear's tooltip close is the precedent |

**Keep as they are:** `--out`, already matching Rauno's token. The theme crossfade: Rauno would have none (S), but his reason is hover transitions firing on every element, and this site's implementation animates the palette once on the root to avoid exactly that. Instant row fill on entry, focus rings, hover gating.

### What conflicts with the contract

| Reference value | Conflict | Call |
|---|---|---|
| Sections 112 to 160 px | Length budget (3.8 of 4, 4.8 of 5). Closed | Do not adopt |
| Type under 13 px: Linear 10 to 12, Apple 10 and 12 | 13 px floor. Closed | Do not adopt |
| 15 and 16 px body | 17 px body. Closed | Do not adopt |
| Apple's display at 80 to 96 px, Linear's at 64 | One opening line at up to 50 px. Closed | Do not adopt |
| Inter's `cv01`/`ss03`, SF | Fonts closed; features of Bricolage are open | Do not adopt |
| 28 px radii and cards | Row structure, 14 px radius. Closed | Do not adopt |
| Weak semantics seen in passing, such as text in plain `span` | Accessibility section | Do not adopt |
| Rauno's 200 ms ceiling, against closer looks of 0.3 to 1.4 s | **A real tension, not a closed one.** `DESIGN.md` specifies those arrivals, and rule 3 allows them. They are not frequent in his sense on one visit, but the book's title only starts to arrive at about 0.9 s, on every hover | **For the bar:** decide whether a look's words must be readable by a fixed time, say 300 ms, with the object free to keep moving. I recommend yes; it also honours "content never waits for motion" |

## 8. What the earlier review adds

The 25 October review (P), at `~/.agents/handoffs/eliasb.dev/2026-10-25-reference-review/00-start-here.md`, did not instrument easing, so nothing here repeats it. It contributes:

- **Body settings:** Noé and Jakub 16/26 (1.63), Timothy 15/24, Raphael 14/24, Gavin 15/22.5. At 17/25.5 (1.5), this site sits at the tight end of that range but is larger.
- **Row pitch:** Jakub about 70 px, Gavin 74 to 75 px. This site's 68 px minimum is in family.
- **Group spacing:** Noé about 96 px against compact rows. The ratio is the point there, as this site's 2, 18 and 80 px already are.
- **Jakub's stated values (J, read for this research):** `balance` on titles, `pretty` on descriptions; `tabular-nums`; `antialiased`; transitions against keyframes; enter 8 px travel with 80 to 100 ms stagger; exits subtler than entries; a concentric radius formula, which `DESIGN.md` already holds.

## 9. What could not be measured

- **Live timing was limited.** The pane pauses or throttles tabs in the background, and other sessions were using it. Linear's popup was sampled at a usable rate. Apple's flyout, Apple's gallery and Rauno's homepage transition were not: timers fell to about one a second, and those tests produced nothing usable. Their values above are declared rules, not timed playback.
- **Apple's scroll-linked animation** was not instrumented.
- **Springs driven from script.** Any on these pages would not appear in stylesheets, so the overshoot counts cover CSS curves only. The Apple count is from the iPhone 18 Pro page.
- **Real devices.** Emulation only: no iPhone, no Safari, no real touch, as the map expected. Tap behaviour is read from rules, not felt. The phone test used 390 × 844, apart from one earlier Linear read at 375, re-checked at 390.
- **Optical alignment.** Computed styles give box edges, not ink. Only left edges and gutters are measured here; hanging punctuation and icon nudges need zoomed screenshots.
- **Linear's app** needs a sign-in, so these are its marketing site and the app demo inside it. Its light theme was read from tokens, not rendered.
- **Rauno's Devouring Details** is paid and was not measured; R2 and R3 are text sources, and R3's cached copy is what was read.
- **Pages:** `/iphone-17-pro/` redirected to `/iphone/` that day, so `/iphone-18-pro/` is the iPhone page used. `/macbook-pro/` is currently a short overview (3,884 px), so it adds little beyond confirming the same type tokens.
- **This site's margin exit and phone-look interruption** were read from code, not run.

## Sources

Measured live, 3 November 2026:

- **L1** Linear: <https://linear.app>
- **R1** Rauno Freiberg, home: <https://rauno.me>
- **A1** Apple, iPhone 18 Pro: <https://www.apple.com/iphone-18-pro/>
- **A2** Apple, MacBook Pro: <https://www.apple.com/macbook-pro/>
- **A3** Apple, iPhone: <https://www.apple.com/iphone/>
- **E** This site: <https://www.eliasb.dev>, with `src/app/*.css`, `docs/design/DESIGN.md`, `src/components/site/spring.ts`

Measured live and read as text:

- **R2** Rauno Freiberg, Invisible Details of Interaction Design (July 2023): <https://rauno.me/craft/interaction-design>

Read as text:

- **R3** Rauno Freiberg, Web Interface Guidelines: <https://interfaces.rauno.me>
- **J** Jakub Krehel, Details that make interfaces feel better: <https://jakub.kr/writing/details-that-make-interfaces-feel-better>
- **P** Earlier reference review, 25 October 2026, on Elias's machine: `~/.agents/handoffs/eliasb.dev/2026-10-25-reference-review/`
