// PM2 keeps the website and the API running, and restarts them after a crash or a server reboot.
// Both read /srv/medico/app/.env.local (the website through the apps/web/.env.local link).
module.exports = {
  apps: [
    { name: "medico-api", cwd: "/srv/medico/app", script: "npm", args: "run start -w @medico/api", env: { NODE_ENV: "production" }, max_memory_restart: "400M" },
    { name: "medico-web", cwd: "/srv/medico/app", script: "npm", args: "run start -w @medico/web", env: { NODE_ENV: "production", PORT: "3000" }, max_memory_restart: "700M" },
  ],
};
