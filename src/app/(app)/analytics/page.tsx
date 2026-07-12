import { db } from "@/db";
import { vehicles, trips, fuelLogs, expenses } from "@/db/schema";
import { requirePageRole } from "@/lib/rbac";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export default async function AnalyticsPage() {
  await requirePageRole(["admin", "fleet_manager", "financial_analyst"]);

  const [allVehicles, allTrips, allFuelLogs, allExpenses] = await Promise.all([
    db.select().from(vehicles).orderBy(vehicles.registrationNumber),
    db.select().from(trips),
    db.select().from(fuelLogs),
    db.select().from(expenses),
  ]);

  return (
    <AnalyticsView
      vehicles={allVehicles}
      trips={allTrips}
      fuelLogs={allFuelLogs}
      expenses={allExpenses}
    />
  );
}
