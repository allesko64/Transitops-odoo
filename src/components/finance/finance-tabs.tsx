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
import { SortHeader, type SortDirection } from "@/components/ui/sort-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels/finance";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeCostPerVehicle, type CostRow } from "@/lib/analytics";
import {
  FinanceFilters,
  ALL_VALUE,
  type FinanceFilterState,
} from "@/components/finance/finance-filters";
import { FuelLogFormDialog } from "@/components/finance/fuel-log-form-dialog";
import { ExpenseFormDialog } from "@/components/finance/expense-form-dialog";
import { ExportCsvButton } from "@/components/shared/export-csv-button";

const EMPTY_FILTERS: FinanceFilterState = {
  search: "",
  vehicleId: ALL_VALUE,
  dateFrom: "",
  dateTo: "",
};

function filterByVehicleAndDate<T extends { vehicleId: string; date: string }>(
  items: T[],
  filters: FinanceFilterState,
  vehicleMap: Map<string, string>,
  tripMap: Map<string, string>,
  getSearchText?: (item: T) => string[]
): T[] {
  return items.filter((item) => {
    if (filters.vehicleId !== ALL_VALUE && item.vehicleId !== filters.vehicleId) return false;
    if (filters.dateFrom && item.date < filters.dateFrom) return false;
    if (filters.dateTo && item.date > filters.dateTo) return false;

    const search = (filters.search || "").trim().toLowerCase();
    if (search) {
      const vReg = (vehicleMap.get(item.vehicleId) ?? item.vehicleId).toLowerCase();
      const tName = ("tripId" in item && typeof (item as any).tripId === "string" && (item as any).tripId
        ? (tripMap.get((item as any).tripId) ?? "")
        : "").toLowerCase();
      const extra = getSearchText ? getSearchText(item).map((s) => s.toLowerCase()) : [];
      if (!vReg.includes(search) && !tName.includes(search) && !extra.some((e) => e.includes(search))) {
        return false;
      }
    }
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

  const [fuelSortKey, setFuelSortKey] = useState<string | null>(null);
  const [fuelSortDir, setFuelSortDir] = useState<SortDirection>(null);

  const [expSortKey, setExpSortKey] = useState<string | null>(null);
  const [expSortDir, setExpSortDir] = useState<SortDirection>(null);

  const [costSortKey, setCostSortKey] = useState<string | null>("totalCost");
  const [costSortDir, setCostSortDir] = useState<SortDirection>("desc");

  function handleFuelSort(key: string) {
    if (fuelSortKey === key) {
      if (fuelSortDir === "asc") setFuelSortDir("desc");
      else if (fuelSortDir === "desc") { setFuelSortKey(null); setFuelSortDir(null); }
      else setFuelSortDir("asc");
    } else { setFuelSortKey(key); setFuelSortDir("asc"); }
  }

  function handleExpSort(key: string) {
    if (expSortKey === key) {
      if (expSortDir === "asc") setExpSortDir("desc");
      else if (expSortDir === "desc") { setExpSortKey(null); setExpSortDir(null); }
      else setExpSortDir("asc");
    } else { setExpSortKey(key); setExpSortDir("asc"); }
  }

  function handleCostSort(key: string) {
    if (costSortKey === key) {
      if (costSortDir === "asc") setCostSortDir("desc");
      else if (costSortDir === "desc") { setCostSortKey(null); setCostSortDir(null); }
      else setCostSortDir("asc");
    } else { setCostSortKey(key); setCostSortDir("asc"); }
  }

  const vehicleMap = useMemo(() => buildVehicleMap(vehicles), [vehicles]);
  const tripMap = useMemo(() => buildTripMap(trips), [trips]);

  const filteredFuel = useMemo(
    () => filterByVehicleAndDate(fuelLogs, fuelFilters, vehicleMap, tripMap, (fl) => [fl.liters, fl.cost, fl.date]),
    [fuelLogs, fuelFilters, vehicleMap, tripMap]
  );

  const sortedFuel = useMemo(() => {
    if (!fuelSortKey || !fuelSortDir) return filteredFuel;
    return [...filteredFuel].sort((a, b) => {
      let valA: any = a[fuelSortKey as keyof FuelLog];
      let valB: any = b[fuelSortKey as keyof FuelLog];

      if (fuelSortKey === "vehicle") {
        valA = vehicleMap.get(a.vehicleId) ?? a.vehicleId;
        valB = vehicleMap.get(b.vehicleId) ?? b.vehicleId;
      } else if (fuelSortKey === "trip") {
        valA = a.tripId ? tripMap.get(a.tripId) ?? "" : "";
        valB = b.tripId ? tripMap.get(b.tripId) ?? "" : "";
      } else if (fuelSortKey === "liters" || fuelSortKey === "cost") {
        valA = parseFloat(a[fuelSortKey]);
        valB = parseFloat(b[fuelSortKey]);
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return fuelSortDir === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA ?? "").toLowerCase();
      const strB = String(valB ?? "").toLowerCase();
      return fuelSortDir === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredFuel, fuelSortKey, fuelSortDir, vehicleMap, tripMap]);

  const filteredExpenses = useMemo(
    () =>
      filterByVehicleAndDate(expenses, expenseFilters, vehicleMap, tripMap, (ex) => [
        EXPENSE_CATEGORY_LABELS[ex.category] || ex.category,
        ex.amount,
        ex.note ?? "",
        ex.date,
      ]),
    [expenses, expenseFilters, vehicleMap, tripMap]
  );

  const sortedExpenses = useMemo(() => {
    if (!expSortKey || !expSortDir) return filteredExpenses;
    return [...filteredExpenses].sort((a, b) => {
      let valA: any = a[expSortKey as keyof Expense];
      let valB: any = b[expSortKey as keyof Expense];

      if (expSortKey === "vehicle") {
        valA = vehicleMap.get(a.vehicleId) ?? a.vehicleId;
        valB = vehicleMap.get(b.vehicleId) ?? b.vehicleId;
      } else if (expSortKey === "trip") {
        valA = a.tripId ? tripMap.get(a.tripId) ?? "" : "";
        valB = b.tripId ? tripMap.get(b.tripId) ?? "" : "";
      } else if (expSortKey === "category") {
        valA = EXPENSE_CATEGORY_LABELS[a.category] || a.category;
        valB = EXPENSE_CATEGORY_LABELS[b.category] || b.category;
      } else if (expSortKey === "amount") {
        valA = parseFloat(a.amount);
        valB = parseFloat(b.amount);
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return expSortDir === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA ?? "").toLowerCase();
      const strB = String(valB ?? "").toLowerCase();
      return expSortDir === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredExpenses, expSortKey, expSortDir, vehicleMap, tripMap]);

  const costRows = useMemo(
    () => computeCostPerVehicle(fuelLogs, expenses, vehicleMap).filter((r) => r.totalCost > 0),
    [fuelLogs, expenses, vehicleMap]
  );

  const sortedCostRows = useMemo(() => {
    if (!costSortKey || !costSortDir) return costRows;
    return [...costRows].sort((a, b) => {
      const valA: any = a[costSortKey as keyof CostRow];
      const valB: any = b[costSortKey as keyof CostRow];
      if (typeof valA === "number" && typeof valB === "number") {
        return costSortDir === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA ?? "").toLowerCase();
      const strB = String(valB ?? "").toLowerCase();
      return costSortDir === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [costRows, costSortKey, costSortDir]);

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
              <div className="flex gap-2">
                <ExportCsvButton href="/api/export/fuel" />
                <FuelLogFormDialog
                  trigger={<Button>Add Fuel Log</Button>}
                  vehicles={vehicles}
                  trips={trips}
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader
                      label="Vehicle"
                      columnKey="vehicle"
                      sortKey={fuelSortKey}
                      sortDir={fuelSortDir}
                      onSort={handleFuelSort}
                    />
                    <SortHeader
                      label="Trip"
                      columnKey="trip"
                      sortKey={fuelSortKey}
                      sortDir={fuelSortDir}
                      onSort={handleFuelSort}
                    />
                    <SortHeader
                      label="Liters"
                      columnKey="liters"
                      sortKey={fuelSortKey}
                      sortDir={fuelSortDir}
                      onSort={handleFuelSort}
                      align="right"
                    />
                    <SortHeader
                      label="Cost"
                      columnKey="cost"
                      sortKey={fuelSortKey}
                      sortDir={fuelSortDir}
                      onSort={handleFuelSort}
                      align="right"
                    />
                    <SortHeader
                      label="Date"
                      columnKey="date"
                      sortKey={fuelSortKey}
                      sortDir={fuelSortDir}
                      onSort={handleFuelSort}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFuel.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        {fuelLogs.length === 0
                          ? "No fuel logs yet. Add your first fuel log to get started."
                          : "No fuel logs match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedFuel.map((fl) => (
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
              <div className="flex gap-2">
                <ExportCsvButton href="/api/export/expenses" />
                <ExpenseFormDialog
                  trigger={<Button>Add Expense</Button>}
                  vehicles={vehicles}
                  trips={trips}
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader
                      label="Vehicle"
                      columnKey="vehicle"
                      sortKey={expSortKey}
                      sortDir={expSortDir}
                      onSort={handleExpSort}
                    />
                    <SortHeader
                      label="Trip"
                      columnKey="trip"
                      sortKey={expSortKey}
                      sortDir={expSortDir}
                      onSort={handleExpSort}
                    />
                    <SortHeader
                      label="Category"
                      columnKey="category"
                      sortKey={expSortKey}
                      sortDir={expSortDir}
                      onSort={handleExpSort}
                    />
                    <SortHeader
                      label="Amount"
                      columnKey="amount"
                      sortKey={expSortKey}
                      sortDir={expSortDir}
                      onSort={handleExpSort}
                      align="right"
                    />
                    <SortHeader
                      label="Note"
                      columnKey="note"
                      sortKey={expSortKey}
                      sortDir={expSortDir}
                      onSort={handleExpSort}
                    />
                    <SortHeader
                      label="Date"
                      columnKey="date"
                      sortKey={expSortKey}
                      sortDir={expSortDir}
                      onSort={handleExpSort}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {expenses.length === 0
                          ? "No expenses yet. Add your first expense to get started."
                          : "No expenses match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedExpenses.map((ex) => (
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
            <div className="flex justify-end">
              <ExportCsvButton href="/api/export/cost-summary" />
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader
                      label="Vehicle"
                      columnKey="registration"
                      sortKey={costSortKey}
                      sortDir={costSortDir}
                      onSort={handleCostSort}
                    />
                    <SortHeader
                      label="Fuel Cost"
                      columnKey="fuelCost"
                      sortKey={costSortKey}
                      sortDir={costSortDir}
                      onSort={handleCostSort}
                      align="right"
                    />
                    <SortHeader
                      label="Expenses"
                      columnKey="expenseCost"
                      sortKey={costSortKey}
                      sortDir={costSortDir}
                      onSort={handleCostSort}
                      align="right"
                    />
                    <SortHeader
                      label="Total Cost"
                      columnKey="totalCost"
                      sortKey={costSortKey}
                      sortDir={costSortDir}
                      onSort={handleCostSort}
                      align="right"
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCostRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No cost data yet. Add fuel logs or expenses to see totals.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCostRows.map((row) => (
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
