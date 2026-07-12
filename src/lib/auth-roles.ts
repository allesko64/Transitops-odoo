export const ROLES = [
  "admin",
  "fleet_manager",
  "dispatcher",
  "safety_officer",
  "financial_analyst",
] as const;

export type Role = (typeof ROLES)[number];
