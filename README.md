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

## Features

- **Vehicles / Drivers / Trips / Maintenance / Finance** — full CRUD + state-machine transitions
  (dispatch, complete, cancel, suspend, retire, open/close maintenance), each transactional and
  race-safe.
- **Dashboard** — live KPIs, filterable by type/status/region, plus a license-expiry reminders
  widget (amber ≤30 days, red expired) with a stubbed in-app "Notify" action.
- **Analytics** — fuel efficiency, operational cost, ROI, and monthly fuel spend, computed live
  from source rows (never a stored/stale aggregate).
- **CSV export** — trips, fuel logs, expenses, and cost summary, each behind a confirm dialog.
- **Per-vehicle report** — printable cost/ROI report page (`/vehicles/[id]/report`) using print
  CSS, no PDF library.
- **Vehicle documents** — link-based document list per vehicle with an expiry flag.
- **Dark mode**, loading skeletons, and a mobile-responsive shell (collapsible nav, horizontally
  scrollable tables).
- **RBAC** — five roles (admin, fleet_manager, dispatcher, safety_officer, financial_analyst),
  enforced server-side on every action and route, not just hidden in the nav.

## Project layout

- `src/db/` — schema, DB client
- `src/actions/` — server actions (all validation + transactions live here)
- `src/lib/` — auth, query helpers, RBAC, analytics/CSV/format helpers
- `src/components/` — screen-specific UI, grouped by domain
- `src/app/` — routes
- `docs/demo-script.md` — click-by-click demo walkthrough, timed
- `docs/qa-crib-sheet.md` — the "why" behind the core architecture decisions

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

## Decisions log

- **Status lives on the vehicle/driver row only**, never duplicated elsewhere — one fact, one
  home. The `trips` table is the history; current status is a different question.
- **Race safety via conditional `UPDATE`, not `SELECT`-then-`UPDATE`** — dispatch/complete/cancel/
  maintenance all flip status inside a transaction with a `WHERE status = 'available'` guard; 0
  rows affected means someone else won, and the caller gets a clear rejection instead of
  corrupting state.
- **Metrics (KPIs, cost, ROI, efficiency) are computed on every read**, not cached — a stored
  aggregate goes stale the moment a new fuel log lands; computing from source rows means the
  numbers are never wrong.
- **RBAC is a single `requireRole(allowed[])` guard**, called first in every server action —
  five static roles don't need a permissions framework; a guard function is auditable line by
  line.
- **PDF export is print CSS, not a generated file** — `/vehicles/[id]/report` hides the app
  chrome and lets the browser's native print-to-PDF do the work; no PDF library was added.
- **Vehicle documents are links, not uploads** — no object storage was wired up for this build, so
  the `documents` feature stores a name + URL + optional expiry date rather than pretending to
  host files.
- **License-expiry email is honestly stubbed** — `notifyDriverLicenseExpiry` logs to the server
  console instead of pretending to send mail through a provider that isn't configured.

More detail (and the full Q&A) is in [`docs/qa-crib-sheet.md`](docs/qa-crib-sheet.md).

## Screenshots

Not included in this pass — no browser/screenshot tooling was available when this README was
last updated (2026-07-12). Capture a few before the real demo: dashboard, trips dispatch, and the
analytics charts are the most useful three.
