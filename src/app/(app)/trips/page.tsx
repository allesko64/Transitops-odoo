import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { trips, vehicles, drivers } from "@/db/schema";
import { requirePageRole } from "@/lib/rbac";
import { TripTable } from "@/components/trips/trip-table";

export default async function TripsPage() {
  await requirePageRole(["admin", "dispatcher"]);

  const today = new Date().toISOString().slice(0, 10);

  const [tripRows, availableVehicles, availableDrivers] = await Promise.all([
    db
      .select({
        id: trips.id,
        origin: trips.origin,
        destination: trips.destination,
        cargoKg: trips.cargoKg,
        status: trips.status,
        startOdometer: trips.startOdometer,
        vehicleRegistration: vehicles.registrationNumber,
        driverName: drivers.name,
      })
      .from(trips)
      .innerJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .innerJoin(drivers, eq(trips.driverId, drivers.id))
      .orderBy(desc(trips.createdAt)),
    db
      .select({
        id: vehicles.id,
        registrationNumber: vehicles.registrationNumber,
        capacityKg: vehicles.capacityKg,
      })
      .from(vehicles)
      .where(eq(vehicles.status, "available")),
    db
      .select({ id: drivers.id, name: drivers.name })
      .from(drivers)
      .where(and(eq(drivers.status, "available"), gt(drivers.licenseExpiry, today))),
  ]);

  return (
    <TripTable
      trips={tripRows}
      availableVehicles={availableVehicles}
      availableDrivers={availableDrivers}
    />
  );
}
