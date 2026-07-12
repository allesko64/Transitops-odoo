import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { requirePageRole } from "@/lib/rbac";
import type { Role } from "@/lib/auth-roles";
import { UserRoleTable } from "@/components/users/user-role-table";

export default async function UsersPage() {
  const session = await requirePageRole(["admin"]);

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
    .from(user)
    .orderBy(user.name);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="text-muted-foreground mt-2">
        Manage roles. You cannot change your own role.
      </p>
      <div className="mt-6">
        <UserRoleTable
          users={users.map((u) => ({ ...u, role: u.role as Role }))}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
