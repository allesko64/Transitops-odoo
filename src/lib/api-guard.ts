import { NextResponse } from "next/server";
import { requireRole, ForbiddenError } from "@/lib/rbac";
import type { Role } from "@/lib/auth-roles";

export async function requireRoleOr403(allowed: Role[]): Promise<NextResponse | null> {
  try {
    await requireRole(allowed);
    return null;
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return new NextResponse(error.message, { status: 403 });
    }
    throw error;
  }
}
