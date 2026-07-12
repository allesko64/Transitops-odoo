import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-4xl px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        green:
          "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
        blue: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
        amber:
          "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
        red: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
        gray: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      tone: "gray",
    },
  }
)

function StatusBadge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusBadgeVariants>) {
  return (
    <span className={cn(statusBadgeVariants({ tone }), className)} {...props} />
  )
}

export { StatusBadge, statusBadgeVariants }
