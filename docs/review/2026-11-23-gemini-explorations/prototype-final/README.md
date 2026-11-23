# Approved Prototype — Passes & Panels Refinement (Hybrid A + B)

**Status:** Approved by Elias in live T3 Preview review on 23 November 2026.

## Approved decisions to carry into `DESIGN.md` and implementation

1. **Header (`index.html`, all pages):**
   - Subtle `1 px` grey bottom rule (`--hair`).
   - Keep the existing live **GreetingScene SVG glyphs** (`src/components/site/greeting-scene.tsx`) beside the time-of-day greeting.
   - Keep the existing live **Eclipse SVG icon theme toggle** (`src/components/site/eclipse-toggle.tsx`), borderless on the header ground (subtle hover tint + focus ring only, zero outer ring).
2. **Opening (`index.html`):**
   - Retain the **shipped Three.js 3D Staff pass with real material textures** (`src/components/parts/lanyard/`), simplified to **one pass only — the latest role (BNP Paribas)** hanging directly from the header hairline on desktop and a quiet rail line below the actions on mobile.
   - No bottom metadata baseline (`Based in London`, `C# & Java · CPU & GPU`, `Work ↓` all omitted).
3. **Section headings site-wide:**
   - Stack section subheadings (`.section__note`) cleanly **directly underneath** each section `<h2>` rather than off to the right.
4. **Work (`#work`):**
   - **BNP Paribas:** Full emerald `#00965e` panel with the `Six months` stat and drawn scale bars (live Monte Carlo simulation stays inside the BNP Paribas Role story, not on the homepage).
   - **Joveen (`#1a1a1f`) & Optegra (`#07535b`):** Direction B’s crisp full-colour panels with compact 3-metric trays, edged with Direction A’s subtle `1 px` grey hairline borders in both themes.
5. **Things I make (`#things-i-make` & `/things-i-make`):**
   - Retain full signature colours on all three featured projects — **Threshold** (`#c58f5e` + inline city URL switcher), **Argus Risk** (`#4f86f7`), and **Flowtime** (`#2a211b`) — each staging its complete, uncropped screenshot inside a **concentric optical bezel** (`24 / 16 / 10 px`) so dark UIs stay sharp and separated.
   - Secondary rows (`Home Secretary`, `Risk Event Tracker`, `Ask Professor Past`) sit on calm paper strips with subtle `1 px` grey borders and visible-at-rest thumbnails.
6. **Where I’m headed & How I work (`#how-i-work`):**
   - Set inside Direction B’s full-bleed warm-linen band (`--band`, edged with subtle `1 px` grey rules).
   - **Where I’m headed:** Asymmetric `4 / 7` paper panel with source-coloured chips (`Optegra` teal, `BNP Paribas` emerald, `Threshold` ochre) and the three bespoke drawn SVG proofs (`where-im-headed.tsx`).
   - **How I work:** 2 × 2 bordered paper cards, each with its own distinct inset proof tray:
     1. *Start from a real problem:* `Threshold` and `Flowtime` micro-screenshot pills with colour swatches.
     2. *Write it down first:* `57` serif numeral, 13-slice stepped bar, and direct `Threshold’s PRD, 16 Apr 2026 →` link.
     3. *Ship it so it’s safe to undo:* Interactive accessible `Off / On` feature-flag switch wired to live `Today’s path` / `New cached path` routing chips.
     4. *Measure whether it works:* Bold `+15%` serif figure over proportional Before / After bars.
7. **Off the clock (`#off-the-clock`) & Say hello (`#say-hello`):**
   - Direction B’s nested stone rows inside one bordered paper panel, edged with subtle `1 px` grey borders.
   - **Today’s workout:** Calm, scannable 7-day weekly schedule showing per-day cues (`Mon · Upper`, `Tue · Lower`, `Wed · Zone 2`, …) with Today highlighted (no click-to-preview chrome, no redundant summary line).
   - **Tap-to-enlarge imagery:** Both the Central London running photo and the enlarged Montgolfier balloon history illustration open full-size in the lightbox on click/tap with `cursor: zoom-in` and zero `Enlarge ↗` instruction copy.
   - **GitHub & Now making:** `GitHub, the past year` sits in the left margin column matching the rows above, giving `What I’m building now · ekit` full horizontal breathing room above the contribution grid.
   - **Say hello:** Full-bleed tonal closing band with subtle top hairline and synchronous morphing `Copy → ✓ Copied` button.
8. **Role stories & Case studies (`bnp.html`, `threshold.html`):**
   - Direction B’s reading architecture with Direction A’s subtle `1 px` grey borders:
     - **Role stories:** Coloured hero banner with compact embedded pass, sticky left chapter rail with active lifted paper pill (zero numbers), structured tonal Problem & Decision cards, high-legibility interactive Monte Carlo simulation (`10 / 100 / 1,000` paths + `10th–90th spread` + `Run again`), interactive blast-radius switch, and neutral archival mat for the `_nology` Take Ownership certificate.
     - **Case studies:** Lifted open-ground header matching Role stories (`← Things I make`, title, outcome, stack, Live/Code actions, 4 bordered evidence items), full-width project-colour exhibition stage with zoomable uncropped screenshot, sticky chapter rail, structured Decision cards, and interactive URL builder (`Copy link` morph + `Open this scenario ↗`).

## Verification summary

- **Passed (0 failures across 24 headless Chromium runs):** `index.html`, `bnp.html`, `threshold.html`, `things.html` at `1440 × 900` (`7.97` screens on home), `1024 × 900`, `390 × 844` (`11.96` screens on home), and `320 × 720`, light and dark — 0 overflow, 0 console/page errors, 0 broken images, WCAG 2.2 AA contrast on every pair, body ≥ 16 px, floor ≥ 13 px, targets ≥ 44 px.
- **Not checked:** Real iPhone / iOS Safari, desktop Safari, VoiceOver / screen reader, forced colours.
