#!/usr/bin/env bash
# package-lock.json is made on a Mac and lists only the Mac builds of some tools (an npm bug).
# Run after `npm ci` on Linux (the VPS and GitHub Actions) to add their Linux builds at the installed versions:
# lightningcss and Tailwind's engine (CSS), Rollup (tests) and esbuild (API build).
set -euo pipefail
version() { node -p "JSON.parse(require('fs').readFileSync('node_modules/$1/package.json')).version"; }
npm install --no-save --no-audit --no-fund \
  "lightningcss-linux-x64-gnu@$(version lightningcss)" \
  "@tailwindcss/oxide-linux-x64-gnu@$(version @tailwindcss/oxide)" \
  "@rollup/rollup-linux-x64-gnu@$(version rollup)" \
  "@esbuild/linux-x64@$(version esbuild)"
