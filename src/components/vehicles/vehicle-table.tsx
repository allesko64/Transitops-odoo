"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { retireVehicle } from "@/actions/vehicles";
import type { Vehicle } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortHeader, type SortDirection } from "@/components/ui/sort-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VehicleFormDialog } from "@/components/vehicles/vehicle-form-dialog";
import {
  VehicleFilters,
  ALL_VALUE,
  type VehicleFilterState,
} from "@/components/vehicles/vehicle-filters";
import {
  VEHICLE_TYPE_LABELS,
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_TONES,
} from "@/lib/labels/vehicle";

const EMPTY_FILTERS: VehicleFilterState = {
  search: "",
  type: ALL_VALUE,
  status: ALL_VALUE,
  region: ALL_VALUE,
};

export function VehicleTable({ vehicles }: { vehicles: Vehicle[] }) {
  const [filters, setFilters] = useState<VehicleFilterState>(EMPTY_FILTERS);
  const [retireTarget, setRetireTarget] = useState<Vehicle | null>(null);
  const [isRetiring, setIsRetiring] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const regions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.region))).sort(),
    [vehicles]
  );

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      } else {
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (search) {
        const reg = v.registrationNumber.toLowerCase();
        const type = VEHICLE_TYPE_LABELS[v.type].toLowerCase();
        const region = v.region.toLowerCase();
        const status = VEHICLE_STATUS_LABELS[v.status].toLowerCase();
        if (
          !reg.includes(search) &&
          !type.includes(search) &&
          !region.includes(search) &&
          !status.includes(search)
        )
          return false;
      }
      if (filters.type !== ALL_VALUE && v.type !== filters.type) return false;
      if (filters.status !== ALL_VALUE && v.status !== filters.status) return false;
      if (filters.region !== ALL_VALUE && v.region !== filters.region) return false;
      return true;
    });
  }, [vehicles, filters]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      let valA: any = a[sortKey as keyof Vehicle];
      let valB: any = b[sortKey as keyof Vehicle];

      if (sortKey === "type") {
        valA = VEHICLE_TYPE_LABELS[a.type];
        valB = VEHICLE_TYPE_LABELS[b.type];
      } else if (sortKey === "status") {
        valA = VEHICLE_STATUS_LABELS[a.status];
        valB = VEHICLE_STATUS_LABELS[b.status];
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA ?? "").toLowerCase();
      const strB = String(valB ?? "").toLowerCase();
      return sortDir === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filtered, sortKey, sortDir]);

  async function handleRetire() {
    if (!retireTarget) return;
    setIsRetiring(true);
    try {
      await retireVehicle(retireTarget.id);
      toast.success("Vehicle retired");
      setRetireTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not retire vehicle");
    } finally {
      setIsRetiring(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <VehicleFormDialog trigger={<Button>Register Vehicle</Button>} />
      </div>

      <VehicleFilters filters={filters} onFiltersChange={setFilters} regions={regions} />

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader
                label="Registration"
                columnKey="registrationNumber"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Type"
                columnKey="type"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Capacity (kg)"
                columnKey="capacityKg"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                align="right"
              />
              <SortHeader
                label="Region"
                columnKey="region"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Status"
                columnKey="status"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {vehicles.length === 0
                    ? "No vehicles yet. Register your first vehicle to get started."
                    : "No vehicles match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
                  <TableCell>{VEHICLE_TYPE_LABELS[vehicle.type]}</TableCell>
                  <TableCell className="text-right">{vehicle.capacityKg.toLocaleString()}</TableCell>
                  <TableCell>{vehicle.region}</TableCell>
                  <TableCell>
                    <StatusBadge tone={VEHICLE_STATUS_TONES[vehicle.status]}>
                      {VEHICLE_STATUS_LABELS[vehicle.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <VehicleFormDialog
                        vehicle={vehicle}
                        trigger={
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        }
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={vehicle.status === "retired"}
                        onClick={() => setRetireTarget(vehicle)}
                      >
                        Retire
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!retireTarget} onOpenChange={(open) => !open && setRetireTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retire vehicle?</DialogTitle>
            <DialogDescription>
              {retireTarget
                ? `${retireTarget.registrationNumber} will be marked as retired and can no longer be dispatched.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetireTarget(null)} disabled={isRetiring}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRetire} disabled={isRetiring}>
              {isRetiring ? "Retiring..." : "Retire vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
