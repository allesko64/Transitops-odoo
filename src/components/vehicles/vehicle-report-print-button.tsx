"use client";

import { Button } from "@/components/ui/button";

export function VehicleReportPrintButton() {
  return (
    <Button className="print:hidden" onClick={() => window.print()}>
      Print / Save as PDF
    </Button>
  );
}
