# Bi Art — Advertising & Media Production Website

Professional website for **Bi Art**, an advertising agency established in 2007. Built with Next.js, Prisma, SQLite/Turso, and NextAuth.

## Features

- **Public site**: Home, Services, Packages, Portfolio (filter/search), Contact
- **Booking flow**: Multi-step package or service booking with consultation credits
- **B2B client accounts**: Registration, login, profile & dashboard
- **Admin panel**: Manage bookings, packages, services, B users, media, messages
- **Bilingual**: Georgian / English with language switcher

## Getting Started (Local)

```bash
npm install
cp .env.example .env
# Edit .env — set AUTH_SECRET (openssl rand -base64 32)

npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role     | Email                   | Password     |
|----------|-------------------------|--------------|
| Admin    | admin@biart.com         | admin123     |
| Client   | client@example.com      | client123    |
| Prospect | prospect@example.com    | prospect123  |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Local | SQLite file path, e.g. `file:./dev.db` |
| `TURSO_DATABASE_URL` | Vercel | Turso libSQL URL, e.g. `libsql://your-db-org.turso.io` |
| `TURSO_AUTH_TOKEN` | Vercel | Turso database auth token |
| `AUTH_SECRET` | Yes | NextAuth session secret — keep stable across deploys |
| `AUTH_TRUST_HOST` | Vercel | Set to `true` |

## Deploy to Vercel

SQLite **files do not work** on Vercel (ephemeral filesystem). Use **Turso** (free tier, SQLite-compatible):

### 1. Create a Turso database

```bash
# Install Turso CLI: https://docs.turso.tech/cli
turso auth login
turso db create biart --region ams
turso db show biart --url        # → TURSO_DATABASE_URL
turso db tokens create biart       # → TURSO_AUTH_TOKEN
```

### 2. Apply migrations & seed (one-time, from your machine)

```bash
export TURSO_DATABASE_URL="libsql://..."
export TURSO_AUTH_TOKEN="..."
npm run db:migrate:deploy
npm run db:seed
```

### 3. Configure Vercel project

In **Vercel → Settings → Environment Variables** (Production):

| Name | Value |
|------|-------|
| `TURSO_DATABASE_URL` | `libsql://your-db-org.turso.io` |
| `TURSO_AUTH_TOKEN` | your token |
| `AUTH_SECRET` | same secret as local (or generate new) |
| `AUTH_TRUST_HOST` | `true` |

Do **not** set `DATABASE_URL` to a `file:` path on Vercel.

### 4. Deploy

Push to `main` (or connect your feature branch). The build script automatically:

1. Applies migrations to Turso (when `TURSO_DATABASE_URL` is set)
2. Builds the Next.js app with dynamic rendering (no build-time DB queries)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- Prisma + SQLite (local) / Turso (production)
- NextAuth.js (credentials)
- Lucide React icons

## Project Structure

```
src/
  app/           # Pages and routes
  components/    # UI, layout, admin, booking
  lib/           # DB, auth, actions, utils
  generated/     # Prisma client
prisma/          # Schema, migrations, seed
scripts/         # Build & migration helpers
```

## Admin Panel

Visit `/admin` after logging in as admin.

## Client Dashboard

Visit `/profile` (account) or `/dashboard` (bookings & package) after logging in as a B user.
