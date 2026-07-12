"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { driverStatusEnum } from "@/db/schema";
import { DRIVER_STATUS_LABELS } from "@/lib/labels/driver";

export const ALL_VALUE = "all";

export type DriverFilterState = {
  search: string;
  status: string;
};

export function DriverFilters({
  filters,
  onFiltersChange,
}: {
  filters: DriverFilterState;
  onFiltersChange: (filters: DriverFilterState) => void;
}) {
  function update<K extends keyof DriverFilterState>(
    key: K,
    value: DriverFilterState[K]
  ) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search name or license..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        className="w-56"
      />
      <Select value={filters.status} onValueChange={(value) => update("status", value ?? ALL_VALUE)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
          {driverStatusEnum.enumValues.map((status) => (
            <SelectItem key={status} value={status}>
              {DRIVER_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
