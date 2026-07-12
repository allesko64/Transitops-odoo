import { tripStatusEnum } from "@/db/schema";

export const TRIP_STATUS_LABELS: Record<
  (typeof tripStatusEnum.enumValues)[number],
  string
> = {
  draft: "Draft",
  dispatched: "Dispatched",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const TRIP_STATUS_TONES: Record<
  (typeof tripStatusEnum.enumValues)[number],
  "green" | "blue" | "amber" | "gray" | "red"
> = {
  draft: "gray",
  dispatched: "blue",
  completed: "green",
  cancelled: "red",
};
