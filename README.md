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
5. **Run the dev server**
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

_Filled in once the seed script (Phase 6) lands — see [MASTER_TRACKER.md](MASTER_TRACKER.md)._
