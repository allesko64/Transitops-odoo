import { db } from "@/db";
import { drivers } from "@/db/schema";
import { requirePageRole } from "@/lib/rbac";
import { DriverTable } from "@/components/drivers/driver-table";

export default async function DriversPage() {
  await requirePageRole(["admin", "safety_officer"]);

  const allDrivers = await db
    .select()
    .from(drivers)
    .orderBy(drivers.name);

  return <DriverTable drivers={allDrivers} />;
}
