"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { vehicleDocuments } from "@/db/schema";
import { requireRole } from "@/lib/rbac";
import type { Role } from "@/lib/auth-roles";
import {
  vehicleDocumentFormSchema,
  type VehicleDocumentFormValues,
} from "@/lib/validations/vehicle-document";

const ALLOWED_ROLES: Role[] = ["admin", "fleet_manager"];

export async function createVehicleDocument(vehicleId: string, input: VehicleDocumentFormValues) {
  await requireRole(ALLOWED_ROLES);
  const data = vehicleDocumentFormSchema.parse(input);

  await db.insert(vehicleDocuments).values({
    vehicleId,
    name: data.name,
    url: data.url,
    expiryDate: data.expiryDate || null,
  });

  revalidatePath(`/vehicles/${vehicleId}`);
}

export async function deleteVehicleDocument(documentId: string, vehicleId: string) {
  await requireRole(ALLOWED_ROLES);

  await db.delete(vehicleDocuments).where(eq(vehicleDocuments.id, documentId));

  revalidatePath(`/vehicles/${vehicleId}`);
}
