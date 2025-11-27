#!/usr/bin/env bash
set -euo pipefail

URL=${1:-http://localhost:5173}
OUT=${2:-./shots}
mkdir -p "$OUT"

echo "⚡ Capturing FlowPulse overview from $URL"
if ! command -v npx >/dev/null 2>&1; then
  echo "npm/npx required" >&2
  exit 1
fi

npx playwright screenshot "$URL" "$OUT/overview.png" --device="Desktop Edge" --full-page --wait-for-timeout=2000

echo "Screenshot saved to $OUT/overview.png"
