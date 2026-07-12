"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { requireRole } from "@/lib/rbac";
import { ROLES, type Role } from "@/lib/auth-roles";

export async function updateUserRole(userId: string, role: Role) {
  const session = await requireRole(["admin"]);

  if (!ROLES.includes(role)) {
    throw new Error("Invalid role");
  }

  if (userId === session.user.id) {
    throw new Error("Admins cannot change their own role");
  }

  await db.update(user).set({ role }).where(eq(user.id, userId));

  revalidatePath("/users");
}
