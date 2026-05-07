#!/usr/bin/env bash
set -euo pipefail

npm run build

npm run pages-preview -- --host 127.0.0.1 --port 4173 >/tmp/worldvoice-preview.log 2>&1 &
server_pid=$!

cleanup() {
  kill "$server_pid" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in {1..40}; do
  if curl -fsS http://127.0.0.1:4173/worldvoice/ >/dev/null; then
    break
  fi
  sleep 0.25
done

npx playwright test
