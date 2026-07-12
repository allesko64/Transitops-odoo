"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vehicle } from "@/db/schema";

export const ALL_VALUE = "all";

export type FinanceFilterState = {
  vehicleId: string;
  dateFrom: string;
  dateTo: string;
};

export function FinanceFilters({
  filters,
  onFiltersChange,
  vehicles,
}: {
  filters: FinanceFilterState;
  onFiltersChange: (filters: FinanceFilterState) => void;
  vehicles: Vehicle[];
}) {
  function update<K extends keyof FinanceFilterState>(
    key: K,
    value: FinanceFilterState[K]
  ) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filters.vehicleId} onValueChange={(value) => update("vehicleId", value ?? ALL_VALUE)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Vehicle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All vehicles</SelectItem>
          {vehicles.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              {v.registrationNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => update("dateFrom", e.target.value)}
        className="w-40"
        placeholder="From date"
      />
      <Input
        type="date"
        value={filters.dateTo}
        onChange={(e) => update("dateTo", e.target.value)}
        className="w-40"
        placeholder="To date"
      />
    </div>
  );
}
