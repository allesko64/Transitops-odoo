"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { dispatchTrip, cancelTrip } from "@/actions/trips";
import { tripStatusEnum } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TripCreateDialog,
  type AvailableVehicle,
  type AvailableDriver,
} from "@/components/trips/trip-create-dialog";
import { TripCompleteDialog } from "@/components/trips/trip-complete-dialog";
import { TRIP_STATUS_LABELS, TRIP_STATUS_TONES } from "@/lib/labels/trip";

export type TripRow = {
  id: string;
  origin: string;
  destination: string;
  cargoKg: number;
  status: (typeof tripStatusEnum.enumValues)[number];
  startOdometer: number | null;
  vehicleRegistration: string;
  driverName: string;
};

const ALL_VALUE = "all";

export function TripTable({
  trips,
  availableVehicles,
  availableDrivers,
}: {
  trips: TripRow[];
  availableVehicles: AvailableVehicle[];
  availableDrivers: AvailableDriver[];
}) {
  const [statusFilter, setStatusFilter] = useState(ALL_VALUE);
  const [cancelTarget, setCancelTarget] = useState<TripRow | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (statusFilter === ALL_VALUE ? trips : trips.filter((t) => t.status === statusFilter)),
    [trips, statusFilter]
  );

  async function handleDispatch(trip: TripRow) {
    setDispatchingId(trip.id);
    try {
      await dispatchTrip(trip.id);
      toast.success("Trip dispatched");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not dispatch trip");
    } finally {
      setDispatchingId(null);
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await cancelTrip(cancelTarget.id);
      toast.success("Trip cancelled");
      setCancelTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel trip");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trips</h1>
        <TripCreateDialog
          trigger={<Button>Create Trip</Button>}
          vehicles={availableVehicles}
          drivers={availableDrivers}
        />
      </div>

      <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? ALL_VALUE)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
          {tripStatusEnum.enumValues.map((status) => (
            <SelectItem key={status} value={status}>
              {TRIP_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Cargo (kg)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {trips.length === 0
                    ? "No trips yet. Create your first trip to get started."
                    : "No trips match this filter."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    {trip.origin} → {trip.destination}
                  </TableCell>
                  <TableCell>{trip.vehicleRegistration}</TableCell>
                  <TableCell>{trip.driverName}</TableCell>
                  <TableCell>{trip.cargoKg.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge tone={TRIP_STATUS_TONES[trip.status]}>
                      {TRIP_STATUS_LABELS[trip.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {trip.status === "draft" && (
                        <Button
                          size="sm"
                          disabled={dispatchingId === trip.id}
                          onClick={() => handleDispatch(trip)}
                        >
                          {dispatchingId === trip.id ? "Dispatching..." : "Dispatch"}
                        </Button>
                      )}
                      {trip.status === "dispatched" && (
                        <TripCompleteDialog
                          tripId={trip.id}
                          startOdometer={trip.startOdometer}
                          trigger={
                            <Button size="sm" variant="outline">
                              Complete
                            </Button>
                          }
                        />
                      )}
                      {(trip.status === "draft" || trip.status === "dispatched") && (
                        <Button variant="destructive" size="sm" onClick={() => setCancelTarget(trip)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel trip?</DialogTitle>
            <DialogDescription>
              {cancelTarget
                ? `${cancelTarget.origin} → ${cancelTarget.destination} will be cancelled${
                    cancelTarget.status === "dispatched"
                      ? ". The vehicle and driver will be freed up."
                      : "."
                  }`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={isCancelling}>
              Keep trip
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? "Cancelling..." : "Cancel trip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
