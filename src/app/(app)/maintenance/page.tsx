import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { maintenanceLogs, vehicles } from "@/db/schema";
import { requirePageRole } from "@/lib/rbac";
import { MaintenanceTable } from "@/components/maintenance/maintenance-table";

export default async function MaintenancePage() {
  await requirePageRole(["admin", "fleet_manager"]);

  const [logRows, eligibleVehicles] = await Promise.all([
    db
      .select({
        id: maintenanceLogs.id,
        vehicleRegistration: vehicles.registrationNumber,
        description: maintenanceLogs.description,
        cost: maintenanceLogs.cost,
        status: maintenanceLogs.status,
        openedAt: maintenanceLogs.openedAt,
        closedAt: maintenanceLogs.closedAt,
      })
      .from(maintenanceLogs)
      .innerJoin(vehicles, eq(maintenanceLogs.vehicleId, vehicles.id))
      .orderBy(desc(maintenanceLogs.openedAt)),
    db
      .select({ id: vehicles.id, registrationNumber: vehicles.registrationNumber })
      .from(vehicles)
      .where(eq(vehicles.status, "available")),
  ]);

  return <MaintenanceTable logs={logRows} eligibleVehicles={eligibleVehicles} />;
}
