"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Vehicle, Trip, FuelLog, Expense } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  computeCostPerVehicle,
  computeFuelEfficiency,
  computeRoiPerVehicle,
  computeMonthlyFuelSpend,
} from "@/lib/analytics";

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontSize: "0.8rem",
};

const axisTickStyle = { fill: "var(--muted-foreground)", fontSize: 12 };

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function monthLabel(month: string) {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

export function AnalyticsView({
  vehicles,
  trips,
  fuelLogs,
  expenses,
}: {
  vehicles: Vehicle[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
}) {
  const vehicleMap = useMemo(
    () => new Map(vehicles.map((v) => [v.id, v.registrationNumber])),
    [vehicles]
  );

  const costRows = useMemo(
    () => computeCostPerVehicle(fuelLogs, expenses, vehicleMap).filter((r) => r.totalCost > 0),
    [fuelLogs, expenses, vehicleMap]
  );

  const efficiencyRows = useMemo(
    () => computeFuelEfficiency(vehicles, trips, fuelLogs),
    [vehicles, trips, fuelLogs]
  );
  const efficiencyChartRows = efficiencyRows.filter((r) => r.kmPerLiter !== null);
  const efficiencyMissingCount = efficiencyRows.length - efficiencyChartRows.length;

  const roiRows = useMemo(() => computeRoiPerVehicle(costRows, trips), [costRows, trips]);

  const monthlySpend = useMemo(() => computeMonthlyFuelSpend(fuelLogs), [fuelLogs]);
  const monthlySpendChart = monthlySpend.map((m) => ({ ...m, label: monthLabel(m.month) }));

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost per Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            {costRows.length === 0 ? (
              <ChartEmptyState message="No fuel or expense data yet." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={costRows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="registration" tick={axisTickStyle} />
                  <YAxis
                    tick={axisTickStyle}
                    label={{ value: "₹", angle: 0, position: "insideLeft", fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={false}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar
                    dataKey="totalCost"
                    name="Total Cost"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    activeBar={{ fillOpacity: 0.7 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuel Efficiency (km/L)</CardTitle>
          </CardHeader>
          <CardContent>
            {efficiencyChartRows.length === 0 ? (
              <ChartEmptyState message="No completed trips with fuel data yet." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={efficiencyMissingCount > 0 ? 230 : 260}>
                  <BarChart data={efficiencyChartRows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="registration" tick={axisTickStyle} />
                    <YAxis
                      tick={axisTickStyle}
                      label={{ value: "km/L", angle: -90, position: "insideLeft", fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={false}
                      formatter={(value) => `${value} km/L`}
                    />
                    <Bar
                      dataKey="kmPerLiter"
                      name="km/L"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                      activeBar={{ fillOpacity: 0.7 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
                {efficiencyMissingCount > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {efficiencyMissingCount} vehicle{efficiencyMissingCount === 1 ? "" : "s"} have no
                    completed trips with fuel data yet.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Fuel Spend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlySpendChart.length === 0 ? (
              <ChartEmptyState message="No fuel logs yet." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlySpendChart} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={axisTickStyle} />
                  <YAxis
                    tick={axisTickStyle}
                    label={{ value: "₹", angle: 0, position: "insideLeft", fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    name="Fuel Spend"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI per Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            {roiRows.length === 0 ? (
              <ChartEmptyState message="No cost data yet." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={roiRows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="registration" tick={axisTickStyle} />
                  <YAxis
                    tick={axisTickStyle}
                    label={{ value: "%", angle: 0, position: "insideLeft", fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={false}
                    formatter={(value) => `${value}%`}
                  />
                  <Bar
                    dataKey="roiPercent"
                    name="ROI %"
                    radius={[4, 4, 0, 0]}
                    activeBar={{ fillOpacity: 0.7 }}
                  >
                    {roiRows.map((row) => (
                      <Cell
                        key={row.vehicleId}
                        fill={(row.roiPercent ?? 0) < 0 ? "#ef4444" : "#22c55e"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
