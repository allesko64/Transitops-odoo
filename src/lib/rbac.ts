import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { Role } from "./auth-roles";

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireRole(allowed: Role[]) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new ForbiddenError("Not authenticated");
  }

  const role = session.user.role as Role;

  if (!allowed.includes(role)) {
    throw new ForbiddenError(`Role '${role}' is not permitted to perform this action`);
  }

  return { ...session, role };
}

export async function requirePageRole(allowed: Role[], redirectTo = "/dashboard") {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role as Role;

  if (!allowed.includes(role)) {
    redirect(redirectTo);
  }

  return { ...session, role };
}

export { NAV_LINKS } from "./nav-links";
