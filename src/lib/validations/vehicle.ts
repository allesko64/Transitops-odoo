import { z } from "zod";
import { vehicleTypeEnum } from "@/db/schema";

export const vehicleFormSchema = z.object({
  registrationNumber: z.string().trim().min(1, "Registration number is required"),
  type: z.enum(vehicleTypeEnum.enumValues),
  capacityKg: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .gt(0, "Capacity must be greater than 0"),
  region: z.string().trim().min(1, "Region is required"),
});

export type VehicleFormInput = z.input<typeof vehicleFormSchema>;
export type VehicleFormValues = z.output<typeof vehicleFormSchema>;
