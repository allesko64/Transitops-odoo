import { z } from "zod";

export const driverFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  licenseNumber: z.string().trim().min(1, "License number is required"),
  licenseCategory: z.string().trim().min(1, "License category is required"),
  licenseExpiry: z.string().min(1, "License expiry is required"),
  safetyScore: z.coerce
    .number()
    .int("Safety score must be a whole number")
    .min(0, "Safety score must be between 0 and 100")
    .max(100, "Safety score must be between 0 and 100"),
});

export type DriverFormInput = z.input<typeof driverFormSchema>;
export type DriverFormValues = z.output<typeof driverFormSchema>;
