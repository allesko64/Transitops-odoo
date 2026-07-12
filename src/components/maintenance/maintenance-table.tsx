"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { closeMaintenance } from "@/actions/maintenance";
import { maintenanceStatusEnum } from "@/db/schema";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MaintenanceOpenDialog,
  type EligibleVehicle,
} from "@/components/maintenance/maintenance-open-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MAINTENANCE_STATUS_LABELS, MAINTENANCE_STATUS_TONES } from "@/lib/labels/maintenance";

export type MaintenanceLogRow = {
  id: string;
  vehicleRegistration: string;
  description: string;
  cost: string;
  status: (typeof maintenanceStatusEnum.enumValues)[number];
  openedAt: Date;
  closedAt: Date | null;
};

const ALL_VALUE = "all";

export function MaintenanceTable({
  logs,
  eligibleVehicles,
}: {
  logs: MaintenanceLogRow[];
  eligibleVehicles: EligibleVehicle[];
}) {
  const [statusFilter, setStatusFilter] = useState(ALL_VALUE);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closeTarget, setCloseTarget] = useState<MaintenanceLogRow | null>(null);

  const filtered = useMemo(
    () => (statusFilter === ALL_VALUE ? logs : logs.filter((l) => l.status === statusFilter)),
    [logs, statusFilter]
  );

  async function handleClose() {
    if (!closeTarget) return;
    setClosingId(closeTarget.id);
    try {
      await closeMaintenance(closeTarget.id);
      toast.success("Maintenance closed");
      setCloseTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not close maintenance");
    } finally {
      setClosingId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Maintenance</h1>
        <MaintenanceOpenDialog
          trigger={<Button>Open Maintenance</Button>}
          vehicles={eligibleVehicles}
        />
      </div>

      <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? ALL_VALUE)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
          {maintenanceStatusEnum.enumValues.map((status) => (
            <SelectItem key={status} value={status}>
              {MAINTENANCE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Cost (₹)</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Closed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {logs.length === 0
                    ? "No maintenance logs yet."
                    : "No maintenance logs match this filter."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.vehicleRegistration}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{Number(log.cost).toLocaleString()}</TableCell>
                  <TableCell>{log.openedAt.toLocaleDateString()}</TableCell>
                  <TableCell>{log.closedAt ? log.closedAt.toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <StatusBadge tone={MAINTENANCE_STATUS_TONES[log.status]}>
                      {MAINTENANCE_STATUS_LABELS[log.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    {log.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={closingId === log.id}
                        onClick={() => setCloseTarget(log)}
                      >
                        {closingId === log.id ? "Closing..." : "Close"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!closeTarget}
        onOpenChange={(open) => !open && setCloseTarget(null)}
        title="Close maintenance log?"
        description={
          closeTarget
            ? `${closeTarget.vehicleRegistration} will be marked available again (unless it has since been retired).`
            : ""
        }
        confirmLabel="Close log"
        isConfirming={!!closingId}
        onConfirm={handleClose}
      />
    </div>
  );
}
