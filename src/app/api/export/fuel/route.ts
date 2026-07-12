import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { fuelLogs, vehicles, trips } from "@/db/schema";
import { requireRoleOr403 } from "@/lib/api-guard";
import { toCsv, csvResponseHeaders } from "@/lib/csv";

export async function GET() {
  const denied = await requireRoleOr403(["admin", "financial_analyst"]);
  if (denied) return denied;

  const rows = await db
    .select({
      registrationNumber: vehicles.registrationNumber,
      origin: trips.origin,
      destination: trips.destination,
      liters: fuelLogs.liters,
      cost: fuelLogs.cost,
      date: fuelLogs.date,
    })
    .from(fuelLogs)
    .innerJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
    .leftJoin(trips, eq(fuelLogs.tripId, trips.id))
    .orderBy(fuelLogs.date);

  const csv = toCsv(
    ["Vehicle", "Trip", "Liters", "Cost", "Date"],
    rows.map((r) => [
      r.registrationNumber,
      r.origin && r.destination ? `${r.origin} → ${r.destination}` : "",
      r.liters,
      r.cost,
      r.date,
    ])
  );

  return new NextResponse(csv, { headers: csvResponseHeaders("fuel-logs.csv") });
}
