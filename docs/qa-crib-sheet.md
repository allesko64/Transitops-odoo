# Q&A Crib Sheet

Own these answers — reviewed by all four before the demo.

## Core architecture

**Race condition (double-dispatch)**
Every status-changing action runs a conditional `UPDATE … WHERE status = 'available'` inside a
DB transaction, not a `SELECT` followed by an `UPDATE`. If two dispatches race, the database
itself serializes the two `UPDATE`s — the second one affects 0 rows, and 0 rows affected is the
signal to roll back with "no longer available." Invalid state is impossible, not unlikely,
because the guard is a property of the SQL statement, not application logic.

**Why status lives only on the vehicle/driver row, not derived elsewhere**
One fact, one home. If status were also stored on a related row (e.g., "last known status" on a
trip), the two copies could disagree, and nothing enforces which one is truth. The `trips` table
is the *history* — status right now is a different question from what happened over time, and
conflating them is how systems get bugs where the UI and the DB argue with each other.

**Why metrics (KPIs, cost, ROI, fuel efficiency) are computed live, not stored**
A stored aggregate goes stale the instant a new fuel log or trip lands, and now you need a job
to keep it in sync — which is one more thing that can silently break. Computing from source rows
on every read means the numbers are never wrong, only ever a query away from up to date. It costs
a bit more CPU per request; on this dataset size that trade is free.

**Why role-column RBAC instead of a permissions framework**
Five static roles, checked by one `requireRole(allowed[])` call as the first line of every server
action. A framework buys flexibility we don't need and a surface we'd have to audit instead of
just reading. Four static roles is a switch statement's worth of complexity — a guard function is
auditable line-by-line in the PR diff.

**Retired-in-shop edge case**
Closing a maintenance log normally restores the vehicle to Available — *unless* it was retired
while sitting in the shop, in which case closing the log leaves it Retired. Retirement is
terminal; maintenance being open or closed doesn't get to override that.

## Bonus features, if asked

**Why is "PDF export" just a print-CSS page, not a generated PDF file?**
No PDF library was added — the report route is a normal page with `print:hidden` on the app
chrome (topbar/sidebar) and a "Print" button that calls `window.print()`. The browser's own
print-to-PDF does the rest. It's honest about what it is: a print stylesheet, not a PDF service.

**Why are vehicle documents links, not uploaded files?**
No object storage (S3-equivalent) was wired up for this build, so "upload" would have meant
storing files on the app server's disk — which doesn't survive a redeploy and doesn't scale past
one instance. A `url` + optional expiry date is honest about that constraint and still satisfies
the actual need: a place to find the document and a flag when it's expiring.

**Why does the license-expiry "email" just log to the console?**
No email provider (SMTP/SendGrid/etc.) is configured. Rather than fake a "sent" state, the notify
action logs a structured line server-side — an honestly-stubbed transport, swappable for a real
one behind the same function signature later.

**Why are Phase 8/9/10/11 changes one branch instead of five?**
Time-boxed after the original four-branch, four-owner build; the tracker itself notes this as a
deviation from the branch-per-feature convention and flags it for a proper PR before it's
considered "merged" by the usual process.
