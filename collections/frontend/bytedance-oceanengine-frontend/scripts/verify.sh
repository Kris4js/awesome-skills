#!/usr/bin/env bash
# Usage: verify.sh <http(s) URL> [--output <directory>] [target…]
# Checks templates first, then the explicit properties in references/verify.json.
# No names: all configured targets must exist. Differences and absences exit nonzero.
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)"
if [[ $# -eq 0 ]]; then
  echo 'Usage: verify.sh <http(s) URL> [--output <directory>] [target…]' >&2
  exit 2
fi
"$dir/typecheck-templates.sh"
exec node "$dir/runner.mjs" verify "$@"
