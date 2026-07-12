import { driverStatusEnum } from "@/db/schema";

export const DRIVER_STATUS_LABELS: Record<
  (typeof driverStatusEnum.enumValues)[number],
  string
> = {
  available: "Available",
  on_trip: "On Trip",
  suspended: "Suspended",
};

export const DRIVER_STATUS_TONES: Record<
  (typeof driverStatusEnum.enumValues)[number],
  "green" | "blue" | "red"
> = {
  available: "green",
  on_trip: "blue",
  suspended: "red",
};
