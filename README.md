# Medico To Home

Home healthcare marketplace for Kozhikode and Malappuram: families book verified doctors, nurses, therapists and caregivers at home.

Live: https://medicotohome.com · Admin: https://admin.medicotohome.com · API: https://api.medicotohome.com

## Stack
- **Web:** Next.js 16 + React 19 + Tailwind (`medico-to-home-app/apps/web`)
- **API:** Fastify 5 + Zod + node-postgres (`medico-to-home-app/apps/api`)
- **Shared:** pricing rules (`medico-to-home-app/packages/shared`)
- **Database, sign-in, files:** Supabase (Postgres + PostGIS, Google sign-in, private storage)
- **Hosting:** Hostinger VPS, Ubuntu, Nginx + PM2 + Let's Encrypt (`medico-to-home-app/deploy`)

## Run locally
```bash
cd medico-to-home-app
cp .env.example .env.local   # fill in, see SUPABASE_SETUP.md
npm install
npm run dev                  # web on :3000, API on :4000
```

## CI/CD
`.github/workflows/ci-cd.yml` type-checks, lints, tests and builds every push and pull request.
A push to `main` that passes is deployed to the VPS automatically. Manual deploy from a Mac:
`SERVER=root@<vps-ip> bash medico-to-home-app/deploy/deploy.sh`

More: [architecture](medico-to-home-app/ARCHITECTURE.md) · [Supabase setup](medico-to-home-app/SUPABASE_SETUP.md)
