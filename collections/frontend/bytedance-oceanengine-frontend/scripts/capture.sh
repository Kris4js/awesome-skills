#!/usr/bin/env bash
# Usage: capture.sh [--output <directory>] [target…]
# No names: all targets in references/capture.json. Requires ego-browser signed in.
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)"
exec node "$dir/runner.mjs" capture "$@"
