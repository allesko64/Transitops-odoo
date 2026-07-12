import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { requirePageRole } from "@/lib/rbac";
import { VehicleTable } from "@/components/vehicles/vehicle-table";

export default async function VehiclesPage() {
  await requirePageRole(["admin", "fleet_manager"]);

  const allVehicles = await db
    .select()
    .from(vehicles)
    .orderBy(vehicles.registrationNumber);

  return <VehicleTable vehicles={allVehicles} />;
}
