"use client";

import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

export interface SortHeaderProps extends React.ComponentProps<typeof TableHead> {
  label: string;
  columnKey: string;
  sortKey: string | null;
  sortDir: SortDirection;
  onSort: (key: string) => void;
  align?: "left" | "right";
}

export function SortHeader({
  label,
  columnKey,
  sortKey,
  sortDir,
  onSort,
  align = "left",
  className,
  ...props
}: SortHeaderProps) {
  const isSorted = sortKey === columnKey;

  return (
    <TableHead
      className={cn(align === "right" && "text-right", className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          "flex items-center gap-1 font-medium hover:text-foreground cursor-pointer select-none w-full",
          align === "right" ? "justify-end" : "justify-start"
        )}
      >
        <span>{label}</span>
        {isSorted && sortDir === "asc" && <ArrowUp className="size-3.5" />}
        {isSorted && sortDir === "desc" && <ArrowDown className="size-3.5" />}
        {!isSorted && (
          <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
        )}
      </button>
    </TableHead>
  );
}
