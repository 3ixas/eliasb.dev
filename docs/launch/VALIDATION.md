# Launch validation

Final-slice verification date: 2026-09-22.

The release-verification fix is based on worker revision `09c986fea2881c7f7c7ccb44b1a1e83c0dd66f5e`. The exact code revision used for the final-slice checks and browser run is `8f85ee559a551370dfcfea0d73f548451b175ff9`, tested on 2026-09-22.

`pnpm verify:release` is a deterministic production contract check. It starts the local Next.js production server and inspects HTTP responses, rendered HTML, redirects, sitemap, the complete normalized indexable robots policy, and internal links. It does not prove browser focus, scrolling, disclosure behaviour, theme changes, reduced-motion rendering, responsive layout, or cross-origin iframe behaviour. Those claims require the browser QA record below.

## Final-slice claim-to-check matrix

| Claim | Check and expected result | Evidence / status |
| --- | --- | --- |
| The root route is the canonical one-page surface. | `pnpm verify:release` starts the built server, requests `/`, and expects HTTP 200, the `#top` and `main#main-content` targets, and the canonical homepage HTML. | Pass: deterministic production contract check. |
| The primary navigation and homepage anchor graph are stable. | The production contract check expects Home, Work, Library, and About to target `#top`, `#work`, `#outside-work`, and `#about`; every homepage hash link must resolve to an element. Browser QA activates the links and checks the visible target. | Pass: static contract plus final-slice browser QA. |
| Required sections and copy remain present. | The production contract check checks semantic sections for Work, Outside work, Experiments, About, and Contact, their labelled headings, the approved “Some of what I’m into lately.” copy, and omission of a standalone science-fiction category. | Pass: deterministic rendered HTML check. |
| Featured Work still reaches the archive and case studies. | The production contract check checks the `/work` archive action and the Threshold and Argus Risk case-study links; route checks request `/work` and each current case-study page. | Pass: deterministic route and link checks. |
| Compatibility and canonical Work routes remain valid. | `pnpm verify:routes` checks permanent `/about`, `/library`, and `/lab` redirects, canonical Work URLs, the sitemap route set, and exclusion of compatibility paths from the sitemap. Browser QA requests each compatibility route. | Pass: route contract plus browser QA. |
| Desktop and mobile layouts remain usable. | Final-slice browser QA runs the built site at desktop and `390px` mobile widths, checks responsive layout and horizontal overflow, and opens long-content surfaces. Browser QA is the evidence for responsive behaviour. | Pass: final-slice browser QA. |
| Keyboard navigation, focus, headings, anchors, disclosures, and source links remain usable. | Final-slice browser QA uses keyboard focus, activates the skip link and anchor navigation, opens and closes native disclosures, and checks visible source links and their external link targets. The production contract check verifies the focusable `#top`, `main`, and section targets plus the static markup contract. | Pass: final-slice browser QA plus deterministic markup checks. |
| Reduced-motion behaviour remains available. | Final-slice browser QA creates a reduced-motion context and checks that the page remains visible without waiting for entrance motion. Browser QA is the evidence for reduced-motion behaviour. | Pass: final-slice browser QA. |
| Light and dark themes retain readable site-owned content. | Final-slice browser QA activates the theme toggle and checks the rendered page remains readable. Browser QA is the evidence for theme behaviour. | Pass: final-slice browser QA. |
| Long content, images, and Spotify fallback remain reviewable. | The production contract check checks long experiment descriptions, image alternatives and responsive image sources, the titled official Spotify iframe, and the visible `Open playlist in Spotify` direct link. Browser QA checks the fallback link and the responsive panel. | Pass: static markup contract plus final-slice browser QA. |
| Signal states remain truthful and identifiable. | `pnpm verify:signals` renders the production signal presentation with deterministic fixtures for live, cached, authored/curated, missing/pending, and fallback/unavailable states and asserts visible status, freshness, and source wording. The production build check observes the current network result separately; one network build does not cover every state. | Pass: deterministic state fixtures plus current rendered output. |
| Quality gates run at the final revision. | Run `pnpm lint`, `pnpm exec tsc --noEmit --incremental false`, `pnpm verify:signals`, `SITE_INDEXABLE=true pnpm build --webpack`, `pnpm verify:routes`, `pnpm verify:release`, and `git diff --check` in that order. | Pass when each command exits 0; observations are recorded below. |
| The Spotify accessibility findings have a known platform boundary. | Site-owned checks cover the titled iframe and direct fallback link. Spotify’s cross-origin iframe retains its own ARIA list-structure and subdued-track contrast findings, which the site cannot modify without hiding the player. | Accepted limitation: keep the accessible fallback and recheck if the embed changes. |

## Final-slice command observations

These commands were run from the worktree at code revision `8f85ee559a551370dfcfea0d73f548451b175ff9` on 2026-09-22.

| Command | Observation |
| --- | --- |
| `pnpm lint` | Passed. |
| `pnpm exec tsc --noEmit --incremental false` | Passed. |
| `pnpm verify:signals` | Passed. The deterministic mapper, fallback, and five-state presentation fixtures, including live and pending fantasy states, passed. |
| `SITE_INDEXABLE=true pnpm build --webpack` | Passed. The current production build completed successfully. |
| `pnpm verify:routes` | Passed. Redirect, canonical, and sitemap checks passed against the built server. |
| `pnpm verify:release` | Passed. Deterministic production contract checks passed against the built server. |
| `/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 /private/tmp/eliasb_release_browser_qa.py` | Passed in installed Chromium at desktop and `390px` mobile widths; Firefox and WebKit executables were unavailable. |
| `git diff --check` | Passed. |

## Final-slice browser QA

Browser QA was run against the local production build at code revision `8f85ee559a551370dfcfea0d73f548451b175ff9` on 2026-09-22. The local Playwright runtime was used from `/Library/Frameworks/Python.framework/Versions/3.13/bin/python3`; it is already installed on the workstation and was not added to project dependencies or CI.

The run covered the installed Chromium engine at a desktop viewport and `390px` mobile width. It checked the homepage, Work archive, all current case studies, and compatibility routes. On the homepage it verified keyboard focus and visible focus rings, `#top` anchor navigation, skip-link navigation, native reading/cinema/experiment disclosures, the theme toggle, reduced-motion rendering, source links, the Spotify direct fallback link, responsive single-column signal and playlist layout, and horizontal-overflow absence. Compatibility routes returned their expected redirects and the target anchors rendered.

Observed result: all requested browser checks passed in installed Chromium on the local built slice. Firefox and WebKit were skipped because their Playwright browser executables are not installed on this workstation; no browser download or project dependency was added for this verification. Native Safari WebDriver remains outside this run because macOS requires enabling Safari’s `Allow Remote Automation` setting.

## Historical launch evidence

The browser and deployment evidence dated 15 September 2026 below is retained as historical launch context. It is not final-slice proof for the release-verification fix or for any later revision.

- The selected Cabinet homepage, Work, Lab, Library, and About routes were previously exercised at desktop and `390px` mobile widths in Chromium, Firefox, and WebKit.
- The earlier launch checks covered the skip link, primary navigation, disclosures, source links, Spotify embeds, lazy-loaded imagery, reduced motion, themes, overflow, and site-origin console errors.
- The old site remains preserved at `https://eliasb-v1.vercel.app`; the launch deployment was previously served at `https://www.eliasb.dev`, with `https://eliasb.dev` redirecting to it. No deployment or external integration change is part of this verification fix.

The Spotify limitation remains unchanged. Spotify’s cross-origin iframe retains its own ARIA list-structure and subdued-track contrast findings. The site supplies a titled embed and a keyboard-visible direct Spotify link as the accessible fallback.
