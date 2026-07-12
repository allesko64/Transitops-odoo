"use client";

import { useMemo, useState } from "react";

import type { FuelLog, Expense, Vehicle, Trip } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels/finance";
import {
  FinanceFilters,
  ALL_VALUE,
  type FinanceFilterState,
} from "@/components/finance/finance-filters";
import { FuelLogFormDialog } from "@/components/finance/fuel-log-form-dialog";
import { ExpenseFormDialog } from "@/components/finance/expense-form-dialog";

const EMPTY_FILTERS: FinanceFilterState = {
  vehicleId: ALL_VALUE,
  dateFrom: "",
  dateTo: "",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function filterByVehicleAndDate<T extends { vehicleId: string; date: string }>(
  items: T[],
  filters: FinanceFilterState
): T[] {
  return items.filter((item) => {
    if (filters.vehicleId !== ALL_VALUE && item.vehicleId !== filters.vehicleId) return false;
    if (filters.dateFrom && item.date < filters.dateFrom) return false;
    if (filters.dateTo && item.date > filters.dateTo) return false;
    return true;
  });
}

// Build a vehicle lookup map
function buildVehicleMap(vehicles: Vehicle[]) {
  const map = new Map<string, string>();
  for (const v of vehicles) {
    map.set(v.id, v.registrationNumber);
  }
  return map;
}

// Build a trip lookup map
function buildTripMap(trips: Trip[]) {
  const map = new Map<string, string>();
  for (const t of trips) {
    map.set(t.id, `${t.origin} → ${t.destination}`);
  }
  return map;
}

// Cost per vehicle calculation
type CostRow = {
  vehicleId: string;
  registration: string;
  fuelCost: number;
  expenseCost: number;
  totalCost: number;
};

function computeCostPerVehicle(
  fuelLogs: FuelLog[],
  expenses: Expense[],
  vehicleMap: Map<string, string>
): CostRow[] {
  const map = new Map<string, CostRow>();

  for (const [id, reg] of vehicleMap) {
    map.set(id, { vehicleId: id, registration: reg, fuelCost: 0, expenseCost: 0, totalCost: 0 });
  }

  for (const fl of fuelLogs) {
    const row = map.get(fl.vehicleId);
    if (row) {
      row.fuelCost += parseFloat(fl.cost);
    }
  }

  for (const ex of expenses) {
    const row = map.get(ex.vehicleId);
    if (row) {
      row.expenseCost += parseFloat(ex.amount);
    }
  }

  for (const row of map.values()) {
    row.totalCost = row.fuelCost + row.expenseCost;
  }

  return Array.from(map.values())
    .filter((r) => r.totalCost > 0)
    .sort((a, b) => b.totalCost - a.totalCost);
}

export function FinanceTabs({
  fuelLogs,
  expenses,
  vehicles,
  trips,
}: {
  fuelLogs: FuelLog[];
  expenses: Expense[];
  vehicles: Vehicle[];
  trips: Trip[];
}) {
  const [fuelFilters, setFuelFilters] = useState<FinanceFilterState>(EMPTY_FILTERS);
  const [expenseFilters, setExpenseFilters] = useState<FinanceFilterState>(EMPTY_FILTERS);

  const vehicleMap = useMemo(() => buildVehicleMap(vehicles), [vehicles]);
  const tripMap = useMemo(() => buildTripMap(trips), [trips]);

  const filteredFuel = useMemo(
    () => filterByVehicleAndDate(fuelLogs, fuelFilters),
    [fuelLogs, fuelFilters]
  );

  const filteredExpenses = useMemo(
    () => filterByVehicleAndDate(expenses, expenseFilters),
    [expenses, expenseFilters]
  );

  const costRows = useMemo(
    () => computeCostPerVehicle(fuelLogs, expenses, vehicleMap),
    [fuelLogs, expenses, vehicleMap]
  );

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Finance</h1>
      </div>

      <Tabs defaultValue={0}>
        <TabsList>
          <TabsTrigger value={0}>Fuel Logs</TabsTrigger>
          <TabsTrigger value={1}>Expenses</TabsTrigger>
          <TabsTrigger value={2}>Cost per Vehicle</TabsTrigger>
        </TabsList>

        {/* Fuel Logs Tab */}
        <TabsContent value={0}>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <FinanceFilters
                filters={fuelFilters}
                onFiltersChange={setFuelFilters}
                vehicles={vehicles}
              />
              <FuelLogFormDialog
                trigger={<Button>Add Fuel Log</Button>}
                vehicles={vehicles}
                trips={trips}
              />
            </div>

            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead className="text-right">Liters</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFuel.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        {fuelLogs.length === 0
                          ? "No fuel logs yet. Add your first fuel log to get started."
                          : "No fuel logs match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFuel.map((fl) => (
                      <TableRow key={fl.id}>
                        <TableCell className="font-medium">
                          {vehicleMap.get(fl.vehicleId) ?? fl.vehicleId}
                        </TableCell>
                        <TableCell>
                          {fl.tripId ? tripMap.get(fl.tripId) ?? "—" : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(fl.liters).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(fl.cost)}
                        </TableCell>
                        <TableCell>{formatDate(fl.date)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value={1}>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <FinanceFilters
                filters={expenseFilters}
                onFiltersChange={setExpenseFilters}
                vehicles={vehicles}
              />
              <ExpenseFormDialog
                trigger={<Button>Add Expense</Button>}
                vehicles={vehicles}
                trips={trips}
              />
            </div>

            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {expenses.length === 0
                          ? "No expenses yet. Add your first expense to get started."
                          : "No expenses match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((ex) => (
                      <TableRow key={ex.id}>
                        <TableCell className="font-medium">
                          {vehicleMap.get(ex.vehicleId) ?? ex.vehicleId}
                        </TableCell>
                        <TableCell>
                          {ex.tripId ? tripMap.get(ex.tripId) ?? "—" : "—"}
                        </TableCell>
                        <TableCell>
                          {EXPENSE_CATEGORY_LABELS[ex.category]}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(ex.amount)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {ex.note || "—"}
                        </TableCell>
                        <TableCell>{formatDate(ex.date)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Cost per Vehicle Tab */}
        <TabsContent value={2}>
          <div className="grid gap-4">
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Fuel Cost</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No cost data yet. Add fuel logs or expenses to see totals.
                      </TableCell>
                    </TableRow>
                  ) : (
                    costRows.map((row) => (
                      <TableRow key={row.vehicleId}>
                        <TableCell className="font-medium">{row.registration}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.fuelCost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.expenseCost)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(row.totalCost)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
