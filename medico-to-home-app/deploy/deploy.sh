#!/usr/bin/env bash
# Sends this code to the VPS, builds it there and restarts the apps. Run from medico-to-home-app/ on your Mac:
#   SERVER=root@203.0.113.10 bash deploy/deploy.sh
# Secrets are never sent: .env.local is excluded and lives only on the server.
set -euo pipefail
SERVER="${SERVER:?Set SERVER, e.g. SERVER=root@203.0.113.10}"
cd "$(dirname "$0")/.."

rsync -az --delete \
  --exclude node_modules --exclude .next --exclude dist --exclude '.env*' --exclude '*.tsbuildinfo' --exclude .DS_Store \
  ./ "$SERVER:/srv/medico/app/"

ssh "$SERVER" 'set -e
  chown -R medico:medico /srv/medico
  test -f /srv/medico/app/.env.local || { echo "Missing /srv/medico/app/.env.local on the server"; exit 1; }
  ln -sf ../../.env.local /srv/medico/app/apps/web/.env.local
  sudo -u medico -H bash -l /srv/medico/app/deploy/remote-build.sh
  sleep 5
  curl -fsS http://127.0.0.1:4000/health && echo
  curl -fsS -o /dev/null -w "website: %{http_code}\n" http://127.0.0.1:3000/'
