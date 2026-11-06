#!/bin/sh
# Rewrites the materials spec's baselines inside the Playwright image CI runs in, so they match what CI renders.
# A picture taken on macOS differs from CI's by font smoothing, so a baseline never comes from here directly.
# Needs Docker. See docs/runbooks/visual-baselines.md.
set -eu
cd "$(dirname "$0")/.."

# The image is read from the workflow, so the baselines cannot come from a different release than the one that checks them.
image=$(sed -n 's/^ *image: *\(mcr\.microsoft\.com\/playwright:[^ ]*\)$/\1/p' .github/workflows/quality.yml | head -n 1)
[ -n "$image" ] || { echo "No Playwright image in .github/workflows/quality.yml" >&2; exit 1; }

# The work is done on a copy, because node_modules and .next from this machine hold macOS binaries.
docker run --rm --ipc=host -v "$PWD":/src -w /work "$image" bash -ec '
  tar -C /src --exclude=./node_modules --exclude=./.next --exclude=./.git --exclude=./test-results -cf - . | tar -C /work -xf -
  corepack enable
  pnpm install --frozen-lockfile
  SITE_INDEXABLE=true pnpm build --webpack
  pnpm exec playwright test e2e/materials.spec.ts --project=chromium-1440-light --update-snapshots
  cp -R /work/e2e/materials.spec.ts-snapshots /src/e2e/
'
