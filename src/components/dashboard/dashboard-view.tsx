"use client";

import { useMemo, useState } from "react";

import type { Vehicle } from "@/db/schema";
import type { Role } from "@/lib/auth-roles";
import {
  DashboardFilters,
  ALL_VALUE,
  type DashboardFilterState,
} from "@/components/dashboard/dashboard-filters";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { KpiCard } from "@/components/dashboard/kpi-card";
import type { AvailableVehicle, AvailableDriver } from "@/components/trips/trip-create-dialog";
import type { EligibleVehicle } from "@/components/maintenance/maintenance-open-dialog";
import {
  computeVehicleStatusCounts,
  computeTripStatusCounts,
  computeDriversOnDuty,
  computeFleetUtilization,
} from "@/lib/dashboard-metrics";

export type DashboardTrip = {
  id: string;
  vehicleId: string;
  driverId: string;
  status: "draft" | "dispatched" | "completed" | "cancelled";
};

const EMPTY_FILTERS: DashboardFilterState = {
  type: ALL_VALUE,
  status: ALL_VALUE,
  region: ALL_VALUE,
};

export function DashboardView({
  role,
  vehicles,
  trips,
  tripVehicles,
  tripDrivers,
  maintenanceVehicles,
}: {
  role: Role;
  vehicles: Vehicle[];
  trips: DashboardTrip[];
  tripVehicles: AvailableVehicle[];
  tripDrivers: AvailableDriver[];
  maintenanceVehicles: EligibleVehicle[];
}) {
  const [filters, setFilters] = useState<DashboardFilterState>(EMPTY_FILTERS);

  const regions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.region))).sort(),
    [vehicles]
  );

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter((v) => {
        if (filters.type !== ALL_VALUE && v.type !== filters.type) return false;
        if (filters.status !== ALL_VALUE && v.status !== filters.status) return false;
        if (filters.region !== ALL_VALUE && v.region !== filters.region) return false;
        return true;
      }),
    [vehicles, filters]
  );

  const filteredTrips = useMemo(() => {
    const ids = new Set(filteredVehicles.map((v) => v.id));
    return trips.filter((t) => ids.has(t.vehicleId));
  }, [trips, filteredVehicles]);

  const vehicleCounts = useMemo(
    () => computeVehicleStatusCounts(filteredVehicles),
    [filteredVehicles]
  );
  const tripCounts = useMemo(() => computeTripStatusCounts(filteredTrips), [filteredTrips]);
  const driversOnDuty = useMemo(() => computeDriversOnDuty(filteredTrips), [filteredTrips]);
  const utilization = useMemo(() => computeFleetUtilization(vehicleCounts), [vehicleCounts]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DashboardQuickActions
          role={role}
          tripVehicles={tripVehicles}
          tripDrivers={tripDrivers}
          maintenanceVehicles={maintenanceVehicles}
        />
      </div>

      <DashboardFilters filters={filters} onFiltersChange={setFilters} regions={regions} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Available Vehicles" value={vehicleCounts.available} />
        <KpiCard label="Active Vehicles" value={vehicleCounts.onTrip} hint="Currently on trip" />
        <KpiCard label="In Maintenance" value={vehicleCounts.inShop} />
        <KpiCard label="Retired" value={vehicleCounts.retired} />
        <KpiCard label="Pending Trips" value={tripCounts.draft} hint="Drafts awaiting dispatch" />
        <KpiCard label="Active Trips" value={tripCounts.dispatched} />
        <KpiCard label="Drivers On Duty" value={driversOnDuty} />
        <KpiCard
          label="Fleet Utilization"
          value={utilization === null ? "—" : `${utilization}%`}
          hint="On trip ÷ active fleet"
        />
      </div>
    </div>
  );
}
