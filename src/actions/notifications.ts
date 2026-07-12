"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { drivers } from "@/db/schema";
import { requireRole } from "@/lib/rbac";
import type { Role } from "@/lib/auth-roles";

const ALLOWED_ROLES: Role[] = ["admin", "safety_officer"];

// Email transport is honestly stubbed — no provider is wired up, so a
// license-expiry notice just gets logged server-side instead of sent.
export async function notifyDriverLicenseExpiry(driverId: string) {
  await requireRole(ALLOWED_ROLES);

  const [driver] = await db.select().from(drivers).where(eq(drivers.id, driverId));
  if (!driver) {
    throw new Error("Driver not found.");
  }

  console.log(
    `[email stub] Would notify ${driver.name} (license ${driver.licenseNumber}) — expiry ${driver.licenseExpiry}`
  );

  return { logged: true };
}
