import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { vehicles, vehicleDocuments } from "@/db/schema";
import { requirePageRole } from "@/lib/rbac";
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_TONES, VEHICLE_TYPE_LABELS } from "@/lib/labels/vehicle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { LinkButton } from "@/components/shared/link-button";
import { VehicleDocumentsTable } from "@/components/vehicles/vehicle-documents-table";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePageRole(["admin", "fleet_manager", "financial_analyst"]);
  const { id } = await params;

  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
  if (!vehicle) {
    notFound();
  }

  const documents = await db
    .select()
    .from(vehicleDocuments)
    .where(eq(vehicleDocuments.vehicleId, id))
    .orderBy(vehicleDocuments.createdAt);

  const canManageDocuments = session.role === "admin" || session.role === "fleet_manager";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/vehicles" className="text-sm text-muted-foreground hover:underline">
            ← Vehicles
          </Link>
          <h1 className="text-2xl font-semibold">{vehicle.registrationNumber}</h1>
        </div>
        <LinkButton href={`/vehicles/${vehicle.id}/report`} variant="outline">
          View Cost & ROI Report
        </LinkButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Type</dt>
              <dd className="text-sm font-medium">{VEHICLE_TYPE_LABELS[vehicle.type]}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd>
                <StatusBadge tone={VEHICLE_STATUS_TONES[vehicle.status]}>
                  {VEHICLE_STATUS_LABELS[vehicle.status]}
                </StatusBadge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Region</dt>
              <dd className="text-sm font-medium">{vehicle.region}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Capacity</dt>
              <dd className="text-sm font-medium">{vehicle.capacityKg.toLocaleString()} kg</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Odometer</dt>
              <dd className="text-sm font-medium">{vehicle.odometer.toLocaleString()} km</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <VehicleDocumentsTable vehicleId={vehicle.id} documents={documents} canManage={canManageDocuments} />
    </div>
  );
}
