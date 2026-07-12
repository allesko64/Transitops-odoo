# TransitOps

Fleet operations platform — vehicles, drivers, trips, maintenance, fuel/expenses, dashboard & analytics.

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Start Postgres**
   ```bash
   docker compose up -d
   ```
3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Defaults already point at the local Docker Postgres (port 5433).
4. **Push the schema**
   ```bash
   pnpm drizzle-kit push
   ```
5. **Seed demo data**
   ```bash
   pnpm seed
   ```
   Truncates and re-inserts everything — safe to re-run anytime. See [Demo credentials](#demo-credentials) below.
6. **Run the dev server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js (App Router, TS, Tailwind) · Drizzle ORM + Postgres · Better Auth · shadcn/ui · Recharts · Zod + React Hook Form

## Project layout

- `src/db/` — schema, DB client
- `src/actions/` — server actions (all validation + transactions live here)
- `src/lib/` — auth, query helpers
- `src/components/` — screen-specific UI, grouped by domain
- `src/app/` — routes

## Demo credentials

Created by `pnpm seed` (one account per role):

| Role | Email | Password |
|---|---|---|
| Admin | admin@transitops.app | Admin@12345 |
| Fleet Manager | fleetmanager@transitops.app | Fleet@12345 |
| Dispatcher | dispatcher@transitops.app | Dispatch@12345 |
| Safety Officer | safety@transitops.app | Safety@12345 |
| Financial Analyst | finance@transitops.app | Finance@12345 |

Seed data reserves registration **Van-05** and driver **Alex** for the live demo — neither exists in seeded data.
