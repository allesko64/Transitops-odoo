import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" || val === undefined ? undefined : val);

export const createTripSchema = z.object({
  vehicleId: z.uuid("Select a vehicle"),
  driverId: z.uuid("Select a driver"),
  origin: z.string().trim().min(1, "Origin is required"),
  destination: z.string().trim().min(1, "Destination is required"),
  cargoKg: z.coerce
    .number()
    .int("Cargo must be a whole number")
    .gt(0, "Cargo must be greater than 0"),
  plannedDistanceKm: z.coerce.number().gt(0, "Planned distance must be greater than 0"),
});

export type CreateTripInput = z.input<typeof createTripSchema>;
export type CreateTripValues = z.output<typeof createTripSchema>;

export const completeTripSchema = z
  .object({
    endOdometer: z.coerce
      .number()
      .int("End odometer must be a whole number")
      .min(0, "End odometer cannot be negative"),
    fuelLiters: z.preprocess(
      emptyToUndefined,
      z.coerce.number().gt(0, "Liters must be greater than 0").optional()
    ),
    fuelCost: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(0, "Cost cannot be negative").optional()
    ),
    revenue: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(0, "Revenue cannot be negative").optional()
    ),
  })
  .refine((data) => (data.fuelLiters === undefined) === (data.fuelCost === undefined), {
    message: "Enter both fuel liters and cost, or leave both blank",
    path: ["fuelCost"],
  });

export type CompleteTripInput = z.input<typeof completeTripSchema>;
export type CompleteTripValues = z.output<typeof completeTripSchema>;
