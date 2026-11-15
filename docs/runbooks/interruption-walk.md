# The interruption walk

The human half of the craft bar: feel can't be measured on a shared runner, so it is judged by hand. Run it on a real iPhone and a laptop at each sign-off, in both themes. A pull request that changes motion records which steps it ran, with a slow-motion recording.

**Pass condition, throughout:** nothing jumps, restarts from zero or is left stuck.

1. **Phone:** load the homepage and scroll while the three passes are still swinging to rest. They finish their swing; nothing restarts.
2. **Phone:** open Menu and close it again before it has finished opening, then tap a link in it.
3. **Phone:** scroll quickly past Work and back while the panels rise and the bars grow. Each arrives once and ends where the server drew it, and nothing armed is left blank.
4. **Phone:** start a press on a pill or a row, then scroll instead. The press clears and nothing follows.
5. **Phone:** step this week in history ("1 of 3") three times fast. Each tap moves one fact, and nothing in the panel shifts.
6. **Desktop:** sweep the pointer across the three passes and off them mid-lean. Each lean and catch of the light settles back without a jump.
7. **Desktop:** scroll the simulation into view and away again while its paths are drawing. It finishes or holds, and never redraws from zero.
8. **Desktop:** hover a project panel and leave mid-lift, then hover the next. Each screenshot settles on its own.
9. **Either:** press the Eclipse, then press it again halfway through the crossfade.
10. **Either:** on a throttled connection, reload a Role story, then open and immediately close a screenshot. Nothing shows blank, and focus returns to the screenshot.
11. **Either:** open the greeting's London time and move away before it has finished folding open.

Steps 1 to 11 replace the quiet index's walk ([#363](https://github.com/3ixas/eliasb.dev/issues/363), [#364](https://github.com/3ixas/eliasb.dev/issues/364)), which interrupted rows, closer looks and the margin; this one interrupts the passes, the panels' arrivals, the controls and the dialog ([#425](https://github.com/3ixas/eliasb.dev/issues/425)).

## What the automated gates hold, so the walk doesn't have to

- **Layout shift** (`e2e/layout-shift.spec.ts`): at most 0.01 on the homepage, BNP Paribas and Threshold, on Chromium at 390 and 1440 px.
- **Arrivals and presses** (`e2e/parts.spec.ts`): a panel rises, a figure counts and bars grow once, ending where the server drew them; an interrupted arrival is let go at once; every control answers within 100 to 250 ms.
- **JavaScript size** (`pnpm check:built`): a route fails when its gzipped scripts grow more than 10% over the baseline in `scripts/js-budget.json`. After an intended change, re-measure and update the baseline in the same pull request, saying why.

## The "before" for sign-off

The site as it was before the crafted finish is the deployment of `main` at 10e9156 (6 November 2026): <https://eliasb-m4xtvxfhm-elias-projects-6b28dac4.vercel.app>. It sits behind Vercel sign-in, so open it in a signed-in browser. To find it again: `gh api repos/3ixas/eliasb.dev/deployments?sha=10e9156…` (the full SHA), then that deployment's statuses.
