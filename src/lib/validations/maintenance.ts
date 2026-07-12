import { z } from "zod";

export const openMaintenanceSchema = z.object({
  vehicleId: z.uuid("Select a vehicle"),
  description: z.string().trim().min(1, "Description is required"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
});

export type OpenMaintenanceInput = z.input<typeof openMaintenanceSchema>;
export type OpenMaintenanceValues = z.output<typeof openMaintenanceSchema>;
