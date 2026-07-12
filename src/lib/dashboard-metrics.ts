import type { vehicleStatusEnum, tripStatusEnum } from "@/db/schema";

type VehicleStatus = (typeof vehicleStatusEnum.enumValues)[number];
type TripStatus = (typeof tripStatusEnum.enumValues)[number];

export interface VehicleStatusCounts {
  available: number;
  onTrip: number;
  inShop: number;
  retired: number;
  total: number;
}

export function computeVehicleStatusCounts(
  vehicles: { status: VehicleStatus }[]
): VehicleStatusCounts {
  const counts: VehicleStatusCounts = {
    available: 0,
    onTrip: 0,
    inShop: 0,
    retired: 0,
    total: vehicles.length,
  };

  for (const v of vehicles) {
    if (v.status === "available") counts.available++;
    else if (v.status === "on_trip") counts.onTrip++;
    else if (v.status === "in_shop") counts.inShop++;
    else if (v.status === "retired") counts.retired++;
  }

  return counts;
}

export interface TripStatusCounts {
  draft: number;
  dispatched: number;
  completed: number;
  cancelled: number;
}

export function computeTripStatusCounts(
  trips: { status: TripStatus }[]
): TripStatusCounts {
  const counts: TripStatusCounts = { draft: 0, dispatched: 0, completed: 0, cancelled: 0 };

  for (const t of trips) {
    counts[t.status]++;
  }

  return counts;
}

// Distinct drivers currently on a dispatched trip, within whatever trip set is passed in.
export function computeDriversOnDuty(trips: { driverId: string; status: TripStatus }[]): number {
  return new Set(trips.filter((t) => t.status === "dispatched").map((t) => t.driverId)).size;
}

// % of the non-retired fleet currently on trip. Null (not 0) when there's no active fleet to divide by.
export function computeFleetUtilization(counts: VehicleStatusCounts): number | null {
  const activeFleet = counts.total - counts.retired;
  if (activeFleet <= 0) return null;
  return Math.round((counts.onTrip / activeFleet) * 1000) / 10;
}
