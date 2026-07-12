"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";

import { deleteVehicleDocument } from "@/actions/vehicle-documents";
import type { VehicleDocument } from "@/db/schema";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { VehicleDocumentFormDialog } from "@/components/vehicles/vehicle-document-form-dialog";
import { formatDate } from "@/lib/format";

function expiryBadge(expiryDate: string | null) {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate + "T00:00:00");
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  if (expiry < today) return <StatusBadge tone="red">Expired</StatusBadge>;
  if (expiry <= in30) return <StatusBadge tone="amber">Expiring soon</StatusBadge>;
  return <StatusBadge tone="gray">{formatDate(expiryDate)}</StatusBadge>;
}

export function VehicleDocumentsTable({
  vehicleId,
  documents,
  canManage,
}: {
  vehicleId: string;
  documents: VehicleDocument[];
  canManage: boolean;
}) {
  const [deleteTarget, setDeleteTarget] = useState<VehicleDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteVehicleDocument(deleteTarget.id, vehicleId);
      toast.success("Document removed");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove document");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        {canManage && (
          <VehicleDocumentFormDialog
            vehicleId={vehicleId}
            trigger={<Button size="sm">Add Document</Button>}
          />
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Expiry</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 4 : 3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No documents yet.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4"
                    >
                      Open <ExternalLink className="size-3" />
                    </a>
                  </TableCell>
                  <TableCell>{expiryBadge(doc.expiryDate) ?? "—"}</TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove document"
                        onClick={() => setDeleteTarget(doc)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove document?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed from this vehicle.` : ""}
        confirmLabel="Remove"
        variant="destructive"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
