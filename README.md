# Bi Art — Advertising & Media Production Website

Professional website for **Bi Art**, an advertising agency established in 2007. Built with Next.js, Prisma, SQLite, and NextAuth.

## Features

- **Public site**: Home, Services, Packages, Portfolio (filter/search), Contact
- **Booking flow**: 4-step package → date/time → contact → confirm
- **B2B client accounts**: Registration, login, personal dashboard
- **Admin panel**: Manage bookings, packages, services, B users, media, messages

## Getting Started

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Admin  | admin@biart.com    | admin123   |
| Client | client@example.com | client123  |

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — SQLite path (default: `file:./dev.db`)
- `AUTH_SECRET` — Session secret for NextAuth

## Tech Stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- Prisma + SQLite
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
```

## Admin Panel

Visit `/admin` after logging in as admin to manage:

- Bookings (status updates, delete)
- Packages & pricing
- Services
- B Users & their active packages
- Portfolio media
- Contact form messages

## Client Dashboard

Visit `/dashboard` after logging in as a B user to view:

- Contact information
- Active package details
- Booking history
