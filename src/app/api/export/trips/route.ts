import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { trips, vehicles, drivers } from "@/db/schema";
import { requireRoleOr403 } from "@/lib/api-guard";
import { toCsv, csvResponseHeaders } from "@/lib/csv";
import { TRIP_STATUS_LABELS } from "@/lib/labels/trip";

export async function GET() {
  const denied = await requireRoleOr403(["admin", "dispatcher"]);
  if (denied) return denied;

  const rows = await db
    .select({
      registrationNumber: vehicles.registrationNumber,
      driverName: drivers.name,
      origin: trips.origin,
      destination: trips.destination,
      cargoKg: trips.cargoKg,
      plannedDistanceKm: trips.plannedDistanceKm,
      status: trips.status,
      startOdometer: trips.startOdometer,
      endOdometer: trips.endOdometer,
      revenue: trips.revenue,
      createdAt: trips.createdAt,
      dispatchedAt: trips.dispatchedAt,
      completedAt: trips.completedAt,
    })
    .from(trips)
    .innerJoin(vehicles, eq(trips.vehicleId, vehicles.id))
    .innerJoin(drivers, eq(trips.driverId, drivers.id))
    .orderBy(trips.createdAt);

  const csv = toCsv(
    [
      "Vehicle",
      "Driver",
      "Origin",
      "Destination",
      "Cargo (kg)",
      "Planned Distance (km)",
      "Status",
      "Start Odometer",
      "End Odometer",
      "Revenue",
      "Created At",
      "Dispatched At",
      "Completed At",
    ],
    rows.map((r) => [
      r.registrationNumber,
      r.driverName,
      r.origin,
      r.destination,
      r.cargoKg,
      r.plannedDistanceKm,
      TRIP_STATUS_LABELS[r.status],
      r.startOdometer,
      r.endOdometer,
      r.revenue,
      r.createdAt.toISOString(),
      r.dispatchedAt?.toISOString() ?? "",
      r.completedAt?.toISOString() ?? "",
    ])
  );

  return new NextResponse(csv, { headers: csvResponseHeaders("trips.csv") });
}
