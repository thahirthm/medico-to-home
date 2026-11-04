#!/usr/bin/env bash
# Copies the email settings (SMTP_*, MAIL_FROM, ADMIN_NOTIFY_EMAIL) from your local .env.local to the VPS
# and restarts the API so it starts sending. Run from medico-to-home-app/ on your Mac:
#   SERVER=root@200.141.11.6 SSH_KEY=~/.ssh/medico_deploy bash deploy/set-mail.sh
# Only these lines are sent, over SSH; the password never appears on screen. Other server settings are kept.
set -euo pipefail
SERVER="${SERVER:?Set SERVER, e.g. SERVER=root@200.141.11.6}"
cd "$(dirname "$0")/.."
KEYS='^(SMTP_HOST|SMTP_PORT|SMTP_USER|SMTP_PASS|MAIL_FROM|ADMIN_NOTIFY_EMAIL)='

LINES="$(grep -E "$KEYS" .env.local || true)"
grep -qE '^SMTP_HOST=.+' <<<"$LINES" || { echo "SMTP_HOST is empty in .env.local"; exit 1; }
grep -qE '^SMTP_PASS=.+' <<<"$LINES" || { echo "SMTP_PASS is empty in .env.local"; exit 1; }
# Gmail shows app passwords with spaces; store it without them.
LINES="$(sed -E '/^SMTP_PASS=/{s/[" ]//g;}' <<<"$LINES")"

ssh ${SSH_KEY:+-i "$SSH_KEY"} "$SERVER" "set -e
  ENV=/srv/medico/app/.env.local
  test -f \$ENV || { echo 'Missing \$ENV on the server'; exit 1; }
  cp \$ENV \$ENV.bak-\$(date +%Y%m%d%H%M%S)
  grep -vE '$KEYS' \$ENV > \$ENV.new || true
  printf '\n# Email\n' >> \$ENV.new
  cat >> \$ENV.new
  chown medico:medico \$ENV.new && chmod 600 \$ENV.new && mv \$ENV.new \$ENV
  sudo -u medico -H bash -lc 'cd /srv/medico/app && pm2 restart medico-api --update-env >/dev/null && pm2 save >/dev/null'
  sleep 4
  curl -fsS http://127.0.0.1:4000/health >/dev/null && echo 'Email settings saved and API restarted.'
  grep -oE '$KEYS' \$ENV | tr -d = | tr '\n' ' '; echo" <<<"$LINES"
