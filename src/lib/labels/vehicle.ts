import { vehicleTypeEnum, vehicleStatusEnum } from "@/db/schema";

export const VEHICLE_TYPE_LABELS: Record<
  (typeof vehicleTypeEnum.enumValues)[number],
  string
> = {
  truck: "Truck",
  van: "Van",
  pickup: "Pickup",
  trailer: "Trailer",
};

export const VEHICLE_STATUS_LABELS: Record<
  (typeof vehicleStatusEnum.enumValues)[number],
  string
> = {
  available: "Available",
  on_trip: "On Trip",
  in_shop: "In Shop",
  retired: "Retired",
};

export const VEHICLE_STATUS_TONES: Record<
  (typeof vehicleStatusEnum.enumValues)[number],
  "green" | "blue" | "amber" | "gray"
> = {
  available: "green",
  on_trip: "blue",
  in_shop: "amber",
  retired: "gray",
};
