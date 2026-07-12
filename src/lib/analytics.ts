import type { Vehicle, Trip, FuelLog, Expense } from "@/db/schema";

export type CostRow = {
  vehicleId: string;
  registration: string;
  fuelCost: number;
  expenseCost: number;
  totalCost: number;
};

// Reused by Finance (5.3) and Analytics (8.1): Σ fuel + Σ expenses per vehicle.
export function computeCostPerVehicle(
  fuelLogs: Pick<FuelLog, "vehicleId" | "cost">[],
  expenses: Pick<Expense, "vehicleId" | "amount">[],
  vehicleMap: Map<string, string>
): CostRow[] {
  const map = new Map<string, CostRow>();

  for (const [id, reg] of vehicleMap) {
    map.set(id, { vehicleId: id, registration: reg, fuelCost: 0, expenseCost: 0, totalCost: 0 });
  }

  for (const fl of fuelLogs) {
    const row = map.get(fl.vehicleId);
    if (row) row.fuelCost += parseFloat(fl.cost);
  }

  for (const ex of expenses) {
    const row = map.get(ex.vehicleId);
    if (row) row.expenseCost += parseFloat(ex.amount);
  }

  for (const row of map.values()) {
    row.totalCost = row.fuelCost + row.expenseCost;
  }

  return Array.from(map.values()).sort((a, b) => b.totalCost - a.totalCost);
}

export type EfficiencyRow = {
  vehicleId: string;
  registration: string;
  distanceKm: number;
  liters: number;
  kmPerLiter: number | null;
};

// Completed-trip distance (odometer delta) ÷ total liters logged for that vehicle.
export function computeFuelEfficiency(
  vehicles: Pick<Vehicle, "id" | "registrationNumber">[],
  trips: Pick<Trip, "vehicleId" | "status" | "startOdometer" | "endOdometer">[],
  fuelLogs: Pick<FuelLog, "vehicleId" | "liters">[]
): EfficiencyRow[] {
  const distanceByVehicle = new Map<string, number>();
  for (const t of trips) {
    if (t.status !== "completed") continue;
    if (t.startOdometer === null || t.endOdometer === null) continue;
    distanceByVehicle.set(
      t.vehicleId,
      (distanceByVehicle.get(t.vehicleId) ?? 0) + (t.endOdometer - t.startOdometer)
    );
  }

  const litersByVehicle = new Map<string, number>();
  for (const fl of fuelLogs) {
    litersByVehicle.set(fl.vehicleId, (litersByVehicle.get(fl.vehicleId) ?? 0) + parseFloat(fl.liters));
  }

  return vehicles.map((v) => {
    const distanceKm = distanceByVehicle.get(v.id) ?? 0;
    const liters = litersByVehicle.get(v.id) ?? 0;
    return {
      vehicleId: v.id,
      registration: v.registrationNumber,
      distanceKm,
      liters,
      kmPerLiter: liters > 0 ? Math.round((distanceKm / liters) * 100) / 100 : null,
    };
  });
}

export type RoiRow = {
  vehicleId: string;
  registration: string;
  revenue: number;
  cost: number;
  roiPercent: number | null;
};

// ROI% = (revenue - cost) / cost, from completed-trip revenue vs. cost-per-vehicle (8.1).
export function computeRoiPerVehicle(
  costRows: CostRow[],
  trips: Pick<Trip, "vehicleId" | "status" | "revenue">[]
): RoiRow[] {
  const revenueByVehicle = new Map<string, number>();
  for (const t of trips) {
    if (t.status !== "completed" || !t.revenue) continue;
    revenueByVehicle.set(t.vehicleId, (revenueByVehicle.get(t.vehicleId) ?? 0) + parseFloat(t.revenue));
  }

  return costRows.map((row) => {
    const revenue = revenueByVehicle.get(row.vehicleId) ?? 0;
    return {
      vehicleId: row.vehicleId,
      registration: row.registration,
      revenue,
      cost: row.totalCost,
      roiPercent:
        row.totalCost > 0
          ? Math.round(((revenue - row.totalCost) / row.totalCost) * 1000) / 10
          : null,
    };
  });
}

export type MonthlyFuelSpend = { month: string; spend: number };

export function computeMonthlyFuelSpend(
  fuelLogs: Pick<FuelLog, "date" | "cost">[]
): MonthlyFuelSpend[] {
  const byMonth = new Map<string, number>();
  for (const fl of fuelLogs) {
    const month = fl.date.slice(0, 7); // YYYY-MM
    byMonth.set(month, (byMonth.get(month) ?? 0) + parseFloat(fl.cost));
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, spend]) => ({ month, spend: Math.round(spend * 100) / 100 }));
}
