#!/usr/bin/env bash
# Runs on the VPS as the medico user (called by deploy.sh): install, build, restart.
set -euo pipefail
cd /srv/medico/app
npm ci --no-audit --no-fund
bash deploy/linux-natives.sh
# A failed earlier build can leave a broken cache behind, so always build fresh.
rm -rf apps/web/.next
npm run build
pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save
