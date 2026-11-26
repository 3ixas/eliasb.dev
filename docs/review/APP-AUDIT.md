# App audit

- **Date:** 26 November 2026
- **Commit:** `14f4a40` on `main`, as served at `https://www.eliasb.dev`
- **Pass:** the final pass ([#533](https://github.com/3ixas/eliasb.dev/issues/533)), closed by [#545](https://github.com/3ixas/eliasb.dev/issues/545). The diagnosis and its findings are in [2026-11-25-final-pass/FINDINGS.md](2026-11-25-final-pass/FINDINGS.md): 43 findings, 42 picked, F-03 declined by design.

## Areas

| Area | Result | Evidence and limits |
|---|---|---|
| Delivery and discoverability | Fixed | Cache headers, `/favicon.ico`, share-card hashes ([#561](https://github.com/3ixas/eliasb.dev/pull/561)), read back from production. `eliasb-dev.vercel.app` answers 308 to `www.eliasb.dev` (F-39) |
| Product behaviour | Fixed | The picked findings, and two found by the closing walkthrough ([#568](https://github.com/3ixas/eliasb.dev/issues/568), [#569](https://github.com/3ixas/eliasb.dev/issues/569)) |
| Stateful risks | Not applicable | No accounts, forms or saved server state. The screenshot viewer's open and cancel race (F-01) is fixed and tested |
| Accessibility | Pass | axe reports 0 violations on every public route and the open states, at 390 and 1440 px in both themes, in CI. No screen reader or physical device was used |
| Responsive craft, consistency and copy | Fixed | The picked craft, motion and writing findings; worst-case data check extended to the newer components |
| Performance | Accepted gap | See below; follow-up [#572](https://github.com/3ixas/eliasb.dev/issues/572) |
| Security | Fixed | Next.js 16.4.5 clears seven moderate advisories ([#551](https://github.com/3ixas/eliasb.dev/pull/551)); `Cross-Origin-Opener-Policy` added. No dedicated security audit ran |
| Types and code | Fixed | F-34 to F-38; unused locals and parameters fail `tsc`, and lint allows no warnings |

## Lighthouse

Lighthouse 12.8.2, mobile, simulated throttling, sequential runs against production on one M1 laptop. Medians, with the range in brackets. "Before" is the [baseline](2026-11-25-final-pass/FINDINGS.md#lighthouse-baseline) at `53bfac0`, 5 runs per route.

| Route | Runs | Perf | LCP s | TBT ms | CLS | FCP s | Speed Index s | Transfer KB | JS KB |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 15 | 96 [96–99] | 2.70 [1.86–2.73] | 41 [25–120] | 0.000 | 1.22 | 1.32 | 379 | 179 |
| `/work/bnp-paribas` | 5 | 98 [98–99] | 2.40 [1.98–2.41] | 23 [13–39] | 0.000 | 0.98 | 1.03 | 367 | 200 |
| `/work/joveen` | 5 | 98 [98–100] | 2.35 [1.58–2.41] | 15 [10–38] | 0.000 | 0.93 | 1.02 | 406 | 200 |
| `/work/optegra` | 5 | 99 [98–100] | 1.95 [1.56–2.41] | 22 [19–29] | 0.000 | 1.06 | 1.16 | 429 | 200 |
| `/things-i-make` | 5 | 99 [98–100] | 2.11 [1.55–2.41] | 26 [12–45] | 0.000 | 1.06 | 1.26 | 470 | 212 |
| `/things-i-make/threshold` | 5 | 98 [98–98] | 2.41 [2.32–2.43] | 28 [15–46] | 0.000 | 0.93 | 0.94 | 396 | 212 |
| `/things-i-make/argus-risk` | 5 | 98 [98–100] | 2.41 [1.55–2.43] | 42 [8–46] | 0.000 | 0.92 | 0.93 | 388 | 212 |
| `/things-i-make/flowtime` | 5 | 98 [98–99] | 2.40 [1.96–2.43] | 39 [23–51] | 0.000 | 0.91 | 0.91 | 384 | 212 |

| Route | LCP s, before | TBT ms, before |
|---|---|---|
| `/` | 2.86 | 258 |
| `/work/bnp-paribas` | 2.70 | 293 |
| `/work/joveen` | 2.58 | 214 |
| `/work/optegra` | 2.71 | 182 |
| `/things-i-make` | 2.64 | 18 |
| `/things-i-make/threshold` | 2.63 | 20 |
| `/things-i-make/argus-risk` | 2.63 | 19 |
| `/things-i-make/flowtime` | 2.63 | 23 |

Transfer and JS are summed from each run's network requests; compare them with the baseline's as indicative only.

### Targets

The target set on 25 November (D1) was LCP at most 2.0 s on the Role stories and about 2.5 s elsewhere. On 26 November Elias set **about 2.5 s for every route**, then accepted the two gaps below.

- **LCP:** met on seven routes. `/` is 2.70 s over 15 runs. An earlier set of 5 at `8c183f2` had a median of 2.23 s; single runs cluster near 2.0 s and 2.7 s. The time is render delay on the opening heading.
- **CLS at most 0.05:** met, 0.000 everywhere.
- **TBT not worse than baseline:** far lower on `/` and the Role stories. The archive and case studies are 8 to 23 ms higher, with single runs spread from 8 to 51 ms.
- **Lanyard TBT under 100 ms (F-12):** met on `/` and BNP Paribas.
- **Archive image load delay under 500 ms (F-32):** 589 ms median [26–1249]. Accepted; in [#572](https://github.com/3ixas/eliasb.dev/issues/572).

## Walkthrough

A fresh agent used the live site in a browser at 390 and 1440 px, in both themes, twice.

1. First run: two defects, fixed in [#570](https://github.com/3ixas/eliasb.dev/pull/570) and [#571](https://github.com/3ixas/eliasb.dev/pull/571).
2. After the fixes: it reported that Escape left the screenshot viewer open. A headless Chrome check on production, motion on, closed it with focus returned in 18 of 18 tries across three routes and both themes, so nothing changed. The likely cause, inferred, is that its browser had stopped drawing frames. It found nothing else worth fixing.

**Limit:** both runs saw the top of each page; screenshots further down failed, so lower sections were checked through page text, measurements and interaction. Touch gestures, a screen reader and the Résumé download were not exercised.

## Gates added

All run in the `Quality` workflow.

| Gate | Guards |
|---|---|
| `standing-checks` axe | Every public route and the open states, 390 and 1440 px, both themes, WCAG 2.2 AA |
| `verify:release` | Opener policy, lanyard caching, favicon redirect, share-card addresses |
| `worst-case.spec.ts` | Long values stay inside their boxes in the newer components |
| `verify:copy` | The machine-readable surfaces match the copy deck |
| `verify:catalogue` | Every project has a link |
| `tsc` and lint | No unused locals or parameters; no lint warnings |
| JavaScript budget | Re-baselined once from CI's production build |

## CI

The 8-shard production Playwright matrix and the `quality` job passed on `main` at `14f4a40` ([run 45836528514](https://github.com/3ixas/eliasb.dev/actions/runs/45836528514)). The stronger axe gate arrives with this record's pull request, [#567](https://github.com/3ixas/eliasb.dev/pull/567); it passed on `4441fa4` ([run 45826633784](https://github.com/3ixas/eliasb.dev/actions/runs/45826633784)).
