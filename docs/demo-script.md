# Demo Script

Click-by-click sequence for the live demo. Target: **≤ 5 minutes**. Rehearse twice against a
freshly-seeded database before the real run (`pnpm seed` resets everything, including any
`Van-05` vehicle or `Alex` driver created in a previous rehearsal — reseed before every rehearsal
and before the real demo).

Speaker tags match the tracker's owner shorthand: **[A]** lead/backend, **[B]** drivers & finance,
**[C]** dashboard & analytics, **[D]** data/narration. Adjust to who's actually presenting.

---

## 0. Before you start (not part of the timed run)

- `pnpm seed` — fresh data, guaranteed state.
- Have four browser windows (or one + fast account-switching) logged in as: **Admin**,
  **Dispatcher**, **Fleet Manager**, **Financial Analyst**. Credentials are in the README.
- Confirm Postgres is up (`docker compose ps`) and `pnpm dev` is running.

---

## 1. RBAC & shell (30s) — [A]

1. Log in as **Dispatcher** → note the sidebar only shows Dashboard and Trips.
2. Log in as **Admin** → sidebar shows everything, including **Users**.
3. Say: "Every nav link and every server action re-checks the role — the sidebar is a
   convenience, not the security boundary."

## 2. The template pattern — Vehicles (30s) — [A]

1. As Admin, open **Vehicles**. Point out the filter row (search / type / status / region).
2. Click **Register Vehicle**, create `Van-05` (type: van, capacity: 1000, region: Delhi).
3. Point out the same file pattern (page / table / form-dialog / filters) was copied for
   Drivers, Maintenance, and the Finance tabs.

## 3. Dispatch — the heart of the app (90s) — [A]

1. Open **Trips** (as Dispatcher, or Admin). Click **Create Trip**.
2. Show the vehicle dropdown only lists `available` vehicles, driver dropdown only lists
   `available` drivers with a non-expired license.
3. Create a trip for `Van-05` with a driver, cargo just under capacity → save as draft.
4. Click **Dispatch** → vehicle flips to "On Trip", driver flips to "On Trip", trip flips to
   "Dispatched".
5. **Deliberate failure — double dispatch:** open the same trip in a second tab/window and
   click Dispatch again (or dispatch two drafts pointed at the same vehicle in quick succession).
   Show the second attempt gets "Vehicle is no longer available" — the conditional `UPDATE …
   WHERE status = 'available'` inside a transaction means exactly one wins, not "probably one."
6. **Deliberate failure — overweight:** try creating a trip with cargo > capacity → rejected
   with a clear message, both in the live capacity hint and on submit.
7. **Deliberate failure — expired license:** try dispatching a trip assigned to a driver whose
   license has expired (seed data includes one) → rejected server-side even if the client
   validation were bypassed.
8. Complete the trip: enter an end odometer, optional fuel log, optional revenue → vehicle and
   driver both return to "Available", odometer updates, fuel log appears on the Finance screen
   if you entered one.

## 4. Maintenance & the retired-in-shop edge case (30s) — [A]

1. Open **Maintenance**, open a log against an available vehicle → vehicle vanishes from the
   Trips dispatch dropdown immediately.
2. Point out: a vehicle **On Trip** or already **Retired** can't be selected here.
3. Close the log → vehicle is available again.
4. Mention the edge case (don't have to demo it live unless time allows): if a vehicle is
   retired while in the shop, closing the maintenance log does **not** un-retire it —
   retirement is terminal.

## 5. Drivers & Finance (30s) — [B]

1. Open **Drivers** — point out the expiry column: red for expired, amber for ≤30 days.
2. Try suspending a driver who's currently on a trip → rejected with a toast, no silent failure.
3. Open **Finance** — Fuel Logs / Expenses / Cost per Vehicle tabs. Add a fuel log, watch the
   Cost per Vehicle tab update immediately (nothing is a stale stored aggregate).
4. Click **Export CSV** on any tab → confirm dialog → downloads.

## 6. Dashboard & license reminders (30s) — [C]

1. Open **Dashboard** — KPI cards (available/active/in-maintenance vehicles, active/pending
   trips, drivers on duty, fleet utilization).
2. Point at the **License Expiry Reminders** card — amber for ≤30 days, red for expired. Click
   **Notify** on one row → toast confirms; mention the email transport is honestly stubbed
   (check the server console log, not an inbox).
3. Dispatch the trip from step 3 again (or note the one already dispatched) → refresh → Active
   Trips count moves, utilization recalculates live.

## 7. Analytics & reports (45s) — [C]

1. Open **Analytics** — four charts: cost per vehicle, fuel efficiency (km/L), monthly fuel
   spend, ROI per vehicle (red bars = losing money).
2. Hover a bar — only that bar highlights, tooltip shows the exact number.
3. From **Vehicles**, click into any vehicle → **View Cost & ROI Report** → point out it's a
   plain print-styled page (`Ctrl/Cmd+P` → Save as PDF) with the nav/sidebar hidden — no PDF
   library, just print CSS.
4. On the same vehicle page, show the **Documents** tab — add a document link, point out the
   expiry flag logic, delete it with the confirm dialog.

## 8. Dark mode & mobile (15s) — [C]

1. Toggle dark mode in the topbar — charts, badges, everything stays legible.
2. Shrink the browser to phone width (or open dev tools device toolbar) — sidebar collapses to
   a horizontal scroll strip, tables scroll horizontally instead of clipping.

## 9. Close (10s) — [D]

"Every state transition here is a guarded, transactional flip on one row — no duplicated status
fields, no polling, no stale aggregates. That's the whole app."

---

## Timing budget

| Section | Target |
|---|---|
| 1–2 RBAC + template | 1:00 |
| 3 Dispatch + failures | 1:30 |
| 4 Maintenance | 0:30 |
| 5 Drivers + Finance | 0:30 |
| 6 Dashboard + reminders | 0:30 |
| 7 Analytics + reports | 0:45 |
| 8 Dark mode + mobile | 0:15 |
| 9 Close | 0:10 |
| **Total** | **~5:00** |

Cut section 8 first if running long — it's the least load-bearing for judging correctness.
