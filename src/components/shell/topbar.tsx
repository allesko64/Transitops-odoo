"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import type { Role } from "@/lib/auth-roles";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  fleet_manager: "Fleet Manager",
  dispatcher: "Dispatcher",
  safety_officer: "Safety Officer",
  financial_analyst: "Financial Analyst",
};

export function Topbar({ name, role }: { name: string; role: Role }) {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 print:hidden">
      <span className="text-sm font-semibold">TransitOps</span>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden text-sm sm:inline">{name}</span>
        <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
