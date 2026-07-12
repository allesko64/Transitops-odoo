"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth-roles";
import { NAV_LINKS } from "@/lib/nav-links";

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = NAV_LINKS.filter((link) => link.roles.includes(role));

  return (
    <nav className="flex flex-col gap-1 p-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname.startsWith(link.href)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
