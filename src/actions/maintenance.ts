"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { maintenanceLogs, vehicles } from "@/db/schema";
import { requireRole } from "@/lib/rbac";
import type { Role } from "@/lib/auth-roles";
import { openMaintenanceSchema, type OpenMaintenanceValues } from "@/lib/validations/maintenance";

const ALLOWED_ROLES: Role[] = ["admin", "fleet_manager"];

export async function openMaintenance(input: OpenMaintenanceValues) {
  await requireRole(ALLOWED_ROLES);
  const data = openMaintenanceSchema.parse(input);

  await db.transaction(async (tx) => {
    const [lockedVehicle] = await tx
      .update(vehicles)
      .set({ status: "in_shop" })
      .where(and(eq(vehicles.id, data.vehicleId), eq(vehicles.status, "available")))
      .returning({ id: vehicles.id });

    if (!lockedVehicle) {
      throw new Error("Vehicle is no longer available for maintenance.");
    }

    await tx.insert(maintenanceLogs).values({
      vehicleId: data.vehicleId,
      description: data.description,
      cost: data.cost.toString(),
      status: "open",
    });
  });

  revalidatePath("/maintenance");
}

export async function closeMaintenance(logId: string) {
  await requireRole(ALLOWED_ROLES);

  await db.transaction(async (tx) => {
    const [log] = await tx
      .update(maintenanceLogs)
      .set({ status: "closed", closedAt: new Date() })
      .where(and(eq(maintenanceLogs.id, logId), eq(maintenanceLogs.status, "open")))
      .returning({ vehicleId: maintenanceLogs.vehicleId });

    if (!log) {
      throw new Error("Maintenance log is already closed.");
    }

    await tx
      .update(vehicles)
      .set({ status: "available" })
      .where(and(eq(vehicles.id, log.vehicleId), ne(vehicles.status, "retired")));
  });

  revalidatePath("/maintenance");
}
