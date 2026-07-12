"use client";

import { Button } from "@/components/ui/button";
import { VehicleFormDialog } from "@/components/vehicles/vehicle-form-dialog";
import {
  TripCreateDialog,
  type AvailableVehicle,
  type AvailableDriver,
} from "@/components/trips/trip-create-dialog";
import {
  MaintenanceOpenDialog,
  type EligibleVehicle,
} from "@/components/maintenance/maintenance-open-dialog";
import type { Role } from "@/lib/auth-roles";

export function DashboardQuickActions({
  role,
  tripVehicles,
  tripDrivers,
  maintenanceVehicles,
}: {
  role: Role;
  tripVehicles: AvailableVehicle[];
  tripDrivers: AvailableDriver[];
  maintenanceVehicles: EligibleVehicle[];
}) {
  const isFleetManager = role === "admin" || role === "fleet_manager";
  const isDispatcher = role === "admin" || role === "dispatcher";

  if (!isFleetManager && !isDispatcher) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {isFleetManager ? (
        <VehicleFormDialog trigger={<Button variant="outline">Register Vehicle</Button>} />
      ) : null}
      {isDispatcher ? (
        <TripCreateDialog
          trigger={<Button variant="outline">New Trip</Button>}
          vehicles={tripVehicles}
          drivers={tripDrivers}
        />
      ) : null}
      {isFleetManager ? (
        <MaintenanceOpenDialog
          trigger={<Button variant="outline">Open Maintenance</Button>}
          vehicles={maintenanceVehicles}
        />
      ) : null}
    </div>
  );
}
