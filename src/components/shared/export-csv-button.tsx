"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";

export function ExportCsvButton({
  href,
  label = "Export CSV",
  className,
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" className={cn(className)} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Export CSV?"
        description="This downloads a CSV file with the current data to your device."
        confirmLabel="Export"
        onConfirm={() => {
          window.location.href = href;
          setOpen(false);
        }}
      />
    </>
  );
}
