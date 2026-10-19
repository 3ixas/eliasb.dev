# Rauno's portfolio-review thread, applied to eliasb.dev

19 October 2026. Source: [rauno's thread](https://x.com/raunofreiberg/status/2112202758048669799) ("in a portfolio reviewing mood until i get bored, send me links"), which quotes his earlier rule: *no matter how cool your portfolio looks, he passes on it if the links are broken or it is janky on mobile.* Rauno is already listed as a reference in the Board-era `DESIGN.md` for interaction detail.

Method: every reply by @raunofreiberg was opened at its own URL to get the untruncated text; each reviewed site was opened in a browser to see what the note pointed at. 31 real reviews, about 85 individual notes. The reply to Josh Puckett ("complete garbage", on rauno.me itself) is a joke and is excluded. Quotes below are paraphrased unless in quotation marks.

## 1. What he said, site by site

| Site | His notes (condensed) |
|---|---|
| [iamclint.xyz](https://iamclint.xyz) | Drop the "Hello…" load animation: no one sees it, they just feel a jitter. Stagger the bottom items very subtly. Blend border with shadow. Detail-page entrance is sloppy: items leave jarringly, lots of movement in opposing directions. |
| [gurbinder.dev](https://gurbinder.dev) | Three rows to say very little about yourself; the "still not sure?" angle reads as selling something. |
| [shadcn.com](https://shadcn.com) | Favicon is detached from the visual language and isn't reinforced in the OG image or page. Sponsor avatars "dirty the canvas" and are illegible at that size; use names. Links and section headings share styling, so headings look clickable. |
| [dhrv.pw](https://dhrv.pw) | Body text too small; 15–16px. Something steals clicks on the article. Broken links in the command menu; flash of unstyled content on Crafts. "Every surface is a different portfolio." |
| [stallboerger.com](https://stallboerger.com) | 8/10. Favicon doesn't work at small size; links take you out of the experience. |
| [ray-mnd.com](https://ray-mnd.com) | Serif at 13px is hard to read. Show the personal work before the text. |
| [andersdrage.com](https://andersdrage.com) | "dont block my intent": let people click through the intro screen. |
| [lucaslima.design](https://lucaslima.design) | The stagger gets overdone; fade in by section instead. |
| [kyle.so](https://kyle.so) | Hero selector is uninspired tabs; make it less tab-like and more fun. Pause the hero animation smoothly when the visitor scrolls to read. |
| [veronezi.dev](https://veronezi.dev) | Don't explain a filter with a label; make the control self-evident. The label adds weight to an already text-heavy area. |
| [jerryddi.com](https://jerryddi.com) | The OG image set a different expectation. Index videos are cropped oddly, look low-quality on a big display, and vary wildly in visual interest. |
| [antonsten.com](https://antonsten.com) | `font-display: block` on the h1; the swap is gnarly. The h1 and first sentence say the same thing. One nav link too many throws off balance; try something heavier than the name top-left. |
| [samlimby.com](https://samlimby.com) | Hero hover swaps z-index instantly and feels abrupt. Two similar photos of yourself; dig deeper conceptually (the favicon is an avatar, use it). Password-protected case studies leave the rest of us only screen recordings; put something on the table. |
| [krathish.com](https://krathish.com), [gerttali.ee](https://gerttali.ee) | Projects open in a modal, not a route: can't ⌘-click them all into tabs to compare, and it discourages browsing. (Gert) Text selection in the hero is broken. |
| [memoesparza.com](https://memoesparza.com) | Custom cursor makes hover bounds unclear. Navigating to /work causes a cascade of layout shift. |
| [pdepablo.com](https://pdepablo.com) | The intro is a prelude: is your name the most interesting thing to say on entry? |
| [griep.design](https://griep.design) | Let the mouse wheel scroll the horizontal list. Expand and collapse from the same trigger, not a far-away ×. |
| [creativestefan.work](https://creativestefan.work) | If the work carousel isn't obvious to navigate, he closes the tab. Transitions feel slow. |
| [saranshahuja.com](https://saranshahuja.com) | Too many projects; choose 2–3 and present them well. |
| [maxleiter.com](https://maxleiter.com) | Slow view transitions contradict the speed-obsessed OS look. Writing and projects look the same. Badges feel half-committed to the motif. |
| [marcelochaman.com](https://marcelochaman.com) | Navigation between sections is an afterthought dropdown whose trigger moves between pages. Sluggish view transitions contradict a utility look. ⌘K label broken. No external-link icon needed for GitHub, X, mail; make the arrow the text colour. A corner motif gets heavy past five entries. |
| [abhishekjakhar.is-a.dev](https://abhishekjakhar.is-a.dev) | Put your writing on your own site. |
| [praveenjuge.com](https://praveenjuge.com) | Kill colour on social icons: "your website is not a billboard for others". Carousel images too zoomed out; crop to details. Blog images bound by the text column; widen or bleed. |
| [aunnursakkhor.com](https://aunnursakkhor.com) | Testimonial avatars aren't proof if they can't be identified. Let people pause carousels. Shorter testimonials. Build a /resume page with an export-to-PDF button instead of a Google Drive link. |
| [mnsh.me](https://mnsh.me) | Tiny label text is clutter; remove or enlarge. The left-aligned layout never sits comfortably for reading. "Dither is so out"; drop the hero image. Make the mini-game distinctive and full-bleed. Rows should be wholly clickable, not just the name. |
| [iamshubhransh.com](https://iamshubhransh.com) | Carousel clipped sloppily (check other screen sizes). Hero nav can't be reached after scrolling. Smaller logo, bigger text. Make the h2 your h1. Nav morphs oval↔pill (ovals look awkward). Nav items behave inconsistently (scroll vs navigate), and glitch on navigation: motion that glitches earns negative points, and nobody would miss it. |
| [kaeden.codes](https://kaeden.codes) | "← all projects" is redundant with one level of URLs; the back button exists. |
| [blvdmitry.me](https://blvdmitry.me) | `scrollbar-gutter: stable` for tabs. A flagship project reads as a pet project; show the breadth and effort. Flag external destinations in the list before the click. |
| [lochieaxon.com](https://lochieaxon.com) | "not enough motion" (on an unstyled HTML page; tongue-in-cheek). |

## 2. The checklist he's applying

Distilled from the notes above; the number after each is how many sites drew it.

**A. Hygiene is the entry ticket.** Broken links, broken labels, stolen clicks, broken text selection, flashes of unstyled content, font swaps, layout shift on navigation, anything janky on mobile (the quoted rule, plus 9 sites).

**B. Never make the visitor wait or fight.** No load animation they have to sit through; never block a click during an intro; let them pause anything that moves while they read; reachable navigation after scrolling (6).

**C. Motion must match the page's promise.** Fast, utility-looking pages need fast transitions. Subtle stagger, by section, not per item. No opposing directions, no abrupt z-index swaps, no shape morphs that pass through ugly states. A glitchy flourish costs more than no flourish (9).

**D. Text must be comfortable to read.** 15–16px body; tiny labels are clutter; the h1 should be the most meaningful line and not repeat the next one; type over logos (6).

**E. Say something specific, then show the work.** Lead with what's interesting, not just a name. Fewer projects, presented well, with their real depth. Work before text. Give public visitors something real. Own your writing and résumé on your own domain (9).

**F. Behave like the web.** Real routes, not modals. Whole rows clickable. Headings must not look like links. Flag external destinations before the click. One consistent navigation model everywhere. Same trigger opens and closes. Don't explain a control with a label; fix the control (12).

**G. One visual language, carried everywhere.** Favicon, OG image and page share one identity. Motifs fully committed or dropped, and light enough to survive repetition. No colourful third-party logos. Images cropped to details that read at thumbnail size (8).

## 3. eliasb.dev against the checklist

Checked on the production site (www.eliasb.dev, main at `2c2eedb`) at desktop width and at 375 px, plus the source.

### Hits

1. **Résumé is a Google Drive link** (`Say hello` footer). Almost word for word the Aunnur note: build `/resume` with an export-to-PDF action. *(E, F)*
2. **The Signature entrance holds the page for about 4.6 s on every load** (`src/components/site/entrance.ts`, ADR 0005). It's the exact pattern he told Clint to drop and Anders to unblock. It's guarded, accessible, and skipped on back-forward and anchor arrivals, so it's better built than the ones he criticised. The question is whether it should exist at all. I couldn't watch it play in the browser pane (the pane's navigate returns after load), so this rests on the code and spec. *(B, C)*
3. **The project index's rows 04–06 go to GitHub in a new tab, but show the internal `→` arrow.** Rows 01–03 go to case studies with the same arrow. He flagged both at Dima's: name external destinations before the click. Off the clock and the footer already use `↗` properly. *(F)*
4. **The hero says "BNP Paribas" three times in a row:** the page title, the role line ("Software Engineer at BNP Paribas CIB") and the h1 ("I build pricing and risk engines at BNP Paribas"), then "BNP's" in the supporting line. That's his Anton Sten note: the h1 and the line before it say the same thing. *(D, E)*
5. **There's a lot of very small text.** On the homepage at 1024 px, 52 text elements are 11–12 px and 36 are 13 px, mostly JetBrains Mono labels (dates, counts, "SO FAR · OPTEGRA", the training-week footnote at 13/18). The page also uses about 20 distinct font sizes, against STRETCH's "one modular scale". *(D)*
6. **There are a lot of motifs on one page.** Lanyards and Staff passes, tape, paperclips, pins, a cinema "ADMIT ONE" stub, a newspaper clipping, a training poster, barcodes, award pills, a hand-drawn arrow and underlines. STRETCH says "one Fastener per object". Each object follows that, but the page as a whole carries many object metaphors. Rauno's "every surface is a different portfolio" (Dhruv) and "half-committed to the motif" (Max) are the risk here. This is a judgement call, not a defect. *(G)*
7. **The favicon identity isn't carried through.** The favicon is a cobalt tile with an "E". The E mark doesn't appear on the page or in the OG image (light, text-only, its headline in cobalt). It's coherent in colour but not in mark: his shadcn note. *(G)*
8. **Fonts load with `font-display: swap`** (Bricolage, JetBrains Mono). The name is set at 75% width and 800 weight, so a swap from the fallback could be very visible. `next/font`'s size-adjusted fallback may hide it. **Unverified**: this needs a throttled cold load to judge. *(A)*
9. **"← Things I make" and "← Work" back links on case studies**, with only one level of URLs. That's his Kaeden note. Mild, and partly preference. *(F)*
10. **The /things-i-make resting preview is an empty bordered box** until you hover a row (#221 made it "resting" by design). At first glance an empty frame reads as a broken image. *(A, G)*
11. **`scrollbar-gutter` is `auto`.** Worth checking whether opening the phone menu dialog (scroll lock) shifts the layout. **Unverified.** *(A)*

### Passes

- Real routes for every case study and Role story; nothing opens in a modal.
- No horizontal overflow at 375 px; phone layout is clean; targets are large.
- Featured work is three, and the rest is a compact list ("choose 2–3").
- Index rows are whole-row links.
- Off the clock's external links are all marked `↗`; socials are monochrome text, not coloured logos.
- Content is in the server HTML; the page doesn't flash blank (several reviewed sites screenshot as blank first frames).
- Navigation scrolls to sections on the homepage and is reachable at all times (sticky header).

### Not applicable

There's no carousel, custom cursor, password gate, testimonials, view transitions, command menu, or filter label.

## 4. Proposed routing

| Finding | Route | Why |
|---|---|---|
| 2. Signature entrance | **Grilling** | Reverses a deliberate ADR 0005 decision; needs Elias's call. Options run from keeping it, to first visit only, to shortening it so it never blocks a click, to cutting it. |
| 6. Motif density | **Grilling** | Taste and identity, not a defect. |
| 4. Hero repetition | **Grilling** (short) | Copy is Elias's voice; approved copy lives in `redesign-copy.md`. |
| 5. Small type and scale sprawl | **Grilling**, then ticket | Needs a decision on the label floor (for example 13 px minimum) and whether to collapse the scale. |
| 8. Font swap | **Research / task** | Measure on a throttled cold load; decide `block` vs `optional` for display only. |
| 11. Gutter on menu open | **Task** (verify) | A quick check, then a ticket if it shifts. |
| 1. `/resume` page with PDF export | **Ticket** after one grilling question | Elias decides the content source (the current PDF or the site's data). |
| 3. External arrows in the index | **Ticket** | Clear fix: `↗` on external rows, matching the rest of the site. |
| 7. Favicon ↔ OG coherence | **Ticket** (small design call) | Bring the E mark into the OG image (or the header), or change the favicon to match. |
| 9. Back links | **Ticket** or drop | Low stakes; decide in the grilling batch. |
| 10. Empty resting preview | **Ticket** | Show the first project's screenshot at rest, or no frame. |
