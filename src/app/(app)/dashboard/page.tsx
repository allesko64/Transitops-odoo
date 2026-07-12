import { db } from "@/db";
import { vehicles, trips, drivers } from "@/db/schema";
import { requirePageRole } from "@/lib/rbac";
import { computeLicenseReminders } from "@/lib/license-reminders";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const session = await requirePageRole([
    "admin",
    "fleet_manager",
    "dispatcher",
    "safety_officer",
    "financial_analyst",
  ]);

  const today = new Date().toISOString().slice(0, 10);

  const [allVehicles, tripRows, allDrivers] = await Promise.all([
    db.select().from(vehicles).orderBy(vehicles.registrationNumber),
    db
      .select({
        id: trips.id,
        vehicleId: trips.vehicleId,
        driverId: trips.driverId,
        status: trips.status,
      })
      .from(trips),
    db.select().from(drivers),
  ]);

  const tripVehicles = allVehicles
    .filter((v) => v.status === "available")
    .map((v) => ({ id: v.id, registrationNumber: v.registrationNumber, capacityKg: v.capacityKg }));

  const tripDrivers = allDrivers
    .filter((d) => d.status === "available" && d.licenseExpiry > today)
    .map((d) => ({ id: d.id, name: d.name }));

  const maintenanceVehicles = allVehicles
    .filter((v) => v.status === "available")
    .map((v) => ({ id: v.id, registrationNumber: v.registrationNumber }));

  const licenseReminders = computeLicenseReminders(allDrivers, today);

  return (
    <DashboardView
      role={session.role}
      vehicles={allVehicles}
      trips={tripRows}
      tripVehicles={tripVehicles}
      tripDrivers={tripDrivers}
      maintenanceVehicles={maintenanceVehicles}
      licenseReminders={licenseReminders}
    />
  );
}
