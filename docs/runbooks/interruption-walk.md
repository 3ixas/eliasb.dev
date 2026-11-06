# The interruption walk

The human half of the craft bar: feel can't be measured on a shared runner, so it is judged by hand. Run it on a real iPhone and a laptop at each sign-off, in both themes. A pull request that changes motion records which steps it ran, with a slow-motion recording.

**Pass condition, throughout:** nothing jumps, restarts from zero or is left stuck.

1. **Phone:** tap a row's object twice within 100 ms.
2. **Phone:** reopen a closer look halfway through its fold.
3. **Phone:** open a second closer look while the first is still opening.
4. **Phone:** start a tap on a row, then scroll instead. The press state clears.
5. **Phone:** scroll during an arrival, such as a pass dropping.
6. **Desktop:** sweep the pointer down a list and back up. Only the first look drops; the margin never overshoots.
7. **Desktop:** hover two rows in turn, then wheel-scroll. The margin stays with its row.
8. **Desktop:** leave a row mid-reaction, on a mini pass and a calendar tile. The swing finishes after the pointer leaves.
9. **Either:** press the Eclipse, then press it again halfway through.
10. **Either:** on a throttled connection, reload, then open and immediately close a screenshot. Nothing shows blank, and focus returns.
11. **Phone:** tap a row low on the screen. Its look comes into view, and touching the screen stops the scroll.

Steps 1 to 10 are the craft bar's ([#363](https://github.com/3ixas/eliasb.dev/issues/363)); steps 6 and 8 take the sharper conditions, and step 11 is new, from [#364](https://github.com/3ixas/eliasb.dev/issues/364).

## What the automated gates hold, so the walk doesn't have to

- **Layout shift** (`e2e/layout-shift.spec.ts`): at most 0.01 on the homepage, BNP Paribas and Threshold, on Chromium at 390 and 1440 px.
- **JavaScript size** (`pnpm check:built`): a route fails when its gzipped scripts grow more than 10% over the baseline in `scripts/js-budget.json`. After an intended change, re-measure and update the baseline in the same pull request, saying why.

## The "before" for sign-off

The site as it was before the crafted finish is the deployment of `main` at 10e9156 (6 November 2026): <https://eliasb-m4xtvxfhm-elias-projects-6b28dac4.vercel.app>. It sits behind Vercel sign-in, so open it in a signed-in browser. To find it again: `gh api repos/3ixas/eliasb.dev/deployments?sha=10e9156…` (the full SHA), then that deployment's statuses.
