"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { requireRole } from "@/lib/rbac";
import type { Role } from "@/lib/auth-roles";
import { vehicleFormSchema, type VehicleFormValues } from "@/lib/validations/vehicle";

const ALLOWED_ROLES: Role[] = ["admin", "fleet_manager"];

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function createVehicle(input: VehicleFormValues) {
  await requireRole(ALLOWED_ROLES);
  const data = vehicleFormSchema.parse(input);

  try {
    await db.insert(vehicles).values(data);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("A vehicle with this registration number already exists.");
    }
    throw error;
  }

  revalidatePath("/vehicles");
}

export async function updateVehicle(id: string, input: VehicleFormValues) {
  await requireRole(ALLOWED_ROLES);
  const data = vehicleFormSchema.parse(input);

  try {
    await db.update(vehicles).set(data).where(eq(vehicles.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("A vehicle with this registration number already exists.");
    }
    throw error;
  }

  revalidatePath("/vehicles");
}

export async function retireVehicle(id: string) {
  await requireRole(ALLOWED_ROLES);

  const [updated] = await db
    .update(vehicles)
    .set({ status: "retired" })
    .where(and(eq(vehicles.id, id), ne(vehicles.status, "on_trip")))
    .returning({ id: vehicles.id });

  if (!updated) {
    throw new Error("Vehicle is currently on a trip and cannot be retired.");
  }

  revalidatePath("/vehicles");
}
