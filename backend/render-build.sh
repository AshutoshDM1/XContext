#!/usr/bin/env bash
set -euo pipefail

# Prefer Render's native Bun if available; otherwise install Bun locally.
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi

bun --version

# CI-style install: fail if lockfile would change.
bun install --frozen-lockfile

bun run build
