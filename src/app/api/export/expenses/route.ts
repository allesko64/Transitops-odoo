import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { expenses, vehicles, trips } from "@/db/schema";
import { requireRoleOr403 } from "@/lib/api-guard";
import { toCsv, csvResponseHeaders } from "@/lib/csv";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels/finance";

export async function GET() {
  const denied = await requireRoleOr403(["admin", "financial_analyst"]);
  if (denied) return denied;

  const rows = await db
    .select({
      registrationNumber: vehicles.registrationNumber,
      origin: trips.origin,
      destination: trips.destination,
      category: expenses.category,
      amount: expenses.amount,
      note: expenses.note,
      date: expenses.date,
    })
    .from(expenses)
    .innerJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
    .leftJoin(trips, eq(expenses.tripId, trips.id))
    .orderBy(expenses.date);

  const csv = toCsv(
    ["Vehicle", "Trip", "Category", "Amount", "Note", "Date"],
    rows.map((r) => [
      r.registrationNumber,
      r.origin && r.destination ? `${r.origin} → ${r.destination}` : "",
      EXPENSE_CATEGORY_LABELS[r.category],
      r.amount,
      r.note ?? "",
      r.date,
    ])
  );

  return new NextResponse(csv, { headers: csvResponseHeaders("expenses.csv") });
}
