import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { vehicles, trips, fuelLogs, expenses } from "@/db/schema";
import { requirePageRole } from "@/lib/rbac";
import { computeCostPerVehicle, computeFuelEfficiency, computeRoiPerVehicle } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VehicleReportPrintButton } from "@/components/vehicles/vehicle-report-print-button";

export default async function VehicleReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageRole(["admin", "fleet_manager", "financial_analyst"]);
  const { id } = await params;

  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
  if (!vehicle) {
    notFound();
  }

  const [vehicleTrips, vehicleFuelLogs, vehicleExpenses] = await Promise.all([
    db.select().from(trips).where(eq(trips.vehicleId, id)).orderBy(trips.createdAt),
    db.select().from(fuelLogs).where(eq(fuelLogs.vehicleId, id)).orderBy(fuelLogs.date),
    db.select().from(expenses).where(eq(expenses.vehicleId, id)).orderBy(expenses.date),
  ]);

  const vehicleMap = new Map([[vehicle.id, vehicle.registrationNumber]]);
  const [costRow] = computeCostPerVehicle(vehicleFuelLogs, vehicleExpenses, vehicleMap);
  const [efficiencyRow] = computeFuelEfficiency([vehicle], vehicleTrips, vehicleFuelLogs);
  const [roiRow] = computeRoiPerVehicle([costRow], vehicleTrips);

  const completedTrips = vehicleTrips.filter((t) => t.status === "completed");

  return (
    <div className="mx-auto grid max-w-3xl gap-4 p-4 sm:p-6 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to vehicle
        </Link>
        <VehicleReportPrintButton />
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Cost & ROI Report</h1>
        <p className="text-sm text-muted-foreground">
          {vehicle.registrationNumber} · Generated {formatDate(new Date().toISOString().slice(0, 10))}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Fuel Cost</dt>
              <dd className="text-sm font-medium">{formatCurrency(costRow.fuelCost)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Expense Cost</dt>
              <dd className="text-sm font-medium">{formatCurrency(costRow.expenseCost)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total Cost</dt>
              <dd className="text-sm font-semibold">{formatCurrency(costRow.totalCost)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Revenue (completed trips)</dt>
              <dd className="text-sm font-medium">{formatCurrency(roiRow.revenue)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">ROI</dt>
              <dd className="text-sm font-medium">
                {roiRow.roiPercent === null ? "—" : `${roiRow.roiPercent}%`}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Fuel Efficiency</dt>
              <dd className="text-sm font-medium">
                {efficiencyRow.kmPerLiter === null ? "—" : `${efficiencyRow.kmPerLiter} km/L`}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completed Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-right">Distance (km)</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedTrips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No completed trips yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  completedTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">
                        {trip.origin} → {trip.destination}
                      </TableCell>
                      <TableCell className="text-right">
                        {trip.startOdometer !== null && trip.endOdometer !== null
                          ? (trip.endOdometer - trip.startOdometer).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {trip.revenue ? formatCurrency(trip.revenue) : "—"}
                      </TableCell>
                      <TableCell>
                        {trip.completedAt ? formatDate(trip.completedAt.toISOString().slice(0, 10)) : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
