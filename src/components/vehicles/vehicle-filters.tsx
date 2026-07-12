"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vehicleTypeEnum, vehicleStatusEnum } from "@/db/schema";
import { VEHICLE_TYPE_LABELS, VEHICLE_STATUS_LABELS } from "@/lib/labels/vehicle";

export const ALL_VALUE = "all";

export type VehicleFilterState = {
  search: string;
  type: string;
  status: string;
  region: string;
};

export function VehicleFilters({
  filters,
  onFiltersChange,
  regions,
}: {
  filters: VehicleFilterState;
  onFiltersChange: (filters: VehicleFilterState) => void;
  regions: string[];
}) {
  function update<K extends keyof VehicleFilterState>(
    key: K,
    value: VehicleFilterState[K]
  ) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search registration number..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        className="w-56"
      />
      <Select value={filters.type} onValueChange={(value) => update("type", value ?? ALL_VALUE)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All types</SelectItem>
          {vehicleTypeEnum.enumValues.map((type) => (
            <SelectItem key={type} value={type}>
              {VEHICLE_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(value) => update("status", value ?? ALL_VALUE)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
          {vehicleStatusEnum.enumValues.map((status) => (
            <SelectItem key={status} value={status}>
              {VEHICLE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.region} onValueChange={(value) => update("region", value ?? ALL_VALUE)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All regions</SelectItem>
          {regions.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
