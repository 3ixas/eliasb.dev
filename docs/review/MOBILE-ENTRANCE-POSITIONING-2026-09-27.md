# Mobile entrance and product positioning

## Approved scope

Source: Elias's approved “Correct the mobile entrance and align the site's positioning” plan, 27 September 2026.

Use “I build software to make everyday things easier, and more enjoyable.” Explain product judgment, design, full-stack implementation, collaboration, shipping, and iteration in the supporting text. Express everyday usefulness and enjoyable design as an ambition, not an adoption claim. Keep factual career and project evidence, personal updates, providers, the archived study, the thicker highlight, and scroll-reveal fixes intact. Remove em dashes from authored live copy and metadata.

Base: `99c3fb84d6b4c39413ff6847fb013bdcccb369cb`, merged PR #72.
Branch: `codex/mobile-entrance-positioning`.

## Demonstrated failure and correction

WebKit 26.5 with an iPhone 13 profile, reduced motion disabled, and a fresh root URL:

- Original build, normal download: the complete entrance played.
- Original build, JavaScript delayed four seconds: typing started around 4.6 seconds, then the seven-second boot watchdog ended it before landing and highlighting.
- Original build, JavaScript delayed eight seconds: the watchdog fired around 7.1 seconds; when hydration finished around 8.1 seconds, the component immediately showed the completed headline.

Startup and playback now have separate deadlines. Startup fails open after 12 seconds if the component cannot mount. At mount, a lifecycle event replaces that deadline with the actual sequence duration plus two seconds of scheduling allowance. Natural completion clears the watchdog. Hydration after a startup failure does not hide content again.

After the correction, the four-second test completed naturally at about 8.9 seconds and the eight-second test at about 12.9 seconds. Blocked JavaScript exposed static content at about 12.1 seconds. No input skip handlers were added.

The headline now has explicit first and second phrases, with one complete accessible heading. The approved text also appears in the generated social image; metadata shares one description. Existing career and project introductions were read alongside the new text and retained as factual supporting evidence.

## Verification

Passed:

- `pnpm lint`
- `pnpm exec tsc --noEmit --incremental false`
- `pnpm verify:opening`, also added to CI
- `pnpm verify:signals`
- `pnpm verify:routes`
- `pnpm verify:release`, 315 checks
- `SITE_INDEXABLE=true pnpm build --webpack`
- `git diff --check`

The opening regression test fails against PR #72's boot script and passes against this change.

WebKit checks cover 1440, 820, 390, and 320px; both themes; typing, landing, highlight, and page reveal; taps, keyboard input, and scrolling; reduced motion; direct section links; `#top`; delayed and blocked bundles; disabled JavaScript; absent IntersectionObserver; once-only scroll reveals; semantic heading text; and horizontal overflow. Additional desktop and mobile runs cover reloads, visible Tab focus, and changing reduced motion during playback. Screenshots of the wrapped heading, typing cursor, About copy, and generated social card were visually inspected.

Authored live source has no remaining em dashes. Concept source and provider integration content are unchanged.

Local run evidence: `/tmp/entrance-before-results.jsonl`, `/tmp/entrance-after/results.json`, `/tmp/entrance-extra-results.jsonl`, and screenshots in `/tmp/entrance-after/`.

## Verification boundary

This reproduces and fixes a timing failure in a WebKit iPhone profile. It does not establish that the same failure caused Elias's physical iPhone symptom. Confirmation on his affected iPhone remains pending after a preview is available. This change has not been pushed or deployed.
