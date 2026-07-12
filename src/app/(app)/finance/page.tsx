import { db } from "@/db";
import { fuelLogs, expenses, vehicles, trips } from "@/db/schema";
import { requirePageRole } from "@/lib/rbac";
import { FinanceTabs } from "@/components/finance/finance-tabs";

export default async function FinancePage() {
  await requirePageRole(["admin", "financial_analyst"]);

  const [allFuelLogs, allExpenses, allVehicles, allTrips] = await Promise.all([
    db.select().from(fuelLogs).orderBy(fuelLogs.date),
    db.select().from(expenses).orderBy(expenses.date),
    db.select().from(vehicles).orderBy(vehicles.registrationNumber),
    db.select().from(trips).orderBy(trips.createdAt),
  ]);

  return (
    <FinanceTabs
      fuelLogs={allFuelLogs}
      expenses={allExpenses}
      vehicles={allVehicles}
      trips={allTrips}
    />
  );
}
