# Visual baselines runbook

`e2e/materials.spec.ts` compares pictures of the objects' materials (shadows, lit edges, the foil seal, Optegra's colours, the project crops) with baselines in `e2e/materials.spec.ts-snapshots/`. It reads `/fixtures/materials`, which exists only with `BOARD_FIXTURES=1`, runs on one Chromium project (`chromium-1440-light`) and takes 14 pictures: seven groups, each in light and dark, at 3×.

Baselines must come from the Playwright image CI runs in, because font smoothing differs between macOS and Linux. A `-darwin` picture is never committed.

## When a picture fails

1. Download the failed shard's `playwright-shard-N` artifact; `test-results/` holds the expected, actual and diff pictures.
2. If the change is the one the pull request meant to make, update the baselines (below) and say in the pull request which pictures changed and why. If it is not, it is a defect: fix the cause.

## Updating the baselines

- With Docker: `pnpm test:visual:update`. It reads the image from `.github/workflows/quality.yml`, builds the site on a copy inside it, runs the spec with `--update-snapshots` and copies the result back. Commit the changed pictures.
- Without Docker: push the branch, take the `*-actual.png` pictures from the failed shard's artifact, and save them as the baselines' names (`<group>-<scheme>-chromium-1440-light-linux.png`).

Then run the spec once more in CI, or locally against a production build in the image, to see it pass.

## What this gate does not cover

The look of a whole page, which changes with live data and copy, and anything that takes a human eye: how the foil reads on Joveen's white card, Optegra's bright pass in dark, dark smoothing. Those belong to the sign-off walk.
