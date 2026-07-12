"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { suspendDriver, reinstateDriver } from "@/actions/drivers";
import type { Driver } from "@/db/schema";
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
import { DriverFormDialog } from "@/components/drivers/driver-form-dialog";
import {
  DriverFilters,
  ALL_VALUE,
  type DriverFilterState,
} from "@/components/drivers/driver-filters";
import {
  DRIVER_STATUS_LABELS,
  DRIVER_STATUS_TONES,
} from "@/lib/labels/driver";

const EMPTY_FILTERS: DriverFilterState = {
  search: "",
  status: ALL_VALUE,
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function expiryColor(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr + "T00:00:00");
  if (expiry < today) return "text-red-600";
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  if (expiry <= in30) return "text-amber-600";
  return "";
}

export function DriverTable({ drivers }: { drivers: Driver[] }) {
  const [filters, setFilters] = useState<DriverFilterState>(EMPTY_FILTERS);
  const [suspendTarget, setSuspendTarget] = useState<Driver | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

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
    return drivers.filter((d) => {
      if (search) {
        const name = d.name.toLowerCase();
        const lic = d.licenseNumber.toLowerCase();
        const cat = d.licenseCategory.toLowerCase();
        const status = DRIVER_STATUS_LABELS[d.status].toLowerCase();
        if (
          !name.includes(search) &&
          !lic.includes(search) &&
          !cat.includes(search) &&
          !status.includes(search)
        )
          return false;
      }
      if (filters.status !== ALL_VALUE && d.status !== filters.status)
        return false;
      return true;
    });
  }, [drivers, filters]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      let valA: any = a[sortKey as keyof Driver];
      let valB: any = b[sortKey as keyof Driver];

      if (sortKey === "status") {
        valA = DRIVER_STATUS_LABELS[a.status];
        valB = DRIVER_STATUS_LABELS[b.status];
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

  async function handleSuspend() {
    if (!suspendTarget) return;
    setIsSuspending(true);
    try {
      await suspendDriver(suspendTarget.id);
      toast.success("Driver suspended");
      setSuspendTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not suspend driver"
      );
    } finally {
      setIsSuspending(false);
    }
  }

  async function handleReinstate(driver: Driver) {
    try {
      await reinstateDriver(driver.id);
      toast.success("Driver reinstated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reinstate driver"
      );
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Drivers</h1>
        <DriverFormDialog trigger={<Button>Add Driver</Button>} />
      </div>

      <DriverFilters filters={filters} onFiltersChange={setFilters} />

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader
                label="Name"
                columnKey="name"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="License No."
                columnKey="licenseNumber"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Category"
                columnKey="licenseCategory"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="License Expiry"
                columnKey="licenseExpiry"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Safety Score"
                columnKey="safetyScore"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                align="right"
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
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {drivers.length === 0
                    ? "No drivers yet. Add your first driver to get started."
                    : "No drivers match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.licenseNumber}</TableCell>
                  <TableCell>{driver.licenseCategory}</TableCell>
                  <TableCell className={expiryColor(driver.licenseExpiry)}>
                    {formatDate(driver.licenseExpiry)}
                  </TableCell>
                  <TableCell className="text-right">{driver.safetyScore}</TableCell>
                  <TableCell>
                    <StatusBadge tone={DRIVER_STATUS_TONES[driver.status]}>
                      {DRIVER_STATUS_LABELS[driver.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <DriverFormDialog
                        driver={driver}
                        trigger={
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        }
                      />
                      {driver.status === "suspended" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReinstate(driver)}
                        >
                          Reinstate
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSuspendTarget(driver)}
                        >
                          Suspend
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

      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend driver?</DialogTitle>
            <DialogDescription>
              {suspendTarget
                ? `${suspendTarget.name} will be suspended and can no longer be assigned to trips.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)} disabled={isSuspending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={isSuspending}>
              {isSuspending ? "Suspending..." : "Suspend driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
