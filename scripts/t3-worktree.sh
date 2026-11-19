#!/bin/sh
# T3 Code's project scripts (t3.json) call this from the checkout's root.
#   setup: install dependencies, copy .env.local from the main checkout, and give this
#          checkout its own dev port in .dev-port (gitignored).
#   dev:   start the dev server on that port; a checkout without .dev-port uses 3000.
# The port is derived from the checkout's path, so it stays the same across runs, and is
# kept in 3101-3999: 3000 is the main checkout's and 3100 is Playwright's default. The same
# number works as this checkout's E2E_PORT (docs/runbooks/local-testing.md).
set -eu

# Node 22 lives in /usr/local/bin on Elias's laptop; the default PATH finds an older one.
[ -d /usr/local/bin ] && PATH="/usr/local/bin:$PATH"

root=$(pwd -P)
port_file="$root/.dev-port"

# Taken: something listens on the port, or another worktree has claimed it while stopped.
taken() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1 && return 0
  git worktree list --porcelain | sed -n 's/^worktree //p' | while IFS= read -r tree; do
    [ "$(cat "$tree/.dev-port" 2>/dev/null)" = "$1" ] && echo claimed
  done | grep -q claimed
}

assign_port() {
  if [ -s "$port_file" ]; then
    echo "Dev port $(cat "$port_file") (kept from $port_file)"
    return
  fi
  hash=$(printf '%s' "$root" | cksum | cut -d' ' -f1)
  port=$((3101 + hash % 899))
  tries=0
  while taken "$port"; do
    tries=$((tries + 1))
    [ "$tries" -lt 899 ] || { echo "No free port in 3101-3999" >&2; exit 1; }
    port=$((3101 + (port - 3101 + 1) % 899))
  done
  echo "$port" >"$port_file"
  echo "Dev port $port (written to $port_file)"
}

copy_env() {
  # T3 sets T3CODE_PROJECT_ROOT; otherwise the main checkout is the common git dir's parent.
  project_root=${T3CODE_PROJECT_ROOT:-$(cd "$(git rev-parse --git-common-dir)/.." && pwd -P)}
  if [ "$project_root" = "$root" ]; then
    return
  fi
  if [ -f "$project_root/.env.local" ] && [ ! -e "$root/.env.local" ]; then
    cp "$project_root/.env.local" "$root/.env.local"
    echo "Copied .env.local from $project_root"
  fi
}

case "${1:-}" in
  setup)
    pnpm install --frozen-lockfile --prefer-offline
    copy_env
    assign_port
    ;;
  dev)
    port=$(cat "$port_file" 2>/dev/null || echo 3000)
    exec pnpm exec next dev -p "$port" -H 127.0.0.1
    ;;
  *)
    echo "Usage: scripts/t3-worktree.sh setup|dev" >&2
    exit 2
    ;;
esac
