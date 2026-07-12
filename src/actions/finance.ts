"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { fuelLogs, expenses } from "@/db/schema";
import { requireRole } from "@/lib/rbac";
import type { Role } from "@/lib/auth-roles";
import {
  fuelLogFormSchema,
  type FuelLogFormValues,
  expenseFormSchema,
  type ExpenseFormValues,
} from "@/lib/validations/finance";

const ALLOWED_ROLES: Role[] = ["admin", "financial_analyst"];

export async function createFuelLog(input: FuelLogFormValues) {
  await requireRole(ALLOWED_ROLES);
  const data = fuelLogFormSchema.parse(input);

  await db.insert(fuelLogs).values({
    vehicleId: data.vehicleId,
    tripId: data.tripId || null,
    liters: String(data.liters),
    cost: String(data.cost),
    date: data.date,
  });

  revalidatePath("/finance");
}

export async function createExpense(input: ExpenseFormValues) {
  await requireRole(ALLOWED_ROLES);
  const data = expenseFormSchema.parse(input);

  await db.insert(expenses).values({
    vehicleId: data.vehicleId,
    tripId: data.tripId || null,
    category: data.category,
    amount: String(data.amount),
    note: data.note || null,
    date: data.date,
  });

  revalidatePath("/finance");
}
