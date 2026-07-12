import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, type Role } from "@/lib/auth";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { Topbar } from "@/components/shell/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role as Role;

  return (
    <div className="flex flex-1 flex-col">
      <Topbar name={session.user.name} role={role} />
      <div className="flex flex-1">
        <aside className="w-56 border-r">
          <SidebarNav role={role} />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
