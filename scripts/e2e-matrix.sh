#!/usr/bin/env bash
# Runs the Playwright matrix on a small Mac: one project at a time, one worker, and only
# while the machine is idle. Free memory is not a safe signal (it read 45% while the load
# average was 75 to 200 and swap was full, and every WebKit run timed out), so each project
# waits for a low load average and swap that is not nearly full.
#
#   scripts/e2e-matrix.sh                         all 16 projects (build first: pnpm build)
#   PROJECTS="chromium-390-dark webkit-820-light" scripts/e2e-matrix.sh
#   scripts/e2e-matrix.sh hero entrance           spec filters pass through to Playwright
#
# MAX_LOAD (default 6), MAX_SWAP_PERCENT (80), MAX_FAILURES (5: stop a project early when
# the machine is struggling), WAIT_MINUTES (30). Logs and summary.txt go to $OUT_DIR.
set -u
cd "$(dirname "$0")/.."

OUT_DIR="${OUT_DIR:-${TMPDIR:-/tmp}/e2e-matrix}"
MAX_LOAD="${MAX_LOAD:-6}"
MAX_SWAP_PERCENT="${MAX_SWAP_PERCENT:-80}"
MAX_FAILURES="${MAX_FAILURES:-5}"
WAIT_MINUTES="${WAIT_MINUTES:-30}"
ALL_PROJECTS=""
for browser in chromium webkit; do for width in 320 390 820 1440; do for scheme in light dark; do
  ALL_PROJECTS="$ALL_PROJECTS $browser-$width-$scheme"
done; done; done

load() { sysctl -n vm.loadavg | awk '{print int($2)}'; }
swap_percent() { sysctl -n vm.swapusage | awk '{t=$3+0; u=$6+0; print (t>0) ? int(100*u/t) : 0}'; }

mkdir -p "$OUT_DIR"
: > "$OUT_DIR/summary.txt"
status=0
for project in ${PROJECTS:-$ALL_PROJECTS}; do
  waited=0
  while [ "$(load)" -ge "$MAX_LOAD" ] || [ "$(swap_percent)" -ge "$MAX_SWAP_PERCENT" ]; do
    if [ "$waited" -ge "$((WAIT_MINUTES * 60))" ]; then
      echo "$project not run: the machine stayed busy (load $(load), swap $(swap_percent)%)" | tee -a "$OUT_DIR/summary.txt"
      exit 2
    fi
    sleep 20; waited=$((waited + 20))
  done
  E2E_PORT="${E2E_PORT:-3100}" NODE_OPTIONS=--max-old-space-size=1024 \
    pnpm exec playwright test "$@" --project="$project" --workers=1 --retries=0 \
    --max-failures="$MAX_FAILURES" --reporter=line > "$OUT_DIR/$project.log" 2>&1
  code=$?
  [ "$code" -ne 0 ] && status=1
  counts="$(sed -E 's/\x1b\[[0-9;]*[A-Za-z]//g' "$OUT_DIR/$project.log" | grep -E '^\s+[0-9]+ (passed|failed|skipped|flaky|did not run)' | tr -s ' ' | tr '\n' ' ')"
  echo "$project exit $code |$counts| load $(load), swap $(swap_percent)%" | tee -a "$OUT_DIR/summary.txt"
done
exit "$status"
