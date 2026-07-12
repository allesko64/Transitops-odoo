import { NextResponse } from "next/server";
import { db } from "@/db";
import { fuelLogs, expenses, vehicles } from "@/db/schema";
import { requireRoleOr403 } from "@/lib/api-guard";
import { toCsv, csvResponseHeaders } from "@/lib/csv";
import { computeCostPerVehicle } from "@/lib/analytics";

export async function GET() {
  const denied = await requireRoleOr403(["admin", "financial_analyst"]);
  if (denied) return denied;

  const [allFuelLogs, allExpenses, allVehicles] = await Promise.all([
    db.select().from(fuelLogs),
    db.select().from(expenses),
    db.select().from(vehicles).orderBy(vehicles.registrationNumber),
  ]);

  const vehicleMap = new Map(allVehicles.map((v) => [v.id, v.registrationNumber]));
  const costRows = computeCostPerVehicle(allFuelLogs, allExpenses, vehicleMap).filter(
    (r) => r.totalCost > 0
  );

  const csv = toCsv(
    ["Vehicle", "Fuel Cost", "Expense Cost", "Total Cost"],
    costRows.map((r) => [r.registration, r.fuelCost, r.expenseCost, r.totalCost])
  );

  return new NextResponse(csv, { headers: csvResponseHeaders("cost-summary.csv") });
}
