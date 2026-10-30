#!/usr/bin/env bash
set -euo pipefail
dir="$(cd "$(dirname "$0")/.." && pwd)"
if [[ ! -x "$dir/node_modules/.bin/tsc" ]]; then
  echo 'Install dependencies in the skill directory first: npm ci --ignore-scripts' >&2
  exit 1
fi
"$dir/node_modules/.bin/tsc" --noEmit -p "$dir/tsconfig.json"
echo 'templates and gallery: typecheck ok'
