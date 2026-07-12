import type { Role } from "./auth-roles";

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin", "fleet_manager", "dispatcher", "safety_officer", "financial_analyst"] as Role[] },
  { href: "/vehicles", label: "Vehicles", roles: ["admin", "fleet_manager"] as Role[] },
  { href: "/maintenance", label: "Maintenance", roles: ["admin", "fleet_manager"] as Role[] },
  { href: "/analytics", label: "Analytics", roles: ["admin", "fleet_manager", "financial_analyst"] as Role[] },
  { href: "/trips", label: "Trips", roles: ["admin", "dispatcher"] as Role[] },
  { href: "/drivers", label: "Drivers", roles: ["admin", "safety_officer"] as Role[] },
  { href: "/finance", label: "Finance", roles: ["admin", "financial_analyst"] as Role[] },
  { href: "/users", label: "Users", roles: ["admin"] as Role[] },
] as const;
