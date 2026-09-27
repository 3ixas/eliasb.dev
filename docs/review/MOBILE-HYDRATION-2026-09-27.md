# Production mobile entrance: calendar hydration mismatch

## Report and causal evidence

After PR #73, the user still saw no entrance at https://www.eliasb.dev in Chrome, Safari, and Arc Search on the iPhone, including fresh and private tabs. Production deployment dpl_25X3EtL4XvwNZqyDUqC5Y1NPUnrx was READY at merge ec992fd49f5dbe2f59c414795e5d6997e7cd7fd3.

Reproduced against the actual production domain in WebKit 26.5 with the iPhone 13 profile and reduced motion false. Root URL and #top both set data-home-opening=running, then lost it within roughly 200ms without a home-opening-started or home-opening-finish event. React emitted minified error 418 (text hydration mismatch).

Holding JavaScript requests until server HTML could be captured exposed these changes when hydration resumed:

- Server range: 28 Sept 2025 – 27 Sept 2026. Browser range: 28 Sep 2025 – 27 Sep 2026.
- Server month labels: Sept. Browser labels: Sep.
- Server selected date: Sun, 28 Sept 2025. Browser date: Sun, 28 Sep 2025.

The contribution calendar is a client component that previously called Intl.DateTimeFormat during both server and browser rendering. Different locale data produced mismatching text. React's recovery lost the pre-paint entrance state and the headline component completed immediately. The local Mac build did not expose this production/server locale difference.

Isolated causal experiment against production: override only browser Intl formatting to render Sep as Sept before scripts execute. No React error, home-opening-started at 500ms, highlight at 3997ms, revealing at 4660ms, completed at 5285ms. No deployed code was changed in this experiment.

## Correction

Use explicit English month and weekday names with UTC date parts for contribution calendar text. Both render environments now produce identical text without depending on runtime ICU/locale data. Keep the existing animation, timeout, reduced-motion, section-link, calendar interaction, and layout behaviour.

Add signal-contract regression checks for the short/full date and month-label surfaces with runtime Intl formatting disabled. Existing callers only use the documented numeric day/year and short/long month/weekday variants, now reflected in the formatter type.

## Verification

Lint, TypeScript, signal/cache contracts, opening checks, canonical routes, release checks (315), and SITE_INDEXABLE=true production webpack build passed. Browser walkthrough of the fixed build covers 1440, 820, 390, and 320px in WebKit, both themes, input during playback, delayed bundles, reduced motion, direct section links, #top, missing JavaScript, and missing IntersectionObserver. Evidence: /tmp/live-hydration-diff.cjs, /tmp/hydration-before.json, /tmp/hydration-after.json, /tmp/live-opening-locale-proof.cjs, /tmp/entrance-hydration-fixed/results.json.

The physical iPhone has not yet tested this correction. It is a local fix, not deployed. The production reproduction and isolated intervention establish the cause; final production and physical-device checks remain release steps.

## Review scope

Base 7f191d345c6c8af2d562867d9390292eeec4c7b2. Current user report is the spec. Current-run Standards and Spec review covers only the formatter, regression checks, and this report. No animation changes or unrelated scope. No actionable findings.
