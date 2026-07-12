import { maintenanceStatusEnum } from "@/db/schema";

export const MAINTENANCE_STATUS_LABELS: Record<
  (typeof maintenanceStatusEnum.enumValues)[number],
  string
> = {
  open: "Open",
  closed: "Closed",
};

export const MAINTENANCE_STATUS_TONES: Record<
  (typeof maintenanceStatusEnum.enumValues)[number],
  "green" | "blue" | "amber" | "gray" | "red"
> = {
  open: "amber",
  closed: "gray",
};
