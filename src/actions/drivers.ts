"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { drivers } from "@/db/schema";
import { requireRole } from "@/lib/rbac";
import type { Role } from "@/lib/auth-roles";
import { driverFormSchema, type DriverFormValues } from "@/lib/validations/driver";

const ALLOWED_ROLES: Role[] = ["admin", "safety_officer"];

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function createDriver(input: DriverFormValues) {
  await requireRole(ALLOWED_ROLES);
  const data = driverFormSchema.parse(input);

  try {
    await db.insert(drivers).values(data);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("A driver with this license number already exists.");
    }
    throw error;
  }

  revalidatePath("/drivers");
}

export async function updateDriver(id: string, input: DriverFormValues) {
  await requireRole(ALLOWED_ROLES);
  const data = driverFormSchema.parse(input);

  try {
    await db.update(drivers).set(data).where(eq(drivers.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("A driver with this license number already exists.");
    }
    throw error;
  }

  revalidatePath("/drivers");
}

export async function suspendDriver(id: string) {
  await requireRole(ALLOWED_ROLES);

  const [updated] = await db
    .update(drivers)
    .set({ status: "suspended" })
    .where(and(eq(drivers.id, id), ne(drivers.status, "on_trip")))
    .returning({ id: drivers.id });

  if (!updated) {
    throw new Error("Driver is currently on a trip and cannot be suspended.");
  }

  revalidatePath("/drivers");
}

export async function reinstateDriver(id: string) {
  await requireRole(ALLOWED_ROLES);

  await db
    .update(drivers)
    .set({ status: "available" })
    .where(and(eq(drivers.id, id), eq(drivers.status, "suspended")));

  revalidatePath("/drivers");
}
