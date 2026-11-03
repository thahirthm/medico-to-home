#!/usr/bin/env bash
# One-time setup of a fresh Hostinger VPS (Ubuntu 24.04). Run as root:
#   bash setup-server.sh medicotohome.in you@example.com
# Installs Node 22, PM2, Nginx and a free HTTPS certificate, and opens only ports 22, 80 and 443.
set -euo pipefail
DOMAIN="${1:?Usage: setup-server.sh <domain> <email-for-ssl>}"
EMAIL="${2:?Usage: setup-server.sh <domain> <email-for-ssl>}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx ufw certbot python3-certbot-nginx rsync

if ! command -v node >/dev/null || ! node -v | grep -q '^v22'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
npm install -g pm2

# Building Next.js needs more memory than a small VPS has; a swap file prevents the build being killed.
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# The app runs as its own user, not root.
id -u medico >/dev/null 2>&1 || adduser --disabled-password --gecos "" medico
mkdir -p /srv/medico/app
chown -R medico:medico /srv/medico

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

sed "s/__DOMAIN__/${DOMAIN}/g" /srv/medico/app/deploy/nginx.conf.template > /etc/nginx/sites-available/medico
ln -sf /etc/nginx/sites-available/medico /etc/nginx/sites-enabled/medico
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Start the apps again after a reboot.
env PATH="$PATH" pm2 startup systemd -u medico --hp /home/medico

# HTTPS needs the domain's DNS pointing here first. Set SKIP_SSL=1 to add it later by running this script again.
if [ -z "${SKIP_SSL:-}" ]; then
  certbot --nginx --non-interactive --agree-tos -m "$EMAIL" --redirect \
    -d "$DOMAIN" -d "www.$DOMAIN" -d "admin.$DOMAIN" -d "api.$DOMAIN"
fi
echo "Server ready."
